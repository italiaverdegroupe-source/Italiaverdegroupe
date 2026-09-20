import Link from 'next/link';
import { refuse } from '@/app/(console)/admin/refuse';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  getShipment, costOf, getShipmentCosts, getShipmentDocuments, COST_KINDS,
  DOC_KINDS, DOC_STATUSES, DOC_LABEL, DOC_STATUS_LABEL,
  saveShipmentDocument, removeShipmentDocument, seedShipmentChecklist,
  type DocKind, type DocStatus,
} from '@/lib/procurement';
import { getAllProducts } from '@/lib/products';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus, type AdminKey } from '@/lib/admin-ui';
import DeleteControls from '@/components/admin/DeleteControls';
import { blockers, deletionInfo } from '@/lib/deletion';
import Refusal from '@/components/admin/Refusal';

/** Back to the shipment the form was submitted from. */
const sBack = (f: FormData) => {
  const code = String(f.get('code') ?? '').trim();
  return code ? `/admin/shipments/${code}` : '/admin/shipments';
};

export const dynamic = 'force-dynamic';

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/** The four bases a cost can be spread by, said in words rather than in column names. */
const ALLOCATIONS = ['volume', 'value', 'count', 'weight'] as const;

/**
 * What each basis means, for the person choosing one.
 *
 * The select used to carry four hard-coded English glosses and the table cell
 * printed `by {allocation}` straight from the column, so the one field on
 * this form that needs explaining was the one field that stayed in English on
 * the Italian and Arabic console. The value posted is still the raw enum the
 * CHECK constraint expects; only the words change.
 */
const ALLOCATION_LABEL: Record<string, AdminKey> = {
  volume: 'volume — freight, transport',
  value: 'value — duty, insurance',
  count: 'count — handling, clearance',
  weight: 'weight — anything charged by the kilo',
};
const ALLOCATION_BASIS: Record<string, AdminKey> = {
  volume: 'by volume', value: 'by value', count: 'by piece', weight: 'by weight',
};
const isAllocation = (v: string) => (ALLOCATIONS as readonly string[]).includes(v);

/**
 * One line on the consignment — added, or corrected.
 *
 * This was an add-only form, and so was the cost form below it. Between them
 * they are the whole of the cost side of a shipment, and neither could be
 * edited or removed once submitted: an operator who typed 12000 instead of
 * 1200, or picked the wrong catalogue reference, had corrupted the landed
 * cost of every line on that consignment for good, because each cost is
 * spread across all the lines. The only remedy was psql. Meanwhile the
 * compliance rows further down this same page have had Save and Remove all
 * along, which is the inconsistency that gives the game away: nobody decided
 * this, it was just never finished.
 *
 * It takes the same shape as saveDocument: one action, insert when there is
 * no id and update when there is, so the form is written once and the only
 * difference on screen is what it is called and what it starts with.
 */
async function saveItem(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const num = (k: string) => {
    const v = String(formData.get(k) ?? '').trim();
    return v === '' ? null : Number(v);
  };
  const id = String(formData.get('id') ?? '').trim() || null;
  const quantity = num('quantity') ?? 1;

  // shipment_items has CHECK (quantity > 0). A zero arrives here as a
  // Postgres error and a 500, which tells the operator nothing; said in
  // words it is a rule they can act on.
  if (!Number.isInteger(quantity) || quantity < 1) {
    refuse(sBack(formData), t('A line needs a whole quantity of at least one. Remove the line instead of setting it to zero.'));
  }

  const vals = [
    String(formData.get('product_ref')),
    String(formData.get('description') ?? '').trim() || null,
    quantity, num('unit_cost') ?? 0, String(formData.get('cost_currency') ?? 'EUR'),
    num('fx_rate_to_aed'), num('unit_volume_m3'), num('unit_weight_kg'),
    formData.get('is_specimen') === 'on',
  ];

  if (id) {
    // The other CHECK on this table is that received + damaged + rejected can
    // never exceed the quantity. Lowering the quantity under what has already
    // been booked in is the one edit the database will refuse, so it is
    // refused here first, with the number that is in the way.
    const [booked] = await query<{ taken: string }>(
      `SELECT (received_qty + damaged_qty + rejected_qty)::text AS taken
         FROM shipment_items WHERE id = $1 AND shipment_id = $2`, [id, s.id]);
    if (!booked) refuse(sBack(formData), t('That line is not on this shipment.'));
    if (quantity < Number(booked.taken)) {
      refuse(sBack(formData), t('{n} of this line has already been received, damaged or rejected, so the quantity cannot go below {n}.',
        { n: booked.taken }));
    }

    await query(
      `UPDATE shipment_items
          SET product_ref=$1, description=$2, quantity=$3, unit_cost=$4, cost_currency=$5,
              fx_rate_to_aed=$6, unit_volume_m3=$7, unit_weight_kg=$8, is_specimen=$9
        WHERE id=$10 AND shipment_id=$11`, [...vals, id, s.id]);
    await audit({ user, action: 'shipment.item_updated', entity: 'shipment', entityId: code,
                  after: { id, product_ref: vals[0], quantity } });
    revalidatePath(`/admin/shipments/${code}`);
    // Back to the shipment without the ?line= on it, so the recomputed table
    // is what the operator sees rather than the form they have just finished
    // with.
    redirect(`/admin/shipments/${code}`);
  }

  await query(
    `INSERT INTO shipment_items
       (shipment_id, product_ref, description, quantity, unit_cost, cost_currency,
        fx_rate_to_aed, unit_volume_m3, unit_weight_kg, is_specimen)
     VALUES ($10,$1,$2,$3,$4,$5,$6,$7,$8,$9)`, [...vals, s.id]);

  await audit({ user, action: 'shipment.item_added', entity: 'shipment', entityId: code });
  revalidatePath(`/admin/shipments/${code}`);
}

async function removeItem(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const id = String(formData.get('id') ?? '').trim();
  if (!id) refuse(sBack(formData), t('No line named.'));

  // A line something has already been received against is a record of what
  // arrived, not a typo. Deleting it would leave the goods on the ground and
  // nothing in the system that says they came in.
  const [row] = await query<{ product_ref: string; quantity: number; taken: string }>(
    `SELECT product_ref, quantity,
            (received_qty + damaged_qty + rejected_qty)::text AS taken
       FROM shipment_items WHERE id = $1 AND shipment_id = $2`, [id, s.id]);
  if (!row) refuse(sBack(formData), t('That line is not on this shipment.'));
  if (Number(row.taken) > 0) {
    refuse(sBack(formData), t('Part of this line has already been received. Correct the quantity instead of removing the line.'));
  }

  await query(`DELETE FROM shipment_items WHERE id = $1 AND shipment_id = $2`, [id, s.id]);
  await audit({ user, action: 'shipment.item_removed', entity: 'shipment', entityId: code,
                before: { id, product_ref: row.product_ref, quantity: row.quantity } });
  revalidatePath(`/admin/shipments/${code}`);
  redirect(`/admin/shipments/${code}`);
}

/**
 * One import cost — added, or corrected.
 *
 * A negative amount is deliberately still accepted: a contra line is the
 * normal accounting correction for a charge that came in wrong, and unlike an
 * edit it leaves both the original and the correction in the history. Edits
 * exist for the other case, the one nobody should have to live with — a
 * freight figure typed with an extra zero minutes ago, which is not an
 * accounting event, it is a typo.
 *
 * kind and allocation are checked against the lists rather than passed
 * through, because both columns carry a CHECK constraint and a form posts
 * strings: an unexpected value should be a sentence on the screen, not a
 * Postgres error and a 500.
 */
async function saveCost(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const amount = Number(String(formData.get('amount') ?? '0'));
  if (!Number.isFinite(amount)) refuse(sBack(formData), t('Amount must be a number.'));

  const kind = String(formData.get('kind') ?? '');
  if (!(COST_KINDS as readonly string[]).includes(kind)) {
    refuse(sBack(formData), t('Unknown kind of cost.'));
  }
  const allocation = String(formData.get('allocation') ?? 'volume');
  if (!isAllocation(allocation)) refuse(sBack(formData), t('Unknown way to spread a cost.'));

  const id = String(formData.get('id') ?? '').trim() || null;
  const vals = [
    kind, String(formData.get('description') ?? '').trim() || null,
    amount, String(formData.get('currency') ?? 'AED'),
    Number(String(formData.get('fx_rate_to_aed') ?? '1')) || 1,
    allocation,
  ];

  if (id) {
    const changed = await query<{ id: string }>(
      `UPDATE shipment_costs
          SET kind=$1, description=$2, amount=$3, currency=$4, fx_rate_to_aed=$5, allocation=$6
        WHERE id=$7 AND shipment_id=$8
      RETURNING id`, [...vals, id, s.id]);
    if (changed.length === 0) refuse(sBack(formData), t('That cost is not on this shipment.'));
    await audit({ user, action: 'shipment.cost_updated', entity: 'shipment', entityId: code,
                  after: { id, kind, amount } });
    revalidatePath(`/admin/shipments/${code}`);
    redirect(`/admin/shipments/${code}`);
  }

  await query(
    `INSERT INTO shipment_costs (shipment_id, kind, description, amount, currency, fx_rate_to_aed, allocation)
     VALUES ($7,$1,$2,$3,$4,$5,$6)`, [...vals, s.id]);

  await audit({ user, action: 'shipment.cost_added', entity: 'shipment', entityId: code,
                after: { kind, amount } });
  revalidatePath(`/admin/shipments/${code}`);
}

async function removeCost(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const id = String(formData.get('id') ?? '').trim();
  if (!id) refuse(sBack(formData), t('No cost named.'));

  const gone = await query<{ kind: string; amount: string }>(
    `DELETE FROM shipment_costs WHERE id = $1 AND shipment_id = $2
     RETURNING kind, amount::text`, [id, s.id]);
  if (gone.length === 0) refuse(sBack(formData), t('That cost is not on this shipment.'));

  await audit({ user, action: 'shipment.cost_removed', entity: 'shipment', entityId: code,
                before: { id, kind: gone[0].kind, amount: gone[0].amount } });
  revalidatePath(`/admin/shipments/${code}`);
  redirect(`/admin/shipments/${code}`);
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
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

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
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const id = String(formData.get('id') ?? '').trim();
  if (!id) refuse(sBack(formData), t('No document named.'));
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
  if (user.role === 'viewer') refuse(sBack(formData), t('Viewers cannot change shipments.'));

  const code = String(formData.get('code'));
  const s = await getShipment(code);
  if (!s) notFound();

  const added = await seedShipmentChecklist(s.id);
  await audit({ user, action: 'shipment.checklist_started', entity: 'shipment', entityId: code,
                after: { added } });
  revalidatePath(`/admin/shipments/${code}`);
}

export default async function ShipmentPage({ params, searchParams }: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string; line?: string; cost?: string; rm?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const { code } = await params;
  const { error, line, cost, rm } = await searchParams;

  const s = await getShipment(code);
  if (!s) notFound();

  const [costed, costs, docs] = await Promise.all([
    costOf(s.id), getShipmentCosts(s.id), getShipmentDocuments(s.id),
  ]);

  // Which row, if any, the add form on the right is currently standing in for.
  // One form does both jobs, the way the compliance rows below already do:
  // an Edit link puts the row's id in the URL, the form comes back filled in
  // with it, and Cancel is a link back to the same page without it. Nothing is
  // held in memory between requests, so a half-finished edit survives a
  // reload and can be walked away from.
  const editingLine = line ? costed.items.find((i) => String(i.id) === line) : undefined;
  const editingCost = cost ? costs.find((c) => String(c.id) === cost) : undefined;
  // Remove asks twice — the second ask is this. Deleting a line re-spreads
  // every cost on the consignment, so it is not a click to make while
  // reaching for Save.
  const confirmingRemoval = rm === '1';
  const here = `/admin/shipments/${s.code}`;

  // Only looked up once the record is actually in the bin: on a live one this
  // is two queries nobody needs.
  const gone = s.deleted_at ? await deletionInfo('shipment', s.code) : null;
  const why = gone && user.role === 'owner' ? await blockers('shipment', s.code) : [];

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
      <Refusal message={error} />
      <p className="adm-sub">
        {st(s.status)}
        {s.incoterm ? ` · ${s.incoterm}` : ''}
        {s.container_no ? ` · ${s.container_no}` : ''}
        {s.eta ? ` · ETA ${fmtDay(s.eta, user.locale)}` : ''}
      </p>

      {/* Deleted: the banner goes at the top, so nobody gets halfway through
          editing a record that is in the bin before noticing. Live: the button
          goes at the foot, away from the controls somebody came here to use. */}
      {s.deleted_at && (
        <DeleteControls kind="shipment" code={s.code} back="/admin/shipments"
                        deletedAt={s.deleted_at} deletedBy={gone?.by}
                        role={user.role} locale={user.locale} blockers={why} />
      )}

      {permitDead && (
        <p className="adm-err">
          {t('Import permit {n} expired on {date}. A consignment of live plants cannot clear on an expired permit — it will sit at the port accruing storage. Renew before arrival.',
             { n: s.permit_number ?? '—', date: fmtDay(s.permit_expires_on!, user.locale) })}
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
                {!readOnly && <th />}
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
                  {!readOnly && (
                    <td className="num">
                      {/* The fragment matters on a phone, where the form
                          this fills in is a screen and a half below the
                          table it was clicked from. */}
                      <Link className="adm-chip" href={`${here}?line=${l.id}#line-form`}
                            aria-label={t("Edit the {ref} line", { ref: l.product_ref })}>
                        {t("Edit")}
                      </Link>
                    </td>
                  )}
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
              <thead>
                <tr><th>{t("Kind")}</th><th>{t("Description")}</th><th>{t("Amount")}</th><th>{t("Basis")}</th>
                    {!readOnly && <th />}</tr>
              </thead>
              <tbody>
                {costs.length === 0 && (
                  <tr><td colSpan={readOnly ? 4 : 5}>
                    <span className="adm-empty">{t("No import costs on this shipment yet.")}</span>
                  </td></tr>
                )}
                {costs.map((c) => (
                  <tr key={String(c.id)}>
                    <td>{c.kind.replace('_', ' ')}</td>
                    <td>{c.description ?? '—'}</td>
                    <td className="num">{c.currency} {aed(c.amount)}</td>
                    {/* The basis was printed straight from the column — "by
                        volume" on the Arabic console as well as the English
                        one. It is the one word in the row that decides where
                        the money lands, so it is worth translating. */}
                    <td>{ALLOCATION_BASIS[c.allocation]
                          ? t(ALLOCATION_BASIS[c.allocation]) : c.allocation}</td>
                    {!readOnly && (
                      <td className="num">
                        <Link className="adm-chip" href={`${here}?cost=${c.id}#cost-form`}
                              aria-label={t("Edit the {kind} cost", { kind: c.kind.replace('_', ' ') })}>
                          {t("Edit")}
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {user.role !== 'viewer' && (
          <div>
            {/* One panel, two jobs. With ?line= in the URL this is the
                editor for that line, filled in from it and posting its id;
                without, it is the same form empty and posting an insert.
                Writing it twice would be two sets of fields to keep in step,
                and the one that is used less would be the one that drifts. */}
            <div className="adm-panel adm-pad" id="line-form" style={{ marginBottom: 20 }}>
              <h2>{editingLine ? t("Edit this line") : t("Add a line")}</h2>
              {editingLine && (
                <p className="adm-sub">
                  {t("Every import cost is spread across the lines, so changing this one moves the landed cost of the others too. That is the arithmetic working, not a mistake.")}
                </p>
              )}
              <form action={saveItem} key={editingLine ? `line-${editingLine.id}` : 'line-new'}>
                <input type="hidden" name="code" value={s.code} />
                {editingLine && <input type="hidden" name="id" value={String(editingLine.id)} />}
                <label className="adm-field"><span>{t("Catalogue reference")}</span>
                  <select name="product_ref" required defaultValue={editingLine?.product_ref ?? ''}>
                    <option value="">{t("Select…")}</option>
                    {catalogue.map((p) => <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>)}
                  </select>
                </label>
                <label className="adm-field"><span>{t("Quantity")}</span><input name="quantity" type="number" min={1} defaultValue={editingLine?.quantity ?? 1} /></label>
                <label className="adm-field"><span>{t("Unit cost")}</span><input name="unit_cost" type="number" step="0.01" defaultValue={editingLine?.unit_cost ?? ''} /></label>
                <label className="adm-field"><span>{t("Currency")}</span>
                  <select name="cost_currency" defaultValue={editingLine?.cost_currency ?? 'EUR'}><option>EUR</option><option>AED</option><option>USD</option></select>
                </label>
                <label className="adm-field"><span>{t("FX to AED")}</span><input name="fx_rate_to_aed" type="number" step="0.000001" placeholder="3.95" defaultValue={editingLine?.fx_rate_to_aed ?? ''} /></label>
                <label className="adm-field"><span>{t("Volume each (m³)")}</span><input name="unit_volume_m3" type="number" step="0.001" defaultValue={editingLine?.unit_volume_m3 ?? ''} /></label>
                <label className="adm-field"><span>{t("Weight each (kg)")}</span><input name="unit_weight_kg" type="number" step="0.01" defaultValue={editingLine?.unit_weight_kg ?? ''} /></label>
                <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input name="is_specimen" type="checkbox" defaultChecked={editingLine ? editingLine.is_specimen : true} style={{ width: 16 }} />
                  <span>{t("Individually tracked specimens")}</span>
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="adm-btn adm-add-item" type="submit" style={{ flex: 1 }}>
                    {editingLine ? t("Save line") : t("Add line")}
                  </button>
                  {editingLine && <Link className="adm-btn adm-btn-sec" href={here}>{t("Cancel")}</Link>}
                </div>
              </form>

              {/* Remove is outside the form above — a form cannot contain
                  another — and it asks twice, because this one cannot be
                  undone and the row it deletes is money. */}
              {editingLine && !confirmingRemoval && (
                <p style={{ marginTop: 14, marginBottom: 0 }}>
                  <Link className="adm-btn adm-btn-sec adm-remove-item"
                        href={`${here}?line=${editingLine.id}&rm=1#line-form`}>{t("Remove this line")}</Link>
                </p>
              )}
              {editingLine && confirmingRemoval && (
                <form action={removeItem} style={{ marginTop: 14 }}>
                  <input type="hidden" name="code" value={s.code} />
                  <input type="hidden" name="id" value={String(editingLine.id)} />
                  <p className="adm-sub">
                    {t("This deletes the line and re-spreads every import cost across the lines that are left. It cannot be undone.")}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="adm-btn adm-btn-sec adm-remove-item" type="submit">
                      {t("Yes, remove this line")}
                    </button>
                    <Link className="adm-chip" href={`${here}?line=${editingLine.id}#line-form`}>{t("Keep it")}</Link>
                  </div>
                </form>
              )}
            </div>

            <div className="adm-panel adm-pad" id="cost-form">
              <h2>{editingCost ? t("Edit this cost") : t("Add a cost")}</h2>
              {editingCost && (
                <p className="adm-sub">
                  {t("A charge that genuinely came in wrong is better corrected with a second, negative cost line, which leaves both figures in the history. Edit this one when it was simply typed wrong.")}
                </p>
              )}
              <form action={saveCost} key={editingCost ? `cost-${editingCost.id}` : 'cost-new'}>
                <input type="hidden" name="code" value={s.code} />
                {editingCost && <input type="hidden" name="id" value={String(editingCost.id)} />}
                <label className="adm-field"><span>{t("Kind")}</span>
                  <select name="kind" defaultValue={editingCost?.kind ?? 'freight'}>
                    {COST_KINDS.map((k) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="adm-field"><span>{t("Description")}</span><input name="description" defaultValue={editingCost?.description ?? ''} /></label>
                <label className="adm-field"><span>{t("Amount")}</span><input name="amount" type="number" step="0.01" required defaultValue={editingCost?.amount ?? ''} /></label>
                <label className="adm-field"><span>{t("Currency")}</span>
                  <select name="currency" defaultValue={editingCost?.currency ?? 'AED'}><option>AED</option><option>EUR</option><option>USD</option></select>
                </label>
                <label className="adm-field"><span>{t("FX to AED")}</span><input name="fx_rate_to_aed" type="number" step="0.000001" defaultValue={editingCost?.fx_rate_to_aed ?? 1} /></label>
                <label className="adm-field">
                  {/* This label and the four glosses below it were the last
                      English left on the form: every sibling field was
                      already translated around them. */}
                  <span>{t("Spread by")}</span>
                  <select name="allocation" defaultValue={editingCost?.allocation ?? 'volume'}>
                    {ALLOCATIONS.map((a) => (
                      <option key={a} value={a}>{t(ALLOCATION_LABEL[a])}</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="adm-btn adm-add-cost" type="submit" style={{ flex: 1 }}>
                    {editingCost ? t("Save cost") : t("Add cost")}
                  </button>
                  {editingCost && <Link className="adm-btn adm-btn-sec" href={here}>{t("Cancel")}</Link>}
                </div>
              </form>

              {editingCost && !confirmingRemoval && (
                <p style={{ marginTop: 14, marginBottom: 0 }}>
                  <Link className="adm-btn adm-btn-sec adm-remove-cost"
                        href={`${here}?cost=${editingCost.id}&rm=1#cost-form`}>{t("Remove this cost")}</Link>
                </p>
              )}
              {editingCost && confirmingRemoval && (
                <form action={removeCost} style={{ marginTop: 14 }}>
                  <input type="hidden" name="code" value={s.code} />
                  <input type="hidden" name="id" value={String(editingCost.id)} />
                  <p className="adm-sub">
                    {t("This deletes the cost and re-spreads what is left across the lines. It cannot be undone.")}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="adm-btn adm-btn-sec adm-remove-cost" type="submit">
                      {t("Yes, remove this cost")}
                    </button>
                    <Link className="adm-chip" href={`${here}?cost=${editingCost.id}#cost-form`}>{t("Keep it")}</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

        <h2>{t("Compliance")}</h2>
        <div className="adm-panel adm-pad">
          {outstanding > 0 && (
            <p className="adm-doc-lead">
              {t('{n} of {total} still outstanding', { n: outstanding, total: docs.length })}
              {expired.length > 0 && <> · <span className="adm-doc-bad">{t('{n} expired', { n: expired.length })}</span></>}
              {expiring.length > 0 && <> · {t('{n} expiring within 30 days', { n: expiring.length })}</>}
              {'. '}{t('A container does not clear on the strength of the ones that are done.')}
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
                        {t(DOC_LABEL[d.kind as DocKind] ?? d.kind)}
                        {due !== null && due < 0 && <b className="adm-doc-bad"> expired</b>}
                        {due !== null && due >= 0 && due <= 30 && <b> {due}d left</b>}
                      </span>

                      <input name="reference" defaultValue={d.reference ?? ''}
                             placeholder={t("Reference")} aria-label={t("Reference")} disabled={readOnly} />
                      {/* Selected by the stored value, not its translation —
                          'not_applicable' never matched 'not applicable'. */}
                      <select name="status" defaultValue={d.status} aria-label={t("Status")} disabled={readOnly}>
                        {DOC_STATUSES.map((k) => (
                          <option key={k} value={k}>{t(DOC_STATUS_LABEL[k as DocStatus])}</option>
                        ))}
                      </select>
                      <label className="adm-doc-date">
                        <span>{t('Issued')}</span>
                        <input name="issued_on" type="date" defaultValue={d.issued_on ?? ''}
                               disabled={readOnly} />
                      </label>
                      <label className="adm-doc-date">
                        <span>{t('Expires')}</span>
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
                          <button className="adm-btn" type="submit">{t("Save")}</button>
                          <button className="adm-btn adm-btn-quiet" type="submit"
                                  formAction={deleteDocument}
                                  aria-label={t("Remove {doc}", { doc: t(DOC_LABEL[d.kind as DocKind] ?? d.kind) })}>
                            {t("Remove")}
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
                  <option key={k} value={k}>{t(DOC_LABEL[k as DocKind])}</option>
                ))}
              </select>
              <input name="reference" placeholder={t("Reference")} aria-label={t("Reference")} />
              <select name="status" defaultValue="required" aria-label={t("Status")}>
                {DOC_STATUSES.map((k) => (
                  <option key={k} value={k}>{t(DOC_STATUS_LABEL[k as DocStatus])}</option>
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

      {!s.deleted_at && (
        <div className="adm-danger">
          <DeleteControls kind="shipment" code={s.code} back="/admin/shipments"
                          role={user.role} locale={user.locale} />
        </div>
      )}
    </>
  );
}
