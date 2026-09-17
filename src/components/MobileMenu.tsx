'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHydrated } from '@/lib/use-hydrated';

export type NavItem = { href: string; label: string };

/**
 * The navigation, on a phone.
 *
 * Until now there was none. `.nav` was `display: none` below 900px with
 * nothing in its place, so a visitor on a phone could reach the quote form and
 * whatever the page they landed on happened to link to — and nothing else. The
 * catalogue, the collections, the journal and the contact page were simply
 * unreachable on the device most of this site's traffic arrives on.
 *
 * A panel rather than a full-screen takeover: the page stays visible behind
 * it, which keeps the sense of where you are, and closing it is one tap
 * anywhere. Everything a thumb touches is at least 48px.
 */
export default function MobileMenu({
  items, quoteHref = '/quote', contact,
}: {
  items: NavItem[];
  quoteHref?: string;
  contact?: { email: string; phone: string; whatsapp: string; whatsappLabel: string };
}) {
  const path = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // The panel is portalled to <body>, and that is not a stylistic choice.
  // The header sets backdrop-filter, and an ancestor with a filter becomes the
  // containing block for position:fixed descendants — so a panel rendered
  // inside the header was being positioned against the 78px header box rather
  // than against the viewport, and came out sideways.
  const mounted = useHydrated();

  // What is remembered is the page the menu was opened on, not a boolean. It
  // therefore closes itself on navigation by arithmetic rather than by an
  // effect that fires after the new page has already rendered underneath it.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === path;
  const setOpen = (v: boolean) => setOpenedAt(v ? path : null);

  useEffect(() => {
    if (!open) return;

    // Hold the page still. A body that scrolls behind an open panel is how you
    // lose your place on a long catalogue by opening the menu.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      // setOpenedAt, not setOpen: the state setter is stable across renders,
      // so the listener does not have to be torn down and rebuilt on each one.
      if (e.key === 'Escape') { setOpenedAt(null); button.current?.focus(); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      // Keep the keyboard inside the panel while it is over everything else.
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);

    // Move focus in, so a screen reader and a keyboard both land in the panel
    // rather than continuing down the page behind it.
    panel.current?.querySelector<HTMLElement>('a[href]')?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const wa = contact?.whatsapp?.replace(/[^\d]/g, '') ?? '';

  return (
    <>
      <button
        ref={button}
        type="button"
        className="mnu-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close the menu' : 'Open the menu'}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {mounted && createPortal(
        <>
          {open && (
            <div className="mnu-back" onClick={() => setOpen(false)} aria-hidden="true" />
          )}

          <div
            id="mobile-menu"
            ref={panel}
            className={`mnu${open ? ' on' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            // Hidden from everything, not just from view, when closed —
            // otherwise a screen reader reads a menu that is not there and
            // Tab walks into it.
            {...(open ? {} : { inert: '' as unknown as boolean, 'aria-hidden': true })}
          >
            {/* The button that opened this sits in the header, which the
                backdrop now covers — so the way out has to be in here. */}
            <div className="mnu-top">
              <button type="button" className="mnu-x" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>

            <nav aria-label="Main">
          <ul>
            {items.map((n) => {
              const here = n.href === '/' ? path === '/' : path.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={here ? 'page' : undefined}
                        className={here ? 'on' : undefined}>
                    {n.label}
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                         strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mnu-foot">
          <Link href={quoteHref} className="btn btn-primary btn-lg mnu-cta">
            Request a quote
          </Link>
          {/* Only channels that are actually configured. The rule everywhere
              else on this site applies here too. */}
          {contact?.whatsappLabel && wa && (
            <a className="mnu-chan" href={`https://wa.me/${wa}`}
               target="_blank" rel="noopener noreferrer">
              WhatsApp {contact.whatsappLabel}
            </a>
          )}
          {contact?.phone && (
            <a className="mnu-chan" href={`tel:${contact.phone}`}>{contact.phone}</a>
          )}
          {contact?.email && (
            <a className="mnu-chan" href={`mailto:${contact.email}`}>{contact.email}</a>
          )}
        </div>
          </div>
        </>,
        document.body,
      )}

      <style>{`
        .mnu-btn {
          display: grid; place-items: center;
          width: 48px; height: 48px; margin-inline-start: 4px;
          background: none; border: 1px solid var(--line); border-radius: var(--radius);
          color: var(--olive-900); cursor: pointer; flex: none;
        }
        .mnu-btn:hover { border-color: var(--olive-700); }
        /* The whole thing exists for narrow screens; above that the real
           navigation is in the bar and this must not be in the way. */
        @media (min-width: 900px) { .mnu-btn, .mnu, .mnu-back { display: none !important; } }

        .mnu-back {
          position: fixed; inset: 0; z-index: 70;
          background: rgb(16 21 9 / .38);
          -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
        }

        .mnu {
          position: fixed; z-index: 71;
          top: 0; right: 0; bottom: 0;
          width: min(86vw, 22rem);
          display: flex; flex-direction: column;
          background: var(--bg-warm);
          border-inline-start: 1px solid var(--line);
          box-shadow: -18px 0 46px -18px rgb(10 20 8 / .3);
          transform: translateX(101%);
          transition: transform .26s var(--ease);
          overflow-y: auto; overscroll-behavior: contain;
          padding: 0 0 22px;
          padding-top: env(safe-area-inset-top, 0px);
        }
        .mnu.on { transform: translateX(0); }
        @media (prefers-reduced-motion: reduce) { .mnu { transition: none; } }

        .mnu-top {
          display: flex; justify-content: flex-end;
          padding: 10px 14px 6px;
        }
        .mnu-x {
          display: inline-flex; align-items: center; gap: .5em;
          min-height: 44px; padding: 0 .9em;
          font: inherit; font-size: .8rem; letter-spacing: .04em;
          background: none; border: 1px solid var(--line); border-radius: var(--radius);
          color: var(--fg-soft); cursor: pointer;
        }
        .mnu-x:hover { border-color: var(--olive-700); color: var(--olive-700); }

        .mnu nav ul { list-style: none; margin: 0; padding: 0; }
        .mnu nav a {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; min-height: 56px; padding: .6rem 22px;
          font-family: var(--font-display); font-size: 1.2rem;
          color: var(--olive-950); text-decoration: none;
          border-bottom: 1px solid var(--line-soft);
        }
        .mnu nav a svg { color: var(--fg-mute); flex: none; }
        .mnu nav a.on { color: var(--olive-700); background: var(--sand-100); }
        .mnu nav a.on svg { color: var(--olive-700); }
        .mnu nav a:active { background: var(--sand-100); }

        .mnu-foot { margin-top: auto; padding: 22px 22px 0; display: grid; gap: 6px; }
        .mnu-cta { width: 100%; text-align: center; }
        .mnu-chan {
          display: flex; align-items: center; min-height: 48px;
          font-size: .92rem; color: var(--fg-soft); text-decoration: none;
        }
        .mnu-chan:hover { color: var(--olive-700); }
      `}</style>
    </>
  );
}
