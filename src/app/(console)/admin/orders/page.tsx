import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { listOrders, orderFromQuote, ORDER_STATUSES } from '@/lib/orders';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

async function convert(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role === 'viewer') throw new Error('Viewers cannot create orders.');

  const quote = String(formData.get('quote_code') ?? '').trim();
  const version = Number(formData.get('quote_version') ?? 1);
  const num = (k: string) => Number(String(formData.get(k) ?? '0')) || 0;
  const str = (k: string) => String(formData.get(k) ?? '').trim() || null;

  const { code } = await orderFromQuote(quote, version, user, {
    lpo_number: str('lpo_number'),
    site_address: str('site_address'),
    advance_pct: num('advance_pct'),
    retention_pct: num('retention_pct'),
    required_by: str('required_by'),
  });
  await audit({ user, action: 'order.created', entity: 'order', entityId: code,
                after: { from: `${quote} v${version}` } });
  revalidatePath('/admin/orders');
  redirect(`/admin/orders/${code}`);
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; quote?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const sp = await searchParams;
  const rows = await listOrders(ORDER_STATUSES.includes(sp.status as never) ? sp.status : undefined);

  return (
    <>
      <h1>{t("Orders")}</h1>
      <p className="adm-sub">
        {t("Fulfilment is tracked per line. An order for 200 trees arriving in three containers is normal, and the status follows the quantities rather than being set by hand.")}
      </p>

      <div className="adm-filters">
        <Link href="/admin/orders" className="adm-chip" data-on={String(!sp.status)}>{t("All")}</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className="adm-chip"
                data-on={String(sp.status === s)}>{st(s)}</Link>
        ))}
      </div>

      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {rows.length === 0 ? <p className="adm-empty">{t("No orders yet.")}</p> : (
          <table className="adm-t">
            <thead><tr><th>{t("Order")}</th><th>{t("Customer")}</th><th>{t("Project")}</th><th>LPO</th>
                       <th>{t("Status")}</th><th>{t("Lines")}</th><th>{t("Complete")}</th><th>{t("Required by")}</th><th>{t("Confirmed")}</th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.code}>
                  <td><Link href={`/admin/orders/${o.code}`}>{o.code}</Link></td>
                  <td>{o.customer_company ?? o.customer_name}</td>
                  <td>{o.project_name ?? '—'}</td>
                  <td>{o.lpo_number ?? '—'}</td>
                  <td><span className={`pill pill-${o.status === 'completed' || o.status === 'delivered' ? 'won' : o.status === 'cancelled' ? 'lost' : o.status === 'partially_delivered' ? 'negotiation' : 'quoted'}`}>{st(o.status)}</span></td>
                  <td className="num">{o.item_count}</td>
                  <td className="num">{o.delivered_lines}/{o.item_count}</td>
                  <td className="num">{o.required_by ? fmtDay(o.required_by) : '—'}</td>
                  <td className="num">{fmtDay(o.confirmed_on)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role !== 'viewer' && (
        <div className="adm-panel adm-pad">
          <h2>{t("Convert an accepted quotation")}</h2>
          <p className="adm-sub">
            {t("Prices, discounts and the landed-cost snapshot are copied exactly as quoted — nothing is re-entered and nothing is re-derived.")}
          </p>
          <form action={convert}>
            <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))' }}>
              <label className="adm-field"><span>{t("Quotation code *")}</span>
                <input name="quote_code" required defaultValue={sp.quote ?? ''} placeholder={t("QT-000001")} /></label>
              <label className="adm-field"><span>{t("Version")}</span>
                <input name="quote_version" type="number" min={1} defaultValue={1} /></label>
              <label className="adm-field"><span>{t("Customer LPO number")}</span><input name="lpo_number" /></label>
              <label className="adm-field"><span>{t("Advance %")}</span>
                <input name="advance_pct" type="number" step="0.01" min={0} max={100} defaultValue={0} /></label>
              <label className="adm-field"><span>{t("Retention %")}</span>
                <input name="retention_pct" type="number" step="0.01" min={0} max={100} defaultValue={0} /></label>
              <label className="adm-field"><span>{t("Required on site by")}</span><input name="required_by" type="date" /></label>
            </div>
            <label className="adm-field"><span>{t("Site address")}</span><textarea name="site_address" rows={2} /></label>
            <button className="adm-btn adm-convert" type="submit">{t("Create order")}</button>
          </form>
        </div>
      )}
    </>
  );
}
