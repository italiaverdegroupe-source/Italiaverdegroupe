// Two things are checked here, and both are about not believing the caller.
//
// 1. Which header the client's address is read from. Every proxy APPENDS to
//    x-forwarded-for, so its first entry is whatever the client typed before
//    sending — reading it put an attacker-chosen string in the audit log and
//    handed the rate limiter a key the attacker picks.
//
// 2. That the login lockout stops the person guessing rather than the owner.
//    The old rule counted failures per email and ignored the address entirely,
//    so six wrong guesses from anywhere locked the only account that can reach
//    the console, for fifteen minutes, repeatably.
//
// Build first:
//   npx esbuild src/lib/client-ip.ts --format=cjs --outfile=.test-build/client-ip.cjs
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const IP = require('../.test-build/client-ip.cjs');

const db = new pg.Client({ connectionString: 'postgresql://postgres@127.0.0.1:5433/verdegarden' });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── 1. where the address comes from ──────────────────────────
const H = (o) => new Headers(o);

check('Cloudflare’s own header is preferred',
  IP.clientIpOf(H({ 'cf-connecting-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' })).ip === '203.0.113.7');

check('and it is trusted',
  IP.clientIpOf(H({ 'cf-connecting-ip': '203.0.113.7' })).trusted === true);

check('a forged x-forwarded-for cannot displace it',
  IP.clientIpForRecord(H({ 'x-forwarded-for': '1.2.3.4, 203.0.113.7', 'cf-connecting-ip': '203.0.113.7' })) === '203.0.113.7');

check('without Cloudflare, x-forwarded-for is used but marked unverified',
  IP.clientIpForRecord(H({ 'x-forwarded-for': '198.51.100.1' })) === '~198.51.100.1');

check('x-real-ip is the last resort, also unverified',
  IP.clientIpForRecord(H({ 'x-real-ip': '198.51.100.9' })) === '~198.51.100.9');

check('nothing at all is null, not a guess',
  IP.clientIpForRecord(H({})) === null);

check('the untrusted marker is what distinguishes the two in the audit log',
  IP.clientIpForRecord(H({ 'cf-connecting-ip': '203.0.113.7' })) !==
  IP.clientIpForRecord(H({ 'x-forwarded-for': '203.0.113.7' })));

// ── 2. the lockout ───────────────────────────────────────────
// The decision is exercised through the same SQL the app runs, against real
// rows, because that query is where the whole change lives.
const MAX_PER_ADDRESS = 6;
const MAX_PER_EMAIL = 30;
const WINDOW_MIN = 15;
const EMAIL = 'test-lockout@example.com';

async function locked(ip) {
  const { rows } = await db.query(
    `SELECT count(*) FILTER (WHERE $2::text IS NOT NULL AND ip = $2) AS here,
            count(*) AS anywhere
       FROM login_attempts
      WHERE email = $1 AND NOT successful
        AND at > now() - ($3 || ' minutes')::interval`,
    [EMAIL, ip, String(WINDOW_MIN)],
  );
  const here = Number(rows[0].here);
  const anywhere = Number(rows[0].anywhere);
  if (!ip) return anywhere >= MAX_PER_ADDRESS;
  return here >= MAX_PER_ADDRESS || anywhere >= MAX_PER_EMAIL;
}

const fail = (ip, n) => db.query(
  `INSERT INTO login_attempts (email, ip, successful)
   SELECT $1, $2, false FROM generate_series(1, $3)`, [EMAIL, ip, n]);

const reset = () => db.query('DELETE FROM login_attempts WHERE email = $1', [EMAIL]);

await reset();
check('a clean account is not locked', (await locked('203.0.113.7')) === false);

await fail('203.0.113.7', 5);
check('five failures from one address is not yet a lock', (await locked('203.0.113.7')) === false);

await fail('203.0.113.7', 1);
check('the sixth locks that address', (await locked('203.0.113.7')) === true);

check('THE POINT: the owner elsewhere is unaffected', (await locked('198.51.100.22')) === false);

await reset();
// Distributed guessing: one failure each from many addresses. Under the old
// email-only rule this locked at six; it must now take the higher threshold.
for (let i = 0; i < MAX_PER_EMAIL - 1; i++) await fail(`198.51.100.${i}`, 1);
check('29 failures spread across 29 addresses does not lock the email',
  (await locked('203.0.113.250')) === false);
await fail('198.51.100.250', 1);
check('30 does — distributed guessing is still caught',
  (await locked('203.0.113.250')) === true);

await reset();
await fail(null, MAX_PER_ADDRESS);
check('when nothing identifies the caller it falls back to the old rule',
  (await locked(null)) === true);

// A lock is a window, not a sentence.
await reset();
await db.query(
  `INSERT INTO login_attempts (email, ip, successful, at)
   SELECT $1, $2, false, now() - interval '16 minutes' FROM generate_series(1, $3)`,
  [EMAIL, '203.0.113.7', MAX_PER_ADDRESS]);
check('failures older than the window no longer count',
  (await locked('203.0.113.7')) === false);

await reset();
await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
