// The footer, and the number seven.
//
//   BASE=http://127.0.0.1:3000 node tests/footer.test.mjs
//
// There are seven emirates in the United Arab Emirates. The delivery list in
// this codebase held eight, because Al Ain was in it — Al Ain is a city in the
// emirate of Abu Dhabi. Two public pages counted that array and printed "all
// eight emirates", which is the kind of mistake a reader in the UAE notices in
// the first second and does not need to read twice. Al Ain is off the site
// entirely now; its old URL redirects to the emirate it is in.
//
// Also here: the social links, which are settings, which means the console can
// put anything in them — including a relative URL that would point at a page
// on this site from every page in the footer, or a javascript: URL, which is a
// script we would be rendering on the public site.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url);

const B = process.env.BASE ?? 'http://127.0.0.1:3000';
const S = require('../.test-build/settings.cjs');

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── the number, in the source ────────────────────────────────
const src = readFileSync('src/lib/site.ts', 'utf8');
const block = src.slice(src.indexOf('emirates: ['), src.indexOf('projectTypes'));
const inEmirates = [...block.matchAll(/slug: '([a-z-]+)'/g)].map((m) => m[1]);

check('THE POINT: the emirates list holds seven emirates',
  inEmirates.length === 7, `${inEmirates.length}: ${inEmirates.join(', ')}`);
check('and Al Ain is not one of them, because it is a city in Abu Dhabi',
  !inEmirates.includes('al-ain'), inEmirates.join(', '));

const places = readFileSync('src/lib/locations.ts', 'utf8');
check('and it has no location page of its own either',
  !/slug: 'al-ain'/.test(places));

// ── a URL from a form is not a URL ───────────────────────────
check('a link pasted without a scheme is not left relative',
  S.normaliseUrl('instagram.com/verde') === 'https://instagram.com/verde',
  S.normaliseUrl('instagram.com/verde'));
check('THE POINT: a javascript: URL is dropped rather than rendered',
  S.normaliseUrl('javascript:alert(1)') === '', S.normaliseUrl('javascript:alert(1)'));
check('and so is a data: URL', S.normaliseUrl('data:text/html,<script>') === '');
check('an https link is kept', S.normaliseUrl('https://x.com/y').startsWith('https://x.com/y'));
check('an http link is kept rather than silently upgraded',
  S.normaliseUrl('http://x.com/y').startsWith('http://'));
check('empty stays empty, so an unset account renders nothing',
  S.normaliseUrl('') === '' && S.normaliseUrl(null) === '' && S.normaliseUrl('   ') === '');
check('nonsense is dropped rather than put in an href',
  S.normaliseUrl('not a url at all') === '', S.normaliseUrl('not a url at all'));

// ── what the page actually says ──────────────────────────────
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const PAGES = ['/', '/collections', '/services', '/contact', '/about',
  '/quote', '/locations/dubai', '/locations/abu-dhabi'];
const claims = [];
const strays = [];
for (const path of PAGES) {
  await page.goto(`${B}${path}`, { waitUntil: 'domcontentloaded' });
  const text = await page.innerText('body');
  if (/\b(eight|8)\s+emirates\b/i.test(text)) claims.push(path);
  if (/Al Ain/.test(text)) strays.push(path);
}
check('THE POINT: no page claims there are eight emirates',
  claims.length === 0, claims.join(', '));
check('and Al Ain is not listed anywhere as a place we deliver',
  strays.length === 0, strays.join(', '));

// A URL that was published does not get to 404 because the page behind it was
// a mistake. It goes to the emirate the city is in.
const gone = await page.goto(`${B}/locations/al-ain`, { waitUntil: 'domcontentloaded' });
check('the old Al Ain URL redirects rather than breaking',
  gone.status() === 200 && page.url().endsWith('/locations/abu-dhabi'),
  `${gone.status()} ${page.url()}`);

await page.goto(`${B}/about`, { waitUntil: 'networkidle' });
const foot = await page.innerText('footer.ftr');
check('the footer says how many emirates in one line rather than listing them',
  /All seven emirates/.test(foot),
  foot.split('\n').find((l) => /All seven/.test(l)) ?? foot.slice(0, 80));
check('THE POINT: Al Ain is nowhere in the footer',
  !/Al Ain/.test(foot), foot.split('\n').find((l) => /Al Ain/.test(l)) ?? '');

const legal = await page.$$eval('.ftr-legal a', (as) => as.map((a) => a.getAttribute('href')));
check('every legal page is linked from the footer',
  ['/privacy', '/terms', '/terms-of-sale', '/refunds', '/disclaimer']
    .every((h) => legal.includes(h)), legal.join(' '));

const cols = await page.$$eval('.ftr-cols .ftr-h', (hs) => hs.map((h) => h.textContent.trim()));
check('the footer is grouped rather than one long list',
  cols.length >= 3, cols.join(' | '));

// ── the social row ───────────────────────────────────────────
const socials = await page.$$eval('.soc a', (as) => as.map((a) => ({
  href: a.getAttribute('href'),
  label: a.getAttribute('aria-label'),
  rel: a.getAttribute('rel'),
  target: a.getAttribute('target'),
})));
if (socials.length === 0) {
  console.log('  SKIP  no social accounts configured in this database');
} else {
  check('every social link is an absolute http(s) URL',
    socials.every((s) => /^https?:\/\//.test(s.href ?? '')),
    socials.map((s) => s.href).join(' '));
  check('each carries a name, because an icon on its own says nothing to a screen reader',
    socials.every((s) => (s.label ?? '').length > 2),
    socials.map((s) => s.label).join(' '));
  check('and opens away from the site without handing it the tab',
    socials.every((s) => s.target === '_blank' && (s.rel ?? '').includes('noopener')));

  const row = await page.$eval('.soc', (el) => getComputedStyle(el).display);
  check('THE POINT: the marks are a row, not a column down the side',
    row === 'flex', row);

  const size = await page.$eval('.soc a', (el) => {
    const r = el.getBoundingClientRect();
    return Math.min(r.width, r.height);
  });
  check('and each is big enough to press', size >= 40, String(Math.round(size)));
}

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
