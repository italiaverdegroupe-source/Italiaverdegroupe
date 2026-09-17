-- ─────────────────────────────────────────────────────────────
-- 000 — extensions and the first table
--
-- This file exists because of a gap the backup work found: the migrations did
-- not reproduce the schema on their own. The leads table was created at
-- runtime by ensureSchema() in src/lib/db.ts, and the citext extension that
-- 001 depends on was never created anywhere — it happened to be present on the
-- databases in use, so nothing complained.
--
-- That is fine until the day it matters. A restore is "create a database, run
-- the migrations, load the data", and a migration set that stops six tables in
-- is not a restore path, it is the discovery that there wasn't one. Running
-- every file in this directory against an empty database must produce the
-- whole schema, and the backup test now asserts exactly that.
-- ─────────────────────────────────────────────────────────────

-- Case-insensitive text, used for user emails so Owner@… and owner@… are one
-- account rather than two.
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS leads (
  id              bigserial PRIMARY KEY,
  reference       text UNIQUE NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  enquiry_type    text NOT NULL,
  name            text NOT NULL,
  company         text,
  email           text NOT NULL,
  phone           text,
  emirate         text,
  project_type    text,
  service_scope   text,
  product_ref     text,
  quantity        integer,
  required_date   text,
  message         text,
  source          text,
  status          text NOT NULL DEFAULT 'new',
  user_agent      text,
  consent         boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx  ON leads (status);
