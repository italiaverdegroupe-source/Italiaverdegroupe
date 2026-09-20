'use client';

import L from '@/components/L';
import { usePathname } from 'next/navigation';
import { splitLocale } from '@/lib/i18n';
import { useLocale } from '@/components/LocaleProvider';
import { specimenCount } from '@/lib/product-copy';
import { ui } from '@/lib/ui';
import { useShortlist } from '@/lib/use-shortlist';

/**
 * A running count, so a shortlist somebody is building never disappears.
 *
 * Bottom LEFT, because the WhatsApp button is bottom right and two floating
 * things in one corner is how a phone screen ends up with neither being
 * pressable. It appears only when there is something on the list, and never on
 * the shortlist page itself, where it would point at the page you are on.
 */
export default function ShortlistBar() {
  // The locale prefix is stripped first. '/ar/shortlist'.startsWith('/shortlist')
  // is false, so without this the floating bar would sit on top of the very
  // page it points at, in both translated languages.
  const { path } = splitLocale(usePathname());
  const locale = useLocale();
  const t = ui(locale);
  const list = useShortlist();
  const items = list.length;
  const count = list.reduce((s, i) => s + i.qty, 0);

  if (items === 0 || path.startsWith('/shortlist')) return null;

  return (
    <L href="/shortlist" className="slb">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
           strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
      {/* The whole phrase, not a number with a noun bolted after it. English
          and Italian put the digit first and Arabic often does not put one in
          at all — "نموذجان" is the word for two of something and contains no
          2 — so splitting the count from its noun to embolden one of them
          produces a bar that reads as nonsense in one language out of three.
          The emphasis is on the line instead. */}
      <span className="slb-txt">
        <strong>{specimenCount(items, locale)}</strong>
        {count !== items && <em> · {t('sl.plantsTotal', { n: count })}</em>}
      </span>
      <span className="slb-go" aria-hidden="true">&rarr;</span>

      <style>{`
        .slb {
          position: fixed; z-index: 60;
          inset-inline-start: clamp(14px, 2.2vw, 26px); bottom: clamp(14px, 2.2vw, 26px);
          display: inline-flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 999px;
          background: var(--olive-900); color: #FBF9F4; text-decoration: none;
          font-size: .86rem; letter-spacing: .01em;
          box-shadow: 0 14px 34px -12px rgb(10 20 8 / .55), 0 2px 6px rgb(10 20 8 / .22);
          transition: transform .18s var(--ease), background .18s ease;
        }
        .slb:hover { background: var(--olive-950); transform: translateY(-2px); }
        .slb strong { font-weight: 600; }
        .slb em { font-style: normal; opacity: .72; }
        .slb-go { opacity: .7; }
        /* min-height, not just the tighter padding. Below 420px the padding
           came down to 10px and the type to .8rem, which took the bar to
           41px — measured at 320, 360, 375, 390 and 414 in all three
           languages, and 41px in every one of them. This site holds itself
           to a 44px floor for anything a finger has to find, and this bar is
           the only route to /shortlist a phone has: the drawer carries no
           link to it. Three pixels short on the one target with no
           neighbours to fall back on is still three pixels short. */
        @media (max-width: 420px) {
          .slb {
            padding: 10px 13px; gap: 8px; font-size: .8rem; min-height: 44px;
            inset-inline-start: 10px; bottom: 10px;
          }
          .slb em { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .slb { transition: background .18s ease; }
          .slb:hover { transform: none; }
        }
        @media print { .slb { display: none; } }
      `}</style>
    </L>
  );
}
