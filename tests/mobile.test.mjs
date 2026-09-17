// The site and the console, on a phone.
//
//   BASE=http://127.0.0.1:3000 node tests/mobile.test.mjs
//   BASE=… VG_PW='…' node tests/mobile.test.mjs     (…and the console)
//
// Written after finding that the public site had NO navigation below 900px —
// `.nav` was display:none with nothing in its place, so the catalogue, the
// collections, the journal and the contact page were unreachable on a phone —
// and that the console's tables stopped at the edge of the screen inside an
// `overflow: hidden` panel, with the remaining columns simply gone.
//
// What it measures, at 390×844 with a touch pointer:
//   · no sideways scroll on any page
//   · a menu that opens, navigates and closes itself
//   · every target a finger has to hit is at least 44px
//   · no body text below 12px
//
// A control is exempt when it is off-screen (a honeypot), invisible (a radio
// whose label is the target) or a link inside a sentence, which cannot be
// stretched without tearing the line it sits in.
import { chromium } from 'playwright';

const B = process.env.BASE ?? 'http://127.0.0.1:3000';
// The account these sign in as. It was the owner's real address, which meant
// the only way to run the console suites was to know the owner's real
// password — so in practice they were skipped, which is the same as not
// having them. VG_USER lets a throwaway account stand in.
const USER = process.env.VG_USER ?? 'italiaverdegroupe@gmail.com';
const SITE = ['/', '/catalog', '/collections', '/collections/palms', '/services',
  '/quote', '/contact', '/shortlist', '/journal', '/about', '/locations/dubai',
  '/legal', '/privacy', '/terms', '/terms-of-sale', '/refunds', '/disclaimer'];
const CONSOLE = ['/admin', '/admin/leads', '/admin/inventory', '/admin/quotes',
  '/admin/finance', '/admin/reports', '/admin/settings'];

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2, isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();

/** Everything one page gets wrong, measured in the page itself. */
const MEASURE = () => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;

  const usable = (e) => {
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    // Off-screen on purpose: honeypots, skip links, visually-hidden labels.
    if (r.right <= 0 || r.left >= vw) return false;
    const s = getComputedStyle(e);
    if (s.visibility === 'hidden' || s.opacity === '0') return false;
    if (s.pointerEvents === 'none') return false;
    // Ancestors, not just the element. A control inside a visually-hidden
    // container is clipped to nothing and cannot be hit by a finger however
    // large its own box is — the honeypot on the quote form is a 66x20 input
    // inside a 1px clipped wrapper, and measuring it on its own reported a
    // failing tap target that no person can see, let alone miss.
    for (let n = e; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if ((n.className || '').toString().includes('visually-hidden')) return false;
      if (cs.clipPath && cs.clipPath !== 'none' && /inset\(\s*50%/.test(cs.clipPath)) return false;
      if (n.hasAttribute('aria-hidden') && n.getAttribute('aria-hidden') === 'true'
          && n.getBoundingClientRect().width <= 2) return false;
    }
    return true;
  };

  const name = (e) =>
    `${e.tagName.toLowerCase()}.${(e.className || '').toString().trim().split(/\s+/)[0] || '—'}`;

  // A link sitting inside running text is exempt: WCAG says so, and making it
  // 44px tall would open a hole in the paragraph around it.
  const inSentence = (e) => {
    if (e.tagName !== 'A') return false;
    const p = e.closest('p, li, dd, figcaption, h1, h2, h3, summary');
    return Boolean(p) && p.textContent.trim().length > e.textContent.trim().length + 8;
  };

  const small = [...document.querySelectorAll('a[href],button,select,textarea,summary,[role=button],input:not([type=hidden])')]
    .filter((e) => usable(e) && !inSentence(e))
    .map((e) => {
      // An input whose label wraps it is hit by tapping the label.
      const target = e.closest('label') ?? e;
      const r = target.getBoundingClientRect();
      return { n: name(e), w: Math.round(r.width), h: Math.round(r.height) };
    })
    // Height is the axis a thumb misses on: a row of links 17px tall is a
    // lottery, while "Privacy" being 41px wide is fine as long as there is
    // room around it. So 44 tall, and wide enough not to be a dot.
    .filter((x) => x.h < 44 || x.w < 24);

  const tiny = [...document.querySelectorAll('p,li,td,dd,a,span,b,em,small')]
    .filter((e) => usable(e) && e.textContent.trim().length > 20
                && parseFloat(getComputedStyle(e).fontSize) < 12)
    .map((e) => `${name(e)}:${getComputedStyle(e).fontSize}`);

  return {
    scrollW: doc.scrollWidth, clientW: vw,
    small: [...new Map(small.map((x) => [x.n + x.h, x])).values()].slice(0, 6)
      .map((x) => `${x.n}:${x.w}x${x.h}`),
    tiny: [...new Set(tiny)].slice(0, 5),
  };
};

const sweep = async (paths, label) => {
  const wide = [];
  const smalls = [];
  const tinies = [];
  for (const path of paths) {
    await page.goto(`${B}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(450);
    const r = await page.evaluate(MEASURE);
    if (r.scrollW > r.clientW + 1) wide.push(`${path} ${r.scrollW}>${r.clientW}`);
    if (r.small.length) smalls.push(`${path} → ${r.small.join(' ')}`);
    if (r.tiny.length) tinies.push(`${path} → ${r.tiny.join(' ')}`);
  }
  check(`${label}: nothing scrolls sideways`, wide.length === 0, wide.join(' | '));
  check(`${label}: every target is at least 44px`, smalls.length === 0, smalls.join(' | '));
  check(`${label}: no body text under 12px`, tinies.length === 0, tinies.join(' | '));
};

// ── the public site ──────────────────────────────────────────
await sweep(SITE, 'site');

// ── the menu that did not exist ──────────────────────────────
await page.goto(`${B}/catalog`, { waitUntil: 'networkidle' });
check('THE POINT: there is a way into the navigation on a phone',
  (await page.locator('.mnu-btn').count()) === 1);
check('and the desktop navigation is not what is hiding',
  await page.locator('.nav').first().isHidden().catch(() => true));

await page.click('.mnu-btn');
await page.waitForTimeout(450);
const items = await page.$$eval('.mnu nav a', (as) => as.map((a) => a.getAttribute('href')));
check('the panel holds every destination', items.length >= 6, items.join(' '));
check('and marks the one you are on',
  (await page.locator('.mnu nav a.on').getAttribute('href')) === '/catalog');
check('the page behind it cannot be scrolled away',
  (await page.evaluate(() => document.body.style.overflow)) === 'hidden');

await page.click('.mnu a[href="/collections"]');
await page.waitForTimeout(1300);
check('THE POINT: tapping a destination goes there and closes the panel',
  page.url().endsWith('/collections')
  && !(await page.evaluate(() => document.querySelector('.mnu')?.classList.contains('on'))),
  page.url());

await page.click('.mnu-btn');
await page.waitForTimeout(350);
await page.keyboard.press('Escape');
await page.waitForTimeout(350);
check('Escape closes it, and gives the page back',
  !(await page.evaluate(() => document.querySelector('.mnu')?.classList.contains('on')))
  && (await page.evaluate(() => document.body.style.overflow)) !== 'hidden');

// ── the console ──────────────────────────────────────────────
if (!process.env.VG_PW) {
  console.log('  SKIP  the console — VG_PW is not set');
} else {
  await page.goto(`${B}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name=email]', USER);
  await page.fill('input[name=password]', process.env.VG_PW);
  await page.click('button[type=submit]');
  await page.waitForTimeout(1800);

  await sweep(CONSOLE, 'console');

  await page.goto(`${B}/admin/inventory`, { waitUntil: 'networkidle' });
  check('the console has a bar rather than a strip of fifteen words',
    (await page.locator('.adm-bar-btn').count()) === 1);

  // The table used to sit in a panel with overflow:hidden, so on a phone the
  // columns past the fold could not be reached at all.
  const reach = await page.$eval('.adm-panel',
    (el) => ({ scroll: el.scrollWidth, client: el.clientWidth,
               can: getComputedStyle(el).overflowX }));
  check('THE POINT: a wide table can actually be scrolled to its far side',
    reach.scroll <= reach.client + 1 || reach.can === 'auto' || reach.can === 'scroll',
    `${reach.scroll}>${reach.client}, overflow-x: ${reach.can}`);

  await page.click('.adm-bar-btn');
  await page.waitForTimeout(450);
  const admItems = await page.$$eval('.adm-side a[href^="/admin"]',
    (as) => as.map((a) => a.getAttribute('href')));
  check('the drawer holds the whole console', admItems.length >= 12, String(admItems.length));
  await page.click('.adm-side a[href="/admin/leads"]');
  await page.waitForTimeout(1500);
  check('and closes itself on the way',
    page.url().endsWith('/admin/leads')
    && !(await page.evaluate(() => document.querySelector('.adm-side')?.classList.contains('on'))),
    page.url());
}

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
