import type { Metadata } from 'next';
import { metadataFor } from '@/lib/content';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, getFamilies, familySlug, sizeBand, SIZE_BANDS, heightMidpoint } from '@/lib/products';

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

export const generateMetadata = (): Promise<Metadata> => metadataFor('/catalog', {
  title: 'Catalogue — Italian trees & plants for the UAE',
  description:
    'Browse specimen olive trees, palms, agaves, cacti and ornamental trees imported from Italy and supplied across the United Arab Emirates. All prices on request.',
});

type Search = { family?: string; size?: string; sort?: string };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const families = getFamilies();

  let list = getAllProducts();
  if (sp.family) list = list.filter((p) => familySlug(p.family) === sp.family);
  if (sp.size) list = list.filter((p) => sizeBand(p) === sp.size);

  list = [...list].sort((a, b) =>
    sp.sort === 'tallest' ? heightMidpoint(b) - heightMidpoint(a)
    : sp.sort === 'smallest' ? heightMidpoint(a) - heightMidpoint(b)
    : a.reference.localeCompare(b.reference));

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
        <p className="eyebrow">Catalogue</p>
        <h1 className="cat-h1">Italian trees &amp; plants</h1>
        <p className="lede">
          Every specimen is quoted individually — availability, size and price depend on the
          season and the consignment. Tell us what the project needs and we will price it.
        </p>

        <div className="filters">
          <div className="fgroup">
            <span className="flabel">Collection</span>
            <div className="fchips">
              <Link href={qs({ family: undefined })} className={`chip ${!sp.family ? 'on' : ''}`}>All</Link>
              {families.map((f) => (
                <Link key={f.slug} href={qs({ family: f.slug })}
                      className={`chip ${sp.family === f.slug ? 'on' : ''}`}>
                  {f.name} <em>{f.count}</em>
                </Link>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <span className="flabel">Size</span>
            <div className="fchips">
              <Link href={qs({ size: undefined })} className={`chip ${!sp.size ? 'on' : ''}`}>Any</Link>
              {SIZE_BANDS.map((b) => (
                <Link key={b.slug} href={qs({ size: b.slug })}
                      className={`chip ${sp.size === b.slug ? 'on' : ''}`}>
                  {b.name} <em>{b.hint}</em>
                </Link>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <span className="flabel">Sort</span>
            <div className="fchips">
              {[['', 'Reference'], ['tallest', 'Tallest first'], ['smallest', 'Smallest first']].map(([v, l]) => (
                <Link key={l} href={qs({ sort: v || undefined })}
                      className={`chip ${(sp.sort ?? '') === v ? 'on' : ''}`}>{l}</Link>
              ))}
            </div>
          </div>
        </div>

        <p className="count">{list.length} {list.length === 1 ? 'specimen' : 'specimens'}</p>

        {list.length === 0 ? (
          <p className="empty">Nothing matches that combination yet. <Link href="/quote?type=sourcing">Ask us to source it</Link>.</p>
        ) : (
          <div className="grid cols-4">
            {list.map((p, i) => <ProductCard key={p.reference} p={p} priority={i < 4} />)}
          </div>
        )}
      </div>

      <style>{`
        .cat-h1 { margin-bottom: .6rem; }
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
          background: var(--bg-raised); border: 1px solid var(--line);
          border-radius: 999px; transition: all .16s ease;
        }
        .chip em { font-style: normal; font-size: .72rem; color: var(--fg-mute); }
        .chip:hover { border-color: var(--olive-400); }
        .chip.on { background: var(--olive-700); color: #fff; border-color: var(--olive-700); }
        .chip.on em { color: rgb(255 255 255 / .7); }
        .count { font-size: .85rem; color: var(--fg-mute); margin-bottom: 24px; }
        .empty { padding: 48px 0; color: var(--fg-soft); }
      `}</style>
    </div>
  );
}
