-- ─────────────────────────────────────────────────────────────
-- 001 — operator accounts, sessions, settings, audit, lead work
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            bigserial PRIMARY KEY,
  email         citext UNIQUE NOT NULL,
  name          text NOT NULL,
  password_hash text NOT NULL,           -- scrypt: N$r$p$salt$hash, all base64
  role          text NOT NULL DEFAULT 'sales'
                CHECK (role IN ('owner', 'sales', 'viewer')),
  is_active     boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Only the SHA-256 of the session token is stored, so a database dump does not
-- hand anyone a working session.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  user_agent  text,
  ip          text
);
CREATE INDEX IF NOT EXISTS sessions_user_idx    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- Anything an administrator may change lives here rather than in code.
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by bigint REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          bigserial PRIMARY KEY,
  at          timestamptz NOT NULL DEFAULT now(),
  user_id     bigint REFERENCES users(id) ON DELETE SET NULL,
  user_email  text,
  action      text NOT NULL,             -- lead.status_changed, settings.updated…
  entity      text NOT NULL,             -- lead, setting, user
  entity_id   text,
  before      jsonb,
  after       jsonb,
  ip          text
);
CREATE INDEX IF NOT EXISTS audit_at_idx     ON audit_log (at DESC);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_log (entity, entity_id);

-- Failed logins are counted per email so an attacker cannot simply rotate IPs.
CREATE TABLE IF NOT EXISTS login_attempts (
  id          bigserial PRIMARY KEY,
  at          timestamptz NOT NULL DEFAULT now(),
  email       text NOT NULL,
  ip          text,
  successful  boolean NOT NULL
);
CREATE INDEX IF NOT EXISTS login_attempts_idx ON login_attempts (email, at DESC);

-- ── lead work ────────────────────────────────────────────────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to     bigint REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up  date;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contacted  timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lost_reason     text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN (
  'new', 'contacted', 'qualified', 'quoted', 'negotiation', 'won', 'lost'
));

CREATE TABLE IF NOT EXISTS lead_notes (
  id         bigserial PRIMARY KEY,
  lead_id    bigint NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  at         timestamptz NOT NULL DEFAULT now(),
  user_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  user_email text,
  kind       text NOT NULL DEFAULT 'note'
             CHECK (kind IN ('note', 'call', 'email', 'whatsapp', 'meeting', 'status')),
  body       text NOT NULL
);
CREATE INDEX IF NOT EXISTS lead_notes_idx ON lead_notes (lead_id, at DESC);
