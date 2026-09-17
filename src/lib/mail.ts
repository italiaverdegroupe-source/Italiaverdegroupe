/**
 * Actually sending an email.
 *
 * Until now there was a gate and no door. `provider()` in alerts.ts checked
 * whether SMTP_URL or RESEND_API_KEY was set and wrote 'queued' or 'blocked'
 * accordingly — and nothing anywhere read that table and sent anything. So a
 * configured mailbox would have moved every message from "blocked, and here is
 * why" to "queued", which reads as *on its way*. That is the worse of the two
 * states to be wrong in.
 *
 * Two providers, because there are two realities. A company with a domain
 * mailbox has SMTP credentials and nothing else; a company on Railway with no
 * mailbox yet finds an API key easier than a mail server. Whichever is
 * configured is used; if both are, SMTP wins, because a message sent from the
 * company's own mailbox is the one that lands in an inbox rather than a spam
 * folder.
 */

export type MailProvider = 'smtp' | 'resend' | null;

export type Mail = {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML part. The text part is always sent and is never optional. */
  html?: string;
};

/** Thrown for a failure worth trying again — an outage, a timeout, a 5xx. */
export class TransientMailError extends Error {
  readonly transient = true;
}

/** Thrown for a failure that will fail identically for ever — a bad address. */
export class PermanentMailError extends Error {
  /**
   * A marker, because `instanceof` is not reliable here.
   *
   * `instanceof` compares class identity, and a class loaded twice is two
   * classes. Next builds the server, the route handlers and the instrumentation
   * hook as separate graphs, and the test suites load each library as its own
   * bundle — in every one of those cases a PermanentMailError thrown by one
   * copy of this file fails `instanceof` against the other copy's class. The
   * failure is silent and it fails in the dangerous direction: a permanent
   * refusal read as transient is retried against the mail server every few
   * minutes for as long as the row has attempts left.
   */
  readonly permanent = true;
}

/** Is this a failure there is no point retrying? See the note above. */
export function isPermanent(err: unknown): boolean {
  return err instanceof PermanentMailError
    || (typeof err === 'object' && err !== null
        && (err as { permanent?: unknown }).permanent === true);
}

export function mailProvider(): MailProvider {
  if (process.env.SMTP_URL) return 'smtp';
  if (process.env.RESEND_API_KEY) return 'resend';
  return null;
}

/**
 * Who the message is from.
 *
 * MAIL_FROM if it is set, otherwise the SMTP username, otherwise nothing —
 * and nothing is an error rather than a guess. A From address invented from
 * the domain is how a company's mail starts failing SPF, quietly, at the
 * receiving end, where nobody here can see it.
 */
export function mailFrom(): string {
  const explicit = process.env.MAIL_FROM?.trim();
  if (explicit) return explicit;
  const url = process.env.SMTP_URL;
  if (url) {
    try {
      const u = new URL(url);
      if (u.username) return decodeURIComponent(u.username);
    } catch { /* fall through to the error below */ }
  }
  throw new PermanentMailError(
    'No From address. Set MAIL_FROM to the mailbox this should be sent from.');
}

/** A reply-to, when the company would rather answers went somewhere else. */
const replyTo = () => process.env.MAIL_REPLY_TO?.trim() || undefined;

// ── SMTP ─────────────────────────────────────────────────────

/**
 * The connection, read out of SMTP_URL rather than handed to nodemailer whole.
 *
 * Passing the URL straight in works, but then the timeouts have to be query
 * parameters on a string somebody pastes from their mail host — and a send
 * with no timeout hangs the drain loop behind it for as long as the far end
 * feels like holding the socket open. Parsed here, the timeouts are ours.
 *
 * smtps:// means TLS from the first byte (port 465). smtp:// means STARTTLS
 * (587), which is the commoner of the two.
 */
export function smtpOptions(raw = process.env.SMTP_URL ?? '') {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    // A mistyped SMTP_URL fails identically for ever. Left as the TypeError
    // `new URL` throws it would be classified transient and retried until the
    // attempt cap was spent on a typo nobody had been told about.
    throw new PermanentMailError(
      'SMTP_URL is not a URL. Expected smtp://user:pass@host:587 or smtps://…');
  }
  if (u.protocol !== 'smtp:' && u.protocol !== 'smtps:') {
    throw new PermanentMailError(
      `SMTP_URL must start with smtp:// or smtps://, not ${u.protocol}//`);
  }
  const secure = u.protocol === 'smtps:';
  return {
    host: u.hostname,
    port: Number(u.port) || (secure ? 465 : 587),
    secure,
    auth: u.username
      ? { user: decodeURIComponent(u.username), pass: decodeURIComponent(u.password) }
      : undefined,
    // A send that hangs holds every message behind it. Fail and retry instead.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
}

async function sendSmtp(mail: Mail): Promise<string> {
  // Imported here rather than at the top: a site with no mailbox configured
  // should not be loading a mail library into every server start.
  const nodemailer = (await import('nodemailer')).default;
  const transport = nodemailer.createTransport(smtpOptions());
  try {
    const info = await transport.sendMail({
      from: mailFrom(),
      to: mail.to,
      replyTo: replyTo(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    if (info.rejected?.length) {
      throw new PermanentMailError(`Rejected by the server: ${info.rejected.join(', ')}`);
    }
    return info.messageId ?? 'sent';
  } catch (err) {
    if (err instanceof PermanentMailError) throw err;
    throw classify(err);
  } finally {
    transport.close();
  }
}

/**
 * An SMTP failure is permanent only when the server says so.
 *
 * 5xx means this message will never be accepted — a mailbox that does not
 * exist, a message refused. 4xx and every network error mean "not now", and
 * retrying those is the entire point of a queue.
 */
function classify(err: unknown): Error {
  const e = err as { responseCode?: number; code?: string; message?: string };
  const message = e?.message ?? String(err);
  if (typeof e?.responseCode === 'number' && e.responseCode >= 500 && e.responseCode < 600) {
    return new PermanentMailError(message);
  }
  if (e?.code === 'EAUTH') {
    // Wrong credentials will be wrong on every retry, and forty attempts
    // against a mail server is how an account gets locked.
    return new PermanentMailError(`Authentication refused: ${message}`);
  }
  return new TransientMailError(message);
}

// ── Resend ───────────────────────────────────────────────────

async function sendResend(mail: Mail): Promise<string> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: [mail.to],
      reply_to: replyTo(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
    signal: AbortSignal.timeout(20_000),
  }).catch((err) => {
    throw new TransientMailError(`Could not reach Resend: ${String(err)}`);
  });

  const body = await res.text();
  if (res.ok) {
    try { return (JSON.parse(body) as { id?: string }).id ?? 'sent'; } catch { return 'sent'; }
  }
  // 429 and 5xx are worth another go; 4xx means the request itself is wrong.
  if (res.status === 429 || res.status >= 500) {
    throw new TransientMailError(`Resend ${res.status}: ${body.slice(0, 200)}`);
  }
  throw new PermanentMailError(`Resend ${res.status}: ${body.slice(0, 200)}`);
}

// ── the door ─────────────────────────────────────────────────

/**
 * Send one message. Returns the provider's id for it.
 *
 * Throws TransientMailError to ask for a retry and PermanentMailError to say
 * there is no point. The caller decides what to do with either; this function
 * never swallows a failure, because a mail system that reports success it did
 * not have is worse than one that does not send at all.
 */
export async function sendMail(mail: Mail): Promise<string> {
  const provider = mailProvider();
  if (!provider) {
    throw new PermanentMailError(
      'No mail provider configured. Set SMTP_URL or RESEND_API_KEY.');
  }
  if (!mail.to.includes('@')) {
    throw new PermanentMailError(`Not an email address: ${mail.to}`);
  }
  return provider === 'smtp' ? sendSmtp(mail) : sendResend(mail);
}
