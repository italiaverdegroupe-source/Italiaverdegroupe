'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { adminUi } from '@/lib/admin-ui';
import { canDelete, softDelete, restore, purgeCheck, purgeNow, specOf, blockerText } from '@/lib/deletion';

/**
 * Delete, restore and permanently remove — one action for the whole console.
 *
 * One action rather than one per screen, because the rules are the same
 * everywhere and the version of this that lives in fourteen files is the
 * version where the thirteenth forgets to check the role and the fourteenth
 * forgets to write the audit entry.
 *
 * The kind arrives from a hidden field, which means it arrives from the
 * browser: `canDelete` is a whitelist, so a forged value names nothing and the
 * table name can never be anything but one of ten constants. There is no path
 * from a form field to an identifier in SQL.
 */
async function actor() {
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

/** Everything the deletion touched, so a list stops showing what is gone. */
function refresh(back: string) {
  revalidatePath('/admin', 'layout');
  revalidatePath(back);
}

export async function deleteRecord(formData: FormData) {
  const user = await actor();
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot delete anything.'));

  const kind = String(formData.get('kind') ?? '');
  const code = String(formData.get('code') ?? '').trim();
  const back = String(formData.get('back') ?? '/admin');
  if (!canDelete(kind)) throw new Error(t('Unknown kind of record.'));

  const why = await softDelete(kind, code, user);
  if (why.length) throw new Error(why.map((r) => blockerText(r, t)).join(' '));

  await audit({ user, action: `${kind}.deleted`, entity: kind, entityId: code });
  refresh(back);
  redirect(back);
}

export async function restoreRecord(formData: FormData) {
  const user = await actor();
  const t = adminUi(user.locale);
  if (user.role === 'viewer') throw new Error(t('Viewers cannot delete anything.'));

  const kind = String(formData.get('kind') ?? '');
  const code = String(formData.get('code') ?? '').trim();
  const back = String(formData.get('back') ?? '/admin');
  if (!canDelete(kind)) throw new Error(t('Unknown kind of record.'));

  await restore(kind, code);
  await audit({ user, action: `${kind}.restored`, entity: kind, entityId: code });
  refresh(back);
  redirect(back);
}

export async function purgeRecord(formData: FormData) {
  const user = await actor();
  const t = adminUi(user.locale);
  // Owner only. A permanent deletion is the one action in this console that
  // cannot be undone by anybody, including the person who did it.
  if (user.role !== 'owner') {
    throw new Error(t('Only the owner can permanently remove a record.'));
  }

  const kind = String(formData.get('kind') ?? '');
  const code = String(formData.get('code') ?? '').trim();
  const back = String(formData.get('back') ?? '/admin');
  if (!canDelete(kind)) throw new Error(t('Unknown kind of record.'));

  // Refuse first, then log, then delete. Written to the log BEFORE the row
  // goes, because afterwards there is nothing left to name and an audit entry
  // that cannot say what was destroyed is not an audit entry — but after the
  // refusal, because an entry claiming a destruction that never happened is
  // worse than none at all.
  const why = await purgeCheck(kind, code);
  if (why.length) throw new Error(why.map((r) => blockerText(r, t)).join(' '));

  await audit({
    user, action: `${kind}.purged`, entity: kind, entityId: code,
    before: { label: specOf(kind).label, permanent: true },
  });
  await purgeNow(kind, code);

  refresh(back);
  redirect(back);
}
