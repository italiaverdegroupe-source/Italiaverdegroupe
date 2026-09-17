'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import AdminLang from './AdminLang';
import { adminUi, type AdminKey } from '@/lib/admin-ui';

/**
 * The console's navigation, down the side rather than across the top.
 *
 * Thirteen destinations in a horizontal bar is a row of undifferentiated words
 * that has to be read left to right every time, and it gets narrower as the
 * list grows. Down the side they can be grouped by what they are for, each one
 * can carry a mark, and the list can grow without squeezing anything. It also
 * puts the work of the console — the table you are reading all day — in a
 * column of its own rather than under a band.
 *
 * Client-side only because it needs to know which page it is on, which is the
 * one thing the layout cannot tell it from the server.
 */

type Item = { href: string; label: AdminKey; icon: React.ReactElement };

const I = (d: string, extra?: string) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
    {extra && <path d={extra} />}
  </svg>
);

const GROUPS: { title: AdminKey; items: Item[] }[] = [
  {
    title: 'Pipeline',
    items: [
      { href: '/admin', label: 'Overview', icon: I('M3 12h4l3 8 4-16 3 8h4') },
      { href: '/admin/leads', label: 'Leads', icon: I('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6') },
      { href: '/admin/quotes', label: 'Quotations', icon: I('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6M8 13h8M8 17h5') },
      { href: '/admin/orders', label: 'Orders', icon: I('M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18M16 10a4 4 0 0 1-8 0') },
    ],
  },
  {
    title: 'Stock',
    items: [
      { href: '/admin/inventory', label: 'Inventory', icon: I('M12 21V11', 'M12 12c0-4.4 3.1-8 7-8 .4 3.9-2.4 8-7 8M12 16c-3.4 0-6-2.8-6-6.2 3 .3 6 2.9 6 6.2') },
      { href: '/admin/shipments', label: 'Shipments', icon: I('M3 7h11v9H3zM14 10h4l3 3v3h-7z', 'M7.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6M17.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6') },
    ],
  },
  {
    title: 'Money',
    items: [
      { href: '/admin/finance', label: 'Finance', icon: I('M12 2v20', 'M17 6.5A4 4 0 0 0 13 4h-2a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-2a4 4 0 0 1-4-2.5') },
      { href: '/admin/reports', label: 'Reports', icon: I('M3 3v18h18', 'M7 15l4-5 3 3 5-7') },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/alerts', label: 'Alerts', icon: I('M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0') },
      { href: '/admin/content', label: 'Content', icon: I('M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z') },
      { href: '/admin/settings', label: 'Settings', icon: I('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6', 'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 3.2 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7.6A1.6 1.6 0 0 0 8.7 1.7V1.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1.1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1.1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.1') },
      { href: '/admin/backups', label: 'Backups', icon: I('M21 8v8c0 1.7-4 3-9 3s-9-1.3-9-3V8', 'M21 8c0 1.7-4 3-9 3S3 9.7 3 8s4-3 9-3 9 1.3 9 3M21 12c0 1.7-4 3-9 3s-9-1.3-9-3') },
      { href: '/admin/users', label: 'Accounts', icon: I('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8') },
    ],
  },
];

/** Two letters is enough to tell one operator from another at a glance. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminNav({
  open, urgent, user,
}: {
  open: number; urgent: boolean;
  user: { name: string; role: string; locale?: string | null };
}) {
  // The labels are keys; the person's own choice decides what they read as.
  const t = adminUi(user.locale);
  const path = usePathname();
  // Your own account is reached from the chip at the foot of the column, not
  // from the list — so without this the one page in the console that is not in
  // the list leaves nothing marked, and the column stops telling you where you
  // are on exactly the page where you are most likely to have wandered in by
  // accident.
  const onAccount = path.startsWith('/admin/account');

  return (
    <>
    <nav className="adm-nav" aria-label={t('Console')}>
      {GROUPS.map((g) => (
        <div className="adm-navgroup" key={g.title}>
          <p className="adm-navtitle">{t(g.title)}</p>
          <ul>
            {g.items.map((n) => {
              // Overview is the only one that must match exactly: every other
              // console URL starts with /admin, so a prefix test would light it
              // up on all thirteen pages.
              const active = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? 'page' : undefined}
                        className={active ? 'on' : undefined}>
                    <span className="adm-navicon">{n.icon}</span>
                    <span className="adm-navlabel">{t(n.label)}</span>
                    {n.href === '/admin/alerts' && open > 0 && (
                      <span className="adm-badge" data-urgent={urgent}>{open}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>

    {/* Before the account chip, because somebody who cannot read the console
        needs this before they can read anything else in it. */}
    <AdminLang current={user.locale} />

    <div className="adm-me">
      <Link href="/admin/account" className={`adm-who${onAccount ? ' on' : ''}`}
            aria-current={onAccount ? 'page' : undefined}>
        <span className="adm-avatar" aria-hidden="true">{initials(user.name)}</span>
        <span className="adm-whotxt">
          <strong>{user.name}</strong>
          <em>{t(user.role === 'owner' ? 'Owner' : user.role === 'sales' ? 'Sales' : 'Viewer')}</em>
        </span>
      </Link>
      <form action="/api/admin/logout" method="post">
        <button type="submit" className="adm-out" title={t('Sign out')} aria-label={t('Sign out')}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
               strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5M21 12H9" />
          </svg>
        </button>
      </form>
    </div>
    </>
  );
}
