// The whole business, driven through the screens.
//
//   BASE=http://127.0.0.1:3000 VG_USER=… VG_PW='…' node tests/walkthrough.mjs
//
// A real run through the whole business: a visitor sends an enquiry, it is
// quoted, the quotation becomes an order, the order is invoiced, and each of
// those is then deleted and put back. Nothing is inserted with SQL — every
// step goes through the screens somebody will actually use tomorrow.
import { chromium } from 'playwright';
const B = process.env.BASE ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

let failed = 0;
const check = (n, ok, x='') => { console.log((ok?'  PASS  ':'  FAIL  ')+n+(x?'   '+x:'')); if(!ok) failed++; };
const step = (n) => console.log(`\n── ${n}`);

// ── 1. a visitor sends an enquiry ────────────────────────────
step('the public enquiry form');
await page.goto(`${B}/quote`, { waitUntil: 'domcontentloaded' });
const stamp = Date.now().toString().slice(-6);
const who = `Walkthrough ${stamp}`;
await page.fill('input[name=name]', who);
await page.fill('input[name=email]', `walk${stamp}@example.invalid`);
const fields = await page.evaluate(() =>
  [...document.querySelectorAll('form [name]')].map(e => `${e.tagName}:${e.name}`));
for (const sel of ['input[name=company]', 'input[name=phone]']) {
  if (await page.locator(sel).count()) await page.fill(sel, sel.includes('phone') ? '+971500000000' : `Co ${stamp}`);
}
if (await page.locator('select[name=emirate]').count()) await page.selectOption('select[name=emirate]', { index: 1 });
if (await page.locator('textarea[name=message]').count())
  await page.fill('textarea[name=message]', 'Six mature olives for a villa courtyard in Dubai, delivered and planted.');
if (await page.locator('input[name=consent]').count()) await page.check('input[name=consent]');

// The public form is rate limited to six enquiries per connection per ten
// minutes, which is correct and which a second run of this suite will hit.
// A throttle is reported as a throttle rather than as a broken form.
const posted = page.waitForResponse(
  (r) => r.url().includes('/api/quote') && r.request().method() === 'POST',
  { timeout: 20000 }).catch(() => null);
await page.locator('form button[type=submit]').last().click();
const res = await posted;
const status = res?.status() ?? 0;
if (status === 429) {
  console.log('  NOTE  the public form is rate limiting this connection — '
            + 'correct behaviour, so the rest of the run uses the newest lead');
} else {
  check('the enquiry is accepted', status === 200 || status === 201, String(status));
  await page.waitForFunction(
    () => /thank|received|شكرا|grazie/i.test(document.body.innerText), null, { timeout: 15000 })
    .catch(() => {});
  check('and the page says so rather than sitting there',
    /thank|received|شكرا|grazie/i.test(await page.locator('body').innerText()));
}
const throttled = status === 429;

// ── 2. it arrives in the console ─────────────────────────────
step('the enquiry in the console');
await page.goto(`${B}/admin/login`, { waitUntil: 'domcontentloaded' });
await page.fill('input[name=email]', process.env.VG_USER);
await page.fill('input[name=password]', process.env.VG_PW);
await page.locator('button[type=submit]').click();
await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 });

await page.goto(`${B}/admin/leads`, { waitUntil: 'domcontentloaded' });
if (!throttled) {
  check('the new enquiry is on the leads list',
    (await page.locator('body').innerText()).includes(who));
}
const leadRef = await page.locator('table.adm-t tbody tr').first().locator('td').first().innerText();
check('it has a reference', /^LEAD-|^ENQ-|^[A-Z]{2,4}-\d+/.test(leadRef.trim()), leadRef);

await page.goto(`${B}/admin/leads/${leadRef.trim()}`, { waitUntil: 'domcontentloaded' });
const leadName = await page.locator('h1').innerText();
if (!throttled) check('the lead opens', leadName.includes(who));
check('and offers a delete', await page.locator('.adm-danger form.del').count() === 1);

// ── 3. a quotation ───────────────────────────────────────────
step('raising a quotation');
await page.goto(`${B}/admin/quotes`, { waitUntil: 'domcontentloaded' });
await page.fill('input[name=lead_reference]', leadRef.trim()).catch(() => {});
await page.fill('input[name=customer_name]', leadName).catch(() => {});
await page.locator('form').filter({ has: page.locator('input[name=customer_name]') })
          .locator('button[type=submit]').click();
await page.waitForLoadState('networkidle');
const quoteCode = (page.url().match(/\/admin\/quotes\/([^/?]+)/) ?? [])[1];
check('a quotation is created and opened', Boolean(quoteCode), page.url());

if (quoteCode) {
  // add a line
  const addLine = page.locator('form').filter({ has: page.locator('input[name=unit_price]') });
  check('a draft quotation offers an add-line form', await addLine.count() === 1,
    `${await addLine.count()}`);
  if (await addLine.count()) {
    await addLine.locator('input[name=description]').fill('Olea europaea, 250–300 cm, field grown');
    await addLine.locator('input[name=quantity]').fill('6');
    await addLine.locator('input[name=unit_price]').fill('4200');
    await addLine.locator('button[type=submit]').click();
    await page.waitForLoadState('networkidle');
    await page.goto(`${B}/admin/quotes/${quoteCode}`, { waitUntil: 'networkidle' });
  }
  const qtext = await page.locator('body').innerText();
  check('the line is on the quotation', /4,?200/.test(qtext) && /Olea/.test(qtext));
  check('and the total is six times it', /25,?200/.test(qtext), (qtext.match(/2[45],?\d\d\d/g)||[]).join(' '));

  // the printed document
  const r = await page.goto(`${B}/admin/quotes/${quoteCode}/print`, { waitUntil: 'domcontentloaded' });
  check('the quotation document renders', r?.status() === 200);
  const sheet = await page.locator('.sheet').innerText();
  check('it carries the company name', /Verde Garden/i.test(sheet));
  check('THE POINT: it shows no licence or TRN while none is set',
    !/TRN\s*[:\-]?\s*\S/.test(sheet) && !/Licence\s*[:\-]?\s*\S/i.test(sheet),
    (sheet.match(/.*(TRN|Licence).*/gi) || []).join(' | '));
  check('and no placeholder dash where a missing field would be',
    !/TRN\s*—/.test(sheet) && !/Licence\s*—/i.test(sheet));
}

// ── 4. an order ──────────────────────────────────────────────
step('turning it into an order');
let orderCode = null;
if (quoteCode) {
  await page.goto(`${B}/admin/quotes/${quoteCode}`, { waitUntil: 'domcontentloaded' });
  // a quotation must be accepted before it can become an order
  const stForm = page.locator('form').filter({ has: page.locator('select[name=status]') });
  if (await stForm.count()) {
    check('the status select is set to the quotation own status, not the first option',
      await stForm.locator('select[name=status]').inputValue() === 'draft',
      await stForm.locator('select[name=status]').inputValue());
    await stForm.locator('select[name=status]').selectOption('accepted');
    await stForm.locator('button[type=submit]').first().click();
    await page.waitForLoadState('networkidle');
    await page.goto(`${B}/admin/quotes/${quoteCode}`, { waitUntil: 'domcontentloaded' });
    check('accepting the quotation sticks',
      /accepted|accettat|مقبول/i.test(await page.locator('.adm-sub').first().innerText()
        + await page.locator('body').innerText()));
  }
  await page.goto(`${B}/admin/orders`, { waitUntil: 'domcontentloaded' });
  const conv = page.locator('form').filter({ has: page.locator('input[name=quote_code]') });
  if (await conv.count()) {
    await conv.locator('input[name=quote_code]').fill(quoteCode);
    await conv.locator('button[type=submit]').first().click();
    await page.waitForLoadState('networkidle');
  }
  orderCode = (page.url().match(/\/admin\/orders\/([^/?]+)/) ?? [])[1] ?? null;
  check('an order is created from the quotation', Boolean(orderCode), page.url());
  if (!orderCode) console.log('     ' + (await page.locator('body').innerText()).slice(0, 300).replace(/\n/g, ' '));
}

// ── 5. an invoice ────────────────────────────────────────────
step('raising an invoice');
let invCode = null;
if (orderCode) {
  await page.goto(`${B}/admin/finance`, { waitUntil: 'domcontentloaded' });
  const raise = page.locator('form').filter({ has: page.locator('input[name=order_code]') });
  if (await raise.count()) {
    await raise.locator('input[name=order_code]').fill(orderCode);
    await raise.locator('button[type=submit]').first().click();
    await page.waitForLoadState('networkidle');
  }
  // The invoice raised for THIS order, found through the order column rather
  // than by sorting codes — the seeded fixtures sort after the real ones.
  const row = page.locator('table.adm-t tbody tr').filter({ hasText: orderCode });
  invCode = (await row.first().locator('td').first().innerText().catch(() => '')).trim() || null;
  check('an invoice was raised against this order', /^INV-/.test(invCode ?? ''), String(invCode));
}
if (invCode) {
  const r = await page.goto(`${B}/admin/finance/${invCode}/print`, { waitUntil: 'domcontentloaded' });
  check('the invoice document renders', r?.status() === 200);
  const sheet = await page.locator('.sheet').innerText();
  check('it is headed as an invoice', /invoice|fattura|فاتورة/i.test(sheet));
  check('THE POINT: no VAT line while the company is not registered',
    !/\bVAT\b/i.test(sheet) || /exclusive of VAT/i.test(sheet),
    (sheet.match(/.*VAT.*/gi) || []).join(' | '));
  check('and no licence or TRN invented for it',
    !/TRN\s*[:\-]?\s*\d/.test(sheet), (sheet.match(/.*TRN.*/gi) || []).join(' | '));
}

// ── 5b. the places reserved for facts that do not exist yet ──
//
// The trade licence, the TRN and the registered address have not been issued.
// The requirement is not that the documents pretend otherwise — it is that the
// day somebody types them into /admin/settings, they appear on the next sheet
// with no deploy. Proved by typing them in, reloading the document, and taking
// them back out again.
step('the licence, TRN and address slots');
if (invCode && quoteCode) {
  const before = {};
  await page.goto(`${B}/admin/settings`, { waitUntil: 'domcontentloaded' });
  const form = page.locator('form').filter({ has: page.locator('[name=licenceNumber]') });
  const FILL = {
    licenceNumber: 'CN-9999999',
    trn: '100999999900003',
    address: 'Warehouse 7, Al Quoz Industrial 3',
    city: 'Dubai',
    country: 'United Arab Emirates',
  };
  for (const [k, v] of Object.entries(FILL)) {
    const el = form.locator(`[name=${k}]`);
    before[k] = await el.inputValue();
    await el.fill(v);
  }
  await form.locator('button[type=submit]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  for (const [path, what] of [[`/admin/quotes/${quoteCode}/print`, 'quotation'],
                              [`/admin/finance/${invCode}/print`, 'invoice']]) {
    await page.goto(`${B}${path}`, { waitUntil: 'domcontentloaded' });
    const sheet = await page.locator('.sheet').innerText();
    check(`THE POINT: the ${what} prints the licence the moment it exists`,
      sheet.includes('CN-9999999'), (sheet.match(/.*licence.*/i) || []).join(' | '));
    check(`the ${what} prints the TRN`, sheet.includes('100999999900003'));
    check(`the ${what} prints the registered address`,
      sheet.includes('Al Quoz Industrial 3') && sheet.includes('Dubai'));
  }

  // and back out, so the next run starts where this one did
  await page.goto(`${B}/admin/settings`, { waitUntil: 'domcontentloaded' });
  for (const [k, v] of Object.entries(before)) {
    await page.locator('form').filter({ has: page.locator('[name=licenceNumber]') })
              .locator(`[name=${k}]`).fill(v);
  }
  await page.locator('form').filter({ has: page.locator('[name=licenceNumber]') })
            .locator('button[type=submit]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await page.goto(`${B}/admin/finance/${invCode}/print`, { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  const empty = await page.locator('.sheet').innerText();
  check('and the slot empties again rather than keeping a stale number',
    !empty.includes('CN-9999999') && !empty.includes('100999999900003'));
  check('leaving no label with nothing beside it',
    !/licence\s*[—:]?\s*$/im.test(empty) && !/TRN\s*[—:]?\s*$/im.test(empty));
}

// ── 6. deleting, and putting back ────────────────────────────
step('the bin');
await page.goto(`${B}/admin/leads/${leadRef.trim()}`, { waitUntil: 'domcontentloaded' });
page.on('dialog', (d) => d.accept());
await page.locator('.adm-danger button').click();
await page.waitForLoadState('networkidle');
check('deleting returns to the list', page.url().includes('/admin/leads'), page.url());
check('THE POINT: the deleted lead is gone from the live list',
  !(await page.locator('table.adm-t').innerText().catch(() => '')).includes(leadRef.trim()));

await page.goto(`${B}/admin/leads?deleted=1`, { waitUntil: 'domcontentloaded' });
check('and it is in the bin', (await page.locator('body').innerText()).includes(leadRef.trim()));

await page.goto(`${B}/admin/leads/${leadRef.trim()}`, { waitUntil: 'domcontentloaded' });
const banner = await page.locator('.del-gone').innerText().catch(() => '');
check('the record says when it was deleted and by whom',
  /deleted/i.test(banner) && banner.includes(process.env.VG_USER), banner.slice(0, 90).replace(/\n/g,' '));
check('an owner is offered a permanent removal', /for good|definitiv|نهائي/i.test(banner));

await page.locator('.del-gone button').first().click();   // Restore
await page.waitForLoadState('networkidle');
await page.goto(`${B}/admin/leads`, { waitUntil: 'domcontentloaded' });
check('restoring puts it back', (await page.locator('body').innerText()).includes(leadRef.trim()));

if (invCode) {
  await page.goto(`${B}/admin/finance`, { waitUntil: 'domcontentloaded' });
  const row = page.locator('table.adm-t tbody tr').filter({ hasText: invCode });
  check('an unpaid invoice offers a delete', await row.locator('form.del button').count() > 0);
}

// ── 7. nothing broke in the browser ──────────────────────────
step('the console');
check('no page threw in the browser', errors.length === 0, errors.slice(0, 3).join(' | '));

console.log('\n' + (failed ? `${failed} FAILED` : 'all passed'));
console.log(`lead=${leadRef?.trim()} quote=${quoteCode} order=${orderCode} invoice=${invCode}`);
await browser.close();
process.exit(failed ? 1 : 0);
