'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import {
  LOCALES, LOCALE_NAMES, LOCALE_SHORT, LOCALE_TAG, LOCALE_LABEL, localePath, splitLocale,
} from '@/lib/i18n';

/**
 * The language switcher.
 *
 * It keeps you on the page you are on. A switcher that sends every reader to
 * the homepage is the commonest version of this control and the most annoying:
 * somebody three clicks into the catalogue who wants to read a specimen in
 * Arabic is asking for THIS page in Arabic, not for the front door.
 *
 * usePathname() is safe here where it is not safe in a link. This is a client
 * component that only ever reads the path in the browser, after hydration —
 * it is never used to build an href at prerender time, which is the case that
 * would bake /en/ into the markup. See the note in LocaleProvider.
 */
/**
 * location.search, as an external store.
 *
 * Nothing changes it but a navigation. A push or replace re-renders this
 * component through usePathname(), and useSyncExternalStore re-reads the
 * snapshot on every render; popstate covers the back and forward buttons,
 * which change the URL without React being told.
 */
function subscribeToLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}
const readQuery = () => window.location.search.replace(/^\?/, '');
const noQuery = () => '';

export default function LangSwitch({ id = 'lang' }: { id?: string }) {
  const pathname = usePathname();
  const { locale: current, path } = splitLocale(pathname);

  /**
   * The query string comes with you.
   *
   * usePathname() is the path and nothing else, so switching language threw
   * away everything after the '?'. A reader who had searched the catalogue for
   * "olive", filtered to a size band and then asked for Arabic landed on an
   * unfiltered Arabic catalogue and had to do it all again — and the same on
   * /quote, where ?type=bulk decides which enquiry form they are looking at.
   * Nothing said their choices had been dropped; the page simply came back
   * different.
   *
   * READ FROM THE BROWSER, NOT FROM useSearchParams(). The hook is the obvious
   * answer and it is the wrong one here: this switcher sits in the header of
   * every page, and useSearchParams() makes the client tree up to the nearest
   * Suspense boundary client-rendered — which, with no boundary above it, is
   * the entire page. The build says so outright ("useSearchParams() should be
   * wrapped in a suspense boundary") and refuses to prerender. Wrapping it
   * would work, but the fallback would be a hole where the language control
   * belongs, popping in after hydration on all 285 URLs.
   *
   * useSyncExternalStore is the hook for exactly this: a value that lives
   * outside React, read during render, with a separate server snapshot so
   * hydration cannot mismatch. The server snapshot is the empty string, so the
   * first paint carries the plain path — the href this had before, and the one
   * that still works with JavaScript off; the browser snapshot appends the
   * query. Doing it with useState + useEffect also works, but it sets state
   * synchronously inside an effect, which cascades a render and which the
   * react-hooks lint rule rejects outright.
   */
  const qs = useSyncExternalStore(subscribeToLocation, readQuery, noQuery);
  const keep = (href: string) => (qs ? `${href}?${qs}` : href);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="lang" ref={box}>
      {/* aria-label was the English word "Language" on every locale, so a
          screen reader on the Arabic site announced the one control that
          changes language in the language its user had already chosen not to
          read. aria-haspopup tells them it opens something before they press
          it, which an expanded state alone does not. */}
      <button
        type="button"
        className="lang-btn"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-menu`}
        aria-label={`${LOCALE_LABEL[current]}: ${LOCALE_NAMES[current]}`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
        </svg>
        <span>{LOCALE_SHORT[current]}</span>
        <i className="lang-caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="lang-menu" id={`${id}-menu`}>
          {LOCALES.map((l) => (
            <li key={l}>
              {/* hrefLang tells a browser and a crawler what is on the other
                  end before following it; aria-current marks the one you are
                  already reading, which an icon alone does not say aloud. */}
              <Link
                href={keep(localePath(l, path))}
                hrefLang={LOCALE_TAG[l]}
                lang={LOCALE_TAG[l]}
                aria-current={l === current ? 'true' : undefined}
                onClick={() => setOpen(false)}
              >
                {LOCALE_NAMES[l]}
                {l === current && <i className="lang-tick" aria-hidden="true">✓</i>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
