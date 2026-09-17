// The collections index, one collection, and the services page — through a
// real browser, because most of what was wrong with these three was only
// visible once the CSS and the images had actually run.
//
//   BASE=http://127.0.0.1:3000 node tests/collections.test.mjs
//
// Needs a running server. The services FAQs are skipped when the database has
// none published, so this passes against an empty content table too.
import { chromium } from 'playwright';

const B = process.env.BASE ?? 'http://127.0.0.1:3000';

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

// ── the index ────────────────────────────────────────────────
await page.goto(`${B}/collections`, { waitUntil: 'networkidle' });

const cards = await page.$$eval('.coll-card', (els) => els.map((e) => ({
  href: e.getAttribute('href'),
  name: e.querySelector('h2')?.textContent?.trim(),
  meta: e.querySelector('.coll-meta')?.textContent?.trim(),
})));
check('every family has a card', cards.length === 6, String(cards.length));
check('each one points at its own collection',
  cards.every((c) => c.href?.startsWith('/collections/') && c.href.length > '/collections/'.length),
  cards.map((c) => c.href).join(' '));

// The file's own order put the family holding one plant in the top row.
check('THE POINT: the deepest collection leads, the shallowest trails',
  cards[0].name === 'Palms' && cards[cards.length - 1].name === 'Indoor Plants',
  `${cards[0].name} … ${cards[cards.length - 1].name}`);

const counts = cards.map((c) => parseInt(c.meta ?? '', 10));
check('and the counts descend all the way down',
  counts.every((n, i) => i === 0 || counts[i - 1] >= n), counts.join(' > '));

check('a collection of one says "specimen", not "specimens"',
  /\b1 specimens?\b/i.test(cards[cards.length - 1].meta ?? '')
  && !/1 specimens\b/i.test(cards[cards.length - 1].meta ?? ''),
  cards[cards.length - 1].meta);

// text-transform: uppercase turned "6.0 m" into "6.0 M", which is mega-, not
// metres. Read the rendered pixels' worth: the transform as applied.
const unit = await page.$eval('.coll-h', (e) => ({
  text: e.textContent.trim(),
  transform: getComputedStyle(e).textTransform,
}));
check('metres stay lowercase', unit.transform === 'none' && / m$/.test(unit.text),
  `${unit.text} (${unit.transform})`);

// A curated cover names a reference by hand; a typo would leave a card blank.
const covers = await page.$$eval('.coll-img img', (imgs) => imgs.map((i) => ({
  src: i.currentSrc.split('url=')[1]?.split('&')[0] ?? i.currentSrc,
  w: i.naturalWidth,
  lazy: i.loading,
})));
check('every cover photograph resolves to a real file',
  covers.length === 6 && covers.every((c) => c.w > 0),
  covers.map((c) => `${c.src}:${c.w}`).join(' '));
check('the top row is not lazy-loaded, so the fold is never blank',
  covers.slice(0, 3).every((c) => c.lazy !== 'lazy'),
  covers.slice(0, 3).map((c) => c.lazy).join(' '));

const facts = await page.$eval('.coll-facts', (e) => e.innerText);
check('the facts bar counts the whole catalogue', /\b68\b/.test(facts), facts.replace(/\n/g, ' | '));

// ── one collection ───────────────────────────────────────────
await page.goto(`${B}/collections/olive-trees`, { waitUntil: 'networkidle' });

const crumb = await page.$eval('.crumbs a', (a) => a.getAttribute('href'));
check('THE POINT: the breadcrumb points at the page above this one',
  crumb === '/collections', String(crumb));

const heights = await page.$$eval('.grid article, .grid .pc, .grid a[href^="/catalog/"]',
  (els) => els.map((e) => {
    const m = e.textContent.match(/([\d.]+)\s*-\s*([\d.]+)\s*m/);
    return m ? (parseFloat(m[1]) + parseFloat(m[2])) / 2 : null;
  }).filter((n) => n !== null));
check('the collection reads tallest first', heights.length > 5
  && heights.every((h, i) => i === 0 || heights[i - 1] >= h),
  heights.slice(0, 6).join(' > '));

const more = await page.$$eval('.fam-more a', (as) => as.map((a) => a.getAttribute('href')));
check('the other five collections are one click away, and this one is not among them',
  more.length === 5 && !more.includes('/collections/olive-trees'), more.join(' '));

const missing = await page.goto(`${B}/collections/bonsai-forest`, { waitUntil: 'domcontentloaded' });
check('a family that does not exist is a 404, not an empty grid',
  missing.status() === 404, String(missing.status()));

// ── services ─────────────────────────────────────────────────
await page.goto(`${B}/services`, { waitUntil: 'networkidle' });

const stages = await page.$$eval('.svc-stages > li', (ls) => ls.map((l) => ({
  n: l.querySelector('.svc-num')?.textContent?.trim(),
  h: l.querySelector('h2')?.textContent?.trim(),
})));
check('the work is laid out as the six stages it is', stages.length === 6, String(stages.length));
check('and they are numbered in the order a tree passes through them',
  stages.map((s) => s.n).join(',') === '01,02,03,04,05,06',
  stages.map((s) => s.n).join(','));

const body = await page.innerText('body');
check('the lead time is stated rather than left to be asked for',
  /4[–-]8 weeks/.test(body));
check('supply without delivery is offered in as many words', /Supply only/.test(body));

const faqs = await page.$$('.svc-faqs .faq');
if (faqs.length === 0) {
  console.log('  SKIP  no FAQs published in this database');
} else {
  // The rules for .faq used to live inside the home page's own <style> block.
  // A page-level <style> is global, so they existed only while the home page
  // was mounted — and these rendered unstyled.
  const styled = await page.$eval('.svc-faqs .faq', (e) => {
    const s = getComputedStyle(e);
    return { border: s.borderBottomStyle, width: s.borderBottomWidth };
  });
  check('THE POINT: the FAQ styling reaches a page that is not the home page',
    styled.border === 'solid' && parseFloat(styled.width) > 0,
    `${styled.width} ${styled.border}`);

  const first = faqs[0];
  check('an answer is closed to begin with', !(await first.evaluate((e) => e.open)));
  await first.click();
  check('and opens when asked', await first.evaluate((e) => e.open));
}

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
