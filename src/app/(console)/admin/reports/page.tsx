import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import {
  byProduct, byCustomer, byEmirate, bySource, bySalesperson,
  stuckStock, cashInStock, incoming, pipeline,
} from '@/lib/reports';
import { getAllProducts } from '@/lib/products';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

const aed = (v: string | number) =>
  new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Number(v));

/**
 * Is there anything here to show?
 *
 * Every section on this page is written as `{rows.length > 0 && <table/>}`,
 * which is `false` when there are no rows — and `false ?? fallback` is `false`,
 * because ?? only catches null and undefined. React renders false as nothing,
 * so each `empty=` message below had never once been on the screen: an empty
 * report was a heading, a subtitle and a blank panel, with no way to tell a
 * question nobody has data for from one that is broken.
 */
function isBlank(node: React.ReactNode): boolean {
  if (node === null || node === undefined || node === false || node === true) return true;
  if (Array.isArray(node)) return node.length === 0 || node.every(isBlank);
  return node === '';
}

function Report({ title, question, empty, children }: {
  title: string; question: string; empty: string; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 34 }}>
      <h2>{title}</h2>
      <p className="adm-sub">{question}</p>
      <div className="adm-panel">
        {isBlank(children) ? <p className="adm-empty">{empty}</p> : children}
      </div>
    </section>
  );
}

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);

  const [prod, cust, emir, src, sales, stuck, cash, inbound, pipe] = await Promise.all([
    byProduct(), byCustomer(), byEmirate(), bySource(), bySalesperson(),
    stuckStock(90), cashInStock(), incoming(), pipeline(),
  ]);
  const nameOf = new Map(getAllProducts().map((p) => [p.reference, p.name]));
  const c = cash[0];
  const stage = Object.fromEntries(pipe.map((p) => [p.stage, p]));

  return (
    <>
      <h1>{t("Reports")}</h1>
      <p className="adm-sub">
        {t("One query per question a manager actually asks. Figures come from the snapshots stored on each document — the price quoted, the landed cost at the time — so last quarter still reads as last quarter.")}
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{stage.leads?.n ?? 0}</b><span>{t("Open leads")}</span></div>
        <div className="adm-card"><b>{stage.quoted?.n ?? 0}</b><span>{t("Live quotations")}</span></div>
        <div className="adm-card"><b>{aed(stage.quoted?.value ?? 0)}</b><span>{t("Pipeline AED")}</span></div>
        <div className="adm-card"><b>{aed(stage.accepted?.value ?? 0)}</b><span>{t("Accepted AED")}</span></div>
        <div className="adm-card"><b>{aed(c?.total ?? 0)}</b><span>{t("Cash in stock AED")}</span></div>
      </div>

      <Report title={t("Which trees make money")}
              question="What are we selling, and what does it actually earn after landed cost?"
              empty="No delivered or confirmed orders yet.">
        {prod.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Reference")}</th><th>{t("Name")}</th><th>{t("Units")}</th><th>{t("Revenue")}</th>
                       <th>{t("Landed cost")}</th><th>{t("Profit")}</th><th>{t("Margin")}</th></tr></thead>
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

      <Report title={t("Which channel generates revenue")}
              question="Not how many leads a channel produces — how much money it produces."
              empty="No leads recorded yet.">
        {src.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Source")}</th><th>{t("Leads")}</th><th>{t("Quoted")}</th><th>{t("Won")}</th>
                       <th>{t("Revenue")}</th><th>{t("Lead → sale")}</th></tr></thead>
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

      <Report title={t("Who buys, and who comes back")}
              question="Which customers are worth the most, and which order more than once?"
              empty="No orders yet.">
        {cust.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Customer")}</th><th>{t("Orders")}</th><th>{t("Revenue")}</th>
                       <th>{t("First")}</th><th>{t("Latest")}</th><th></th></tr></thead>
            <tbody>
              {cust.map((r) => (
                <tr key={r.customer}>
                  <td>{r.customer}</td>
                  <td className="num">{r.orders}</td>
                  <td className="num">{aed(r.revenue)}</td>
                  <td className="num">{fmtDay(r.first_order)}</td>
                  <td className="num">{fmtDay(r.last_order)}</td>
                  <td>{Number(r.orders) > 1 && <span className="pill pill-won">repeat</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Report>

      <Report title={t("Where the money is")}
              question="Which emirates are actually producing revenue?"
              empty="No orders yet.">
        {emir.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Emirate")}</th><th>{t("Orders")}</th><th>{t("Revenue")}</th></tr></thead>
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

      <Report title={t("Who converts")}
              question="Which salesperson turns quotations into orders?"
              empty="No quotations raised yet.">
        {sales.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Who")}</th><th>{t("Quotations")}</th><th>{t("Accepted")}</th>
                       <th>{t("Conversion")}</th><th>{t("Value won")}</th></tr></thead>
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

      <Report title={t("Stock that is not moving")}
              question="What has been sitting over 90 days? Living stock costs water, labour and space every month it waits."
              empty="Nothing has been held that long.">
        {stuck.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Code")}</th><th>{t("Reference")}</th><th>{t("Status")}</th><th>{t("Health")}</th>
                       <th>{t("Days held")}</th><th>{t("Landed cost")}</th><th>{t("Asking")}</th><th>{t("Where")}</th></tr></thead>
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

      <Report title={t("What is on the way")}
              question="Which consignments are inbound, and will their import permit still be valid when they land?"
              empty="Nothing inbound.">
        {inbound.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Shipment")}</th><th>{t("Status")}</th><th>ETA</th><th>{t("Container")}</th>
                       <th>{t("Supplier")}</th><th>{t("Units")}</th><th>{t("Permit")}</th></tr></thead>
            <tbody>
              {inbound.map((r) => {
                const left = r.permit_days_left === null ? null : Number(r.permit_days_left);
                return (
                  <tr key={r.code}>
                    <td><Link href={`/admin/shipments/${r.code}`}>{r.code}</Link></td>
                    <td>{st(r.status)}</td>
                    <td className="num">{r.eta ? fmtDay(r.eta) : '—'}</td>
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
        <h2>{t("Cash tied up in stock")}</h2>
        <p className="adm-sub">
          {t("Landed cost of everything not yet sold — incoming, acclimatising, available and reserved. This is working capital sitting in a nursery, not profit.")}
        </p>
        <div className="adm-panel adm-pad">
          <dl className="adm-dl">
            <div><dt>{t("Specimens")}</dt><dd>{c?.specimens ?? 0} {t("· AED")} {aed(c?.specimen_cost ?? 0)}</dd></div>
            <div><dt>{t("Lot units")}</dt><dd>{c?.batch_units ?? 0} {t("· AED")} {aed(c?.batch_cost ?? 0)}</dd></div>
            <div><dt><b>{t("Total")}</b></dt><dd><b>AED {aed(c?.total ?? 0)}</b></dd></div>
          </dl>
          {Number(c?.total ?? 0) === 0 && (
            <p className="adm-sub" style={{ margin: '12px 0 0' }}>
              {t("Zero because no landed cost has been recorded against stock yet — cost a shipment and this fills in.")}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
