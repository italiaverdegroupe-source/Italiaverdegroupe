import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';

export default function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const [w, h] = p.imageSize.split('x').map(Number);
  return (
    <article className="card">
      <Link href={`/catalog/${p.slug}`} className="card-link">
        <div className="card-img">
          <Image
            src={`/products/${p.image}`}
            alt={p.name}
            width={w || 1388}
            height={h || 861}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            priority={priority}
          />
          {!p.photoVerified && <span className="card-flag">Photo under review</span>}
        </div>
        <div className="card-body">
          <h3 className="card-name">{p.name}</h3>
          <p className="card-ref">{p.reference}</p>
          <dl className="card-spec">
            {p.attributes.Height && (<><dt>Height</dt><dd>{p.attributes.Height}</dd></>)}
            {p.attributes['Pot Size'] && (<><dt>Pot</dt><dd>{p.attributes['Pot Size']}</dd></>)}
            {p.attributes.Diameter && (<><dt>Diameter</dt><dd>{p.attributes.Diameter}</dd></>)}
          </dl>
          <p className="card-price">{p.price || 'On Request'}</p>
        </div>
      </Link>

      <style>{`
        .card {
          background: var(--bg-raised);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .card:hover { border-color: var(--olive-400); box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .card-link { display: block; text-decoration: none; color: inherit; height: 100%; }
        .card-img { aspect-ratio: 4 / 3; overflow: hidden; background: var(--sand-100); position: relative; }
        .card-flag {
          position: absolute; left: 8px; bottom: 8px;
          padding: .3em .6em; font-size: .68rem; letter-spacing: .04em;
          background: rgb(25 26 22 / .78); color: #FBF9F4; border-radius: 3px;
        }
        .card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s cubic-bezier(.2,0,.2,1); }
        .card:hover .card-img img { transform: scale(1.04); }
        .card-body { padding: 16px 18px 18px; }
        .card-name { font-size: 1.05rem; margin: 0 0 .15rem; }
        .card-ref {
          font-size: .68rem; letter-spacing: .12em; text-transform: uppercase;
          color: var(--brass-600); margin: 0 0 .75rem;
        }
        .card-spec {
          display: grid; grid-template-columns: auto 1fr; gap: .15rem .75rem;
          margin: 0 0 .85rem; font-size: .82rem;
        }
        .card-spec dt { color: var(--fg-mute); }
        .card-spec dd { margin: 0; color: var(--fg-soft); }
        .card-price {
          margin: 0; padding-top: .7rem; border-top: 1px solid var(--line);
          font-size: .82rem; font-weight: 500; color: var(--olive-700);
        }
      `}</style>
    </article>
  );
}
