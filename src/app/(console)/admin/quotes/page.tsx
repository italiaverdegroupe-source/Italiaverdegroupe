import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { query } from '@/lib/db';
import { listQuotes, nextQuoteCode, taxSnapshot, QUOTE_STATUSES, logQuoteEvent } from '@/lib/quotes';
import { getSettings } from '@/lib/settings';
import { fmtDay } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

async function createQuote(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot create quotations.'));

  const leadRef = String(formData.get('lead_reference') ?? '').trim();
  let lead: { id: string; name: string; company: string | null; email: string;
              phone: string | null; emirate: string | null } | undefined;
  if (leadRef) {
    lead = (await query(`SELECT id, name, company, email, phone, emirate
                           FROM leads WHERE reference = $1`, [leadRef]))[0] as typeof lead;
  }

  const name = String(formData.get('customer_name') ?? '').trim() || lead?.name;
  if (!name) throw new Error(t('A quotation needs a customer.'));

  const tax = await taxSnapshot();
  const code = await nextQuoteCode();
  const rows = await query<{ id: string }>(
    `INSERT INTO quotes
       (code, version, lead_id, customer_name, customer_company, customer_email,
        customer_phone, emirate, project_name, status, vat_enabled, vat_rate,
        trn_at_issue, valid_until, payment_terms, delivery_terms, created_by)
     VALUES ($1,1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10,$11,
             current_date + ($12 || ' days')::interval, $13, $14, $15)
     RETURNING id`,
    [code, lead?.id ?? null, name,
     String(formData.get('customer_company') ?? '').trim() || lead?.company || null,
     String(formData.get('customer_email') ?? '').trim() || lead?.email || null,
     String(formData.get('customer_phone') ?? '').trim() || lead?.phone || null,
     String(formData.get('emirate') ?? '').trim() || lead?.emirate || null,
     String(formData.get('project_name') ?? '').trim() || null,
     tax.vat_enabled, tax.vat_rate, tax.trn_at_issue,
     String((await getSettings()).quoteValidityDays),
     String(formData.get('payment_terms') ?? '').trim() || null,
     String(formData.get('delivery_terms') ?? '').trim() || null,
     user.id]);

  await logQuoteEvent(rows[0].id, 'created', user,
    lead ? `From lead ${leadRef}` : undefined);
  await audit({ user, action: 'quote.created', entity: 'quote', entityId: code });
  revalidatePath('/admin/quotes');
  redirect(`/admin/quotes/${code}`);
}

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; lead?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const sp = await searchParams;

  const site = await getSettings();
  const rows = await listQuotes(QUOTE_STATUSES.includes(sp.status as never) ? sp.status : undefined);

  return (
    <>
      <h1>{t("Quotations")}</h1>
      <p className="adm-sub">
        {t("Issued quotations are never edited — repricing creates a new version and supersedes the old one, so what was actually quoted stays answerable.")}
      </p>

      {!site.vatEnabled && (
        <p className="adm-sub">
          {t("VAT is off, so quotations carry no VAT line and state “exclusive of VAT where applicable”. Switch it on in settings once a TRN is issued.")}
        </p>
      )}

      <div className="adm-filters">
        <Link href="/admin/quotes" className="adm-chip" data-on={String(!sp.status)}>{t("All")}</Link>
        {QUOTE_STATUSES.map((s) => (
          <Link key={s} href={`/admin/quotes?status=${s}`} className="adm-chip"
                data-on={String(sp.status === s)}>{s}</Link>
        ))}
      </div>

      <div className="adm-panel" style={{ marginBottom: 28 }}>
        {rows.length === 0 ? (
          <p className="adm-empty">{t("No quotations yet.")}</p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr><th>{t("Quotation")}</th><th>v</th><th>{t("Customer")}</th><th>{t("Project")}</th>
                  <th>{t("Emirate")}</th><th>{t("Lines")}</th><th>{t("Status")}</th><th>{t("Valid until")}</th><th>{t("Created")}</th></tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={`${q.code}-${q.version}`}>
                  <td><Link href={`/admin/quotes/${q.code}?v=${q.version}`}>{q.code}</Link></td>
                  <td className="num">{q.version}</td>
                  <td>{q.customer_name}{q.customer_company ? <><br /><span style={{ color:'#8A8D7D', fontSize:'.78rem' }}>{q.customer_company}</span></> : null}</td>
                  <td>{q.project_name ?? '—'}</td>
                  <td>{q.emirate ?? '—'}</td>
                  <td className="num">{q.item_count}</td>
                  <td><span className={`pill pill-${q.status === 'accepted' ? 'won' : q.status === 'rejected' || q.status === 'expired' || q.status === 'superseded' ? 'lost' : q.status === 'draft' ? 'new' : 'quoted'}`}>{st(q.status)}</span></td>
                  <td className="num">{q.valid_until ? fmtDay(q.valid_until) : '—'}</td>
                  <td className="num">{fmtDay(q.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role !== 'viewer' && (
        <div className="adm-panel adm-pad">
          <h2>{t("New quotation")}</h2>
          <form action={createQuote}>
            <div style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))' }}>
              <label className="adm-field"><span>{t("From lead reference")}</span>
                <input name="lead_reference" defaultValue={sp.lead ?? ''} placeholder={t("VG-XXXXXXX")} />
              </label>
              <label className="adm-field"><span>{t("Customer name")}</span><input name="customer_name" /></label>
              <label className="adm-field"><span>{t("Company")}</span><input name="customer_company" /></label>
              <label className="adm-field"><span>{t("Email")}</span><input name="customer_email" type="email" /></label>
              <label className="adm-field"><span>{t("Phone")}</span><input name="customer_phone" /></label>
              <label className="adm-field"><span>{t("Emirate")}</span>
                <select name="emirate" defaultValue=""><option value="">—</option>
                  {site.emirates.map((e) => <option key={e.slug}>{e.name}</option>)}
                </select>
              </label>
              <label className="adm-field"><span>{t("Project")}</span><input name="project_name" /></label>
              <label className="adm-field"><span>{t("Payment terms")}</span><input name="payment_terms" /></label>
              <label className="adm-field"><span>{t("Delivery terms")}</span><input name="delivery_terms" /></label>
            </div>
            <p className="adm-sub">
              {t("Either give a lead reference and the details are carried across, or fill them in.")}
            </p>
            <button className="adm-btn adm-new-quote" type="submit">{t("Create quotation")}</button>
          </form>
        </div>
      )}
    </>
  );
}
