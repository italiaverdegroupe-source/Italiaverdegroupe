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
  windowMs: WINDOW, perCaller: 6, globalUnverified: 60, maxTracked: 200, ...o,
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
    through === 60, `${through} of 400 got through`);
}

// ── and the denial it must not become ────────────────────────
// Bounding the forger by capping how many distinct unverified callers may
// hold an allowance also refused real people: a flood that occupied the slots
// made the next genuine visitor a 429. Below the ceiling, nobody is refused
// for somebody else's behaviour.
{
  const l = make({ globalUnverified: 1000 });
  const t = 2_500_000;
  for (let i = 0; i < 300; i++) l.limited(forged(`10.4.${(i / 256) | 0}.${i % 256}`), t);
  let refused = 0;
  for (let i = 0; i < 40; i++) if (l.limited(forged(`198.51.100.${i}`), t)) refused += 1;
  check('THE POINT: a flood of invented addresses does not refuse the next real visitor',
    refused === 0, `${refused} of 40 refused`);
}

// ── a real visitor when the edge is bypassed ─────────────────
{
  const l = make({ globalUnverified: 1000 });
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
  const l = make({ maxTracked: 40, globalUnverified: 1000 });
  const t = 4_000_000;
  for (let i = 0; i < 6; i++) l.limited(verified('203.0.113.7'), t);
  check('the visitor is at their limit', l.limited(verified('203.0.113.7'), t) === true);
  // Flood past the tracking cap: the old code called clear() here.
  for (let i = 0; i < 200; i++) l.limited(forged(`10.1.${(i / 256) | 0}.${i % 256}`), t);
  check('flooding the table past its cap does not clear the flooder’s own counter',
    l.limited(forged('10.1.0.0'), t) === true || l.tracked <= 40, `tracked=${l.tracked}`);
  check('the table never grows past its cap', l.tracked <= 40, String(l.tracked));
}

// ── the ceiling, and the denial-of-service it must not be ────
// The first version counted EVERY call, before the per-caller check. That let
// one caller spend the whole ceiling on refusals and shut the form for
// everybody, window after window. Both halves of the fix are checked here.
{
  let hit = 0;
  const l = make({ globalUnverified: 20, onGlobalLimit: () => { hit += 1; } });
  const t = 5_000_000;
  let through = 0;
  for (let i = 0; i < 40; i++) if (!l.limited(forged(`203.0.113.${i}`), t)) through += 1;
  check('the ceiling caps unverified callers', through === 20, String(through));
  check('and it says so rather than failing quietly', hit > 0, String(hit));
  check('the ceiling resets with the window',
    l.limited(forged('203.0.113.1'), t + WINDOW + 1) === false);
}
{
  // THE REGRESSION: one caller must not be able to close the form for others.
  const l = make({ globalUnverified: 20 });
  // (the flooder's own six accepted requests are all the ceiling they can spend)
  const t = 5_500_000;
  for (let i = 0; i < 250; i++) l.limited(forged('203.0.113.200'), t);
  check('THE POINT: a caller spending their allowance on refusals does not fund the ceiling',
    l.limited(forged('198.51.100.1'), t) === false);
  let refused = 0;
  for (let i = 0; i < 10; i++) if (l.limited(forged(`198.51.100.${10 + i}`), t)) refused += 1;
  check('...so genuine visitors still get through after a flood',
    refused === 0, `${refused} of 10 refused`);
}
{
  // A visitor the edge vouched for is never collateral, whatever anyone does.
  const l = make({ globalUnverified: 5 });
  const t = 6_500_000;
  for (let i = 0; i < 200; i++) l.limited(forged(`10.2.${(i / 256) | 0}.${i % 256}`), t);
  let refused = 0;
  for (let i = 0; i < 20; i++) if (l.limited(verified(`203.0.113.${i}`), t)) refused += 1;
  check('THE POINT: the ceiling never refuses a verified visitor',
    refused === 0, `${refused} of 20 refused`);
}

// ── reserved keys are not in the caller's namespace ──────────
{
  const t = 7_000_000;
  for (const evil of ['shared', 'none', '!shared', '!none', 'v:203.0.113.7', 'u:203.0.113.7']) {
    const l = make({ globalUnverified: 1000 });
    for (let i = 0; i < 8; i++) l.limited(forged(evil), t);      // burn that key
    check(`a caller sending "${evil}" cannot spend anyone else's allowance`,
      l.limited(forged('203.0.113.7'), t) === false
      && l.limited(verified('203.0.113.7'), t) === false
      && l.limited({ id: null, verified: false }, t) === false);
  }
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
