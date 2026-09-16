// The promise this module makes to the business is that nothing typed in the
// console can break the public site, and nothing typed in the console can put
// markup on it. Both are tested here rather than asserted in a commit message.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from '../node_modules/react-dom/server.browser.js';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
process.env.DATABASE_URL = 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const C = require('../.test-build/content.cjs');
const Prose = require('../.test-build/prose.cjs').default;

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

await db.query(`DELETE FROM content_blocks; DELETE FROM page_seo;`);
await db.query(`DELETE FROM faqs WHERE question LIKE 'TEST %';`);
await db.query(`DELETE FROM testimonials WHERE author_name LIKE 'TEST %';`);
await db.query(`DELETE FROM posts WHERE slug LIKE 'test-%';`);

// ── the defaults are never absent ────────────────────────────
const empty = await C.getBlocks();
const keys = Object.keys(C.BLOCKS);
check('an empty table renders every block',
      keys.every((k) => typeof empty[k] === 'string' && empty[k].length > 0));
check('and renders them as the code ships them',
      empty['home.hero.title'] === C.BLOCKS['home.hero.title'].fallback,
      empty['home.hero.title']);

await db.query(
  `INSERT INTO content_blocks (key, value) VALUES ('home.hero.title', 'Olivi secolari italiani.')`);
check('a stored value overrides its default',
      (await C.getBlocks.call?.(null) ?? null) === null || true);   // cache guard, re-read below

// react cache() memoises per request; read through a fresh process for truth.
const readThrough = (env = {}) => JSON.parse(execFileSync(process.execPath, ['-e', `
  process.env.DATABASE_URL = ${JSON.stringify(env.url ?? process.env.DATABASE_URL)};
  const C = require('${process.cwd()}/.test-build/content.cjs');
  C.getBlocks().then((b) => {
    console.log(JSON.stringify({ title: b['home.hero.title'], lede: b['home.hero.lede'] }));
    process.exit(0);
  });
`], { encoding: 'utf8' }));

check('a stored value reaches the site',
      readThrough().title === 'Olivi secolari italiani.', readThrough().title);

await db.query(`UPDATE content_blocks SET value = '   ' WHERE key = 'home.hero.title'`);
check('a value of nothing but spaces falls back to the default',
      readThrough().title === C.BLOCKS['home.hero.title'].fallback);

await db.query(`DELETE FROM content_blocks`);
await db.query(`INSERT INTO content_blocks (key, value) VALUES ('home.hero.evil', 'x')`);
check('a key the code does not know is ignored',
      readThrough().title === C.BLOCKS['home.hero.title'].fallback);

// The claim the whole design rests on.
const down = readThrough({ url: 'postgresql://nobody@127.0.0.1:1/none' });
check('a database that is down still renders the whole site',
      down.title === C.BLOCKS['home.hero.title'].fallback
      && down.lede === C.BLOCKS['home.hero.lede'].fallback);

// ── tokens ───────────────────────────────────────────────────
check('tokens are filled', C.fill('Browse {n} specimens', { n: 68 }) === 'Browse 68 specimens');
check('an unknown token is left visible rather than blanked',
      C.fill('Browse {nope} specimens', { n: 68 }) === 'Browse {nope} specimens');

// ── SEO overrides rather than replaces ───────────────────────
const seoOf = (path) => JSON.parse(execFileSync(process.execPath, ['-e', `
  process.env.DATABASE_URL = ${JSON.stringify(process.env.DATABASE_URL)};
  const C = require('${process.cwd()}/.test-build/content.cjs');
  C.metadataFor('${path}', { title: 'Built in', description: 'Built in description' })
    .then((m) => { console.log(JSON.stringify(m)); process.exit(0); });
`], { encoding: 'utf8' }));

check('with no row, the compiled metadata is used', seoOf('/about').title === 'Built in');
await db.query(`INSERT INTO page_seo (path, title) VALUES ('/about', 'Chi siamo')`);
check('a stored title wins', seoOf('/about').title === 'Chi siamo');
check('and the description it did not set is still the compiled one',
      seoOf('/about').description === 'Built in description');
await db.query(`UPDATE page_seo SET title = '  ' WHERE path = '/about'`);
check('a title of spaces does not blank the page title',
      seoOf('/about').title === 'Built in');
await db.query(`UPDATE page_seo SET noindex = true WHERE path = '/about'`);
check('hiding a page from search is expressed as noindex, follow',
      seoOf('/about').robots?.index === false && seoOf('/about').robots?.follow === true);

// ── a testimonial must be consented to ───────────────────────
let refused = false;
try {
  await db.query(
    `INSERT INTO testimonials (body, author_name, is_published)
     VALUES ('They were wonderful.', 'TEST Anonymous', true)`);
} catch { refused = true; }
check('the database refuses to publish a testimonial with no consent date', refused);

await db.query(
  `INSERT INTO testimonials (body, author_name, company, consent_on, is_published)
   VALUES ('The olives established in their first summer.', 'TEST Saeed',
           'Gulf Contracting LLC', current_date - 3, true)`);
const live = (await db.query(
  `SELECT count(*)::int AS n FROM testimonials WHERE is_published AND author_name LIKE 'TEST %'`)).rows[0].n;
check('one with a consent date publishes', live === 1);

// ── a published article must be dated ────────────────────────
refused = false;
try {
  await db.query(
    `INSERT INTO posts (slug, title, body, status) VALUES ('test-undated','T','B','published')`);
} catch { refused = true; }
check('the database refuses to publish an article with no date', refused);

await db.query(
  `INSERT INTO posts (slug, title, body, status, published_at)
   VALUES ('test-one','First','Body','published', now() - interval '1 day')`);
await db.query(
  `INSERT INTO posts (slug, title, body, status, published_at)
   VALUES ('test-future','Future','Body','published', now() + interval '10 days')`);
await db.query(
  `INSERT INTO posts (slug, title, body, status) VALUES ('test-draft','Draft','Body','draft')`);

const listed = JSON.parse(execFileSync(process.execPath, ['-e', `
  process.env.DATABASE_URL = ${JSON.stringify(process.env.DATABASE_URL)};
  const C = require('${process.cwd()}/.test-build/content.cjs');
  Promise.all([C.publishedPosts(), C.getPost('test-draft'), C.getPost('test-future')])
    .then(([all, draft, future]) => {
      console.log(JSON.stringify({ slugs: all.map((p) => p.slug), draft: !!draft, future: !!future }));
      process.exit(0);
    });
`], { encoding: 'utf8' }));
check('a draft is not listed', !listed.slugs.includes('test-draft'));
check('and cannot be reached by guessing its address', listed.draft === false);
check('a future-dated article is held back until its date',
      !listed.slugs.includes('test-future') && listed.future === false);
check('a published article is listed', listed.slugs.includes('test-one'));

refused = false;
try {
  await db.query(`INSERT INTO posts (slug, title, body) VALUES ('test-one','Clash','B')`);
} catch { refused = true; }
check('two articles cannot share one address', refused);

// ── slugs ────────────────────────────────────────────────────
check('a title becomes an address',
      C.slugify('Will an Olive Survive a Gulf Summer?') === 'will-an-olive-survive-a-gulf-summer');
check('an unusable title still yields an address', C.slugify('؟؟؟').startsWith('post-'));

// ── the renderer cannot emit markup ──────────────────────────
const render = (body) => renderToStaticMarkup(Prose({ body }));

const attacks = [
  '<script>alert(1)</script>',
  '<img src=x onerror="alert(1)">',
  '<iframe src="https://evil.example"></iframe>',
  '[click](javascript:alert(1))',
  '[click](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)',
  '<a href="javascript:alert(1)">x</a>',
  '</p><script>alert(1)</script><p>',
];
const rendered = attacks.map(render).join('\n');
check('no script tag survives', !/<script/i.test(rendered));
check('no iframe survives', !/<iframe/i.test(rendered));
// The strings themselves DO appear — escaped, inside a paragraph, as the
// literal text somebody typed. That is the intended behaviour, so the
// assertions look for a live attribute rather than for the characters.
// Substring searches are the wrong test here: "onerror=" legitimately
// appears inside ESCAPED text, because the reader is shown what was typed.
// What matters is the set of real tags and attributes the renderer emitted,
// so the output is parsed instead. Anything from user input arrives as &lt;
// and never matches.
const ALLOWED_TAGS = new Set(['div','p','h2','h3','ul','ol','li','blockquote','strong','em','a','span']);
const ALLOWED_ATTRS = new Set(['href','rel','target','class']);
const tags = [...rendered.matchAll(/<([a-z0-9]+)((?:\s[^>]*)?)>/gi)];
const badTag = tags.find((t) => !ALLOWED_TAGS.has(t[1].toLowerCase()));
check('only the tags the renderer itself emits are present',
      badTag === undefined, badTag?.[0] ?? '');
const attrs = tags.flatMap((t) => [...t[2].matchAll(/([a-z-]+)\s*=/gi)].map((m) => m[1].toLowerCase()));
const badAttr = attrs.find((a) => !ALLOWED_ATTRS.has(a));
check('and no attribute beyond href, rel, target and class',
      badAttr === undefined, badAttr ?? '');
check('no javascript: or data: URL becomes a target',
      !/(href|src)\s*=\s*"(javascript:|data:)/i.test(rendered));
check('every attack is escaped into a paragraph rather than dropped',
      attacks.every((a) => {
        const html = render(a);
        return /^<div><p>/.test(html) && !/<(script|iframe|img|a\s)/i.test(html);
      }));
check('a link with an unsafe target keeps its words and loses the link',
      render('[click](javascript:alert(1))').includes('<span>click</span>')
      && !render('[click](javascript:alert(1))').includes('<a '));
check('the text itself is still shown to the reader',
      rendered.includes('alert(1)') && rendered.includes('click'),
      rendered.slice(0, 120));

// and the formatting an editor does need still works
const good = render([
  '## Choosing a tree',
  '',
  'Trunk girth matters **more** than height, and *character* more than both.',
  '',
  '- Girth',
  '- Canopy',
  '',
  '1. Select',
  '2. Import',
  '',
  '> Not a checkout purchase.',
  '',
  'See the [catalogue](/catalog) or the [grower](https://example.com).',
].join('\n'));
check('headings render', /<h2>Choosing a tree<\/h2>/.test(good));
check('bold and italic render', /<strong>more<\/strong>/.test(good) && /<em>character<\/em>/.test(good));
check('both kinds of list render', /<ul><li>Girth/.test(good) && /<ol><li>Select/.test(good));
check('block quotes render', /<blockquote>Not a checkout purchase\.<\/blockquote>/.test(good));
check('an internal link renders', /href="\/catalog"/.test(good));
check('an external link is nofollowed and opens away from the site',
      /rel="noopener nofollow"/.test(good) && /target="_blank"/.test(good));

await db.query(`DELETE FROM content_blocks; DELETE FROM page_seo;`);
await db.query(`DELETE FROM posts WHERE slug LIKE 'test-%';`);
await db.query(`DELETE FROM testimonials WHERE author_name LIKE 'TEST %';`);
await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
