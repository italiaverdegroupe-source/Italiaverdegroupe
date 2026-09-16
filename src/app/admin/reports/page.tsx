import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  byProduct, byCustomer, byEmirate, bySource, bySalesperson,
  stuckStock, cashInStock, incoming, pipeline,
} from '@/lib/reports';
import { getAllProducts } from '@/lib/products';
import { fmtDate } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const aed = (v: string | number) =>
  new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Number(v));

/** A table that answers one question, with a line saying which question. */
function Report({ title, question, empty, children }: {
  title: string; question: string; empty: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2>{title}</h2>
      <p className="adm-sub">{question}</p>
      <div className="adm-panel">{children ?? <p className="adm-empty">{empty}</p>}</div>
    </section>
  );
}

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const [prod, cust, emir, src, sales, stuck, cash, inbound, pipe] = await Promise.all([
    byProduct(), byCustomer(), byEmirate(), bySource(), bySalesperson(),
    stuckStock(90), cashInStock(), incoming(), pipeline(),
  ]);
  const nameOf = new Map(getAllProducts().map((p) => [p.reference, p.name]));
  const c = cash[0];
  const stage = Object.fromEntries(pipe.map((p) => [p.stage, p]));

  return (
    <>
      <h1>Reports</h1>
      <p className="adm-sub">
        One query per question a manager actually asks. Figures come from the
        snapshots stored on each document — the price quoted, the landed cost at
        the time — so last quarter still reads as last quarter.
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{stage.leads?.n ?? 0}</b><span>Open leads</span></div>
        <div className="adm-card"><b>{stage.quoted?.n ?? 0}</b><span>Live quotations</span></div>
        <div className="adm-card"><b>{aed(stage.quoted?.value ?? 0)}</b><span>Pipeline AED</span></div>
        <div className="adm-card"><b>{aed(stage.accepted?.value ?? 0)}</b><span>Accepted AED</span></div>
        <div className="adm-card"><b>{aed(c?.total ?? 0)}</b><span>Cash in stock AED</span></div>
      </div>

      <Report title="Which trees make money"
              question="What are we selling, and what does it actually earn after landed cost?"
              empty="No delivered or confirmed orders yet.">
        {prod.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Reference</th><th>Name</th><th>Units</th><th>Revenue</th>
                       <th>Landed cost</th><th>Profit</th><th>Margin</th></tr></thead>
            <tbody>
              {prod.map((r) => (
                <tr key={r.product_ref}>
                  <td>{r.product_ref}</td>
                  <td>{nameOf.get(r.product_ref) ?? '—'}</td>
                  <td className="num">{r.units}</td>
                  <td className="num">{aed(r.revenue)}</td>
                  <td className="num">{aed(r.cost)}</td>
                  <td className="num"><b>{aed(r.profit)}</b></td>
                  <td className="num">
                    <span className={`pill pill-${Number(r.margin_pct) >= 30 ? 'won' : Number(r.margin_pct) >= 15 ? 'negotiation' : 'lost'}`}>
                      {r.margin_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title="Which channel generates revenue"
              question="Not how many leads a channel produces — how much money it produces."
              empty="No leads recorded yet.">
        {src.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Source</th><th>Leads</th><th>Quoted</th><th>Won</th>
                       <th>Revenue</th><th>Lead → sale</th></tr></thead>
            <tbody>
              {src.map((r) => (
                <tr key={r.source}>
                  <td>{r.source}</td>
                  <td className="num">{r.leads}</td>
                  <td className="num">{r.quoted}</td>
                  <td className="num">{r.won}</td>
                  <td className="num"><b>{aed(r.revenue)}</b></td>
                  <td className="num">{r.conv_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title="Who buys, and who comes back"
              question="Which customers are worth the most, and which order more than once?"
              empty="No orders yet.">
        {cust.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Customer</th><th>Orders</th><th>Revenue</th>
                       <th>First</th><th>Latest</th><th></th></tr></thead>
            <tbody>
              {cust.map((r) => (
                <tr key={r.customer}>
                  <td>{r.customer}</td>
                  <td className="num">{r.orders}</td>
                  <td className="num">{aed(r.revenue)}</td>
                  <td className="num">{fmtDate(r.first_order).slice(0,11)}</td>
                  <td className="num">{fmtDate(r.last_order).slice(0,11)}</td>
                  <td>{Number(r.orders) > 1 && <span className="pill pill-won">repeat</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title="Where the money is"
              question="Which emirates are actually producing revenue?"
              empty="No orders yet.">
        {emir.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Emirate</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {emir.map((r) => (
                <tr key={r.emirate}>
                  <td>{r.emirate}</td><td className="num">{r.orders}</td>
                  <td className="num">{aed(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title="Who converts"
              question="Which salesperson turns quotations into orders?"
              empty="No quotations raised yet.">
        {sales.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Who</th><th>Quotations</th><th>Accepted</th>
                       <th>Conversion</th><th>Value won</th></tr></thead>
            <tbody>
              {sales.map((r) => (
                <tr key={r.who}>
                  <td>{r.who}</td><td className="num">{r.quotes}</td>
                  <td className="num">{r.accepted}</td><td className="num">{r.conv_pct}%</td>
                  <td className="num">{aed(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title="Stock that is not moving"
              question="What has been sitting over 90 days? Living stock costs water, labour and space every month it waits."
              empty="Nothing has been held that long.">
        {stuck.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Code</th><th>Reference</th><th>Status</th><th>Health</th>
                       <th>Days held</th><th>Landed cost</th><th>Asking</th><th>Where</th></tr></thead>
            <tbody>
              {stuck.map((r) => (
                <tr key={r.code}>
                  <td>{r.code}</td><td>{r.product_ref}</td><td>{r.status}</td><td>{r.health}</td>
                  <td className="num">
                    <span className={`pill pill-${Number(r.days_held) > 240 ? 'lost' : 'negotiation'}`}>{r.days_held}</span>
                  </td>
                  <td className="num">{r.landed_cost_aed ? aed(r.landed_cost_aed) : '—'}</td>
                  <td className="num">{r.asking_price_aed ? aed(r.asking_price_aed) : '—'}</td>
                  <td>{r.location_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title="What is on the way"
              question="Which consignments are inbound, and will their import permit still be valid when they land?"
              empty="Nothing inbound.">
        {inbound.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Shipment</th><th>Status</th><th>ETA</th><th>Container</th>
                       <th>Supplier</th><th>Units</th><th>Permit</th></tr></thead>
            <tbody>
              {inbound.map((r) => {
                const left = r.permit_days_left === null ? null : Number(r.permit_days_left);
                return (
                  <tr key={r.code}>
                    <td><Link href={`/admin/shipments/${r.code}`}>{r.code}</Link></td>
                    <td>{r.status.replace(/_/g,' ')}</td>
                    <td className="num">{r.eta ? fmtDate(r.eta).slice(0,11) : '—'}</td>
                    <td>{r.container_no ?? '—'}</td>
                    <td>{r.supplier ?? '—'}</td>
                    <td className="num">{r.units}</td>
                    <td>
                      {r.permit_number
                        ? <span className={`pill pill-${left !== null && left < 0 ? 'lost' : left !== null && left < 30 ? 'negotiation' : 'won'}`}>
                            {left !== null && left < 0 ? 'expired' : `${left} days left`}
                          </span>
                        : <span className="pill pill-negotiation">none</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Report>

      <section>
        <h2>Cash tied up in stock</h2>
        <p className="adm-sub">
          Landed cost of everything not yet sold — incoming, acclimatising, available
          and reserved. This is working capital sitting in a nursery, not profit.
        </p>
        <div className="adm-panel adm-pad">
          <dl className="adm-dl">
            <div><dt>Specimens</dt><dd>{c?.specimens ?? 0} · AED {aed(c?.specimen_cost ?? 0)}</dd></div>
            <div><dt>Lot units</dt><dd>{c?.batch_units ?? 0} · AED {aed(c?.batch_cost ?? 0)}</dd></div>
            <div><dt><b>Total</b></dt><dd><b>AED {aed(c?.total ?? 0)}</b></dd></div>
          </dl>
          {Number(c?.total ?? 0) === 0 && (
            <p className="adm-sub" style={{ margin: '12px 0 0' }}>
              Zero because no landed cost has been recorded against stock yet —
              cost a shipment and this fills in.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
