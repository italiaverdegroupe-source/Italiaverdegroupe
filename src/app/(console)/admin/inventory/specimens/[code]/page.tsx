import Link from 'next/link';
import { refuse } from '@/app/(console)/admin/refuse';
import { adminUi, adminStatus } from '@/lib/admin-ui';
import DeleteControls from '@/components/admin/DeleteControls';
// Aliased: this page already has a `blockers`, the reasons a tree cannot be
// sold, which is a different question from why it cannot be destroyed.
import { blockers as purgeBlockers, deletionInfo } from '@/lib/deletion';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  getSpecimen, getMovements, getMeasurements, getLocations,
  ITEM_STATUSES, HEALTH,
} from '@/lib/inventory';
import { getAllProducts } from '@/lib/products';
import { fmtDate, fmtDay } from '@/components/admin/bits';
import Refusal from '@/components/admin/Refusal';

/** Back to the specimen the form was submitted from. */
const spBack = (f: FormData) => {
  const code = String(f.get('code') ?? '').trim();
  return code ? `/admin/inventory/specimens/${code}` : '/admin/inventory/specimens';
};

export const dynamic = 'force-dynamic';

async function moveSpecimen(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse(spBack(formData), t('Viewers cannot change stock.'));

  const code = String(formData.get('code'));
  const before = await getSpecimen(code);
  if (!before) notFound();

  const status = String(formData.get('status'));
  const health = String(formData.get('health'));
  if (!ITEM_STATUSES.includes(status as never)) refuse(spBack(formData), t('Unknown status.'));
  if (!HEALTH.includes(health as never)) refuse(spBack(formData), t('Unknown health.'));

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
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse(spBack(formData), t('Viewers cannot record measurements.'));

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

export default async function SpecimenPage({ params, searchParams }: {
  params: Promise<{ code: string }>; searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  // Statuses are English IN THE DATABASE and must stay that way — every filter
  // and every total reads them. They are translated here, on the way to the
  // screen, and nowhere else.
  const st = adminStatus(user.locale);
  const { code } = await params;
  const { error } = await searchParams;

  const s = await getSpecimen(code);
  if (!s) notFound();

  const [movements, measurements, locations] = await Promise.all([
    getMovements(s.id), getMeasurements(s.id), getLocations(),
  ]);
  const product = getAllProducts().find((p) => p.reference === s.product_ref);

  // Only looked up once the record is actually in the bin: on a live one this
  // is two queries nobody needs.
  const gone = s.deleted_at ? await deletionInfo('specimen', s.code) : null;
  const why = gone && user.role === 'owner' ? await purgeBlockers('specimen', s.code) : [];

  // Why it cannot be sold, stated rather than left for someone to work out.
  const blockers: string[] = [];
  if (s.status !== 'available') blockers.push(`${t('status is')} ${st(s.status)}`);
  if (s.health === 'critical' || s.health === 'dead') blockers.push(`${t('health is')} ${st(s.health)}`);
  if (s.acclimatised_until && new Date(s.acclimatised_until) > new Date())
    blockers.push(`${t('still acclimatising until')} ${fmtDay(s.acclimatised_until)}`);
  if (s.location_sellable === false) blockers.push(`${t('cannot sell from')} ${s.location_name}`);

  return (
    <>
      <p className="adm-sub">
        <Link href="/admin/inventory/specimens">← {t('Specimens')}</Link>
      </p>
      <h1>{s.code}</h1>
      <Refusal message={error} />
      <p className="adm-sub">
        {product ? `${product.name} · ` : ''}{s.product_ref}
        {' · '}
        {s.is_sellable
          ? <span className="pill pill-won">{t('sellable')}</span>
          : <span className="pill pill-lost">{t('not sellable')}</span>}
      </p>

      {/* Deleted: the banner goes at the top, so nobody gets halfway through
          editing a record that is in the bin before noticing. Live: the button
          goes at the foot, away from the controls somebody came here to use. */}
      {s.deleted_at && (
        <DeleteControls kind="specimen" code={s.code} back="/admin/inventory/specimens"
                        deletedAt={s.deleted_at} deletedBy={gone?.by}
                        role={user.role} locale={user.locale} blockers={why} />
      )}

      {!s.is_sellable && blockers.length > 0 && (
        <p className="adm-err">{t('Not sellable because:')} {blockers.join('; ')}.</p>
      )}

      <div className="adm-two">
        <div>
          <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
            <h2>{t('Specimen')}</h2>
            <dl className="adm-dl">
              <div><dt>{t('Status')}</dt><dd>{st(s.status)}</dd></div>
              <div><dt>{t('Health')}</dt><dd>{st(s.health)}</dd></div>
              <div><dt>{t('Grade')}</dt><dd>{s.grade ?? '—'}</dd></div>
              <div><dt>{t('Location')}</dt><dd>{s.location_name ?? '—'}</dd></div>
              <div><dt>{t('Supplier')}</dt><dd>{s.supplier_name ?? '—'}</dd></div>
              <div><dt>{t('Arrived')}</dt><dd>{s.arrived_at ? fmtDay(s.arrived_at) : '—'}</dd></div>
              <div><dt>{t('Sellable from')}</dt><dd>{s.acclimatised_until ? fmtDay(s.acclimatised_until) : '—'}</dd></div>
              <div><dt>{t('Purchase cost')}</dt><dd>{s.purchase_cost ? `${s.purchase_currency} ${s.purchase_cost}` : '—'}</dd></div>
              <div><dt>{t('FX at purchase')}</dt><dd>{s.fx_rate_to_aed ?? '—'}</dd></div>
              <div><dt>{t('Landed cost')}</dt><dd>{s.landed_cost_aed ? `AED ${s.landed_cost_aed}` : '—'}</dd></div>
              <div><dt>{t('Asking price')}</dt><dd>{s.asking_price_aed ? `AED ${s.asking_price_aed}` : '—'}</dd></div>
            </dl>
            {s.notes && <p style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>{s.notes}</p>}
          </div>

          <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
            <h2>{t('Measurements')}</h2>
            <p className="adm-sub">
              {t('A tree grows. Each row is an observation on a date, not a fixed attribute.')}
            </p>
            {measurements.length === 0 ? (
              <p className="adm-sub" style={{ margin: 0 }}>{t('None recorded.')}</p>
            ) : (
              <table className="adm-t">
                <thead><tr><th>{t('Date')}</th><th>{t('Height')}</th><th>{t('Girth')}</th><th>{t('Crown')}</th><th>{t('Pot')}</th><th>{t('Note')}</th></tr></thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td className="num">{fmtDay(m.measured_at)}</td>
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
            <h2>{t('Movement history')}</h2>
            {movements.length === 0 ? (
              <p className="adm-sub" style={{ margin: 0 }}>{t('Nothing recorded.')}</p>
            ) : movements.map((m) => (
              <div key={m.id} className="adm-note">
                <div className="adm-note-meta">
                  {fmtDate(m.at)} · {m.user_email ?? t('system')} · {st(m.kind)}
                </div>
                <div>
                  {m.from_status && m.to_status && m.from_status !== m.to_status
                    && <>{t('Status')}: {st(m.from_status)} → {st(m.to_status)}. </>}
                  {m.to_name && m.from_name !== m.to_name
                    && <>{t('moved')} {m.from_name ? `${m.from_name} → ` : '→ '}{m.to_name}. </>}
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
                <h2>{t('Update')}</h2>
                <form action={moveSpecimen}>
                  <input type="hidden" name="code" value={s.code} />
                  <label className="adm-field">
                    <span>{t('Status')}</span>
                    <select name="status" defaultValue={s.status}>
                      {ITEM_STATUSES.map((v) => <option key={v} value={v}>{st(v)}</option>)}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>{t('Health')}</span>
                    <select name="health" defaultValue={s.health}>
                      {HEALTH.map((v) => <option key={v} value={v}>{st(v)}</option>)}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>{t('Location')}</span>
                    <select name="location_id" defaultValue={s.location_id ?? ''}>
                      <option value="">{t('Not set')}</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}{l.sellable ? '' : ` ${t('(cannot sell from here)')}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="adm-field">
                    <span>{t('Sellable from')}</span>
                    <input type="date" name="acclimatised_until" defaultValue={s.acclimatised_until ?? ''} />
                  </label>
                  <label className="adm-field">
                    <span>{t('Asking price (AED)')}</span>
                    <input type="number" step="0.01" name="asking_price_aed" defaultValue={s.asking_price_aed ?? ''} />
                  </label>
                  <label className="adm-field">
                    <span>{t('Reason')}</span>
                    <input name="reason" placeholder={t('why this changed')} />
                  </label>
                  <button className="adm-btn adm-move" type="submit" style={{ width: '100%' }}>{t('Save change')}</button>
                </form>
              </div>

              <div className="adm-panel adm-pad">
                <h2>{t('Record a measurement')}</h2>
                <form action={addMeasurement}>
                  <input type="hidden" name="code" value={s.code} />
                  <label className="adm-field"><span>{t('Date')}</span><input type="date" name="measured_at" /></label>
                  <label className="adm-field"><span>{t('Height (m)')}</span><input type="number" step="0.01" name="height_m" /></label>
                  <label className="adm-field"><span>{t('Trunk girth (cm)')}</span><input type="number" step="0.1" name="trunk_girth_cm" /></label>
                  <label className="adm-field"><span>{t('Crown width (m)')}</span><input type="number" step="0.01" name="crown_width_m" /></label>
                  <label className="adm-field"><span>{t('Pot (litres)')}</span><input type="number" name="pot_litres" /></label>
                  <label className="adm-field"><span>{t('Note')}</span><input name="note" /></label>
                  <button className="adm-btn adm-measure" type="submit" style={{ width: '100%' }}>{t('Record')}</button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {!s.deleted_at && (
        <div className="adm-danger">
          <DeleteControls kind="specimen" code={s.code} back="/admin/inventory/specimens"
                          role={user.role} locale={user.locale} />
        </div>
      )}
    </>
  );
}
