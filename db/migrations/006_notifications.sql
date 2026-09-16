-- ─────────────────────────────────────────────────────────────
-- 006 — alert rules, the alert inbox, and the outbound queue
--
-- Decisions this file exists to get right:
--
-- 1. THE RULES ARE ROWS, NOT CODE. The brief's last rule was that a business
--    change must not require a developer. "Warn me three days before an
--    invoice falls due" and "warn me five days before" are the same rule with
--    a different number, so the number lives in a column. What stays in code
--    is the QUERY behind each alert kind — inventing a new kind genuinely is
--    development, and pretending otherwise would be the lie.
--
-- 2. AN ALERT MUST NOT REPEAT. Time-based checks re-run every few minutes and
--    the same invoice is still overdue each time. Every alert carries a
--    dedupe key unique per rule, subject and bucket, so a re-run updates
--    nothing and an inbox stays readable. The bucket is part of the key, so
--    an invoice moving from 30 to 60 days overdue does raise a fresh alert —
--    that is new information, not a repeat.
--
-- 3. SENDING IS A QUEUE, NOT A SIDE EFFECT. Anything leaving the building
--    is a row with a state. Until the company holds a domain and a mail
--    provider, those rows sit as 'blocked' with the reason attached, which is
--    honest; silently dropping them, or claiming an email was sent when no
--    provider exists, is not.
-- ─────────────────────────────────────────────────────────────

-- A rule is one configured instance of an alert kind. Two rows of the same
-- kind are allowed on purpose: "tell sales at 3 days, tell the owner at 0".
CREATE TABLE IF NOT EXISTS alert_rules (
  id           bigserial PRIMARY KEY,
  kind         text NOT NULL,            -- invoice.due, stock.low, … (catalogue in code)
  name         text NOT NULL,            -- what it is called in the console
  is_active    boolean NOT NULL DEFAULT true,

  severity     text NOT NULL DEFAULT 'info'
               CHECK (severity IN ('info','warning','urgent')),

  -- The number the rule turns on. Its meaning belongs to the kind: days
  -- before due, days overdue, units remaining, days without contact. Integer
  -- because every one of those is counted, never measured — "3.00 days before
  -- due" in a settings box is noise, not precision.
  threshold    integer,

  -- Who sees it. A role reaches everyone holding it; a user id narrows it to
  -- one person. Both null means everyone, which is the right default for a
  -- three-person company.
  to_role      text CHECK (to_role IN ('owner','sales','viewer')),
  to_user_id   bigint REFERENCES users(id) ON DELETE SET NULL,

  -- Channels beyond the console inbox. The inbox is always written.
  email_to     text,
  whatsapp_to  text,

  -- Message text with {tokens}; null uses the kind's built-in wording.
  template     text,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   bigint REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS alert_rules_kind_idx ON alert_rules (kind) WHERE is_active;

-- One raised alert. entity/entity_id point at what it is about so the console
-- can link straight to the invoice or the tree rather than describing it.
CREATE TABLE IF NOT EXISTS alerts (
  id          bigserial PRIMARY KEY,
  rule_id     bigint REFERENCES alert_rules(id) ON DELETE SET NULL,
  kind        text NOT NULL,
  severity    text NOT NULL DEFAULT 'info'
              CHECK (severity IN ('info','warning','urgent')),
  title       text NOT NULL,
  body        text,
  entity      text,                      -- invoice, order, lead, stock_item…
  entity_id   text,
  href        text,                      -- where to go to act on it

  -- rule + subject + bucket. Unique, so a re-scan cannot duplicate.
  dedupe_key  text NOT NULL,

  to_role     text,
  to_user_id  bigint REFERENCES users(id) ON DELETE SET NULL,

  raised_at   timestamptz NOT NULL DEFAULT now(),
  read_at     timestamptz,
  read_by     bigint REFERENCES users(id) ON DELETE SET NULL,
  -- Dismissed means dealt with. Kept rather than deleted: "was anyone warned
  -- before that container sat at the port for a week" has to stay answerable.
  done_at     timestamptz,
  done_by     bigint REFERENCES users(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS alerts_dedupe_idx ON alerts (dedupe_key);
CREATE INDEX IF NOT EXISTS alerts_open_idx ON alerts (raised_at DESC) WHERE done_at IS NULL;
CREATE INDEX IF NOT EXISTS alerts_entity_idx ON alerts (entity, entity_id);

-- Anything addressed outside the console. One row per attempt to reach one
-- address, with the reason it has not left if it has not.
CREATE TABLE IF NOT EXISTS outbound_messages (
  id           bigserial PRIMARY KEY,
  alert_id     bigint REFERENCES alerts(id) ON DELETE CASCADE,
  channel      text NOT NULL CHECK (channel IN ('email','whatsapp','sms')),
  address      text NOT NULL,
  subject      text,
  body         text NOT NULL,
  status       text NOT NULL DEFAULT 'queued'
               CHECK (status IN ('queued','sent','failed','blocked')),
  -- Why it is sitting there. "No mail provider configured" is a reason a
  -- manager can act on; a silently missing email is not.
  status_note  text,
  attempts     integer NOT NULL DEFAULT 0,
  queued_at    timestamptz NOT NULL DEFAULT now(),
  sent_at      timestamptz
);
CREATE INDEX IF NOT EXISTS outbound_pending_idx ON outbound_messages (queued_at)
  WHERE status IN ('queued','failed');

-- When each kind last ran, so the console can say so plainly instead of
-- leaving someone to wonder whether the checks are running at all.
CREATE TABLE IF NOT EXISTS alert_runs (
  id          bigserial PRIMARY KEY,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  raised      integer NOT NULL DEFAULT 0,
  trigger     text NOT NULL DEFAULT 'schedule'
              CHECK (trigger IN ('schedule','manual','startup')),
  error       text
);
CREATE INDEX IF NOT EXISTS alert_runs_idx ON alert_runs (started_at DESC);
