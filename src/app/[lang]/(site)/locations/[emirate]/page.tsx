import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { locations, getLocation } from '@/lib/locations';
import { getSettings } from '@/lib/settings';
import { getAllProducts } from '@/lib/products';

export function generateStaticParams() {
  return locations.map((l) => ({ emirate: l.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale; emirate: string }> },
): Promise<Metadata> {
  const { lang, emirate } = await params;
  const l = getLocation(emirate);
  if (!l) return { title: 'Not found' };
  return {
    title: `Italian tree supply & delivery in ${l.name}`,
    description: `${l.intro} Specimen olive trees, palms and ornamental plants imported from Italy and delivered in ${l.name}.`,
    alternates: alternates(lang, `/locations/${l.slug}`),
  };
}

export default async function LocationPage(
  { params }: { params: Promise<{ lang: Locale; emirate: string }> },
) {
  const { lang, emirate } = await params;
  const l = getLocation(emirate);
  if (!l) notFound();
  const site = await getSettings();
  const picks = getAllProducts().filter((p) => p.family === 'Olive Trees' || p.family === 'Palms').slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Tree and plant supply, delivery and planting',
    provider: { '@type': 'Organization', name: site.legalName },
    areaServed: { '@type': 'AdministrativeArea', name: `${l.name}, United Arab Emirates` },
  };

  return (
    <div className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
        <p className="eyebrow">Coverage</p>
        <h1>Tree supply &amp; delivery in {l.name}</h1>
        <p className="lede">{l.intro}</p>

        <h2 className="sub-h">What that means on site</h2>
        <ul className="notes">{l.notes.map((n) => <li key={n}>{n}</li>)}</ul>

        <h2 className="sub-h">Commonly specified here</h2>
        <div className="grid cols-4">{picks.map((p) => <ProductCard key={p.reference} p={p} locale={lang} />)}</div>

        <div className="loc-cta">
          <L href={`/quote?type=bulk`} className="btn btn-primary">Request pricing for {l.name}</L>
        </div>

        <nav className="others" aria-label="Other emirates">
          <h2 className="sub-h">Also delivering to</h2>
          <div className="emirates">
            {locations.filter((x) => x.slug !== l.slug).map((x) => (
              <L key={x.slug} href={`/locations/${x.slug}`} className="em">{x.name}</L>
            ))}
          </div>
        </nav>
      </div>

      <style>{`
        .sub-h { font-size: clamp(1.3rem, 2.2vw, 1.75rem); margin: 3rem 0 1.25rem; }
        .notes { display: grid; gap: .85rem; margin: 0; padding-inline-start: 1.15rem; max-width: 68ch; }
        .notes li { color: var(--fg-soft); }
        .loc-cta { margin-top: 2.5rem; }
        .emirates { display: flex; flex-wrap: wrap; gap: 10px; }
        .em {
          padding: .6em 1.1em; font-size: .9rem; text-decoration: none;
          border: 1px solid var(--line); border-radius: var(--radius); background: var(--bg-raised);
        }
        .em:hover { border-color: var(--olive-700); color: var(--olive-700); }
        @media (pointer: coarse) { .em { display: inline-flex; align-items: center; min-height: 44px; } }
      `}</style>
    </div>
  );
}
