import { gzipSync, gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import type { CustomTypesConfig, Pool, PoolClient } from 'pg';
import { query, requirePool } from '@/lib/db';
import { s3Config, putObject, getObject, listObjects, deleteObject } from '@/lib/s3';

/**
 * Backups.
 *
 * The situation this exists for: the database is on Neon's free plan, which
 * keeps six hours of point-in-time history and does not allow scheduled
 * snapshots. Six hours is not a backup policy — it is the window in which
 * somebody has to notice. Delete a customer's orders on Friday and discover it
 * on Monday and there is nothing to go back to.
 *
 * Three decisions shape this:
 *
 * 1. DATA ONLY, NOT SCHEMA. The schema lives in db/migrations/*.sql, under
 *    version control, and is reproducible by running them. Duplicating it into
 *    the backup would mean maintaining a second source of truth for it. A
 *    restore is: create a database, run the migrations, load the data.
 *
 * 2. EVERY VALUE IS CARRIED AS THE TEXT POSTGRES ITSELF PRODUCES. No JSON type
 *    mapping, no date formatting, no numeric rounding — the driver is told to
 *    hand back the raw string for every type and Postgres casts it back on the
 *    way in. That is how COPY works, and it is lossless for numerics, arrays,
 *    jsonb, bytea and timestamps alike, which ad-hoc JSON conversion is not.
 *
 * 3. THE TABLE LIST IS READ FROM THE CATALOGUE, NOT WRITTEN DOWN. A backup
 *    that quietly omits a table added last month is worse than no backup,
 *    because it is trusted. The load order is derived from the foreign keys
 *    for the same reason.
 */

const FORMAT_VERSION = 1;

/** Tables in an order that satisfies their foreign keys on the way back in. */
async function tablesInLoadOrder(client: PoolClient): Promise<string[]> {
  const { rows } = await client.query<{ t: string }>(`
    WITH RECURSIVE deps AS (
      SELECT c.oid, c.relname::text AS t, 0 AS lvl
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE c.relkind = 'r' AND n.nspname = 'public'
         AND NOT EXISTS (
           SELECT 1 FROM pg_constraint k
            WHERE k.conrelid = c.oid AND k.contype = 'f' AND k.confrelid <> c.oid)
      UNION ALL
      SELECT c.oid, c.relname::text, d.lvl + 1
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_constraint k ON k.conrelid = c.oid AND k.contype = 'f'
        JOIN deps d ON d.oid = k.confrelid AND d.oid <> c.oid
       WHERE c.relkind = 'r' AND n.nspname = 'public' AND d.lvl < 20
    ),
    ordered AS (SELECT t, max(lvl) AS depth FROM deps GROUP BY t)
    SELECT t FROM ordered ORDER BY depth, t`);

  const seen = new Set(rows.map((r) => r.t));

  // A table that no recursion reached — one in a foreign-key cycle, or
  // referenced only by itself — would otherwise be dropped from the backup
  // without a word. Append it rather than lose it.
  const { rows: all } = await client.query<{ t: string }>(`
    SELECT c.relname::text AS t FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'r' AND n.nspname = 'public' ORDER BY 1`);
  for (const r of all) if (!seen.has(r.t)) rows.push({ t: r.t });

  return rows.map((r) => r.t);
}

export type Manifest = {
  version: number;
  takenAt: string;
  tables: { name: string; columns: string[]; rows: number }[];
  totalRows: number;
};

/**
 * Hand back the raw string for every type, so nothing is reinterpreted.
 *
 * The cast is needed because pg types getTypeParser as returning a parser for
 * binary OR text mode; we only ever run in text mode, where the value is
 * always a string, and returning it untouched is the whole point.
 */
const RAW_TYPES = {
  getTypeParser: () => (v: string) => v,
} as unknown as CustomTypesConfig;

/**
 * Produce the archive: gzipped JSON lines.
 *
 * Line 1 is the manifest. Then, per table, a header line naming its columns
 * followed by one line per row. Line-delimited so a truncated file can still
 * be read up to the point it was cut, rather than being a single unparseable
 * JSON document.
 */
export async function dump(): Promise<{ body: Buffer; manifest: Manifest }> {
  const pool: Pool = requirePool();
  const client = await pool.connect();
  try {
    const tables = await tablesInLoadOrder(client);
    const lines: string[] = [];
    const meta: Manifest['tables'] = [];
    let totalRows = 0;

    for (const table of tables) {
      const res = await client.query({
        // The table name comes from pg_class, not from user input, but it is
        // quoted anyway so a table named like a keyword still works.
        text: `SELECT * FROM "${table.replace(/"/g, '""')}"`,
        rowMode: 'array',
        types: RAW_TYPES,
      });
      const columns = res.fields.map((f) => f.name);
      lines.push(JSON.stringify({ k: 't', name: table, columns }));
      for (const row of res.rows as unknown[][]) {
        lines.push(JSON.stringify({ k: 'r', v: row }));
      }
      meta.push({ name: table, columns, rows: res.rows.length });
      totalRows += res.rows.length;
    }

    const manifest: Manifest = {
      version: FORMAT_VERSION,
      takenAt: new Date().toISOString(),
      tables: meta,
      totalRows,
    };
    const body = gzipSync(Buffer.from(
      [JSON.stringify({ k: 'm', ...manifest }), ...lines].join('\n'), 'utf8'), { level: 9 });

    return { body, manifest };
  } finally {
    client.release();
  }
}

export const checksumOf = (body: Buffer) => createHash('sha256').update(body).digest('hex');

/** Read an archive back without touching any database. Used to verify one. */
export function readArchive(body: Buffer): Manifest {
  const text = gunzipSync(body).toString('utf8');
  const firstLine = text.slice(0, text.indexOf('\n'));
  const manifest = JSON.parse(firstLine) as Manifest & { k: string };
  if (manifest.k !== 'm') throw new Error('Archive does not begin with a manifest.');
  if (manifest.version !== FORMAT_VERSION) {
    throw new Error(`Archive format ${manifest.version}, this build reads ${FORMAT_VERSION}.`);
  }

  // Count what is actually in the file rather than trusting the header: a
  // truncated upload would otherwise verify against its own optimistic claim.
  let rows = 0;
  for (const line of text.split('\n')) if (line.startsWith('{"k":"r"')) rows += 1;
  if (rows !== manifest.totalRows) {
    throw new Error(`Archive holds ${rows} rows, its manifest claims ${manifest.totalRows}.`);
  }
  return manifest;
}

/**
 * Load an archive into a database.
 *
 * Deliberately NOT exposed anywhere in the console, and it never defaults to
 * the live connection: restoring is a decision taken deliberately, with a
 * target named out loud, not a button somebody can reach while looking for
 * something else. It is used by the test and by a person at a terminal.
 */
export async function restore(targetPool: Pool, body: Buffer): Promise<Manifest> {
  const manifest = readArchive(body);
  const text = gunzipSync(body).toString('utf8');
  const client = await targetPool.connect();

  try {
    await client.query('BEGIN');
    // Constraints are checked at COMMIT rather than per statement, so the load
    // order only has to be roughly right and a cycle cannot deadlock it.
    await client.query('SET CONSTRAINTS ALL DEFERRED');

    // Emptied in reverse dependency order, inside the same transaction: if
    // anything fails, the database is left exactly as it was.
    for (const t of [...manifest.tables].reverse()) {
      await client.query(`DELETE FROM "${t.name.replace(/"/g, '""')}"`);
    }

    let table = '';
    let columns: string[] = [];
    let insert = '';
    for (const line of text.split('\n')) {
      if (!line) continue;
      const rec = JSON.parse(line) as { k: string; name?: string; columns?: string[]; v?: unknown[] };
      if (rec.k === 'm') continue;
      if (rec.k === 't') {
        table = rec.name!;
        columns = rec.columns!;
        const cols = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(', ');
        const params = columns.map((_, i) => `$${i + 1}`).join(', ');
        insert = `INSERT INTO "${table.replace(/"/g, '""')}" (${cols}) VALUES (${params})`;
        continue;
      }
      if (rec.k === 'r') await client.query(insert, rec.v as unknown[]);
    }

    // Sequences are not data, but a restore that leaves them behind is a
    // database that throws a duplicate key on the very next insert.
    await client.query(`
      DO $$
      DECLARE r record; maxid bigint;
      BEGIN
        FOR r IN
          SELECT s.relname AS seq, t.relname AS tbl, a.attname AS col
            FROM pg_class s
            JOIN pg_depend d ON d.objid = s.oid AND d.deptype IN ('a','i')
            JOIN pg_class t ON t.oid = d.refobjid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
            JOIN pg_namespace n ON n.oid = s.relnamespace
           WHERE s.relkind = 'S' AND n.nspname = 'public'
        LOOP
          EXECUTE format('SELECT COALESCE(max(%I), 0) FROM %I', r.col, r.tbl) INTO maxid;
          PERFORM setval(format('public.%I', r.seq), GREATEST(maxid, 1), maxid > 0);
        END LOOP;
      END $$;`);

    await client.query('COMMIT');
    return manifest;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ── the scheduled job ────────────────────────────────────────

const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS ?? 30);

const keyFor = (at: Date) => `db/${at.toISOString().slice(0, 10)}/verdegarden-${at.toISOString().replace(/[:.]/g, '-')}.jsonl.gz`;

export type BackupResult = {
  ok: boolean; key?: string; bytes?: number; rows?: number; tables?: number;
  checksum?: string; verified?: boolean; pruned?: number; error?: string;
};

/**
 * Take a backup, upload it, read it back, and record the outcome.
 *
 * The read-back is not ceremony. An upload that reports success and stores
 * nothing, or stores something truncated, is the exact failure a backup system
 * is supposed to be immune to, and downloading a few hundred kilobytes costs
 * nothing on this platform, where bucket egress is free.
 */
export async function runBackup(trigger: 'schedule' | 'manual' | 'startup' = 'schedule'): Promise<BackupResult> {
  const started = await query<{ id: string }>(
    `INSERT INTO backup_runs (trigger) VALUES ($1) RETURNING id::text`, [trigger]);
  const runId = started[0]?.id;

  const fail = async (error: string): Promise<BackupResult> => {
    if (runId) {
      await query(`UPDATE backup_runs SET status='failed', finished_at=now(), error=$2 WHERE id=$1`,
                  [runId, error.slice(0, 2000)]).catch(() => {});
    }
    return { ok: false, error };
  };

  const cfg = s3Config();
  if (!cfg) {
    return fail('No backup storage configured. Set BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID, BACKUP_SECRET_ACCESS_KEY and BACKUP_ENDPOINT.');
  }

  try {
    const { body, manifest } = await dump();
    const checksum = checksumOf(body);
    const key = keyFor(new Date(manifest.takenAt));

    await putObject(cfg, key, body);

    // Read it back from the bucket and check both the bytes and the contents.
    const fetched = await getObject(cfg, key);
    if (checksumOf(fetched) !== checksum) {
      return fail(`The stored copy of ${key} does not match what was uploaded.`);
    }
    readArchive(fetched);

    // Prune, but never to nothing: if every copy is old, the oldest is still
    // the only copy there is, and deleting it to satisfy a retention rule
    // would be the system destroying the thing it exists to protect.
    let pruned = 0;
    const cutoff = Date.now() - KEEP_DAYS * 86400_000;
    const existing = (await listObjects(cfg, 'db/')).sort((a, b) =>
      a.lastModified.localeCompare(b.lastModified));
    for (const obj of existing) {
      if (existing.length - pruned <= 7) break;
      if (obj.key === key) continue;
      if (Date.parse(obj.lastModified) >= cutoff) continue;
      await deleteObject(cfg, obj.key);
      pruned += 1;
    }

    if (runId) {
      await query(
        `UPDATE backup_runs
            SET status='ok', finished_at=now(), object_key=$2, bytes=$3,
                table_count=$4, row_count=$5, checksum=$6, verified_at=now()
          WHERE id=$1`,
        [runId, key, body.length, manifest.tables.length, manifest.totalRows, checksum]);
    }

    return {
      ok: true, key, bytes: body.length, rows: manifest.totalRows,
      tables: manifest.tables.length, checksum, verified: true, pruned,
    };
  } catch (err) {
    return fail((err as Error).message);
  }
}

export const recentBackups = (limit = 20) =>
  query<{
    id: string; started_at: string; finished_at: string | null; status: string;
    trigger: string; object_key: string | null; bytes: string | null;
    table_count: number | null; row_count: string | null; verified_at: string | null;
    error: string | null;
  }>(`SELECT id::text, started_at::text, finished_at::text, status, trigger,
             object_key, bytes::text, table_count, row_count::text,
             verified_at::text, error
        FROM backup_runs ORDER BY started_at DESC LIMIT $1`, [limit]);

export const lastGoodBackup = () =>
  query<{ finished_at: string; object_key: string; bytes: string; row_count: string }>(
    `SELECT finished_at::text, object_key, bytes::text, row_count::text
       FROM backup_runs WHERE status='ok' ORDER BY finished_at DESC LIMIT 1`);

/**
 * Should a backup run right now?
 *
 * Asked as "has one succeeded since today's scheduled hour", rather than kept
 * on a 24-hour timer. A timer restarts with every deploy, so on a busy week of
 * deploys it can be reset just before it fires, every day, and never run at
 * all — the failure being that nothing happens, which is invisible. This way a
 * restart costs nothing and a missed day is caught at the next tick.
 */
export async function dueForBackup(): Promise<boolean> {
  const hour = Number(process.env.BACKUP_HOUR_UTC ?? 22);
  const now = new Date();
  const dueAt = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0));
  // Before today's hour, the bar is yesterday's.
  if (now < dueAt) dueAt.setUTCDate(dueAt.getUTCDate() - 1);

  const rows = await query<{ n: string }>(
    `SELECT count(*)::text AS n FROM backup_runs
      WHERE status = 'ok' AND finished_at >= $1`, [dueAt.toISOString()]);
  return Number(rows[0]?.n ?? 0) === 0;
}
