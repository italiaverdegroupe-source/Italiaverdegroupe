/**
 * The scheduler.
 *
 * Time-based alerts need somebody to look, and nobody does — that is the
 * whole point of them. This runs the scan inside the server process on an
 * interval rather than as a separate cron service, for two reasons: there is
 * one process to deploy instead of two, and the scan is idempotent, so a
 * second replica running it at the same moment raises nothing extra. The
 * unique dedupe index is what makes that safe, not luck.
 *
 * The interval is generous on purpose. Nothing here is urgent to the minute —
 * an invoice that fell due at midnight does not need finding at 00:01 — and a
 * long interval keeps a serverless-style database from being woken pointlessly.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.ALERT_SCAN_DISABLED === '1') return;

  const minutes = Number(process.env.ALERT_SCAN_MINUTES ?? 15);
  const { runScan, seedDefaultRules } = await import('@/lib/alerts');
  const { dueForBackup, runBackup } = await import('@/lib/backup');

  const once = async (trigger: 'startup' | 'schedule') => {
    try {
      const r = await runScan(trigger);
      if (r.raised > 0) console.log(`[alerts] ${trigger}: raised ${r.raised} across ${r.checked} rules`);
      if (r.errors.length) console.error('[alerts] rule errors:', r.errors.join(' | '));
    } catch (err) {
      // A failing scan must never take the web server down with it.
      console.error('[alerts] scan failed:', err);
    }

    // The backup rides on the same tick rather than a timer of its own. It
    // decides for itself whether it is due, so nothing is lost to a restart.
    try {
      if (await dueForBackup()) {
        const b = await runBackup(trigger);
        console.log(b.ok
          ? `[backup] ${b.key} — ${b.rows} rows, ${b.bytes} bytes, verified${b.pruned ? `, pruned ${b.pruned}` : ''}`
          : `[backup] FAILED: ${b.error}`);
      }
    } catch (err) {
      console.error('[backup] failed:', err);
    }
  };

  // Seed the default rules on first boot against an empty table, so a fresh
  // install is useful before anyone opens the settings page.
  try { await seedDefaultRules(); } catch { /* table may not exist yet */ }

  // A short delay so the first scan does not compete with the boot itself.
  setTimeout(() => { void once('startup'); }, 20_000);
  const timer = setInterval(() => { void once('schedule'); }, minutes * 60_000);
  timer.unref?.();
}
