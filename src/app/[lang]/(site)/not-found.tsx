'use client';

import L from '@/components/L';
import { useLocale } from '@/components/LocaleProvider';
import { ui } from '@/lib/ui';

/**
 * The 404 for a path under one of the site's own segments.
 *
 * A client component reading the locale from context, and NOT a server
 * component reading it from headers() — which is what this was first written
 * as, and which broke the journal.
 *
 * The reason is in LocaleProvider's own comment. A not-found is handed no
 * params, so headers() looks like the only way to know the language. But this
 * component is also what renders when a STATIC page calls notFound(): the
 * journal article page is prerendered and 404s an unpublished slug, so
 * touching headers() here turned that page dynamic at runtime and Next
 * returned 500 for every article, in all three languages. Caught by
 * tests/health.test.mjs before it left the machine.
 *
 * Context has the locale already — the [lang] layout put it there from the
 * route — and reading it costs nothing and keeps every page static.
 */
export default function NotFound() {
  const t = ui(useLocale());
  return (
    <div className="section">
      <div className="wrap nf">
        <p className="eyebrow">404</p>
        <h1>{t('nf.title')}</h1>
        <p className="lede">{t('nf.lede')}</p>
        <p className="nf-cta">
          <L href="/catalog" className="btn btn-primary">{t('nf.browse')}</L>
          <L href="/quote" className="btn btn-ghost">{t('cta.quote')}</L>
        </p>
      </div>
      <style>{`
        .nf { max-width: 60ch; padding-block: clamp(32px, 6vw, 72px); }
        .nf-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2rem; }
      `}</style>
    </div>
  );
}
