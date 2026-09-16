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
