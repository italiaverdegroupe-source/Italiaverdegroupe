export const STATUSES = [
  'new', 'contacted', 'qualified', 'quoted', 'negotiation', 'won', 'lost',
] as const;
export type Status = (typeof STATUSES)[number];

export function StatusPill({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{status}</span>;
}

export function fmtDate(v: string | Date | null): string {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Intl.DateTimeFormat('en-GB', {
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
export function fmtDay(v: string | Date | null): string {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai',
  }).format(d);
}
