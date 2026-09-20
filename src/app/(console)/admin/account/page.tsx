import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { changeOwnPassword, changeOwnName, signOutEverywhereElse } from './actions';
// These two pages wrote their own timestamps — `.slice(0, 16).replace('T', ' ')`
// — which printed raw UTC, four hours behind the office, in a format no other
// console screen uses. The .replace was dead code besides: the column arrives
// space-separated from Postgres and has never contained a T.
import { fmtDate, fmtDay } from '@/components/admin/bits';
import { adminUi } from '@/lib/admin-ui';

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
/**
 * The IP beside a sign-in attempt.
 *
 * It takes the translator as a prop rather than reaching for one. This is a
 * module-level helper: there is no signed-in user in its scope, and the
 * language belongs to the person looking at the screen, so it has to come
 * from the component that knows who that is.
 */
function Addr({ value, t }: { value: string | null; t: ReturnType<typeof adminUi> }) {
  if (!value) return <>&mdash;</>;
  if (!value.startsWith('~')) return <>{value}</>;
  return (
    <>
      {value.slice(1)}{' '}
      <abbr
        title={t("Not verified. This request did not come through Cloudflare, so the address is only what the caller claimed.")}
        style={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase',
                 color: 'var(--adm-mute, #8a8d7f)', textDecoration: 'none', cursor: 'help' }}
      >
        {t("unverified")}
      </abbr>
    </>
  );
}

export default async function AccountPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const { error, ok } = await searchParams;

  // The table is capped and the headline is not, and they are two queries for
  // that reason. The sentence below used to print `sessions.length`, which is
  // the LIMIT — so an account with fifty-nine live sessions was told it had
  // twenty, while /admin/users one click away ran a real count(*) and said
  // fifty-nine. This is the screen somebody opens to ask "is anyone else
  // signed in as me?", and it was answering a different question from its own
  // sibling. The cap on the table stays: twenty rows of user agent is as much
  // as anybody reads, and now the page says so out loud.
  const [sessions, liveCount, recent] = await Promise.all([
    query<{ created_at: string; expires_at: string; ip: string | null; user_agent: string | null }>(
      `SELECT created_at::text, expires_at::text, ip, user_agent
         FROM sessions WHERE user_id = $1 AND expires_at > now()
        ORDER BY created_at DESC LIMIT 20`, [user.id]),
    query<{ n: string }>(
      `SELECT count(*)::text AS n
         FROM sessions WHERE user_id = $1 AND expires_at > now()`, [user.id]),
    query<{ at: string; ip: string | null; successful: boolean }>(
      `SELECT at::text, ip, successful FROM login_attempts
        WHERE email = $1 ORDER BY at DESC LIMIT 10`, [user.email.toLowerCase()]),
  ]);
  const live = Number(liveCount[0]?.n ?? sessions.length);

  return (
    <>
      <h1>{t("Your account")}</h1>
      <p className="adm-sub">
        {user.email} · {user.role}
      </p>

      {error && <p className="adm-err">{error}</p>}
      {ok && <p className="adm-note">{ok}</p>}

      <div className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
        <h2>{t("Change your password")}</h2>
        <p className="adm-sub">
          {t("The current password is asked for even though you are already signed in: an unattended screen is the ordinary case, and this is the one action that can lock you out of your own system. Changing it signs out every other device signed in as you, and leaves this one alone.")}
        </p>
        <form action={changeOwnPassword}
              style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <label className="adm-field">
            <span>{t("Current password")}</span>
            <input name="current" type="password" autoComplete="current-password" required />
          </label>
          <label className="adm-field">
            <span>{t("New password — at least 10 characters")}</span>
            <input name="next" type="password" autoComplete="new-password" required />
          </label>
          <label className="adm-field">
            <span>{t("New password again")}</span>
            <input name="again" type="password" autoComplete="new-password" required />
          </label>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button type="submit" className="adm-btn adm-change-pw">{t("Change password")}</button>
          </div>
        </form>
        <p className="adm-sub" style={{ fontSize: 12 }}>
          {t("A long phrase you can remember beats a short puzzle you cannot. There are no rules here about symbols or capitals — they push people towards predictable passwords without making them harder to guess.")}
        </p>
      </div>

      <div className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
        <h2>{t("Your name")}</h2>
        <p className="adm-sub">{t("This is what the audit log records beside everything you change.")}</p>
        <form action={changeOwnName} style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <label className="adm-field" style={{ minWidth: 260 }}>
            <span>{t("Name")}</span>
            <input name="name" defaultValue={user.name} required />
          </label>
          <button type="submit" className="adm-btn adm-change-name">{t("Save")}</button>
        </form>
      </div>

      <div className="adm-panel adm-pad" style={{ marginBottom: 18 }}>
        <h2>{t("Where you are signed in")}</h2>
        <p className="adm-sub">
          {live === 1
            ? t("{n} live session, including this one. A session lasts fourteen days.", { n: live })
            : t("{n} live sessions, including this one. A session lasts fourteen days.", { n: live })}
          {live > sessions.length && <> {t("Showing the {n} most recent.", { n: sessions.length })}</>}
        </p>
        {sessions.length > 0 && (
          <table className="adm-t">
            <thead><tr><th>{t("Signed in")}</th><th>{t("From")}</th><th>{t("Device")}</th><th>{t("Expires")}</th></tr></thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{fmtDate(s.created_at, user.locale)}</td>
                  <td><Addr value={s.ip} t={t} /></td>
                  <td style={{ maxWidth: 380, fontSize: 12 }}>{s.user_agent ?? '—'}</td>
                  <td>{fmtDay(s.expires_at, user.locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form action={signOutEverywhereElse}>
          <button type="submit" className="adm-btn-sec adm-signout-others">
            {t("Sign out everywhere else")}
          </button>
        </form>
      </div>

      <div className="adm-panel adm-pad">
        <h2>{t("Recent sign-in attempts")}</h2>
        <p className="adm-sub">
          {t("Failed attempts on your email, whoever made them. Six failures within fifteen minutes lock the address they came from. Thirty across different addresses lock the email — but never an address you have signed in from before, so somebody else guessing can no longer shut you out of your own console. When this rule counted your email alone, six wrong guesses from anywhere did exactly that.")}
        </p>
        <table className="adm-t">
          <thead><tr><th>{t("When")}</th><th>{t("From")}</th><th>{t("Result")}</th></tr></thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={3}><span className="adm-empty">{t("Nothing recorded.")}</span></td></tr>
            )}
            {recent.map((a, i) => (
              <tr key={i}>
                <td>{fmtDate(a.at, user.locale)}</td>
                <td><Addr value={a.ip} t={t} /></td>
                <td>
                  <span className={`pill ${a.successful ? 'pill-won' : 'pill-lost'}`}>
                    {a.successful ? t("signed in") : t("refused")}
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
