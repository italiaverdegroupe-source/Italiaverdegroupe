/**
 * The shortlist: specimens a visitor has picked out, before they enquire.
 *
 * A landscape contractor pricing a villa does not want one olive. They want
 * four olives, a pair of washingtonias and some agaves for the beds, and until
 * now this site made them send six separate enquiries — which arrives as six
 * separate leads that somebody in the console then has to work out are one
 * project. The cost of the omission was paid twice, by the buyer and by the
 * owner.
 *
 * It lives in localStorage and nowhere else. No account, no server round trip,
 * nothing recorded about anybody until they choose to send it: a list of trees
 * somebody is thinking about is not something to be storing on their behalf.
 * The consequence is that it is per-browser and does not follow them to their
 * phone, which is the right trade for a list that exists for twenty minutes.
 */

export const SHORTLIST_KEY = 'vg.shortlist.v1';
export const SHORTLIST_EVENT = 'vg:shortlist';

/** Kept small on purpose — this is an enquiry, not a basket. */
export const MAX_ITEMS = 40;
export const MAX_QTY = 9999;

export type ShortlistItem = {
  ref: string;
  name: string;
  slug: string;
  qty: number;
};

/**
 * Every read is defensive.
 *
 * localStorage throws in a private window with site data blocked, returns null
 * when cleared, and — because the key is in the visitor's own browser — can
 * contain absolutely anything, including what a previous version of this code
 * wrote or what somebody typed into the console for fun. A shortlist that
 * cannot be parsed is an empty shortlist, never an exception on render.
 */
export function readShortlist(): ShortlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SHORTLIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((x): ShortlistItem[] => {
      if (!x || typeof x !== 'object') return [];
      const o = x as Record<string, unknown>;
      const ref = typeof o.ref === 'string' ? o.ref.slice(0, 40) : '';
      const name = typeof o.name === 'string' ? o.name.slice(0, 160) : '';
      const slug = typeof o.slug === 'string' ? o.slug.slice(0, 160) : '';
      if (!ref || !slug) return [];
      const n = Number(o.qty);
      const qty = Number.isFinite(n) ? Math.min(MAX_QTY, Math.max(1, Math.round(n))) : 1;
      return [{ ref, name, slug, qty }];
    }).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function write(items: ShortlistItem[]): ShortlistItem[] {
  const next = items.slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
  } catch {
    /* Storage full or blocked. The list is still correct in memory for this
       page; losing it on navigation is better than an unhandled exception. */
  }
  // Same-tab listeners: the storage event only fires in OTHER tabs, so without
  // this the count in the corner would not move when you press the button.
  try {
    window.dispatchEvent(new CustomEvent(SHORTLIST_EVENT, { detail: next }));
  } catch { /* older browsers */ }
  return next;
}

export function addToShortlist(item: Omit<ShortlistItem, 'qty'>, qty = 1): ShortlistItem[] {
  const items = readShortlist();
  const found = items.find((i) => i.ref === item.ref);
  if (found) {
    found.qty = Math.min(MAX_QTY, found.qty + qty);
    return write(items);
  }
  if (items.length >= MAX_ITEMS) return items;   // refuse quietly rather than drop an older pick
  return write([...items, { ...item, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]);
}

export function removeFromShortlist(ref: string): ShortlistItem[] {
  return write(readShortlist().filter((i) => i.ref !== ref));
}

export function setShortlistQty(ref: string, qty: number): ShortlistItem[] {
  const items = readShortlist();
  const found = items.find((i) => i.ref === ref);
  if (!found) return items;
  found.qty = Math.min(MAX_QTY, Math.max(1, Math.round(qty) || 1));
  return write(items);
}

export function clearShortlist(): ShortlistItem[] {
  return write([]);
}

/** A one-line summary for the enquiry message, so a lead reads sensibly even
 *  somewhere the structured list is not shown. */
export function describeShortlist(items: ShortlistItem[]): string {
  if (items.length === 0) return '';
  return items.map((i) => `${i.qty} × ${i.name} (${i.ref})`).join('\n');
}
