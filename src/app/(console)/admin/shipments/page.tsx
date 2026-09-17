import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  listShipments, listPermits, nextShipmentCode, SHIPMENT_STATUSES, INCOTERMS,
} from '@/lib/procurement';
import { getLocations } from '@/lib/inventory';
import { fmtDay } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

async function createShipment(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot create shipments.');

  const str = (k: string) => String(formData.get(k) ?? '').trim() || null;
  const code = await nextShipmentCode();
  await query(
    `INSERT INTO shipments
       (code, status, incoterm, carrier, container_no, bl_number,
        origin_port, destination_port, etd, eta, to_location, permit_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [code, String(formData.get('status') ?? 'planned'), str('incoterm'), str('carrier'),
     str('container_no'), str('bl_number'), str('origin_port'), str('destination_port'),
     str('etd'), str('eta'), str('to_location'), str('permit_id'), str('notes')]);

  await audit({ user, action: 'shipment.created', entity: 'shipment', entityId: code });
  revalidatePath('/admin/shipments');
  redirect(`/admin/shipments/${code}`);
}

export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const sp = await searchParams;

  const [rows, permits, locations] = await Promise.all([
    listShipments(SHIPMENT_STATUSES.includes(sp.status as never) ? sp.status : undefined),
    listPermits(), getLocations(),
  ]);

  return (
    <>
      <h1>Shipments</h1>
      <p className="adm-sub">
        Consignments from Italy, their compliance paperwork, and what each one
        actually costs once it lands.
      </p>

      <div className="adm-filters">
        <Link href="/admin/shipments" className="adm-chip" data-on={String(!sp.status)}>All</Link>
        {SHIPMENT_STATUSES.map((s) => (
          <Link key={s} href={`/admin/shipments?status=${s}`} className="adm-chip"
                data-on={String(sp.status === s)}>{s.replace('_', ' ')}</Link>
        ))}
      </div>

      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {rows.length === 0 ? (
          <p className="adm-empty">No shipments recorded yet.</p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>Code</th><th>Status</th><th>Incoterm</th><th>Supplier</th>
                <th>Container</th><th>BL</th><th>ETD</th><th>ETA</th>
                <th>Items</th><th>Qty</th><th>Permit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const permitDead = s.permit_expires_on && new Date(s.permit_expires_on) < new Date();
                return (
                  <tr key={s.code}>
                    <td><Link href={`/admin/shipments/${s.code}`}>{s.code}</Link></td>
                    <td>{s.status.replace('_', ' ')}</td>
                    <td>{s.incoterm ?? '—'}</td>
                    <td>{s.supplier_name ?? '—'}</td>
                    <td>{s.container_no ?? '—'}</td>
                    <td>{s.bl_number ?? '—'}</td>
                    <td className="num">{s.etd ? fmtDay(s.etd) : '—'}</td>
                    <td className="num">{s.eta ? fmtDay(s.eta) : '—'}</td>
                    <td className="num">{s.item_count}</td>
                    <td className="num">{s.total_qty}</td>
                    <td>
                      {s.permit_number
                        ? <span className={`pill ${permitDead ? 'pill-lost' : 'pill-won'}`}>
                            {permitDead ? 'expired' : s.permit_number}
                          </span>
                        : <span className="pill pill-negotiation">none</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {user.role !== 'viewer' && (
        <div className="adm-panel adm-pad">
          <h2>New shipment</h2>
          <form action={createShipment}>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
              <label className="adm-field"><span>Status</span>
                <select name="status" defaultValue="planned">
                  {SHIPMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>Incoterm</span>
                <select name="incoterm" defaultValue="">
                  <option value="">—</option>
                  {INCOTERMS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>Carrier</span><input name="carrier" /></label>
              <label className="adm-field"><span>Container no.</span><input name="container_no" /></label>
              <label className="adm-field"><span>BL number</span><input name="bl_number" /></label>
              <label className="adm-field"><span>Origin port</span><input name="origin_port" defaultValue="Salerno" /></label>
              <label className="adm-field"><span>Destination port</span><input name="destination_port" defaultValue="Jebel Ali" /></label>
              <label className="adm-field"><span>ETD</span><input type="date" name="etd" /></label>
              <label className="adm-field"><span>ETA</span><input type="date" name="eta" /></label>
              <label className="adm-field"><span>Deliver to</span>
                <select name="to_location" defaultValue="">
                  <option value="">—</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>Import permit</span>
                <select name="permit_id" defaultValue="">
                  <option value="">none</option>
                  {permits.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.permit_number} — {p.days_left > 0 ? `${p.days_left} days left` : 'expired'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="adm-field"><span>Notes</span><textarea name="notes" rows={2} /></label>
            <button className="adm-btn adm-new-shipment" type="submit">Create shipment</button>
          </form>
        </div>
      )}
    </>
  );
}
