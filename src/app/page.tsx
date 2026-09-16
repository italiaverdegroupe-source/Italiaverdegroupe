import Link from 'next/link';
import Image from 'next/image';
import RouteMap from '@/components/RouteMap';
import ProductCard from '@/components/ProductCard';
import { site } from '@/lib/site';
import { getAllProducts, getShowcaseProducts, getFamilies } from '@/lib/products';

const HERO_IMG = '/products/VG-OL-002-olive-tree-cloud-style.jpg';
const BAND_IMG = '/products/VG-OL-007-olive-tree-ancient.jpg';

export default function HomePage() {
  const families = getFamilies();
  const all = getAllProducts();
  const showcase = getShowcaseProducts();
  const featured = [
    ...families.map((f) => showcase.find((p) => p.family === f.name)!).filter(Boolean),
    ...showcase.filter((p) => p.family === 'Olive Trees').slice(1, 3),
  ].slice(0, 8);

  return (
    <>
      {/* ───────────── hero: the trees do the talking ───────────── */}
      <section className="hero">
        <Image src={HERO_IMG} alt="" fill priority sizes="100vw" className="hero-bg" />
        <div className="hero-veil" />
        <div className="wrap hero-in">
          <p className="hero-kicker">Italy&nbsp;&nbsp;→&nbsp;&nbsp;United Arab Emirates</p>
          <h1>
            Ancient Italian olives.<br />
            Planted in the Emirates.
          </h1>
          <p className="hero-lede">
            Specimen olive trees, palms and architectural plants selected at nurseries in
            {' '}{site.sourcingRegions.join(', ')} — supplied to landscaping contractors,
            developers, hotels and private estates across the UAE.
          </p>
          <div className="hero-cta">
            <Link href="/catalog" className="btn btn-primary btn-lg">Browse {all.length} specimens</Link>
            <Link href="/quote" className="btn btn-light btn-lg">Request a quote</Link>
          </div>
        </div>

        <ul className="trust">
          <li><strong>{all.length}</strong><span>specimens catalogued</span></li>
          <li><strong>4</strong><span>Italian growing regions</span></li>
          <li><strong>7</strong><span>emirates covered</span></li>
          <li><strong>{site.leadTimeWeeks.min}–{site.leadTimeWeeks.max}</strong><span>weeks lead time</span></li>
        </ul>
      </section>

      {/* ───────────── the route, on real geography ───────────── */}
      <section className="section route-sec">
        <div className="wrap">
          <div className="route-head">
            <div>
              <p className="eyebrow">Where they come from</p>
              <h2>From four Italian regions to every emirate.</h2>
            </div>
            <p className="route-note">
              We buy at the nursery, not from a middleman. Each consignment is inspected,
              documented for import, and acclimatised here before it ever reaches a site.
            </p>
          </div>
          <RouteMap />
          <ol className="journey">
            {[
              ['Selected', 'At the grower, tree by tree, against your specification.'],
              ['Documented', 'Phytosanitary certification, import permits, customs.'],
              ['Acclimatised', 'Conditioned on arrival so it establishes, not struggles.'],
              ['Planted', 'Delivered with crane and offloading, planted if you want it.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <span className="j-num">{String(i + 1).padStart(2, '0')}</span>
                <strong>{t}</strong>
                <span className="j-d">{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── collections ───────────── */}
      <section className="section warm">
        <div className="wrap">
          <div className="head-row">
            <div>
              <p className="eyebrow">The catalogue</p>
              <h2>Six collections</h2>
            </div>
            <Link href="/catalog" className="btn btn-ghost">View all {all.length}</Link>
          </div>
          <div className="coll-grid">
            {families.map((f, i) => (
              <Link key={f.slug} href={`/collections/${f.slug}`}
                    className={`coll ${i === 0 ? 'coll-lead' : ''}`}>
                <Image src={`/products/${f.cover}`} alt="" fill
                       sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                <div className="coll-scrim" />
                <div className="coll-txt">
                  <h3>{f.name}</h3>
                  <p>{f.count} specimens</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── featured stock ───────────── */}
      <section className="section">
        <div className="wrap">
          <div className="head-row">
            <div>
              <p className="eyebrow">Selected stock</p>
              <h2>From the catalogue</h2>
            </div>
            <Link href="/catalog" className="btn btn-ghost">See everything</Link>
          </div>
          <div className="grid cols-4">
            {featured.map((p) => <ProductCard key={p.reference} p={p} />)}
          </div>
        </div>
      </section>

      {/* ───────────── photographic band ───────────── */}
      <section className="band-photo">
        <Image src={BAND_IMG} alt="" fill sizes="100vw" />
        <div className="band-veil" />
        <div className="wrap band-in">
          <blockquote>
            A three-metre olive tree is not a checkout purchase.
          </blockquote>
          <p>
            Two trees of the same nominal height differ completely in trunk girth, canopy
            and character — and so in price. Add freight, season, quantity and site access,
            and a fixed online price would be a fiction. So we quote.
          </p>
          <Link href="/quote" className="btn btn-light btn-lg">Start an enquiry</Link>
        </div>
      </section>

      {/* ───────────── who we supply ───────────── */}
      <section className="section warm">
        <div className="wrap">
          <p className="eyebrow">Who we supply</p>
          <h2>Built for projects.</h2>
          <ul className="segments">
            {site.projectTypes.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <div className="cta-row">
            <Link href="/quote?type=bulk" className="btn btn-primary">Request bulk pricing</Link>
            <Link href="/quote?type=sourcing" className="btn btn-ghost">Source a specific tree</Link>
          </div>
        </div>
      </section>

      {/* ───────────── coverage ───────────── */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">Coverage</p>
          <h2>Delivering across all seven emirates.</h2>
          <div className="emirates">
            {site.emirates.map((e) => (
              <Link key={e.slug} href={`/locations/${e.slug}`} className="em">{e.name}</Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* ── hero ── */
        .hero { position: relative; isolation: isolate; color: #FBF9F4; padding-block: clamp(96px, 16vw, 190px) 0; }
        .hero .hero-bg { object-fit: cover; z-index: -2; }
        .hero-veil {
          position: absolute; inset: 0; z-index: -1;
          background:
            linear-gradient(100deg, rgba(14,20,12,.90) 0%, rgba(14,20,12,.72) 42%, rgba(14,20,12,.28) 72%, rgba(14,20,12,.42) 100%),
            linear-gradient(to top, rgba(14,20,12,.88) 0%, transparent 46%);
        }
        .hero-in { position: relative; z-index: 2; }
        .hero h1 { color: #FFFDF8; margin-bottom: 1.1rem; max-width: 15ch; }
        .hero-kicker {
          font-size: .74rem; font-weight: 600; letter-spacing: .22em;
          text-transform: uppercase; color: var(--brass-300); margin-bottom: 1.4rem;
        }
        .hero-lede {
          font-size: clamp(1.02rem, 1.5vw, 1.2rem); line-height: 1.65;
          color: rgb(251 249 244 / .88); max-width: 56ch; margin-bottom: 2.2rem;
          text-shadow: 0 1px 12px rgb(14 20 12 / .5);
        }
        .hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
        .btn-lg { padding: 1em 2em; font-size: 1rem; }

        .trust {
          position: relative; z-index: 2;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 4px; list-style: none; margin: clamp(64px, 10vw, 128px) 0 0; padding: 0;
          background: rgb(14 20 12 / .55); backdrop-filter: blur(10px);
          border-top: 1px solid rgb(212 184 124 / .3);
        }
        .trust li { display: grid; gap: 2px; padding: 22px clamp(16px, 3vw, 32px); }
        .trust strong {
          font-family: var(--font-fraunces), serif; font-size: clamp(1.6rem, 3vw, 2.1rem);
          font-weight: 500; color: var(--brass-300); line-height: 1;
        }
        .trust span { font-size: .8rem; color: rgb(251 249 244 / .72); }

        /* ── sections ── */
        .warm { background: var(--sand-100); }

        .route-sec { background: var(--sand-50); }
        .route-head {
          display: grid; gap: 20px; align-items: end; margin-bottom: 40px;
        }
        .route-head h2 { margin-bottom: 0; }
        .route-note { color: var(--fg-soft); max-width: 46ch; margin: 0; font-size: .95rem; }

        .journey {
          display: grid; gap: 28px; list-style: none; margin: 48px 0 0; padding: 0;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          counter-reset: j;
        }
        .journey li { display: grid; gap: .3rem; padding-top: 18px; border-top: 2px solid var(--olive-700); }
        .j-num { font-size: .72rem; font-weight: 600; letter-spacing: .14em; color: var(--brass-600); }
        .journey strong { font-family: var(--font-fraunces), serif; font-size: 1.15rem; font-weight: 500; }
        .j-d { font-size: .9rem; color: var(--fg-soft); }

        .head-row {
          display: flex; flex-wrap: wrap; gap: 20px;
          align-items: flex-end; justify-content: space-between; margin-bottom: 36px;
        }
        .head-row h2 { margin-bottom: 0; }

        /* ── collections as photography ── */
        .coll-grid {
          display: grid; gap: 14px;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }
        .coll {
          position: relative; isolation: isolate; display: block;
          min-height: 260px; border-radius: var(--radius-lg); overflow: clip;
          text-decoration: none; color: #FBF9F4;
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .coll img { object-fit: cover; z-index: -2; transition: transform .6s cubic-bezier(.2,0,.2,1); }
        .coll:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .coll:hover img { transform: scale(1.06); }
        .coll-scrim {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to top, rgb(10 15 9 / .94) 0%, rgb(10 15 9 / .72) 34%, rgb(10 15 9 / .22) 68%, rgb(10 15 9 / .10) 100%);
        }
        .coll-txt { position: absolute; z-index: 2; inset: auto 0 0 0; padding: 22px; }
        .coll-txt h3 { color: #FFFDF8; margin: 0 0 .15rem; font-size: 1.35rem;
          text-shadow: 0 1px 10px rgb(10 15 9 / .7); }
        .coll-txt p {
          margin: 0; font-size: .72rem; letter-spacing: .13em;
          text-transform: uppercase; color: var(--brass-300);
        }
        .coll-lead { grid-column: span 2; min-height: 340px; }
        @media (max-width: 700px) { .coll-lead { grid-column: span 1; min-height: 260px; } }

        /* ── photographic band ── */
        .band-photo {
          position: relative; isolation: isolate; color: #FBF9F4;
          padding-block: clamp(72px, 11vw, 132px);
        }
        .band-photo img { object-fit: cover; z-index: -2; }
        .band-veil {
          position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(95deg, rgba(14,20,12,.92) 0%, rgba(14,20,12,.74) 50%, rgba(14,20,12,.34) 100%);
        }
        .band-in { position: relative; z-index: 2; max-width: 62ch; }
        .band-in blockquote {
          margin: 0 0 1.1rem; font-family: var(--font-fraunces), serif;
          font-size: clamp(1.6rem, 3.4vw, 2.6rem); line-height: 1.15;
          font-weight: 500; color: #FFFDF8; letter-spacing: -.015em;
        }
        .band-in p { color: rgb(251 249 244 / .82); margin-bottom: 1.9rem; }

        /* ── misc ── */
        .segments { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; margin: 28px 0; padding: 0; }
        .segments li {
          padding: .5em 1em; font-size: .88rem;
          background: #fff; border: 1px solid var(--line); border-radius: 999px;
        }
        .cta-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .emirates { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
        .em {
          padding: .65em 1.15em; font-size: .92rem; text-decoration: none;
          border: 1px solid var(--line); border-radius: var(--radius); background: #fff;
          transition: border-color .16s ease, color .16s ease;
        }
        .em:hover { border-color: var(--terra-500); color: var(--terra-700); }

        @media (min-width: 900px) {
          .route-head { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); }
        }
      `}</style>
    </>
  );
}
