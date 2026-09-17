import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { STATUSES, StatusPill, fmtDate } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

type Row = {
  reference: string; name: string; company: string | null; email: string;
  phone: string | null; emirate: string | null; enquiry_type: string;
  product_ref: string | null; quantity: number | null; status: string; created_at: string;
};

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as never) ? sp.status! : null;
  const q = (sp.q ?? '').trim();

  const where: string[] = [];
  const params: unknown[] = [];
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (q) {
    params.push(`%${q}%`);
    const i = params.length;
    where.push(`(name ILIKE $${i} OR company ILIKE $${i} OR email ILIKE $${i} OR reference ILIKE $${i})`);
  }

  const rows = await query<Row>(
    `SELECT reference, name, company, email, phone, emirate, enquiry_type,
            product_ref, quantity, status, created_at
       FROM leads
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY created_at DESC LIMIT 300`, params);

  const link = (s: string | null) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    if (q) p.set('q', q);
    const str = p.toString();
    return str ? `/admin/leads?${str}` : '/admin/leads';
  };

  return (
    <>
      <h1>{t("Leads")}</h1>
      <p className="adm-sub">{rows.length} shown{status ? ` · ${st(status)}` : ''}{q ? ` · “${q}”` : ''}</p>

      <div className="adm-filters">
        <Link href={link(null)} className="adm-chip" data-on={String(!status)}>{t("All")}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={link(s)} className="adm-chip" data-on={String(status === s)}>{s}</Link>
        ))}
      </div>

      <form method="get" className="adm-filters">
        {status && <input type="hidden" name="status" value={st(status)} />}
        <input name="q" defaultValue={q} className="adm-search"
               placeholder={t("Search name, company, email, reference")} />
        <button className="adm-btn adm-btn-sec" type="submit">{t("Search")}</button>
      </form>

      <div className="adm-panel">
        {rows.length === 0 ? (
          <p className="adm-empty">{t("Nothing matches.")}</p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>{t("Reference")}</th><th>{t("Name")}</th><th>{t("Company")}</th><th>{t("Contact")}</th>
                <th>{t("Type")}</th><th>{t("Specimen")}</th><th>{t("Qty")}</th><th>{t("Emirate")}</th>
                <th>{t("Status")}</th><th>{t("Received")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.reference}>
                  <td><Link href={`/admin/leads/${l.reference}`}>{l.reference}</Link></td>
                  <td>{l.name}</td>
                  <td>{l.company ?? '—'}</td>
                  <td>
                    <a href={`mailto:${l.email}`}>{l.email}</a>
                    {l.phone && <><br /><a href={`tel:${l.phone}`}>{l.phone}</a></>}
                  </td>
                  <td>{l.enquiry_type}</td>
                  <td>{l.product_ref ?? '—'}</td>
                  <td className="num">{l.quantity ?? '—'}</td>
                  <td>{l.emirate ?? '—'}</td>
                  <td><StatusPill status={st(l.status)} /></td>
                  <td className="num">{fmtDate(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
