import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import ShortlistButton from '@/components/ShortlistButton';

/**
 * Editorial specimen card: tall portrait frame, the reference used as a
 * typographic mark, specs as a hairline table. No boxed e-commerce tile.
 */
export default function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const [w, h] = p.imageSize.split('x').map(Number);
  return (
    <article className="spec reveal">
      <Link href={`/catalog/${p.slug}`} className="spec-link">
        <div className="spec-frame">
          <Image
            src={`/products/${p.image}`}
            alt={p.name}
            width={w || 1388}
            height={h || 861}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
            priority={priority}
          />
          <span className="spec-ref">{p.reference}</span>
          {!p.photoVerified && <span className="spec-flag">Photo under review</span>}
        </div>

        <div className="spec-body">
          <h3 className="spec-name">{p.name}</h3>
          <dl className="spec-dl">
            {p.attributes.Height && (
              <div><dt>Height</dt><dd>{p.attributes.Height}</dd></div>
            )}
            {(p.attributes['Pot Size'] || p.attributes.Diameter) && (
              <div>
                <dt>{p.attributes['Pot Size'] ? 'Pot' : 'Diameter'}</dt>
                <dd>{p.attributes['Pot Size'] ?? p.attributes.Diameter}</dd>
              </div>
            )}
          </dl>
          <span className="spec-cta">{p.price || 'On request'}</span>
        </div>
      </Link>

      {/* Outside the anchor on purpose: a button nested inside a link is
          invalid HTML, and a keyboard user landing on it would be told they
          are on a link to the specimen rather than on a control. */}
      <div className="spec-add">
        <ShortlistButton item={{ ref: p.reference, name: p.name, slug: p.slug }} compact />
      </div>

      <style>{`
        .spec { display: flex; flex-direction: column; }
        .spec-add { margin-top: 12px; }
        .spec-link { display: grid; gap: 16px; text-decoration: none; color: inherit; }

        .spec-frame {
          position: relative; aspect-ratio: 4 / 5; overflow: hidden;
          background: var(--sand-100); border-radius: var(--radius);
        }
        .spec-frame img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .9s var(--ease), filter .5s var(--ease);
        }
        .spec:hover .spec-frame img { transform: scale(1.055); }

        .spec-ref {
          position: absolute; left: 10px; top: 10px;
          padding: .32em .6em;
          font-size: .62rem; font-weight: 600; letter-spacing: .13em;
          color: var(--sand-50); background: rgb(20 21 15 / .52);
          backdrop-filter: blur(6px); border-radius: 2px;
        }
        .spec-flag {
          position: absolute; left: 10px; bottom: 10px;
          padding: .3em .6em; font-size: .62rem; letter-spacing: .05em;
          background: rgb(140 70 42 / .9); color: #fff; border-radius: 2px;
        }

        .spec-body { display: grid; gap: 10px; }
        .spec-name { margin: 0; font-size: 1.22rem; line-height: 1.15; }

        .spec-dl { display: grid; gap: 0; margin: 0; }
        .spec-dl > div {
          display: flex; justify-content: space-between; gap: 1rem;
          padding: .42rem 0; border-top: 1px solid var(--line-soft);
          font-size: .82rem;
        }
        .spec-dl dt { color: var(--fg-mute); }
        .spec-dl dd { margin: 0; color: var(--fg-soft); font-variant-numeric: tabular-nums; }

        .spec-cta {
          font-size: .78rem; font-weight: 600; letter-spacing: .12em;
          text-transform: uppercase; color: var(--olive-700);
          display: inline-flex; align-items: center; gap: .5em;
        }
        .spec-cta::after {
          content: '→'; transition: transform .3s var(--ease);
        }
        .spec:hover .spec-cta::after { transform: translateX(4px); }
      `}</style>
    </article>
  );
}
