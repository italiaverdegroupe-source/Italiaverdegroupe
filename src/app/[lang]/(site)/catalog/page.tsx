import type { Metadata } from 'next';
import { type Locale, localePath } from '@/lib/i18n';
import { metadataFor } from '@/lib/content';
import L from '@/components/L';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, getFamilies, familySlug, sizeBand, SIZE_BANDS, heightMidpoint, searchProducts, rankBySearch } from '@/lib/products';
import { ui } from '@/lib/ui';
import { specimenCount } from '@/lib/product-copy';

/**
 * Revalidated on a timer as well as on demand.
 *
 * Editing in the console revalidates this page immediately, so a correction is
 * live at once. The timer is for the other case: a deploy whose build could
 * not reach the database bakes the compiled defaults, and without a window
 * the FAQs and testimonials someone added last week would quietly vanish
 * until the next edit. Five minutes means the page heals itself instead.
 */
export const revalidate = 300;

export const generateMetadata = async (
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> => {
  // The title and description were English literals, so /ar/catalog and /it/catalog
  // shipped an English SERP snippet under an hreflang cluster that told Google
  // they were the Arabic and Italian pages. The body was translated; only the
  // head was not, which is the half a searcher sees first.
  const { lang } = await params;
  const t = ui(lang);
  return metadataFor(lang, '/catalog', {
    title: t('seo.catalogTitle'),
    description: t('seo.catalogDesc'),
  });
};

type Search = { family?: string; size?: string; sort?: string; q?: string };

export default async function CatalogPage(
  { params, searchParams }: { params: Promise<{ lang: Locale }> } & { searchParams: Promise<Search> },
) {
  const { lang } = await params;
  const t = ui(lang);
  const sp = await searchParams;
  const families = getFamilies();

  const q = (sp.q ?? '').trim();

  let list = getAllProducts();
  if (q) list = searchProducts(list, q);
  if (sp.family) list = list.filter((p) => familySlug(p.family) === sp.family);
  if (sp.size) list = list.filter((p) => sizeBand(p) === sp.size);

  list = sp.sort === 'tallest' ? [...list].sort((a, b) => heightMidpoint(b) - heightMidpoint(a))
    : sp.sort === 'smallest' ? [...list].sort((a, b) => heightMidpoint(a) - heightMidpoint(b))
    // With a search term and no explicit sort, relevance beats reference
    // order: somebody who typed a reference should not have to look for it.
    : q ? rankBySearch(list, q)
    : [...list].sort((a, b) => a.reference.localeCompare(b.reference));

  const qs = (patch: Partial<Search>) => {
    const next = { ...sp, ...patch };
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) s.set(k, v);
    const str = s.toString();
    return str ? `/catalog?${str}` : '/catalog';
  };

  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">{t("Catalogue")}</p>
        {/* The key used to be the HTML entity "Italian trees &amp; plants".
            JSX renders text rather than HTML, so the headline of the main
            commercial page printed the five literal characters &amp; where the
            ampersand should be — in English only, because the Arabic and
            Italian translations of that key had a real ampersand or none. */}
        <h1 className="cat-h1">{t("Italian trees & plants")}</h1>
        <p className="lede">
          {t("Every specimen is quoted individually — availability, size and price depend on the season and the consignment. Tell us what the project needs and we will price it.")}
        </p>

        {/* A box, not a live filter. The whole catalogue is sixty-eight items and
            it is rendered on the server, so a GET with the term in the URL is
            searchable, shareable, back-button-able and works with JavaScript
            off — all of which a keystroke handler would have cost for no gain
            at this size. */}
        {/* action was the literal "/catalog", so submitting a search from
            /ar/catalog or /it/catalog landed the reader on the ENGLISH
            catalogue — the one control on the page whose whole job is to keep
            them in it. localePath is what every link on the site already uses
            to stay in the reader's language; a form action needs it too. */}
        <form className="cat-search" role="search" action={localePath(lang, '/catalog')}>
          {sp.family && <input type="hidden" name="family" value={sp.family} />}
          {sp.size && <input type="hidden" name="size" value={sp.size} />}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          <label htmlFor="cat-q" className="visually-hidden">{t("Search the catalogue")}</label>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input id="cat-q" type="search" name="q" defaultValue={q}
                 placeholder={t("Reference, botanical or common name — VG-OL-012, Olea, palm")} />
          <button type="submit" className="btn btn-primary">{t("Search")}</button>
          {q && <L href={qs({ q: undefined })} className="cat-clear">{t("Clear")}</L>}
        </form>

        <div className="filters">
          <div className="fgroup">
            <span className="flabel">{t("Collection")}</span>
            <div className="fchips">
              <L href={qs({ family: undefined })} className={`chip ${!sp.family ? 'on' : ''}`}>{t("All")}</L>
              {families.map((f) => (
                <L key={f.slug} href={qs({ family: f.slug })}
                      className={`chip ${sp.family === f.slug ? 'on' : ''}`}>
                  {f.name} <em>{f.count}</em>
                </L>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <span className="flabel">{t("Size")}</span>
            <div className="fchips">
              <L href={qs({ size: undefined })} className={`chip ${!sp.size ? 'on' : ''}`}>{t("Any")}</L>
              {SIZE_BANDS.map((b) => (
                <L key={b.slug} href={qs({ size: b.slug })}
                      className={`chip ${sp.size === b.slug ? 'on' : ''}`}>
                  {b.name} <em>{b.hint}</em>
                </L>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <span className="flabel">{t("Sort")}</span>
            <div className="fchips">
              {([['', 'cat.sortReference'], ['tallest', 'cat.sortTallest'],
                 ['smallest', 'cat.sortSmallest']] as const).map(([v, k]) => (
                <L key={k} href={qs({ sort: v || undefined })}
                      className={`chip ${(sp.sort ?? '') === v ? 'on' : ''}`}>{t(k)}</L>
              ))}
            </div>
          </div>
        </div>

        <p className="count">
          {/* Was `{n} specimen` / `{n} specimens`, which is English grammar
              applied to Arabic: an 's' on an Arabic noun is a different word,
              and Arabic has six plural forms rather than two. specimenCount
              asks Intl.PluralRules which one applies. */}
          {specimenCount(list.length, lang)}
          {q && <> {t('cat.matching')} <strong>&ldquo;{q}&rdquo;</strong></>}
        </p>

        {list.length === 0 ? (
          <p className="empty">
            {q
              // A search that found nothing is a different situation from a
              // filter combination that found nothing, and the way out is
              // different too: widen the words, or tell us what you need. The
              // catalogue is what we hold, not what we can get.
              ? <>{t('cat.noMatch')} <strong>&ldquo;{q}&rdquo;</strong>.{' '}
                  <L href={qs({ q: undefined })}>Clear the search</L>, or{' '}
                  <L href={`/quote?type=sourcing&ref=${encodeURIComponent(q)}`}>
                    ask us to source it
                  </L> — we import to order as well as from stock.</>
              : <>Nothing matches that combination yet.{' '}
                  <L href="/quote?type=sourcing">{t('cat.askSource')}</L>.</>}
          </p>
        ) : (
          <div className="grid cols-4">
            {list.map((p, i) => <ProductCard key={p.reference} p={p} priority={i < 4} locale={lang} />)}
          </div>
        )}
      </div>

      <style>{`
        .cat-h1 { margin-bottom: .6rem; }
        .cat-search {
          display: flex; align-items: center; gap: 10px;
          margin: 34px 0 0; padding: 8px 8px 8px 16px;
          background: var(--bg); border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          color: var(--ink-400);
        }
        .cat-search:focus-within { border-color: var(--olive-700); color: var(--olive-700); }
        .cat-search svg { flex: none; }
        .cat-search input {
          flex: 1 1 auto; min-width: 0;
          font: inherit; font-size: .95rem; color: var(--fg);
          background: none; border: 0; padding: .55em 0;
        }
        .cat-search input:focus { outline: none; }
        @media (pointer: coarse) {
          .cat-search input { min-height: 44px; }
          .cat-clear { display: inline-flex; align-items: center; min-height: 44px; }
        }
        .cat-search input::placeholder { color: var(--ink-400); }
        .cat-search .btn { flex: none; padding: .7em 1.4em; font-size: .88rem; }
        .cat-clear { flex: none; font-size: .84rem; color: var(--ink-600); padding-inline: 6px; }
        @media (max-width: 560px) {
          .cat-search { flex-wrap: wrap; padding-inline: 12px; }
          .cat-search input { flex-basis: 100%; order: -1; }
          .cat-search .btn { flex: 1 1 auto; }
        }
        .filters {
          display: grid; gap: 20px; margin: 40px 0 28px;
          padding: 24px; background: var(--sand-100);
          border: 1px solid var(--line); border-radius: var(--radius-lg);
        }
        .flabel {
          display: block; font-size: .7rem; font-weight: 600; letter-spacing: .14em;
          text-transform: uppercase; color: var(--fg-mute); margin-bottom: 10px;
        }
        .fchips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip {
          display: inline-flex; align-items: baseline; gap: .45em;
          padding: .45em .95em; font-size: .86rem; text-decoration: none;
          /* A filter you have to aim at is a filter nobody uses on a phone. */
          background: var(--bg-raised); border: 1px solid var(--line);
          border-radius: 999px; transition: all .16s ease;
        }
        .chip em { font-style: normal; font-size: .72rem; color: var(--fg-mute); }
        .chip:hover { border-color: var(--olive-400); }
        @media (pointer: coarse) { .chip { min-height: 44px; align-items: center; } }
        .chip.on { background: var(--olive-700); color: #fff; border-color: var(--olive-700); }
        .chip.on em { color: rgb(255 255 255 / .7); }
        .count { font-size: .85rem; color: var(--fg-mute); margin-bottom: 24px; }
        .empty { padding: 48px 0; color: var(--fg-soft); }
      `}</style>
    </div>
  );
}
