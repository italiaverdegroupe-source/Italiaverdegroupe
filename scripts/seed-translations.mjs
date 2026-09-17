// Load the translated content blocks into the database.
//
//   DATABASE_URL=... node scripts/seed-translations.mjs [--dry]
//
// The translations live in db/seed/blocks.<locale>.tsv rather than in a SQL
// migration, because they are CONTENT: the console can edit any of them
// afterwards, and a migration that rewrote them on every deploy would undo
// whatever the company had corrected. This is a seed, so it only fills gaps —
// a row that already exists is left exactly as it is, and the run says how
// many it left alone.
import { readFileSync, readdirSync } from 'node:fs';
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { BLOCKS } = require('../.test-build/content.cjs');

const DRY = process.argv.includes('--dry');
const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set.'); process.exit(1); }

const db = new pg.Client({ connectionString: url });
await db.connect();

let added = 0, kept = 0, unknown = [];
for (const file of readdirSync('db/seed').filter((f) => /^blocks\.[a-z]{2}\.tsv$/.test(f))) {
  const locale = file.split('.')[1];
  const lines = readFileSync(`db/seed/${file}`, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    const tab = line.indexOf('\t');
    const key = line.slice(0, tab).trim();
    const value = line.slice(tab + 1).trim();
    // A key the code does not know is a renamed block or a typo. Loading it
    // would put a row in the table that nothing ever reads and that the
    // console cannot show, so it is reported instead.
    if (!(key in BLOCKS)) { unknown.push(`${locale}:${key}`); continue; }
    if (!value) continue;
    if (DRY) { added++; continue; }
    const res = await db.query(
      `INSERT INTO content_blocks (key, locale, value) VALUES ($1, $2, $3)
       ON CONFLICT (key, locale) DO NOTHING RETURNING key`, [key, locale, value]);
    if (res.rowCount) added++; else kept++;
  }
  // Every block, or the language is partly English and nobody said so.
  const missing = Object.keys(BLOCKS).filter(
    (k) => !lines.some((l) => l.startsWith(`${k}\t`)));
  console.log(`${locale}: ${lines.length} translated, ${missing.length} missing`
    + (missing.length ? ` -> ${missing.join(', ')}` : ''));
}

if (unknown.length) console.log(`unknown keys ignored: ${unknown.join(', ')}`);
console.log(DRY ? `would insert ${added}` : `inserted ${added}, left ${kept} already-edited rows alone`);
await db.end();
