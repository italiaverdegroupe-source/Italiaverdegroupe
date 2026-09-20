import AdminSide from '@/components/admin/Side';
import { getSessionUser } from '@/lib/auth';
import { countOpen } from '@/lib/alerts';
import './admin.css';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  /**
   * The one database call in the console that no error boundary can catch.
   *
   * error.js "does not wrap the layout.js or template.js above it in the same
   * segment" (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md),
   * so admin/error.tsx — written precisely so that a slow or unreachable
   * database never drops an operator on an unbranded page — cannot catch a
   * throw from this line, and there is no src/app/global-error.tsx above it
   * either. An outage therefore escaped the console entirely and landed on
   * Next's built-in fallback.
   *
   * Catching it here hands the failure down instead of up: the page below
   * runs its own queries inside the boundary, throws there, and the operator
   * gets the console's own error screen. It does not weaken anything — no
   * console page renders privileged data on the strength of this call; every
   * one of them re-checks the session itself. All that is decided here is
   * whether to draw the chrome around whatever comes back.
   */
  const user = await getSessionUser().catch(() => null);

  // The sign-in screen is the one page reachable without a session, and it is
  // a full-bleed composition of its own. Wrapping it in the console's padded,
  // max-width content column is exactly what made it look like a slab dropped
  // into a page, so it is returned bare.
  if (!user) return <>{children}</>;

  // The count rides in the navigation because an alert nobody sees is not an
  // alert. If the table is not there yet, show nothing rather than a 500.
  const badge = await countOpen(user).catch(() => ({ open: 0, urgent: 0 }));

  return (
    <div className="adm">
      {/* Down the side, not across the top. Thirteen destinations in a row is a
          line of undifferentiated words that gets narrower every time one is
          added; in a column they group by purpose, carry a mark each, and
          leave the width of the screen to the tables, which is what anybody
          actually spends the day reading. */}
      <AdminSide open={badge.open} urgent={badge.urgent > 0}
                 user={{ name: user.name, role: user.role, locale: user.locale }} />
      {/* A landmark, not a div. The page content was the one part of a console
          screen that sat in no landmark at all, which is why every one of
          these pages reported no <main>: a screen reader could jump to the
          navigation but not to the work. tabIndex={-1} is what lets the skip
          link in the console root layout actually move focus here — an anchor
          to a target that cannot hold focus only moves the scroll position,
          and the next Tab goes back to the top of the navigation. */}
      <main id="adm-main" className="adm-body" tabIndex={-1}>{children}</main>
    </div>
  );
}
