// Run every suite in tests/ and say plainly what ran and what did not.
//
//   npm test                                  library suites only
//   BASE=http://127.0.0.1:3000 npm test       …and the browser suites
//   BASE=… VG_PW='…' npm test                 …and the ones that sign in
//
// There was no single way to run these. Fourteen files, each with its own
// invocation remembered somewhere, is how a suite quietly stops being run —
// and a suite that is skipped by accident reports the same nothing as a suite
// that passed, which is the part that matters. Anything skipped here is named,
// with the reason, and the exit code is non-zero if anything failed.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const BASE = process.env.BASE ?? '';
const DB = process.env.DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5433/verdegarden';

/** What each suite needs before it can say anything true. */
const NEEDS = {
  'design-tokens.test.mjs': [],
  'landed-cost.test.mjs': [],
  'photos.test.mjs': [],
  'rate-limit.test.mjs': ['db'],
  'auth-hardening.test.mjs': ['db'],
  'content.test.mjs': ['db'],
  'users.test.mjs': ['db'],
  'alerts.test.mjs': ['db'],
  'backup.test.mjs': ['db'],
  'compliance.test.mjs': ['db'],
  'concurrency.test.mjs': ['db'],
  'partial-delivery.test.mjs': ['db'],
  'reports.test.mjs': ['db'],
  'shortlist.test.mjs': ['db', 'server'],
  'collections.test.mjs': ['server'],
  'mobile.test.mjs': ['server'],
  'hero-contrast.mjs': ['server'],
  'contrast-sweep.mjs': ['server'],
  'home-audit.mjs': ['server'],
  'console-sweep.mjs': ['server', 'signin'],
};

async function serverIsUp() {
  if (!BASE) return false;
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(4000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

const have = {
  db: true,                        // the suites that need it say so themselves
  server: await serverIsUp(),
  signin: Boolean(process.env.VG_PW),
};

const files = readdirSync('tests')
  .filter((f) => f.endsWith('.mjs'))
  .sort((a, b) => (NEEDS[a]?.length ?? 9) - (NEEDS[b]?.length ?? 9) || a.localeCompare(b));

const why = {
  server: BASE ? `no server answering at ${BASE}` : 'BASE is not set',
  signin: 'VG_PW is not set',
};

const passed = [];
const failed = [];
const skipped = [];

for (const f of files) {
  const needs = NEEDS[f] ?? [];
  const missing = needs.find((n) => !have[n]);
  if (missing) {
    skipped.push([f, why[missing] ?? `needs ${missing}`]);
    continue;
  }
  process.stdout.write(`\n──────── ${f}\n`);
  const r = spawnSync(process.execPath, [`tests/${f}`], {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: DB, BASE },
  });
  (r.status === 0 ? passed : failed).push(f);
}

console.log('\n════════ summary');
console.log(`  ${passed.length} passed${passed.length ? ':  ' + passed.join(', ') : ''}`);
if (failed.length) console.log(`  ${failed.length} FAILED:  ${failed.join(', ')}`);
for (const [f, reason] of skipped) console.log(`  skipped  ${f}  — ${reason}`);
if (skipped.length && !failed.length) {
  console.log('\n  Skipped is not passed. Start the site and set BASE to run the rest.');
}
process.exit(failed.length ? 1 : 0);
