// The two claims that make an alert engine usable rather than a nuisance:
// it raises what is true, and it does not raise it twice. Both are tested
// against a real Postgres, because both are properties of the schema — the
// unique dedupe index — rather than of the code around it.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

process.env.DATABASE_URL = 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const { runScan, seedDefaultRules, raise } = require('../.test-build/alerts.cjs');

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// ── a clean slate ────────────────────────────────────────────
await db.query(`DELETE FROM outbound_messages; DELETE FROM alerts;
                DELETE FROM alert_runs; DELETE FROM alert_rules;`);
await db.query(`DELETE FROM leads WHERE reference LIKE 'ALRT-%';`);
await db.query(`DELETE FROM stock_batches WHERE code = 'LOT-ALERT';`);
await db.query(`DELETE FROM stock_items WHERE code = 'TREE-ALERT';`);
await db.query(`DELETE FROM import_permits WHERE permit_number = 'PRM-ALERT';`);

const n = await seedDefaultRules();
check('the defaults install once', n === 16, `installed ${n}`);
check('installing again is a no-op', (await seedDefaultRules()) === 0);

// ── conditions a manager would want to hear about ────────────

// An enquiry that arrived six hours ago and nobody touched.
await db.query(
  `INSERT INTO leads (reference, enquiry_type, name, company, email, emirate, consent, status, created_at)
   VALUES ('ALRT-UNANS','product','Faisal','Etihad Landscapes','f@example.ae','Dubai',true,'new',
           now() - interval '6 hours')`);

// A follow-up promised for today.
await db.query(
  `INSERT INTO leads (reference, enquiry_type, name, email, consent, status, next_follow_up)
   VALUES ('ALRT-FOLLOW','product','Mariam','m@example.ae',true,'qualified', current_date)`);

// A MOCCAE permit that lapsed last week.
await db.query(
  `INSERT INTO import_permits (permit_number, authority, issued_on, expires_on)
   VALUES ('PRM-ALERT','MOCCAE', current_date - 190, current_date - 7)`);

// A lot down to its last two units, in a sellable location.
await db.query(
  `INSERT INTO stock_batches (code, product_ref, quantity, reserved, status, location_id)
   VALUES ('LOT-ALERT','VG-OL-006', 2, 0, 'available',
           (SELECT id FROM inventory_locations WHERE code='YRD-DXB'))`);

// A tree in trouble.
await db.query(
  `INSERT INTO stock_items (code, product_ref, status, health, location_id, arrived_at)
   VALUES ('TREE-ALERT','VG-OL-007','available','critical',
           (SELECT id FROM inventory_locations WHERE code='YRD-DXB'), current_date - 200)`);

// An invoice forty days past due, against a customer with a small limit.
await db.query(`DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE code='INV-ALERT');`);
await db.query(`DELETE FROM invoices WHERE code = 'INV-ALERT';`);
await db.query(`DELETE FROM customers WHERE code = 'CUS-ALERT';`);
const { rows: [cust] } = await db.query(
  `INSERT INTO customers (code, name, company, credit_limit_aed)
   VALUES ('CUS-ALERT','Saeed','Gulf Contracting LLC', 10000) RETURNING id`);
await db.query(
  `INSERT INTO invoices (code, customer_id, kind, status, issued_on, due_on, total_aed)
   VALUES ('INV-ALERT',$1,'tax_invoice','issued', current_date - 70, current_date - 40, 48000)`,
  [cust.id]);

// A quotation that lapses in two days.
await db.query(`DELETE FROM quote_items WHERE quote_id IN (SELECT id FROM quotes WHERE code='QT-ALERT');`);
await db.query(`DELETE FROM quotes WHERE code = 'QT-ALERT';`);
const { rows: [qt] } = await db.query(
  `INSERT INTO quotes (code, version, customer_name, customer_company, status, issued_on, valid_until)
   VALUES ('QT-ALERT',1,'Noura','Palm Hospitality LLC','sent', current_date - 12, current_date + 2)
   RETURNING id`);
await db.query(
  `INSERT INTO quote_items (quote_id, line_no, kind, description, quantity, unit_price)
   VALUES ($1,1,'product','Ancient olive 4 m',1,95000)`, [qt.id]);

// A delivery going out tomorrow.
await db.query(`DELETE FROM delivery_items WHERE delivery_id IN (SELECT id FROM deliveries WHERE code='DLV-ALERT');`);
await db.query(`DELETE FROM deliveries WHERE code = 'DLV-ALERT';`);
await db.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE code='ORD-ALERT');`);
await db.query(`DELETE FROM orders WHERE code = 'ORD-ALERT';`);
const { rows: [ord] } = await db.query(
  `INSERT INTO orders (code, customer_name, customer_company, status, site_address)
   VALUES ('ORD-ALERT','Noura','Palm Hospitality LLC','confirmed','Palm Jumeirah, Dubai') RETURNING id`);
await db.query(
  `INSERT INTO deliveries (code, order_id, status, scheduled_for)
   VALUES ('DLV-ALERT',$1,'scheduled', current_date + 1)`, [ord.id]);

// A container three days out.
await db.query(`DELETE FROM shipment_items WHERE shipment_id IN (SELECT id FROM shipments WHERE code='SHP-ALERT');`);
await db.query(`DELETE FROM shipments WHERE code = 'SHP-ALERT';`);
await db.query(
  `INSERT INTO shipments (code, status, eta, container_no, supplier_id)
   VALUES ('SHP-ALERT','in_transit', current_date + 3, 'MSCU7781234',
           (SELECT id FROM suppliers ORDER BY id LIMIT 1))`);

// An invoice falling due in two days, not yet late.
await db.query(`DELETE FROM invoices WHERE code = 'INV-SOON';`);
await db.query(
  `INSERT INTO invoices (code, customer_id, kind, status, issued_on, due_on, total_aed)
   VALUES ('INV-SOON',$1,'tax_invoice','issued', current_date - 28, current_date + 2, 12500)`,
  [cust.id]);

// ── the scan ─────────────────────────────────────────────────
const first = await runScan('manual');
check('the scan reports no rule errors', first.errors.length === 0, first.errors.join(' | '));

// The database already holds stock and shipments from the other suites, and
// some of it legitimately trips these same rules. So each assertion names its
// own fixture rather than counting every row of a kind — otherwise the test
// measures the seed data, not the engine.
const one = async (kind, entityId) => (await db.query(
  `SELECT count(*)::int AS n FROM alerts WHERE kind = $1 AND entity_id = $2`,
  [kind, entityId])).rows[0].n;

check('the unanswered enquiry is raised',   await one('lead.unanswered', 'ALRT-UNANS') === 1);
check('the follow-up due today is raised',  await one('lead.followup_due', 'ALRT-FOLLOW') === 1);
check('the lapsed permit is raised',        await one('permit.expiring', 'PRM-ALERT') === 1);
check('the nearly-empty lot is raised',     await one('stock.low', 'LOT-ALERT') === 1);
check('the critical tree is raised',        await one('stock.health', 'TREE-ALERT') === 1);
check('the tree sitting 200 days is raised', await one('stock.stuck', 'TREE-ALERT') === 1);
check('the overdue invoice is raised',      await one('invoice.overdue', 'INV-ALERT') === 1);
check('the customer over their limit is raised',
      await one('customer.credit', String(cust.id)) === 1);
check('the quotation expiring in two days is raised', await one('quote.expiring', 'QT-ALERT') === 1);
check('tomorrow\u2019s delivery is raised',            await one('delivery.upcoming', 'DLV-ALERT') === 1);
check('the container three days out is raised',      await one('shipment.arriving', 'SHP-ALERT') === 1);
check('the invoice due in two days is raised',       await one('invoice.due', 'INV-SOON') === 1);
check('an invoice that is merely due is not also called overdue',
      await one('invoice.overdue', 'INV-SOON') === 0);

const lapsed = (await db.query(
  `SELECT title, severity FROM alerts WHERE kind = 'permit.expiring' AND entity_id = 'PRM-ALERT'`)).rows[0];
check('a permit already past its date says so rather than "expires"',
      /has expired/.test(lapsed.title), lapsed.title);
check('it is urgent', lapsed.severity === 'urgent');

const od = (await db.query(
  `SELECT title, body FROM alerts WHERE kind='invoice.overdue' AND entity_id='INV-ALERT'`)).rows[0];
check('the overdue alert states the age and the amount',
      /40 days overdue/.test(od.title) && /48,000/.test(od.body), `${od.title} — ${od.body}`);

// ── the claim that matters: a re-scan raises nothing ─────────
const before = (await db.query(`SELECT count(*)::int AS n FROM alerts`)).rows[0].n;
const second = await runScan('manual');
const after = (await db.query(`SELECT count(*)::int AS n FROM alerts`)).rows[0].n;
check('a second scan raises nothing new', second.raised === 0 && after === before,
      `raised ${second.raised}, ${before} → ${after}`);

const third = await runScan('manual');
check('a third scan raises nothing either', third.raised === 0);

// ── but a condition that WORSENS is new news ─────────────────
// Push the same invoice from the 31-60 band into 61-90.
await db.query(`UPDATE invoices SET due_on = current_date - 75 WHERE code = 'INV-ALERT'`);
const fourth = await runScan('manual');
const bands = await one('invoice.overdue', 'INV-ALERT');
check('crossing into a worse ageing band raises a fresh alert',
      fourth.raised === 1 && bands === 2, `raised ${fourth.raised}, total ${bands}`);

// And the same invoice scanned twice inside the new band does not.
const fifth = await runScan('manual');
check('but not twice inside the same band', fifth.raised === 0);

// ── a resolved condition stops being raised ──────────────────
await db.query(`UPDATE stock_items SET health = 'good' WHERE code = 'TREE-ALERT'`);
await db.query(`DELETE FROM alerts WHERE kind = 'stock.health'`);
await runScan('manual');
check('a tree that recovered is not raised again', await one('stock.health', 'TREE-ALERT') === 0);

// ── an inactive rule is silent ───────────────────────────────
await db.query(`UPDATE alert_rules SET is_active = false WHERE kind = 'stock.low'`);
await db.query(`DELETE FROM alerts WHERE kind = 'stock.low'`);
await runScan('manual');
check('switching a rule off silences it', await one('stock.low', 'LOT-ALERT') === 0);
await db.query(`UPDATE alert_rules SET is_active = true WHERE kind = 'stock.low'`);

// ── a changed threshold changes what is found ────────────────
// The lot holds two. A floor of 1 must not find it; a floor of 2 must.
await db.query(`DELETE FROM alerts WHERE kind = 'stock.low'`);
await db.query(`UPDATE alert_rules SET threshold = 1 WHERE kind = 'stock.low'`);
await runScan('manual');
const atOne = await one('stock.low', 'LOT-ALERT');
await db.query(`UPDATE alert_rules SET threshold = 2 WHERE kind = 'stock.low'`);
await runScan('manual');
const atTwo = await one('stock.low', 'LOT-ALERT');
check('the rule’s number is the rule: 1 finds nothing, 2 finds the lot',
      atOne === 0 && atTwo === 1, `${atOne} then ${atTwo}`);

// ── custom wording is used ───────────────────────────────────
await db.query(`DELETE FROM alerts WHERE kind = 'stock.low'`);
await db.query(
  `UPDATE alert_rules SET template = 'Only {available} {product} left — order from Italy now'
    WHERE kind = 'stock.low'`);
await runScan('manual');
const worded = (await db.query(
  `SELECT title FROM alerts WHERE kind='stock.low' AND entity_id='LOT-ALERT'`)).rows[0];
check('a rule’s own wording is used, with its tokens filled',
      worded.title === 'Only 2 VG-OL-006 left — order from Italy now', worded.title);

// ── outbound is honest about not sending ─────────────────────
await db.query(`DELETE FROM outbound_messages; DELETE FROM alerts WHERE kind='stock.low';`);
await db.query(`UPDATE alert_rules SET email_to = 'owner@example.ae' WHERE kind = 'stock.low'`);
await runScan('manual');
const msg = (await db.query(
  `SELECT m.channel, m.address, m.status, m.status_note
     FROM outbound_messages m JOIN alerts a ON a.id = m.alert_id
    WHERE a.entity_id = 'LOT-ALERT'`)).rows[0];
check('an email address on a rule queues a message', msg?.address === 'owner@example.ae');
check('and it is blocked, not silently dropped', msg?.status === 'blocked', msg?.status);
check('with a reason a manager can act on',
      /No mail provider configured/.test(msg?.status_note ?? ''), msg?.status_note);

// ── raise() is safe under a race ─────────────────────────────
// Two scans landing at the same instant must not both insert.
const both = await Promise.all([
  raise({ kind: 'test.race', subject: 'X', title: 'Race', severity: 'info' }),
  raise({ kind: 'test.race', subject: 'X', title: 'Race', severity: 'info' }),
]);
check('two simultaneous raises of the same thing produce one alert',
      both.filter(Boolean).length === 1, JSON.stringify(both));
await db.query(`DELETE FROM alerts WHERE kind = 'test.race'`);

// ── the run is recorded ──────────────────────────────────────
const run = (await db.query(
  `SELECT trigger, finished_at, error FROM alert_runs ORDER BY started_at DESC LIMIT 1`)).rows[0];
check('each run is recorded and finished', run.finished_at !== null && run.error === null);

await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nall passed');
process.exit(failed ? 1 : 0);
