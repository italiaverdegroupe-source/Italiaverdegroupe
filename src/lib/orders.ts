import { requirePool, query } from '@/lib/db';

export const ORDER_STATUSES = [
  'confirmed', 'preparing', 'partially_delivered', 'delivered', 'completed', 'cancelled',
] as const;
export const DELIVERY_STATUSES = [
  'scheduled', 'loaded', 'out_for_delivery', 'delivered', 'failed', 'cancelled',
] as const;
export const INVOICE_STATUSES = ['draft','issued','part_paid','paid','overdue','cancelled'] as const;

const r2 = (n: number) => Math.round(n * 100) / 100;

export type Order = {
  id: string; code: string; quote_id: string | null; customer_id: string | null;
  customer_name: string; customer_company: string | null; customer_email: string | null;
  customer_phone: string | null; emirate: string | null; project_name: string | null;
  site_address: string | null; lpo_number: string | null;
  status: string; currency: string; vat_enabled: boolean; vat_rate: string;
  advance_pct: string; retention_pct: string; retention_release_on: string | null;
  confirmed_on: string; required_by: string | null; completed_on: string | null;
  notes: string | null; created_at: string;
};

export type OrderItem = {
  id: string; line_no: number; kind: string; stock_item_id: string | null;
  batch_id: string | null; product_ref: string | null; description: string;
  quantity: number; delivered_qty: number; unit_price: string; discount_pct: string;
  landed_unit_cost_aed: string | null; specimen_code?: string | null;
};

export async function nextCode(prefix: 'ORD' | 'DLV' | 'INV', table: string): Promise<string> {
  const rows = await query<{ n: string | null }>(
    `SELECT max(substring(code from '[0-9]+$')::bigint)::text AS n
       FROM ${table} WHERE code LIKE $1`, [`${prefix}-%`]);
  return `${prefix}-${String(Number(rows[0]?.n ?? 0) + 1).padStart(6, '0')}`;
}

export const listOrders = (status?: string) =>
  query<Order & { item_count: string; delivered_lines: string }>(
    `SELECT o.*,
            (SELECT count(*) FROM order_items i WHERE i.order_id = o.id)::text AS item_count,
            (SELECT count(*) FROM order_items i
              WHERE i.order_id = o.id AND i.delivered_qty >= i.quantity)::text AS delivered_lines
       FROM orders o ${status ? 'WHERE o.status = $1' : ''}
      ORDER BY o.created_at DESC LIMIT 200`, status ? [status] : []);

export async function getOrder(code: string): Promise<Order | undefined> {
  return (await query<Order>(`SELECT * FROM orders WHERE code = $1`, [code]))[0];
}

export const getOrderItems = (orderId: string) =>
  query<OrderItem>(
    `SELECT oi.*, si.code AS specimen_code
       FROM order_items oi LEFT JOIN stock_items si ON si.id = oi.stock_item_id
      WHERE oi.order_id = $1 ORDER BY oi.line_no, oi.id`, [orderId]);

export const getDeliveries = (orderId: string) =>
  query<{ id: string; code: string; status: string; scheduled_for: string | null;
          delivered_at: string | null; driver: string | null; vehicle: string | null;
          equipment: string | null; received_by: string | null; line_count: string }>(
    `SELECT d.*, (SELECT count(*) FROM delivery_items di WHERE di.delivery_id = d.id)::text AS line_count
       FROM deliveries d WHERE d.order_id = $1 ORDER BY d.scheduled_for NULLS LAST, d.id`, [orderId]);

export function orderTotals(o: Order, items: OrderItem[]) {
  let gross = 0, discount = 0, cost = 0, deliveredNet = 0;
  for (const it of items) {
    const g = Number(it.unit_price) * it.quantity;
    const d = g * (Number(it.discount_pct) / 100);
    gross += g; discount += d;
    cost += Number(it.landed_unit_cost_aed ?? 0) * it.quantity;
    deliveredNet += (Number(it.unit_price) * it.delivered_qty) * (1 - Number(it.discount_pct) / 100);
  }
  const net = r2(gross - discount);
  const vat = o.vat_enabled ? r2(net * Number(o.vat_rate)) : 0;
  const total = r2(net + vat);
  return {
    gross: r2(gross), discount: r2(discount), net, vat, total,
    cost: r2(cost), profit: r2(net - cost),
    marginPct: net > 0 ? Math.round(((net - cost) / net) * 1000) / 10 : 0,
    advance: r2(total * (Number(o.advance_pct) / 100)),
    retention: r2(total * (Number(o.retention_pct) / 100)),
    deliveredNet: r2(deliveredNet),
    fulfilledPct: gross > 0 ? Math.round((deliveredNet / net) * 1000) / 10 : 0,
  };
}

/**
 * Turn an accepted quotation into an order without re-entering anything.
 *
 * Prices, discounts and the landed-cost snapshot are copied across as they
 * were quoted. Re-deriving them here would let an order drift from the
 * document the customer accepted.
 */
export async function orderFromQuote(
  quoteCode: string, version: number, user: { id: number; email: string },
  extra: { lpo_number?: string | null; site_address?: string | null;
           advance_pct?: number; retention_pct?: number; required_by?: string | null } = {},
) {
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [q] } = await client.query(
      `SELECT * FROM quotes WHERE code = $1 AND version = $2 FOR UPDATE`, [quoteCode, version]);
    if (!q) throw new Error(`No quotation ${quoteCode} v${version}.`);
    if (q.status !== 'accepted') {
      throw new Error('Only an accepted quotation becomes an order.');
    }
    const { rows: [existing] } = await client.query(
      `SELECT code FROM orders WHERE quote_id = $1`, [q.id]);
    if (existing) throw new Error(`That quotation is already order ${existing.code}.`);

    const { rows: [seq] } = await client.query(
      `SELECT COALESCE(max(substring(code from '[0-9]+$')::bigint), 0) + 1 AS n
         FROM orders WHERE code LIKE 'ORD-%'`);
    const code = `ORD-${String(seq.n).padStart(6, '0')}`;

    // ── the customer, which nothing was creating ────────────────
    //
    // A quotation holds its customer as free text, because at that stage there
    // may be no relationship yet — somebody who asks for a price is not
    // necessarily somebody the company has an account for. An ORDER is the
    // point that changes, and the code copied the same free text onto the
    // order and left `customer_id` NULL.
    //
    // Everything that reads a customer therefore read nothing: the invoice
    // document had no name to bill, the ageing report joined to a row that did
    // not exist, credit limits could not be checked against anybody, and the
    // customers table stayed on its single seeded row no matter how much
    // business went through. Found by walking the chain to the end and looking
    // at the document a customer would actually be sent.
    //
    // Matched on EMAIL, lower-cased, because it is the one field that is both
    // usually present and actually unique — matching on a company name would
    // merge two different "Al Nahda Landscaping"s, and matching on nothing
    // would create a new customer for every repeat order, which is the same
    // failure pointed the other way. No email means a new record, which is
    // honest: without one there is nothing to recognise them by.
    const email = String(q.customer_email ?? '').trim().toLowerCase();
    let customerId: string | null = null;
    if (email) {
      const { rows: [hit] } = await client.query(
        `SELECT id FROM customers WHERE lower(email) = $1 LIMIT 1`, [email]);
      customerId = hit?.id ?? null;
    }
    if (!customerId) {
      const { rows: [cseq] } = await client.query(
        `SELECT COALESCE(max(substring(code from '[0-9]+$')::bigint), 0) + 1 AS n
           FROM customers WHERE code LIKE 'CUS-0%'`);
      const { rows: [made] } = await client.query(
        `INSERT INTO customers (code, name, company, email, phone, emirate)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [`CUS-${String(cseq.n).padStart(6, '0')}`,
         q.customer_name ?? '—', q.customer_company ?? null,
         q.customer_email ?? null, q.customer_phone ?? null, q.emirate ?? null]);
      customerId = made.id;
    }

    const { rows: [order] } = await client.query(
      `INSERT INTO orders
         (code, quote_id, customer_id,
          customer_name, customer_company, customer_email, customer_phone,
          emirate, project_name, site_address, lpo_number, status, currency,
          vat_enabled, vat_rate, advance_pct, retention_pct, required_by, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'confirmed',$12,$13,$14,$15,$16,$17,$18)
       RETURNING id, code`,
      [code, q.id, customerId,
       q.customer_name, q.customer_company, q.customer_email, q.customer_phone,
       q.emirate, q.project_name, extra.site_address ?? null, extra.lpo_number ?? null,
       q.currency, q.vat_enabled, q.vat_rate,
       extra.advance_pct ?? 0, extra.retention_pct ?? 0, extra.required_by ?? null, user.id]);

    await client.query(
      `INSERT INTO order_items
         (order_id, line_no, kind, stock_item_id, batch_id, product_ref, description,
          quantity, unit_price, discount_pct, landed_unit_cost_aed)
       SELECT $2, line_no, kind, stock_item_id, batch_id, product_ref, description,
              quantity, unit_price, discount_pct, landed_unit_cost_aed
         FROM quote_items WHERE quote_id = $1 ORDER BY line_no`,
      [q.id, order.id]);

    await client.query(
      `INSERT INTO quote_events (quote_id, user_id, user_email, kind, note)
       VALUES ($1,$2,$3,'converted',$4)`,
      [q.id, user.id, user.email, `Became order ${code}`]);

    await client.query('COMMIT');

    // After the commit and in its own try, for the same reason as acceptance:
    // the order exists, and failing to announce it must not undo it.
    try {
      const { fire } = await import('@/lib/alerts');
      const total = (await client.query<{ net: string }>(
        `SELECT COALESCE(sum(unit_price * quantity * (1 - discount_pct/100)), 0)::text AS net
           FROM order_items WHERE order_id = $1`, [order.id])).rows[0]?.net ?? '0';
      const customer = q.customer_company || q.customer_name;
      await fire('order.confirmed', {
        code: order.code as string, customer,
        total: `AED ${new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Number(total))}`,
      }, {
        subject: order.code as string,
        title: `Order ${order.code} confirmed for ${customer}`,
        body: `Converted from quotation ${q.code}. Fulfilment, invoicing and delivery planning start here.`,
        entity: 'order', entityId: order.code as string, href: `/admin/orders/${order.code}`,
      });
    } catch (err) {
      console.error('[alerts] order.confirmed:', err);
    }

    return { code: order.code as string, id: order.id as string };
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

/**
 * Mark a delivery delivered: add its quantities to the order lines, move the
 * stock, and re-derive the order status from what is actually outstanding.
 *
 * The order status is never set by hand — it is a function of the lines, so
 * "partially delivered" cannot drift out of step with the quantities.
 */
export async function completeDelivery(
  deliveryCode: string, receivedBy: string, note: string | null,
  user: { id: number; email: string },
) {
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [d] } = await client.query(
      `SELECT * FROM deliveries WHERE code = $1 FOR UPDATE`, [deliveryCode]);
    if (!d) throw new Error(`No delivery ${deliveryCode}.`);
    if (d.status === 'delivered') throw new Error('That delivery is already completed.');

    const { rows: lines } = await client.query(
      `SELECT di.quantity, oi.id AS order_item_id, oi.quantity AS ordered,
              oi.delivered_qty, oi.stock_item_id, oi.batch_id, oi.description
         FROM delivery_items di
         JOIN order_items oi ON oi.id = di.order_item_id
        WHERE di.delivery_id = $1
        FOR UPDATE OF oi`, [d.id]);
    if (lines.length === 0) throw new Error('That delivery has no lines.');

    for (const l of lines) {
      if (l.delivered_qty + l.quantity > l.ordered) {
        throw new Error(
          `${l.description}: delivering ${l.quantity} would exceed the ${l.ordered} ordered.`);
      }
      await client.query(
        `UPDATE order_items SET delivered_qty = delivered_qty + $2 WHERE id = $1`,
        [l.order_item_id, l.quantity]);

      if (l.stock_item_id) {
        await client.query(
          `UPDATE stock_items SET status = 'sold', updated_at = now() WHERE id = $1`,
          [l.stock_item_id]);
        await client.query(
          `INSERT INTO inventory_movements
             (user_id, user_email, stock_item_id, kind, quantity, from_status, to_status, reason, ref_type, ref_id)
           VALUES ($1,$2,$3,'sale',1,'reserved','sold',$4,'delivery',$5)`,
          [user.id, user.email, l.stock_item_id, `Delivered on ${deliveryCode}`, deliveryCode]);
      }
      if (l.batch_id) {
        await client.query(
          `UPDATE stock_batches
              SET quantity = quantity - $2,
                  reserved = GREATEST(reserved - $2, 0),
                  updated_at = now()
            WHERE id = $1`, [l.batch_id, l.quantity]);
        await client.query(
          `INSERT INTO inventory_movements
             (user_id, user_email, batch_id, kind, quantity, reason, ref_type, ref_id)
           VALUES ($1,$2,$3,'sale',$4,$5,'delivery',$6)`,
          [user.id, user.email, l.batch_id, l.quantity, `Delivered on ${deliveryCode}`, deliveryCode]);
      }
    }

    await client.query(
      `UPDATE deliveries
          SET status = 'delivered', delivered_at = now(), received_by = $2, proof_note = $3
        WHERE id = $1`, [d.id, receivedBy, note]);

    // Status follows the quantities, never the other way round.
    await client.query(
      `UPDATE orders o
          SET status = CASE
                WHEN NOT EXISTS (SELECT 1 FROM order_items i
                                  WHERE i.order_id = o.id AND i.delivered_qty < i.quantity)
                  THEN 'delivered'
                WHEN EXISTS (SELECT 1 FROM order_items i
                              WHERE i.order_id = o.id AND i.delivered_qty > 0)
                  THEN 'partially_delivered'
                ELSE o.status END,
              updated_at = now()
        WHERE o.id = $1`, [d.order_id]);

    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

/* ── receivables ──────────────────────────────────────────────
   Contractors pay late here; an ageing view is the difference between a busy
   year and an insolvent one. */

export type Ageing = {
  invoice: string; customer: string | null; due_on: string | null;
  total: string; paid: string; outstanding: string; days_overdue: number; bucket: string;
};

export const ageing = () =>
  query<Ageing>(`
    WITH paid AS (
      SELECT invoice_id, COALESCE(sum(amount_aed), 0) AS amount
        FROM payments GROUP BY invoice_id
    )
    SELECT i.code AS invoice,
           COALESCE(c.company, c.name) AS customer,
           i.due_on,
           i.total_aed::text AS total,
           COALESCE(p.amount, 0)::text AS paid,
           (i.total_aed - COALESCE(p.amount, 0))::text AS outstanding,
           GREATEST(current_date - i.due_on, 0) AS days_overdue,
           CASE
             WHEN i.due_on IS NULL OR current_date <= i.due_on THEN 'current'
             WHEN current_date - i.due_on <= 30 THEN '1-30'
             WHEN current_date - i.due_on <= 60 THEN '31-60'
             WHEN current_date - i.due_on <= 90 THEN '61-90'
             ELSE '90+'
           END AS bucket
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      LEFT JOIN paid p ON p.invoice_id = i.id
     WHERE i.status NOT IN ('draft','cancelled','paid')
       AND i.total_aed - COALESCE(p.amount, 0) > 0
     ORDER BY i.due_on NULLS LAST`);

/** What a customer already owes, against what they are allowed to owe. */
export const creditPosition = (customerId: string) =>
  query<{ credit_limit: string; outstanding: string; headroom: string }>(`
    SELECT c.credit_limit_aed::text AS credit_limit,
           COALESCE(o.amount, 0)::text AS outstanding,
           (c.credit_limit_aed - COALESCE(o.amount, 0))::text AS headroom
      FROM customers c
      LEFT JOIN LATERAL (
        SELECT sum(i.total_aed - COALESCE(p.amount, 0)) AS amount
          FROM invoices i
          LEFT JOIN (SELECT invoice_id, sum(amount_aed) AS amount FROM payments GROUP BY invoice_id) p
                 ON p.invoice_id = i.id
         WHERE i.customer_id = c.id AND i.status NOT IN ('draft','cancelled','paid')
      ) o ON true
     WHERE c.id = $1`, [customerId]);

/**
 * One invoice, with everything a document needs to state about it.
 *
 * Written when the invoice turned out to have no printable sheet at all: it
 * could be raised, paid against and aged in the console, and never sent to the
 * customer it billed. The customer's own details come from the row rather than
 * from the order, because an invoice is a historical record — re-reading a
 * customer who has since moved would rewrite a document already sent.
 */
export type InvoiceDoc = {
  code: string; kind: string; status: string;
  issued_on: string | null; due_on: string | null;
  currency: string; vat_enabled: boolean; vat_rate: string;
  trn_at_issue: string | null; lpo_number: string | null; notes: string | null;
  net: string; vat: string; total: string; retention: string;
  paid: string; outstanding: string;
  order_code: string | null; site_address: string | null;
  customer_name: string | null; customer_company: string | null;
  customer_email: string | null; customer_phone: string | null;
  customer_address: string | null; customer_trn: string | null;
  customer_emirate: string | null;
};

export async function getInvoice(code: string): Promise<InvoiceDoc | undefined> {
  const rows = await query<InvoiceDoc>(`
    SELECT i.code, i.kind, i.status,
           i.issued_on::text, i.due_on::text,
           i.currency, i.vat_enabled, i.vat_rate::text,
           i.trn_at_issue, i.lpo_number, i.notes,
           i.net_aed::text AS net, i.vat_aed::text AS vat,
           i.total_aed::text AS total, i.retention_aed::text AS retention,
           COALESCE(p.amount, 0)::text AS paid,
           (i.total_aed - COALESCE(p.amount, 0))::text AS outstanding,
           o.code AS order_code, o.site_address,
           c.name AS customer_name, c.company AS customer_company,
           c.email AS customer_email, c.phone AS customer_phone,
           c.address AS customer_address, c.trn AS customer_trn,
           c.emirate AS customer_emirate
      FROM invoices i
      LEFT JOIN orders o    ON o.id = i.order_id
      LEFT JOIN customers c ON c.id = i.customer_id
      LEFT JOIN (SELECT invoice_id, sum(amount_aed) AS amount
                   FROM payments GROUP BY invoice_id) p ON p.invoice_id = i.id
     WHERE i.code = $1`, [code]);
  return rows[0];
}

export const getInvoiceLines = (code: string) =>
  query<{ line_no: number; description: string; quantity: number;
          unit_price: string; discount_pct: string }>(`
    SELECT l.line_no, l.description, l.quantity,
           l.unit_price::text, l.discount_pct::text
      FROM invoice_lines l
      JOIN invoices i ON i.id = l.invoice_id
     WHERE i.code = $1
     ORDER BY l.line_no`, [code]);

/** What has been paid against an invoice, so the document can show the balance. */
export const getInvoicePayments = (code: string) =>
  query<{ received_on: string; amount: string; method: string | null;
          reference: string | null }>(`
    SELECT p.received_on::text, p.amount_aed::text AS amount, p.method, p.reference
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
     WHERE i.code = $1
     ORDER BY p.received_on, p.id`, [code]);
