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
 * THE "TRY AGAIN" BUTTON USED TO BE DECORATIVE, and the comment that used to
 * sit here said the opposite of what the framework does. It called `reset()`
 * and claimed that re-rendering the segment was "the right first thing to try
 * when the cause was a slow connection" — but `reset()` does not re-fetch
 * anything. The shipped boundary is three lines
 * (node_modules/next/dist/client/components/error-boundary.js):
 * `reset` only clears the boundary's own error state, while `retry` calls
 * `router.refresh()` first and then clears it. Next 16's own reference says
 * as much — "In most cases, you should use retry() instead" — and that
 * `retry()` "will try to re-fetch and re-render the error boundary's
 * children" (03-api-reference/03-file-conventions/error.md).
 *
 * That distinction is the whole point of this page. The failure it was
 * written for is a server-rendered page whose payload errored on the server:
 * Neon suspends its compute, the first query after a quiet hour times out,
 * the RSC payload comes back as an error. Clearing the error state and
 * re-rendering that same already-failed payload throws again immediately, so
 * the button put the visitor straight back on the page they were already
 * looking at. `retry()` asks the server for the segment again, which is the
 * one thing that can succeed once the database has woken up.
 *
 * `retry` became stable in 16.3 and this project is on 16.3.5, so there is no
 * flag and no fallback to keep: the boundary passes both props on every
 * render and `reset` is simply the wrong one of the two here.
 */
export default function SiteError({ error, retry }: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const locale = useLocale();
  const t = ui(locale);

  return (
    <main className="err-page">
      <p className="err-eyebrow">{t('error.eyebrow')}</p>
      <h1>{t('error.title')}</h1>
      <p className="err-lede">{t('error.lede')}</p>

      <div className="err-actions">
        <button type="button" className="btn" onClick={() => retry()}>{t('error.retry')}</button>
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
