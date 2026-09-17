-- Making the outbound queue a queue.
--
-- outbound_messages was written to and read from, and nothing in between:
-- rows went in as 'queued' or 'blocked' and sat there for ever, because no
-- sender existed. The table already had `attempts` and `sent_at` — the shape
-- of something that retries — but nothing ever incremented either.
--
-- Two things are needed before a sender can be safe to run.
--
-- 'sending', so a row can be CLAIMED. Two web instances run in production
-- during a deploy, and both will tick at once. Without a state that means "I
-- have taken this one", both read the same 'queued' row and the customer gets
-- the email twice. The claim is a single UPDATE … FOR UPDATE SKIP LOCKED, and
-- this state is what it sets.
--
-- next_try_at, so a failure can WAIT. A mailbox that rejects a message because
-- the mail server is briefly down should be tried again in a minute, not
-- forty times in the same tick until the attempt cap is spent on an outage
-- that lasted seconds.

ALTER TABLE outbound_messages DROP CONSTRAINT IF EXISTS outbound_messages_status_check;
ALTER TABLE outbound_messages ADD CONSTRAINT outbound_messages_status_check
  CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'blocked'));

ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS next_try_at timestamptz NOT NULL DEFAULT now();

-- The claim reads exactly this: due, not taken, in the order they arrived.
CREATE INDEX IF NOT EXISTS outbound_due_idx
  ON outbound_messages (next_try_at, id)
  WHERE status = 'queued';

-- Anything left 'sending' by a process that died is found by age, so a
-- deploy in the middle of a send loses nothing.
CREATE INDEX IF NOT EXISTS outbound_stuck_idx
  ON outbound_messages (queued_at)
  WHERE status = 'sending';

-- claimed_at, so "stuck" means what it says.
--
-- The first draft of the reclaim read `queued_at < now() - 10 minutes AND
-- status = 'sending'` — and queued_at is when the row was CREATED, not when
-- it was taken. A message that waited an hour in the queue and is being sent
-- right now is an hour old by that test, so the other web instance would put
-- it back to 'queued' while the first one is still talking to the mail server,
-- claim it, and send it twice. The one property this whole file exists for,
-- broken by reading the wrong column. Age of the CLAIM is the only thing that
-- says whether the process holding it is gone.
ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

DROP INDEX IF EXISTS outbound_stuck_idx;
CREATE INDEX IF NOT EXISTS outbound_stuck_idx
  ON outbound_messages (claimed_at)
  WHERE status = 'sending';
