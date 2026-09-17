import type { Metadata } from 'next';
import Link from 'next/link';
import ShortlistButton from '@/components/ShortlistButton';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getSettings } from '@/lib/settings';
import { getAllProducts, getProduct, familySlug } from '@/lib/products';

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return { title: 'Not found' };
  const size = p.attributes.Height ? ` ${p.attributes.Height}` : '';
  return {
    title: `${p.name}${size} — imported from Italy`,
    description: `${p.description} Reference ${p.reference}. Supplied and delivered across the UAE. Price on request.`,
    alternates: { canonical: `/catalog/${p.slug}` },
    openGraph: { images: [`/products/${p.image}`], title: p.name, description: p.description },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const site = await getSettings();

  const [w, h] = p.imageSize.split('x').map(Number);
  const related = getAllProducts()
    .filter((x) => x.family === p.family && x.reference !== p.reference)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.reference,
    description: p.description,
    image: [`/products/${p.image}`],
    category: p.family,
    brand: { '@type': 'Brand', name: site.legalName },
    offers: {
      '@type': 'Offer',
      priceCurrency: site.currency,
      availability: 'https://schema.org/PreOrder',
      seller: { '@type': 'Organization', name: site.legalName },
      areaServed: site.emirates.map((e) => e.name),
    },
  };

  return (
    <div className="section section-tight det-top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/catalog">Catalogue</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/collections/${familySlug(p.family)}`}>{p.family}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{p.name}</span>
        </nav>

        <div className="detail">
          <figure className="det-img">
            <Image src={`/products/${p.image}`} alt={p.name}
                   width={w || 1388} height={h || 861}
                   sizes="(max-width: 900px) 100vw, 620px" priority />
            {!p.photoVerified && (
              <figcaption className="img-note">
                Catalogue photograph under review — it may not represent this specimen.
                Current photographs are supplied with the quotation.
              </figcaption>
            )}
          </figure>

          <div className="det-body">
            <p className="eyebrow">{p.family}</p>
            <h1 className="det-h1">{p.name}</h1>
            <p className="det-ref">Reference {p.reference}</p>
            <p className="det-desc">{p.description}</p>

            <dl className="specs">
              {Object.entries(p.attributes).map(([k, v]) => (
                <div key={k} className="spec-row">
                  <dt>{k}</dt><dd>{v}</dd>
                </div>
              ))}
              <div className="spec-row">
                <dt>Availability</dt><dd>{p.availability || 'On Request'}</dd>
              </div>
              <div className="spec-row">
                <dt>Price</dt><dd>{p.price || 'On Request'}</dd>
              </div>
            </dl>

            <div className="det-cta">
              <Link href={`/quote?ref=${p.reference}`} className="btn btn-primary">Request this specimen</Link>
              <ShortlistButton item={{ ref: p.reference, name: p.name, slug: p.slug }} />
              <Link href={`/quote?type=bulk&ref=${p.reference}`} className="btn btn-ghost">Bulk pricing</Link>
            </div>

            <p className="det-note">
              Living stock: dimensions are indicative and vary between individual specimens.
              Final size, form and price are confirmed on the quotation.
              Typical lead time {site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks from
              order confirmation to delivery on site.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related">
            <h2>More from {p.family}</h2>
            <div className="grid cols-4">
              {related.map((r) => <ProductCard key={r.reference} p={r} />)}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .crumbs {
          display: flex; flex-wrap: wrap; gap: .55em; align-items: center;
          font-size: .82rem; color: var(--fg-mute); margin-bottom: 32px;
        }
        .crumbs a { text-decoration: none; }
        .crumbs a:hover { color: var(--olive-700); text-decoration: underline; text-underline-offset: 3px; }

        /* Less air above than a marketing page: this is arrived at from a
           search or a link, already knowing what is wanted. */
        .det-top { padding-top: 0; }
        .detail { display: grid; gap: clamp(28px, 4vw, 56px); align-items: start; }
        .det-h1 { font-size: clamp(2.1rem, 3.6vw, 3.1rem); line-height: 1.04; }
        .det-img {
          margin: 0; border-radius: var(--radius-lg); overflow: hidden;
          border: 1px solid var(--line); background: var(--sand-100);
        }
        .det-img img { width: 100%; height: auto; display: block; }
        .img-note {
          padding: .7em 1em; font-size: .8rem; line-height: 1.5;
          background: var(--sand-100); color: var(--fg-soft);
          border-top: 1px solid var(--line);
        }
        .det-ref {
          font-size: .72rem; letter-spacing: .13em; text-transform: uppercase;
          color: var(--brass-600); margin-bottom: 1.25rem;
        }
        .det-desc { font-size: 1.05rem; color: var(--fg-soft); margin-bottom: 2rem; }

        .specs { margin: 0 0 2rem; border-top: 1px solid var(--line); }
        .spec-row {
          display: grid; grid-template-columns: 8.5rem 1fr; gap: 1rem;
          padding: .7rem 0; border-bottom: 1px solid var(--line);
        }
        .spec-row dt { color: var(--fg-mute); font-size: .88rem; }
        .spec-row dd { margin: 0; font-size: .95rem; font-weight: 500; }

        .det-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 1.75rem; }
        .det-note { font-size: .84rem; color: var(--fg-mute); line-height: 1.65; margin: 0; }

        .related { margin-top: clamp(56px, 8vw, 96px); }
        .related h2 { margin-bottom: 28px; }

        @media (min-width: 900px) {
          .detail { grid-template-columns: minmax(0, 1.28fr) minmax(0, 1fr); }
          /* The photograph holds its place while the specifications scroll past
             it. On the page where somebody decides, the thing they are deciding
             about should not leave the screen first — and it stops the column
             of white that opened up under a short image beside a long table. */
          .det-img { position: sticky; top: calc(var(--hdr-h) + 18px); }
        }
      `}</style>
    </div>
  );
}
