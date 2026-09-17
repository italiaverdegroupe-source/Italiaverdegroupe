'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const path = usePathname();
  const list = useShortlist();
  const items = list.length;
  const count = list.reduce((s, i) => s + i.qty, 0);

  if (items === 0 || path.startsWith('/shortlist')) return null;

  return (
    <Link href="/shortlist" className="slb">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
           strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
      <span className="slb-txt">
        <strong>{items}</strong> specimen{items === 1 ? '' : 's'}
        {count !== items && <em> · {count} in total</em>}
      </span>
      <span className="slb-go" aria-hidden="true">&rarr;</span>

      <style>{`
        .slb {
          position: fixed; z-index: 60;
          left: clamp(14px, 2.2vw, 26px); bottom: clamp(14px, 2.2vw, 26px);
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
        @media (max-width: 420px) {
          .slb { padding: 10px 13px; gap: 8px; font-size: .8rem; left: 10px; bottom: 10px; }
          .slb em { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .slb { transition: background .18s ease; }
          .slb:hover { transform: none; }
        }
        @media print { .slb { display: none; } }
      `}</style>
    </Link>
  );
}
