import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getFamilies } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Olive trees, palms, agaves, cacti, ornamental and indoor specimens imported from Italy to the UAE.',
  alternates: { canonical: '/collections' },
};

export default function CollectionsPage() {
  const families = getFamilies();
  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">The catalogue</p>
        <h1>Collections</h1>
        <p className="lede">Six families of Italian-grown stock, selected for UAE conditions.</p>
        <div className="grid cols-3 coll">
          {families.map((f) => (
            <Link key={f.slug} href={`/collections/${f.slug}`} className="coll-card">
              <div className="coll-img">
                <Image src={`/products/${f.cover}`} alt="" width={1388} height={861} sizes="380px" />
              </div>
              <div className="coll-body">
                <h2>{f.name}</h2>
                <p className="coll-count">{f.count} specimens</p>
                <p className="coll-blurb">{f.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .coll { margin-top: 40px; }
        .coll-card {
          display: block; text-decoration: none; color: inherit;
          background: var(--bg-raised); border: 1px solid var(--line);
          border-radius: var(--radius-lg); overflow: hidden; transition: all .2s ease;
        }
        .coll-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--olive-400); }
        .coll-img { aspect-ratio: 16/10; overflow: hidden; background: var(--sand-200); }
        .coll-img img { width: 100%; height: 100%; object-fit: cover; }
        .coll-body { padding: 20px; }
        .coll-body h2 { font-size: 1.3rem; margin-bottom: .1rem; }
        .coll-count { font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: var(--brass-600); margin-bottom: .6rem; }
        .coll-blurb { font-size: .9rem; color: var(--fg-soft); margin: 0; }
      `}</style>
    </div>
  );
}
