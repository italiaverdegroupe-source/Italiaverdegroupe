// Two salespeople accept two different quotations for the SAME specimen at the
// same instant. Exactly one must win. Run: node tests/concurrency.test.mjs
import pg from '../node_modules/pg/lib/index.js';

const URL = 'postgresql://postgres@127.0.0.1:5433/verdegarden';
let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};

const admin = new pg.Client({ connectionString: URL });
await admin.connect();

// The yard these fixtures stand in. Resolved by subquery below, which returns
// NULL on a database built from the migrations alone — so create it here
// rather than depend on whatever happens to be seeded.
await admin.query(
  `INSERT INTO inventory_locations (code, name, kind, emirate, sellable)
   VALUES ('YRD-DXB', 'Dubai yard', 'warehouse', 'Dubai', true)
   ON CONFLICT (code) DO UPDATE SET sellable = true, is_active = true`);

// a clean specimen, available, in a sellable location
await admin.query(`DELETE FROM quote_events; DELETE FROM quote_items; DELETE FROM quotes;`);
await admin.query(`DELETE FROM inventory_movements WHERE ref_type = 'quote';`);
await admin.query(`
  INSERT INTO stock_items (code, product_ref, status, health, location_id)
  VALUES ('TREE-RACE', 'VG-OL-007', 'available', 'excellent',
          (SELECT id FROM inventory_locations WHERE code = 'YRD-DXB'))
  ON CONFLICT (code) DO UPDATE SET status = 'available'`);
const { rows: [tree] } = await admin.query(`SELECT id FROM stock_items WHERE code = 'TREE-RACE'`);

// two quotations, each with a line for that one tree
const mk = async (code) => {
  const { rows: [q] } = await admin.query(
    `INSERT INTO quotes (code, customer_name, status) VALUES ($1,$2,'sent') RETURNING id`,
    [code, 'Buyer ' + code]);
  return q.id;
};
const qa = await mk('QT-RACE-A');
const qb = await mk('QT-RACE-B');

// The unique index already refuses to put one specimen on two quotations.
await admin.query(
  `INSERT INTO quote_items (quote_id, kind, stock_item_id, description, quantity, unit_price)
   VALUES ($1,'specimen',$2,'Ancient olive',1,9500)`, [qa, tree.id]);
let indexHeld = false;
try {
  await admin.query(
    `INSERT INTO quote_items (quote_id, kind, stock_item_id, description, quantity, unit_price)
     VALUES ($1,'specimen',$2,'Ancient olive',1,9500)`, [qb, tree.id]);
} catch (e) { indexHeld = /unique|duplicate/i.test(e.message); }
check('one specimen cannot sit on two quotations', indexHeld);

/** Accept, holding the row lock, with a pause inside the transaction so the
 *  two attempts genuinely overlap. */
async function accept(label, quoteId, pauseMs) {
  const c = new pg.Client({ connectionString: URL });
  await c.connect();
  try {
    await c.query('BEGIN');
    const { rows: [s] } = await c.query(
      `SELECT code, status FROM stock_items WHERE id = $1 FOR UPDATE`, [tree.id]);
    await new Promise((r) => setTimeout(r, pauseMs));
    if (s.status !== 'available') throw new Error(`${s.code} is ${s.status}`);
    await c.query(`UPDATE stock_items SET status='reserved' WHERE id = $1`, [tree.id]);
    await c.query(`UPDATE quotes SET status='accepted' WHERE id = $1`, [quoteId]);
    await c.query('COMMIT');
    return { label, ok: true };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    return { label, ok: false, error: e.message };
  } finally { await c.end(); }
}

// Same specimen, two overlapping transactions.
const results = await Promise.all([
  accept('salesperson A', qa, 400),
  accept('salesperson B', qb, 0),
]);
results.forEach((r) => console.log('    ' + r.label + ': ' + (r.ok ? 'reserved it' : 'refused — ' + r.error)));

const winners = results.filter((r) => r.ok).length;
check('exactly one of two simultaneous accepts wins', winners === 1, `${winners} won`);

const { rows: [after] } = await admin.query(
  `SELECT status FROM stock_items WHERE id = $1`, [tree.id]);
check('the specimen ends up reserved exactly once', after.status === 'reserved', after.status);

const { rows: [acc] } = await admin.query(
  `SELECT count(*)::int AS n FROM quotes WHERE code LIKE 'QT-RACE-%' AND status = 'accepted'`);
check('only one quotation was accepted', acc.n === 1, `${acc.n} accepted`);

// Without the lock the same race double-sells.
await admin.query(`UPDATE stock_items SET status='available' WHERE id=$1`, [tree.id]);
async function acceptUnlocked(pauseMs) {
  const c = new pg.Client({ connectionString: URL });
  await c.connect();
  try {
    const { rows: [s] } = await c.query(`SELECT status FROM stock_items WHERE id = $1`, [tree.id]);
    await new Promise((r) => setTimeout(r, pauseMs));
    if (s.status !== 'available') return false;
    await c.query(`UPDATE stock_items SET status='reserved' WHERE id = $1`, [tree.id]);
    return true;
  } finally { await c.end(); }
}
const unlocked = await Promise.all([acceptUnlocked(400), acceptUnlocked(0)]);
check('…and without the lock, both would have sold it',
      unlocked.filter(Boolean).length === 2,
      `${unlocked.filter(Boolean).length} succeeded — this is what the lock prevents`);

await admin.query(`DELETE FROM quote_items WHERE stock_item_id = $1`, [tree.id]);
await admin.query(`DELETE FROM quotes WHERE code LIKE 'QT-RACE-%'`);
await admin.query(`DELETE FROM stock_items WHERE code = 'TREE-RACE'`);
await admin.end();

console.log(failed ? `\n${failed} FAILED` : '\nAll concurrency checks passed.');
process.exit(failed ? 1 : 0);
