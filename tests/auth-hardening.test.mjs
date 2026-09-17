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
const SECRET = 'a-long-random-edge-secret';

// Without proof the request came through our edge, NOTHING is trusted — which
// is the state the site ships in until the Cloudflare rule and EDGE_SECRET are
// both configured. The first version of this file trusted CF-Connecting-IP on
// sight, which made forging it easier than forging x-forwarded-for AND wrote
// the forged value into audit_log with no "~" to say nobody had checked it.
delete process.env.EDGE_SECRET;

check('CF-Connecting-IP alone is NOT trusted',
  IP.clientIpOf(H({ 'cf-connecting-ip': '203.0.113.7' })).trusted === false);

check('...and it is recorded as unverified',
  IP.clientIpForRecord(H({ 'cf-connecting-ip': '203.0.113.7' })) === '~203.0.113.7');

check('THE POINT: forging the Cloudflare header does not launder an address',
  IP.clientIpForRecord(H({ 'cf-connecting-ip': '1.2.3.4' })) ===
  IP.clientIpForRecord(H({ 'x-forwarded-for': '1.2.3.4' })));

process.env.EDGE_SECRET = SECRET;

check('with the edge secret present, Cloudflare\u2019s header is trusted',
  IP.clientIpOf(H({ 'x-edge-secret': SECRET, 'cf-connecting-ip': '203.0.113.7' })).trusted === true);

check('...and recorded bare, as evidence',
  IP.clientIpForRecord(H({ 'x-edge-secret': SECRET, 'cf-connecting-ip': '203.0.113.7' })) === '203.0.113.7');

check('a wrong secret earns nothing',
  IP.clientIpOf(H({ 'x-edge-secret': 'guess', 'cf-connecting-ip': '203.0.113.7' })).trusted === false);

check('the secret alone, with no Cloudflare header, earns nothing',
  IP.clientIpOf(H({ 'x-edge-secret': SECRET, 'x-forwarded-for': '203.0.113.7' })).trusted === false);

check('a forged x-forwarded-for cannot displace the verified address',
  IP.clientIpForRecord(H({ 'x-edge-secret': SECRET, 'x-forwarded-for': '1.2.3.4, 203.0.113.7',
                           'cf-connecting-ip': '203.0.113.7' })) === '203.0.113.7');

delete process.env.EDGE_SECRET;

check('x-forwarded-for is used but marked unverified',
  IP.clientIpForRecord(H({ 'x-forwarded-for': '198.51.100.1' })) === '~198.51.100.1');

check('x-real-ip is the last resort, also unverified',
  IP.clientIpForRecord(H({ 'x-real-ip': '198.51.100.9' })) === '~198.51.100.9');

check('nothing at all is null, not a guess', IP.clientIpForRecord(H({})) === null);

// login_attempts.ip was indexed, and a btree entry has a maximum size, so an
// unbounded caller-supplied address was enough to make the INSERT throw — a
// sign-in attempt leaving no trace in the log an operator reads during an
// attack. Nothing longer than an IPv6 address is an address.
const huge = 'x'.repeat(9000);
check('an oversized address is cut down rather than stored whole',
  (IP.clientIpForRecord(H({ 'x-forwarded-for': huge })) ?? '').length <= 46,
  String((IP.clientIpForRecord(H({ 'x-forwarded-for': huge })) ?? '').length));

// ── 2. the lockout ───────────────────────────────────────────
// The decision is exercised through the same SQL the app runs, against real
// rows, because that query is where the whole change lives.
const MAX_PER_ADDRESS = 6;
const MAX_PER_EMAIL = 30;
const WINDOW_MIN = 15;
const EMAIL = 'test-lockout@example.com';

const KNOWN_DAYS = 90;
async function locked(ip) {
  const { rows } = await db.query(
    `SELECT count(*) FILTER (WHERE NOT successful
                               AND at > now() - ($3 || ' minutes')::interval
                               AND $2::text IS NOT NULL AND ip = $2)          AS here,
            count(*) FILTER (WHERE NOT successful
                               AND at > now() - ($3 || ' minutes')::interval) AS anywhere,
            count(*) FILTER (WHERE successful
                               AND $2::text IS NOT NULL AND ip = $2)          AS known
       FROM login_attempts
      WHERE email = $1 AND at > now() - ($4 || ' days')::interval`,
    [EMAIL, ip, String(WINDOW_MIN), String(KNOWN_DAYS)],
  );
  const here = Number(rows[0].here);
  const anywhere = Number(rows[0].anywhere);
  const known = Number(rows[0].known);
  if (!ip) return anywhere >= MAX_PER_ADDRESS;
  if (here >= MAX_PER_ADDRESS) return true;
  if (known > 0) return false;
  return anywhere >= MAX_PER_EMAIL;
}

const succeed = (ip) => db.query(
  'INSERT INTO login_attempts (email, ip, successful) VALUES ($1, $2, true)', [EMAIL, ip]);

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

// THE REGRESSION the first version left open: 30 wrong guesses from ONE
// attacker address is seconds of work, and it locked the owner out of the only
// console account from their own desk. Raising the price from six guesses to
// thirty is not the same as removing the attack.
await reset();
await fail('198.51.100.66', MAX_PER_EMAIL);
await succeed('203.0.113.9');
check('THE POINT: an address this account has signed in from before is never collateral',
  (await locked('203.0.113.9')) === false);
check('...while an address it has never seen is still caught by the same attack',
  (await locked('203.0.113.111')) === true);
await fail('203.0.113.9', MAX_PER_ADDRESS);
check('...but a known address that starts guessing is still stopped',
  (await locked('203.0.113.9')) === true);

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
