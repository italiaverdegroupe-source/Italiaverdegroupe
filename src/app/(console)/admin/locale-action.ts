'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSessionUser, assertSameOrigin, audit } from '@/lib/auth';
import { isLocale } from '@/lib/i18n';

/**
 * Set the console language for the person who asked.
 *
 * Stored on the user rather than in a cookie: an owner who sets the console to
 * Italian at the office should find it in Italian on their phone, because the
 * preference belongs to the person and not to the browser.
 *
 * It can only ever change the CALLER'S row. There is no user id in the form —
 * it comes from the session — so no amount of tampering with the request can
 * set somebody else's language, which is a small thing to get wrong and a
 * confusing one to debug.
 */
export async function setConsoleLocale(formData: FormData) {
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) return;

  const value = String(formData.get('locale') ?? '');
  if (!isLocale(value)) return;

  await query('UPDATE users SET locale = $1 WHERE id = $2', [value, user.id]);
  await audit({
    user, action: 'user.locale_changed', entity: 'user',
    entityId: String(user.id), after: { locale: value },
  });
  // Every console screen reads it, so every console screen is stale.
  revalidatePath('/admin', 'layout');
}
