import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  getShipment, costOf, getShipmentDocuments, COST_KINDS,
  DOC_KINDS, DOC_STATUSES, DOC_LABEL, DOC_STATUS_LABEL,
  saveShipmentDocument, removeShipmentDocument, seedShipmentChecklist,
  type DocKind, type DocStatus,
} from '@/lib/procurement';
import { getAllProducts } from '@/lib/products';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

async function addItem(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot change shipments.'));

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
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const amount = Number(String(formData.get('amount') ?? '0'));
  if (!Number.isFinite(amount)) throw new Error(t('Amount must be a number.'));

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

/**
 * The compliance checklist, which until now could only be read.
 *
 * The table, the query and the panel all existed; nothing in the application
 * could put a row in it, so every shipment said "No document checklist" for
 * ever. These are the missing half.
 */
async function saveDocument(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const id = String(formData.get('id') ?? '').trim() || null;
  const kind = String(formData.get('kind') ?? '');
  await saveShipmentDocument({
    shipmentId: s.id,
    id,
    kind,
    reference: String(formData.get('reference') ?? ''),
    status: String(formData.get('status') ?? 'required'),
    issuedOn: String(formData.get('issued_on') ?? ''),
    expiresOn: String(formData.get('expires_on') ?? ''),
    note: String(formData.get('note') ?? ''),
  });

  await audit({
    user, action: id ? 'shipment.document_updated' : 'shipment.document_added',
    entity: 'shipment', entityId: code,
    after: { kind, status: String(formData.get('status') ?? '') },
  });
  revalidatePath(`/admin/shipments/${code}`);
}

async function deleteDocument(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const id = String(formData.get('id') ?? '').trim();
  if (!id) throw new Error(t('No document named.'));
  await removeShipmentDocument(s.id, id);

  await audit({ user, action: 'shipment.document_removed', entity: 'shipment', entityId: code,
                before: { id } });
  revalidatePath(`/admin/shipments/${code}`);
}

async function startChecklist(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const added = await seedShipmentChecklist(s.id);
  await audit({ user, action: 'shipment.checklist_started', entity: 'shipment', entityId: code,
                after: { added } });
  revalidatePath(`/admin/shipments/${code}`);
}

export default async function ShipmentPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const { code } = await params;

  const s = await getShipment(code);
  if (!s) notFound();

  const [costed, docs] = await Promise.all([costOf(s.id), getShipmentDocuments(s.id)]);

  const readOnly = user.role === 'viewer';
  const days = (d: { days_to_expiry: string | null }) =>
    d.days_to_expiry === null ? null : Number(d.days_to_expiry);
  // A certificate that has been verified and has since expired is not
  // finished with — it is the most urgent row on the page, and dimming it for
  // being "verified" is exactly how a container ends up sitting at the port.
  const settled = (d: { status: string; days_to_expiry: string | null }) =>
    (d.status === 'verified' || d.status === 'not_applicable') && (days(d) ?? 1) >= 0;
  const outstanding = docs.filter((d) => !settled(d)).length;
  const expired = docs.filter((d) => (days(d) ?? 1) < 0);
  const expiring = docs.filter((d) => { const n = days(d); return n !== null && n >= 0 && n <= 30; });
  const catalogue = getAllProducts();
  const nameOf = new Map(catalogue.map((p) => [p.reference, p.name]));

  const permitDead = s.permit_expires_on && new Date(s.permit_expires_on) < new Date();

  return (
    <>
      <p className="adm-sub"><Link href="/admin/shipments">{t("← Shipments")}</Link></p>
      <h1>{s.code}</h1>
      <p className="adm-sub">
        {s.status.replace('_', ' ')}
        {s.incoterm ? ` · ${s.incoterm}` : ''}
        {s.container_no ? ` · ${s.container_no}` : ''}
        {s.eta ? ` · ETA ${fmtDay(s.eta)}` : ''}
      </p>

      {permitDead && (
        <p className="adm-err">
          Import permit {s.permit_number} expired on {fmtDay(s.permit_expires_on!)}. A consignment of live plants cannot clear on an expired permit — it will sit at the port accruing storage. Renew before arrival.
        </p>
      )}
      {costed.warnings.map((w) => <p key={w} className="adm-err">{w}</p>)}

      <div className="adm-cards">
        <div className="adm-card"><b>{aed(costed.goodsAed)}</b><span>{t("Goods (AED)")}</span></div>
        <div className="adm-card"><b>{aed(costed.costsAed)}</b><span>{t("Import costs")}</span></div>
        <div className="adm-card"><b>{aed(costed.totalAed)}</b><span>{t("Total landed")}</span></div>
        <div className="adm-card"><b>{costed.totalVolumeM3}</b><span>m³ shipped</span></div>
        <div className="adm-card"><b>{costed.totalPieces}</b><span>{t("Pieces")}</span></div>
      </div>

      <h2>{t("Landed cost per line")}</h2>
      <p className="adm-sub">
        {t("Each cost is spread by its own basis — freight by volume, duty by value, handling per piece. Spreading freight by value would load it onto the expensive tree instead of the bulky one and invert the margins.")}
      </p>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {costed.lines.length === 0 ? (
          <p className="adm-empty">{t("No lines on this shipment yet.")}</p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>{t("Reference")}</th><th>{t("Qty")}</th><th>{t("Unit cost")}</th><th>{t("Goods AED")}</th>
                <th>m³ each</th><th>{t("% of volume")}</th><th>{t("% of value")}</th>
                <th>{t("Allocated AED")}</th><th>{t("Landed total")}</th><th>{t("Landed unit")}</th>
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
          <h2>{t("Import costs")}</h2>
          <div className="adm-panel" style={{ marginBottom: 20 }}>
            {costed.lines.length === 0 && <p className="adm-empty">{t("Add lines first.")}</p>}
            <table className="adm-t">
              <thead><tr><th>{t("Kind")}</th><th>{t("Description")}</th><th>{t("Amount")}</th><th>{t("Basis")}</th></tr></thead>
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

        </div>

        {user.role !== 'viewer' && (
          <div>
            <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
              <h2>{t("Add a line")}</h2>
              <form action={addItem}>
                <input type="hidden" name="code" value={s.code} />
                <label className="adm-field"><span>{t("Catalogue reference")}</span>
                  <select name="product_ref" required defaultValue="">
                    <option value="">{t("Select…")}</option>
                    {catalogue.map((p) => <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>)}
                  </select>
                </label>
                <label className="adm-field"><span>{t("Quantity")}</span><input name="quantity" type="number" min={1} defaultValue={1} /></label>
                <label className="adm-field"><span>{t("Unit cost")}</span><input name="unit_cost" type="number" step="0.01" /></label>
                <label className="adm-field"><span>{t("Currency")}</span>
                  <select name="cost_currency" defaultValue="EUR"><option>EUR</option><option>AED</option><option>USD</option></select>
                </label>
                <label className="adm-field"><span>{t("FX to AED")}</span><input name="fx_rate_to_aed" type="number" step="0.000001" placeholder="3.95" /></label>
                <label className="adm-field"><span>{t("Volume each (m³)")}</span><input name="unit_volume_m3" type="number" step="0.001" /></label>
                <label className="adm-field"><span>{t("Weight each (kg)")}</span><input name="unit_weight_kg" type="number" step="0.01" /></label>
                <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input name="is_specimen" type="checkbox" defaultChecked style={{ width: 16 }} />
                  <span>{t("Individually tracked specimens")}</span>
                </label>
                <button className="adm-btn adm-add-item" type="submit" style={{ width: '100%' }}>{t("Add line")}</button>
              </form>
            </div>

            <div className="adm-panel adm-pad">
              <h2>{t("Add a cost")}</h2>
              <form action={addCost}>
                <input type="hidden" name="code" value={s.code} />
                <label className="adm-field"><span>{t("Kind")}</span>
                  <select name="kind" defaultValue="freight">
                    {COST_KINDS.map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="adm-field"><span>{t("Description")}</span><input name="description" /></label>
                <label className="adm-field"><span>{t("Amount")}</span><input name="amount" type="number" step="0.01" required /></label>
                <label className="adm-field"><span>{t("Currency")}</span>
                  <select name="currency" defaultValue="AED"><option>AED</option><option>EUR</option><option>USD</option></select>
                </label>
                <label className="adm-field"><span>{t("FX to AED")}</span><input name="fx_rate_to_aed" type="number" step="0.000001" defaultValue={1} /></label>
                <label className="adm-field">
                  <span>Spread by</span>
                  <select name="allocation" defaultValue="volume">
                    <option value="volume">volume — freight, transport</option>
                    <option value="value">value — duty, insurance</option>
                    <option value="count">count — handling, clearance</option>
                    <option value="weight">weight</option>
                  </select>
                </label>
                <button className="adm-btn adm-add-cost" type="submit" style={{ width: '100%' }}>{t("Add cost")}</button>
              </form>
            </div>
          </div>
        )}
      </div>

        <h2>{t("Compliance")}</h2>
        <div className="adm-panel adm-pad">
          {outstanding > 0 && (
            <p className="adm-doc-lead">
              <strong>{outstanding}</strong> of {docs.length} still outstanding
              {expired.length > 0 && <> · <span className="adm-doc-bad">{expired.length} expired</span></>}
              {expiring.length > 0 && <> · {expiring.length} expiring within 30 days</>}. A container does not clear on the strength of the ones that are done.
            </p>
          )}
          {docs.length > 0 && outstanding === 0 && expired.length === 0 && (
            <p className="adm-doc-lead">{t("Every document on this checklist is in and verified.")}</p>
          )}

          {docs.length === 0 ? (
            <>
              <p className="adm-empty">{t("No document checklist on this shipment yet.")}</p>
              {!readOnly && (
                <form action={startChecklist}>
                  <input type="hidden" name="code" value={s.code} />
                  <button className="adm-btn" type="submit">{t("Start the standard checklist")}</button>
                </form>
              )}
            </>
          ) : (
            <ul className="adm-docs">
              {docs.map((d) => {
                const due = days(d);
                return (
                  <li key={d.id} className={settled(d) ? 'is-done' : ''}>
                    <form action={saveDocument} className="adm-doc">
                      <input type="hidden" name="code" value={s.code} />
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="kind" value={d.kind} />

                      <span className="adm-doc-name">
                        {DOC_LABEL[d.kind as DocKind] ?? st(d.kind)}
                        {due !== null && due < 0 && <b className="adm-doc-bad"> expired</b>}
                        {due !== null && due >= 0 && due <= 30 && <b> {due}d left</b>}
                      </span>

                      <input name="reference" defaultValue={d.reference ?? ''}
                             placeholder={t("Reference")} aria-label={t("Reference")} disabled={readOnly} />
                      <select name="status" defaultValue={st(d.status)} aria-label={t("Status")} disabled={readOnly}>
                        {DOC_STATUSES.map((k) => (
                          <option key={k} value={k}>{DOC_STATUS_LABEL[k as DocStatus]}</option>
                        ))}
                      </select>
                      <label className="adm-doc-date">
                        <span>Issued</span>
                        <input name="issued_on" type="date" defaultValue={d.issued_on ?? ''}
                               disabled={readOnly} />
                      </label>
                      <label className="adm-doc-date">
                        <span>Expires</span>
                        <input name="expires_on" type="date" defaultValue={d.expires_on ?? ''}
                               disabled={readOnly} />
                      </label>
                      <input name="note" defaultValue={d.note ?? ''}
                             placeholder={t("Note")} aria-label={t("Note")} disabled={readOnly} />
                      {/* Both buttons post this same row. As two separate
                          forms the second one sat outside the row's grid, and
                          landed on top of the note field. */}
                      {!readOnly && (
                        <span className="adm-doc-acts">
                          <button className="adm-btn" type="submit">Save</button>
                          <button className="adm-btn adm-btn-quiet" type="submit"
                                  formAction={deleteDocument}
                                  aria-label={`Remove ${DOC_LABEL[d.kind as DocKind] ?? d.kind}`}>
                            Remove
                          </button>
                        </span>
                      )}
                    </form>
                  </li>
                );
              })}
            </ul>
          )}

          {!readOnly && (
            <form action={saveDocument} className="adm-doc adm-doc-new">
              <input type="hidden" name="code" value={s.code} />
              <select name="kind" defaultValue="other" aria-label={t("Document type")}>
                {DOC_KINDS.map((k) => (
                  <option key={k} value={k}>{DOC_LABEL[k as DocKind]}</option>
                ))}
              </select>
              <input name="reference" placeholder={t("Reference")} aria-label={t("Reference")} />
              <select name="status" defaultValue="required" aria-label={t("Status")}>
                {DOC_STATUSES.map((k) => (
                  <option key={k} value={k}>{DOC_STATUS_LABEL[k as DocStatus]}</option>
                ))}
              </select>
              <label className="adm-doc-date">
                <span>{t("Issued")}</span>
                <input name="issued_on" type="date" />
              </label>
              <label className="adm-doc-date">
                <span>{t("Expires")}</span>
                <input name="expires_on" type="date" />
              </label>
              <input name="note" placeholder={t("Note")} aria-label={t("Note")} />
              <button className="adm-btn" type="submit">{t("Add")}</button>
            </form>
          )}
        </div>
    </>
  );
}
