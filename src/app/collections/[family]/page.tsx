import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getFamilies, getByFamilySlug } from '@/lib/products';

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
  const f = getFamilies().find((x) => x.slug === slug);
  if (!f) notFound();
  const items = getByFamilySlug(slug);

  return (
    <div className="section">
      <div className="wrap">
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/catalog">Catalogue</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{f.name}</span>
        </nav>
        <p className="eyebrow">Collection</p>
        <h1>{f.name}</h1>
        <p className="lede">{f.blurb}</p>
        <p className="count">{items.length} specimens</p>
        <div className="grid cols-4">
          {items.map((p, i) => <ProductCard key={p.reference} p={p} priority={i < 4} />)}
        </div>
      </div>
      <style>{`
        .crumbs { display: flex; gap: .55em; font-size: .82rem; color: var(--fg-mute); margin-bottom: 28px; }
        .crumbs a { text-decoration: none; }
        .count { font-size: .85rem; color: var(--fg-mute); margin: 1.5rem 0; }
      `}</style>
    </div>
  );
}
