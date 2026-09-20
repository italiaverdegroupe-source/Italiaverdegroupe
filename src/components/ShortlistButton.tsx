'use client';

import { addToShortlist, removeFromShortlist, type ShortlistItem } from '@/lib/shortlist';
import { useShortlist } from '@/lib/use-shortlist';
import { useLocale } from '@/components/LocaleProvider';
import { ui } from '@/lib/ui';

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
  // This is the most repeated piece of text on the site — sixty-eight cards on
  // /catalog, and again on every collection, every emirate and the home grid —
  // and it was written in English straight into the markup, title attribute
  // included. It read "Add to list" on /ar and /it alike, which is the first
  // thing anybody's eye lands on in a screenshot of the Arabic catalogue.
  //
  // Nothing about it needed inventing: 'cat.addToList' and 'cat.onList' have
  // been sitting in all three dictionaries the whole time. The component is
  // already a client component inside LocaleProvider, so it reads the locale
  // the same way its neighbours ShortlistBar and QuoteForm do.
  const locale = useLocale();
  const t = ui(locale);
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
      // The tooltip says more than the label does — which list, and that
      // pressing again takes the specimen off it — so it is its own sentence
      // rather than a repeat of the button's two words.
      title={on ? t('Remove from your shortlist') : t('Add to your shortlist')}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
           strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {on ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
      <span className="sl-btn-txt">{on ? t('cat.onList') : t('cat.addToList')}</span>

      {/* The CSS that used to be here now lives in src/app/globals.css. One
          of these buttons is rendered per specimen card, so the <style>
          element went out sixty-eight times on /catalog — 71 KB of identical
          bytes, and sixty-eight more stylesheet objects for the browser to
          hold. The rules never varied by item. See the note in globals.css. */}
    </button>
  );
}
