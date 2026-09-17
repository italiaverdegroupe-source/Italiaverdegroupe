-- ─────────────────────────────────────────────────────────────
-- 008 — a record of every backup taken
--
-- The point of this table is not bookkeeping, it is detection. A backup
-- system fails silently by nature: nothing breaks when it stops running, and
-- the discovery happens on the one day it was needed. So every attempt is
-- recorded, success or failure, and the alert engine watches this table.
-- "When did we last have a good backup" must be answerable in one glance.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS backup_runs (
  id           bigserial PRIMARY KEY,
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz,
  status       text NOT NULL DEFAULT 'running'
               CHECK (status IN ('running','ok','failed')),
  trigger      text NOT NULL DEFAULT 'schedule'
               CHECK (trigger IN ('schedule','manual','startup')),

  object_key   text,                       -- where it landed in the bucket
  bytes        bigint,                     -- compressed size
  table_count  integer,
  row_count    bigint,
  -- SHA-256 of the compressed archive, recorded at upload and re-checked when
  -- the file is read back. A backup nobody has read back is a hope.
  checksum     text,
  verified_at  timestamptz,                -- when it was last downloaded and checked
  error        text
);
CREATE INDEX IF NOT EXISTS backup_runs_idx ON backup_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS backup_runs_ok_idx ON backup_runs (finished_at DESC)
  WHERE status = 'ok';
