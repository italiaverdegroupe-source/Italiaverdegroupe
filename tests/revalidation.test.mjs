// Saving something in the console must not take the site off the internet.
//
//   BASE=http://127.0.0.1:3000 VG_USER=… VG_PW='…' node tests/revalidation.test.mjs
//
// THE DEFECT THIS EXISTS FOR. Every write in the console calls
// `revalidatePath('/[lang]', 'layout')` so a corrected paragraph appears on
// the public site straight away. That invalidates every prerendered page
// beneath the layout — and three of them, the catalogue specimen, the
// collection and the emirate page, had closed parameters
// (`dynamicParams = false`). A page whose parameters are closed cannot be
// re-rendered on demand, so from the moment anybody pressed Save it answered
// 404, and went on answering 404 until the container was next restarted.
//
// Two hundred and two specimen pages, eighteen collections and seven emirates
// — the entire public catalogue — one click away from disappearing, with
// nothing logged and nothing visibly wrong in the console. It was found by
// noticing that a test which had passed an hour earlier had started failing,
// and it would have been found in production by a customer.
//
// Run against a production build. `next dev` re-renders everything on every
// request and cannot show this at all.
import { chromium } from 'playwright';

const B = process.env.BASE ?? 'http://127.0.0.1:3000';
let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// One page per route that has a parameter in its path, in each language.
const PAGES = [
  '/catalog/agave-americana', '/collections/olive-trees', '/locations/dubai',
  '/ar/catalog/agave-americana', '/ar/collections/olive-trees', '/ar/locations/dubai',
  '/it/catalog/agave-americana', '/it/collections/olive-trees', '/it/locations/dubai',
];

const statuses = async () => {
  const out = {};
  for (const p of PAGES) out[p] = (await fetch(B + p, { redirect: 'manual' })).status;
  return out;
};

const before = await statuses();
const brokenBefore = Object.entries(before).filter(([, s]) => s !== 200);
check('every parameterised page answers before anything is saved',
  brokenBefore.length === 0, brokenBefore.map(([p, s]) => `${p} ${s}`).join(' | '));

// ── press Save, for real ─────────────────────────────────────
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage();
await page.goto(`${B}/admin/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[name=email]', process.env.VG_USER);
await page.fill('input[name=password]', process.env.VG_PW);
await page.locator('button[type=submit]').click();
await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });

// Settings, submitted unchanged: the point is the revalidation, not the edit.
await page.goto(`${B}/admin/settings`, { waitUntil: 'domcontentloaded' });
await page.locator('form').filter({ has: page.locator('[name=licenceNumber]') })
          .locator('button[type=submit]').first().click();
await page.waitForLoadState('networkidle');
await browser.close();

const after = await statuses();
const broken = Object.entries(after).filter(([, s]) => s !== 200);
check('THE POINT: and every one of them still answers after Save settings',
  broken.length === 0, broken.map(([p, s]) => `${p} ${s}`).join(' | '));

// ── and the pages that should 404 still do ───────────────────
// Opening the parameters is what fixed the above; it must not have made every
// mistyped URL into a page.
for (const p of ['/catalog/not-a-tree', '/collections/not-a-family',
                 '/locations/not-an-emirate', '/ar/catalog/not-a-tree']) {
  const r = await fetch(B + p, { redirect: 'manual' });
  check(`${p} is still a 404`, r.status === 404, String(r.status));
}

console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
