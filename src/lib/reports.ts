import { query } from '@/lib/db';

/**
 * Reports are written to answer the questions a manager actually asks, one
 * query each, rather than to fill a dashboard with charts. Precise numbers
 * beat decoration here: "which trees make money" needs a margin to two
 * decimals, not a doughnut.
 *
 * Every figure is derived from the snapshots stored on the documents —
 * the price quoted, the landed cost at the time — so a report of last quarter
 * still reads as last quarter.
 */

/** What are we selling, and which of it makes money. */
export const byProduct = () => query<{
  product_ref: string; units: string; revenue: string; cost: string;
  profit: string; margin_pct: string;
}>(`
  SELECT oi.product_ref,
         sum(oi.quantity)::text AS units,
         sum(oi.unit_price * oi.quantity * (1 - oi.discount_pct/100))::numeric(14,2)::text AS revenue,
         sum(COALESCE(oi.landed_unit_cost_aed,0) * oi.quantity)::numeric(14,2)::text AS cost,
         (sum(oi.unit_price * oi.quantity * (1 - oi.discount_pct/100))
          - sum(COALESCE(oi.landed_unit_cost_aed,0) * oi.quantity))::numeric(14,2)::text AS profit,
         CASE WHEN sum(oi.unit_price * oi.quantity * (1 - oi.discount_pct/100)) > 0
              THEN round(100 * (sum(oi.unit_price * oi.quantity * (1 - oi.discount_pct/100))
                   - sum(COALESCE(oi.landed_unit_cost_aed,0) * oi.quantity))
                   / sum(oi.unit_price * oi.quantity * (1 - oi.discount_pct/100)), 1)::text
              ELSE '0' END AS margin_pct
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
   WHERE o.deleted_at IS NULL AND o.status <> 'cancelled' AND oi.product_ref IS NOT NULL
   GROUP BY oi.product_ref
   ORDER BY 4 DESC`);

/** To whom, and who comes back. */
export const byCustomer = () => query<{
  customer: string; orders: string; revenue: string; first_order: string; last_order: string;
}>(`
  -- Grouped on the folded name, labelled with a real spelling of it. Somebody
  -- typing "Mansoori Landscaping LLC" on one order and "mansoori landscaping
  -- llc" on the next was two customers here, each with half the revenue and
  -- neither marked as repeat. Not initcap'd for display, because that turns
  -- LLC into Llc.
  SELECT min(COALESCE(NULLIF(btrim(o.customer_company), ''),
                      NULLIF(btrim(o.customer_name), ''), 'Unnamed')) AS customer,
         count(*)::text AS orders,
         sum(t.net)::numeric(14,2)::text AS revenue,
         min(o.confirmed_on)::text AS first_order,
         max(o.confirmed_on)::text AS last_order
    FROM orders o
    JOIN LATERAL (
      SELECT COALESCE(sum(unit_price * quantity * (1 - discount_pct/100)), 0) AS net
        FROM order_items WHERE order_id = o.id
    ) t ON true
   WHERE o.deleted_at IS NULL AND o.status <> 'cancelled'
   GROUP BY lower(COALESCE(NULLIF(btrim(o.customer_company), ''),
                           NULLIF(btrim(o.customer_name), ''), 'unnamed'))
   ORDER BY 3 DESC`);

/** Where the money comes from, geographically. */
export const byEmirate = () => query<{ emirate: string; orders: string; revenue: string }>(`
  -- An empty string is not NULL, so "" was its own row next to "Not recorded",
  -- and "dubai" was a different emirate from "Dubai". Both come off a form.
  SELECT initcap(lower(COALESCE(NULLIF(btrim(o.emirate), ''), 'Not recorded'))) AS emirate,
         count(*)::text AS orders,
         sum(t.net)::numeric(14,2)::text AS revenue
    FROM orders o
    JOIN LATERAL (
      SELECT COALESCE(sum(unit_price * quantity * (1 - discount_pct/100)), 0) AS net
        FROM order_items WHERE order_id = o.id
    ) t ON true
   WHERE o.deleted_at IS NULL AND o.status <> 'cancelled'
   GROUP BY 1 ORDER BY 3 DESC`);

/**
 * Which channel generates REVENUE, not which generates noise.
 *
 * The whole point of the brief's marketing section: 200 leads that never buy
 * are worth less than 20 that do, and only this join shows it.
 */
export const bySource = () => query<{
  source: string; leads: string; quoted: string; won: string; revenue: string; conv_pct: string;
}>(`
  WITH lead_orders AS (
    SELECT l.id AS lead_id,
           -- Folded the same way the overview folds it. Without this,
           -- "direct" and "Direct" were two channels splitting one channel's
           -- revenue between them — which is the bug this page exists to
           -- avoid making somebody believe.
           initcap(lower(COALESCE(NULLIF(btrim(l.source), ''), 'direct'))) AS source,
           q.id AS quote_id, o.id AS order_id,
           COALESCE((SELECT sum(unit_price * quantity * (1 - discount_pct/100))
                       FROM order_items WHERE order_id = o.id), 0) AS revenue
      FROM leads l
      LEFT JOIN quotes q ON q.lead_id = l.id AND q.deleted_at IS NULL
      LEFT JOIN orders o ON o.quote_id = q.id AND o.deleted_at IS NULL AND o.status <> 'cancelled'
     WHERE l.deleted_at IS NULL
  )
  SELECT source,
         count(DISTINCT lead_id)::text AS leads,
         count(DISTINCT quote_id)::text AS quoted,
         count(DISTINCT order_id)::text AS won,
         COALESCE(sum(revenue), 0)::numeric(14,2)::text AS revenue,
         CASE WHEN count(DISTINCT lead_id) > 0
              THEN round(100.0 * count(DISTINCT order_id) / count(DISTINCT lead_id), 1)::text
              ELSE '0' END AS conv_pct
    FROM lead_orders GROUP BY source ORDER BY 5 DESC, 2 DESC`);

/** Who converts. */
export const bySalesperson = () => query<{
  who: string; quotes: string; accepted: string; conv_pct: string; value: string;
}>(`
  SELECT COALESCE(u.name, 'Unassigned') AS who,
         count(*)::text AS quotes,
         count(*) FILTER (WHERE q.status = 'accepted')::text AS accepted,
         CASE WHEN count(*) > 0
              THEN round(100.0 * count(*) FILTER (WHERE q.status = 'accepted') / count(*), 1)::text
              ELSE '0' END AS conv_pct,
         COALESCE(sum(v.net) FILTER (WHERE q.status = 'accepted'), 0)::numeric(14,2)::text AS value
    FROM quotes q
    LEFT JOIN users u ON u.id = q.created_by
    JOIN LATERAL (
      SELECT COALESCE(sum(unit_price * quantity * (1 - discount_pct/100)), 0) AS net
        FROM quote_items WHERE quote_id = q.id
    ) v ON true
   WHERE q.deleted_at IS NULL AND q.status <> 'superseded'
   GROUP BY 1 ORDER BY 5 DESC`);

/**
 * Stock that is not moving, and the cash sitting in it.
 *
 * Living stock has a holding cost — water, labour, nursery space — so a tree
 * that has been available for eight months is quietly more expensive than the
 * day it landed, and worth a decision.
 */
export const stuckStock = (days = 90) => query<{
  code: string; product_ref: string; status: string; health: string;
  days_held: string; landed_cost_aed: string | null; asking_price_aed: string | null;
  location_name: string | null;
}>(`
  SELECT si.code, si.product_ref, si.status, si.health,
         (current_date - COALESCE(si.arrived_at, si.created_at::date))::text AS days_held,
         si.landed_cost_aed::text, si.asking_price_aed::text,
         loc.name AS location_name
    FROM stock_items si
    LEFT JOIN inventory_locations loc ON loc.id = si.location_id
   WHERE si.deleted_at IS NULL
     AND si.status IN ('available','acclimatising')
     AND current_date - COALESCE(si.arrived_at, si.created_at::date) >= $1
   ORDER BY 5 DESC`, [String(days)]);

/** How much cash is tied up in stock that has not sold. */
export const cashInStock = () => query<{
  specimens: string; specimen_cost: string; batch_units: string; batch_cost: string; total: string;
}>(`
  WITH s AS (
    SELECT count(*) AS n, COALESCE(sum(landed_cost_aed), 0) AS cost
      FROM stock_items
     WHERE deleted_at IS NULL
       AND status IN ('incoming','acclimatising','available','reserved')
  ), b AS (
    SELECT COALESCE(sum(quantity), 0) AS n,
           COALESCE(sum(quantity * COALESCE(landed_unit_cost_aed, 0)), 0) AS cost
      FROM stock_batches WHERE status <> 'depleted'
  )
  SELECT s.n::text AS specimens, s.cost::numeric(14,2)::text AS specimen_cost,
         b.n::text AS batch_units, b.cost::numeric(14,2)::text AS batch_cost,
         (s.cost + b.cost)::numeric(14,2)::text AS total
    FROM s, b`);

/** What is on the water, and whether its permit will still be valid. */
export const incoming = () => query<{
  code: string; status: string; eta: string | null; container_no: string | null;
  supplier: string | null; units: string; permit_number: string | null;
  permit_expires_on: string | null; permit_days_left: string | null;
}>(`
  SELECT s.code, s.status, s.eta::text, s.container_no,
         sup.name AS supplier,
         COALESCE((SELECT sum(quantity) FROM shipment_items si WHERE si.shipment_id = s.id), 0)::text AS units,
         p.permit_number, p.expires_on::text AS permit_expires_on,
         (p.expires_on - current_date)::text AS permit_days_left
    FROM shipments s
    LEFT JOIN suppliers sup ON sup.id = s.supplier_id
    LEFT JOIN import_permits p ON p.id = s.permit_id
   WHERE s.deleted_at IS NULL AND s.status NOT IN ('received','cancelled')
   ORDER BY s.eta NULLS LAST`);

/** The pipeline, as counts rather than a picture. */
export const pipeline = () => query<{ stage: string; n: string; value: string }>(`
  SELECT 'leads' AS stage, count(*)::text AS n, '0' AS value FROM leads
   WHERE deleted_at IS NULL AND status NOT IN ('won','lost')
  UNION ALL
  SELECT 'quoted', count(DISTINCT q.code)::text,
         COALESCE(sum(v.net), 0)::numeric(14,2)::text
    FROM quotes q
    JOIN LATERAL (SELECT COALESCE(sum(unit_price*quantity*(1-discount_pct/100)),0) AS net
                    FROM quote_items WHERE quote_id = q.id) v ON true
   WHERE q.deleted_at IS NULL AND q.status IN ('sent','viewed','negotiation')
  UNION ALL
  SELECT 'accepted', count(DISTINCT q.code)::text,
         COALESCE(sum(v.net), 0)::numeric(14,2)::text
    FROM quotes q
    JOIN LATERAL (SELECT COALESCE(sum(unit_price*quantity*(1-discount_pct/100)),0) AS net
                    FROM quote_items WHERE quote_id = q.id) v ON true
   WHERE q.deleted_at IS NULL AND q.status = 'accepted'`);
