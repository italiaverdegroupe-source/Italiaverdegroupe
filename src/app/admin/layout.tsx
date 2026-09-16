import type { Metadata } from 'next';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { countOpen } from '@/lib/alerts';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Operations', template: '%s — Verde Garden Operations' },
  robots: { index: false, follow: false, nocache: true },
};

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
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  // The count rides in the navigation because an alert nobody sees is not an
  // alert. If the table is not there yet, show nothing rather than a 500.
  const badge = user
    ? await countOpen(user).catch(() => ({ open: 0, urgent: 0 }))
    : { open: 0, urgent: 0 };

  return (
    <div className="adm">
      {user && (
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
            <span>{user.name}</span>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="adm-out">Sign out</button>
            </form>
          </div>
        </header>
      )}
      <div className="adm-body">{children}</div>
    </div>
  );
}
