import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  getOrder, getOrderItems, getDeliveries, orderTotals,
  completeDelivery, nextCode,
} from '@/lib/orders';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

/** 25.00 reads as 25, 12.50 stays 12.5 — trailing zeros are noise on a label. */
const pct = (v: string) => String(Number(v)).replace(/\.0+$/, '');

const aed = (n: number) =>
  new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

async function scheduleDelivery(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot schedule deliveries.'));

  const orderCode = String(formData.get('code'));
  const o = await getOrder(orderCode);
  if (!o) notFound();

  const items = await getOrderItems(o.id);
  const code = await nextCode('DLV', 'deliveries');
  const str = (k: string) => String(formData.get(k) ?? '').trim() || null;

  const rows = await query<{ id: string }>(
    `INSERT INTO deliveries
       (code, order_id, status, scheduled_for, window_from, window_to,
        site_address, site_contact, site_phone, equipment, vehicle, driver, access_notes)
     VALUES ($1,$2,'scheduled',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [code, o.id, str('scheduled_for'), str('window_from'), str('window_to'),
     str('site_address') ?? o.site_address, str('site_contact'), str('site_phone'),
     str('equipment'), str('vehicle'), str('driver'), str('access_notes')]);

  // Whatever is still outstanding on each line goes on this run unless a
  // quantity was given for it.
  let any = false;
  for (const it of items) {
    const raw = String(formData.get(`qty_${it.id}`) ?? '').trim();
    const qty = raw === '' ? 0 : Number(raw);
    if (qty > 0) {
      await query(`INSERT INTO delivery_items (delivery_id, order_item_id, quantity) VALUES ($1,$2,$3)`,
                  [rows[0].id, it.id, Math.min(qty, it.quantity - it.delivered_qty)]);
      any = true;
    }
  }
  if (!any) {
    await query('DELETE FROM deliveries WHERE id = $1', [rows[0].id]);
    throw new Error(t('Put a quantity against at least one line.'));
  }

  await audit({ user, action: 'delivery.scheduled', entity: 'order', entityId: orderCode,
                after: { delivery: code } });
  revalidatePath(`/admin/orders/${orderCode}`);
}

async function markDelivered(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot complete deliveries.'));

  const deliveryCode = String(formData.get('delivery_code'));
  const orderCode = String(formData.get('code'));
  const receivedBy = String(formData.get('received_by') ?? '').trim();
  if (!receivedBy) throw new Error(t('Record who received it — that is the proof of delivery.'));

  await completeDelivery(deliveryCode, receivedBy,
    String(formData.get('proof_note') ?? '').trim() || null, user);
  await audit({ user, action: 'delivery.completed', entity: 'order', entityId: orderCode,
                after: { delivery: deliveryCode, received_by: receivedBy } });
  revalidatePath(`/admin/orders/${orderCode}`);
  revalidatePath('/admin/orders');
  revalidatePath('/admin/inventory');
}

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const tr = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const { code } = await params;

  const o = await getOrder(code);
  if (!o) notFound();
  const [items, deliveries] = await Promise.all([getOrderItems(o.id), getDeliveries(o.id)]);
  const t = orderTotals(o, items);
  const open = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled');

  return (
    <>
      <p className="adm-sub"><Link href="/admin/orders">{tr("← Orders")}</Link></p>
      <h1>{o.code}</h1>
      <p className="adm-sub">
        <span className={`pill pill-${o.status === 'delivered' || o.status === 'completed' ? 'won' : o.status === 'partially_delivered' ? 'negotiation' : 'quoted'}`}>{st(o.status)}</span>
        {' '}{o.customer_company ?? o.customer_name}
        {o.project_name ? ` · ${o.project_name}` : ''}
        {o.lpo_number ? ` · LPO ${o.lpo_number}` : ''}
      </p>

      <div className="adm-cards">
        <div className="adm-card"><b>{t.fulfilledPct}%</b><span>{tr("Delivered by value")}</span></div>
        <div className="adm-card"><b>{aed(t.total)}</b><span>{tr("Order total")}</span></div>
        {Number(o.advance_pct) > 0 && <div className="adm-card"><b>{aed(t.advance)}</b><span>{tr("Advance")} {pct(o.advance_pct)}%</span></div>}
        {Number(o.retention_pct) > 0 && <div className="adm-card"><b>{aed(t.retention)}</b><span>{tr("Retention")} {pct(o.retention_pct)}%</span></div>}
        {user.role === 'owner' && <div className="adm-card"><b>{t.marginPct}%</b><span>{tr("Margin")}</span></div>}
      </div>

      <h2>{tr("Lines")}</h2>
      <div className="adm-panel" style={{ marginBottom: 28 }}>
        <table className="adm-t">
          <thead><tr><th>#</th><th>{tr("Description")}</th><th>{tr("Ordered")}</th><th>{tr("Delivered")}</th>
                     <th>{tr("Outstanding")}</th><th>{tr("Unit")}</th><th>{tr("Line total")}</th></tr></thead>
          <tbody>
            {items.map((it) => {
              const outstanding = it.quantity - it.delivered_qty;
              const line = Number(it.unit_price) * it.quantity * (1 - Number(it.discount_pct)/100);
              return (
                <tr key={it.id}>
                  <td className="num">{it.line_no}</td>
                  <td>{it.description}
                    {it.specimen_code && <><br /><span style={{color:'#8A8D7D',fontSize:'.76rem'}}>specimen {it.specimen_code}</span></>}</td>
                  <td className="num">{it.quantity}</td>
                  <td className="num">{it.delivered_qty}</td>
                  <td className="num">{outstanding > 0 ? <b>{outstanding}</b> : '—'}</td>
                  <td className="num">{aed(Number(it.unit_price))}</td>
                  <td className="num">{aed(line)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="adm-two">
        <div>
          <h2>{tr("Deliveries")}</h2>
          <div className="adm-panel">
            {deliveries.length === 0 ? <p className="adm-empty">{tr("Nothing scheduled.")}</p> : (
              <table className="adm-t">
                <thead><tr><th>{tr("Run")}</th><th>{tr("Status")}</th><th>{tr("Scheduled")}</th><th>{tr("Driver")}</th>
                           <th>{tr("Equipment")}</th><th>{tr("Lines")}</th><th>{tr("Received by")}</th></tr></thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.code}>
                      <td>{d.code}</td>
                      <td><span className={`pill pill-${d.status === 'delivered' ? 'won' : d.status === 'failed' || d.status === 'cancelled' ? 'lost' : 'new'}`}>{st(d.status)}</span></td>
                      <td className="num">{d.scheduled_for ? fmtDay(d.scheduled_for) : '—'}</td>
                      <td>{d.driver ?? '—'}</td>
                      <td>{d.equipment ?? '—'}</td>
                      <td className="num">{d.line_count}</td>
                      <td>{d.received_by ?? '—'}</td>
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
              <h2>{tr("Schedule a delivery")}</h2>
              <p className="adm-sub">
                {tr("Put a quantity against the lines going on this run. Trees need the right gear and site access, so both are recorded before it is booked.")}
              </p>
              <form action={scheduleDelivery}>
                <input type="hidden" name="code" value={o.code} />
                {items.filter((it) => it.quantity > it.delivered_qty).map((it) => (
                  <label key={it.id} className="adm-field">
                    <span>{it.description} — {it.quantity - it.delivered_qty} outstanding</span>
                    <input name={`qty_${it.id}`} type="number" min={0}
                           max={it.quantity - it.delivered_qty} placeholder="0" />
                  </label>
                ))}
                <label className="adm-field"><span>{tr("Date")}</span><input name="scheduled_for" type="date" /></label>
                <label className="adm-field"><span>{tr("Equipment")}</span><input name="equipment" placeholder={tr("Hiab 8t, crane, low-loader")} /></label>
                <label className="adm-field"><span>{tr("Vehicle")}</span><input name="vehicle" /></label>
                <label className="adm-field"><span>{tr("Driver")}</span><input name="driver" /></label>
                <label className="adm-field"><span>{tr("Site contact")}</span><input name="site_contact" /></label>
                <label className="adm-field"><span>{tr("Access notes")}</span>
                  <textarea name="access_notes" rows={2} placeholder={tr("gate width, overhead cables, community timing rules")} /></label>
                <button className="adm-btn adm-schedule" type="submit" style={{ width:'100%' }}>{tr("Schedule")}</button>
              </form>
            </div>

            {open.length > 0 && (
              <div className="adm-panel adm-pad">
                <h2>{tr("Confirm a delivery")}</h2>
                <form action={markDelivered}>
                  <input type="hidden" name="code" value={o.code} />
                  <label className="adm-field"><span>Run</span>
                    <select name="delivery_code" defaultValue={open[0].code}>
                      {open.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.line_count} line(s)</option>)}
                    </select>
                  </label>
                  <label className="adm-field"><span>{tr("Received by *")}</span>
                    <input name="received_by" required placeholder={tr("name of whoever signed for it")} /></label>
                  <label className="adm-field"><span>{tr("Proof note")}</span><textarea name="proof_note" rows={2} /></label>
                  <button className="adm-btn adm-deliver" type="submit" style={{ width:'100%' }}>
                    {tr("Mark delivered")}
                  </button>
                  <p className="adm-sub" style={{ margin:'10px 0 0' }}>
                    {tr("This moves the stock, adds to the delivered quantities and re-derives the order status. Delivering more than remains is refused outright.")}
                  </p>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
