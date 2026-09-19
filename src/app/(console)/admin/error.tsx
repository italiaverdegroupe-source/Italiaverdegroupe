'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { adminUi } from '@/lib/admin-ui';

/**
 * When something in the console fails.
 *
 * The console had no error boundary, so a failed action or a slow database
 * dropped a signed-in operator onto Next's unstyled default page: no
 * navigation, no branding, and nothing to do but press Back. Twenty minutes
 * before a delivery, that is the difference between a problem and an outage.
 *
 * THE MESSAGE IS NOT SHOWN, AND THAT IS NEXT'S DOING, NOT A CHOICE HERE. In a
 * production build the framework replaces `error.message` with a digest
 * before it reaches the browser, so a refusal thrown by a server action —
 * "this invoice has payments against it" — arrives as nothing at all. Every
 * refusal a person must be able to act on is therefore RETURNED by the action
 * and rendered by the form that called it; see delete-actions.ts. This page
 * is the net beneath the rest: the unexpected, not the expected.
 *
 * The digest is printed, because it is what makes the line in the server log
 * findable, and an operator reading it out over the phone is how a fault gets
 * diagnosed at all.
 */
export default function ConsoleError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // The console is signed-in-only, so its language is on the session — which a
  // client component cannot read. The <html lang> the layout already set is
  // the same fact, so it is read from there rather than guessed at.
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  const t = adminUi(locale);

  useEffect(() => {
    // Into the browser console, where somebody debugging will look first.
    console.error('[console] unhandled error', error);
  }, [error]);

  return (
    <>
      <h1>{t('Something went wrong')}</h1>
      <p className="adm-sub">
        {t('This screen could not finish loading. Nothing you were doing has been lost — the records are unchanged. Try again, and if it keeps happening send the reference below.')}
      </p>

      <div className="adm-panel adm-pad">
        <div className="adm-filters" style={{ marginBottom: 0 }}>
          <button type="button" className="adm-btn" onClick={reset}>{t('Try again')}</button>
          <Link className="adm-chip" href="/admin">{t('Overview')}</Link>
        </div>
        {error.digest && (
          <p className="adm-sub" style={{ margin: '16px 0 0', fontVariantNumeric: 'tabular-nums' }}>
            {t('Reference')} {error.digest}
          </p>
        )}
      </div>
    </>
  );
}
