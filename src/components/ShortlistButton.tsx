'use client';

import { addToShortlist, removeFromShortlist, type ShortlistItem } from '@/lib/shortlist';
import { useShortlist } from '@/lib/use-shortlist';

/**
 * Add or remove one specimen.
 *
 * Rendered on the server as "not on the list" and corrected as soon as the
 * browser takes over. The alternative — rendering nothing until localStorage
 * has been read — makes the button appear a moment after the card, which on a
 * grid of twenty-four specimens is a page that twitches. Being briefly wrong
 * in a way nobody can act on is better than being briefly absent.
 */
export default function ShortlistButton({
  item, compact = false,
}: {
  item: Omit<ShortlistItem, 'qty'>;
  compact?: boolean;
}) {
  const on = useShortlist().some((i) => i.ref === item.ref);

  const toggle = (e: React.MouseEvent) => {
    // These sit inside the card's link on the catalogue grid. Without this,
    // adding a specimen navigates to it.
    e.preventDefault();
    e.stopPropagation();
    if (on) removeFromShortlist(item.ref);
    else addToShortlist(item);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`sl-btn${compact ? ' sl-btn-compact' : ''}${on ? ' on' : ''}`}
      aria-pressed={on}
      title={on ? 'Remove from your shortlist' : 'Add to your shortlist'}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
           strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {on ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
      <span className="sl-btn-txt">{on ? 'On your list' : 'Add to list'}</span>

      <style>{`
        .sl-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: .55em 1em; border-radius: 999px;
          font: inherit; font-size: .82rem; font-weight: 500; cursor: pointer;
          background: var(--bg); color: var(--olive-900);
          border: 1px solid var(--line);
          transition: border-color .15s ease, background .15s ease, color .15s ease;
        }
        .sl-btn:hover { border-color: var(--olive-700); color: var(--olive-700); }
        .sl-btn.on {
          background: var(--olive-700); color: #fff; border-color: var(--olive-700);
        }
        .sl-btn.on:hover { background: var(--olive-900); border-color: var(--olive-900); color: #fff; }
        .sl-btn-compact { padding: .42em .8em; font-size: .76rem; }
        /* 32px on a phone, on the one control that turns a browse into an
           enquiry. */
        @media (pointer: coarse) { .sl-btn, .sl-btn-compact { min-height: 44px; } }
        @media (prefers-reduced-motion: reduce) { .sl-btn { transition: none; } }
      `}</style>
    </button>
  );
}
