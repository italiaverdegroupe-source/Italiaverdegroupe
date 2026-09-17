import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import Image from 'next/image';
import { getFamilies, getAllProducts } from '@/lib/products';
import { site } from '@/lib/site';
import { ui } from '@/lib/ui';

const meta = {
  title: 'Collections',
  description:
    'Olive trees, palms, agaves, cacti, ornamental and indoor specimens imported from Italy to the UAE.',
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  return { ...meta, alternates: alternates(lang, '/collections') };
}

/** Written out rather than "6" — a sentence reads better than a digit. */
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const spell = (n: number) => (n < WORDS.length ? WORDS[n] : String(n));

export default async function CollectionsPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const t = ui(lang);
  const families = getFamilies();
  const total = getAllProducts().length;
  const regions = site.sourcingRegions;

  return (
    <div className="section">
      <div className="wrap">
        <header className="coll-head">
          <div>
            <p className="eyebrow">{t("The catalogue")}</p>
            <h1>{t("Collections")}</h1>
          </div>
          <div className="coll-intro">
            <p className="lede">
              {spell(families.length).replace(/^./, (c) => c.toUpperCase())} families of Italian-grown stock, selected for UAE conditions.
            </p>
            <p className="coll-note">
              {t("Each listing is an individual specimen with its own reference, measured as it stands today rather than at the size it will grow into. Availability moves with each consignment, so every specimen is priced on the day you ask.")}
            </p>
          </div>
        </header>

        {/* The facts a specifier scans for before reading a word of prose. */}
        <dl className="coll-facts">
          <div><dt>{t("Specimens listed")}</dt><dd>{total}</dd></div>
          <div><dt>{t("Grown in")}</dt><dd>{regions.join(' · ')}</dd></div>
          <div><dt>{t("Delivered to")}</dt><dd>All {spell(site.emirates.length)} emirates</dd></div>
          <div>
            <dt>{t("Lead time")}</dt>
            <dd>{site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks</dd>
          </div>
        </dl>

        <ul className="coll">
          {families.map((f, i) => (
            <li key={f.slug}>
              <L href={`/collections/${f.slug}`} className="coll-card">
                <div className="coll-img">
                  <Image
                    src={`/products/${f.cover}`}
                    alt=""
                    width={1388}
                    height={861}
                    sizes="(max-width: 620px) 92vw, (max-width: 1000px) 46vw, 30vw"
                    /* The top row is what the page is judged on before anything
                       scrolls. Left lazy, it arrived after the fold had already
                       been drawn and the cards flashed empty. */
                    priority={i < 3}
                  />
                </div>
                <div className="coll-body">
                  <h2>{f.name}</h2>
                  <p className="coll-meta">
                    {f.count} specimen{f.count === 1 ? '' : 's'}
                    {f.heights && <span className="coll-sep"> · </span>}
                    {f.heights && <span className="coll-h">{f.heights}</span>}
                  </p>
                  <p className="coll-blurb">{f.blurb}</p>
                  <span className="coll-go">
                    {t('col.see')}
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h13M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </L>
            </li>
          ))}
        </ul>

        <section className="coll-cta">
          <div>
            <h2>{t("Looking for one particular tree?")}</h2>
            <p>
              {t("The full catalogue is searchable by name, botanical name, reference or size — and if what you need is not listed, we source it to specification from the grower rather than from a stock list.")}
            </p>
          </div>
          <div className="coll-cta-acts">
            <L href="/catalog" className="btn btn-primary">{t("Search the catalogue")}</L>
            <L href="/quote" className="btn btn-ghost">{t("Send a specification")}</L>
          </div>
        </section>
      </div>

      {/* Tells a search engine these six pages are one ordered set rather than
          six unrelated pages that happen to link to each other. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Collections',
            numberOfItems: families.length,
            itemListElement: families.map((f, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: f.name,
              url: `/collections/${f.slug}`,
            })),
          }),
        }}
      />

      <style>{`
        .coll-head {
          display: grid; gap: clamp(20px, 3vw, 56px);
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: end;
        }
        @media (max-width: 900px) { .coll-head { grid-template-columns: 1fr; align-items: start; } }
        .coll-intro .lede { max-width: 30ch; margin-bottom: 1.1rem; }
        .coll-note { max-width: 46ch; font-size: .92rem; color: var(--fg-soft); margin: 0; }

        .coll-facts {
          display: grid; gap: 0; margin: clamp(38px, 5vw, 64px) 0 0; padding: 0;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
        }
        .coll-facts > div { padding: 18px 20px 18px 0; border-inline-end: 1px solid var(--line-soft); }
        .coll-facts > div:last-child { border-inline-end: 0; }
        .coll-facts > div:not(:first-child) { padding-inline-start: 20px; }
        .coll-facts dt {
          font-size: .66rem; font-weight: 600; letter-spacing: .16em;
          text-transform: uppercase; color: var(--fg-mute); margin-bottom: .45em;
        }
        .coll-facts dd {
          margin: 0; font-family: var(--font-display); font-size: 1.04rem;
          line-height: 1.25; color: var(--olive-900);
        }
        @media (max-width: 760px) {
          .coll-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .coll-facts > div:nth-child(2n) { border-inline-end: 0; }
          .coll-facts > div:nth-child(-n+2) { border-bottom: 1px solid var(--line-soft); }
          .coll-facts > div:nth-child(odd) { padding-inline-start: 0; }
          .coll-facts > div:nth-child(even) { padding-inline-start: 20px; }
        }

        .coll {
          list-style: none; margin: clamp(38px, 5vw, 64px) 0 0; padding: 0;
          display: grid; gap: clamp(20px, 2.6vw, 34px);
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        }
        .coll-card {
          display: flex; flex-direction: column; height: 100%;
          text-decoration: none; color: inherit;
          background: var(--bg); border: 1px solid var(--line);
          border-radius: var(--radius-lg); overflow: hidden;
          transition: border-color .22s var(--ease), box-shadow .22s var(--ease), transform .22s var(--ease);
        }
        .coll-card:hover {
          border-color: var(--olive-300); box-shadow: var(--shadow-lift); transform: translateY(-3px);
        }
        .coll-img { aspect-ratio: 4 / 3; overflow: hidden; background: var(--sand-200); }
        .coll-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .6s var(--ease);
        }
        .coll-card:hover .coll-img img { transform: scale(1.045); }
        .coll-body {
          display: flex; flex-direction: column; flex: 1;
          padding: clamp(18px, 2vw, 24px);
        }
        .coll-body h2 { font-size: clamp(1.3rem, 1.9vw, 1.6rem); margin-bottom: .25rem; }
        .coll-meta {
          font-size: .75rem; letter-spacing: .12em; text-transform: uppercase;
          color: var(--brass-700); margin: 0 0 .75rem;
        }
        .coll-sep { opacity: .5; }
        /* Metres are lowercase. The uppercasing on this line turned "6.0 m"
           into "6.0 M", which is a different unit entirely. */
        .coll-h { color: var(--fg-mute); text-transform: none; letter-spacing: .08em; }
        .coll-blurb { font-size: .93rem; color: var(--fg-soft); margin: 0 0 1.1rem; }
        .coll-go {
          display: inline-flex; align-items: center; gap: .5em; margin-top: auto;
          font-size: .82rem; font-weight: 500; color: var(--olive-700);
        }
        .coll-go svg { transition: transform .22s var(--ease); }
        .coll-card:hover .coll-go svg { transform: translateX(3px); }

        .coll-cta {
          display: grid; gap: clamp(20px, 3vw, 48px); align-items: center;
          grid-template-columns: minmax(0, 1.4fr) auto;
          margin-top: clamp(56px, 8vw, 96px);
          padding: clamp(28px, 3.4vw, 44px);
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius-lg);
        }
        @media (max-width: 860px) { .coll-cta { grid-template-columns: 1fr; } }
        .coll-cta h2 { font-size: clamp(1.5rem, 2.6vw, 2.1rem); margin-bottom: .5rem; }
        .coll-cta p { margin: 0; color: var(--fg-soft); max-width: 58ch; font-size: .95rem; }
        .coll-cta-acts { display: flex; flex-wrap: wrap; gap: 12px; }

        @media (prefers-reduced-motion: reduce) {
          .coll-card, .coll-img img, .coll-go svg { transition: none; }
          .coll-card:hover { transform: none; }
          .coll-card:hover .coll-img img { transform: none; }
          .coll-card:hover .coll-go svg { transform: none; }
        }
      `}</style>
    </div>
  );
}
