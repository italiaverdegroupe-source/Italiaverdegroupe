import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import ShortlistButton from '@/components/ShortlistButton';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getSettings } from '@/lib/settings';
import { getAllProducts, getProduct, familySlug } from '@/lib/products';
import { breadcrumbs, ldJson } from '@/lib/schema';
import { localePath } from '@/lib/i18n';
import { ui } from '@/lib/ui';
import { productCopy, familyName, attribute } from '@/lib/product-copy';

// The catalogue is a fixed set. A slug that is not in it is not a route, so
// it never matches and global-not-found.tsx serves it — see the note there.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale; slug: string }> },
): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: 'Not found' };
  // The <title> and the description are what a reader sees in a search result,
  // so they are in the language of the page they describe — an Arabic page
  // listed under an English title is an Arabic page nobody clicks.
  const t = ui(lang);
  const copy = productCopy(p, lang);
  const size = p.attributes.Height ? ` ${p.attributes.Height}` : '';
  return {
    title: t('seo.specimenTitle', { name: copy.name, size }),
    description: t('seo.specimenDesc', { desc: copy.description, ref: p.reference }),
    alternates: alternates(lang, `/catalog/${p.slug}`),
    openGraph: {
      images: [`/products/${p.image}`],
      title: copy.name,
      description: copy.description,
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ lang: Locale; slug: string }> },
) {
  const { lang, slug } = await params;
  const t = ui(lang);
  const p = getProduct(slug);
  if (!p) notFound();
  const copy = productCopy(p, lang);
  const family = familyName(p.family, lang);
  const site = await getSettings();

  const [w, h] = p.imageSize.split('x').map(Number);
  const related = getAllProducts()
    .filter((x) => x.family === p.family && x.reference !== p.reference)
    .slice(0, 4);

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://verdegarden.example';
  const here = `${origin}${localePath(lang, `/catalog/${p.slug}`)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: copy.name,
    sku: p.reference,
    description: copy.description,
    // ABSOLUTE. This was `/products/x.webp`, and a relative URL in structured
    // data is not a URL as far as a crawler is concerned — the image was
    // being declared and then discarded, on all sixty-eight pages.
    image: [`${origin}/products/${p.image}`],
    url: here,
    category: family,
    brand: { '@type': 'Brand', name: site.legalName },
    // Said on every one of the sixty-eight specimen pages, because it is the
    // single fact this business turns on and the one a search engine should
    // not have to infer from prose: the tree was grown in Italy and brought
    // here. The Organization markup says the company imports from Italy;
    // this says it about the thing being sold.
    countryOfOrigin: { '@type': 'Country', name: 'Italy' },
    // What was actually measured on this tree, which is the whole reason a
    // specimen has a page of its own rather than a line in a list.
    additionalProperty: [
      ...Object.entries(p.attributes ?? {}).map(([name, value]) => {
        const a = attribute(name, String(value), lang);
        return { '@type': 'PropertyValue', name: a.name, value: a.value };
      }),
      // The catalogue's own attributes already carry Origin: Italy, so only
      // the half they do not say is added here.
      { '@type': 'PropertyValue', name: 'Imported to', value: 'United Arab Emirates' },
    ],
    offers: {
      '@type': 'Offer',
      url: here,
      priceCurrency: site.currency,
      availability: 'https://schema.org/PreOrder',
      // Points at the Organization declared once in the layout rather than
      // describing the seller again on every one of sixty-eight pages and
      // risking two descriptions that disagree.
      seller: { '@id': `${origin}/#organisation` },
      areaServed: site.emirates.map((e) => e.name),
      // There is no price to state, and stating one would be a lie. This says
      // so in the vocabulary's own terms instead of leaving the field absent.
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: site.currency,
        valueAddedTaxIncluded: false,
        description: 'Quoted individually — availability, size and season decide the price.',
      },
    },
  };

  return (
    <div className="section section-tight det-top">
      <script type="application/ld+json" suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" suppressHydrationWarning
              dangerouslySetInnerHTML={ldJson(breadcrumbs(lang, [
                { name: t('Catalogue'), path: '/catalog' },
                { name: family, path: `/collections/${familySlug(p.family)}` },
                { name: copy.name, path: `/catalog/${p.slug}` },
              ]))} />
      <div className="wrap">
        <nav aria-label={t('det.breadcrumb')} className="crumbs">
          <L href="/catalog">{t('nav.catalog')}</L>
          <span aria-hidden="true">/</span>
          <L href={`/collections/${familySlug(p.family)}`}>{family}</L>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{p.name}</span>
        </nav>

        <div className="detail">
          <figure className="det-img">
            <Image src={`/products/${p.image}`} alt={copy.name}
                   width={w || 1388} height={h || 861}
                   sizes="(max-width: 900px) 100vw, 620px" priority />
            {!p.photoVerified && (
              <figcaption className="img-note">{t('det.photoNote')}</figcaption>
            )}
          </figure>

          <div className="det-body">
            <p className="eyebrow">{family}</p>
            <h1 className="det-h1">{copy.name}</h1>
            <p className="det-ref">{t('det.reference', { ref: p.reference })}</p>
            <p className="det-desc">{copy.description}</p>

            <dl className="specs">
              {Object.entries(p.attributes).map(([k, v]) => {
                const a = attribute(k, String(v), lang);
                return (
                  <div key={k} className="spec-row">
                    <dt>{a.name}</dt><dd>{a.value}</dd>
                  </div>
                );
              })}
              <div className="spec-row">
                <dt>{t('det.availability')}</dt><dd>{p.availability || t('det.onRequest')}</dd>
              </div>
              <div className="spec-row">
                <dt>{t('det.price')}</dt><dd>{p.price || t('det.onRequest')}</dd>
              </div>
            </dl>

            <div className="det-cta">
              <L href={`/quote?ref=${p.reference}`} className="btn btn-primary">{t('det.request')}</L>
              <ShortlistButton item={{ ref: p.reference, name: copy.name, slug: p.slug }} />
              <L href={`/quote?type=bulk&ref=${p.reference}`} className="btn btn-ghost">{t('det.bulk')}</L>
            </div>

            <p className="det-note">
              {t('det.livingStock', {
                min: site.leadTimeWeeks.min, max: site.leadTimeWeeks.max,
              })}
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related">
            <h2>{t('det.more', { family })}</h2>
            <div className="grid cols-4">
              {related.map((r) => <ProductCard key={r.reference} p={r} locale={lang} />)}
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
          color: var(--brass-700); margin-bottom: 1.25rem;
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
