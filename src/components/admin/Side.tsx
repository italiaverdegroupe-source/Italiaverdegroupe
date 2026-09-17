'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AdminNav from './Nav';

const Mark = () => (
  <span className="adm-brandmark" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21V11" strokeLinecap="round" />
      <path d="M12 12c0-4.4 3.1-8 7-8 .4 3.9-2.4 8-7 8Z" strokeLinejoin="round" />
      <path d="M12 16c-3.4 0-6-2.8-6-6.2 3 .3 6 2.9 6 6.2Z" strokeLinejoin="round" />
    </svg>
  </span>
);

/**
 * The console's shell, and its behaviour on a phone.
 *
 * On a desk this is a column down the left and nothing about it moves. On a
 * narrow screen it used to become a strip along the top that scrolled
 * sideways: fifteen destinations in a 31px-tall row, most of them past the
 * edge, with no indication that there was anything to scroll to and no way to
 * tell which one you were on. A console is a desk tool, but "checking whether
 * that delivery landed" happens on a phone, in a car, and it has to work.
 *
 * So: a bar with the page you are on and one button, and a drawer holding the
 * whole grouped list at a size a thumb can hit.
 */
export default function AdminSide({ open, urgent, user }: {
  open: number; urgent: boolean;
  user: { name: string; role: string; locale?: string | null };
}) {
  const path = usePathname();
  const drawer = useRef<HTMLElement>(null);

  // The page it was opened on, rather than a boolean — so navigating closes it
  // without an effect that runs after the new page has drawn behind it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const isOpen = openedAt !== null && openedAt === path;

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenedAt(null); };
    document.addEventListener('keydown', onKey);
    drawer.current?.querySelector<HTMLElement>('a[href]')?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <>
      {/* Only on narrow screens. Above that the column is the navigation. */}
      <div className="adm-bar">
        <Link href="/admin" className="adm-bar-brand">
          <Mark />
          <span>Operations</span>
        </Link>
        <button
          type="button"
          className="adm-bar-btn"
          aria-expanded={isOpen}
          aria-controls="adm-drawer"
          aria-label={isOpen ? 'Close the menu' : 'Open the menu'}
          onClick={() => setOpenedAt(isOpen ? null : path)}
        >
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
               strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {isOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
          {urgent && <i className="adm-bar-dot" aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div className="adm-scrim" onClick={() => setOpenedAt(null)} aria-hidden="true" />
      )}

      <aside
        id="adm-drawer"
        ref={drawer}
        className={`adm-side${isOpen ? ' on' : ''}`}
        {...(isOpen ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'Menu' } : {})}
      >
        <Link href="/admin" className="adm-brand">
          <Mark />
          <span className="adm-brandtxt">
            <strong>Verde Garden</strong>
            <em>Operations</em>
          </span>
        </Link>

        <AdminNav open={open} urgent={urgent} user={user} />
      </aside>
    </>
  );
}
