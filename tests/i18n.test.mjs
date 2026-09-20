// Three languages, and the promise that English URLs did not move.
//
//   BASE=http://127.0.0.1:3000 node tests/i18n.test.mjs
//
// The risk in adding languages to a live site is not the translation. It is
// that every URL already published — in the sitemap, in the OG tags, in links
// people have already sent each other — quietly becomes a redirect or a 404
// because the router now wants a /en in front of it. English is served from
// the same addresses it always was, by a rewrite rather than a redirect, and
// that is the first thing this file checks.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url);

const B = process.env.BASE ?? 'http://127.0.0.1:3000';
let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── the pure functions ───────────────────────────────────────
const I = require('../.test-build/i18n.cjs');

check('English paths are returned unprefixed',
  I.localePath('en', '/catalog') === '/catalog', I.localePath('en', '/catalog'));
check('Arabic and Italian are prefixed',
  I.localePath('ar', '/catalog') === '/ar/catalog'
  && I.localePath('it', '/catalog') === '/it/catalog');
check('the homepage does not become /ar/',
  I.localePath('ar', '/') === '/ar', I.localePath('ar', '/'));
check('THE POINT: a mailto: is not given a language prefix',
  I.localePath('ar', 'mailto:a@b.com') === 'mailto:a@b.com',
  I.localePath('ar', 'mailto:a@b.com'));
check('nor a tel:, nor an absolute URL, nor an anchor',
  I.localePath('ar', 'tel:+9715') === 'tel:+9715'
  && I.localePath('ar', 'https://x.com') === 'https://x.com'
  && I.localePath('ar', '#main') === '#main');

check('splitLocale reverses it', I.splitLocale('/ar/catalog').locale === 'ar'
  && I.splitLocale('/ar/catalog').path === '/catalog');
check('and treats an unprefixed path as English',
  I.splitLocale('/catalog').locale === 'en' && I.splitLocale('/catalog').path === '/catalog');
check('/ar alone is the Arabic homepage, not a page called ar',
  I.splitLocale('/ar').path === '/', I.splitLocale('/ar').path);
// /article is not Arabic. A two-letter test that forgot the boundary would
// send every reader of /article to a language that does not exist.
check('THE POINT: a path that merely starts with two letters is not a locale',
  I.splitLocale('/article').locale === 'en' && I.splitLocale('/article').path === '/article',
  JSON.stringify(I.splitLocale('/article')));
check('an unsupported language is not treated as one',
  I.splitLocale('/de/catalog').path === '/de/catalog');
check('Arabic is the only right-to-left language here',
  I.dir('ar') === 'rtl' && I.dir('en') === 'ltr' && I.dir('it') === 'ltr');

// ── every internal link goes through L ───────────────────────
// Written as next/link at a call site, a link silently drops an Arabic reader
// back into English. The rule is enforced here rather than remembered.
const src = readFileSync('src/components/L.tsx', 'utf8');
check('the locale-aware link exists and wraps next/link',
  /from 'next\/link'/.test(src) && /localePath/.test(src));

// ── the interface dictionary ─────────────────────────────────
// Chrome is not content: an untranslated paragraph reads as work in progress,
// while an English "Close" on an otherwise Arabic page reads as a bug. The
// dictionary is typed so a missing key fails the build; this checks the two
// things types cannot — that nothing was left as the English string, and that
// no token was dropped in translation.
const U = require('../.test-build/ui.cjs');
const dicts = U.UI_DICTS;
const enDict = dicts.en;

for (const loc of ['ar', 'it']) {
  const missing = U.UI_KEYS.filter((k) => !dicts[loc]?.[k]);
  check(`${loc}: every interface string has a translation`,
    missing.length === 0, missing.join(', '));

  // A translation identical to the English is almost always one that was
  // skipped. The exceptions are words that genuinely do not change.
  // 'WhatsApp' and 'Privacy' are the same word in Italian, and 'Menu' is the
  // same in Italian too. Translating a brand name would be the bug.
  const SAME_IS_FINE = new Set(['nav.menu', 'legal.privacy', 'lang.label',
    'legal.whatsapp']);
  const untouched = U.UI_KEYS.filter(
    (k) => dicts[loc][k] === enDict[k] && !SAME_IS_FINE.has(k));
  check(`${loc}: nothing was left sitting in English`,
    untouched.length === 0, untouched.join(', '));

  // {n}, {min}, {max} are filled at render time. A translation that loses one
  // renders a label with a number missing from the middle of it.
  const tokensOf = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
  // ftr.allEmirates is exempt and says why in ui.ts: English spells the
  // number, the other two inflect it with the noun and drop it entirely.
  // Arabic and Italian inflect a counted noun with its number, so a token
  // cannot be dropped into the phrase without producing something no native
  // reader would write. Both say "all the emirates" instead, which cannot
  // drift if the list ever changed — and the count itself is guarded by
  // footer.test.mjs and collections.test.mjs, which is where it belongs.
  const NO_TOKEN_NEEDED = new Set(['ftr.allEmirates', 'col.allEmirates']);
  const lost = U.UI_KEYS.filter(
    (k) => !NO_TOKEN_NEEDED.has(k) && tokensOf(dicts[loc][k]) !== tokensOf(enDict[k]));
  check(`${loc}: every {token} survived translation`,
    lost.length === 0, lost.map((k) => `${k}: ${tokensOf(enDict[k])} -> ${tokensOf(dicts[loc][k])}`).join(' | '));
}

const t = U.ui('ar');
check('the translator fills tokens', t('ftr.weeksToSite', { min: 4, max: 8 }).includes('4'),
  t('ftr.weeksToSite', { min: 4, max: 8 }));
check('and leaves an unknown token visible rather than blanking it',
  t('ftr.licence', {}).includes('{n}'), t('ftr.licence', {}));

// ── the page copy ────────────────────────────────────────────
// The chrome being translated is what made the site LOOK multilingual while
// every paragraph stayed English — the complaint that started this. These are
// the sentences on the pages, and unlike the chrome they are keyed by their
// own English, so a gap renders as English rather than as nothing.
const SC = require('../.test-build/site-copy.cjs');
for (const loc of ['ar', 'it']) {
  const d = SC.COPY_DICTS[loc];
  const missing = SC.COPY_KEYS.filter((k) => !d[k]);
  check(`${loc}: every page sentence is translated`,
    missing.length === 0, `${missing.length} missing: ${missing.slice(0, 3).join(' | ')}`);
  const same = SC.COPY_KEYS.filter((k) => d[k] === k);
  check(`${loc}: none was left sitting in English`, same.length === 0, same.join(' | '));
}

// A sentence the markup breaks in half cannot be translated as halves: Arabic
// and Italian order the clauses differently, so the pieces come back in
// English order with a link stranded in the middle. scripts/i18n-unmix.mjs
// keeps those whole and English; this makes sure none slipped into the
// dictionary, because one that did would be shipped in pieces.
// Two are lower case on purpose and are whole on their own: a placeholder
// inside a date field, and a link label that trails a number which reads in
// the same order in all three languages ("68 specimens →", "68 صنفًا →").
const NOT_A_FRAGMENT = new Set(['e.g. March', 'specimens →']);
const partial = SC.COPY_KEYS.filter((k) => !NOT_A_FRAGMENT.has(k)
  && (/^[a-z(,.…—]/.test(k.trim()) || /[,;:—]$/.test(k.trim()) || /^&\w+;$/.test(k.trim())));
check('THE POINT: no half-sentence was translated as though it were whole',
  partial.length === 0, partial.join(' | '));

// ── the console's own language ───────────────────────────────
// The person who owns this company reads Italian and runs the business from
// these screens. The console is a different problem from the public site: the
// dictionary is large, so a missing string falls back to its own English
// rather than failing the build — which means coverage has to be measured, or
// "the console speaks Italian" quietly becomes "the navigation does".
const A = require('../.test-build/admin-ui.cjs');
const total = A.ADMIN_KEYS.length;

for (const loc of ['it', 'ar']) {
  const d = A.ADMIN_DICTS[loc];
  const done = A.ADMIN_KEYS.filter((k) => d[k]).length;
  const pct = Math.round((done / total) * 100);
  console.log(`  ----  ${loc}: ${done}/${total} console strings translated (${pct}%)`);

  // The shell is the part that decides whether somebody can find their way
  // around at all, so it is required rather than counted.
  const SHELL = ['Console', 'Overview', 'Leads', 'Quotations', 'Orders', 'Inventory',
    'Shipments', 'Finance', 'Reports', 'Alerts', 'Content', 'Settings', 'Backups',
    'Accounts', 'Sign out', 'Pipeline', 'Stock', 'Money', 'System'];
  const gaps = SHELL.filter((k) => !d[k]);
  check(`${loc}: every navigation label is translated`, gaps.length === 0, gaps.join(', '));

  // Identical is not the same as untranslated. These are the same word in
  // the target language on purpose: a proper noun, a format example shown to
  // teach a code's shape, a path, or an international trade term that Italian
  // uses in English (an Incoterm is an Incoterm; a container is a container).
  const SAME_ON_PURPOSE = new Set([
    'Console', 'Menu', 'Social', 'Report', 'Backup', 'Verde Garden', 'WhatsApp',
    'Bucket', 'Container', 'Incoterm', 'Password', 'Pipeline AED', 'Version',
    '/journal/', 'INV-000001', 'ORD-000001', 'QT-000001', 'VG-XXXXXXX',
    'olive-trees-gulf-summer', '· AED', '− AED',
    // 'proforma' is a Latin word Italian and English both took whole. An
    // Italian invoice says proforma; translating it would be inventing a word.
    'proforma',
    // A brand name with the number beside it. 'WhatsApp {n}' in Italian is
    // 'WhatsApp {n}'; anything else would be a mistranslation.
    'WhatsApp {n}',
    // The city on the sign-in screen's clock. Arabic has its own name for it
    // and uses it; Italian does not — Dubai is Dubai. Leaving it out of this
    // set would push somebody to invent an Italian spelling of a city that
    // already has one.
    'Dubai',
  ]);
  const same = A.ADMIN_KEYS.filter((k) => d[k] && d[k] === k && !SAME_ON_PURPOSE.has(k));
  check(`${loc}: no console string was left sitting in English`,
    same.length === 0, same.join(', '));
}

// The fallback is the whole reason a partial dictionary is safe. If it ever
// returned empty instead of the English, an untranslated screen would go blank
// rather than staying readable.
const ti = A.adminUi('it');
check('a translated console string comes back translated',
  ti('Quotations') === 'Preventivi', ti('Quotations'));
check('THE POINT: an untranslated one comes back as English, never empty',
  ti('Trade licence').length > 0, ti('Trade licence'));
check('and an unknown language falls back rather than throwing',
  A.adminUi('zz')('Orders') === 'Orders' && A.adminUi(null)('Orders') === 'Orders');

// ── the served site ──────────────────────────────────────────
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const PATHS = ['/', '/catalog', '/collections', '/services', '/about', '/contact',
  '/quote', '/journal', '/legal', '/privacy', '/terms', '/terms-of-sale',
  '/refunds', '/disclaimer', '/collections/olive-trees', '/locations/dubai'];

// THE POINT. Every English URL answers 200 at the address it was published at.
const moved = [];
for (const p of PATHS) {
  const r = await fetch(`${B}${p}`, { redirect: 'manual' });
  if (r.status !== 200) moved.push(`${p} -> ${r.status} ${r.headers.get('location') ?? ''}`);
}
check('THE POINT: every English URL still answers 200, unprefixed and unredirected',
  moved.length === 0, moved.join(' | '));

// And the long spelling of English collapses to the short one rather than
// serving the same page at a second address.
const dup = [];
for (const p of ['/en', '/en/catalog', '/en/privacy']) {
  const r = await fetch(`${B}${p}`, { redirect: 'manual' });
  const to = r.headers.get('location') ?? '';
  if (r.status !== 308 || /\/en(\/|$)/.test(new URL(to, B).pathname)) dup.push(`${p} -> ${r.status} ${to}`);
}
check('THE POINT: /en/… permanently redirects to the unprefixed URL',
  dup.length === 0, dup.join(' | '));

const bad = [];
for (const p of ['/ar', '/it', '/ar/catalog', '/it/privacy', '/ar/collections/olive-trees']) {
  const r = await fetch(`${B}${p}`, { redirect: 'manual' });
  if (r.status !== 200) bad.push(`${p} -> ${r.status}`);
}
check('Arabic and Italian answer at their own prefixes', bad.length === 0, bad.join(' | '));

const r404 = await fetch(`${B}/de/catalog`, { redirect: 'manual' });
check('a language we do not publish is a 404, not a duplicate English page',
  r404.status === 404, String(r404.status));

for (const f of ['/robots.txt', '/sitemap.xml']) {
  const r = await fetch(`${B}${f}`);
  check(`${f} is not swallowed by the locale rewrite`, r.status === 200, String(r.status));
}

// ── what the document declares ───────────────────────────────
for (const [path, lang, direction] of [
  ['/', 'en-AE', 'ltr'], ['/ar', 'ar-AE', 'rtl'], ['/it', 'it-IT', 'ltr'],
]) {
  await page.goto(`${B}${path}`, { waitUntil: 'domcontentloaded' });
  const got = await page.evaluate(() => ({
    lang: document.documentElement.lang, dir: document.documentElement.dir,
  }));
  check(`${path} declares lang=${lang} dir=${direction}`,
    got.lang === lang && got.dir === direction, `${got.lang} ${got.dir}`);
}

// hreflang on every page, in every language, or a crawler reads three
// languages as three competing duplicates.
const thin = [];
for (const p of ['/', '/catalog', '/collections', '/quote', '/privacy', '/ar/about', '/it/services']) {
  await page.goto(`${B}${p}`, { waitUntil: 'domcontentloaded' });
  const n = await page.$$eval('link[rel="alternate"][hreflang]', (ls) => ls.length);
  if (n !== 4) thin.push(`${p}: ${n}`);
}
check('THE POINT: every page carries all three languages plus x-default',
  thin.length === 0, thin.join(', '));

// ── the switcher ─────────────────────────────────────────────
await page.goto(`${B}/collections`, { waitUntil: 'domcontentloaded' });
// Wait for the control itself rather than for the network to fall quiet.
// networkidle never arrives on a page that keeps a connection open, and a
// test that hangs for thirty seconds is one people stop running.
await page.waitForSelector('.lang-btn', { state: 'visible' });
await page.click('.lang-btn');
await page.waitForSelector('.lang-menu a', { state: 'visible' });
const opts = await page.$$eval('.lang-menu a', (as) => as.map((a) => a.getAttribute('href')));
check('the switcher offers all three languages', opts.length === 3, opts.join(' '));
check('THE POINT: it offers THIS page in each, not the homepage',
  opts.includes('/collections') && opts.includes('/ar/collections')
  && opts.includes('/it/collections'), opts.join(' '));

await page.click('.lang-menu a[href="/ar/collections"]');
await page.waitForURL('**/ar/collections', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('h1', { state: 'attached' });
check('and following it lands on the same page in Arabic',
  page.url().endsWith('/ar/collections'), page.url());

const rtl = await page.evaluate(() => {
  const el = document.querySelector('h1') ?? document.body;
  return { dir: getComputedStyle(el).direction, font: getComputedStyle(el).fontFamily };
});
check('the Arabic page is laid out right to left', rtl.dir === 'rtl', rtl.dir);
check('and asks for an Arabic face rather than a Latin serif with no Arabic in it',
  /arabic|amiri/i.test(rtl.font), rtl.font);

// A page reached in Arabic must keep its language when you navigate on.
const href = await page.$eval('a[href*="/collections/"]', (a) => a.getAttribute('href'));
check('THE POINT: links on an Arabic page stay in Arabic',
  (href ?? '').startsWith('/ar/'), String(href));

// The page actually reads in the language it claims. Chrome comes from the
// dictionary, the headline from the database — both have to arrive.
for (const [path, must] of [['/ar', 'الكتالوج'], ['/it', 'Catalogo']]) {
  await page.goto(`${B}${path}`, { waitUntil: 'domcontentloaded' });
  const nav = await page.innerText('header');
  check(`${path} renders its navigation translated`, nav.includes(must), nav.slice(0, 60));
}

// No horizontal scroll from mirroring — the commonest RTL defect.
for (const w of [390, 1280]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(`${B}/ar`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('footer', { state: 'attached' });
  const over = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`the Arabic homepage does not scroll sideways at ${w}px`, over <= 1, `${over}px`);
}

// ── the query string survives the rewrite ────────────────────
//
// English is the language that gets REWRITTEN rather than passed through, and
// a rewrite built from a path alone silently drops everything after the '?'.
// For months /catalog?q=olive answered with the whole catalogue on the English
// site and with sixteen matches on the Arabic one, which is the shape of bug
// that hides for ever: the language nobody tests is the language that works.
// Counted through the product links, because the page prints a total in its
// own copy that has nothing to do with the result.
const cardsAt = async (path) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${B}${path}`, { waitUntil: 'domcontentloaded' });
  return page.$$eval('a[href*="/catalog/"]',
    (as) => new Set(as.map((a) => a.getAttribute('href'))).size);
};
const all = await cardsAt('/catalog');
const some = await cardsAt('/catalog?q=olive');
check('THE POINT: a search on the English site is not thrown away by the rewrite',
  some > 0 && some < all, `${some} of ${all}`);
check('and Arabic, which is passed through rather than rewritten, agrees',
  (await cardsAt('/ar/catalog?q=olive')) === some, `${some}`);

// The same defect, seen from the other side: every <Link> prefetch carries
// ?_rsc=, so dropping the query made the router ask for a payload and get a
// page. One InvariantError per link, on every page of the site.
const failedPrefetch = [];
page.on('response', (r) => {
  if (r.status() >= 500) failedPrefetch.push(`${r.status()} ${r.url()}`);
});
// Not 'networkidle': the homepage keeps a connection open and never reaches
// it. Loaded, then a moment for the router to prefetch what is in view.
await page.goto(`${B}/`, { waitUntil: 'load' });
await page.waitForTimeout(2500);
check('and no prefetch answers with a server error',
  failedPrefetch.length === 0, failedPrefetch.slice(0, 3).join(' | '));

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
