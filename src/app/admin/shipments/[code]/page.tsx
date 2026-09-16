import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import { getShipment, costOf, getShipmentDocuments, COST_KINDS, DOC_KINDS, DOC_STATUSES } from '@/lib/procurement';
import { DEFAULT_ALLOCATION, margin } from '@/lib/landed-cost';
import { getAllProducts } from '@/lib/products';
import { fmtDate } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

async function addItem(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change shipments.');

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v === '' ? null : Number(v);
  };
  await query(
    `INSERT INTO shipment_items
       (shipment_id, product_ref, description, quantity, unit_cost, cost_currency,
        fx_rate_to_aed, unit_volume_m3, unit_weight_kg, is_specimen)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [s.id, String(formData.get('product_ref')), String(formData.get('description') ?? '').trim() || null,
     num('quantity') ?? 1, num('unit_cost') ?? 0, String(formData.get('cost_currency') ?? 'EUR'),
     num('fx_rate_to_aed'), num('unit_volume_m3'), num('unit_weight_kg'),
     formData.get('is_specimen') === 'on']);

  await audit({ user, action: 'shipment.item_added', entity: 'shipment', entityId: code });
  revalidatePath(`/admin/shipments/${code}`);
}

async function addCost(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change shipments.');

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const amount = Number(String(formData.get('amount') ?? '0'));
  if (!Number.isFinite(amount)) throw new Error('Amount must be a number.');

  await query(
    `INSERT INTO shipment_costs (shipment_id, kind, description, amount, currency, fx_rate_to_aed, allocation)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [s.id, String(formData.get('kind')), String(formData.get('description') ?? '').trim() || null,
     amount, String(formData.get('currency') ?? 'AED'),
     Number(String(formData.get('fx_rate_to_aed') ?? '1')) || 1,
     String(formData.get('allocation') ?? 'volume')]);

  await audit({ user, action: 'shipment.cost_added', entity: 'shipment', entityId: code,
                after: { kind: String(formData.get('kind')), amount } });
  revalidatePath(`/admin/shipments/${code}`);
}

export default async function ShipmentPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { code } = await params;

  const s = await getShipment(code);
  if (!s) notFound();

  const [costed, docs] = await Promise.all([costOf(s.id), getShipmentDocuments(s.id)]);
  const catalogue = getAllProducts();
  const nameOf = new Map(catalogue.map((p) => [p.reference, p.name]));

  const permitDead = s.permit_expires_on && new Date(s.permit_expires_on) < new Date();

  return (
    <>
      <p className="adm-sub"><Link href="/admin/shipments">← Shipments</Link></p>
      <h1>{s.code}</h1>
      <p className="adm-sub">
        {s.status.replace('_', ' ')}
        {s.incoterm ? ` · ${s.incoterm}` : ''}
        {s.container_no ? ` · ${s.container_no}` : ''}
        {s.eta ? ` · ETA ${fmtDate(s.eta).slice(0, 11)}` : ''}
      </p>

      {permitDead && (
        <p className="adm-err">
          Import permit {s.permit_number} expired on {fmtDate(s.permit_expires_on!).slice(0, 11)}.
          A consignment of live plants cannot clear on an expired permit — it will sit at
          the port accruing storage. Renew before arrival.
        </p>
      )}
      {costed.warnings.map((w) => <p key={w} className="adm-err">{w}</p>)}

      <div className="adm-cards">
        <div className="adm-card"><b>{aed(costed.goodsAed)}</b><span>Goods (AED)</span></div>
        <div className="adm-card"><b>{aed(costed.costsAed)}</b><span>Import costs</span></div>
        <div className="adm-card"><b>{aed(costed.totalAed)}</b><span>Total landed</span></div>
        <div className="adm-card"><b>{costed.totalVolumeM3}</b><span>m³ shipped</span></div>
        <div className="adm-card"><b>{costed.totalPieces}</b><span>Pieces</span></div>
      </div>

      <h2>Landed cost per line</h2>
      <p className="adm-sub">
        Each cost is spread by its own basis — freight by volume, duty by value,
        handling per piece. Spreading freight by value would load it onto the
        expensive tree instead of the bulky one and invert the margins.
      </p>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {costed.lines.length === 0 ? (
          <p className="adm-empty">No lines on this shipment yet.</p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>Reference</th><th>Qty</th><th>Unit cost</th><th>Goods AED</th>
                <th>m³ each</th><th>% of volume</th><th>% of value</th>
                <th>Allocated AED</th><th>Landed total</th><th>Landed unit</th>
              </tr>
            </thead>
            <tbody>
              {costed.lines.map((l, i) => (
                <tr key={i}>
                  <td>{l.product_ref}<br /><span style={{ color: '#8A8D7D', fontSize: '.78rem' }}>{nameOf.get(l.product_ref) ?? l.description ?? ''}</span></td>
                  <td className="num">{l.quantity}</td>
                  <td className="num">{l.cost_currency} {l.unit_cost}</td>
                  <td className="num">{aed(l.goodsAed)}</td>
                  <td className="num">{l.unit_volume_m3 ?? '—'}</td>
                  <td className="num">{(l.shareOfVolume * 100).toFixed(1)}%</td>
                  <td className="num">{(l.shareOfValue * 100).toFixed(1)}%</td>
                  <td className="num">{aed(l.allocatedAed)}</td>
                  <td className="num">{aed(l.landedTotalAed)}</td>
                  <td className="num"><b>{aed(l.landedUnitAed)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="adm-two">
        <div>
          <h2>Import costs</h2>
          <div className="adm-panel" style={{ marginBottom: 20 }}>
            {costed.lines.length === 0 && <p className="adm-empty">Add lines first.</p>}
            <table className="adm-t">
              <thead><tr><th>Kind</th><th>Description</th><th>Amount</th><th>Basis</th></tr></thead>
              <tbody>
                {(await query<{ kind: string; description: string | null; amount: string; currency: string; allocation: string }>(
                  `SELECT kind, description, amount::text, currency, allocation
                     FROM shipment_costs WHERE shipment_id = $1 ORDER BY id`, [s.id])).map((c, i) => (
                  <tr key={i}>
                    <td>{c.kind.replace('_', ' ')}</td>
                    <td>{c.description ?? '—'}</td>
                    <td className="num">{c.currency} {c.amount}</td>
                    <td>by {c.allocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Compliance</h2>
          <div className="adm-panel">
            {docs.length === 0 ? (
              <p className="adm-empty">No document checklist on this shipment.</p>
            ) : (
              <table className="adm-t">
                <thead><tr><th>Document</th><th>Reference</th><th>Status</th><th>Expires</th></tr></thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id}>
                      <td>{d.kind.replace(/_/g, ' ')}</td>
                      <td>{d.reference ?? '—'}</td>
                      <td>{d.status}</td>
                      <td className="num">{d.expires_on ? fmtDate(d.expires_on).slice(0,11) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {user.role !== 'viewer' && (
          <div>
            <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
              <h2>Add a line</h2>
              <form action={addItem}>
                <input type="hidden" name="code" value={s.code} />
                <label className="adm-field"><span>Catalogue reference</span>
                  <select name="product_ref" required defaultValue="">
                    <option value="">Select…</option>
                    {catalogue.map((p) => <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>)}
                  </select>
                </label>
                <label className="adm-field"><span>Quantity</span><input name="quantity" type="number" min={1} defaultValue={1} /></label>
                <label className="adm-field"><span>Unit cost</span><input name="unit_cost" type="number" step="0.01" /></label>
                <label className="adm-field"><span>Currency</span>
                  <select name="cost_currency" defaultValue="EUR"><option>EUR</option><option>AED</option><option>USD</option></select>
                </label>
                <label className="adm-field"><span>FX to AED</span><input name="fx_rate_to_aed" type="number" step="0.000001" placeholder="3.95" /></label>
                <label className="adm-field"><span>Volume each (m³)</span><input name="unit_volume_m3" type="number" step="0.001" /></label>
                <label className="adm-field"><span>Weight each (kg)</span><input name="unit_weight_kg" type="number" step="0.01" /></label>
                <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input name="is_specimen" type="checkbox" defaultChecked style={{ width: 16 }} />
                  <span>Individually tracked specimens</span>
                </label>
                <button className="adm-btn adm-add-item" type="submit" style={{ width: '100%' }}>Add line</button>
              </form>
            </div>

            <div className="adm-panel adm-pad">
              <h2>Add a cost</h2>
              <form action={addCost}>
                <input type="hidden" name="code" value={s.code} />
                <label className="adm-field"><span>Kind</span>
                  <select name="kind" defaultValue="freight">
                    {COST_KINDS.map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="adm-field"><span>Description</span><input name="description" /></label>
                <label className="adm-field"><span>Amount</span><input name="amount" type="number" step="0.01" required /></label>
                <label className="adm-field"><span>Currency</span>
                  <select name="currency" defaultValue="AED"><option>AED</option><option>EUR</option><option>USD</option></select>
                </label>
                <label className="adm-field"><span>FX to AED</span><input name="fx_rate_to_aed" type="number" step="0.000001" defaultValue={1} /></label>
                <label className="adm-field">
                  <span>Spread by</span>
                  <select name="allocation" defaultValue="volume">
                    <option value="volume">volume — freight, transport</option>
                    <option value="value">value — duty, insurance</option>
                    <option value="count">count — handling, clearance</option>
                    <option value="weight">weight</option>
                  </select>
                </label>
                <button className="adm-btn adm-add-cost" type="submit" style={{ width: '100%' }}>Add cost</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
