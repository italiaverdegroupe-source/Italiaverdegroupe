// The shortlist, driven through a real browser, because everything that can go
// wrong with it is a browser thing: storage that throws, a button nested in a
// link that navigates instead of adding, a count that does not move until you
// reload, and a list that survives a page change.
//
//   BASE=http://127.0.0.1:3000 node tests/shortlist.test.mjs
//
// Needs a running server and a database (the last check reads the row back).
import { chromium } from 'playwright';
import pg from '../node_modules/pg/lib/index.js';

const B = process.env.BASE ?? 'http://127.0.0.1:3000';
const DB = process.env.DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5433/verdegarden';

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(`${B}/catalog`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(700);

// ── adding from the grid must not navigate ───────────────────
const firstAdd = page.locator('.spec-add .sl-btn').first();
check('every card carries an add button', (await page.locator('.spec-add .sl-btn').count()) > 10,
  String(await page.locator('.spec-add .sl-btn').count()));

const urlBefore = page.url();
await firstAdd.click();
await page.waitForTimeout(250);
check('THE POINT: adding from a card does not navigate to the specimen',
  page.url() === urlBefore, page.url());
check('the button says it is on the list now',
  (await firstAdd.getAttribute('class'))?.includes('on') === true);

// ── the count appears without a reload ───────────────────────
check('the running count appears immediately, with no reload',
  (await page.locator('.slb').count()) === 1);
check('and reads one specimen', /1 specimen\b/.test(await page.locator('.slb').innerText()));

// ── a second, different specimen ─────────────────────────────
await page.locator('.spec-add .sl-btn').nth(3).click();
await page.waitForTimeout(250);
check('a second specimen is counted separately',
  /2 specimens/.test(await page.locator('.slb').innerText()),
  await page.locator('.slb').innerText());

// ── it survives a navigation ─────────────────────────────────
await page.goto(`${B}/about`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
check('the list survives moving to another page',
  /2 specimens/.test(await page.locator('.slb').innerText()));

// ── the shortlist page ───────────────────────────────────────
await page.goto(`${B}/shortlist`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
check('the shortlist page lists both', (await page.locator('.sl-items li').count()) === 2,
  String(await page.locator('.sl-items li').count()));
check('the floating count hides on the page it points at',
  (await page.locator('.slb').count()) === 0);

// quantity
await page.locator('.sl-qty input').first().fill('7');
await page.locator('.sl-qty input').first().dispatchEvent('change');
await page.waitForTimeout(300);
check('a quantity change is kept', /8 plants in total/.test(await page.locator('.sl-total').innerText()),
  await page.locator('.sl-total').innerText());

// removing
await page.locator('.sl-remove').nth(1).click();
await page.waitForTimeout(300);
check('removing one leaves the other', (await page.locator('.sl-items li').count()) === 1);

// ── send it ──────────────────────────────────────────────────
const stamp = `sl-e2e-${Date.now()}@example.com`;
await page.fill('#sl-name', 'Shortlist E2E');
await page.fill('#sl-email', stamp);
await page.fill('#sl-emirate', 'Dubai');
await page.click('.sl-send');
await page.waitForTimeout(2500);

const body = await page.locator('body').innerText();
const ref = body.match(/VG-[A-Z0-9]{6,}/)?.[0] ?? null;
check('sending returns a reference', ref !== null, ref ?? body.slice(0, 120));
check('and the list is emptied afterwards',
  (await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('vg.shortlist.v1') || '[]').length; }
    catch { return -1; }
  })) === 0);

// ── what landed in the database ──────────────────────────────
const db = new pg.Client({ connectionString: DB });
await db.connect();
const { rows } = await db.query(
  'SELECT reference, product_ref, items, message, source FROM leads WHERE email = $1', [stamp]);
check('exactly one lead was created, not one per specimen', rows.length === 1, String(rows.length));
if (rows.length === 1) {
  const r = rows[0];
  check('the specimens are stored as a structured snapshot',
    Array.isArray(r.items) && r.items.length === 1 && r.items[0].qty === 7,
    JSON.stringify(r.items));
  check('product_ref still holds the first reference, so old console links work',
    typeof r.product_ref === 'string' && r.product_ref.length > 0, String(r.product_ref));
  // The message is the human's note, NOT a re-typed copy of the table — that
  // put the same list on the console screen twice. The written-out version
  // rides on the notification instead, so an email is still self-contained.
  check('the message does not duplicate the table',
    !/×/.test(r.message ?? ''), (r.message ?? '(empty)').slice(0, 60));
  check('the source records where it came from', r.source === 'shortlist', String(r.source));
}
await db.query('DELETE FROM leads WHERE email = $1', [stamp]);

// ── a corrupt list must not break the page ───────────────────
await page.goto(`${B}/catalog`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('vg.shortlist.v1', '{"not":"an array"}'));
await page.goto(`${B}/shortlist`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
check('a corrupt stored list renders as empty rather than throwing',
  /Nothing on your list yet/.test(await page.locator('body').innerText()));

await page.evaluate(() => localStorage.setItem('vg.shortlist.v1', '[{"ref":"X","slug":"x","qty":-9,"name":123}]'));
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
const qty = await page.locator('.sl-qty input').first().inputValue().catch(() => null);
check('a hand-edited negative quantity is repaired, not trusted', qty === '1', String(qty));

await db.end();
await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
