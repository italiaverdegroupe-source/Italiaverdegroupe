import { query } from '@/lib/db';

/**
 * Two kinds of stock, deliberately kept apart.
 *
 *   stock_items   — one unique specimen. Quantity is always 1. Its trunk, its
 *                   photographs, its cost and its price belong to it alone.
 *   stock_batches — a lot of interchangeable plants. Quantity is a number.
 *
 * Everything below is written so that neither is forced into the other's shape.
 */

export const ITEM_STATUSES = [
  'incoming', 'acclimatising', 'available', 'reserved', 'sold', 'dead', 'written_off',
] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const HEALTH = ['excellent', 'good', 'stressed', 'critical', 'dead'] as const;
export type Health = (typeof HEALTH)[number];

export const MOVEMENT_KINDS = [
  'receipt', 'transfer', 'status_change', 'reserve', 'release',
  'sale', 'mortality', 'damage', 'downgrade', 'adjustment', 'write_off',
] as const;

/**
 * Sellable is narrower than "in stock", on purpose.
 *
 * A tree can be physically present and still not be sellable: it may be sitting
 * at the supplier in Puglia, in a container, still acclimatising to the Gulf,
 * or in poor health. Promising any of those to a customer is how a delivery
 * date gets missed or a tree dies in its first summer.
 */
export const SELLABLE_ITEM_SQL = `
  si.status = 'available'
  AND si.health NOT IN ('critical','dead')
  AND (si.acclimatised_until IS NULL OR si.acclimatised_until <= current_date)
  AND COALESCE(loc.sellable, false)
`;

export type Location = {
  id: string; code: string; name: string; kind: string;
  emirate: string | null; sellable: boolean;
};

export const getLocations = () =>
  query<Location>(
    `SELECT id, code, name, kind, emirate, sellable
       FROM inventory_locations WHERE is_active ORDER BY sellable DESC, name`);

export type StockLine = {
  product_ref: string;
  specimens_total: string; specimens_sellable: string;
  specimens_acclimatising: string; specimens_reserved: string;
  specimens_sold: string; specimens_lost: string;
  batch_qty: string; batch_reserved: string; batch_sellable: string;
};

/** One row per catalogue reference, specimen and batch counts kept separate. */
export const getStockByProduct = () =>
  query<StockLine>(`
    WITH items AS (
      SELECT si.product_ref,
             count(*)                                              AS specimens_total,
             count(*) FILTER (WHERE ${SELLABLE_ITEM_SQL})           AS specimens_sellable,
             count(*) FILTER (WHERE si.status = 'acclimatising')    AS specimens_acclimatising,
             count(*) FILTER (WHERE si.status = 'reserved')         AS specimens_reserved,
             count(*) FILTER (WHERE si.status = 'sold')             AS specimens_sold,
             count(*) FILTER (WHERE si.status IN ('dead','written_off')) AS specimens_lost
        FROM stock_items si
        LEFT JOIN inventory_locations loc ON loc.id = si.location_id
       GROUP BY si.product_ref
    ),
    batches AS (
      SELECT sb.product_ref,
             COALESCE(sum(sb.quantity), 0) AS batch_qty,
             COALESCE(sum(sb.reserved), 0) AS batch_reserved,
             COALESCE(sum(sb.quantity - sb.reserved) FILTER (
               WHERE sb.status = 'available'
                 AND (sb.acclimatised_until IS NULL OR sb.acclimatised_until <= current_date)
                 AND COALESCE(l2.sellable, false)), 0) AS batch_sellable
        FROM stock_batches sb
        LEFT JOIN inventory_locations l2 ON l2.id = sb.location_id
       GROUP BY sb.product_ref
    )
    SELECT COALESCE(i.product_ref, b.product_ref) AS product_ref,
           COALESCE(i.specimens_total, 0)         AS specimens_total,
           COALESCE(i.specimens_sellable, 0)      AS specimens_sellable,
           COALESCE(i.specimens_acclimatising, 0) AS specimens_acclimatising,
           COALESCE(i.specimens_reserved, 0)      AS specimens_reserved,
           COALESCE(i.specimens_sold, 0)          AS specimens_sold,
           COALESCE(i.specimens_lost, 0)          AS specimens_lost,
           COALESCE(b.batch_qty, 0)               AS batch_qty,
           COALESCE(b.batch_reserved, 0)          AS batch_reserved,
           COALESCE(b.batch_sellable, 0)          AS batch_sellable
      FROM items i FULL OUTER JOIN batches b ON b.product_ref = i.product_ref
     ORDER BY 1`);

export type Specimen = {
  id: string; code: string; product_ref: string; status: ItemStatus; health: Health;
  grade: string | null; location_id: string | null; location_name: string | null;
  location_sellable: boolean | null; supplier_name: string | null;
  acquired_at: string | null; arrived_at: string | null; acclimatised_until: string | null;
  purchase_cost: string | null; purchase_currency: string; fx_rate_to_aed: string | null;
  landed_cost_aed: string | null; asking_price_aed: string | null; notes: string | null;
  height_m: string | null; trunk_girth_cm: string | null; measured_at: string | null;
  is_sellable: boolean;
};

const SPECIMEN_SELECT = `
  SELECT si.id, si.code, si.product_ref, si.status, si.health, si.grade,
         si.location_id, loc.name AS location_name, loc.sellable AS location_sellable,
         sup.name AS supplier_name,
         si.acquired_at, si.arrived_at, si.acclimatised_until,
         si.purchase_cost, si.purchase_currency, si.fx_rate_to_aed,
         si.landed_cost_aed, si.asking_price_aed, si.notes,
         m.height_m, m.trunk_girth_cm, m.measured_at,
         (${SELLABLE_ITEM_SQL}) AS is_sellable
    FROM stock_items si
    LEFT JOIN inventory_locations loc ON loc.id = si.location_id
    LEFT JOIN suppliers sup ON sup.id = si.supplier_id
    LEFT JOIN LATERAL (
      SELECT height_m, trunk_girth_cm, measured_at
        FROM specimen_measurements
       WHERE stock_item_id = si.id
       ORDER BY measured_at DESC, id DESC LIMIT 1
    ) m ON true`;

export function listSpecimens(opts: { status?: string; productRef?: string } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.status) { params.push(opts.status); where.push(`si.status = $${params.length}`); }
  if (opts.productRef) { params.push(opts.productRef); where.push(`si.product_ref = $${params.length}`); }
  return query<Specimen>(
    `${SPECIMEN_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY si.code LIMIT 500`, params);
}

export async function getSpecimen(code: string): Promise<Specimen | undefined> {
  const rows = await query<Specimen>(`${SPECIMEN_SELECT} WHERE si.code = $1`, [code]);
  return rows[0];
}

export type Movement = {
  id: string; at: string; user_email: string | null; kind: string; quantity: number;
  from_status: string | null; to_status: string | null;
  from_name: string | null; to_name: string | null; reason: string | null; note: string | null;
};

export const getMovements = (stockItemId: string) =>
  query<Movement>(
    `SELECT im.id, im.at, im.user_email, im.kind, im.quantity,
            im.from_status, im.to_status, im.reason, im.note,
            lf.name AS from_name, lt.name AS to_name
       FROM inventory_movements im
       LEFT JOIN inventory_locations lf ON lf.id = im.from_location
       LEFT JOIN inventory_locations lt ON lt.id = im.to_location
      WHERE im.stock_item_id = $1
      ORDER BY im.at DESC, im.id DESC`, [stockItemId]);

export type Measurement = {
  id: string; measured_at: string; height_m: string | null;
  trunk_girth_cm: string | null; crown_width_m: string | null;
  pot_litres: number | null; note: string | null;
};

export const getMeasurements = (stockItemId: string) =>
  query<Measurement>(
    `SELECT id, measured_at, height_m, trunk_girth_cm, crown_width_m, pot_litres, note
       FROM specimen_measurements WHERE stock_item_id = $1
      ORDER BY measured_at DESC, id DESC`, [stockItemId]);

/** Next code in a series, zero-padded, derived from the highest existing one. */
export async function nextCode(prefix: 'TREE' | 'LOT'): Promise<string> {
  const table = prefix === 'TREE' ? 'stock_items' : 'stock_batches';
  const rows = await query<{ n: string | null }>(
    `SELECT max(substring(code from '[0-9]+$')::bigint)::text AS n
       FROM ${table} WHERE code LIKE $1`, [`${prefix}-%`]);
  const next = Number(rows[0]?.n ?? 0) + 1;
  return `${prefix}-${String(next).padStart(6, '0')}`;
}
