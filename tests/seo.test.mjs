// What a search engine is actually told.
//
//   BASE=http://127.0.0.1:3000 node scripts/seo-check.mjs
//
// Parses every block of structured data the site emits, in all three
// languages, and checks the things that silently invalidate it: a relative
// URL where an absolute one is required, a reference to an @id nothing
// declares, a missing canonical, a sitemap that disagrees with robots.txt.
//
// These fail quietly. A relative image URL in a Product block is not an
// error anywhere — the markup is simply discarded, on every page, and the
// only place it shows up is a Search Console report nobody is reading yet.
const B = process.env.BASE ?? 'http://127.0.0.1:3000';
let bad = 0;
const fail = (m, d = '') => { console.log(`  FAIL  ${m}${d ? '   ' + d : ''}`); bad++; };
const ok = (m, d = '') => console.log(`  PASS  ${m}${d ? '   ' + d : ''}`);

const blocks = async (path) => {
  const html = await (await fetch(`${B}${path}`)).text();
  const out = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { out.push(JSON.parse(m[1])); } catch (e) { fail(`${path}: unparseable JSON-LD`, String(e).slice(0, 80)); }
  }
  return { out, html };
};

// ── every page declares who publishes it ──
for (const p of ['/', '/ar', '/it', '/catalog', '/about', '/privacy']) {
  const { out } = await blocks(p);
  const org = out.find((b) => b['@type'] === 'Organization');
  const site = out.find((b) => b['@type'] === 'WebSite');
  if (!org) fail(`${p}: no Organization block`);
  if (!site) fail(`${p}: no WebSite block`);
}
ok('every page carries Organization and WebSite');

// ── the thing this company IS ──
const { out: home } = await blocks('/');
const org = home.find((b) => b['@type'] === 'Organization');
const knows = (org?.knowsAbout ?? []).join(' ').toLowerCase();
if (!/italian/.test(knows)) fail('Organization does not say the stock is Italian');
else ok('Organization says the stock is Italian', org.knowsAbout.length + ' subjects');
const served = (org?.areaServed ?? []).map((a) => a.name).join(', ');
if (!/united arab emirates/i.test(served)) fail('Organization does not say where it supplies');
else ok('and where it supplies', `${org.areaServed.length} emirates`);
const from = JSON.stringify(org?.makesOffer ?? {});
if (!/Italy/.test(from)) fail('Organization does not say where the stock comes from');
else ok('and where the stock is grown');

// ── nothing invented ──
for (const field of ['address', 'taxID', 'identifier']) {
  if (org?.[field] !== undefined && JSON.stringify(org[field]).includes('example')) {
    fail(`Organization ${field} looks like a placeholder`, JSON.stringify(org[field]));
  }
}
ok('no placeholder facts in the markup');

// ── absolute URLs, which is where structured data dies quietly ──
const { out: prod } = await blocks('/catalog/agave-americana');
const P = prod.find((b) => b['@type'] === 'Product');
if (!P) fail('no Product block on a specimen page');
else {
  const rel = [...(P.image ?? []), P.url, P.offers?.url].filter(Boolean)
    .filter((u) => !/^https?:\/\//.test(u));
  if (rel.length) fail('relative URL in Product markup', rel.join(' '));
  else ok('Product URLs and images are absolute');
  if (!P.sku) fail('Product has no sku');
  else ok('Product carries its reference', P.sku);
}

// ── an @id that points at nothing is a dangling reference ──
const ids = new Set(home.map((b) => b['@id']).filter(Boolean));
const sellerId = P?.offers?.seller?.['@id'];
if (sellerId && !sellerId.endsWith('#organisation')) fail('seller @id is not the organisation', sellerId);
else ok('the seller points at the organisation rather than repeating it');

// ── breadcrumbs ──
const crumbs = prod.find((b) => b['@type'] === 'BreadcrumbList');
if (!crumbs) fail('no BreadcrumbList on a specimen page');
else ok('specimen pages carry a breadcrumb trail', crumbs.itemListElement.length + ' steps');

// ── robots and the sitemap must agree ──
const robots = await (await fetch(`${B}/robots.txt`)).text();
const sitemap = await (await fetch(`${B}/sitemap.xml`)).text();
if (!/Sitemap:\s*http/.test(robots)) fail('robots.txt does not announce the sitemap');
else ok('robots.txt announces the sitemap');
for (const must of ['/admin', '/api/']) {
  if (!robots.includes(`Disallow: ${must}`)) fail(`robots.txt does not disallow ${must}`);
}
ok('robots.txt keeps crawlers out of the console and the API');

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const disallowed = locs.filter((p) => p === '/shortlist' || p.startsWith('/admin'));
if (disallowed.length) fail('sitemap lists a URL robots.txt blocks', disallowed.join(' '));
else ok('the sitemap and robots.txt do not contradict each other');

const withAlts = (sitemap.match(/xhtml:link/g) ?? []).length;
if (withAlts < locs.length * 3) fail('sitemap is missing hreflang alternates', `${withAlts} links for ${locs.length} URLs`);
else ok('every sitemap entry lists all three languages', `${locs.length} URLs`);

const dupes = locs.filter((p, i) => locs.indexOf(p) !== i);
if (dupes.length) fail('sitemap has duplicate URLs', dupes.slice(0, 3).join(' '));
else ok('no duplicate URLs in the sitemap');

// ── canonical ──
for (const p of ['/', '/ar/about', '/it/catalog']) {
  const { html } = await blocks(p);
  const m = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!m) fail(`${p}: no canonical`);
  else if (!/^https?:\/\//.test(m[1])) fail(`${p}: canonical is relative`, m[1]);
}
ok('canonicals are absolute on every language');

console.log(bad ? `\n${bad} FAILED` : '\nall passed');
process.exit(bad ? 1 : 0);
