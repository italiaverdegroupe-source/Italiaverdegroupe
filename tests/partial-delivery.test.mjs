// An order for 200 trees arriving in three containers over two months.
// A single linear order status cannot express that; per-line quantities can.
import pg from '../node_modules/pg/lib/index.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { completeDelivery, orderTotals } = require('../.test-build/orders.cjs');

process.env.DATABASE_URL = 'postgresql://postgres@127.0.0.1:5433/verdegarden';
const URL = process.env.DATABASE_URL;
const db = new pg.Client({ connectionString: URL });
await db.connect();

let failed = 0;
const check = (n, ok, x = '') => {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + n + (x ? '   ' + x : ''));
  if (!ok) failed++;
};
const user = { id: 1, email: 'dhmohamed970@gmail.com' };

await db.query(`DELETE FROM delivery_items; DELETE FROM deliveries;
                DELETE FROM order_items; DELETE FROM orders WHERE code LIKE 'ORD-P%';`);
await db.query(`DELETE FROM stock_batches WHERE code = 'LOT-PARTIAL';`);

// The yard these fixtures stand in. Resolved by subquery below, which returns
// NULL on a database built from the migrations alone — so create it here
// rather than depend on whatever happens to be seeded.
await db.query(
  `INSERT INTO inventory_locations (code, name, kind, emirate, sellable)
   VALUES ('YRD-DXB', 'Dubai yard', 'warehouse', 'Dubai', true)
   ON CONFLICT (code) DO UPDATE SET sellable = true, is_active = true`);
const { rows: [lot] } = await db.query(
  `INSERT INTO stock_batches (code, product_ref, quantity, reserved, status, location_id)
   VALUES ('LOT-PARTIAL','VG-OL-006',200,200,'available',
           (SELECT id FROM inventory_locations WHERE code='YRD-DXB')) RETURNING id`);

const { rows: [o] } = await db.query(
  `INSERT INTO orders (code, customer_name, customer_company, status, lpo_number,
                       advance_pct, retention_pct)
   VALUES ('ORD-P0001','Khalid','Mansoori Landscaping LLC','confirmed','LPO-88421',25,10)
   RETURNING id, code`);
const { rows: [line] } = await db.query(
  `INSERT INTO order_items (order_id, line_no, kind, batch_id, description,
                            quantity, unit_price, landed_unit_cost_aed)
   VALUES ($1,1,'product',$2,'Bonsai-form olive 1.8 m',200,2900,2479.13) RETURNING id`,
  [o.id, lot.id]);

const mkDelivery = async (code, qty) => {
  const { rows: [d] } = await db.query(
    `INSERT INTO deliveries (code, order_id, status, scheduled_for, driver, equipment)
     VALUES ($1,$2,'scheduled',current_date,'Rashid','Hiab 8t') RETURNING id`, [code, o.id]);
  await db.query(`INSERT INTO delivery_items (delivery_id, order_item_id, quantity)
                  VALUES ($1,$2,$3)`, [d.id, line.id, qty]);
  return d;
};

const state = async () => {
  const { rows: [r] } = await db.query(
    `SELECT o.status, i.delivered_qty, i.quantity,
            b.quantity AS lot_qty, b.reserved AS lot_reserved
       FROM orders o JOIN order_items i ON i.order_id = o.id
       JOIN stock_batches b ON b.id = i.batch_id
      WHERE o.id = $1`, [o.id]);
  return r;
};

await mkDelivery('DLV-P0001', 80);
await completeDelivery('DLV-P0001', 'Site foreman', 'First container', user);
let s = await state();
check('after 80 of 200 the order is partially delivered',
      s.status === 'partially_delivered' && s.delivered_qty === 80,
      `${s.status}, ${s.delivered_qty}/${s.quantity}`);
check('stock drops by what actually went out', Number(s.lot_qty) === 120, `lot at ${s.lot_qty}`);
check('the reservation is released as it ships', Number(s.lot_reserved) === 120, `reserved ${s.lot_reserved}`);

await mkDelivery('DLV-P0002', 60);
await completeDelivery('DLV-P0002', 'Site foreman', 'Second container', user);
s = await state();
check('after 140 it is still partially delivered',
      s.status === 'partially_delivered' && s.delivered_qty === 140,
      `${s.status}, ${s.delivered_qty}/${s.quantity}`);

// over-delivering the remainder must be refused, not silently clamped
await mkDelivery('DLV-P0003', 75);
let refused = false, why = '';
try { await completeDelivery('DLV-P0003', 'x', null, user); }
catch (e) { refused = true; why = e.message; }
check('delivering more than remains is refused', refused, why);
s = await state();
check('the refusal left nothing half-applied', s.delivered_qty === 140, `${s.delivered_qty}`);

await db.query(`UPDATE delivery_items SET quantity = 60
                 WHERE delivery_id = (SELECT id FROM deliveries WHERE code='DLV-P0003')`);
await completeDelivery('DLV-P0003', 'Site foreman', 'Final container', user);
s = await state();
check('the last delivery completes the order',
      s.status === 'delivered' && s.delivered_qty === 200, `${s.status}, ${s.delivered_qty}`);
check('the lot is emptied exactly', Number(s.lot_qty) === 0, `lot at ${s.lot_qty}`);

// a completed delivery cannot be applied twice
let twice = false;
try { await completeDelivery('DLV-P0003', 'x', null, user); } catch { twice = true; }
check('a delivery cannot be completed twice', twice);

// money: advance and retention are carried, not assumed
const { rows: [ord] } = await db.query(`SELECT * FROM orders WHERE id = $1`, [o.id]);
const { rows: items } = await db.query(`SELECT * FROM order_items WHERE order_id = $1`, [o.id]);
const t = orderTotals(ord, items);
console.log(`\n    order net AED ${t.net.toLocaleString()} · advance 25% = ${t.advance.toLocaleString()} · retention 10% = ${t.retention.toLocaleString()}`);
check('advance is 25% of the total', t.advance === Math.round(t.total * 0.25 * 100) / 100);
check('retention is held back, not counted as collected',
      t.retention === Math.round(t.total * 0.10 * 100) / 100 && t.retention > 0);
check('the LPO number is on the order', ord.lpo_number === 'LPO-88421');
check('margin uses the landed cost snapshot', t.marginPct > 0 && t.cost === 2479.13 * 200);

await db.end();
console.log(failed ? `\n${failed} FAILED` : '\nAll partial-delivery checks passed.');
process.exit(failed ? 1 : 0);
