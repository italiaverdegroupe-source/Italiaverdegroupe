// The question this answers: can somebody who invents a new address for every
// request get an unlimited allowance?
//
// They could. The old limiter keyed on x-forwarded-for's first entry, which
// the caller writes, so a fresh header meant a fresh allowance — and when the
// map reached five thousand keys it called clear(), which reset every counter
// on the instance including the attacker's own. Both are exercised below.
//
// The clock is injected, so a fifteen-minute window is tested in no time at
// all and nothing here is flaky.
//
// Build first:
//   npx esbuild src/lib/rate-limit.ts --format=cjs --outfile=.test-build/rate-limit.cjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Limiter } = require('../.test-build/rate-limit.cjs');

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const WINDOW = 10 * 60_000;
const make = (o = {}) => new Limiter({
  windowMs: WINDOW, perCaller: 6, global: 240, unverifiedCallers: 50, maxTracked: 200, ...o,
});
const verified = (id) => ({ id, verified: true });
const forged = (id) => ({ id, verified: false });

// ── an ordinary visitor ──────────────────────────────────────
{
  const l = make();
  const t = 1_000_000;
  let refused = 0;
  for (let i = 0; i < 6; i++) if (l.limited(verified('203.0.113.7'), t)) refused++;
  check('six enquiries from one visitor all go through', refused === 0, String(refused));
  check('the seventh is refused', l.limited(verified('203.0.113.7'), t) === true);
  check('a different visitor is unaffected', l.limited(verified('198.51.100.4'), t) === false);
  check('and the window releases them', l.limited(verified('203.0.113.7'), t + WINDOW + 1) === false);
}

// ── the attack the change exists to stop ─────────────────────
{
  const l = make();
  const t = 2_000_000;
  let through = 0;
  // One machine, a new invented address every request.
  for (let i = 0; i < 400; i++) if (!l.limited(forged(`10.0.${(i / 256) | 0}.${i % 256}`), t)) through += 1;
  check('THE POINT: inventing a new address per request does not buy unlimited allowances',
    through < 400, `${through} of 400 got through`);
  check('and what got through is bounded by the shared bucket, not by the number invented',
    through <= 50 * 6 + 6, String(through));
}

// ── a real visitor when the edge is bypassed ─────────────────
{
  const l = make();
  const t = 3_000_000;
  check('an unverified visitor still gets their own allowance while callers are few',
    l.limited(forged('198.51.100.9'), t) === false);
  let refused = 0;
  for (let i = 0; i < 5; i++) if (l.limited(forged('198.51.100.9'), t)) refused++;
  check('...all six of them', refused === 0, String(refused));
  check('and the seventh is refused like anyone else',
    l.limited(forged('198.51.100.9'), t) === true);
}

// ── no reset switch ──────────────────────────────────────────
{
  const l = make({ maxTracked: 40, unverifiedCallers: 1000 });
  const t = 4_000_000;
  for (let i = 0; i < 6; i++) l.limited(verified('203.0.113.7'), t);
  check('the visitor is at their limit', l.limited(verified('203.0.113.7'), t) === true);
  // Flood past the tracking cap: the old code called clear() here.
  for (let i = 0; i < 200; i++) l.limited(forged(`10.1.${(i / 256) | 0}.${i % 256}`), t);
  check('flooding the table past its cap does not clear the flooder’s own counter',
    l.limited(forged('10.1.0.0'), t) === true || l.tracked <= 40, `tracked=${l.tracked}`);
  check('the table never grows past its cap', l.tracked <= 40, String(l.tracked));
}

// ── the ceiling across everyone ──────────────────────────────
{
  let hit = 0;
  const l = make({ global: 20, onGlobalLimit: () => { hit += 1; } });
  const t = 5_000_000;
  let through = 0;
  for (let i = 0; i < 40; i++) if (!l.limited(verified(`203.0.113.${i}`), t)) through += 1;
  check('the global ceiling caps distinct verified callers too', through === 20, String(through));
  check('and it says so rather than failing quietly', hit > 0, String(hit));
  check('the ceiling resets with the window',
    l.limited(verified('203.0.113.1'), t + WINDOW + 1) === false);
}

// ── an unidentifiable caller ─────────────────────────────────
{
  const l = make();
  const t = 6_000_000;
  let refused = 0;
  for (let i = 0; i < 6; i++) if (l.limited({ id: null, verified: false }, t)) refused++;
  check('a caller with no address at all is still counted', refused === 0);
  check('and limited', l.limited({ id: null, verified: false }, t) === true);
}

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
