'use client';

import Link from 'next/link';
import { adminUi } from '@/lib/admin-ui';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import AdminNav from './Nav';

/**
 * Is this the drawer, or is it the column?
 *
 * The same <aside> is both: above 900px it is the console's permanent left
 * column and below it, it is a drawer that slides in over the page. That
 * matters because the drawer has to be taken out of the tab order and the
 * accessibility tree while it is closed — admin.css hides it with nothing but
 * a transform, so all twenty of its controls were still focusable, sitting
 * 275px off the left edge, and a keyboard user on a phone Tabbed through
 * every one of them with the focus ring nowhere on screen before reaching the
 * page. The public site already guards its menu this way
 * (src/components/MobileMenu.tsx); the console never got the same treatment.
 *
 * The guard cannot simply be copied across, though: apply `inert` at desk
 * width and the console's actual navigation becomes unreachable. So it is
 * gated on the breakpoint, read from the browser rather than guessed, and the
 * number below is the one in the `@media (max-width: 900px)` block of
 * admin.css that does the hiding. If that number moves, this moves with it.
 *
 * useSyncExternalStore rather than a flag set in an effect, as in
 * src/lib/use-hydrated.ts: the server has no viewport to measure, so it
 * answers "column" — the state in which nothing is hidden from anybody — and
 * the browser corrects it on the first client render rather than the second.
 */
const DRAWER_WIDTH = '(max-width: 900px)';

const subscribeWidth = (onChange: () => void) => {
  const mq = window.matchMedia(DRAWER_WIDTH);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};

function useIsDrawer(): boolean {
  return useSyncExternalStore(
    subscribeWidth,
    () => window.matchMedia(DRAWER_WIDTH).matches,
    () => false,
  );
}

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
  const t = adminUi(user.locale);
  const path = usePathname();
  const drawer = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const isDrawer = useIsDrawer();

  // The page it was opened on, rather than a boolean — so navigating closes it
  // without an effect that runs after the new page has drawn behind it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const isOpen = openedAt !== null && openedAt === path;

  /**
   * Closing puts focus back on the button that opened it.
   *
   * Opening moves focus into the drawer, so closing has to bring it back:
   * pressing Escape used to leave focus on a link inside a panel that had
   * just slid off the screen, and the next Tab carried on from there — from
   * nowhere, as far as anyone looking at the screen could tell. Only the ways
   * of closing that keep you on the page go through here; navigating away
   * closes the drawer too, and there the page you asked for should have the
   * focus, not the menu button you left behind.
   */
  const close = useCallback(() => {
    setOpenedAt(null);
    button.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    drawer.current?.querySelector<HTMLElement>('a[href]')?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Only on narrow screens. Above that the column is the navigation. */}
      <div className="adm-bar">
        <Link href="/admin" className="adm-bar-brand">
          <Mark />
          <span>{t('Operations')}</span>
        </Link>
        <button
          ref={button}
          type="button"
          className="adm-bar-btn"
          aria-expanded={isOpen}
          aria-controls="adm-drawer"
          aria-label={isOpen ? t('Close the menu') : t('Open the menu')}
          onClick={() => (isOpen ? close() : setOpenedAt(path))}
        >
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
               strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            {isOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
          {urgent && <i className="adm-bar-dot" aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div className="adm-scrim" onClick={close} aria-hidden="true" />
      )}

      <aside
        id="adm-drawer"
        ref={drawer}
        className={`adm-side${isOpen ? ' on' : ''}`}
        // Hidden from everything, not just from view, while it is closed —
        // otherwise a screen reader reads out a menu that is not on the
        // screen and Tab walks into it. Only while it IS the drawer: at desk
        // width this element is the navigation itself and must stay reachable.
        {...(isDrawer
          ? isOpen
            ? { role: 'dialog', 'aria-modal': true, 'aria-label': t('Menu') }
            : { inert: '' as unknown as boolean, 'aria-hidden': true }
          : {})}
      >
        <Link href="/admin" className="adm-brand">
          <Mark />
          <span className="adm-brandtxt">
            <strong>Verde Garden</strong>
            <em>{t('Operations')}</em>
          </span>
        </Link>

        <AdminNav open={open} urgent={urgent} user={user} />
      </aside>
    </>
  );
}
