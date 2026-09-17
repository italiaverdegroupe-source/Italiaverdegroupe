import Link from 'next/link';
import AdminNav from '@/components/admin/Nav';
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
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <span className="adm-brandmark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21V11" strokeLinecap="round" />
              <path d="M12 12c0-4.4 3.1-8 7-8 .4 3.9-2.4 8-7 8Z" strokeLinejoin="round" />
              <path d="M12 16c-3.4 0-6-2.8-6-6.2 3 .3 6 2.9 6 6.2Z" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="adm-brandtxt">
            <strong>Verde Garden</strong>
            <em>Operations</em>
          </span>
        </Link>

        <AdminNav open={badge.open} urgent={badge.urgent > 0}
                  user={{ name: user.name, role: user.role }} />

      </aside>
      <div className="adm-body">{children}</div>
    </div>
  );
}
