'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  getSessionUser, audit, assertSameOrigin, currentTokenHash,
} from '@/lib/auth';
import { query } from '@/lib/db';
import {
  createUser, updateUser, setPassword, checkCurrentPassword, revokeSessions,
  Refused, ROLES, type Role,
} from '@/lib/users';

/**
 * A refusal is not a crash, so it goes back to the form with its reason
 * rather than becoming Next's generic failure page, where the message is
 * stripped in production and the person learns nothing.
 */
const back = (to: string, message: string): never =>
  redirect(`${to}${to.includes('?') ? '&' : '?'}error=${encodeURIComponent(message)}`);

const done = (to: string, message: string): never =>
  redirect(`${to}${to.includes('?') ? '&' : '?'}ok=${encodeURIComponent(message)}`);

async function me() {
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

/** Change your own password. The current one is required — a borrowed session must not be enough. */
export async function changeOwnPassword(formData: FormData) {
  const user = await me();
  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const again = String(formData.get('again') ?? '');

  if (next !== again) back('/admin/account', 'The two new passwords do not match.');

  // Asked for even though the session already proves who you are: an
  // unattended screen is the common case, and a password change is the one
  // action that locks the real owner out.
  if (!(await checkCurrentPassword(String(user.id), current))) {
    await audit({ user, action: 'password.change_refused', entity: 'user', entityId: user.id,
                  after: { reason: 'current password wrong' } });
    back('/admin/account', 'That is not the current password.');
  }

  try {
    await setPassword({
      userId: String(user.id), password: next, email: user.email, name: user.name,
      keepTokenHash: await currentTokenHash(),
    });
  } catch (err) {
    if (err instanceof Refused) back('/admin/account', err.message);
    throw err;
  }

  await audit({ user, action: 'password.changed', entity: 'user', entityId: user.id });
  revalidatePath('/admin/account');
  done('/admin/account',
       'Password changed. Every other device signed in as you has been signed out.');
}

export async function changeOwnName(formData: FormData) {
  const user = await me();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) back('/admin/account', 'A name cannot be empty.');
  await query(`UPDATE users SET name = $2 WHERE id = $1`, [user.id, name]);
  await audit({ user, action: 'user.renamed', entity: 'user', entityId: user.id,
                before: { name: user.name }, after: { name } });
  revalidatePath('/admin/account');
  done('/admin/account', 'Name changed.');
}

/** Sign out everywhere else — the thing to do after using someone else's computer. */
export async function signOutEverywhereElse() {
  const user = await me();
  const keep = await currentTokenHash();
  const rows = await query<{ token_hash: string }>(
    `DELETE FROM sessions WHERE user_id = $1 AND ($2::text IS NULL OR token_hash <> $2)
     RETURNING token_hash`, [user.id, keep]);
  await audit({ user, action: 'sessions.revoked_own', entity: 'user', entityId: user.id,
                after: { count: rows.length } });
  revalidatePath('/admin/account');
  done('/admin/account', `Signed out of ${rows.length} other session${rows.length === 1 ? '' : 's'}.`);
}

// ── owner-only: other people's accounts ──────────────────────

async function owner() {
  const user = await me();
  if (user.role !== 'owner') back('/admin/users', 'Only an owner can manage accounts.');
  return user;
}

export async function addUser(formData: FormData) {
  const user = await owner();
  const role = String(formData.get('role') ?? 'sales') as Role;
  if (!ROLES.includes(role)) back('/admin/users', 'Unknown role.');

  const password = String(formData.get('password') ?? '');
  if (password !== String(formData.get('again') ?? '')) {
    back('/admin/users', 'The two passwords do not match.');
  }

  let id: string;
  try {
    id = await createUser({
      email: String(formData.get('email') ?? ''),
      name: String(formData.get('name') ?? ''),
      role, password,
    });
  } catch (err) {
    if (err instanceof Refused) back('/admin/users', err.message);
    throw err;
  }

  await audit({ user, action: 'user.created', entity: 'user', entityId: id,
                after: { email: String(formData.get('email') ?? ''), role } });
  revalidatePath('/admin/users');
  done('/admin/users', 'Account created. Tell them to change the password once they are in.');
}

export async function saveUser(formData: FormData) {
  const user = await owner();
  const id = String(formData.get('id') ?? '');
  try {
    await updateUser({
      userId: id,
      role: String(formData.get('role') ?? 'sales') as Role,
      isActive: formData.get('is_active') === 'on',
      name: String(formData.get('name') ?? ''),
    });
  } catch (err) {
    if (err instanceof Refused) back('/admin/users', err.message);
    throw err;
  }
  await audit({ user, action: 'user.updated', entity: 'user', entityId: id,
                after: { role: formData.get('role'), active: formData.get('is_active') === 'on' } });
  revalidatePath('/admin/users');
  done('/admin/users', 'Account updated.');
}

/**
 * An owner setting somebody else's password.
 *
 * Every session of theirs is destroyed, with none kept: this is the path used
 * when an account may be compromised or somebody has left, and leaving their
 * cookie working for another fortnight would make the reset decorative.
 */
export async function resetUserPassword(formData: FormData) {
  const user = await owner();
  const id = String(formData.get('id') ?? '');
  const password = String(formData.get('password') ?? '');

  const target = (await query<{ email: string; name: string }>(
    `SELECT email::text, name FROM users WHERE id = $1`, [id]))[0];
  if (!target) back('/admin/users', 'No such account.');

  try {
    await setPassword({ userId: id, password, email: target.email, name: target.name,
                        keepTokenHash: null });
  } catch (err) {
    if (err instanceof Refused) back('/admin/users', err.message);
    throw err;
  }
  await audit({ user, action: 'password.reset_for_user', entity: 'user', entityId: id,
                after: { email: target.email } });
  revalidatePath('/admin/users');
  done('/admin/users', `Password set for ${target.email}, and they have been signed out everywhere.`);
}

export async function signOutUser(formData: FormData) {
  const user = await owner();
  const id = String(formData.get('id') ?? '');
  const n = await revokeSessions(id);
  await audit({ user, action: 'sessions.revoked', entity: 'user', entityId: id, after: { count: n } });
  revalidatePath('/admin/users');
  done('/admin/users', `Signed out of ${n} session${n === 1 ? '' : 's'}.`);
}
