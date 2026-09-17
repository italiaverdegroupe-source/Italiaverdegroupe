'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  LOCALES, LOCALE_NAMES, LOCALE_SHORT, LOCALE_TAG, localePath, splitLocale,
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
export default function LangSwitch({ id = 'lang' }: { id?: string }) {
  const pathname = usePathname();
  const { locale: current, path } = splitLocale(pathname);
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
      <button
        type="button"
        className="lang-btn"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={`Language: ${LOCALE_NAMES[current]}`}
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
                href={localePath(l, path)}
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
