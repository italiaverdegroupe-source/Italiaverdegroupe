import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { STATUSES, StatusPill, fmtDate } from '@/components/admin/bits';
import { TimeArea, BarList, Funnel, Donut } from '@/components/admin/Charts';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

/**
 * The overview answers four questions, in the order somebody walking up to the
 * screen actually asks them: is anything on fire, what is coming in, where is
 * it stuck, and where is it coming from. Numbers alone answered the first and
 * none of the others — "18 new" tells you nothing about whether that is a good
 * week or a dead one, which is the only reason to draw a shape instead.
 */

const DAYS = 30;

/** Fills the gaps. A day with no enquiries is a fact about the business and
 *  must be drawn as a zero, not skipped — a series that omits quiet days
 *  compresses a flat month into a line that looks busy. */
function densify(rows: { d: string; n: string }[], days: number): { t: string; v: number }[] {
  const byDay = new Map(rows.map((r) => [r.d.slice(0, 10), Number(r.n)]));
  const out: { t: string; v: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      t: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
      v: byDay.get(key) ?? 0,
    });
  }
  return out;
}

export default async function Overview() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);

  const [counts, recent, stale, daily, byEmirate, bySource, byType] = await Promise.all([
    query<{ status: string; n: string }>(
      'SELECT status, count(*) AS n FROM leads WHERE deleted_at IS NULL GROUP BY status'),
    query<{ reference: string; name: string; company: string | null; emirate: string | null;
            status: string; created_at: string; enquiry_type: string; quantity: number | null }>(
      `SELECT reference, name, company, emirate, status, created_at, enquiry_type, quantity
         FROM leads WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 8`),
    query<{ n: string }>(
      `SELECT count(*) AS n FROM leads
        WHERE deleted_at IS NULL
          AND status = 'new' AND created_at < now() - interval '24 hours'`),
    query<{ d: string; n: string }>(
      `SELECT date_trunc('day', created_at)::date::text AS d, count(*) AS n
         FROM leads
        WHERE deleted_at IS NULL AND created_at > now() - ($1 || ' days')::interval
        GROUP BY 1 ORDER BY 1`, [String(DAYS)]),
    query<{ k: string; n: string }>(
      // The sentinel stays English INSIDE the query. It is a grouping key:
      // translated in SQL, the same lead would fall into a different bucket
      // depending on who was looking at the screen, and two people comparing
      // notes would see different totals. It is translated on the way out.
      `SELECT coalesce(nullif(btrim(emirate), ''), 'Not stated') AS k, count(*) AS n
         FROM leads WHERE deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 8`),
    // Grouped on the LOWERCASED value, then presented in title case. Without
    // that, "direct" and "Direct" are two sources in the chart and the two
    // bars add up to the truth only if you notice they are the same word —
    // which is exactly the sort of thing a chart is supposed to stop you
    // having to do. The source string comes off a public form and a query
    // parameter, so its casing is not ours to rely on.
    query<{ k: string; n: string }>(
      `SELECT initcap(lower(coalesce(nullif(btrim(source), ''), 'direct'))) AS k,
              count(*) AS n
         FROM leads WHERE deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 6`),
    query<{ k: string; n: string }>(
      `SELECT initcap(lower(enquiry_type)) AS k, count(*) AS n
         FROM leads WHERE deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 6`),
  ]);

  const by = Object.fromEntries(counts.map((c) => [c.status, Number(c.n)]));
  const total = counts.reduce((s, c) => s + Number(c.n), 0);
  const open = total - (by.won ?? 0) - (by.lost ?? 0);
  const uncontacted = Number(stale[0]?.n ?? 0);

  const series = densify(daily, DAYS);
  const last7 = series.slice(-7).reduce((s, p) => s + p.v, 0);
  const prev7 = series.slice(-14, -7).reduce((s, p) => s + p.v, 0);
  // A change against nothing is not a percentage. Say "first week" instead of
  // dividing by zero and printing Infinity%.
  const trend = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);

  const won = by.won ?? 0;
  const decided = won + (by.lost ?? 0);
  const winRate = decided === 0 ? null : Math.round((won / decided) * 100);

  return (
    <>
      <h1>{t('Overview')}</h1>
      <p className="adm-sub">{t('Signed in as')} {user.name}</p>

      <div className="adm-cards">
        <div className="adm-card">
          <b>{total}</b><span>{t('Total leads')}</span>
        </div>
        <div className="adm-card">
          <b>{last7}</b>
          <span>
            {t('Last 7 days')}
            {trend !== null && (
              <i className="adm-trend" data-dir={trend >= 0 ? 'up' : 'down'}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
              </i>
            )}
          </span>
        </div>
        <div className="adm-card"><b>{open}</b><span>{t('Open')}</span></div>
        <div className="adm-card">
          <b>{winRate === null ? '—' : `${winRate}%`}</b>
          <span>{decided === 0 ? t('Win rate — none decided yet') : `${t('Win rate — none decided yet').split('—')[0].trim()}: ${decided}`}</span>
        </div>
      </div>

      {uncontacted > 0 && (
        <p className="adm-err">
          {uncontacted} {uncontacted === 1 ? t('lead has') : t('leads have')} {t('been sitting')}{' '}
          {t('uncontacted for more than 24 hours.')}{' '}
          <Link href="/admin/leads?status=new">{t('Open them →')}</Link>
        </p>
      )}

      <div className="adm-grid-2">
        <section className="adm-panel adm-pad">
          <h2>{t('Enquiries, last 30 days')}</h2>
          <p className="adm-sub adm-sub-tight">
            {last7} in the last seven days
            {trend !== null && `, ${trend >= 0 ? 'up' : 'down'} ${Math.abs(trend)}% on the seven before`}
            {trend === null && last7 > 0 && ' — the first week with any'}.
          </p>
          <TimeArea points={series} label={`Enquiries over ${DAYS} days`} />
        </section>

        <section className="adm-panel adm-pad">
          <h2>{t('Where they are')}</h2>
          <p className="adm-sub adm-sub-tight">
            Every lead sits at one stage. The percentage is how many of the
            previous stage reached this one.
          </p>
          <Funnel stages={STATUSES.filter((s) => s !== 'lost').map((s) => ({ k: s, v: by[s] ?? 0 }))} />
        </section>
      </div>

      <div className="adm-grid-3">
        <section className="adm-panel adm-pad">
          <h2>{t('By emirate')}</h2>
          <BarList rows={byEmirate.map((r) => ({
            k: r.k === 'Not stated' ? t('Not stated') : r.k, v: Number(r.n),
          }))} label={t('By emirate')} />
        </section>
        <section className="adm-panel adm-pad">
          <h2>{t('By enquiry')}</h2>
          <Donut rows={byType.map((r) => ({ k: r.k, v: Number(r.n) }))}
                 label={t('Leads by enquiry type')} totalLabel={t('TOTAL')} />
        </section>
        <section className="adm-panel adm-pad">
          <h2>{t('How they found us')}</h2>
          <BarList rows={bySource.map((r) => ({ k: r.k, v: Number(r.n) }))} label={t('Leads by source')} />
        </section>
      </div>

      <h2>{t('Latest enquiries')}</h2>
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
                <th>{t('Reference')}</th><th>{t('Name')}</th><th>{t('Company')}</th><th>{t('Type')}</th>
                <th>{t('Qty')}</th><th>{t('Emirate')}</th><th>{t('Status')}</th><th>{t('Received')}</th>
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
