'use client';

import { useLocale } from '@/components/LocaleProvider';
import { ui } from '@/lib/ui';
import Link from 'next/link';

/**
 * When a page on the public site fails.
 *
 * There was no error boundary anywhere in this application. A database that
 * takes a moment too long to wake — Neon suspends its compute, so the first
 * request after a quiet hour is the slow one — produced Next's own unstyled
 * error page: English, in the wrong typeface, with no header, no way back and
 * nothing that looks like this company. For a visitor who arrived from a
 * search result that is the whole first impression.
 *
 * WHAT IT DOES NOT DO is show them the error. `error.message` is replaced by a
 * digest in a production build, deliberately, because a stack trace or a
 * failing query is not a visitor's business and is sometimes an attacker's.
 * The digest is printed small, because it is the one thing that makes a
 * reported problem findable in the logs.
 *
 * `reset()` re-renders the segment without a full reload, which is the right
 * first thing to try when the cause was a slow connection rather than a bug.
 */
export default function SiteError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);

  return (
    <main className="err-page">
      <p className="err-eyebrow">{t('error.eyebrow')}</p>
      <h1>{t('error.title')}</h1>
      <p className="err-lede">{t('error.lede')}</p>

      <div className="err-actions">
        <button type="button" className="btn" onClick={reset}>{t('error.retry')}</button>
        <Link href={`/${locale}`} className="btn btn-ghost">{t('error.home')}</Link>
      </div>

      {error.digest && <p className="err-ref">{t('error.reference')} {error.digest}</p>}

      <style>{`
        .err-page {
          max-width: 46rem; margin-inline: auto;
          padding: clamp(56px, 12vh, 140px) var(--gutter, 16px);
          text-align: center;
        }
        .err-eyebrow {
          margin: 0 0 .6rem; font-size: .72rem; letter-spacing: .24em;
          text-transform: uppercase; color: var(--fg-mute, #6B6E60);
        }
        .err-page h1 {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(1.7rem, 4.5vw, 2.6rem); line-height: 1.12;
          letter-spacing: -.02em; margin: 0 0 1rem;
        }
        .err-lede {
          margin: 0 auto 2rem; max-width: 34rem;
          font-size: 1.02rem; line-height: 1.65; color: var(--fg-mute, #6B6E60);
        }
        .err-actions {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
        }
        @media (pointer: coarse) { .err-actions .btn { min-height: 44px; } }
        .err-ref {
          margin: 2.5rem 0 0; font-size: .74rem;
          color: var(--fg-mute, #6B6E60); font-variant-numeric: tabular-nums;
        }
      `}</style>
    </main>
  );
}
