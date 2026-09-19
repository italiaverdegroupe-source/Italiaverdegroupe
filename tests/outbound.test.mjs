// The queue that had no sender.
//
//   node tests/outbound.test.mjs
//
// outbound_messages was written to by the alert engine and read by the admin
// screen, and nothing in between ever sent anything. Every notification this
// system has produced since it was built is still in that table. This suite
// covers the sender that drains it, and it is a database suite rather than a
// unit test because the two things that can go wrong are both properties of
// SQL, not of JavaScript:
//
//   sending a customer the same email twice, because two web instances tick
//   at the same moment during a deploy and both read the same 'queued' row;
//
//   losing a message entirely, because the process holding it was killed and
//   nothing puts back what a dead process was carrying.
//
// No real mailbox is involved. The sender is injected, so "did it send" is a
// fact this file can read rather than something to go and look for in an inbox.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const O = require('../.test-build/outbound.cjs');
const M = require('../.test-build/mail.cjs');

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── the table this suite owns ────────────────────────────────
// Everything here is addressed @outbound.test, so a clean slate is a delete
// of this suite's own rows rather than of the table — another suite's
// fixtures are not this suite's to throw away.
const MINE = `address LIKE '%@outbound.test'`;
const wipe = () => db.query(`DELETE FROM outbound_messages WHERE ${MINE}`);

const queue = async (opts = {}) => {
  const { rows: [r] } = await db.query(
    `INSERT INTO outbound_messages
       (channel, address, subject, body, status, attempts, next_try_at, claimed_at)
     VALUES ($1, $2, 'Test', 'body', $3, $4, now() + ($5 || ' minutes')::interval, $6)
     RETURNING id::text`,
    [opts.channel ?? 'email', opts.to ?? 'buyer@outbound.test',
     opts.status ?? 'queued', opts.attempts ?? 0,
     String(opts.dueIn ?? -1), opts.claimedAt ?? null]);
  return r.id;
};

const readRow = async (id) => {
  const { rows: [r] } = await db.query(
    `SELECT status, attempts, status_note, sent_at, claimed_at,
            next_try_at > now() AS waiting,
            round(extract(epoch FROM next_try_at - now()) / 60) AS wait_min
       FROM outbound_messages WHERE id = $1`, [id]);
  return r;
};

/** A sender that records what it was asked to send and then does as told. */
const spy = (behaviour = () => 'fake-id') => {
  const seen = [];
  const fn = async (mail) => { seen.push(mail); return behaviour(mail, seen.length); };
  fn.seen = seen;
  return fn;
};

const drain = (send, extra = {}) =>
  O.drainOutbound({ send, configured: true, ...extra });

// ── the schema has to be able to hold a claim ────────────────
const cols = await db.query(
  `SELECT column_name FROM information_schema.columns
    WHERE table_name = 'outbound_messages'`);
const names = cols.rows.map((r) => r.column_name);
check('migration 013 is applied: next_try_at exists', names.includes('next_try_at'));
check('and claimed_at, which is what "stuck" is measured from',
  names.includes('claimed_at'), names.join(', '));

const states = await db.query(
  `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint
    WHERE conname = 'outbound_messages_status_check'`);
check(`'sending' is an allowed status, so a row can be claimed at all`,
  /sending/.test(states.rows[0]?.def ?? ''), states.rows[0]?.def ?? 'no constraint');

// ── it sends, and says so honestly ───────────────────────────
await wipe();
const plain = await queue();
const ok = spy();
let r = await drain(ok);
check('a queued email is sent', r.sent === 1 && ok.seen.length === 1, JSON.stringify(r));
check('to the address on the row',
  ok.seen[0]?.to === 'buyer@outbound.test', ok.seen[0]?.to);
let row = await readRow(plain);
check('and the row is marked sent with the time on it',
  row.status === 'sent' && row.sent_at !== null, `${row.status} ${row.sent_at}`);
check('the claim is released rather than left behind', row.claimed_at === null);

// ── THE POINT: it is sent once ───────────────────────────────
// Two web instances overlap on every deploy and tick together. Each gets its
// own connection here because SKIP LOCKED is a property of two transactions,
// not of two function calls.
await wipe();
for (let i = 0; i < 6; i++) await queue({ to: `race${i}@outbound.test` });

// A sender slow enough that both drains are inside the loop at once.
const slow = spy(async () => {
  await new Promise((res) => setTimeout(res, 120));
  return 'slow-id';
});
const [a, b] = await Promise.all([drain(slow), drain(slow)]);
const addressed = slow.seen.map((m) => m.to);
const unique = new Set(addressed);
check('THE POINT: two instances draining at once send each message once',
  addressed.length === unique.size && unique.size === 6,
  `${addressed.length} sends, ${unique.size} distinct`);
check('and between them they claimed all six, none skipped',
  a.claimed + b.claimed === 6, `${a.claimed} + ${b.claimed}`);
const { rows: [left] } = await db.query(
  `SELECT count(*)::int AS n FROM outbound_messages
    WHERE ${MINE} AND status <> 'sent'`);
check('with nothing left behind in a half-finished state', left.n === 0, String(left.n));

// ── a bad moment is tried again ──────────────────────────────
await wipe();
const flaky = await queue();
const down = spy(() => { throw new M.TransientMailError('mail server is down'); });
r = await drain(down);
row = await readRow(flaky);
check('a transient failure is not marked failed',
  r.retried === 1 && row.status === 'queued', `${r.retried} ${row.status}`);
check('it waits before the next go rather than hammering the server',
  row.waiting === true && Number(row.wait_min) >= 1, `${row.wait_min} min`);
check('the attempt is counted', row.attempts === 1, String(row.attempts));
check('and the reason is written down where the console shows it',
  /mail server is down/.test(row.status_note ?? ''), row.status_note);

// A row waiting is a row not taken. Without this the backoff is decoration.
const again = await drain(down);
check('THE POINT: a message waiting its turn is not claimed early',
  again.claimed === 0, String(again.claimed));

// ── a wrong address is not tried again ───────────────────────
await wipe();
const bad = await queue({ to: 'nosuchbox@outbound.test' });
const refused = spy(() => { throw new M.PermanentMailError('550 no such mailbox'); });
r = await drain(refused);
row = await readRow(bad);
check('THE POINT: a permanent refusal is failed on the first attempt',
  r.failed === 1 && row.status === 'failed' && row.attempts === 1,
  `${row.status} after ${row.attempts}`);
check('and says it was not retried, rather than looking like an outage',
  /Not retried/.test(row.status_note ?? ''), row.status_note);

// ── it gives up, and says how many times it tried ────────────
await wipe();
const doomed = await queue({ attempts: O.MAX_ATTEMPTS - 1 });
r = await drain(down);
row = await readRow(doomed);
check(`after ${O.MAX_ATTEMPTS} attempts it gives up rather than retrying for ever`,
  r.failed === 1 && row.status === 'failed', `${row.status} at ${row.attempts}`);
check('and the note says how many times and why',
  /Gave up after 5 attempts/.test(row.status_note ?? '') &&
  /mail server is down/.test(row.status_note ?? ''), row.status_note);

// ── a deploy mid-send loses nothing ──────────────────────────
await wipe();
const abandoned = await queue({
  status: 'sending', attempts: 1,
  claimedAt: new Date(Date.now() - (O.STUCK_MINUTES + 5) * 60_000),
});
const rescue = spy();
r = await drain(rescue);
row = await readRow(abandoned);
check('THE POINT: a row a killed process was holding is picked up again',
  r.reclaimed === 1 && row.status === 'sent', `${row.status} reclaimed ${r.reclaimed}`);
check('and it went out on the same tick, not the one after next',
  rescue.seen.length === 1, String(rescue.seen.length));

// The mirror of it: a row claimed a moment ago is NOT stuck. This is the test
// that fails if the reclaim reads queued_at instead of claimed_at — a message
// that waited an hour in the queue and is being sent right now is an hour old
// by that reading, and the other instance would take it and send it twice.
await wipe();
const inFlight = await queue({ status: 'sending', attempts: 1, claimedAt: new Date() });
await db.query(
  `UPDATE outbound_messages SET queued_at = now() - interval '3 hours' WHERE id = $1`,
  [inFlight]);
const shouldNotRun = spy();
r = await drain(shouldNotRun);
row = await readRow(inFlight);
check('THE POINT: a message being sent right now is not taken from under it',
  r.reclaimed === 0 && shouldNotRun.seen.length === 0 && row.status === 'sending',
  `${row.status}, reclaimed ${r.reclaimed}, sent ${shouldNotRun.seen.length}`);

// A stuck row with no attempts left would sit in 'sending' for ever — a state
// nothing queries, which is how a message is lost while the table looks fine.
await wipe();
const stuckSpent = await queue({
  status: 'sending', attempts: O.MAX_ATTEMPTS,
  claimedAt: new Date(Date.now() - (O.STUCK_MINUTES + 5) * 60_000),
});
await drain(spy());
row = await readRow(stuckSpent);
check('a stuck row with no attempts left is failed, not left in limbo',
  row.status === 'failed', row.status);

// ── nothing is sent when there is nowhere to send it ─────────
await wipe();
const waiting = await queue();
const never = spy();
r = await O.drainOutbound({ send: never, configured: false });
row = await readRow(waiting);
check('with no provider configured nothing is claimed and nothing is touched',
  r.claimed === 0 && never.seen.length === 0 &&
  row.status === 'queued' && row.attempts === 0, `${row.status}/${row.attempts}`);

// ── WhatsApp is not implemented, and does not pretend to be ──
await wipe();
const wa = await queue({ channel: 'whatsapp', to: 'wa@outbound.test' });
const noWa = spy();
r = await drain(noWa);
row = await readRow(wa);
check('a WhatsApp row is not sent through the mail sender',
  noWa.seen.length === 0, String(noWa.seen.length));
check('and is put back rather than failed, so it goes out when the number exists',
  r.skipped === 1 && row.status === 'queued', `${row.status}`);
check('with a note that says what it is waiting for',
  /WhatsApp/.test(row.status_note ?? ''), row.status_note);

// ── the backoff is a real curve ──────────────────────────────
check('the wait grows with each attempt: 1, 5, 25, 125 minutes',
  [1, 2, 3, 4].map(O.backoffMinutes).join(',') === '1,5,25,125',
  [1, 2, 3, 4].map(O.backoffMinutes).join(','));
check('and is capped rather than growing to days',
  O.backoffMinutes(9) === 240, String(O.backoffMinutes(9)));

// ── the summary the console prints ───────────────────────────
const summary = await O.outboundSummary();
check('the status summary is a count per status',
  Object.values(summary).every((v) => Number.isInteger(v)), JSON.stringify(summary));

// ── mail.ts: the parts that do not need a mail server ────────
const opts = M.smtpOptions('smtp://user%40vg.ae:p%40ss@mail.host.com');
check('an SMTP url with an @ in the username is decoded, not split wrongly',
  opts.auth.user === 'user@vg.ae' && opts.auth.pass === 'p@ss',
  `${opts.auth.user} / ${opts.auth.pass}`);
check('smtp:// defaults to 587 with STARTTLS rather than implicit TLS',
  opts.port === 587 && opts.secure === false, `${opts.port} secure=${opts.secure}`);
check('smtps:// defaults to 465 with TLS from the first byte',
  M.smtpOptions('smtps://a:b@h').port === 465 &&
  M.smtpOptions('smtps://a:b@h').secure === true);
check('an explicit port wins over the default',
  M.smtpOptions('smtp://a:b@h:2525').port === 2525);
check('every send has a timeout, so one hung socket cannot hold up the queue',
  opts.connectionTimeout > 0 && opts.socketTimeout > 0,
  `${opts.connectionTimeout}/${opts.socketTimeout}`);

const rejects = (fn) => {
  try { fn(); return null; } catch (e) { return e; }
};
let e = rejects(() => M.smtpOptions('not a url'));
check('THE POINT: a mistyped SMTP_URL is permanent, not retried for ever',
  e instanceof M.PermanentMailError, e?.constructor?.name ?? 'did not throw');
e = rejects(() => M.smtpOptions('https://mail.host.com'));
check('and so is the wrong scheme entirely',
  e instanceof M.PermanentMailError, e?.constructor?.name ?? 'did not throw');

const env = { ...process.env };
delete process.env.MAIL_FROM; delete process.env.SMTP_URL; delete process.env.RESEND_API_KEY;
check('with nothing configured there is no provider, so nothing claims to send',
  M.mailProvider() === null, String(M.mailProvider()));
e = rejects(() => M.mailFrom());
check('THE POINT: a From address is never invented — an invented one fails SPF',
  e instanceof M.PermanentMailError, e?.constructor?.name ?? 'did not throw');
process.env.SMTP_URL = 'smtp://sales%40verdegardenae.com:x@mail.host.com';
check('the SMTP username is used as From when MAIL_FROM is not set',
  M.mailFrom() === 'sales@verdegardenae.com', M.mailFrom());
process.env.MAIL_FROM = 'Verde Garden <sales@verdegardenae.com>';
check('and MAIL_FROM wins when it is set, so a display name is possible',
  M.mailFrom() === 'Verde Garden <sales@verdegardenae.com>', M.mailFrom());
check('SMTP is preferred over Resend when both are configured',
  (process.env.RESEND_API_KEY = 'x', M.mailProvider() === 'smtp'), M.mailProvider());

// ── the Resend path, which is now the one that matters ───────
// Railway blocks outbound SMTP below the Pro plan, so this company sends over
// Resend's HTTPS API — a code path that had never once been executed. The
// request shape is asserted against a stub rather than a real key, and so is
// the CLASSIFICATION of each failure, which is the part with consequences: a
// permanent verdict drops the message for good, a transient one keeps it in
// the queue. Get those the wrong way round and either a typo is retried for
// hours or a rate limit throws away a customer's notification.
{
  const env = { ...process.env };
  delete process.env.SMTP_URL;
  process.env.RESEND_API_KEY = 'test-key';
  process.env.MAIL_FROM = 'Verde Garden Trading <no-reply@verdegardenae.com>';
  process.env.MAIL_REPLY_TO = 'italiaverdegroupe@gmail.com';

  const realFetch = globalThis.fetch;
  let seen = null;
  const stub = (status, body) => {
    globalThis.fetch = async (url, init) => {
      seen = { url: String(url), init, body: JSON.parse(init.body) };
      return new Response(body, { status });
    };
  };

  stub(200, JSON.stringify({ id: 're_abc123' }));
  const id = await M.sendMail({ to: 'buyer@example.com', subject: 'Hello', text: 'Body' });
  check('a Resend send returns the provider id, which is what the queue records',
    id === 're_abc123', String(id));
  check('it posts to the Resend endpoint with the key as a bearer token',
    seen.url === 'https://api.resend.com/emails'
    && seen.init.method === 'POST'
    && seen.init.headers.authorization === 'Bearer test-key',
    `${seen.init.method} ${seen.url}`);
  check('THE POINT: From is MAIL_FROM verbatim, so it stays on the verified domain',
    seen.body.from === 'Verde Garden Trading <no-reply@verdegardenae.com>', seen.body.from);
  check('the recipient is sent as an array, which is what the API expects',
    Array.isArray(seen.body.to) && seen.body.to[0] === 'buyer@example.com',
    JSON.stringify(seen.body.to));
  check('the subject, the text part and a reply-to all go with it',
    seen.body.subject === 'Hello' && seen.body.text === 'Body'
    && seen.body.reply_to === 'italiaverdegroupe@gmail.com',
    JSON.stringify({ s: seen.body.subject, r: seen.body.reply_to }));

  // 422 is what Resend answers when From is not on a domain you have verified
  // — the single likeliest mistake when this is first set up. It must fail
  // loudly and once, not forty times.
  stub(422, JSON.stringify({ message: 'The verdegardenae.com domain is not verified.' }));
  let e = await M.sendMail({ to: 'buyer@example.com', subject: 's', text: 't' })
    .then(() => null, (err) => err);
  check('THE POINT: an unverified sending domain is permanent, not retried',
    M.isPermanent(e), e?.constructor?.name ?? 'did not throw');
  check('and the queue carries Resend own words, not a summary of them',
    /not verified/.test(e?.message ?? ''), e?.message ?? '');

  stub(429, 'Too many requests');
  e = await M.sendMail({ to: 'buyer@example.com', subject: 's', text: 't' })
    .then(() => null, (err) => err);
  check('a rate limit is transient, so the notification waits rather than dying',
    e instanceof M.TransientMailError && !M.isPermanent(e), e?.constructor?.name ?? 'did not throw');

  stub(503, 'upstream down');
  e = await M.sendMail({ to: 'buyer@example.com', subject: 's', text: 't' })
    .then(() => null, (err) => err);
  check('so is an outage at their end',
    e instanceof M.TransientMailError, e?.constructor?.name ?? 'did not throw');

  globalThis.fetch = async () => { throw new Error('getaddrinfo ENOTFOUND'); };
  e = await M.sendMail({ to: 'buyer@example.com', subject: 's', text: 't' })
    .then(() => null, (err) => err);
  check('and so is not being able to reach them at all',
    e instanceof M.TransientMailError, e?.constructor?.name ?? 'did not throw');

  globalThis.fetch = realFetch;
  Object.assign(process.env, env);
  delete process.env.MAIL_REPLY_TO;
}

const sent = await M.sendMail({ to: 'not-an-address', subject: 's', text: 't' })
  .then(() => null, (err) => err);
check('an address with no @ in it is refused before a connection is opened',
  sent instanceof M.PermanentMailError, sent?.message ?? 'it tried to send');
Object.assign(process.env, env);

await wipe();
await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
