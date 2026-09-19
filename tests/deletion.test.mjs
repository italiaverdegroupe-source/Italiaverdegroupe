// Deleting things — what it hides, what it refuses, and what it keeps.
//
//   node tests/deletion.test.mjs
//
// The console could not delete a single business record before this, so every
// rule here is new and none of it has ever been exercised by a person. The
// three that would actually hurt if they were wrong:
//
//   · a deleted record must leave the lists AND the money. A lead still
//     counted in the pipeline, an invoice still counted in "outstanding", is
//     worse than no delete at all — the screen would lie quietly.
//   · a paid invoice and a received payment must be refused, both ways round.
//     The reversible delete is refused for the same reason as the permanent
//     one: hidden from the ledger is missing from the ledger.
//   · a permanent delete must be refused while anything live points at the
//     row, and must never run without the row having been deleted once first.
//
// Needs a database. No server, no browser.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const D = require('../.test-build/deletion.cjs');
const R = require('../.test-build/reports.cjs');
const O = require('../.test-build/orders.cjs');
const A = require('../.test-build/admin-ui.cjs');

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

// The person doing the deleting. A real row, because deleted_by is a foreign
// key and a made-up id would pass here and fail in production.
const { rows: [actor] } = await db.query(
  `INSERT INTO users (email, name, role, password_hash)
        VALUES ('deletion-test@example.invalid', 'Deletion test', 'owner', 'x')
   ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
   RETURNING id`);
const user = { id: actor.id, email: 'deletion-test@example.invalid', role: 'owner' };

const clean = async () => {
  await db.query(`DELETE FROM leads   WHERE reference LIKE 'LEAD-DEL%'`);
  await db.query(`DELETE FROM payments WHERE reference LIKE 'PAY-DEL%'`);
  await db.query(`DELETE FROM invoices WHERE code LIKE 'INV-DEL%'`);
  await db.query(`DELETE FROM orders  WHERE code LIKE 'ORD-DEL%'`);
  await db.query(`DELETE FROM quotes  WHERE code LIKE 'QT-DEL%'`);
};
await clean();

// ── a lead leaves every list, and the pipeline ───────────────
await db.query(
  `INSERT INTO leads (reference, name, email, enquiry_type, status, source)
        VALUES ('LEAD-DEL1', 'Bin me', 'bin@example.invalid', 'supply', 'new', 'direct')`);

const pipelineCount = async () =>
  Number((await R.pipeline()).find((r) => r.stage === 'leads')?.n ?? 0);

const before = await pipelineCount();
check('a live lead counts in the pipeline', before > 0, `${before}`);

const why1 = await D.softDelete('lead', 'LEAD-DEL1', user);
check('deleting a lead is allowed and reports nothing', why1.length === 0,
  JSON.stringify(why1));

const after = await pipelineCount();
check('THE POINT: a deleted lead is out of the pipeline too, not only the list',
  after === before - 1, `${before} → ${after}`);

const { rows: [hidden] } = await db.query(
  `SELECT deleted_at, deleted_by FROM leads WHERE reference = 'LEAD-DEL1'`);
check('the row survives, stamped with when and by whom',
  hidden && hidden.deleted_at !== null && String(hidden.deleted_by) === String(user.id));

const info = await D.deletionInfo('lead', 'LEAD-DEL1');
check('the screen can say who deleted it, by email rather than by id',
  info.by === 'deletion-test@example.invalid', String(info.by));

check('deleting it twice says so rather than pretending it worked',
  (await D.softDelete('lead', 'LEAD-DEL1', user)).length === 1);

await D.restore('lead', 'LEAD-DEL1');
check('restoring puts it back in the pipeline', (await pipelineCount()) === before);

// ── an invoice with money against it is refused, both ways ───
const { rows: [ord] } = await db.query(
  `INSERT INTO orders (code, customer_name, status, confirmed_on)
        VALUES ('ORD-DEL1', 'Paid customer', 'confirmed', current_date) RETURNING id`);
const { rows: [inv] } = await db.query(
  `INSERT INTO invoices (code, order_id, kind, status, issued_on, due_on,
                         net_aed, vat_aed, total_aed, retention_aed)
        VALUES ('INV-DEL1', $1, 'tax_invoice', 'issued', current_date, current_date + 30,
                1000, 0, 1000, 0) RETURNING id`, [ord.id]);

check('an unpaid invoice can be deleted',
  (await D.deleteCheck('invoice', 'INV-DEL1')).length === 0);

await db.query(
  `INSERT INTO payments (invoice_id, amount_aed, method, received_on, reference)
        VALUES ($1, 400, 'bank_transfer', current_date, 'PAY-DEL1')`, [inv.id]);

const paidWhy = await D.deleteCheck('invoice', 'INV-DEL1');
check('THE POINT: a part-paid invoice cannot be deleted even reversibly',
  paidWhy.length === 1 && paidWhy[0].why === 'invoice-paid', JSON.stringify(paidWhy));
check('and the reversible delete actually refuses, not just the check',
  (await D.softDelete('invoice', 'INV-DEL1', user)).length === 1);
check('a received payment is never deletable at all',
  D.alwaysKept('payment')
  && (await D.softDelete('payment', 'PAY-DEL1', user))[0].why === 'payment');

// ── a permanent delete waits its turn ────────────────────────
await db.query(
  `INSERT INTO quotes (code, version, customer_name, status)
        VALUES ('QT-DEL1', 1, 'Versioned', 'draft'), ('QT-DEL1', 2, 'Versioned', 'draft')`);

const notYet = await D.purgeCheck('quote', 'QT-DEL1');
check('a live record cannot be permanently removed',
  notYet.length === 1 && notYet[0].why === 'not-deleted-yet', JSON.stringify(notYet));

await D.softDelete('quote', 'QT-DEL1', user);
const { rows: versions } = await db.query(
  `SELECT version FROM quotes WHERE code = 'QT-DEL1' AND deleted_at IS NOT NULL`);
check('THE POINT: deleting a quotation takes every version of it, not just the latest',
  versions.length === 2, `${versions.length} of 2`);

await db.query(
  `INSERT INTO orders (code, quote_id, customer_name, status, confirmed_on)
        SELECT 'ORD-DEL2', id, 'Downstream', 'confirmed', current_date
          FROM quotes WHERE code = 'QT-DEL1' AND version = 1`);

const blocked = await D.purgeCheck('quote', 'QT-DEL1');
check('a live order pointing at it blocks the permanent delete',
  blocked.length === 1 && blocked[0].why === 'children' && blocked[0].child === 'order',
  JSON.stringify(blocked));

await D.softDelete('order', 'ORD-DEL2', user);
check('and a deleted one does not — otherwise the pair could never go',
  (await D.purgeCheck('quote', 'QT-DEL1')).length === 0);

await D.purgeNow('quote', 'QT-DEL1');
const { rows: goneRows } = await db.query(`SELECT 1 FROM quotes WHERE code = 'QT-DEL1'`);
check('every version goes with it', goneRows.length === 0);

// ── the money figures ignore the bin ─────────────────────────
await db.query(`UPDATE invoices SET deleted_at = now() WHERE code = 'INV-DEL1'`);
const aged = await O.ageing();
check('THE POINT: a deleted invoice is out of the ageing report',
  !aged.some((r) => r.invoice === 'INV-DEL1'));

// ── every refusal can be read in three languages ─────────────
const KEYS = [
  'That record no longer exists.',
  'That record does not exist, or is already deleted.',
  'Delete it first. Permanently removing a record that is still live is one click away from removing the wrong one.',
  'This invoice has payments against it. An invoice that has been paid is an accounting record the law requires to be kept — cancel it instead, which voids it without erasing it.',
  'A received payment is an accounting record. Reverse it with a credit rather than deleting the evidence that money arrived.',
  'Still linked to this {parent}: {n} × {child}. Remove those first.',
  ...D.RECORD_LABELS,
];
for (const lang of ['ar', 'it']) {
  const missing = KEYS.filter((k) => !A.ADMIN_DICTS[lang][k]);
  check(`every deletion string reads in ${lang}`, missing.length === 0,
    missing.join(' | '));
}

// A label that is not a key would render as raw English inside a translated
// sentence, which is the one place somebody most needs to understand.
const notKeys = D.RECORD_LABELS.filter((l) => !A.ADMIN_KEYS.includes(l));
check('THE POINT: every record label is a translatable key, so no sentence is half English',
  notKeys.length === 0, notKeys.join(', '));

const t = A.adminUi('ar');
const sentence = D.blockerText(
  { why: 'children', n: 2, child: 'invoice', parent: 'order' }, t);
check('and a refusal comes out as one Arabic sentence',
  sentence.includes('فاتورة') && sentence.includes('طلب') && !/[A-Za-z]/.test(sentence),
  sentence);

await clean();
await db.query(`DELETE FROM users WHERE email = 'deletion-test@example.invalid'`);
await db.end();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
