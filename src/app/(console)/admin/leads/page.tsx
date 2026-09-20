import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { STATUSES, StatusPill, fmtDate } from '@/components/admin/bits';
import { adminUi, adminStatus } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

type Row = {
  /**
   * The size of the whole filtered set, repeated on every row by
   * `count(*) OVER ()`. A window function is evaluated before LIMIT, so this
   * is the real total and it costs no second round trip.
   */
  total: string;
  reference: string; name: string; company: string | null; email: string;
  phone: string | null; emirate: string | null; enquiry_type: string;
  product_ref: string | null; quantity: number | null; status: string; created_at: string;
  deleted_at: string | null;
};

/**
 * How many leads are on one page.
 *
 * There was no pagination at all: the query took the newest 300 and the
 * subtitle printed "300 shown", which is true and tells you nothing — there
 * was no signal that a 301st lead existed and no route through the interface
 * that could reach it. At roughly an enquiry a day this list starts losing
 * its oldest records inside a year, and the oldest records are the ones
 * nobody remembers the name of. A hundred is a long page that still renders
 * quickly; the count below is of the whole filtered set, not of this page.
 */
const PER_PAGE = 100;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; deleted?: string; page?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const st = adminStatus(user.locale);
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as never) ? sp.status! : null;
  const q = (sp.q ?? '').trim();
  // The bin is a filter rather than a separate screen: same columns, same
  // search, one less click to put something back.
  const showDeleted = sp.deleted === '1';

  const where: string[] = [];
  const params: unknown[] = [];
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (q) {
    params.push(`%${q}%`);
    const i = params.length;
    where.push(`(name ILIKE $${i} OR company ILIKE $${i} OR email ILIKE $${i} OR reference ILIKE $${i})`);
  }

  const clauses = [showDeleted ? 'deleted_at IS NOT NULL' : 'deleted_at IS NULL', ...where];

  // A page number that is not a number, or is zero or negative, is a URL
  // somebody typed or a stale link — it becomes page one rather than an
  // error, because there is nothing dangerous about it.
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const offset = (page - 1) * PER_PAGE;
  params.push(offset);

  const rows = await query<Row>(
    `SELECT count(*) OVER () AS total,
            reference, name, company, email, phone, emirate, enquiry_type,
            product_ref, quantity, status, created_at, deleted_at
       FROM leads
      WHERE ${clauses.join(' AND ')}
      ORDER BY ${showDeleted ? 'deleted_at' : 'created_at'} DESC
      LIMIT ${PER_PAGE} OFFSET $${params.length}`, params);

  // No rows means either nothing matches or the page number is past the end;
  // either way there is no window count to read, and zero is the honest
  // answer for what is on screen.
  const total = Number(rows[0]?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Changing a filter deliberately drops the page number: page 7 of "all"
  // is not page 7 of "lost", and landing on an empty page because the new
  // filter has fewer results is the one thing a filter must not do.
  const link = (s: string | null, bin = showDeleted) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    if (q) p.set('q', q);
    if (bin) p.set('deleted', '1');
    const str = p.toString();
    return str ? `/admin/leads?${str}` : '/admin/leads';
  };

  /** The same list, another page: everything else about the view is kept. */
  const pageLink = (n: number) => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (q) p.set('q', q);
    if (showDeleted) p.set('deleted', '1');
    if (n > 1) p.set('page', String(n));
    const str = p.toString();
    return str ? `/admin/leads?${str}` : '/admin/leads';
  };

  return (
    <>
      <h1>{t("Leads")}</h1>
      {/* The count is of everything that matches, not of what fits on the
          page. "300 shown" was accurate and useless: it read identically
          whether there were 300 leads or 3,000. */}
      <p className="adm-sub">
        {rows.length === 0
          ? (page > 1 ? t("There is nothing on this page.") : t("Nothing matches."))
          : t("Showing {from}–{to} of {total}", {
              from: offset + 1, to: offset + rows.length, total })}
        {status ? ` · ${st(status)}` : ''}{q ? ` · “${q}”` : ''}
      </p>

      <div className="adm-filters">
        <Link href={link(null)} className="adm-chip" data-on={String(!status)}>{t("All")}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={link(s)} className="adm-chip" data-on={String(status === s)}>{st(s)}</Link>
        ))}
        <Link href={link(status, !showDeleted)} className="adm-chip" data-on={String(showDeleted)}>
          {showDeleted ? t("Back to live") : t("Deleted")}
        </Link>
      </div>

      <form method="get" className="adm-filters">
        {/* The value has to be the stored status, not its translation — the
            query matches on the column. */}
        {status && <input type="hidden" name="status" value={status} />}
        {showDeleted && <input type="hidden" name="deleted" value="1" />}
        <input name="q" defaultValue={q} className="adm-search"
               placeholder={t("Search name, company, email, reference")} />
        <button className="adm-btn adm-btn-sec" type="submit">{t("Search")}</button>
      </form>

      <div className="adm-panel">
        {rows.length === 0 ? (
          <p className="adm-empty">
            {page > 1
              ? <>{t("There is nothing on this page.")}{' '}<Link href={pageLink(1)}>{t("Back to the first page")}</Link></>
              : t("Nothing matches.")}
          </p>
        ) : (
          <table className="adm-t">
            <thead>
              <tr>
                <th>{t("Reference")}</th><th>{t("Name")}</th><th>{t("Company")}</th><th>{t("Contact")}</th>
                <th>{t("Type")}</th><th>{t("Specimen")}</th><th>{t("Qty")}</th><th>{t("Emirate")}</th>
                <th>{t("Status")}</th><th>{showDeleted ? t("Deleted") : t("Received")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.reference}>
                  <td><Link href={`/admin/leads/${l.reference}`}>{l.reference}</Link></td>
                  <td>{l.name}</td>
                  <td>{l.company ?? '—'}</td>
                  {/* Side by side, not one above the other. On a phone every
                      link in a table is given a 44px tap target, so two
                      stacked links made an 88px cell and a row 107px tall —
                      five leads to a screen. In a row they share one. */}
                  <td>
                    <span className="adm-contact">
                      <a href={`mailto:${l.email}`}>{l.email}</a>
                      {l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}
                    </span>
                  </td>
                  <td>{l.enquiry_type}</td>
                  <td>{l.product_ref ?? '—'}</td>
                  <td className="num">{l.quantity ?? '—'}</td>
                  <td>{l.emirate ?? '—'}</td>
                  {/* The raw status colours the pill, the translated one is
                      what the reader sees. Passing the translation to both
                      produced `pill-nuova` on the Italian console, which
                      admin.css has no rule for, and every pill on this list
                      went flat. */}
                  <td><StatusPill status={l.status} label={st(l.status)} /></td>
                  <td className="num">{fmtDate(showDeleted ? (l.deleted_at ?? l.created_at) : l.created_at, user.locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Nothing to page through when nothing came back: a page number past
          the end has no count behind it, so "Page 7 of 1" is all the pager
          could honestly say. The empty panel above offers the way back. */}
      {rows.length > 0 && (page > 1 || page < pages) && (
        <nav className="adm-filters" aria-label={t("Pages")}>
          {page > 1 && (
            <Link className="adm-chip" rel="prev" href={pageLink(page - 1)}>{t("← Previous")}</Link>
          )}
          <span className="adm-chip" data-on="true" aria-current="page">
            {t("Page {n} of {total}", { n: page, total: pages })}
          </span>
          {page < pages && (
            <Link className="adm-chip" rel="next" href={pageLink(page + 1)}>{t("Next →")}</Link>
          )}
        </nav>
      )}
    </>
  );
}
