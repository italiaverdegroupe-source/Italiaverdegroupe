import { requirePool, query } from '@/lib/db';
import { site } from '@/lib/site';

export const QUOTE_STATUSES = [
  'draft', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected', 'expired', 'superseded',
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/** Once a quotation has left the building it is a document, not a draft. */
export const ISSUED: readonly QuoteStatus[] = ['sent', 'viewed', 'negotiation', 'accepted'];

export type Quote = {
  id: string; code: string; version: number; supersedes_id: string | null;
  lead_id: string | null; customer_name: string; customer_company: string | null;
  customer_email: string | null; customer_phone: string | null;
  emirate: string | null; project_name: string | null;
  status: QuoteStatus; currency: string;
  vat_enabled: boolean; vat_rate: string; trn_at_issue: string | null;
  issued_on: string | null; valid_until: string | null; accepted_on: string | null;
  delivery_terms: string | null; payment_terms: string | null;
  terms: string | null; notes: string | null; internal_note: string | null;
  created_at: string;
};

export type QuoteItem = {
  id: string; line_no: number; kind: 'specimen' | 'product' | 'service';
  stock_item_id: string | null; batch_id: string | null;
  product_ref: string | null; description: string;
  quantity: number; unit_price: string; discount_pct: string;
  landed_unit_cost_aed: string | null;
  specimen_code?: string | null;
};

export type Totals = {
  subtotal: number; discount: number; net: number;
  vat: number; total: number; cost: number; profit: number; marginPct: number;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Money is derived from the stored line values, never from live settings. */
export function totalsOf(q: Quote, items: QuoteItem[]): Totals {
  let subtotal = 0, discount = 0, cost = 0;
  for (const it of items) {
    const gross = Number(it.unit_price) * it.quantity;
    const disc = gross * (Number(it.discount_pct) / 100);
    subtotal += gross;
    discount += disc;
    cost += Number(it.landed_unit_cost_aed ?? 0) * it.quantity;
  }
  const net = r2(subtotal - discount);
  const vat = q.vat_enabled ? r2(net * Number(q.vat_rate)) : 0;
  const profit = r2(net - cost);
  return {
    subtotal: r2(subtotal), discount: r2(discount), net,
    vat, total: r2(net + vat), cost: r2(cost), profit,
    marginPct: net > 0 ? Math.round((profit / net) * 1000) / 10 : 0,
  };
}

export async function nextQuoteCode(): Promise<string> {
  const rows = await query<{ n: string | null }>(
    `SELECT max(substring(code from '[0-9]+$')::bigint)::text AS n
       FROM quotes WHERE code LIKE 'QT-%'`);
  return `QT-${String(Number(rows[0]?.n ?? 0) + 1).padStart(6, '0')}`;
}

const QUOTE_SELECT = `SELECT * FROM quotes`;

export const listQuotes = (status?: string) =>
  query<Quote & { item_count: string }>(
    `SELECT q.*, (SELECT count(*) FROM quote_items i WHERE i.quote_id = q.id)::text AS item_count
       FROM quotes q ${status ? 'WHERE q.status = $1' : ''}
      ORDER BY q.created_at DESC LIMIT 200`, status ? [status] : []);

export async function getQuote(code: string, version?: number): Promise<Quote | undefined> {
  const rows = version
    ? await query<Quote>(`${QUOTE_SELECT} WHERE code = $1 AND version = $2`, [code, version])
    : await query<Quote>(`${QUOTE_SELECT} WHERE code = $1 ORDER BY version DESC LIMIT 1`, [code]);
  return rows[0];
}

export const getQuoteVersions = (code: string) =>
  query<Quote>(`${QUOTE_SELECT} WHERE code = $1 ORDER BY version DESC`, [code]);

export const getQuoteItems = (quoteId: string) =>
  query<QuoteItem>(
    `SELECT qi.*, si.code AS specimen_code
       FROM quote_items qi
       LEFT JOIN stock_items si ON si.id = qi.stock_item_id
      WHERE qi.quote_id = $1 ORDER BY qi.line_no, qi.id`, [quoteId]);

export const getQuoteEvents = (quoteId: string) =>
  query<{ id: string; at: string; user_email: string | null; kind: string; note: string | null }>(
    `SELECT id, at, user_email, kind, note FROM quote_events
      WHERE quote_id = $1 ORDER BY at DESC`, [quoteId]);

export async function logQuoteEvent(
  quoteId: string, kind: string, user: { id: number; email: string } | null, note?: string,
) {
  await query(
    `INSERT INTO quote_events (quote_id, user_id, user_email, kind, note)
     VALUES ($1,$2,$3,$4,$5)`,
    [quoteId, user?.id ?? null, user?.email ?? null, kind, note ?? null]);
}

/**
 * Copy a quotation into a new version rather than editing it.
 *
 * A customer holds the document that was sent. Editing it in place makes
 * "what did we actually quote, and when" unanswerable, and turns an honest
 * repricing into something that looks like a rewrite.
 */
export async function newVersion(code: string, user: { id: number; email: string }) {
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [current] } = await client.query<Quote>(
      `SELECT * FROM quotes WHERE code = $1 ORDER BY version DESC LIMIT 1 FOR UPDATE`, [code]);
    if (!current) throw new Error(`No quotation ${code}.`);

    const { rows: [copy] } = await client.query<{ id: string; version: number }>(
      `INSERT INTO quotes
         (code, version, supersedes_id, lead_id, customer_name, customer_company,
          customer_email, customer_phone, emirate, project_name, status, currency,
          vat_enabled, vat_rate, trn_at_issue, valid_until,
          delivery_terms, payment_terms, terms, notes, internal_note, created_by)
       SELECT code, $2, id, lead_id, customer_name, customer_company,
              customer_email, customer_phone, emirate, project_name, 'draft', currency,
              vat_enabled, vat_rate, trn_at_issue, valid_until,
              delivery_terms, payment_terms, terms, notes, internal_note, $3
         FROM quotes WHERE id = $1
       RETURNING id, version`,
      [current.id, current.version + 1, user.id]);

    // Specimen lines are deliberately NOT copied: the unique index keeps one
    // specimen on one quotation, and the tree may no longer be available.
    await client.query(
      `INSERT INTO quote_items
         (quote_id, line_no, kind, batch_id, product_ref, description,
          quantity, unit_price, discount_pct, landed_unit_cost_aed)
       SELECT $2, line_no, kind, batch_id, product_ref, description,
              quantity, unit_price, discount_pct, landed_unit_cost_aed
         FROM quote_items WHERE quote_id = $1 AND kind <> 'specimen'`,
      [current.id, copy.id]);

    await client.query(
      `UPDATE quotes SET status = 'superseded', updated_at = now() WHERE id = $1`, [current.id]);
    await client.query(
      `INSERT INTO quote_events (quote_id, user_id, user_email, kind, note)
       VALUES ($1,$2,$3,'superseded',$4), ($5,$2,$3,'version_created',$6)`,
      [current.id, user.id, user.email, `Replaced by version ${copy.version}`,
       copy.id, `Copied from version ${current.version}`]);

    await client.query('COMMIT');
    return { id: copy.id, version: copy.version };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Accept a quotation and reserve what it sells, in one transaction.
 *
 * Specimens are locked with SELECT … FOR UPDATE before their status is read,
 * so two salespeople accepting at the same moment cannot both take the same
 * tree — the second transaction waits, sees `reserved`, and is refused. A
 * check done in application code without the lock would let both through.
 */
export async function acceptQuote(code: string, version: number, user: { id: number; email: string }) {
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [q] } = await client.query<Quote>(
      `SELECT * FROM quotes WHERE code = $1 AND version = $2 FOR UPDATE`, [code, version]);
    if (!q) throw new Error(`No quotation ${code} v${version}.`);
    if (q.status === 'accepted') throw new Error('That quotation is already accepted.');
    if (q.status === 'superseded') throw new Error('That version has been superseded.');

    const { rows: items } = await client.query<QuoteItem>(
      `SELECT * FROM quote_items WHERE quote_id = $1`, [q.id]);

    const reservedSpecimens: string[] = [];
    for (const it of items) {
      if (it.kind === 'specimen' && it.stock_item_id) {
        const { rows: [s] } = await client.query<{ code: string; status: string }>(
          `SELECT code, status FROM stock_items WHERE id = $1 FOR UPDATE`, [it.stock_item_id]);
        if (!s) throw new Error('A specimen on this quotation no longer exists.');
        if (s.status !== 'available') {
          throw new Error(`${s.code} is ${s.status} and cannot be reserved.`);
        }
        await client.query(
          `UPDATE stock_items SET status = 'reserved', updated_at = now() WHERE id = $1`,
          [it.stock_item_id]);
        await client.query(
          `INSERT INTO inventory_movements
             (user_id, user_email, stock_item_id, kind, quantity, from_status, to_status, reason, ref_type, ref_id)
           VALUES ($1,$2,$3,'reserve',1,'available','reserved',$4,'quote',$5)`,
          [user.id, user.email, it.stock_item_id, `Quotation ${code} v${version} accepted`, code]);
        reservedSpecimens.push(s.code);
      }

      if (it.kind === 'product' && it.batch_id) {
        const { rows: [b] } = await client.query<{ code: string; quantity: number; reserved: number }>(
          `SELECT code, quantity, reserved FROM stock_batches WHERE id = $1 FOR UPDATE`, [it.batch_id]);
        if (!b) throw new Error('A lot on this quotation no longer exists.');
        if (b.quantity - b.reserved < it.quantity) {
          throw new Error(
            `${b.code} has ${b.quantity - b.reserved} unreserved, the quotation needs ${it.quantity}.`);
        }
        await client.query(
          `UPDATE stock_batches SET reserved = reserved + $2, updated_at = now() WHERE id = $1`,
          [it.batch_id, it.quantity]);
        await client.query(
          `INSERT INTO inventory_movements
             (user_id, user_email, batch_id, kind, quantity, reason, ref_type, ref_id)
           VALUES ($1,$2,$3,'reserve',$4,$5,'quote',$6)`,
          [user.id, user.email, it.batch_id, it.quantity,
           `Quotation ${code} v${version} accepted`, code]);
      }
    }

    await client.query(
      `UPDATE quotes SET status = 'accepted', accepted_on = current_date, updated_at = now()
        WHERE id = $1`, [q.id]);
    await client.query(
      `INSERT INTO quote_events (quote_id, user_id, user_email, kind, note)
       VALUES ($1,$2,$3,'accepted',$4)`,
      [q.id, user.id, user.email,
       reservedSpecimens.length ? `Reserved ${reservedSpecimens.join(', ')}` : null]);

    await client.query('COMMIT');
    return { reservedSpecimens };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** The tax position to stamp on a new quotation, taken once at creation. */
export function taxSnapshot() {
  return {
    vat_enabled: site.vatEnabled,
    vat_rate: site.vatEnabled ? site.vatRate : 0,
    trn_at_issue: site.trn || null,
  };
}
