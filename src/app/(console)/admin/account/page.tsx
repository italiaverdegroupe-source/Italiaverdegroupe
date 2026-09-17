import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { changeOwnPassword, changeOwnName, signOutEverywhereElse } from './actions';

export const dynamic = 'force-dynamic';

/**
 * An address, and whether anybody checked it.
 *
 * Requests that reach us through Cloudflare carry CF-Connecting-IP, which the
 * edge overwrites, so the address is evidence. Requests that arrive any other
 * way carry only what the caller typed, and those are stored with a leading
 * "~". Printing both the same way would quietly turn a claim into a fact on
 * the one page somebody looks at when they think an account is compromised.
 */
function Addr({ value }: { value: string | null }) {
  if (!value) return <>&mdash;</>;
  if (!value.startsWith('~')) return <>{value}</>;
  return (
    <>
      {value.slice(1)}{' '}
      <abbr
        title="Not verified. This request did not come through Cloudflare, so the address is only what the caller claimed."
        style={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase',
                 color: 'var(--adm-mute, #8a8d7f)', textDecoration: 'none', cursor: 'help' }}
      >
        unverified
      </abbr>
    </>
  );
}

export default async function AccountPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { error, ok } = await searchParams;

  const [sessions, recent] = await Promise.all([
    query<{ created_at: string; expires_at: string; ip: string | null; user_agent: string | null }>(
      `SELECT created_at::text, expires_at::text, ip, user_agent
         FROM sessions WHERE user_id = $1 AND expires_at > now()
        ORDER BY created_at DESC LIMIT 20`, [user.id]),
    query<{ at: string; ip: string | null; successful: boolean }>(
      `SELECT at::text, ip, successful FROM login_attempts
        WHERE email = $1 ORDER BY at DESC LIMIT 10`, [user.email.toLowerCase()]),
  ]);

  return (
    <>
      <h1>Your account</h1>
      <p className="adm-sub">
        {user.email} · {user.role}
      </p>

      {error && <p className="adm-err">{error}</p>}
      {ok && <p className="adm-note">{ok}</p>}

      <div className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
        <h2>Change your password</h2>
        <p className="adm-sub">
          The current password is asked for even though you are already signed
          in: an unattended screen is the ordinary case, and this is the one
          action that can lock you out of your own system. Changing it signs
          out every other device signed in as you, and leaves this one alone.
        </p>
        <form action={changeOwnPassword}
              style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <label className="adm-field">
            <span>Current password</span>
            <input name="current" type="password" autoComplete="current-password" required />
          </label>
          <label className="adm-field">
            <span>New password — at least 10 characters</span>
            <input name="next" type="password" autoComplete="new-password" required />
          </label>
          <label className="adm-field">
            <span>New password again</span>
            <input name="again" type="password" autoComplete="new-password" required />
          </label>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button type="submit" className="adm-btn adm-change-pw">Change password</button>
          </div>
        </form>
        <p className="adm-sub" style={{ fontSize: 12 }}>
          A long phrase you can remember beats a short puzzle you cannot. There
          are no rules here about symbols or capitals — they push people towards
          predictable passwords without making them harder to guess.
        </p>
      </div>

      <div className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
        <h2>Your name</h2>
        <p className="adm-sub">This is what the audit log records beside everything you change.</p>
        <form action={changeOwnName} style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <label className="adm-field" style={{ minWidth: 260 }}>
            <span>Name</span>
            <input name="name" defaultValue={user.name} required />
          </label>
          <button type="submit" className="adm-btn adm-change-name">Save</button>
        </form>
      </div>

      <div className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
        <h2>Where you are signed in</h2>
        <p className="adm-sub">
          {sessions.length} live session{sessions.length === 1 ? '' : 's'}, including this one.
          A session lasts fourteen days.
        </p>
        {sessions.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>Signed in</th><th>From</th><th>Device</th><th>Expires</th></tr></thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{s.created_at.slice(0, 16).replace('T', ' ')}</td>
                  <td><Addr value={s.ip} /></td>
                  <td style={{ maxWidth: 380, fontSize: 12 }}>{s.user_agent ?? '—'}</td>
                  <td>{s.expires_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form action={signOutEverywhereElse}>
          <button type="submit" className="adm-btn-sec adm-signout-others">
            Sign out everywhere else
          </button>
        </form>
      </div>

      <div className="adm-panel adm-pad">
        <h2>Recent sign-in attempts</h2>
        <p className="adm-sub">
          Failed attempts on your email, whoever made them. Six failures within
          fifteen minutes lock the address they came from. Thirty across
          different addresses lock the email — but never an address you have
          signed in from before, so somebody else guessing can no longer shut
          you out of your own console. When this rule counted your email alone,
          six wrong guesses from anywhere did exactly that.
        </p>
        <table className="adm-t">
          <thead><tr><th>When</th><th>From</th><th>Result</th></tr></thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={3}><span className="adm-empty">Nothing recorded.</span></td></tr>
            )}
            {recent.map((a, i) => (
              <tr key={i}>
                <td>{a.at.slice(0, 16).replace('T', ' ')}</td>
                <td><Addr value={a.ip} /></td>
                <td>
                  <span className={`pill ${a.successful ? 'pill-won' : 'pill-lost'}`}>
                    {a.successful ? 'signed in' : 'refused'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
