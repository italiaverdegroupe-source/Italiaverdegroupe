import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { recentBackups, lastGoodBackup, runBackup } from '@/lib/backup';
import { s3Config } from '@/lib/s3';

export const dynamic = 'force-dynamic';

async function backUpNow() {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (user.role !== 'owner') {
    redirect('/admin/backups?error=' + encodeURIComponent('Only the owner can run a backup.'));
  }

  const r = await runBackup('manual');
  await audit({ user, action: 'backup.run', entity: 'backup',
                after: { ok: r.ok, key: r.key, rows: r.rows, error: r.error } });
  revalidatePath('/admin/backups');
  redirect('/admin/backups?' + (r.ok
    ? 'ok=' + encodeURIComponent(
        `Backed up ${r.rows} rows from ${r.tables} tables — ${Math.round((r.bytes ?? 0) / 1024)} KB, read back and verified.`)
    : 'error=' + encodeURIComponent(r.error ?? 'The backup failed.')));
}

const bytes = (v: string | number | null) => {
  const n = Number(v ?? 0);
  if (!n) return '—';
  return n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const ago = (iso: string | null) => {
  if (!iso) return 'never';
  const h = (Date.now() - Date.parse(iso)) / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min ago`;
  if (h < 48) return `${Math.round(h)} h ago`;
  return `${Math.round(h / 24)} days ago`;
};

export default async function BackupsPage({ searchParams }: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { ok, error } = await searchParams;

  const [runs, good] = await Promise.all([recentBackups(20), lastGoodBackup()]);
  const last = good[0];
  const configured = s3Config() !== null;
  const ageHours = last ? Number(last.age_hours) : Infinity;

  return (
    <>
      <h1>Backups</h1>
      <p className="adm-sub">
        The database lives on Neon&rsquo;s free plan, which keeps six hours of
        point-in-time history and will not schedule its own snapshots. Six hours
        is not a backup policy — it is the window in which somebody has to
        notice. This takes a full copy every night, stores it off Neon, reads it
        back to check it arrived intact, and keeps a month of them.
      </p>

      {error && <p className="adm-err">{error}</p>}
      {ok && <p className="adm-note">{ok}</p>}

      {!configured && (
        <p className="adm-err">
          No backup storage is configured, so nothing is being backed up. The
          service needs BACKUP_BUCKET, BACKUP_ACCESS_KEY_ID,
          BACKUP_SECRET_ACCESS_KEY and BACKUP_ENDPOINT.
        </p>
      )}

      <div className="adm-cards">
        <div className="adm-card">
          <b>{ago(last?.finished_at ?? null)}</b><span>Last good backup</span>
        </div>
        <div className="adm-card"><b>{last?.row_count ?? '—'}</b><span>Rows in it</span></div>
        <div className="adm-card"><b>{bytes(last?.bytes ?? null)}</b><span>Stored size</span></div>
        <div className="adm-card">
          <b>{runs.filter((r) => r.status === 'failed').length}</b><span>Recent failures</span>
        </div>
      </div>

      {ageHours > 30 && (
        <p className="adm-err">
          {last
            ? `The last successful backup was ${Math.round(ageHours)} hours ago. Every hour past that is work that cannot be recovered.`
            : 'The database has never been backed up successfully. Until one runs, the only recovery is Neon’s six-hour history.'}
        </p>
      )}

      {user.role === 'owner' && (
        <form action={backUpNow} style={{ marginBottom: 22 }}>
          <button type="submit" className="adm-btn adm-backup-now">Back up now</button>
        </form>
      )}

      <div className="adm-panel">
        <table className="adm-t">
          <thead>
            <tr><th>Started</th><th>Result</th><th>Rows</th><th>Tables</th>
                <th>Size</th><th>Stored as</th></tr>
          </thead>
          <tbody>
            {runs.length === 0 && (
              <tr><td colSpan={6}><span className="adm-empty">No backup has run yet.</span></td></tr>
            )}
            {runs.map((r) => (
              <tr key={r.id}>
                <td>{r.started_at.slice(0, 16).replace('T', ' ')}<br />
                    <span className="adm-sub" style={{ margin: 0, fontSize: 12 }}>{r.trigger}</span></td>
                <td>
                  <span className={`pill ${r.status === 'ok' ? 'pill-won' : r.status === 'failed' ? 'pill-lost' : 'pill-new'}`}>
                    {r.status}
                  </span>
                  {r.verified_at && <div className="adm-sub" style={{ margin: 0, fontSize: 12 }}>read back and checked</div>}
                  {r.error && <div className="adm-sub" style={{ margin: 0, fontSize: 12 }}>{r.error}</div>}
                </td>
                <td className="num">{r.row_count ?? '—'}</td>
                <td className="num">{r.table_count ?? '—'}</td>
                <td className="num">{bytes(r.bytes)}</td>
                <td style={{ fontSize: 12 }}><code>{r.object_key ?? '—'}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-panel adm-pad" style={{ marginTop: 20 }}>
        <h2>How to restore one</h2>
        <p className="adm-sub">
          Restoring is deliberately not a button here. It replaces every row in
          the database, and that is not a decision anybody should be one
          mis-click away from while looking for something else. It is done at a
          terminal, by someone who means it:
        </p>
        <ol className="adm-sub" style={{ paddingInlineStart: '1.2em' }}>
          <li>Create an empty database.</li>
          <li>Run <code>db/migrations/*.sql</code> against it in order. Those
              files alone rebuild the whole schema — the backup test asserts it
              on every run, so this cannot quietly stop being true.</li>
          <li>Download the archive from the bucket and load it with the
              <code> restore()</code> function in <code>src/lib/backup.ts</code>.</li>
          <li>Point <code>DATABASE_URL</code> at the restored database.</li>
        </ol>
        <p className="adm-sub" style={{ marginBottom: 0 }}>
          The backup holds data only, not schema, so there is one source of
          truth for the shape of the database and it is the migrations.
        </p>
      </div>
    </>
  );
}
