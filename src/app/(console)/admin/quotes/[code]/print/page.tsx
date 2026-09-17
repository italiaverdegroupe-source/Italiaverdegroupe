import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getQuote, getQuoteItems, totalsOf } from '@/lib/quotes';
import { getSettings } from '@/lib/settings';
import { fmtDay } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

/**
 * The customer-facing quotation, laid out for paper.
 *
 * Rendered as a print stylesheet rather than generated server-side on purpose.
 * Arabic in a PDF needs bidirectional layout and proper letter shaping, and
 * most server-side PDF libraries mangle both. The browser already does it
 * correctly, so "print to PDF" produces a better document than a library
 * would, with no extra dependency and nothing to keep patched.
 */
const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default async function PrintQuote({
  params, searchParams,
}: { params: Promise<{ code: string }>; searchParams: Promise<{ v?: string }> }) {
  if (!(await getSessionUser())) redirect('/admin/login');
  const { code } = await params;
  const { v } = await searchParams;
  const site = await getSettings();

  const q = await getQuote(code, v ? Number(v) : undefined);
  if (!q) notFound();
  const items = await getQuoteItems(q.id);
  const t = totalsOf(q, items);

  return (
    <div className="sheet">
      <header className="sh-head">
        <div>
          <p className="sh-brand">{site.legalName}</p>
          <p className="sh-tag">{site.tagline}</p>
          {q.trn_at_issue && <p className="sh-meta">TRN {q.trn_at_issue}</p>}
        </div>
        <div className="sh-right">
          <h1>Quotation</h1>
          <p className="sh-meta">{q.code} &nbsp;·&nbsp; version {q.version}</p>
          <p className="sh-meta">Issued {q.issued_on ? fmtDay(q.issued_on) : '—'}</p>
          <p className="sh-meta">Valid until {q.valid_until ? fmtDay(q.valid_until) : '—'}</p>
        </div>
      </header>

      <section className="sh-to">
        <div>
          <p className="sh-label">Quoted to</p>
          <p className="sh-strong">{q.customer_company ?? q.customer_name}</p>
          {q.customer_company && <p>{q.customer_name}</p>}
          {q.customer_email && <p>{q.customer_email}</p>}
          {q.customer_phone && <p>{q.customer_phone}</p>}
        </div>
        <div>
          <p className="sh-label">Project</p>
          <p className="sh-strong">{q.project_name ?? '—'}</p>
          {q.emirate && <p>{q.emirate}, United Arab Emirates</p>}
        </div>
      </section>

      <table className="sh-t">
        <thead>
          <tr><th>#</th><th>Description</th><th>Qty</th><th>Unit (AED)</th><th>Disc.</th><th>Amount (AED)</th></tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const line = Number(it.unit_price) * it.quantity * (1 - Number(it.discount_pct) / 100);
            return (
              <tr key={it.id}>
                <td>{it.line_no}</td>
                <td>
                  {it.description}
                  {it.specimen_code && <span className="sh-sub"> · specimen {it.specimen_code}</span>}
                </td>
                <td className="r">{it.quantity}</td>
                <td className="r">{aed(Number(it.unit_price))}</td>
                <td className="r">{Number(it.discount_pct) ? `${it.discount_pct}%` : '—'}</td>
                <td className="r">{aed(line)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="sh-totals">
        <div><span>Subtotal</span><b>{aed(t.subtotal)}</b></div>
        {t.discount > 0 && <div><span>Discount</span><b>− {aed(t.discount)}</b></div>}
        <div><span>Net</span><b>{aed(t.net)}</b></div>
        {q.vat_enabled
          ? <div><span>VAT {(Number(q.vat_rate) * 100).toFixed(0)}%</span><b>{aed(t.vat)}</b></div>
          : <div className="sh-note-line"><span>Prices are exclusive of VAT where applicable.</span></div>}
        <div className="sh-grand"><span>Total (AED)</span><b>{aed(t.total)}</b></div>
      </div>

      <section className="sh-terms">
        <div>
          <p className="sh-label">Payment terms</p>
          <p>{q.payment_terms ?? '—'}</p>
        </div>
        <div>
          <p className="sh-label">Delivery</p>
          <p>{q.delivery_terms ?? `${site.leadTimeWeeks.min}–${site.leadTimeWeeks.max} weeks from order confirmation to site.`}</p>
        </div>
      </section>

      <p className="sh-small">
        {q.terms ?? `Living stock: dimensions are indicative and vary between individual specimens. Final size, form and availability are confirmed on despatch. This quotation is valid for ${site.quoteValidityDays} days from issue.`}
      </p>

      <footer className="sh-foot">
        <span>{site.legalName}</span>
        <span>{q.code} v{q.version}</span>
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
        .sh-brand { font-family: var(--font-fraunces), serif; font-size: 20px; margin: 0 0 2px; }
        .sh-tag   { margin: 0; color: #6B6E60; font-size: 11px; }
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
        .sh-sub { color: #8A8D7D; font-size: 10px; }

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

        .sh-terms { display: flex; gap: 40px; margin: 26px 0 14px; }
        .sh-terms p { margin: 0; }
        .sh-small { font-size: 10px; color: #6B6E60; line-height: 1.55; }
        .sh-foot {
          display: flex; justify-content: space-between;
          margin-top: 20px; padding-top: 10px; border-top: 1px solid #E9E4D7;
          font-size: 9px; color: #8A8D7D;
        }

        /* Arabic, when the document is issued in it, needs the whole sheet to
           flip — not just the text direction. */
        .sheet[dir='rtl'] .sh-right { text-align: left; }
        .sheet[dir='rtl'] .sh-t th,
        .sheet[dir='rtl'] .sh-t td { text-align: right; }
        .sheet[dir='rtl'] .sh-t .r { text-align: left; }
        .sheet[dir='rtl'] .sh-totals { margin-left: 0; margin-right: auto; }

        @media print {
          .sheet { padding: 0; }
          .sh-t tr { break-inside: avoid; }
          .sh-totals, .sh-terms { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
