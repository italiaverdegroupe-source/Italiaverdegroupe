import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listUsers, ROLES, ROLE_MEANS } from '@/lib/users';
import { addUser, saveUser, resetUserPassword, signOutUser } from '../account/actions';
import { adminUi } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  const { error, ok } = await searchParams;

  const users = await listUsers();
  const owners = users.filter((u) => u.role === 'owner' && u.is_active);
  const readOnly = user.role !== 'owner';

  return (
    <>
      <h1>{t("Accounts")}</h1>
      <p className="adm-sub">
        {t("Who can sign in, and what they may do. The roles have been in the database since the beginning and every page respects them — this is the screen that lets you use them without a developer.")}
      </p>

      {error && <p className="adm-err">{error}</p>}
      {ok && <p className="adm-note">{ok}</p>}
      {readOnly && <p className="adm-err">{t("You can see this, but only an owner can change it.")}</p>}

      {owners.length === 1 && (
        <p className="adm-sub">
          <b>{t("There is one active owner.")}</b> {t("It cannot be switched off or demoted while it is the only one — that would leave nobody able to administer the system, and nobody inside the company could undo it. Make a second owner first if you want that freedom.")}
        </p>
      )}

      <div className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
        <h2>{t("What the roles mean")}</h2>
        <dl className="adm-dl">
          {ROLES.map((r) => (
            <div key={r}><dt>{r}</dt><dd>{ROLE_MEANS[r]}</dd></div>
          ))}
        </dl>
      </div>

      {users.map((u) => (
        <div key={u.id} className="adm-panel adm-pad"
             style={{ marginBottom: 14, opacity: u.is_active ? 1 : 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>{u.name}</h2>
            <span className="pill pill-quoted">{u.role}</span>
            {!u.is_active && <span className="pill pill-lost">signed off</span>}
            {String(u.id) === String(user.id) && <span className="pill pill-won">you</span>}
            <code style={{ fontSize: 12, opacity: 0.7 }}>{u.email}</code>
          </div>
          <p className="adm-sub" style={{ marginTop: 6 }}>
            {u.last_login_at
              ? `Last signed in ${u.last_login_at.slice(0, 16).replace('T', ' ')}`
              : 'Has never signed in'}
            {' · '}{u.sessions} live session{u.sessions === '1' ? '' : 's'}
            {' · '}created {u.created_at.slice(0, 10)}
          </p>

          <form action={saveUser}
                style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))' }}>
            <input type="hidden" name="id" value={u.id} />
            <label className="adm-field">
              <span>{t("Name")}</span>
              <input name="name" defaultValue={u.name} disabled={readOnly} />
            </label>
            <label className="adm-field">
              <span>{t("Role")}</span>
              <select name="role" defaultValue={u.role} disabled={readOnly}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="adm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" name="is_active" defaultChecked={u.is_active}
                     style={{ width: 16, height: 16 }} disabled={readOnly} />
              <span>{t("Can sign in")}</span>
            </label>
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <button type="submit" className="adm-btn adm-save-user">{t("Save")}</button>
              </div>
            )}
          </form>

          {!readOnly && (
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14,
                          paddingTop: 14, borderTop: '1px solid #F0EDE4' }}>
              <form action={resetUserPassword}
                    style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
                <input type="hidden" name="id" value={u.id} />
                <label className="adm-field" style={{ minWidth: 240 }}>
                  <span>{t("Set a new password for this account")}</span>
                  <input name="password" type="password" autoComplete="new-password"
                         placeholder={t("at least 10 characters")} />
                </label>
                <button type="submit" className="adm-btn-sec adm-reset-pw">{t("Set password")}</button>
              </form>
              <form action={signOutUser} style={{ display: 'flex', alignItems: 'end' }}>
                <input type="hidden" name="id" value={u.id} />
                <button type="submit" className="adm-btn-sec adm-signout-user">
                  {t("Sign out everywhere")}
                </button>
              </form>
            </div>
          )}
          {!readOnly && (
            <p className="adm-sub" style={{ fontSize: 12, marginBottom: 0 }}>
              {t("Setting a password here signs that account out of every device, on purpose: this is the path used when a password may be known to somebody else, and a cookie that kept working for another fortnight would make the reset decorative.")}
            </p>
          )}
        </div>
      ))}

      {!readOnly && (
        <div className="adm-panel adm-pad">
          <h2>{t("Add an account")}</h2>
          <p className="adm-sub">
            {t("Accounts are never deleted, because the audit log points at them — “who changed this price” has to stay answerable. Switch one off instead, which ends its sessions immediately.")}
          </p>
          <form action={addUser}
                style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
            <label className="adm-field">
              <span>{t("Email")}</span>
              <input name="email" type="email" required autoComplete="off" />
            </label>
            <label className="adm-field">
              <span>{t("Name")}</span>
              <input name="name" required autoComplete="off" />
            </label>
            <label className="adm-field">
              <span>{t("Role")}</span>
              <select name="role" defaultValue="sales">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="adm-field">
              <span>{t("Password — at least 10 characters")}</span>
              <input name="password" type="password" required autoComplete="new-password" />
            </label>
            <label className="adm-field">
              <span>{t("Password again")}</span>
              <input name="again" type="password" required autoComplete="new-password" />
            </label>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button type="submit" className="adm-btn adm-add-user">{t("Create account")}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
