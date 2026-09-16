import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  getSpecimen, getMovements, getMeasurements, getLocations,
  ITEM_STATUSES, HEALTH,
} from '@/lib/inventory';
import { getAllProducts } from '@/lib/products';
import { fmtDate } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

async function moveSpecimen(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot change stock.');

  const code = String(formData.get('code'));
  const before = await getSpecimen(code);
  if (!before) notFound();

  const status = String(formData.get('status'));
  const health = String(formData.get('health'));
  if (!ITEM_STATUSES.includes(status as never)) throw new Error('Unknown status.');
  if (!HEALTH.includes(health as never)) throw new Error('Unknown health.');

  const locationId = String(formData.get('location_id') ?? '').trim() || null;
  const sellableFrom = String(formData.get('acclimatised_until') ?? '').trim() || null;
  const asking = String(formData.get('asking_price_aed') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim() || null;

  // A dead tree is dead: keep the two fields from contradicting each other.
  const finalHealth = status === 'dead' ? 'dead' : health;
  const finalStatus = health === 'dead' && status !== 'written_off' ? 'dead' : status;

  await query(
    `UPDATE stock_items
        SET status = $2, health = $3, location_id = $4,
            acclimatised_until = $5, asking_price_aed = $6, updated_at = now()
      WHERE code = $1`,
    [code, finalStatus, finalHealth, locationId, sellableFrom,
     asking === '' ? null : Number(asking)]);

  const locationChanged = String(before.location_id ?? '') !== String(locationId ?? '');
  const statusChanged = before.status !== finalStatus;

  if (statusChanged || locationChanged || before.health !== finalHealth) {
    const kind =
      finalStatus === 'dead' ? 'mortality'
      : locationChanged && !statusChanged ? 'transfer'
      : 'status_change';
    await query(
      `INSERT INTO inventory_movements
         (user_id, user_email, stock_item_id, kind, quantity,
          from_location, to_location, from_status, to_status, reason)
       VALUES ($1,$2,$3,$4,1,$5,$6,$7,$8,$9)`,
      [user.id, user.email, before.id, kind,
       before.location_id, locationId, before.status, finalStatus, reason]);
    await audit({
      user, action: `stock.${kind}`, entity: 'stock_item', entityId: code,
      before: { status: before.status, health: before.health, location: before.location_id },
      after: { status: finalStatus, health: finalHealth, location: locationId },
    });
  }

  revalidatePath(`/admin/inventory/specimens/${code}`);
  revalidatePath('/admin/inventory');
  revalidatePath('/admin/inventory/specimens');
}

async function addMeasurement(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot record measurements.');

  const code = String(formData.get('code'));
  const s = await getSpecimen(code);
  if (!s) notFound();

  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v === '' ? null : Number(v);
  };
  await query(
    `INSERT INTO specimen_measurements
       (stock_item_id, measured_at, measured_by, height_m, trunk_girth_cm, crown_width_m, pot_litres, note)
     VALUES ($1, COALESCE($2::date, current_date), $3, $4, $5, $6, $7, $8)`,
    [s.id, String(formData.get('measured_at') ?? '').trim() || null, user.id,
     num('height_m'), num('trunk_girth_cm'), num('crown_width_m'), num('pot_litres'),
     String(formData.get('note') ?? '').trim() || null]);

  await audit({ user, action: 'stock.measured', entity: 'stock_item', entityId: code });
  revalidatePath(`/admin/inventory/specimens/${code}`);
}

export default async function SpecimenPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { code } = await params;

  const s = await getSpecimen(code);
  if (!s) notFound();

  const [movements, measurements, locations] = await Promise.all([
    getMovements(s.id), getMeasurements(s.id), getLocations(),
  ]);
  const product = getAllProducts().find((p) => p.reference === s.product_ref);

  // Why it cannot be sold, stated rather than left for someone to work out.
  const blockers: string[] = [];
  if (s.status !== 'available') blockers.push(`status is ${s.status}`);
  if (s.health === 'critical' || s.health === 'dead') blockers.push(`health is ${s.health}`);
  if (s.acclimatised_until && new Date(s.acclimatised_until) > new Date())
    blockers.push(`still acclimatising until ${fmtDate(s.acclimatised_until).slice(0, 11)}`);
  if (s.location_sellable === false) blockers.push(`cannot sell from ${s.location_name}`);

  return (
    <>
      <p className="adm-sub">
        <Link href="/admin/inventory/specimens">← Specimens</Link>
      </p>
      <h1>{s.code}</h1>
      <p className="adm-sub">
        {product ? `${product.name} · ` : ''}{s.product_ref}
        {' · '}
        {s.is_sellable
          ? <span className="pill pill-won">sellable</span>
          : <span className="pill pill-lost">not sellable</span>}
      </p>

      {!s.is_sellable && blockers.length > 0 && (
        <p className="adm-err">Not sellable because: {blockers.join('; ')}.</p>
      )}

      <div className="adm-two">
        <div>
          <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
            <h2>Specimen</h2>
            <dl className="adm-dl">
              <div><dt>Status</dt><dd>{s.status}</dd></div>
              <div><dt>Health</dt><dd>{s.health}</dd></div>
              <div><dt>Grade</dt><dd>{s.grade ?? '—'}</dd></div>
              <div><dt>Location</dt><dd>{s.location_name ?? '—'}</dd></div>
              <div><dt>Supplier</dt><dd>{s.supplier_name ?? '—'}</dd></div>
              <div><dt>Arrived</dt><dd>{s.arrived_at ? fmtDate(s.arrived_at).slice(0,11) : '—'}</dd></div>
              <div><dt>Sellable from</dt><dd>{s.acclimatised_until ? fmtDate(s.acclimatised_until).slice(0,11) : '—'}</dd></div>
              <div><dt>Purchase cost</dt><dd>{s.purchase_cost ? `${s.purchase_currency} ${s.purchase_cost}` : '—'}</dd></div>
              <div><dt>FX at purchase</dt><dd>{s.fx_rate_to_aed ?? '—'}</dd></div>
              <div><dt>Landed cost</dt><dd>{s.landed_cost_aed ? `AED ${s.landed_cost_aed}` : '—'}</dd></div>
              <div><dt>Asking price</dt><dd>{s.asking_price_aed ? `AED ${s.asking_price_aed}` : '—'}</dd></div>
            </dl>
            {s.notes && <p style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{s.notes}</p>}
          </div>

          <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
            <h2>Measurements</h2>
            <p className="adm-sub">
              A tree grows. Each row is an observation on a date, not a fixed attribute.
            </p>
            {measurements.length === 0 ? (
              <p className="adm-sub" style={{ margin: 0 }}>None recorded.</p>
            ) : (
              <table className="adm-t">
                <thead><tr><th>Date</th><th>Height</th><th>Girth</th><th>Crown</th><th>Pot</th><th>Note</th></tr></thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td className="num">{fmtDate(m.measured_at).slice(0,11)}</td>
                      <td className="num">{m.height_m ? `${m.height_m} m` : '—'}</td>
                      <td className="num">{m.trunk_girth_cm ? `${m.trunk_girth_cm} cm` : '—'}</td>
                      <td className="num">{m.crown_width_m ? `${m.crown_width_m} m` : '—'}</td>
                      <td className="num">{m.pot_litres ? `${m.pot_litres} L` : '—'}</td>
                      <td>{m.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="adm-panel adm-pad">
            <h2>Movement history</h2>
            {movements.length === 0 ? (
              <p className="adm-sub" style={{ margin: 0 }}>Nothing recorded.</p>
            ) : movements.map((m) => (
              <div key={m.id} className="adm-note">
                <div className="adm-note-meta">
                  {fmtDate(m.at)} · {m.user_email ?? 'system'} · {m.kind}
                </div>
                <div>
                  {m.from_status && m.to_status && m.from_status !== m.to_status
                    && <>status {m.from_status} → {m.to_status}. </>}
                  {m.to_name && m.from_name !== m.to_name
                    && <>moved {m.from_name ? `${m.from_name} → ` : 'to '}{m.to_name}. </>}
                  {m.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {user.role !== 'viewer' && (
            <>
              <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
                <h2>Update</h2>
                <form action={moveSpecimen}>
                  <input type="hidden" name="code" value={s.code} />
                  <label className="adm-field">
                    <span>Status</span>
                    <select name="status" defaultValue={s.status}>
                      {ITEM_STATUSES.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>Health</span>
                    <select name="health" defaultValue={s.health}>
                      {HEALTH.map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>Location</span>
                    <select name="location_id" defaultValue={s.location_id ?? ''}>
                      <option value="">Not set</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}{l.sellable ? '' : ' (cannot sell from here)'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>Sellable from</span>
                    <input type="date" name="acclimatised_until" defaultValue={s.acclimatised_until ?? ''} />
                  </label>
                  <label className="adm-field">
                    <span>Asking price (AED)</span>
                    <input type="number" step="0.01" name="asking_price_aed" defaultValue={s.asking_price_aed ?? ''} />
                  </label>
                  <label className="adm-field">
                    <span>Reason</span>
                    <input name="reason" placeholder="why this changed" />
                  </label>
                  <button className="adm-btn adm-move" type="submit" style={{ width: '100%' }}>Save change</button>
                </form>
              </div>

              <div className="adm-panel adm-pad">
                <h2>Record a measurement</h2>
                <form action={addMeasurement}>
                  <input type="hidden" name="code" value={s.code} />
                  <label className="adm-field"><span>Date</span><input type="date" name="measured_at" /></label>
                  <label className="adm-field"><span>Height (m)</span><input type="number" step="0.01" name="height_m" /></label>
                  <label className="adm-field"><span>Trunk girth (cm)</span><input type="number" step="0.1" name="trunk_girth_cm" /></label>
                  <label className="adm-field"><span>Crown width (m)</span><input type="number" step="0.01" name="crown_width_m" /></label>
                  <label className="adm-field"><span>Pot (litres)</span><input type="number" name="pot_litres" /></label>
                  <label className="adm-field"><span>Note</span><input name="note" /></label>
                  <button className="adm-btn adm-measure" type="submit" style={{ width: '100%' }}>Record</button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
