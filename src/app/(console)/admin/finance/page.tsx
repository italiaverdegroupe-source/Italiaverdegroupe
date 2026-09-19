import Link from 'next/link';
import { refuse } from '@/app/(console)/admin/refuse';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import { ageing, getOrder, getOrderItems, orderTotals, nextCode } from '@/lib/orders';
import { getSettings } from '@/lib/settings';
import { fire } from '@/lib/alerts';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';
import DeleteControls from '@/components/admin/DeleteControls';
import Refusal from '@/components/admin/Refusal';

export const dynamic = 'force-dynamic';

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

async function raiseInvoice(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const tr = adminUi(user.locale);
  if (user.role === 'viewer') refuse('/admin/finance', tr('Viewers cannot raise invoices.'));

  const orderCode = String(formData.get('order_code') ?? '').trim();
  const o = await getOrder(orderCode);
  if (!o) refuse('/admin/finance', tr('No order {code}.', { code: orderCode }));
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
    // customer_id comes off the ORDER rather than being looked up again: the
    // order is where the relationship was established, and an invoice that
    // resolved its own customer could bill a different row than the order it
    // came from. Without it the invoice document had nobody to bill and the
    // ageing report had nobody to chase.
    `INSERT INTO invoices
       (code, order_id, customer_id, kind, status, vat_enabled, vat_rate,
        trn_at_issue, lpo_number,
        issued_on, due_on, net_aed, vat_aed, total_aed, retention_aed,
        pint_status, notes)
     VALUES ($1,$2,$3,$4,'issued',$5,$6,$7,$8, current_date,
             current_date + ($9 || ' days')::interval,
             $10,$11,$12,$13,
             CASE WHEN $5 THEN 'not_submitted' ELSE 'not_applicable' END, $14)
     RETURNING id`,
    [code, o.id, o.customer_id ?? null, kind, o.vat_enabled, o.vat_rate, cfg.trn || null, o.lpo_number,
     String(formData.get('terms_days') ?? '30'),
     Math.round(net * 100) / 100, vat, Math.round((net + vat) * 100) / 100, retention,
     String(formData.get('notes') ?? '').trim() || null]);

  // ── what the invoice actually says was sold ────────────────
  //
  // Every invoice used to carry one line reading "Order ORD-000004". That is
  // a reference, not a description, and it fails the document twice over: a
  // customer cannot check an invoice against what they received, and a tax
  // invoice is required to describe the goods. It also made the totals
  // unauditable — a single figure with nothing behind it.
  //
  // A full invoice now copies the order's own lines. An ADVANCE or a
  // RETENTION invoice keeps the single line, and correctly: it bills a
  // percentage of the order rather than particular trees, and itemising it
  // would state that those specific specimens are being charged for in full.
  if (kind === 'tax_invoice' || kind === 'proforma') {
    await query(
      `INSERT INTO invoice_lines
         (invoice_id, line_no, description, quantity, unit_price, discount_pct)
       SELECT $1, line_no, description, quantity, unit_price, discount_pct
         FROM order_items WHERE order_id = $2 ORDER BY line_no`,
      [rows[0].id, o.id]);
  } else {
    await query(
      `INSERT INTO invoice_lines (invoice_id, line_no, description, quantity, unit_price)
       VALUES ($1, 1, $2, 1, $3)`,
      [rows[0].id,
       kind === 'advance'
         ? `Advance ${o.advance_pct}% against order ${o.code}`
         : `Retention against order ${o.code}`,
       Math.round(net * 100) / 100]);
  }

  await audit({ user, action: 'invoice.issued', entity: 'invoice', entityId: code,
                after: { order: o.code, kind, total: net + vat } });
  revalidatePath('/admin/finance');
}

async function recordPayment(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse('/admin/finance', t('Viewers cannot record payments.'));

  const invoiceCode = String(formData.get('invoice_code') ?? '').trim();
  const amount = Number(String(formData.get('amount_aed') ?? '0'));
  if (!amount) refuse('/admin/finance', t('Enter an amount.'));

  const inv = (await query<{ id: string; total_aed: string }>(
    `SELECT id, total_aed FROM invoices WHERE code = $1`, [invoiceCode]))[0];
  if (!inv) refuse('/admin/finance', t('No invoice {code}.', { code: invoiceCode }));

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
              WHEN COALESCE((SELECT sum(amount_aed) FROM payments p
                              WHERE p.invoice_id = i.id AND p.deleted_at IS NULL), 0)
                   >= i.total_aed THEN 'paid'
              WHEN COALESCE((SELECT sum(amount_aed) FROM payments p
                              WHERE p.invoice_id = i.id AND p.deleted_at IS NULL), 0) > 0
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

export default async function FinancePage({
  searchParams,
}: { searchParams: Promise<{ deleted?: string; error?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  // The bin holds only the invoice table. The ageing, the buckets and every
  // figure on the cards stay on live invoices whichever list is showing:
  // "outstanding" must not change because somebody clicked a filter.
  const sp = await searchParams;
  const error = sp.error;
  const bin = sp.deleted === '1';
  // `t` is the order totals in the helper above, so the translator is `tr`
  // throughout this file — see the note there.
  const tr = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const site = await getSettings();

  const [invoices, rows, totals] = await Promise.all([
    query<{ code: string; order_code: string | null; kind: string; status: string;
            issued_on: string | null; due_on: string | null; total_aed: string;
            retention_aed: string; paid: string; pint_status: string;
            deleted_at: string | null; deleted_by: string | null }>(`
      SELECT i.code, o.code AS order_code, i.kind, i.status, i.issued_on, i.due_on,
             i.total_aed::text, i.retention_aed::text, i.pint_status,
             i.deleted_at, u.email AS deleted_by,
             COALESCE((SELECT sum(amount_aed) FROM payments p
                        WHERE p.invoice_id = i.id AND p.deleted_at IS NULL), 0)::text AS paid
        FROM invoices i
        LEFT JOIN orders o ON o.id = i.order_id
        LEFT JOIN users u  ON u.id = i.deleted_by
       WHERE i.deleted_at IS ${bin ? 'NOT NULL' : 'NULL'}
       ORDER BY i.issued_on DESC NULLS LAST, i.id DESC LIMIT 200`),
    ageing(),
    query<{ bucket: string; amount: string }>(`
      WITH paid AS (SELECT invoice_id, sum(amount_aed) amount FROM payments
                     WHERE deleted_at IS NULL GROUP BY invoice_id)
      SELECT CASE
               WHEN i.due_on IS NULL OR current_date <= i.due_on THEN 'current'
               WHEN current_date - i.due_on <= 30 THEN '1-30'
               WHEN current_date - i.due_on <= 60 THEN '31-60'
               WHEN current_date - i.due_on <= 90 THEN '61-90'
               ELSE '90+' END AS bucket,
             sum(i.total_aed - COALESCE(p.amount, 0))::text AS amount
        FROM invoices i LEFT JOIN paid p ON p.invoice_id = i.id
       WHERE i.deleted_at IS NULL
         AND i.status NOT IN ('draft','cancelled','paid')
       GROUP BY 1`),
  ]);

  const byBucket = Object.fromEntries(totals.map((t) => [t.bucket, Number(t.amount)]));
  const outstanding = Object.values(byBucket).reduce((s: number, n) => s + Number(n), 0);
  const overdue = outstanding - (byBucket.current ?? 0);

  return (
    <>
      <h1>{tr("Finance")}</h1>
      <Refusal message={error} />
      <p className="adm-sub">
        {tr("Contractors here pay late, so what is owed and how late it is sits on the front page rather than in a spreadsheet.")}
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{aed(outstanding)}</b><span>{tr("Outstanding")}</span></div>
        <div className="adm-card"><b>{aed(overdue)}</b><span>{tr("Overdue")}</span></div>
        <div className="adm-card"><b>{aed(byBucket['1-30'] ?? 0)}</b><span>{tr("1–30 days")}</span></div>
        <div className="adm-card"><b>{aed(byBucket['31-60'] ?? 0)}</b><span>{tr("31–60 days")}</span></div>
        <div className="adm-card"><b>{aed(byBucket['61-90'] ?? 0)}</b><span>{tr("61–90 days")}</span></div>
        <div className="adm-card"><b>{aed(byBucket['90+'] ?? 0)}</b><span>{tr("Over 90 days")}</span></div>
      </div>

      {!site.vatEnabled && (
        <p className="adm-sub">
          {tr("VAT is off and no TRN is set, so invoices carry no VAT line and are marked not applicable for e-invoicing. UAE e-invoicing is Peppol PINT AE — structured XML through an accredited provider, not a PDF — and the identifiers it needs are already on each invoice, so switching it on is a mapping rather than a migration.")}
        </p>
      )}

      <h2>{tr("Ageing")}</h2>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {rows.length === 0 ? <p className="adm-empty">{tr("Nothing outstanding.")}</p> : (
          <table className="adm-t">
            <thead><tr><th>{tr("Invoice")}</th><th>{tr("Customer")}</th><th>{tr("Due")}</th><th>{tr("Total")}</th>
                       <th>{tr("Paid")}</th><th>{tr("Outstanding")}</th><th>{tr("Days over")}</th><th>{tr("Bucket")}</th></tr></thead>
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

      <h2>{tr("Invoices")}</h2>
      <div className="adm-filters">
        <Link href="/admin/finance" className="adm-chip" data-on={String(!bin)}>{tr("All")}</Link>
        <Link href="/admin/finance?deleted=1" className="adm-chip" data-on={String(bin)}>{tr("Deleted")}</Link>
      </div>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {invoices.length === 0 ? <p className="adm-empty">{tr("No invoices raised.")}</p> : (
          <table className="adm-t">
            <thead><tr><th>{tr("Invoice")}</th><th>{tr("Order")}</th><th>{tr("Kind")}</th><th>{tr("Status")}</th>
                       <th>{tr("Issued")}</th><th>{tr("Due")}</th><th>{tr("Total")}</th><th>{tr("Paid")}</th>
                       <th>{tr("Retention")}</th><th>e-invoice</th>
                       {user.role !== 'viewer' && <th>{bin ? tr("Deleted") : ''}</th>}</tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.code}>
                  {/* The invoice code is the way to the document that gets
                      sent. Before this it was plain text, and the sheet it
                      points at did not exist. */}
                  <td><Link href={`/admin/finance/${i.code}/print`}>{i.code}</Link></td>
                  <td>{i.order_code ? <Link href={`/admin/orders/${i.order_code}`}>{i.order_code}</Link> : '—'}</td>
                  <td>{st(i.kind)}</td>
                  <td><span className={`pill pill-${i.status === 'paid' ? 'won' : i.status === 'overdue' ? 'lost' : i.status === 'part_paid' ? 'negotiation' : 'quoted'}`}>{st(i.status)}</span></td>
                  <td className="num">{i.issued_on ? fmtDay(i.issued_on) : '—'}</td>
                  <td className="num">{i.due_on ? fmtDay(i.due_on) : '—'}</td>
                  <td className="num">{aed(Number(i.total_aed))}</td>
                  <td className="num">{aed(Number(i.paid))}</td>
                  <td className="num">{Number(i.retention_aed) ? aed(Number(i.retention_aed)) : '—'}</td>
                  <td>{st(i.pint_status)}</td>
                  {/* An invoice with money against it is not deletable at all
                      — the law requires it kept — so the control is simply
                      absent rather than present and always refused. */}
                  {user.role !== 'viewer' && (
                    <td>
                      {Number(i.paid) > 0 ? (
                        <span className="adm-sub">{tr("Cancel it instead")}</span>
                      ) : (
                        <DeleteControls kind="invoice" code={i.code}
                                        back={bin ? '/admin/finance?deleted=1' : '/admin/finance'}
                                        deletedAt={i.deleted_at} deletedBy={i.deleted_by}
                                        role={user.role} locale={user.locale} />
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role !== 'viewer' && (
        <div className="adm-two">
          <div className="adm-panel adm-pad">
            <h2>{tr("Raise an invoice")}</h2>
            <form action={raiseInvoice}>
              <label className="adm-field"><span>{tr("Order code *")}</span>
                <input name="order_code" required placeholder={tr("ORD-000001")} /></label>
              <label className="adm-field"><span>{tr('Kind')}</span>
                <select name="kind" defaultValue="tax_invoice">
                  <option value="advance">{tr('advance — the agreed percentage up front')}</option>
                  <option value="tax_invoice">{tr('tax invoice — the order')}</option>
                  <option value="retention">{tr('retention — released after the holding period')}</option>
                  <option value="proforma">{tr('proforma')}</option>
                </select>
              </label>
              <label className="adm-field"><span>{tr("Payment terms (days)")}</span>
                <input name="terms_days" type="number" min={0} defaultValue={30} /></label>
              <label className="adm-field"><span>{tr("Notes")}</span><input name="notes" /></label>
              <button className="adm-btn adm-invoice" type="submit" style={{ width:'100%' }}>{tr("Raise")}</button>
            </form>
          </div>

          <div className="adm-panel adm-pad">
            <h2>{tr("Record a payment")}</h2>
            <form action={recordPayment}>
              <label className="adm-field"><span>{tr("Invoice code *")}</span>
                <input name="invoice_code" required placeholder={tr("INV-000001")} /></label>
              <label className="adm-field"><span>{tr("Amount (AED) *")}</span>
                <input name="amount_aed" type="number" step="0.01" required /></label>
              <label className="adm-field"><span>{tr("Method")}</span>
                <select name="method" defaultValue="bank_transfer">
                  {['bank_transfer','cheque','cash','card','other'].map((m) => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>{tr("Received on")}</span><input name="received_on" type="date" /></label>
              <label className="adm-field"><span>{tr("Reference")}</span><input name="reference" /></label>
              <button className="adm-btn adm-payment" type="submit" style={{ width:'100%' }}>{tr("Record")}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
