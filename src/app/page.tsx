import Link from 'next/link';
import Image from 'next/image';
import RouteMap from '@/components/RouteMap';
import ProductCard from '@/components/ProductCard';
import { site } from '@/lib/site';
import { getAllProducts, getShowcaseProducts, getFamilies } from '@/lib/products';

export default function HomePage() {
  const families = getFamilies();
  const all = getAllProducts();
  const showcase = getShowcaseProducts();
  // one representative from each family, then fill up to eight
  const featured = [
    ...families.map((f) => showcase.find((p) => p.family === f.name)!).filter(Boolean),
    ...showcase.filter((p) => p.family === 'Olive Trees').slice(1, 3),
  ].slice(0, 8);

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">Italy → United Arab Emirates</p>
            <h1>
              Italian trees.<br />
              Delivered across<br />
              the Emirates.
            </h1>
            <p className="hero-lede">
              We import specimen olive trees, palms and architectural plants direct from
              nurseries in {site.sourcingRegions.slice(0, 3).join(', ')} — for landscaping
              contractors, developers, hotels and private estates throughout the UAE.
            </p>
            <div className="hero-cta">
              <Link href="/catalog" className="btn btn-primary">Browse the catalogue</Link>
              <Link href="/quote" className="btn btn-light">Request a quote</Link>
            </div>
          </div>

          <div className="hero-map">
            <RouteMap />
          </div>
        </div>

        <div className="wrap">
          <ul className="trust">
            <li><strong>{all.length}</strong><span>specimens catalogued</span></li>
            <li><strong>{site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} wks</strong><span>typical lead time</span></li>
            <li><strong>7</strong><span>emirates covered</span></li>
            <li><strong>Direct</strong><span>from Italian nurseries</span></li>
          </ul>
        </div>
      </section>

      {/* ---------------- what we do ---------------- */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">What we do</p>
          <h2>Sourcing, import and delivery — handled end to end.</h2>
          <p className="lede">
            Trees are living stock, not freight. Every consignment is selected at the
            nursery, documented for import, acclimatised on arrival and delivered to site
            with the right equipment.
          </p>

          <div className="grid cols-2 pillars">
            {[
              ['Direct nursery sourcing',
               `Selected in person from growers across ${site.sourcingRegions.join(', ')} — not resold from a middleman.`],
              ['Import & documentation',
               'Phytosanitary certification, import permits and customs clearance handled as part of the supply.'],
              ['Acclimatisation',
               'Stock is held and conditioned on arrival before it goes to site, so trees establish rather than struggle.'],
              ['Delivery & planting',
               'Supply only, supply and delivery, or full supply, delivery and planting — including crane and offloading.'],
            ].map(([t, d]) => (
              <article key={t} className="pillar">
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- collections ---------------- */}
      <section className="section band">
        <div className="wrap">
          <div className="head-row">
            <div>
              <p className="eyebrow">The catalogue</p>
              <h2>Collections</h2>
            </div>
            <Link href="/catalog" className="btn btn-ghost">View all {all.length} specimens</Link>
          </div>

          <div className="grid cols-3 coll">
            {families.map((f) => (
              <Link key={f.slug} href={`/collections/${f.slug}`} className="coll-card">
                <div className="coll-img">
                  <Image src={`/products/${f.cover}`} alt="" width={1388} height={861}
                         sizes="(max-width: 640px) 100vw, 380px" />
                </div>
                <div className="coll-body">
                  <h3>{f.name}</h3>
                  <p className="coll-count">{f.count} specimens</p>
                  <p className="coll-blurb">{f.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- featured ---------------- */}
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
            {featured.map((p, i) => <ProductCard key={p.reference} p={p} priority={i < 4} />)}
          </div>
        </div>
      </section>

      {/* ---------------- who we supply ---------------- */}
      <section className="section band">
        <div className="wrap">
          <p className="eyebrow">Who we supply</p>
          <h2>Built for projects, not shopping baskets.</h2>
          <p className="lede">
            Every enquiry becomes a quotation — priced to your species, size, quantity,
            site and delivery window. There is no checkout, because a 3-metre olive tree
            is not a checkout purchase.
          </p>
          <ul className="segments">
            {site.projectTypes.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <div className="cta-row">
            <Link href="/quote?type=bulk" className="btn btn-primary">Request bulk pricing</Link>
            <Link href="/quote?type=sourcing" className="btn btn-ghost">Source a specific tree</Link>
          </div>
        </div>
      </section>

      {/* ---------------- coverage ---------------- */}
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

      {/* ---------------- closing cta ---------------- */}
      <section className="closing">
        <div className="wrap closing-in">
          <div>
            <h2>Tell us what the project needs.</h2>
            <p className="lede closing-lede">
              Send the species, sizes, quantities and the site — we will come back with
              availability, lead time and a priced quotation.
            </p>
          </div>
          <Link href="/quote" className="btn btn-light closing-btn">Request a quote</Link>
        </div>
      </section>

      <style>{`
        .hero {
          background:
            radial-gradient(1100px 520px at 82% 8%, rgba(176,141,79,.14), transparent 62%),
            linear-gradient(170deg, var(--olive-900) 0%, var(--olive-950) 100%);
          color: #FBF9F4;
          padding-block: clamp(48px, 7vw, 88px) 0;
        }
        .hero-in {
          display: grid; gap: clamp(32px, 5vw, 56px);
          grid-template-columns: 1fr;
          align-items: center;
        }
        .hero h1 { color: #FBF9F4; margin-bottom: 1.1rem; }
        .hero-eyebrow { color: var(--brass-300); }
        .hero-lede {
          font-size: clamp(1.02rem, 1.5vw, 1.18rem);
          color: rgb(251 249 244 / .78); max-width: 54ch; margin-bottom: 2rem;
        }
        .hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
        .hero-map { min-width: 0; }

        .trust {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px; list-style: none; margin: clamp(40px, 6vw, 72px) 0 0; padding: 28px 0;
          border-top: 1px solid rgb(251 249 244 / .14);
        }
        .trust li { display: grid; gap: 2px; }
        .trust strong {
          font-family: var(--font-fraunces), serif; font-size: 1.6rem;
          font-weight: 500; color: var(--brass-300);
        }
        .trust span { font-size: .8rem; color: rgb(251 249 244 / .6); letter-spacing: .02em; }

        .band { background: var(--sand-100); }

        .head-row {
          display: flex; flex-wrap: wrap; gap: 20px;
          align-items: flex-end; justify-content: space-between; margin-bottom: 40px;
        }
        .head-row h2 { margin-bottom: 0; }

        .pillars { margin-top: 48px; }
        .pillar { padding-top: 22px; border-top: 2px solid var(--olive-700); }
        .pillar h3 { font-size: 1.15rem; margin-bottom: .45rem; }
        .pillar p { color: var(--fg-soft); font-size: .93rem; margin: 0; }

        .coll-card {
          display: block; text-decoration: none; color: inherit;
          background: var(--bg-raised); border: 1px solid var(--line);
          border-radius: var(--radius-lg); overflow: hidden;
          transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease;
        }
        .coll-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--olive-400); }
        .coll-img { aspect-ratio: 16 / 10; overflow: hidden; background: var(--sand-200); }
        .coll-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s cubic-bezier(.2,0,.2,1); }
        .coll-card:hover .coll-img img { transform: scale(1.05); }
        .coll-body { padding: 20px; }
        .coll-body h3 { margin-bottom: .1rem; }
        .coll-count {
          font-size: .7rem; letter-spacing: .12em; text-transform: uppercase;
          color: var(--brass-600); margin-bottom: .6rem;
        }
        .coll-blurb { font-size: .9rem; color: var(--fg-soft); margin: 0; }

        .segments {
          display: flex; flex-wrap: wrap; gap: 10px;
          list-style: none; margin: 32px 0; padding: 0;
        }
        .segments li {
          padding: .5em 1em; font-size: .88rem;
          background: var(--bg-raised); border: 1px solid var(--line); border-radius: 999px;
        }
        .cta-row { display: flex; flex-wrap: wrap; gap: 12px; }

        .emirates { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
        .em {
          padding: .65em 1.15em; font-size: .92rem; text-decoration: none;
          border: 1px solid var(--line); border-radius: var(--radius);
          background: var(--bg-raised);
          transition: border-color .16s ease, color .16s ease;
        }
        .em:hover { border-color: var(--olive-700); color: var(--olive-700); }

        .closing { background: var(--olive-900); color: #FBF9F4; padding-block: clamp(56px, 7vw, 88px); }
        .closing h2 { color: #FBF9F4; }
        .closing-lede { color: rgb(251 249 244 / .75); margin-bottom: 0; }
        .closing-in {
          display: flex; flex-wrap: wrap; gap: 28px;
          align-items: center; justify-content: space-between;
        }
        .closing-btn { flex-shrink: 0; }

        @media (min-width: 960px) {
          .hero-in { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); }
        }
      `}</style>
    </>
  );
}
