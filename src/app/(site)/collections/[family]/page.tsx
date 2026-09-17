import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getFamilies, getByFamilySlug, heightMidpoint } from '@/lib/products';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return getFamilies().map((f) => ({ family: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ family: string }> }): Promise<Metadata> {
  const { family } = await params;
  const f = getFamilies().find((x) => x.slug === family);
  if (!f) return { title: 'Not found' };
  return {
    title: `${f.name} imported from Italy to the UAE`,
    description: `${f.blurb} ${f.count} specimens supplied and delivered across the United Arab Emirates. Price on request.`,
    alternates: { canonical: `/collections/${f.slug}` },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ family: string }> }) {
  const slug = (await params).family;
  const families = getFamilies();
  const f = families.find((x) => x.slug === slug);
  if (!f) notFound();

  // Tallest first. Somebody opening a collection is looking for the specimen
  // that carries the scheme; the 40 cm plants are what they scroll past.
  const items = [...getByFamilySlug(slug)].sort((a, b) => heightMidpoint(b) - heightMidpoint(a));
  const others = families.filter((x) => x.slug !== slug);

  return (
    <div className="section">
      <div className="wrap">
        <nav aria-label="Breadcrumb" className="crumbs">
          {/* This used to point at /catalog and call itself the parent. It is
              not: /collections is. A breadcrumb that lies about where you are
              is worse than none. */}
          <Link href="/collections">Collections</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{f.name}</span>
        </nav>

        <header className="fam-head">
          <div>
            <p className="eyebrow">Collection</p>
            <h1>{f.name}</h1>
            <p className="lede">{f.blurb}</p>
          </div>
          <dl className="fam-facts">
            <div><dt>Specimens</dt><dd>{items.length}</dd></div>
            {f.heights && <div><dt>Height range</dt><dd>{f.heights}</dd></div>}
            <div><dt>Grown in</dt><dd>Italy</dd></div>
            <div>
              <dt>Lead time</dt>
              <dd>{site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks</dd>
            </div>
          </dl>
        </header>

        {items.length === 0 ? (
          <p className="fam-empty">
            Nothing is listed in this collection at the moment. Tell us the specification
            and we will source it — <Link href="/quote">send us the details</Link>.
          </p>
        ) : (
          <div className="grid cols-4 fam-grid">
            {items.map((p, i) => <ProductCard key={p.reference} p={p} priority={i < 4} />)}
          </div>
        )}

        {/* Somebody who has read one collection is choosing between them, and
            sending them back up to the index to pick the next one is a step
            that need not exist. */}
        <nav className="fam-more" aria-label="Other collections">
          <h2>The other collections</h2>
          <ul>
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/collections/${o.slug}`}>
                  <span className="fam-more-n">{o.name}</span>
                  <span className="fam-more-c">{o.count} specimen{o.count === 1 ? '' : 's'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        .crumbs { display: flex; gap: .55em; font-size: .82rem; color: var(--fg-mute); margin-bottom: 28px; }
        .crumbs a { text-decoration: none; }
        .crumbs a:hover { text-decoration: underline; }
        @media (pointer: coarse) {
          .crumbs { align-items: center; }
          .crumbs a { display: inline-flex; align-items: center; min-height: 44px; }
        }

        .fam-head {
          display: grid; gap: clamp(22px, 3vw, 56px); align-items: end;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
        }
        @media (max-width: 900px) { .fam-head { grid-template-columns: 1fr; align-items: start; } }
        .fam-head .lede { margin-bottom: 0; max-width: 34ch; }

        .fam-facts {
          display: grid; gap: 0; margin: 0; padding: 0;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          border-top: 1px solid var(--line);
        }
        .fam-facts > div { padding: 14px 0; border-bottom: 1px solid var(--line-soft); }
        .fam-facts > div:nth-child(even) { padding-inline-start: 20px; border-inline-start: 1px solid var(--line-soft); }
        .fam-facts dt {
          font-size: .64rem; font-weight: 600; letter-spacing: .16em;
          text-transform: uppercase; color: var(--fg-mute); margin-bottom: .35em;
        }
        .fam-facts dd {
          margin: 0; font-family: var(--font-display); font-size: 1.02rem;
          color: var(--olive-900); line-height: 1.25;
        }

        .fam-grid { margin-top: clamp(38px, 5vw, 60px); }
        .fam-empty {
          margin: clamp(38px, 5vw, 60px) 0; padding: 28px;
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius-lg); color: var(--fg-soft); max-width: 60ch;
        }

        .fam-more { margin-top: clamp(56px, 8vw, 96px); border-top: 1px solid var(--line); padding-top: 32px; }
        .fam-more h2 {
          font-family: var(--font-sans); font-size: .7rem; font-weight: 600;
          letter-spacing: .18em; text-transform: uppercase; color: var(--fg-mute);
          margin-bottom: 1.2rem;
        }
        .fam-more ul {
          list-style: none; margin: 0; padding: 0;
          display: grid; gap: 10px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        .fam-more a {
          display: grid; gap: 2px; padding: 14px 16px;
          text-decoration: none; border: 1px solid var(--line);
          border-radius: var(--radius); background: var(--bg);
          transition: border-color .18s ease, background .18s ease;
        }
        .fam-more a:hover { border-color: var(--olive-300); background: var(--sand-50); }
        .fam-more-n { font-family: var(--font-display); font-size: 1.02rem; color: var(--olive-900); }
        .fam-more-c {
          font-size: .68rem; letter-spacing: .13em; text-transform: uppercase; color: var(--fg-mute);
        }
        @media (prefers-reduced-motion: reduce) { .fam-more a { transition: none; } }
      `}</style>
    </div>
  );
}
