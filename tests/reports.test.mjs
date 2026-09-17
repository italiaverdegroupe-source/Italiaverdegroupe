// The reports, and the one thing that makes a report worse than no report:
// splitting one row into two and letting somebody conclude the wrong thing.
//
//   node tests/reports.test.mjs
//
// Every grouping key on this page is free text off a form — a channel name, an
// emirate, a customer's company. "Direct" and "direct" are the same channel,
// "dubai" and "Dubai" the same emirate, and a customer who is entered twice
// with different capitals is one customer who orders twice, not two who order
// once. The overview already learned this; these queries had not.
//
// Needs a database. No server, no browser.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const R = require('../.test-build/reports.cjs');

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── a clean slate of our own ─────────────────────────────────
const wipe = async () => {
  await db.query(`DELETE FROM order_items WHERE order_id IN
                    (SELECT id FROM orders WHERE code LIKE 'ORD-RPT%')`);
  await db.query(`DELETE FROM orders WHERE code LIKE 'ORD-RPT%'`);
  await db.query(`DELETE FROM leads WHERE reference LIKE 'RPT-%'`);
};
await wipe();

const order = async (code, company, emirate, amount) => {
  const { rows: [o] } = await db.query(
    `INSERT INTO orders (code, customer_name, customer_company, emirate, status, confirmed_on)
     VALUES ($1, 'Someone', $2, $3, 'confirmed', current_date) RETURNING id`,
    [code, company, emirate]);
  await db.query(
    `INSERT INTO order_items (order_id, product_ref, description, quantity, unit_price)
     VALUES ($1, 'VG-OL-001', 'Olive', 1, $2)`, [o.id, amount]);
  return o.id;
};

// Names nothing else in the database uses, because these assertions are about
// how many rows come back and a suite that shares a database with another
// suite's fixtures measures that other suite instead.
const CO = 'Rpttest Landscaping LLC';
const EM = 'Rpttest Emirate';
const baseline = (await R.byEmirate()).find((r) => /not recorded/i.test(r.emirate));
const blankBefore = baseline ? Number(baseline.orders) : 0;

// The same customer, the same emirate, typed by three different people.
await order('ORD-RPT1', CO, EM, 1000);
await order('ORD-RPT2', CO.toLowerCase(), EM.toLowerCase(), 500);
await order('ORD-RPT3', `  ${CO}  `, ` ${EM} `, 250);

const cust = (await R.byCustomer()).filter((r) => /rpttest/i.test(r.customer));
check('THE POINT: one customer typed three ways is one customer',
  cust.length === 1, cust.map((r) => `${r.customer}=${r.revenue}`).join(' | '));
if (cust.length === 1) {
  check('with all three orders against them', cust[0].orders === '3', cust[0].orders);
  check('and all of the revenue, not a third of it',
    Number(cust[0].revenue) === 1750, cust[0].revenue);
  check('labelled with a real spelling rather than a folded one',
    /LLC/.test(cust[0].customer), cust[0].customer);
}

const emir = (await R.byEmirate()).filter((r) => /rpttest/i.test(r.emirate));
check('THE POINT: an emirate typed in two cases is one emirate',
  emir.length === 1, emir.map((r) => `${r.emirate}=${r.orders}`).join(' | '));
if (emir.length === 1) {
  check('spelled the way an emirate is spelled', emir[0].emirate === EM, emir[0].emirate);
  check('holding all three orders', emir[0].orders === '3', emir[0].orders);
}

// An emirate left blank is not an emirate called "".
await order('ORD-RPT4', 'Rpttest Blank Co', '', 100);
await order('ORD-RPT5', 'Rpttest Blank Co', null, 100);
const blanks = (await R.byEmirate()).filter((r) => /not recorded/i.test(r.emirate));
check('THE POINT: an emirate left blank and one never filled in are the same nothing',
  blanks.length === 1 && Number(blanks[0].orders) === blankBefore + 2,
  blanks.map((r) => `${r.emirate}=${r.orders}`).join(' | ') + ` (was ${blankBefore})`);

// ── channels ─────────────────────────────────────────────────
const lead = (ref, source) => db.query(
  `INSERT INTO leads (reference, enquiry_type, name, email, source, status)
   VALUES ($1, 'product', 'Tester', $2, $3, 'new')`,
  [ref, `${ref.toLowerCase()}@example.com`, source]);

const before = (await R.bySource()).find((r) => /^direct$/i.test(r.source));
const directBefore = before ? Number(before.leads) : 0;

await lead('RPT-A', 'Direct');
await lead('RPT-B', 'direct');
await lead('RPT-C', '  DIRECT  ');
await lead('RPT-D', '');
await lead('RPT-E', null);

const direct = (await R.bySource()).filter((r) => /direct/i.test(r.source));
check('THE POINT: one channel typed five ways is one channel',
  direct.length === 1, direct.map((r) => `${r.source}=${r.leads}`).join(' | '));
if (direct.length === 1) {
  check('an unset source counts as direct rather than as its own channel',
    Number(direct[0].leads) === directBefore + 5,
    `${direct[0].leads} (was ${directBefore})`);
  check('and it is spelled one way', direct[0].source === 'Direct', direct[0].source);
}

// ── the shape the page relies on ─────────────────────────────
for (const [name, fn] of Object.entries({
  byProduct: R.byProduct, byCustomer: R.byCustomer, byEmirate: R.byEmirate,
  bySource: R.bySource, bySalesperson: R.bySalesperson, cashInStock: R.cashInStock,
  incoming: R.incoming, pipeline: R.pipeline,
})) {
  const rows = await fn();
  check(`${name} returns rows rather than throwing`, Array.isArray(rows));
}

const stuck = await R.stuckStock(90);
check('stuckStock takes its threshold rather than assuming one', Array.isArray(stuck));

await wipe();
await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
