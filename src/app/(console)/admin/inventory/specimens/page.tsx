import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  listSpecimens, getLocations, nextCode, ITEM_STATUSES,
} from '@/lib/inventory';
import { getAllProducts } from '@/lib/products';
import { fmtDay } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

async function addSpecimen(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot add stock.');

  const productRef = String(formData.get('product_ref') ?? '').trim();
  if (!productRef) throw new Error('Pick a catalogue reference.');

  const locationId = String(formData.get('location_id') ?? '').trim() || null;
  const status = String(formData.get('status') ?? 'incoming');
  if (!ITEM_STATUSES.includes(status as never)) throw new Error('Unknown status.');

  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v === '' ? null : Number(v);
  };
  const str = (k: string) => String(formData.get(k) ?? '').trim() || null;

  const code = await nextCode('TREE');
  const rows = await query<{ id: string }>(
    `INSERT INTO stock_items
       (code, product_ref, location_id, status, health, grade,
        acquired_at, arrived_at, acclimatised_until,
        purchase_cost, purchase_currency, fx_rate_to_aed, asking_price_aed, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    [code, productRef, locationId, status,
     String(formData.get('health') ?? 'good'), str('grade'),
     str('acquired_at'), str('arrived_at'), str('acclimatised_until'),
     num('purchase_cost'), String(formData.get('purchase_currency') ?? 'EUR'),
     num('fx_rate_to_aed'), num('asking_price_aed'), str('notes')]);

  const id = rows[0].id;
  await query(
    `INSERT INTO inventory_movements
       (user_id, user_email, stock_item_id, kind, quantity, to_location, to_status, reason)
     VALUES ($1,$2,$3,'receipt',1,$4,$5,'Specimen recorded')`,
    [user.id, user.email, id, locationId, status]);

  const h = num('height_m'), g = num('trunk_girth_cm');
  if (h !== null || g !== null) {
    await query(
      `INSERT INTO specimen_measurements
         (stock_item_id, measured_by, height_m, trunk_girth_cm, crown_width_m, pot_litres)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, user.id, h, g, num('crown_width_m'), num('pot_litres')]);
  }

  await audit({ user, action: 'stock.created', entity: 'stock_item', entityId: code,
                after: { product_ref: productRef, status } });
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/inventory/specimens');
  redirect(`/admin/inventory/specimens/${code}`);
}

export default async function SpecimensPage({ searchParams }: { searchParams: Promise<{ status?: string; ref?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const sp = await searchParams;

  const [rows, locations, catalogue] = await Promise.all([
    listSpecimens({ status: sp.status, productRef: sp.ref }),
    getLocations(),
    Promise.resolve(getAllProducts()),
  ]);
  const nameOf = new Map(catalogue.map((p) => [p.reference, p.name]));

  const link = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    if (sp.ref) p.set('ref', sp.ref);
    const q = p.toString();
    return q ? `/admin/inventory/specimens?${q}` : '/admin/inventory/specimens';
  };

  return (
    <>
      <p className="adm-sub"><Link href="/admin/inventory">← Inventory</Link></p>
      <h1>Specimens</h1>
      <p className="adm-sub">
        {rows.length} shown{sp.ref ? ` · ${sp.ref}` : ''}{sp.status ? ` · ${sp.status}` : ''}
      </p>

      <div className="adm-filters">
        <Link href={link()} className="adm-chip" data-on={String(!sp.status)}>All</Link>
        {ITEM_STATUSES.map((s) => (
          <Link key={s} href={link(s)} className="adm-chip" data-on={String(sp.status === s)}>{s}</Link>
        ))}
      </div>

      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {rows.length === 0 ? (
          <p className="adm-empty">No specimens match.</p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>Code</th><th>Catalogue</th><th>Status</th><th>Sellable</th>
                <th>Health</th><th>Location</th><th>Height</th><th>Girth</th>
                <th>Asking</th><th>Measured</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.code}>
                  <td><Link href={`/admin/inventory/specimens/${s.code}`}>{s.code}</Link></td>
                  <td>{nameOf.get(s.product_ref) ?? s.product_ref}</td>
                  <td><span className={`pill pill-${s.status === 'available' ? 'won' : s.status === 'sold' ? 'quoted' : s.status === 'dead' || s.status === 'written_off' ? 'lost' : 'new'}`}>{s.status}</span></td>
                  <td>{s.is_sellable ? 'yes' : <span style={{ color: '#8A8D7D' }}>no</span>}</td>
                  <td>{s.health}</td>
                  <td>{s.location_name ?? '—'}</td>
                  <td className="num">{s.height_m ? `${s.height_m} m` : '—'}</td>
                  <td className="num">{s.trunk_girth_cm ? `${s.trunk_girth_cm} cm` : '—'}</td>
                  <td className="num">{s.asking_price_aed ? `AED ${s.asking_price_aed}` : '—'}</td>
                  <td className="num">{s.measured_at ? fmtDay(s.measured_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role !== 'viewer' && (
        <div className="adm-panel adm-pad">
          <h2>Record a specimen</h2>
          <p className="adm-sub">
            One tree, one row. Quantity is always one — that is the point of tracking
            it individually.
          </p>
          <form action={addSpecimen}>
            <div className="adm-two" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              <label className="adm-field">
                <span>Catalogue reference *</span>
                <select name="product_ref" required defaultValue={sp.ref ?? ''}>
                  <option value="">Select…</option>
                  {catalogue.map((p) => (
                    <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>
                  ))}
                </select>
              </label>
              <label className="adm-field">
                <span>Location</span>
                <select name="location_id" defaultValue="">
                  <option value="">Not set</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}{l.sellable ? '' : ' (cannot sell from here)'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="adm-field">
                <span>Status</span>
                <select name="status" defaultValue="incoming">
                  {ITEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Health</span>
                <select name="health" defaultValue="good">
                  {['excellent','good','stressed','critical','dead'].map((h) => <option key={h}>{h}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>Grade</span>
                <select name="grade" defaultValue=""><option value="">—</option><option>A</option><option>B</option><option>C</option></select>
              </label>
              <label className="adm-field"><span>Height (m)</span><input name="height_m" type="number" step="0.01" /></label>
              <label className="adm-field"><span>Trunk girth (cm)</span><input name="trunk_girth_cm" type="number" step="0.1" /></label>
              <label className="adm-field"><span>Crown width (m)</span><input name="crown_width_m" type="number" step="0.01" /></label>
              <label className="adm-field"><span>Pot (litres)</span><input name="pot_litres" type="number" /></label>
              <label className="adm-field"><span>Arrived</span><input name="arrived_at" type="date" /></label>
              <label className="adm-field">
                <span>Sellable from</span>
                <input name="acclimatised_until" type="date" />
              </label>
              <label className="adm-field"><span>Purchase cost</span><input name="purchase_cost" type="number" step="0.01" /></label>
              <label className="adm-field">
                <span>Currency</span>
                <select name="purchase_currency" defaultValue="EUR"><option>EUR</option><option>AED</option><option>USD</option></select>
              </label>
              <label className="adm-field">
                <span>FX rate to AED</span>
                <input name="fx_rate_to_aed" type="number" step="0.000001" placeholder="locked at purchase" />
              </label>
              <label className="adm-field"><span>Asking price (AED)</span><input name="asking_price_aed" type="number" step="0.01" /></label>
            </div>
            <label className="adm-field"><span>Notes</span><textarea name="notes" rows={3} /></label>
            <button className="adm-btn adm-add" type="submit">Record specimen</button>
          </form>
        </div>
      )}
    </>
  );
}
