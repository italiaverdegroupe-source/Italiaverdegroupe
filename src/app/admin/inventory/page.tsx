import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getStockByProduct } from '@/lib/inventory';
import { getAllProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  if (!(await getSessionUser())) redirect('/admin/login');

  const [lines, catalogue] = await Promise.all([getStockByProduct(), getAllProducts()]);
  const nameOf = new Map(catalogue.map((p) => [p.reference, p.name]));

  const n = (v: string) => Number(v);
  const totals = lines.reduce((t, l) => ({
    specimens: t.specimens + n(l.specimens_total),
    sellable: t.sellable + n(l.specimens_sellable) + n(l.batch_sellable),
    acclimatising: t.acclimatising + n(l.specimens_acclimatising),
    lost: t.lost + n(l.specimens_lost),
    batch: t.batch + n(l.batch_qty),
  }), { specimens: 0, sellable: 0, acclimatising: 0, lost: 0, batch: 0 });

  return (
    <>
      <h1>Inventory</h1>
      <p className="adm-sub">
        Specimens are tracked one by one; lots are tracked by quantity. Sellable
        excludes anything still acclimatising, in poor health, or sitting somewhere
        it cannot be sold from.
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{totals.sellable}</b><span>Sellable now</span></div>
        <div className="adm-card"><b>{totals.specimens}</b><span>Specimens tracked</span></div>
        <div className="adm-card"><b>{totals.batch}</b><span>In lots</span></div>
        <div className="adm-card"><b>{totals.acclimatising}</b><span>Acclimatising</span></div>
        <div className="adm-card"><b>{totals.lost}</b><span>Dead / written off</span></div>
      </div>

      <p className="adm-sub">
        <Link href="/admin/inventory/specimens" className="adm-chip">All specimens →</Link>
      </p>

      <div className="adm-panel">
        {lines.length === 0 ? (
          <p className="adm-empty">
            No stock recorded yet. Add the first specimen from
            {' '}<Link href="/admin/inventory/specimens">the specimens page</Link>.
          </p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>Reference</th><th>Catalogue name</th>
                <th>Specimens</th><th>Sellable</th><th>Acclimatising</th>
                <th>Reserved</th><th>Sold</th><th>Lost</th>
                <th>Lot qty</th><th>Lot sellable</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.product_ref}>
                  <td>
                    <Link href={`/admin/inventory/specimens?ref=${l.product_ref}`}>
                      {l.product_ref}
                    </Link>
                  </td>
                  <td>{nameOf.get(l.product_ref) ?? <em>not in catalogue</em>}</td>
                  <td className="num">{l.specimens_total}</td>
                  <td className="num"><b>{l.specimens_sellable}</b></td>
                  <td className="num">{l.specimens_acclimatising}</td>
                  <td className="num">{l.specimens_reserved}</td>
                  <td className="num">{l.specimens_sold}</td>
                  <td className="num">{l.specimens_lost}</td>
                  <td className="num">{l.batch_qty}</td>
                  <td className="num"><b>{l.batch_sellable}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
