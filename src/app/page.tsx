import Link from 'next/link';
import Image from 'next/image';
import RouteMap from '@/components/RouteMap';
import ProductCard from '@/components/ProductCard';
import { getSettings } from '@/lib/settings';
import { getAllProducts, getShowcaseProducts, getFamilies, imageFor } from '@/lib/products';

const HERO_REF = 'VG-OL-002';
const SPOT_REF = 'VG-OL-007';
const BAND_REF = 'VG-PL-017';
const HERO = imageFor(HERO_REF);
const SPOT = imageFor(SPOT_REF);
const BAND = imageFor(BAND_REF);

export default async function HomePage() {
  const site = await getSettings();
  const families = getFamilies();
  const all = getAllProducts();
  const showcase = getShowcaseProducts();
  const featured = [
    ...families.map((f) => showcase.find((p) => p.family === f.name)!).filter(Boolean),
    ...showcase.filter((p) => p.family === 'Olive Trees').slice(1, 3),
  ].slice(0, 8);
  const spotlight = showcase.find((p) => p.reference === SPOT_REF) ?? showcase[0];

  return (
    <>
      {/* ═══════════ hero ═══════════ */}
      <section className="hero">
        <div className="hero-media">
          <Image src={HERO} alt="" fill priority sizes="100vw" className="hero-img" />
        </div>
        <div className="hero-veil" />

        <div className="wrap hero-in">
          <p className="hero-kicker"><span>Italy</span><i /><span>United Arab Emirates</span></p>
          <h1>Ancient Italian&nbsp;olives.<br /><em>Planted in the Emirates.</em></h1>
          <p className="hero-lede">
            Specimen olive trees, palms and architectural plants — selected at the nursery in
            {' '}{site.sourcingRegions.join(', ')}, imported, acclimatised, and delivered to
            site across the UAE.
          </p>
          <div className="hero-cta">
            <Link href="/catalog" className="btn btn-light btn-lg">Browse {all.length} specimens</Link>
            <Link href="/quote" className="tlink hero-tlink">Request a quote</Link>
          </div>
        </div>

        <div className="wrap">
          <ul className="stats">
            {[[String(all.length), 'specimens catalogued'],
              ['04', 'Italian growing regions'],
              ['07', 'emirates covered'],
              [`${site.leadTimeWeeks.min}–${site.leadTimeWeeks.max}`, 'weeks lead time']].map(([n, l]) => (
              <li key={l}><strong>{n}</strong><span>{l}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════ the route ═══════════ */}
      <section className="section route-sec">
        <div className="wrap">
          <header className="route-head reveal">
            <div>
              <p className="eyebrow">Where they come from</p>
              <h2>Four Italian regions.<br />Seven emirates.</h2>
            </div>
            <p className="route-note">
              We buy at the grower, not from a middleman. Every consignment is inspected,
              documented for import, and acclimatised here before it reaches a site.
            </p>
          </header>

          <div className="map-panel reveal">
            <RouteMap />
            <ul className="legend">
              <li><i className="sw sw-it" />Growing regions</li>
              <li><i className="sw sw-ae" />Delivery market</li>
              <li><i className="sw sw-rt" />Sourcing route</li>
            </ul>
          </div>

          <ol className="journey">
            {[['Selected', 'At the grower, tree by tree, against your specification.'],
              ['Documented', 'Phytosanitary certification, import permits, customs clearance.'],
              ['Acclimatised', 'Conditioned on arrival so it establishes rather than struggles.'],
              ['Planted', 'Delivered with crane and offloading — planted if that is in scope.']]
              .map(([t, d], i) => (
              <li key={t} className="reveal">
                <span className="j-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══════════ spotlight: asymmetric, overlapping ═══════════ */}
      <section className="spotlight">
        <div className="wrap spot-in">
          <figure className="spot-img reveal">
            <Image src={SPOT} alt={spotlight.name} fill sizes="(max-width: 900px) 100vw, 62vw" />
          </figure>
          <div className="spot-txt reveal">
            <p className="eyebrow">Specimen</p>
            <h2>{spotlight.name}</h2>
            <p className="spot-desc">{spotlight.description}</p>
            <dl className="spot-dl">
              {Object.entries(spotlight.attributes).slice(0, 4).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <Link href={`/catalog/${spotlight.slug}`} className="btn btn-primary">
              View this specimen
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ collections ═══════════ */}
      <section className="section panel">
        <div className="wrap">
          <header className="head-row reveal">
            <div>
              <p className="eyebrow">The catalogue</p>
              <h2>Six collections</h2>
            </div>
            <Link href="/catalog" className="tlink">View all {all.length} specimens →</Link>
          </header>
          <div className="coll-grid">
            {families.map((f, i) => (
              <Link key={f.slug} href={`/collections/${f.slug}`}
                    className={`coll reveal ${i === 0 ? 'coll-lead' : ''}`}>
                <Image src={`/products/${f.cover}`} alt="" fill
                       sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                <span className="coll-scrim" />
                <span className="coll-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="coll-txt">
                  <span className="coll-h">{f.name}</span>
                  <span className="coll-n">{f.count} specimens</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ featured ═══════════ */}
      <section className="section">
        <div className="wrap">
          <header className="head-row reveal">
            <div>
              <p className="eyebrow">Selected stock</p>
              <h2>From the catalogue</h2>
            </div>
            <Link href="/catalog" className="tlink">See everything →</Link>
          </header>
          <div className="grid cols-4">
            {featured.map((p) => <ProductCard key={p.reference} p={p} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ statement band ═══════════ */}
      <section className="band">
        <div className="band-media"><Image src={BAND} alt="" fill sizes="100vw" /></div>
        <div className="band-veil" />
        <div className="wrap band-in">
          <p className="eyebrow band-eyebrow">Why we quote</p>
          <blockquote>A three-metre olive tree is not a checkout purchase.</blockquote>
          <p className="band-p">
            Two trees of the same nominal height differ completely in trunk girth, canopy and
            character — and so in price. Add freight, season, quantity and site access, and a
            fixed online price would be a fiction.
          </p>
          <Link href="/quote" className="btn btn-light btn-lg">Start an enquiry</Link>
        </div>
      </section>

      {/* ═══════════ who + coverage ═══════════ */}
      <section className="section">
        <div className="wrap two-col">
          <div className="reveal">
            <p className="eyebrow">Who we supply</p>
            <h2>Built for projects.</h2>
            <ul className="chips">
              {site.projectTypes.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="cta-row">
              <Link href="/quote?type=bulk" className="btn btn-primary">Request bulk pricing</Link>
              <Link href="/quote?type=sourcing" className="btn btn-ghost">Source a specific tree</Link>
            </div>
          </div>
          <div className="reveal">
            <p className="eyebrow">Coverage</p>
            <h2>All seven emirates.</h2>
            <ul className="em-list">
              {site.emirates.map((e, i) => (
                <li key={e.slug}>
                  <Link href={`/locations/${e.slug}`}>
                    <span className="em-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="em-name">{e.name}</span>
                    <span className="em-arrow">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <style>{`
        /* ── hero ── */
        .hero {
          position: relative; isolation: isolate; color: #FBF9F4;
          min-height: min(92vh, 900px);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-top: clamp(80px, 14vw, 170px);
        }
        .hero-media { position: absolute; inset: 0; z-index: -2; overflow: hidden; }
        .hero-img { object-fit: cover; }
        @media (prefers-reduced-motion: no-preference) {
          .hero-img { animation: kenburns 26s ease-out both; }
          @keyframes kenburns {
            from { transform: scale(1.0) translate3d(0,0,0); }
            to   { transform: scale(1.09) translate3d(-1.5%, -1%, 0); }
          }
        }
        .hero-veil {
          position: absolute; inset: 0; z-index: -1;
          background:
            linear-gradient(97deg, rgba(10,14,8,.94) 0%, rgba(10,14,8,.80) 38%, rgba(10,14,8,.34) 68%, rgba(10,14,8,.52) 100%),
            linear-gradient(to top, rgba(10,14,8,.94) 0%, rgba(10,14,8,.12) 40%);
        }
        .hero-in { position: relative; z-index: 2; padding-bottom: clamp(48px, 7vw, 84px); }
        .hero h1 { color: #FFFDF8; max-width: 16ch; margin-bottom: .55em; }
        .hero h1 em {
          font-style: italic; color: var(--brass-300);
          font-variation-settings: 'SOFT' 40, 'WONK' 1;
        }
        .hero-kicker {
          display: flex; align-items: center; gap: .9em;
          font-size: .72rem; font-weight: 600; letter-spacing: .26em;
          text-transform: uppercase; color: var(--brass-300); margin-bottom: 1.8rem;
        }
        .hero-kicker i { width: 46px; height: 1px; background: currentColor; opacity: .6; }
        .hero-lede {
          font-family: var(--font-display); font-size: clamp(1.08rem, 1.7vw, 1.38rem);
          line-height: 1.5; color: rgb(251 249 244 / .9); max-width: 44ch;
          margin-bottom: 2.4rem; text-shadow: 0 1px 16px rgb(10 14 8 / .55);
        }
        .hero-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; }
        .hero-tlink { color: #FFFDF8; }

        .stats {
          position: relative; z-index: 2;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          list-style: none; margin: 0; padding: 0;
          border-top: 1px solid rgb(210 179 124 / .32);
        }
        .stats li {
          display: grid; gap: 4px; padding: 26px clamp(14px, 2.4vw, 30px) 30px;
          border-right: 1px solid rgb(210 179 124 / .16);
        }
        .stats li:first-child { padding-left: 0; }
        .stats li:last-child { border-right: 0; }
        .stats strong {
          font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 450; color: var(--brass-300); line-height: 1;
          font-variant-numeric: tabular-nums; letter-spacing: -.03em;
        }
        .stats span { font-size: .78rem; letter-spacing: .05em; color: rgb(251 249 244 / .68); }

        /* ── route ── */
        .route-sec { background: var(--bg-warm); }
        .route-head { display: grid; gap: 28px; align-items: end; margin-bottom: 52px; }
        .route-head h2 { margin-bottom: 0; }
        .route-note { color: var(--fg-soft); max-width: 42ch; margin: 0; font-size: .96rem; }

        .map-panel {
          position: relative; padding: clamp(14px, 2.4vw, 30px);
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius-lg); box-shadow: var(--shadow-lift);
        }
        .legend {
          display: flex; flex-wrap: wrap; gap: 26px; list-style: none;
          margin: 18px 0 0; padding: 16px 4px 2px; border-top: 1px solid var(--line-soft);
          font-size: .74rem; letter-spacing: .1em; text-transform: uppercase; color: var(--fg-mute);
        }
        .legend li { display: flex; align-items: center; gap: .6em; }
        .sw { width: 22px; height: 9px; border-radius: 2px; display: inline-block; }
        .sw-it { background: #3C6033; }
        .sw-ae { background: #B8873C; }
        .sw-rt { background: repeating-linear-gradient(90deg, var(--brass-500) 0 5px, transparent 5px 9px); height: 3px; }

        .journey {
          display: grid; gap: clamp(24px, 3vw, 40px); list-style: none;
          margin: clamp(48px, 7vw, 84px) 0 0; padding: 0;
          grid-template-columns: repeat(auto-fit, minmax(212px, 1fr));
        }
        .journey li { padding-top: 20px; border-top: 1px solid var(--olive-700); }
        .journey h3 { margin: .3rem 0 .35rem; font-size: 1.28rem; }
        .journey p { font-size: .9rem; color: var(--fg-soft); margin: 0; }
        .j-num {
          font-family: var(--font-display); font-size: .92rem;
          color: var(--terra-500); letter-spacing: .06em;
        }

        /* ── spotlight ── */
        .spotlight { padding-block: clamp(72px, 11vw, 150px); background: var(--bg); }
        .spot-in { display: grid; gap: clamp(28px, 4vw, 0px); align-items: center; }
        .spot-img {
          position: relative; margin: 0; aspect-ratio: 5 / 4;
          border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-deep);
        }
        .spot-img img { object-fit: cover; }
        .spot-txt {
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius-lg); padding: clamp(26px, 3.4vw, 44px);
        }
        .spot-desc { color: var(--fg-soft); font-size: .98rem; }
        .spot-dl { display: grid; margin: 1.6rem 0 2rem; }
        .spot-dl > div {
          display: flex; justify-content: space-between; gap: 1rem;
          padding: .6rem 0; border-top: 1px solid var(--line-soft); font-size: .86rem;
        }
        .spot-dl dt { color: var(--fg-mute); }
        .spot-dl dd { margin: 0; font-weight: 500; }

        @media (min-width: 900px) {
          .route-head { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); }
          .spot-in { grid-template-columns: minmax(0, 1.28fr) minmax(0, .92fr); }
          .spot-img { aspect-ratio: 4 / 3.2; }
          .spot-txt { margin-left: -14%; position: relative; z-index: 2; box-shadow: var(--shadow-lift); }
        }

        /* ── collections ── */
        .panel { background: var(--bg-panel); }
        .head-row {
          display: flex; flex-wrap: wrap; gap: 20px;
          align-items: flex-end; justify-content: space-between; margin-bottom: 44px;
        }
        .head-row h2 { margin-bottom: 0; }

        .coll-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(262px, 1fr)); }
        .coll {
          position: relative; isolation: isolate; display: block; min-height: 300px;
          border-radius: var(--radius-lg); overflow: clip; text-decoration: none; color: #FBF9F4;
          transition: transform .45s var(--ease), box-shadow .45s var(--ease);
        }
        .coll img { object-fit: cover; z-index: 0; transition: transform .9s var(--ease); }
        .coll:hover { transform: translateY(-4px); box-shadow: var(--shadow-deep); }
        .coll:hover img { transform: scale(1.07); }
        .coll-scrim {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to top, rgb(8 12 7 / .95) 0%, rgb(8 12 7 / .7) 32%, rgb(8 12 7 / .16) 70%, rgb(8 12 7 / .06) 100%);
        }
        .coll-idx {
          position: absolute; z-index: 2; top: 18px; right: 20px;
          font-family: var(--font-display); font-size: .92rem; color: var(--brass-300); opacity: .85;
        }
        .coll-txt { position: absolute; z-index: 2; inset: auto 0 0 0; padding: 24px; display: grid; gap: 4px; }
        .coll-h {
          font-family: var(--font-display); font-size: 1.45rem; font-weight: 450;
          letter-spacing: -.02em; color: #FFFDF8; text-shadow: 0 1px 12px rgb(8 12 7 / .8);
        }
        .coll-n { font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; color: var(--brass-300); }
        .coll-lead { grid-column: span 2; min-height: 392px; }
        @media (max-width: 760px) { .coll-lead { grid-column: span 1; min-height: 300px; } }

        /* ── band ── */
        .band { position: relative; isolation: isolate; color: #FBF9F4; padding-block: clamp(84px, 13vw, 160px); }
        .band-media { position: absolute; inset: 0; z-index: -2; overflow: hidden; }
        .band-media img { object-fit: cover; }
        .band-veil {
          position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(94deg, rgba(10,14,8,.95) 0%, rgba(10,14,8,.82) 46%, rgba(10,14,8,.36) 100%);
        }
        .band-in { position: relative; z-index: 2; max-width: 58ch; }
        .band-eyebrow { color: var(--brass-300); }
        .band blockquote {
          margin: 0 0 1.2rem; font-family: var(--font-display);
          font-size: clamp(1.9rem, 4.4vw, 3.2rem); line-height: 1.08; font-weight: 450;
          color: #FFFDF8; letter-spacing: -.03em;
        }
        .band-p { color: rgb(251 249 244 / .82); margin-bottom: 2.1rem; }

        /* ── who + coverage ── */
        .two-col { display: grid; gap: clamp(48px, 6vw, 88px); }
        @media (min-width: 900px) { .two-col { grid-template-columns: 1fr 1fr; } }

        .chips { display: flex; flex-wrap: wrap; gap: 9px; list-style: none; margin: 0 0 2rem; padding: 0; }
        .chips li {
          padding: .5em 1em; font-size: .84rem;
          background: var(--sand-50); border: 1px solid var(--line-soft); border-radius: 999px;
        }
        .cta-row { display: flex; flex-wrap: wrap; gap: 12px; }

        .em-list { list-style: none; margin: 0; padding: 0; }
        .em-list a {
          display: grid; grid-template-columns: 2.6rem 1fr auto; align-items: center; gap: 1rem;
          padding: .95rem 0; border-top: 1px solid var(--line-soft);
          text-decoration: none; transition: color .22s var(--ease), padding .28s var(--ease);
        }
        .em-list li:last-child a { border-bottom: 1px solid var(--line-soft); }
        .em-list a:hover { color: var(--terra-700); padding-inline: .5rem; }
        .em-n { font-family: var(--font-display); font-size: .86rem; color: var(--terra-500); }
        .em-name { font-size: 1.05rem; }
        .em-arrow { opacity: 0; transition: opacity .25s var(--ease), transform .25s var(--ease); transform: translateX(-6px); }
        .em-list a:hover .em-arrow { opacity: 1; transform: none; }
      `}</style>
    </>
  );
}
