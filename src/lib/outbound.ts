import { query } from '@/lib/db';
import {
  sendMail, mailProvider, isPermanent, type Mail,
} from '@/lib/mail';

/**
 * The thing that was missing: something that reads the queue and sends.
 *
 * `raise()` in alerts.ts has always written rows into outbound_messages, and
 * the alerts screen has always displayed them. Between those two there was
 * nothing at all — every notification this system has ever produced is still
 * sitting in that table. This drains it.
 *
 * Three properties matter more than throughput, which is irrelevant at this
 * volume:
 *
 *   IT SENDS ONCE. Two web instances overlap during every deploy and both run
 *   this on the same tick. A row is claimed with a single UPDATE … FOR UPDATE
 *   SKIP LOCKED before anything is sent, so the second instance sees no rows
 *   rather than the same ones.
 *
 *   IT GIVES UP HONESTLY. A transient failure waits and is tried again, a
 *   permanent one is not retried at all, and after MAX_ATTEMPTS the row is
 *   marked 'failed' with the last error on it. Nothing is deleted and nothing
 *   is quietly marked sent.
 *
 *   IT SURVIVES BEING KILLED. A deploy in the middle of a send leaves rows in
 *   'sending'. Those are reclaimed by the age of the CLAIM on the next tick,
 *   because a message stuck in a state nobody owns is a message nobody will
 *   ever look at.
 */

export const MAX_ATTEMPTS = 5;
const BATCH = 20;
/** A row claimed longer ago than this belonged to a process that is gone. */
export const STUCK_MINUTES = 10;

/** 1, 5, 25 and 125 minutes. Long enough to outlast a restart or a blip. */
export const backoffMinutes = (attempts: number) => Math.min(5 ** (attempts - 1), 240);

type Row = {
  id: string; channel: string; address: string;
  subject: string | null; body: string; attempts: number;
};

export type DrainResult = {
  claimed: number; sent: number; retried: number; failed: number;
  skipped: number; reclaimed: number;
};

/** What actually puts a message on the wire. Swappable so tests can watch it. */
export type Sender = (mail: Mail) => Promise<string>;

export type DrainOptions = {
  limit?: number;
  /** Defaults to the real sender. A test passes its own and asserts on it. */
  send?: Sender;
  /** Defaults to reading the environment. */
  configured?: boolean;
};

/**
 * Put back anything a dead process was holding.
 *
 * Deliberately before the claim rather than after: a deploy that killed the
 * previous instance mid-send is exactly the moment this runs, and those rows
 * should go out on this tick, not the one after next.
 *
 * `claimed_at`, not `queued_at`. The difference is the whole point — see the
 * note in migration 013. A row that waited an hour in the queue and was taken
 * one second ago is not stuck; reading the wrong column would hand it to the
 * other instance while this one is still sending it.
 *
 * A stuck row with no attempts left is failed rather than reclaimed. Left
 * 'sending' it would sit in a state nothing queries and nobody would ever see
 * it again — which is how a message is lost while looking fine.
 */
async function reclaimStuck(): Promise<number> {
  const rows = await query<{ id: string }>(
    `UPDATE outbound_messages
        SET status = CASE WHEN attempts < $2 THEN 'queued' ELSE 'failed' END,
            claimed_at = NULL,
            next_try_at = now(),
            status_note = CASE WHEN attempts < $2
              THEN 'Interrupted while sending — picked up again.'
              ELSE 'Interrupted while sending, and no attempts left.' END
      WHERE status = 'sending'
        AND claimed_at < now() - ($1 || ' minutes')::interval
      RETURNING id`,
    [String(STUCK_MINUTES), MAX_ATTEMPTS]);
  return rows.length;
}

/** Take up to `limit` due messages, so nothing else can take them too. */
async function claim(limit: number): Promise<Row[]> {
  return query<Row>(
    `UPDATE outbound_messages m
        SET status = 'sending', attempts = m.attempts + 1, claimed_at = now()
      WHERE m.id IN (
        SELECT id FROM outbound_messages
         WHERE status = 'queued' AND next_try_at <= now()
         ORDER BY next_try_at, id
         FOR UPDATE SKIP LOCKED
         LIMIT $1)
      RETURNING m.id::text, m.channel, m.address, m.subject, m.body, m.attempts`,
    [limit]);
}

const settleSent = (id: string, note: string) => query(
  `UPDATE outbound_messages
      SET status = 'sent', sent_at = now(), claimed_at = NULL, status_note = $2
    WHERE id = $1`, [id, note]);

const settleRetry = (id: string, wait: number, note: string) => query(
  `UPDATE outbound_messages
      SET status = 'queued', claimed_at = NULL,
          next_try_at = now() + ($2 || ' minutes')::interval,
          status_note = $3
    WHERE id = $1`, [id, String(wait), note]);

const settleFailed = (id: string, note: string) => query(
  `UPDATE outbound_messages
      SET status = 'failed', claimed_at = NULL, status_note = $2
    WHERE id = $1`, [id, note]);

/**
 * One pass over the queue.
 *
 * Returns what happened rather than logging it, so the caller decides whether
 * a quiet tick is worth a line in the log. Never throws: this runs on a timer
 * beside the web server, and a mail outage must not take a page down.
 */
export async function drainOutbound(opts: DrainOptions = {}): Promise<DrainResult> {
  const limit = opts.limit ?? BATCH;
  const send = opts.send ?? sendMail;
  const configured = opts.configured ?? Boolean(mailProvider());

  const out: DrainResult = {
    claimed: 0, sent: 0, retried: 0, failed: 0, skipped: 0, reclaimed: 0,
  };

  // Nothing is claimed when there is nowhere to send it. Leaving the rows
  // 'queued' is the honest state — they are waiting on a setting, and the
  // console says so.
  if (!configured) return out;

  try {
    out.reclaimed = await reclaimStuck();
    const rows = await claim(limit);
    out.claimed = rows.length;

    for (const row of rows) {
      // Only email is implemented. WhatsApp rows are put back rather than
      // marked failed, because the day the number is connected they should go
      // out, not need rescuing.
      if (row.channel !== 'email') {
        out.skipped += 1;
        await settleRetry(row.id, 60,
          'Waiting for a WhatsApp Business account. Nothing is lost.');
        continue;
      }

      const mail: Mail = {
        to: row.address,
        subject: row.subject ?? 'Verde Garden Trading',
        text: row.body,
      };

      try {
        const id = await send(mail);
        out.sent += 1;
        await settleSent(row.id, `Sent (${id}).`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const permanent = isPermanent(err);
        const spent = row.attempts >= MAX_ATTEMPTS;

        if (permanent || spent) {
          out.failed += 1;
          await settleFailed(row.id, permanent
            ? `Not retried: ${message}`
            : `Gave up after ${row.attempts} attempts: ${message}`);
        } else {
          const wait = backoffMinutes(row.attempts);
          out.retried += 1;
          await settleRetry(row.id, wait,
            `Attempt ${row.attempts} failed, trying again in ${wait} min: ${message}`);
        }
      }
    }
  } catch (err) {
    console.error('[outbound] drain failed:', err);
  }

  return out;
}

/** What the console shows above the table, in one query. */
export async function outboundSummary(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; n: string }>(
    `SELECT status, count(*)::text AS n FROM outbound_messages GROUP BY status`);
  return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
}

/**
 * Put the blocked backlog back in the queue.
 *
 * Every alert this system has raised was written 'blocked' — there was no
 * provider, and writing them 'queued' would have meant "on its way" about a
 * message nothing could send. They are still there. The day a mailbox is
 * configured, somebody has to decide what to do with them, and it should not
 * be this code deciding on its own: switching mail on should not fire off
 * months of stale low-stock warnings at a customer's inbox in one minute.
 *
 * So it is a button, not a side effect, and it takes a cutoff. Anything older
 * than `days` stays blocked with its reason on it, because a notice about a
 * situation that has since resolved is worse than no notice.
 */
export async function requeueBlocked(days = 7): Promise<number> {
  const rows = await query<{ id: string }>(
    `UPDATE outbound_messages
        SET status = 'queued', next_try_at = now(), attempts = 0,
            status_note = 'Requeued once a mail provider was configured.'
      WHERE status = 'blocked'
        AND queued_at > now() - ($1 || ' days')::interval
      RETURNING id`, [String(days)]);
  return rows.length;
}
