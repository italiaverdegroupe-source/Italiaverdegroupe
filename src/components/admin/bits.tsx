export const STATUSES = [
  'new', 'contacted', 'qualified', 'quoted', 'negotiation', 'won', 'lost',
] as const;
export type Status = (typeof STATUSES)[number];

/**
 * A status, coloured by what it IS and labelled in the reader's language.
 *
 * This used to take one string and use it for both, and the two call sites
 * that had been translated for Italian and Arabic passed the TRANSLATED word
 * — so the class came out `pill-nuova` and `pill-جديد`, admin.css has rules
 * for the seven raw keys and nothing else, and every pill on the overview and
 * the leads list went flat in two of the three languages the console ships
 * in. The lead detail page showed the mirror image of the same mistake: it
 * passed the raw status to keep the colour and printed "new" on an Italian
 * page. One string cannot be both a CSS key and a sentence.
 *
 * So they are two arguments now, and `label` is required rather than
 * defaulting to `status`: a default is exactly what would let the next call
 * site quietly print an untranslated key again, and every caller already has
 * `adminStatus(locale)` to hand.
 */
export function StatusPill({ status, label }: { status: string; label: string }) {
  return <span className={`pill pill-${status}`}>{label}</span>;
}

/**
 * Which language a date is written in.
 *
 * Every date in the console was formatted 'en-GB' whoever was reading it, so
 * an operator working in Italian got "20 Sept 2026" in the middle of an
 * otherwise Italian screen and one working in Arabic got it in Latin script.
 * The month name is the whole of the problem: the digits are the same in all
 * three, and "set" or "سبتمبر" is the one word on the row that has to change.
 *
 * English stays on en-GB rather than moving to en-AE, deliberately. It is
 * what this console has printed since it was built, the day-month-year order
 * is what the office reads, and the note on fmtDay below is about an en-GB
 * quirk specifically. The same three-way choice is made for the public site's
 * legal pages in src/components/LegalPage.tsx.
 *
 * The locale is optional because it arrives from the signed-in user, which
 * not every caller has to hand; without one this behaves exactly as it always
 * did rather than guessing.
 */
const dateTag = (locale?: string | null): string =>
  (locale === 'ar' ? 'ar-AE' : locale === 'it' ? 'it-IT' : 'en-GB');

export function fmtDate(v: string | Date | null, locale?: string | null): string {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Intl.DateTimeFormat(dateTag(locale), {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Dubai',
  }).format(d);
}

/**
 * A date with no time on it.
 *
 * Every screen in this console used to write the date and the time and then
 * cut the string at eleven characters, where the time probably starts.
 * It probably does — except in en-GB, where the
 * short form of September is "Sept" and not "Sep", so "23 Sept 2026, 04:00"
 * became "23 Sept 202". Every date in September, on every screen, lost a digit
 * of its year. Ask for a date instead of trimming a datetime.
 */
export function fmtDay(v: string | Date | null, locale?: string | null): string {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Intl.DateTimeFormat(dateTag(locale), {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai',
  }).format(d);
}
