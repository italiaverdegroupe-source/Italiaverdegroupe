import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { STATUSES, StatusPill, fmtDate } from '@/components/admin/bits';

export const dynamic = 'force-dynamic';

export default async function Overview() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const [counts, recent, stale] = await Promise.all([
    query<{ status: string; n: string }>(
      'SELECT status, count(*) AS n FROM leads GROUP BY status'),
    query<{ reference: string; name: string; company: string | null; emirate: string | null;
            status: string; created_at: string; enquiry_type: string; quantity: number | null }>(
      `SELECT reference, name, company, emirate, status, created_at, enquiry_type, quantity
         FROM leads ORDER BY created_at DESC LIMIT 8`),
    query<{ n: string }>(
      `SELECT count(*) AS n FROM leads
        WHERE status = 'new' AND created_at < now() - interval '24 hours'`),
  ]);

  const by = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));
  const total = counts.reduce((s, c) => s + Number(c.n), 0);
  const open = total - (by.won ?? 0) - (by.lost ?? 0);
  const uncontacted = Number(stale[0]?.n ?? 0);

  return (
    <>
      <h1>Overview</h1>
      <p className="adm-sub">Signed in as {user.name}</p>

      <div className="adm-cards">
        <div className="adm-card"><b>{total}</b><span>Total leads</span></div>
        <div className="adm-card"><b>{by.new ?? 0}</b><span>New</span></div>
        <div className="adm-card"><b>{open}</b><span>Open</span></div>
        <div className="adm-card"><b>{by.won ?? 0}</b><span>Won</span></div>
      </div>

      {uncontacted > 0 && (
        <p className="adm-err">
          {uncontacted} {uncontacted === 1 ? 'lead has' : 'leads have'} been sitting
          uncontacted for more than 24 hours. <Link href="/admin/leads?status=new">Open them →</Link>
        </p>
      )}

      <h2>Latest enquiries</h2>
      <div className="adm-panel">
        {recent.length === 0 ? (
          <p className="adm-empty">
            No enquiries yet. They arrive here the moment someone submits the
            quote form on the website.
          </p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>Reference</th><th>Name</th><th>Company</th><th>Type</th>
                <th>Qty</th><th>Emirate</th><th>Status</th><th>Received</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((l) => (
                <tr key={l.reference}>
                  <td><Link href={`/admin/leads/${l.reference}`}>{l.reference}</Link></td>
                  <td>{l.name}</td>
                  <td>{l.company ?? '—'}</td>
                  <td>{l.enquiry_type}</td>
                  <td className="num">{l.quantity ?? '—'}</td>
                  <td>{l.emirate ?? '—'}</td>
                  <td><StatusPill status={l.status} /></td>
                  <td className="num">{fmtDate(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="adm-sub" style={{ marginTop: 20 }}>
        Pipeline: {STATUSES.map((s) => `${s} ${by[s] ?? 0}`).join(' · ')}
      </p>
    </>
  );
}
