// A backup is only a backup if it has been restored. This dumps the real
// database, loads it into an empty one built from the migrations alone, and
// compares every table by content — not by row count, which would pass on a
// dump that wrote the right number of blank rows.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
import { gunzipSync, gzipSync } from 'node:zlib';
const require = createRequire(import.meta.url);

const SRC = 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const DST = 'postgresql://postgres@127.0.0.1:5433/vg_restore_test';
process.env.DATABASE_URL = SRC;
const B = require('../.test-build/backup.cjs');

const src = new pg.Client({ connectionString: SRC });
const dstPool = new pg.Pool({ connectionString: DST });
await src.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

/** Order-independent content fingerprint of a whole table. */
const fingerprint = async (client, table) => {
  const { rows } = await client.query(
    `SELECT count(*)::int AS n,
            COALESCE(md5(string_agg(h, '' ORDER BY h)), 'empty') AS f
       FROM (SELECT md5(t::text) AS h FROM "${table}" t) s`);
  return rows[0];
};

// ── the source has to be worth testing ──────────────────────
const { rows: tbl } = await src.query(
  `SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' ORDER BY table_name`);
const tables = tbl.map((r) => r.table_name);
check('the source database has its full schema', tables.length >= 40, `${tables.length} tables`);

const populated = [];
for (const t of tables) {
  const { n } = await fingerprint(src, t);
  if (n > 0) populated.push(t);
}
check('and real data in a meaningful number of them', populated.length >= 15,
      `${populated.length} non-empty`);

// ── dump ─────────────────────────────────────────────────────
const { body, manifest } = await B.dump();
check('the dump covers EVERY table in the catalogue',
      manifest.tables.length === tables.length,
      `${manifest.tables.length} of ${tables.length}`);
check('it is compressed', body.length > 0 && body[0] === 0x1f && body[1] === 0x8b);
check('and records a row total', manifest.totalRows > 0, String(manifest.totalRows));

const srcCounts = {};
for (const t of tables) srcCounts[t] = (await fingerprint(src, t)).n;
const manifestCounts = Object.fromEntries(manifest.tables.map((t) => [t.name, t.rows]));
check('the manifest row counts match the database',
      tables.every((t) => srcCounts[t] === manifestCounts[t]),
      tables.filter((t) => srcCounts[t] !== manifestCounts[t]).join(',') || 'all match');

// ── the archive verifies itself ──────────────────────────────
check('reading the archive back returns its manifest',
      B.readArchive(body).totalRows === manifest.totalRows);

const text = gunzipSync(body).toString('utf8');
const truncated = gzipSync(Buffer.from(text.slice(0, Math.floor(text.length * 0.6)), 'utf8'));
let caught = '';
try { B.readArchive(truncated); } catch (e) { caught = e.message; }
check('a truncated archive is refused, not silently accepted',
      /rows/.test(caught), caught || 'NOT REFUSED');

// ── restore into a database built from the migrations ────────
const dst = await dstPool.connect();
await dst.query('DELETE FROM payments');           // prove it overwrites, not appends
const restored = await B.restore(dstPool, body);
check('the restore reports the same totals', restored.totalRows === manifest.totalRows);

let mismatches = [];
for (const t of tables) {
  const a = await fingerprint(src, t);
  const b = await fingerprint(dst, t);
  if (a.n !== b.n || a.f !== b.f) mismatches.push(`${t}(${a.n}/${b.n})`);
}
check('EVERY table matches the source byte for byte after restore',
      mismatches.length === 0, mismatches.join(' ') || `${tables.length} tables identical`);

// ── the details that make a restore usable ───────────────────
const { rows: [seq] } = await dst.query(
  `SELECT last_value FROM leads_id_seq`);
const { rows: [maxLead] } = await dst.query(`SELECT COALESCE(max(id),0) AS m FROM leads`);
check('sequences are moved past the restored rows',
      Number(seq.last_value) >= Number(maxLead.m), `seq=${seq.last_value} max=${maxLead.m}`);

const insertable = await dst.query(
  `INSERT INTO leads (reference, enquiry_type, name, email, consent)
   VALUES ('RESTORE-PROBE','product','Probe','probe@example.ae', true) RETURNING id`)
  .then(() => true).catch((e) => e.message);
check('so a fresh insert does not collide with a restored id', insertable === true,
      typeof insertable === 'string' ? insertable : '');
await dst.query(`DELETE FROM leads WHERE reference='RESTORE-PROBE'`);

// ── restoring is all-or-nothing ──────────────────────────────
const beforeCount = (await fingerprint(dst, 'leads')).n;
// Corrupt a table that actually HAS rows — pointing a bad column list at an
// empty table proves nothing, because no insert is ever executed for it.
const victim = manifest.tables.find((t) => t.rows > 0 && t.name !== 'leads');
check('there is a populated table to corrupt', !!victim, victim?.name ?? 'none');
const corrupt = gzipSync(Buffer.from(
  gunzipSync(body).toString('utf8').replace(
    new RegExp(`\\{"k":"t","name":"${victim.name}"[^\\n]*`),
    `{"k":"t","name":"${victim.name}","columns":["no_such_column"]}`),
  'utf8'));
let rolledBack = '';
try { await B.restore(dstPool, corrupt); } catch (e) { rolledBack = e.message; }
check(`a restore that fails part-way (on ${victim?.name}) is rolled back entirely`,
      rolledBack !== '' && (await fingerprint(dst, 'leads')).n === beforeCount,
      rolledBack ? `refused: ${rolledBack.slice(0, 70)}` : 'DID NOT FAIL');

// ── a table added later is picked up without code changes ────
await src.query(`CREATE TABLE IF NOT EXISTS zz_future_table (id bigserial PRIMARY KEY, note text)`);
await src.query(`INSERT INTO zz_future_table (note) VALUES ('added after the backup was written')`);
const later = await B.dump();
check('a table added after this code was written is backed up anyway',
      later.manifest.tables.some((t) => t.name === 'zz_future_table'),
      later.manifest.tables.map((t) => t.name).slice(-3).join(','));
await src.query(`DROP TABLE zz_future_table`);

dst.release();
await dstPool.end();
await src.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
