// The homepage, checked for the things that are easy to get wrong and hard
// to notice: a borrowed endorsement, a number that is not the real count, a
// hero that does not reach the edges, and sideways scroll at any width.
//
//   BASE=http://127.0.0.1:3000 node tests/home-audit.mjs
//
import { chromium } from 'playwright';
const B = process.env.BASE ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let failed = 0;
const check = (n, ok, x='') => { console.log((ok?'  PASS  ':'  FAIL  ')+n+(x?'   '+x:'')); if(!ok) failed++; };

// no borrowed endorsements, anywhere on the site
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const p of ['/', '/about', '/services', '/catalog', '/collections', '/quote', '/journal']) {
  const r = await page.goto(`${B}${p}`, { waitUntil: 'domcontentloaded' });
  const html = (await page.content()).toLowerCase();
  const claims = ['emaar', 'nakheel', 'aldar', 'meraas', 'jumeirah', 'trusted by', 'our clients', 'as seen in'];
  // "Palm Jumeirah" is a place in Dubai. A testimonial saying where a job was
  // is not a claim that a hotel group endorsed anybody, and flagging it
  // trains whoever runs this to ignore the check — which is the failure mode
  // that matters for a rule whose whole job is to catch one specific lie.
  const scrub = html.replaceAll('palm jumeirah', 'palm <place>');
  const found = claims.filter((w) => scrub.includes(w));
  check(`${p} makes no borrowed endorsement`, r?.status() === 200 && found.length === 0,
        found.join(',') || String(r?.status()));
}

// the hero is built and honest
await page.goto(B, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const hero = await page.evaluate(() => {
  const img = document.querySelector('.hero-img');
  const seal = document.querySelector('.hero-seal');
  const feat = document.querySelector('.hero-feat-name');
  const proof = [...document.querySelectorAll('.proof-list li strong')].map((e) => e.textContent);
  const assure = [...document.querySelectorAll('.hero-assure li span')].map((e) => e.textContent);
  const media = document.querySelector('.hero-media').getBoundingClientRect();
  const h1 = document.querySelector('.hero h1').getBoundingClientRect();
  const veil = !!document.querySelector('.hero-veil');
  // The scrim is on ::before now, not on the bar's own background.
  const hdrBg = getComputedStyle(document.querySelector('.hdr'), '::before').backgroundImage;
  const heroSrc = document.querySelector('.hero-img')?.getAttribute('src') ?? '';
  return {
    imgOk: !!img && img.complete && img.naturalWidth > 100,
    seal: !!seal, feat: feat?.textContent ?? '', proof, assure, veil,
    headerFloats: hdrBg !== 'none',
    heroSrc,
    mediaLeft: Math.round(media.left), mediaRight: Math.round(media.right),
    mediaTop: Math.round(media.top), h1Left: Math.round(h1.left), vw: innerWidth,
  };
});
check('the hero photograph decodes', hero.imgOk);
check('the seal is there', hero.seal);
check('the featured collection is the olive line', /olive/i.test(hero.feat), hero.feat);
check('four assurances', hero.assure.length === 4, hero.assure.join(' | '));
check('the proof strip shows four checkable numbers', hero.proof.length === 4, hero.proof.join(' '));
check('68 specimens is the real catalogue count', hero.proof[0] === '68', hero.proof[0]);
check('the photograph spans the whole viewport, not half of it',
      hero.mediaLeft <= 1 && hero.mediaRight >= hero.vw - 1,
      `${hero.mediaLeft}..${hero.mediaRight} of ${hero.vw}`);
check('it starts at the very top, under the header',
      hero.mediaTop <= 1, String(hero.mediaTop));
check('a wash carries the copy instead of a hard seam', hero.veil);
check('the header floats over the hero rather than sitting on a bar',
      hero.headerFloats);
check('the headline sits in the left third', hero.h1Left < hero.vw * 0.35,
      `${hero.h1Left} of ${hero.vw}`);
check('the hero is the brand photograph, not a catalogue specimen',
      /%2Fbrand%2Fhero-terrace|\/brand\/hero-terrace/.test(hero.heroSrc), hero.heroSrc);

// responsive sanity
for (const [w, h, label] of [[320,568,'320'],[390,844,'390'],[768,1024,'768'],[1280,800,'1280'],[2560,1440,'2560']]) {
  const p2 = await browser.newPage({ viewport: { width: w, height: h } });
  await p2.goto(B, { waitUntil: 'domcontentloaded' });
  await p2.waitForTimeout(500);
  const m = await p2.evaluate(() => {
    const brand = document.querySelector('.brand-txt strong').getBoundingClientRect();
    return {
      hScroll: document.documentElement.scrollWidth > innerWidth + 1,
      brandLines: Math.round(brand.height / parseFloat(getComputedStyle(document.querySelector('.brand-txt strong')).fontSize) * 10) / 10,
    };
  });
  check(`${label}px: no sideways scroll, brand on one line`, !m.hScroll && m.brandLines < 1.6,
        `hScroll=${m.hScroll} brandRatio=${m.brandLines}`);
  await p2.close();
}

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
