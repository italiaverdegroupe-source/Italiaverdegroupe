// Does every page, in every language, actually work?
//
//   BASE=http://127.0.0.1:3000 VG_USER=… VG_PW=… node scripts/health-check.mjs
//
// Not a unit test. This opens every URL the site publishes — the public pages
// in all three languages and every console screen signed in — and reports what
// a visitor or an operator would actually hit: a status that is not 200, an
// error thrown in the browser, a page with no heading, an image that 404s, a
// link that goes nowhere, a missing canonical or hreflang.
//
// It exists because "the site works" is a claim, and twenty-three green suites
// still leave the question of whether page 41 of 294 renders at all.
import { chromium } from 'playwright';

const B = process.env.BASE ?? 'http://127.0.0.1:3000';
const USER = process.env.VG_USER ?? '';
const PW = process.env.VG_PW ?? '';
const LOCALES = ['', '/ar', '/it'];

/**
 * The pages to check come from the sitemap, not from a list written here.
 *
 * A hand-written list is a second opinion about what the site publishes, and
 * it was wrong on the first run: it guessed /collections/cacti where the site
 * says /collections/cacti-and-succulents, and reported three 404s that were
 * the test's fault. Reading the sitemap means this checks exactly what is
 * offered to a search engine — and if the sitemap is wrong, that is itself
 * the defect worth finding.
 *
 * The 68 catalogue pages are sampled rather than all opened: they come from
 * one template, and 68 x 3 loads to prove it three times over is a slow way
 * to learn one thing. Everything else is checked in full.
 */
async function pagesFromSitemap() {
  const xml = await (await fetch(`${B}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = urls.map((u) => new URL(u).pathname).filter((p) => !/^\/(ar|it)\//.test(p));
  const catalogue = paths.filter((p) => p.startsWith('/catalog/'));
  const rest = paths.filter((p) => !p.startsWith('/catalog/'));
  return { rest, catalogue: catalogue.slice(0, 3), total: paths.length };
}
const { rest: PUBLIC, catalogue: SAMPLE, total: SITEMAP_TOTAL } = await pagesFromSitemap();

const CONSOLE = [
  '/admin', '/admin/leads', '/admin/quotes', '/admin/orders', '/admin/inventory',
  '/admin/inventory/specimens', '/admin/shipments', '/admin/finance',
  '/admin/reports', '/admin/alerts', '/admin/content', '/admin/settings',
  '/admin/backups', '/admin/users', '/admin/account',
];

const defects = [];
const note = (where, what, detail = '') =>
  defects.push({ where, what, detail: String(detail).slice(0, 160) });

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();

/** Anything the browser itself complained about while the page loaded. */
let jsErrors = [];
let badRequests = [];
page.on('pageerror', (e) => jsErrors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') jsErrors.push(m.text()); });
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('favicon')) {
    badRequests.push(`${r.status()} ${r.url().replace(B, '')}`);
  }
});

async function visit(path, { expectHeading = true, seo = true } = {}) {
  jsErrors = []; badRequests = [];
  let res;
  try {
    res = await page.goto(`${B}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  } catch (e) {
    note(path, 'did not load', e.message);
    return;
  }
  if (!res || res.status() !== 200) {
    note(path, `status ${res?.status()}`);
    return;
  }
  await page.waitForTimeout(250);

  const info = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.trim() ?? '',
    text: (document.body.innerText || '').trim().length,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
    alts: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    title: document.title,
    imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    emptyLinks: [...document.querySelectorAll('a[href]')]
      .filter((a) => !a.textContent.trim() && !a.querySelector('img,svg')).length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));

  if (expectHeading && !info.h1) note(path, 'no <h1>');
  if (info.text < 120) note(path, 'almost no text', `${info.text} chars`);
  if (!info.title) note(path, 'no <title>');
  if (seo && !info.canonical) note(path, 'no canonical');
  if (seo && info.alts !== 3 + 1) note(path, `hreflang tags: ${info.alts}, expected 4`);
  if (!info.lang) note(path, 'no lang on <html>');
  if (info.imgsNoAlt) note(path, `${info.imgsNoAlt} image(s) with no alt`);
  if (info.emptyLinks) note(path, `${info.emptyLinks} link(s) with no text`);
  if (info.overflow > 1) note(path, `scrolls sideways by ${info.overflow}px`);
  if (jsErrors.length) note(path, 'javascript error', jsErrors[0]);
  if (badRequests.length) note(path, 'failed request', badRequests[0]);
}

console.log(`── public pages, three languages (${SITEMAP_TOTAL} URLs in the sitemap) ──`);
let n = 0;
for (const p of [...PUBLIC, ...SAMPLE]) {
  for (const l of LOCALES) {
    const path = l + (p === '/' ? '' : p) || '/';
    await visit(path);
    n++;
  }
  process.stdout.write('.');
}
console.log(`\n   ${n} page loads`);

console.log('\n── files search engines read ──');
for (const f of ['/robots.txt', '/sitemap.xml']) {
  const r = await fetch(`${B}${f}`);
  const body = await r.text();
  if (r.status !== 200) note(f, `status ${r.status}`);
  else if (body.trim().length < 20) note(f, 'is empty');
  else console.log(`   ${f}  ${r.status}  ${body.length} bytes`);
}

if (USER && PW) {
  console.log('\n── the console, signed in ──');
  await page.goto(`${B}/admin/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name=email]', USER);
  await page.fill('input[name=password]', PW);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin', { waitUntil: 'domcontentloaded', timeout: 20000 });

  for (const p of CONSOLE) {
    await visit(p, { seo: false });
    process.stdout.write('.');
  }
  console.log(`\n   ${CONSOLE.length} screens`);
} else {
  console.log('\n   SKIPPED the console — VG_USER and VG_PW are not set');
}

await browser.close();

console.log(`\n═══ ${defects.length} defect(s)`);
const byPage = new Map();
for (const d of defects) {
  if (!byPage.has(d.where)) byPage.set(d.where, []);
  byPage.get(d.where).push(d);
}
for (const [where, ds] of byPage) {
  console.log(`\n  ${where}`);
  for (const d of ds) console.log(`      ${d.what}${d.detail ? '  — ' + d.detail : ''}`);
}
process.exit(defects.length ? 1 : 0);
