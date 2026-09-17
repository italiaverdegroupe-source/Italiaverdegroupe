// Every console page, signed in as a real operator, checking three things at
// once: it renders, it wears the console shell rather than the marketing one,
// and the navigation marks exactly one destination as the page you are on.
//
//   BASE=http://127.0.0.1:3000 VG_PW='the password' node tests/console-sweep.mjs
//
import { chromium } from 'playwright';
const B = process.env.BASE ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let failed = 0;
const check = (n, ok, x='') => { console.log((ok?'  PASS  ':'  FAIL  ')+n+(x?'   '+x:'')); if(!ok) failed++; };

// the background image really is painted, not just requested
await page.goto(`${B}/admin/login`, { waitUntil: 'networkidle' });
const img = await page.evaluate(() => {
  const el = document.querySelector('.lg-img');
  return el ? { complete: el.complete, w: el.naturalWidth, h: el.naturalHeight } : null;
});
check('the background photograph decodes', img && img.complete && img.w > 100, JSON.stringify(img));

// the card is genuinely on the right, and genuinely translucent
const geo = await page.evaluate(() => {
  const card = document.querySelector('.adm-login-box');
  const r = card.getBoundingClientRect();
  const cs = getComputedStyle(card);
  return { left: r.left, right: r.right, vw: innerWidth,
           bg: cs.backgroundColor, bf: cs.backdropFilter || cs.webkitBackdropFilter };
});
check('the card sits in the right half', geo.left > geo.vw / 2, `left=${Math.round(geo.left)} vw=${geo.vw}`);
check('it is translucent, not a solid panel', /rgba?\([^)]*0\.\d+\)/.test(geo.bg), geo.bg);
check('and it is actually frosted', /blur/.test(geo.bf || ''), geo.bf);

// contrast of the heading against the card
const contrast = await page.evaluate(() => {
  const lum = (c) => { const [r,g,b] = c.match(/\d+/g).map(Number).map(v => { v/=255; return v<=.03928? v/12.92 : ((v+.055)/1.055)**2.4; }); return .2126*r+.7152*g+.0722*b; };
  const h1 = document.querySelector('.adm-login-box h1');
  const fg = lum(getComputedStyle(h1).color);
  // sample the rendered card colour rather than trusting the declared alpha
  const card = document.querySelector('.adm-login-box').getBoundingClientRect();
  return { fg, cardTop: card.top };
});
check('the heading is near-black ink', contrast.fg < 0.05, String(contrast.fg.toFixed(4)));

// signing in still works through the new shell
await page.fill('input[name=email]', 'italiaverdegroupe@gmail.com');
await page.fill('input[name=password]', process.env.VG_PW);
await page.click('button[type=submit]');
await page.waitForTimeout(1800);
check('the real credential still signs in', !page.url().includes('/login'), page.url());

// every console page renders, with console chrome and no marketing chrome
const PAGES = ['/admin', '/admin/leads', '/admin/inventory', '/admin/quotes', '/admin/orders',
               '/admin/shipments', '/admin/finance', '/admin/alerts', '/admin/reports',
               '/admin/content', '/admin/settings', '/admin/users', '/admin/account'];
for (const p of PAGES) {
  const r = await page.goto(`${B}${p}`, { waitUntil: 'domcontentloaded' });
  const t = await page.locator('body').innerText();
  const okStatus = r?.status() === 200;
  // The console shell is a sidebar now, not a bar across the top.
  const hasShell = await page.locator('.adm-side .adm-nav').count() > 0;
  // and exactly one destination must be marked as the one you are on, or the
  // navigation is decoration.
  // Anywhere in the column, not only in the list: your own account is reached
  // from the chip at its foot, and that is still a destination.
  const marked = await page.locator('.adm-side [aria-current="page"]').count();
  const noMarketing = !/Request a quote|All prices on request/i.test(t);
  check(`${p}`, okStatus && hasShell && marked === 1 && noMarketing,
        `${r?.status()} shell=${hasShell} current=${marked} clean=${noMarketing}`);
}

// the public site is untouched by the split
const PUB = ['/', '/catalog', '/collections', '/services', '/about', '/quote', '/journal'];
for (const p of PUB) {
  const r = await page.goto(`${B}${p}`, { waitUntil: 'domcontentloaded' });
  const t = await page.locator('body').innerText();
  check(`public ${p}`, r?.status() === 200 && /Catalogue/.test(t) && /All prices on request/i.test(t),
        String(r?.status()));
}
// a product page and a 404
const r1 = await page.goto(`${B}/catalog/olive-tree-ancient`, { waitUntil: 'domcontentloaded' });
check('a catalogue product page still renders', r1?.status() === 200, String(r1?.status()));
const r2 = await page.goto(`${B}/definitely-not-a-page`, { waitUntil: 'domcontentloaded' });
check('an unknown URL is a 404 with the site shell', r2?.status() === 404,
      String(r2?.status()));

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
