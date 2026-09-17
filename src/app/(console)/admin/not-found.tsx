import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { adminUi } from '@/lib/admin-ui';

/**
 * A record the console asked for and could not find.
 *
 * Ten pages call notFound() when an order, quotation, shipment or lead code
 * does not resolve. Before the console had its own root layout those landed on
 * the site's 404, complete with the marketing header; after the split they
 * landed on Next's unstyled default, which is worse — a signed-in operator
 * with no branding and no way back. This is the console's own.
 *
 * It reads the language off the session rather than from params, because a
 * not-found is handed none. That works here where it would not on the public
 * site: this page is only ever reached by somebody signed in, so there is a
 * stored preference to read — a fact, not a guess.
 */
export default async function ConsoleNotFound() {
  const user = await getSessionUser();
  const t = adminUi(user?.locale);
  return (
    <>
      <h1>{t('No such record')}</h1>
      <p className="adm-sub">
        {t('That code does not match anything in the system. It may have been cancelled, renumbered, or mistyped.')}
      </p>
      <div className="adm-panel adm-pad">
        <p className="adm-sub" style={{ marginBottom: 18 }}>
          {t('Try the list it should be in:')}
        </p>
        <div className="adm-filters" style={{ marginBottom: 0 }}>
          <Link className="adm-chip" href="/admin">{t('Overview')}</Link>
          <Link className="adm-chip" href="/admin/orders">{t('Orders')}</Link>
          <Link className="adm-chip" href="/admin/quotes">{t('Quotations')}</Link>
          <Link className="adm-chip" href="/admin/shipments">{t('Shipments')}</Link>
          <Link className="adm-chip" href="/admin/leads">{t('Leads')}</Link>
          <Link className="adm-chip" href="/admin/inventory">{t('Inventory')}</Link>
        </div>
      </div>
    </>
  );
}
