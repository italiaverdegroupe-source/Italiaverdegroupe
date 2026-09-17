import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import { getLegalIndex } from '@/lib/legal';
import { ui } from '@/lib/ui';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const t = ui(lang);
  return {
    title: t('legal.indexTitle'),
    description: t('legal.indexDescription'),
    alternates: alternates(lang, '/legal'),
  };
}

export default async function LegalIndexPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const t = ui(lang);
  // The cards are the documents' own one-liners rather than a second list that
  // has to be kept in step with them. Rename a policy and this page follows.
  const docs = getLegalIndex(lang);

  return (
    <div className="section">
      <div className="wrap">
        <header className="lgx-head">
          <p className="eyebrow">{t('legal.eyebrow')}</p>
          <h1>{t('The small print, written to be read.')}</h1>
          <p className="lede">
            {t('Five documents, each about one thing, in plain sentences. If any of them is unclear, that is a fault in the document — tell us and we will fix it.')}
          </p>
        </header>

        <ul className="lgx">
          {docs.map((d) => (
            <li key={d.slug}>
              <L href={`/${d.slug}`}>
                <span className="lgx-n">{d.title}</span>
                <span className="lgx-l">{d.cardLine}</span>
                <span className="lgx-note">{d.cardNote}</span>
              </L>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .lgx-head { max-width: 60ch; }
        .lgx-head .lede { max-width: 52ch; }
        .lgx {
          list-style: none; margin: clamp(36px, 5vw, 56px) 0 0; padding: 0;
          display: grid; gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .lgx a {
          display: grid; gap: 4px; height: 100%;
          padding: clamp(18px, 2.2vw, 24px);
          text-decoration: none; background: var(--bg);
          border: 1px solid var(--line); border-radius: var(--radius-lg);
          transition: border-color .18s ease, background .18s ease;
        }
        .lgx a:hover { border-color: var(--olive-300); background: var(--sand-50); }
        .lgx-n {
          font-family: var(--font-display); font-size: 1.2rem;
          color: var(--olive-950); line-height: 1.2;
        }
        .lgx-l { font-size: .92rem; color: var(--fg-soft); }
        .lgx-note {
          margin-top: .35rem; font-size: .75rem; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brass-700);
        }
        @media (prefers-reduced-motion: reduce) { .lgx a { transition: none; } }
      `}</style>
    </div>
  );
}
