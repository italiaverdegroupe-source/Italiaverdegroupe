import AdminSide from '@/components/admin/Side';
import { getSessionUser } from '@/lib/auth';
import { countOpen } from '@/lib/alerts';
import './admin.css';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

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
      <div className="adm-body">{children}</div>
    </div>
  );
}
