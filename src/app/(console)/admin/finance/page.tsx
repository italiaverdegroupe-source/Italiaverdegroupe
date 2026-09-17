import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import { ageing, getOrder, getOrderItems, orderTotals, nextCode } from '@/lib/orders';
import { getSettings } from '@/lib/settings';
import { fire } from '@/lib/alerts';
import { fmtDay } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

async function raiseInvoice(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot raise invoices.');

  const orderCode = String(formData.get('order_code') ?? '').trim();
  const o = await getOrder(orderCode);
  if (!o) throw new Error(`No order ${orderCode}.`);
  const items = await getOrderItems(o.id);
  const t = orderTotals(o, items);

  const cfg = await getSettings();
  const kind = String(formData.get('kind') ?? 'tax_invoice');
  // An advance invoice bills the agreed percentage, not the whole order.
  const net = kind === 'advance' ? t.net * (Number(o.advance_pct) / 100) : t.net;
  const vat = o.vat_enabled ? Math.round(net * Number(o.vat_rate) * 100) / 100 : 0;
  const retention = kind === 'tax_invoice' ? t.retention : 0;
  const code = await nextCode('INV', 'invoices');

  const rows = await query<{ id: string }>(
    `INSERT INTO invoices
       (code, order_id, kind, status, vat_enabled, vat_rate, trn_at_issue, lpo_number,
        issued_on, due_on, net_aed, vat_aed, total_aed, retention_aed,
        pint_status, notes)
     VALUES ($1,$2,$3,'issued',$4,$5,$6,$7, current_date,
             current_date + ($8 || ' days')::interval,
             $9,$10,$11,$12,
             CASE WHEN $4 THEN 'not_submitted' ELSE 'not_applicable' END, $13)
     RETURNING id`,
    [code, o.id, kind, o.vat_enabled, o.vat_rate, cfg.trn || null, o.lpo_number,
     String(formData.get('terms_days') ?? '30'),
     Math.round(net * 100) / 100, vat, Math.round((net + vat) * 100) / 100, retention,
     String(formData.get('notes') ?? '').trim() || null]);

  await query(
    `INSERT INTO invoice_lines (invoice_id, line_no, description, quantity, unit_price)
     VALUES ($1, 1, $2, 1, $3)`,
    [rows[0].id,
     kind === 'advance' ? `Advance ${o.advance_pct}% against order ${o.code}` : `Order ${o.code}`,
     Math.round(net * 100) / 100]);

  await audit({ user, action: 'invoice.issued', entity: 'invoice', entityId: code,
                after: { order: o.code, kind, total: net + vat } });
  revalidatePath('/admin/finance');
}

async function recordPayment(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot record payments.');

  const invoiceCode = String(formData.get('invoice_code') ?? '').trim();
  const amount = Number(String(formData.get('amount_aed') ?? '0'));
  if (!amount) throw new Error('Enter an amount.');

  const inv = (await query<{ id: string; total_aed: string }>(
    `SELECT id, total_aed FROM invoices WHERE code = $1`, [invoiceCode]))[0];
  if (!inv) throw new Error(`No invoice ${invoiceCode}.`);

  await query(
    `INSERT INTO payments (invoice_id, amount_aed, method, received_on, reference, note, recorded_by)
     VALUES ($1,$2,$3, COALESCE($4::date, current_date), $5,$6,$7)`,
    [inv.id, amount, String(formData.get('method') ?? 'bank_transfer'),
     String(formData.get('received_on') ?? '').trim() || null,
     String(formData.get('reference') ?? '').trim() || null,
     String(formData.get('note') ?? '').trim() || null, user.id]);

  // Status follows the money received, never set by hand.
  await query(
    `UPDATE invoices i
        SET status = CASE
              WHEN COALESCE((SELECT sum(amount_aed) FROM payments p WHERE p.invoice_id = i.id), 0)
                   >= i.total_aed THEN 'paid'
              WHEN COALESCE((SELECT sum(amount_aed) FROM payments p WHERE p.invoice_id = i.id), 0) > 0
                   THEN 'part_paid'
              ELSE i.status END
      WHERE i.id = $1`, [inv.id]);

  await audit({ user, action: 'payment.recorded', entity: 'invoice', entityId: invoiceCode,
                after: { amount } });

  // Cash landing is the one event that closes the loop, and the one the owner
  // most wants to see. The reference makes the alert unique per payment, so a
  // second payment on the same invoice is its own news.
  await fire('payment.received', {
    amount: `AED ${new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(amount)}`,
    invoice: invoiceCode,
    customer: String(formData.get('reference') ?? '').trim() || invoiceCode,
    method: String(formData.get('method') ?? 'bank_transfer'),
  }, {
    subject: `${invoiceCode}:${Date.now()}`,
    title: `Payment received against ${invoiceCode}`,
    body: `AED ${new Intl.NumberFormat('en-AE').format(amount)} recorded by ${user.name}.`,
    entity: 'invoice', entityId: invoiceCode, href: '/admin/finance',
  });
  revalidatePath('/admin/finance');
}

export default async function FinancePage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const site = await getSettings();

  const [invoices, rows, totals] = await Promise.all([
    query<{ code: string; order_code: string | null; kind: string; status: string;
            issued_on: string | null; due_on: string | null; total_aed: string;
            retention_aed: string; paid: string; pint_status: string }>(`
      SELECT i.code, o.code AS order_code, i.kind, i.status, i.issued_on, i.due_on,
             i.total_aed::text, i.retention_aed::text, i.pint_status,
             COALESCE((SELECT sum(amount_aed) FROM payments p WHERE p.invoice_id = i.id), 0)::text AS paid
        FROM invoices i LEFT JOIN orders o ON o.id = i.order_id
       ORDER BY i.issued_on DESC NULLS LAST, i.id DESC LIMIT 200`),
    ageing(),
    query<{ bucket: string; amount: string }>(`
      WITH paid AS (SELECT invoice_id, sum(amount_aed) amount FROM payments GROUP BY invoice_id)
      SELECT CASE
               WHEN i.due_on IS NULL OR current_date <= i.due_on THEN 'current'
               WHEN current_date - i.due_on <= 30 THEN '1-30'
               WHEN current_date - i.due_on <= 60 THEN '31-60'
               WHEN current_date - i.due_on <= 90 THEN '61-90'
               ELSE '90+' END AS bucket,
             sum(i.total_aed - COALESCE(p.amount, 0))::text AS amount
        FROM invoices i LEFT JOIN paid p ON p.invoice_id = i.id
       WHERE i.status NOT IN ('draft','cancelled','paid')
       GROUP BY 1`),
  ]);

  const byBucket = Object.fromEntries(totals.map((t) => [t.bucket, Number(t.amount)]));
  const outstanding = Object.values(byBucket).reduce((s: number, n) => s + Number(n), 0);
  const overdue = outstanding - (byBucket.current ?? 0);

  return (
    <>
      <h1>Finance</h1>
      <p className="adm-sub">
        Contractors here pay late, so what is owed and how late it is sits on the
        front page rather than in a spreadsheet.
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{aed(outstanding)}</b><span>Outstanding</span></div>
        <div className="adm-card"><b>{aed(overdue)}</b><span>Overdue</span></div>
        <div className="adm-card"><b>{aed(byBucket['1-30'] ?? 0)}</b><span>1–30 days</span></div>
        <div className="adm-card"><b>{aed(byBucket['31-60'] ?? 0)}</b><span>31–60 days</span></div>
        <div className="adm-card"><b>{aed(byBucket['61-90'] ?? 0)}</b><span>61–90 days</span></div>
        <div className="adm-card"><b>{aed(byBucket['90+'] ?? 0)}</b><span>Over 90 days</span></div>
      </div>

      {!site.vatEnabled && (
        <p className="adm-sub">
          VAT is off and no TRN is set, so invoices carry no VAT line and are marked
          not applicable for e-invoicing. UAE e-invoicing is Peppol PINT AE — structured
          XML through an accredited provider, not a PDF — and the identifiers it needs are
          already on each invoice, so switching it on is a mapping rather than a migration.
        </p>
      )}

      <h2>Ageing</h2>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {rows.length === 0 ? <p className="adm-empty">Nothing outstanding.</p> : (
          <table className="adm-t">
            <thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th>Total</th>
                       <th>Paid</th><th>Outstanding</th><th>Days over</th><th>Bucket</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.invoice}>
                  <td>{r.invoice}</td>
                  <td>{r.customer ?? '—'}</td>
                  <td className="num">{r.due_on ? fmtDay(r.due_on) : '—'}</td>
                  <td className="num">{aed(Number(r.total))}</td>
                  <td className="num">{aed(Number(r.paid))}</td>
                  <td className="num"><b>{aed(Number(r.outstanding))}</b></td>
                  <td className="num">{r.days_overdue || '—'}</td>
                  <td><span className={`pill pill-${r.bucket === 'current' ? 'won' : r.bucket === '90+' ? 'lost' : 'negotiation'}`}>{r.bucket}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2>Invoices</h2>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {invoices.length === 0 ? <p className="adm-empty">No invoices raised.</p> : (
          <table className="adm-t">
            <thead><tr><th>Invoice</th><th>Order</th><th>Kind</th><th>Status</th>
                       <th>Issued</th><th>Due</th><th>Total</th><th>Paid</th>
                       <th>Retention</th><th>e-invoice</th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.code}>
                  <td>{i.code}</td>
                  <td>{i.order_code ? <Link href={`/admin/orders/${i.order_code}`}>{i.order_code}</Link> : '—'}</td>
                  <td>{i.kind.replace(/_/g,' ')}</td>
                  <td><span className={`pill pill-${i.status === 'paid' ? 'won' : i.status === 'overdue' ? 'lost' : i.status === 'part_paid' ? 'negotiation' : 'quoted'}`}>{i.status.replace(/_/g,' ')}</span></td>
                  <td className="num">{i.issued_on ? fmtDay(i.issued_on) : '—'}</td>
                  <td className="num">{i.due_on ? fmtDay(i.due_on) : '—'}</td>
                  <td className="num">{aed(Number(i.total_aed))}</td>
                  <td className="num">{aed(Number(i.paid))}</td>
                  <td className="num">{Number(i.retention_aed) ? aed(Number(i.retention_aed)) : '—'}</td>
                  <td>{i.pint_status.replace(/_/g,' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role !== 'viewer' && (
        <div className="adm-two">
          <div className="adm-panel adm-pad">
            <h2>Raise an invoice</h2>
            <form action={raiseInvoice}>
              <label className="adm-field"><span>Order code *</span>
                <input name="order_code" required placeholder="ORD-000001" /></label>
              <label className="adm-field"><span>Kind</span>
                <select name="kind" defaultValue="tax_invoice">
                  <option value="advance">advance — the agreed percentage up front</option>
                  <option value="tax_invoice">tax invoice — the order</option>
                  <option value="retention">retention — released after the holding period</option>
                  <option value="proforma">proforma</option>
                </select>
              </label>
              <label className="adm-field"><span>Payment terms (days)</span>
                <input name="terms_days" type="number" min={0} defaultValue={30} /></label>
              <label className="adm-field"><span>Notes</span><input name="notes" /></label>
              <button className="adm-btn adm-invoice" type="submit" style={{ width:'100%' }}>Raise</button>
            </form>
          </div>

          <div className="adm-panel adm-pad">
            <h2>Record a payment</h2>
            <form action={recordPayment}>
              <label className="adm-field"><span>Invoice code *</span>
                <input name="invoice_code" required placeholder="INV-000001" /></label>
              <label className="adm-field"><span>Amount (AED) *</span>
                <input name="amount_aed" type="number" step="0.01" required /></label>
              <label className="adm-field"><span>Method</span>
                <select name="method" defaultValue="bank_transfer">
                  {['bank_transfer','cheque','cash','card','other'].map((m) => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>Received on</span><input name="received_on" type="date" /></label>
              <label className="adm-field"><span>Reference</span><input name="reference" /></label>
              <button className="adm-btn adm-payment" type="submit" style={{ width:'100%' }}>Record</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
