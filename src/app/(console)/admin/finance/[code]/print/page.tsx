import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getInvoice, getInvoiceLines, getInvoicePayments } from '@/lib/orders';
import { getSettings } from '@/lib/settings';
import { fmtDay } from '@/components/admin/bits';
import { adminUi } from '@/lib/admin-ui';
import Letterhead from '@/components/admin/Letterhead';

export const dynamic = 'force-dynamic';

/**
 * The invoice, laid out for paper — the document that did not exist.
 *
 * An invoice could be raised, paid against and aged in the console, and there
 * was no way to send it to the customer it billed. Found by walking the whole
 * chain the way an operator does: enquiry, quotation, order, invoice, payment
 * — and then looking for the thing to email, and finding a 404.
 *
 * Rendered as a print stylesheet rather than generated server-side, for the
 * same reason the quotation is: Arabic in a PDF needs bidirectional layout and
 * proper letter shaping, and most server-side PDF libraries mangle both. The
 * browser already does it correctly.
 *
 * WHAT A UAE TAX INVOICE HAS TO CARRY, and where each comes from:
 *   · the words "Tax Invoice"        — only when VAT is actually charged
 *   · the supplier's name, address
 *     and TRN                        — Letterhead, from settings
 *   · the customer's name and, where
 *     they have one, their TRN       — the customer row as it stood at issue
 *   · a unique sequential number      — invoices.code
 *   · the date of issue               — issued_on
 *   · description, quantity, rate     — invoice_lines
 *   · the net, the VAT and the total  — the stored figures, not recomputed
 *
 * The figures are READ, never recalculated here. A document that recomputes
 * its own totals at print time can disagree with the ledger it came from, and
 * the copy the customer holds is the one that matters.
 */
const money = (n: string | number, currency: string) =>
  `${currency} ${new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Number(n))}`;

export default async function PrintInvoice(
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const tr = adminUi(user.locale);
  const { code } = await params;

  const inv = await getInvoice(code);
  if (!inv) notFound();
  const [lines, payments, site] = await Promise.all([
    getInvoiceLines(code), getInvoicePayments(code), getSettings(),
  ]);

  // "Tax invoice" is a claim about being registered for VAT. It is only made
  // when VAT was actually charged on this document — a company that is not
  // registered issuing something headed "Tax Invoice" is a problem, not a
  // formatting choice.
  const isTax = inv.vat_enabled && Number(inv.vat) > 0;
  const heading = isTax ? tr('Tax invoice')
    : inv.kind === 'proforma' ? tr('Proforma invoice')
    : tr('Invoice');
  const cur = inv.currency || site.currency;

  return (
    <div className="sheet">
      <header className="sh-head">
        <Letterhead site={site} trnAtIssue={inv.trn_at_issue} />
        <div className="sh-right">
          <h1>{heading}</h1>
          <p className="sh-meta">{inv.code}</p>
          <p className="sh-meta">{tr('Issued')} {inv.issued_on ? fmtDay(inv.issued_on) : '—'}</p>
          <p className="sh-meta">{tr('Due')} {inv.due_on ? fmtDay(inv.due_on) : '—'}</p>
          {inv.order_code && (
            <p className="sh-meta">{tr('Order')} {inv.order_code}</p>
          )}
          {inv.lpo_number && (
            <p className="sh-meta">{tr('Your reference')} {inv.lpo_number}</p>
          )}
        </div>
      </header>

      <section className="sh-to">
        <div>
          <p className="sh-label">{tr('Billed to')}</p>
          <p className="sh-strong">{inv.customer_company ?? inv.customer_name ?? '—'}</p>
          {inv.customer_company && inv.customer_name && <p>{inv.customer_name}</p>}
          {inv.customer_address && <p>{inv.customer_address}</p>}
          {inv.customer_emirate && (
            <p>{tr('{emirate}, United Arab Emirates', { emirate: inv.customer_emirate })}</p>
          )}
          {inv.customer_email && <p>{inv.customer_email}</p>}
          {/* A registered customer needs their own TRN on the document to
              reclaim the VAT on it. Absent when they have none. */}
          {inv.customer_trn && <p>{tr('TRN')} {inv.customer_trn}</p>}
        </div>
        {inv.site_address && (
          <div>
            <p className="sh-label">{tr('Delivered to')}</p>
            <p>{inv.site_address}</p>
          </div>
        )}
      </section>

      <table className="sh-t">
        <thead>
          <tr>
            <th>#</th><th>{tr('Description')}</th><th>{tr('Qty')}</th>
            <th>{tr('Unit (AED)')}</th><th>{tr('Disc.')}</th><th>{tr('Amount (AED)')}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => {
            const amount = Number(l.unit_price) * l.quantity
              * (1 - Number(l.discount_pct ?? 0) / 100);
            return (
              <tr key={l.line_no}>
                <td>{l.line_no}</td>
                <td>{l.description}</td>
                <td className="r">{l.quantity}</td>
                <td className="r">{money(l.unit_price, '').trim()}</td>
                <td className="r">{Number(l.discount_pct) ? `${l.discount_pct}%` : '—'}</td>
                <td className="r">{money(amount, '').trim()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="sh-totals">
        <div><span>{tr('Net')}</span><b>{money(inv.net, cur)}</b></div>
        {isTax ? (
          <div>
            <span>{tr('VAT')} {(Number(inv.vat_rate) * 100).toFixed(0)}%</span>
            <b>{money(inv.vat, cur)}</b>
          </div>
        ) : (
          <div className="sh-note-line">
            <span>{tr('Prices are exclusive of VAT where applicable.')}</span>
          </div>
        )}
        {Number(inv.retention) > 0 && (
          <div><span>{tr('Retention')}</span><b>− {money(inv.retention, cur)}</b></div>
        )}
        <div className="sh-grand"><span>{tr('Total')}</span><b>{money(inv.total, cur)}</b></div>
        {/* What is actually still owed. An invoice reprinted after a part
            payment that still shows the full amount gets paid twice or not at
            all, and both are somebody's afternoon. */}
        {Number(inv.paid) > 0 && (
          <>
            <div><span>{tr('Paid')}</span><b>− {money(inv.paid, cur)}</b></div>
            <div className="sh-grand">
              <span>{tr('Balance due')}</span><b>{money(inv.outstanding, cur)}</b>
            </div>
          </>
        )}
      </div>

      {payments.length > 0 && (
        <section className="sh-paid">
          <p className="sh-label">{tr('Payments received')}</p>
          <table className="sh-t">
            <tbody>
              {payments.map((p, i) => (
                <tr key={i}>
                  <td>{fmtDay(p.received_on)}</td>
                  <td>{p.method ?? '—'}{p.reference ? ` · ${p.reference}` : ''}</td>
                  <td className="r">{money(p.amount, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {inv.notes && <p className="sh-small">{inv.notes}</p>}

      <footer className="sh-foot">
        <span>{site.legalName}{site.email ? ` · ${site.email}` : ''}</span>
        <span>{inv.code}</span>
      </footer>

      <style>{`
        @page { size: A4; margin: 16mm 14mm; }
        body { background: #fff !important; }
        .adm-bar { display: none !important; }
        .adm-body { padding: 0 !important; max-width: none !important; }

        .sheet {
          max-width: 190mm; margin-inline: auto; padding: 8mm 0;
          color: #14150F; font-size: 12px; line-height: 1.5;
        }
        .sh-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 24px; padding-bottom: 14px; border-bottom: 2px solid #2E4420; margin-bottom: 22px;
        }
        .sh-right { text-align: right; }
        .sh-right h1 {
          font-family: var(--font-fraunces), serif; font-size: 22px; margin: 0 0 4px;
          letter-spacing: -.02em;
        }
        .sh-meta  { margin: 0; font-size: 11px; color: #6B6E60; }
        .sh-label {
          margin: 0 0 3px; font-size: 9px; letter-spacing: .14em;
          text-transform: uppercase; color: #8A8D7D;
        }
        .sh-strong { margin: 0 0 2px; font-weight: 600; }
        .sh-to { display: flex; gap: 40px; margin-bottom: 22px; }
        .sh-to p { margin: 0; }

        .sh-t { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .sh-t th {
          text-align: left; font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
          color: #8A8D7D; padding: 7px 8px; border-bottom: 1px solid #2E4420;
        }
        .sh-t td { padding: 9px 8px; border-bottom: 1px solid #E9E4D7; vertical-align: top; }
        .sh-t .r { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

        .sh-totals { margin-left: auto; width: 74mm; }
        .sh-totals > div {
          display: flex; justify-content: space-between; gap: 16px;
          padding: 5px 0; font-variant-numeric: tabular-nums;
        }
        .sh-note-line { font-size: 10px; color: #6B6E60; }
        .sh-grand {
          border-top: 2px solid #2E4420; margin-top: 6px; padding-top: 8px !important;
          font-size: 15px; font-family: var(--font-fraunces), serif;
        }
        .sh-paid { margin-top: 24px; }
        .sh-paid .sh-t td { font-size: 11px; }
        .sh-small { font-size: 10px; color: #6B6E60; line-height: 1.55; margin-top: 18px; }
        .sh-foot {
          display: flex; justify-content: space-between;
          margin-top: 20px; padding-top: 10px; border-top: 1px solid #E9E4D7;
          font-size: 9px; color: #8A8D7D;
        }

        .sheet[dir='rtl'] .sh-right { text-align: left; }
        .sheet[dir='rtl'] .sh-t th,
        .sheet[dir='rtl'] .sh-t td { text-align: right; }
        .sheet[dir='rtl'] .sh-t .r { text-align: left; }
        .sheet[dir='rtl'] .sh-totals { margin-left: 0; margin-right: auto; }

        @media print {
          .sheet { padding: 0; }
          .sh-t tr { break-inside: avoid; }
          .sh-totals, .sh-paid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
