import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { countOpen } from '@/lib/alerts';
import './admin.css';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/quotes', label: 'Quotations' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/shipments', label: 'Shipments' },
  { href: '/admin/finance', label: 'Finance' },
  { href: '/admin/alerts', label: 'Alerts' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/backups', label: 'Backups' },
  { href: '/admin/users', label: 'Accounts' },
];

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
      <header className="adm-bar">
        <Link href="/admin" className="adm-brand">
          Verde Garden <span>Operations</span>
        </Link>
        <nav>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
              {n.href === '/admin/alerts' && badge.open > 0 && (
                <span className="adm-badge" data-urgent={badge.urgent > 0}>{badge.open}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="adm-me">
          <Link href="/admin/account" className="adm-who">{user.name}</Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="adm-out">Sign out</button>
          </form>
        </div>
      </header>
      <div className="adm-body">{children}</div>
    </div>
  );
}
