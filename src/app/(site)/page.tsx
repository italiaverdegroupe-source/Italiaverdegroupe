import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import RouteMap from '@/components/RouteMap';
import ProductCard from '@/components/ProductCard';
import { getSettings } from '@/lib/settings';
import { getBlocks, fill, publishedFaqs, publishedTestimonials, getSeo } from '@/lib/content';
import { getAllProducts, getShowcaseProducts, getFamilies, imageFor } from '@/lib/products';

// Chosen by looking at all forty-four verified tree photographs cropped to
// this column, not by picking one from a filename: a sculptural olive as the
// centrepiece of a finished garden — a pool, lawn, white gravel — which is the
// thing the company actually sells. Most of the catalogue is nursery rows and
// warehouse floors, and a landscape frame cropped tall becomes a wall of
// leaves.
const HERO_REF = 'VG-OL-012';
const SPOT_REF = 'VG-OL-002';
const BAND_REF = 'VG-PL-017';
const HERO = imageFor(HERO_REF);
const SPOT = imageFor(SPOT_REF);
const BAND = imageFor(BAND_REF);

/**
 * The homepage title is assembled from the live settings rather than pinned,
 * so renaming the company in the console renames it in search too. A stored
 * override wins over both.
 */
/**
 * Revalidated on a timer as well as on demand.
 *
 * Editing in the console revalidates this page immediately, so a correction is
 * live at once. The timer is for the other case: a deploy whose build could
 * not reach the database bakes the compiled defaults, and without a window
 * the FAQs and testimonials someone added last week would quietly vanish
 * until the next edit. Five minutes means the page heals itself instead.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([getSettings(), getSeo('/')]);
  const title = seo?.title ?? `${site.legalName} — ${site.tagline}`;
  const description = seo?.description ?? site.description;
  return {
    title, description,
    alternates: { canonical: '/' },
    ...(seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description },
  };
}

export default async function HomePage() {
  const site = await getSettings();
  const [c, faqs, voices] = await Promise.all([
    getBlocks(), publishedFaqs(), publishedTestimonials(),
  ]);
  const families = getFamilies();
  const all = getAllProducts();
  const showcase = getShowcaseProducts();
  const featured = [
    ...families.map((f) => showcase.find((p) => p.family === f.name)!).filter(Boolean),
    ...showcase.filter((p) => p.family === 'Olive Trees').slice(1, 3),
  ].slice(0, 8);
  const spotlight = showcase.find((p) => p.reference === SPOT_REF) ?? showcase[0];
  // Olives are the line the company is built on. families[0] is whichever
  // family happens to sort first, which put Agaves in the hero.
  const heroFamily = families.find((f) => /olive/i.test(f.name)) ?? families[0];

  return (
    <>
      {/* ═══════════ hero ═══════════
          ONE photograph with the words over it, not two rectangles side by
          side. The first build split the viewport down the middle and the hard
          vertical seam is what made it read as a template: the eye sees two
          unrelated panels instead of one image. Here the photograph runs the
          full width and a travertine wash fades across it from the left, so
          the copy sits on a surface that belongs to the same picture. */}
      <section className="hero">
        <div className="hero-media">
          <Image src={HERO} alt="" fill priority sizes="100vw" className="hero-img" />
        </div>
        <div className="hero-veil" />

        <div className="wrap hero-in">
          <p className="eyebrow">{c['home.hero.eyebrow']}</p>
          <h1>{c['home.hero.title']}<br /><em>{c['home.hero.title.em']}</em></h1>
          <p className="hero-lede">
            {fill(c['home.hero.lede'], { regions: site.sourcingRegions.join(', ') })}
          </p>
          <div className="hero-cta">
            <Link href="/catalog" className="btn btn-primary btn-lg">
              {c['home.hero.cta']} <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/quote" className="btn btn-ghost btn-lg">{c['home.hero.cta.two']}</Link>
          </div>
        </div>

        {/* A seal, not a claim about anybody else: it says where the trees come
            from, which is the one thing this company can vouch for. */}
        <span className="hero-seal" aria-hidden="true">
          <span className="hero-seal-in">
            <b>{c['home.badge.top']}</b>
            <strong>{c['home.badge.mid']}</strong>
            <b>{c['home.badge.low']}</b>
            <i className="hero-seal-flag" />
          </span>
        </span>

        <Link href={`/collections/${heroFamily.slug}`} className="hero-feat">
          <span className="hero-feat-img">
            <Image src={`/products/${heroFamily.cover}`} alt="" fill sizes="160px" />
          </span>
          <span className="hero-feat-txt">
            <span className="hero-feat-eyebrow">{c['home.featured.eyebrow']}</span>
            <span className="hero-feat-name">{heroFamily.name}</span>
            <span className="hero-feat-note">{c['home.featured.note']}</span>
          </span>
          <span className="hero-feat-go" aria-hidden="true">&rarr;</span>
        </Link>

        <div className="hero-assure-bar">
          <div className="wrap">
            <ul className="hero-assure">
              {([
                [c['home.feature.1'], 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2c2.5 2.7 3.8 6.1 3.8 10S14.5 19.3 12 22c-2.5-2.7-3.8-6.1-3.8-10S9.5 4.7 12 2'],
                [c['home.feature.2'], 'M12 21V11M12 12c0-4.4 3.1-8 7-8 .4 3.9-2.4 8-7 8M12 16c-3.4 0-6-2.8-6-6.2 3 .3 6 2.9 6 6.2'],
                [c['home.feature.3'], 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6M17.5 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6'],
                [c['home.feature.4'], 'M12 3l7.5 3v5.3c0 4.3-3 8.3-7.5 9.7-4.5-1.4-7.5-5.4-7.5-9.7V6zM9 12l2.2 2.2L15.3 10'],
              ] as [string, string][]).map(([label, d]) => (
                <li key={label}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                       strokeLinejoin="round" aria-hidden="true">
                    <path d={d} />
                  </svg>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════ what we can actually prove ═══════════
          This is where a "trusted by" row of client logos would go. There are
          no clients yet, and borrowing the logos of UAE developers the company
          has never worked with would be a false endorsement, a trademark
          matter, and — since those are exactly the people it wants to sell to —
          the fastest way to lose them. These are facts instead, every one of
          them checkable today, and three of the four count themselves. */}
      <section className="proof">
        <div className="wrap">
          <ul className="proof-list">
            {[[String(all.length), 'specimens catalogued'],
              [String(site.sourcingRegions.length), 'Italian growing regions'],
              // "emirates covered" would have read 8, because the list is the
              // seven emirates plus Al Ain — a city in Abu Dhabi, not an
              // emirate. On a strip whose whole point is that every number can
              // be checked, that is the one error that cannot be there.
              [String(site.emirates.length), 'UAE delivery locations'],
              [`${site.leadTimeWeeks.min}–${site.leadTimeWeeks.max}`, 'weeks, order to site']]
              .map(([n, l]) => (
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
              <p className="eyebrow">{c['home.route.eyebrow']}</p>
              <h2>{c['home.route.title']}<br />{c['home.route.title.two']}</h2>
            </div>
            <p className="route-note">{c['home.route.note']}</p>
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
          <p className="eyebrow band-eyebrow">{c['home.band.eyebrow']}</p>
          <blockquote>{c['home.band.quote']}</blockquote>
          <p className="band-p">{c['home.band.body']}</p>
          <Link href="/quote" className="btn btn-light btn-lg">{c['home.band.cta']}</Link>
        </div>
      </section>

      {/* ═══════════ who + coverage ═══════════ */}
      <section className="section">
        <div className="wrap two-col">
          <div className="reveal">
            <p className="eyebrow">Who we supply</p>
            <h2>{c['home.who.title']}</h2>
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
            <h2>{c['home.coverage.title']}</h2>
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

      {/* ═══════════ testimonials ═══════════
          Rendered only when a real, consented testimonial exists. An empty
          section with placeholder praise would be worse than no section. */}
      {voices.length > 0 && (
        <section className="section panel">
          <div className="wrap">
            <header className="head-row reveal">
              <div>
                <p className="eyebrow">Clients</p>
                <h2>{c['testimonials.title']}</h2>
              </div>
            </header>
            <div className="voices">
              {voices.map((v) => (
                <figure key={v.id} className="voice reveal">
                  <blockquote>{v.body}</blockquote>
                  <figcaption>
                    <span className="voice-who">{v.author_name}</span>
                    <span className="voice-org">
                      {[v.author_role, v.company].filter(Boolean).join(', ')}
                    </span>
                    {(v.project || v.emirate) && (
                      <span className="voice-proj">
                        {[v.project, v.emirate].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ questions ═══════════ */}
      {faqs.length > 0 && (
        <section className="section">
          <div className="wrap">
            <header className="head-row reveal">
              <div>
                <p className="eyebrow">Before you enquire</p>
                <h2>{c['faq.title']}</h2>
              </div>
              <p className="route-note">{c['faq.intro']}</p>
            </header>
            <div className="faqs">
              {faqs.map((f) => (
                <details key={f.id} className="faq reveal">
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
          {/* Structured data, so these can answer the question in the search
              result itself rather than only on the page. */}
          <script type="application/ld+json" suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            }) }} />
        </section>
      )}

      <style>{`
        /* ── hero ──
           One photograph, full bleed, with a travertine wash drawn across it
           from the left. The header sits over the top of it rather than on a
           bar of its own, so the picture starts at the very top of the page. */
        .hero {
          position: relative; isolation: isolate;
          min-height: min(94vh, 940px);
          display: flex; flex-direction: column; justify-content: center;
          /* Pulled up under the sticky header so the photograph starts at the
             top of the page. Without this the bar sits in the flow and leaves
             a band of travertine above the picture. */
          margin-top: calc(-1 * var(--hdr-h));
          padding-top: calc(var(--hdr-h) + clamp(40px, 8vh, 92px));
          padding-bottom: clamp(120px, 15vh, 190px);
          background: var(--sand-50);
          overflow: hidden;
        }
        .hero-media { position: absolute; inset: 0; z-index: -2; }
        .hero-img {
          object-fit: cover; object-position: 62% 48%;
          /* The catalogue photographs are supplier snapshots in flat light.
             A little warmth and contrast is grading, not deception — the tree
             is the tree. */
          filter: saturate(1.06) contrast(1.06) brightness(1.02);
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-img { animation: kenburns 38s ease-out both; }
          @keyframes kenburns { from { transform: scale(1.03); } to { transform: scale(1.1); } }
        }

        .hero-veil {
          position: absolute; inset: 0; z-index: -1;
          background:
            /* The wash. Opaque where the words are, gone by two thirds across,
               with no hard edge anywhere — the seam is what made the first
               attempt look like a template. */
            linear-gradient(97deg,
              rgb(250 247 240 / .985) 0%,
              rgb(250 247 240 / .96) 26%,
              rgb(250 247 240 / .78) 42%,
              rgb(250 247 240 / .26) 58%,
              rgb(250 247 240 / .04) 72%,
              rgb(250 247 240 / 0) 84%),
            /* a breath of warmth into the sky, which is blown out in the source */
            linear-gradient(to bottom, rgb(239 226 198 / .34) 0%, rgb(239 226 198 / 0) 34%),
            linear-gradient(to top, rgb(250 247 240 / .5) 0%, rgb(250 247 240 / 0) 26%);
        }

        .hero-in { position: relative; z-index: 2; width: 100%; }
        .hero h1 {
          font-size: clamp(2.9rem, 6.4vw, 5.2rem);
          line-height: .98; letter-spacing: -.04em;
          margin: 0 0 .42em; color: var(--olive-950); max-width: 13ch;
        }
        .hero h1 em {
          font-style: italic; color: var(--olive-800);
          font-variation-settings: 'SOFT' 40, 'WONK' 1;
        }
        .hero-lede {
          font-size: clamp(1.02rem, 1.3vw, 1.18rem); line-height: 1.62;
          color: var(--fg-soft); max-width: 44ch; margin: 0 0 2.4rem;
        }
        .hero-cta { display: flex; flex-wrap: wrap; gap: 14px; }

        /* the seal */
        .hero-seal {
          position: absolute; z-index: 2;
          top: clamp(96px, 13vh, 168px); right: clamp(20px, 4vw, 72px);
          width: clamp(104px, 10.5vw, 146px); aspect-ratio: 1; border-radius: 50%;
          display: grid; place-items: center; text-align: center;
          background: rgb(23 32 15 / .9);
          -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
          box-shadow: 0 14px 40px -14px rgb(10 14 8 / .6);
        }
        /* the inset hairline ring, which is most of why the seal reads as a seal */
        .hero-seal::after {
          content: ''; position: absolute; inset: 7px; border-radius: 50%;
          border: 1px solid rgb(210 179 124 / .62);
        }
        .hero-seal-in { display: grid; gap: 2px; color: var(--brass-100); line-height: 1.25; }
        .hero-seal b, .hero-seal strong {
          font-weight: 500; font-size: clamp(.48rem, .58vw, .56rem);
          letter-spacing: .22em; text-transform: uppercase;
        }
        .hero-seal strong {
          font-family: var(--font-fraunces), serif; font-size: clamp(.78rem, .95vw, .95rem);
          letter-spacing: .1em; color: #FFFDF8; text-transform: uppercase;
        }
        .hero-seal-flag {
          justify-self: center; margin-top: 6px; width: 21px; height: 14px; border-radius: 1px;
          background: linear-gradient(90deg, #167E3C 0 33.3%, #F3F1EA 33.3% 66.6%, #B4232C 66.6% 100%);
        }

        /* the floating collection card */
        .hero-feat {
          position: absolute; z-index: 3;
          right: clamp(16px, 3vw, 56px); bottom: clamp(104px, 13vh, 150px);
          display: flex; align-items: center; gap: 16px;
          max-width: min(430px, calc(100% - 32px));
          padding: 12px 18px 12px 12px; border-radius: 4px; text-decoration: none;
          background: rgb(252 250 245 / .94);
          -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
          box-shadow: 0 24px 60px -26px rgb(10 14 8 / .7);
          transition: transform .3s var(--ease);
        }
        .hero-feat:hover { transform: translateY(-3px); }
        .hero-feat-img {
          position: relative; flex: none; width: 96px; height: 68px;
          border-radius: 2px; overflow: hidden; background: var(--bg-warm);
        }
        .hero-feat-img img { object-fit: cover; }
        .hero-feat-txt { display: grid; gap: 3px; min-width: 0; }
        .hero-feat-eyebrow {
          font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: var(--ink-400);
        }
        .hero-feat-name {
          font-family: var(--font-fraunces), serif; font-size: 1.06rem; color: var(--olive-950);
        }
        .hero-feat-note {
          font-size: .78rem; color: var(--fg-soft);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .hero-feat-go {
          flex: none; display: grid; place-items: center;
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid var(--line); color: var(--olive-700); font-size: .92rem;
        }

        /* the assurances, one row along the foot of the picture */
        .hero-assure-bar {
          position: absolute; z-index: 2; left: 0; right: 0; bottom: 0;
          background: rgb(250 247 240 / .82);
          -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
          border-top: 1px solid rgb(255 255 255 / .6);
        }
        .hero-assure {
          display: grid; gap: 14px 28px; list-style: none; margin: 0; padding: 20px 0;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .hero-assure li { display: flex; align-items: center; gap: 11px; }
        .hero-assure svg { color: var(--olive-600); flex: none; }
        .hero-assure span { font-size: .82rem; line-height: 1.35; color: var(--fg-soft); }

        @media (max-width: 1100px) {
          .hero-feat { display: none; }
        }
        @media (max-width: 860px) {
          .hero { min-height: auto; padding-bottom: clamp(150px, 22vh, 210px); }
          .hero h1 { max-width: 16ch; }
          .hero-veil {
            background:
              linear-gradient(to right, rgb(250 247 240 / .985) 0%, rgb(250 247 240 / .93) 55%, rgb(250 247 240 / .62) 100%),
              linear-gradient(to top, rgb(250 247 240 / .7) 0%, rgb(250 247 240 / 0) 34%);
          }
          .hero-assure { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hero-seal { width: 88px; top: auto; bottom: calc(100% - 100vh + 260px); }
        }
        @media (max-width: 560px) {
          .hero-cta .btn { width: 100%; }
          .hero-seal { display: none; }
        }

        /* ── what we can prove ── */
        .proof { background: var(--bg); border-bottom: 1px solid var(--line-soft); }
        .proof-list {
          display: grid; gap: 0; list-style: none; margin: 0; padding: 0;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
        .proof-list li {
          display: grid; gap: 5px; padding: 28px clamp(14px, 2.4vw, 30px) 30px;
          border-right: 1px solid var(--line-soft);
        }
        .proof-list li:first-child { padding-inline-start: 0; }
        .proof-list li:last-child { border-right: 0; }
        .proof-list strong {
          font-family: var(--font-display); font-size: clamp(1.9rem, 3.4vw, 2.7rem);
          font-weight: 450; color: var(--olive-700); line-height: 1;
          font-variant-numeric: tabular-nums; letter-spacing: -.03em;
        }
        .proof-list span { font-size: .78rem; letter-spacing: .04em; color: var(--fg-mute); }

        /* ── voices ── */
        .voices {
          display: grid; gap: 22px;
          /* auto-FILL, not auto-fit: with one testimonial published, auto-fit
             stretches that single card across the full width and it reads as
             a mistake. Filling keeps the card its own size. */
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .voice {
          margin: 0; padding: 30px 28px; background: #fff;
          border: 1px solid var(--rule); border-radius: 3px;
          display: flex; flex-direction: column; gap: 18px;
        }
        .voice blockquote {
          margin: 0; font-family: var(--font-display); font-size: 1.06rem;
          line-height: 1.55; color: var(--fg);
        }
        .voice blockquote::before { content: '“'; }
        .voice blockquote::after  { content: '”'; }
        .voice figcaption { display: grid; gap: 2px; margin-top: auto; }
        .voice-who  { font-weight: 600; font-size: .9rem; }
        .voice-org  { font-size: .82rem; color: var(--fg-soft); }
        .voice-proj { font-size: .76rem; color: var(--fg-soft); letter-spacing: .04em; }

        /* ── faqs ── */
        .faqs { display: grid; gap: 0; border-top: 1px solid var(--rule); }
        .faq { border-bottom: 1px solid var(--rule); }
        .faq summary {
          cursor: pointer; padding: 20px 40px 20px 0; position: relative;
          font-family: var(--font-display); font-size: 1.04rem; list-style: none;
        }
        .faq summary::-webkit-details-marker { display: none; }
        .faq summary::after {
          content: '+'; position: absolute; right: 8px; top: 50%;
          transform: translateY(-50%); font-size: 1.3rem; color: var(--brass-600);
          transition: transform .18s ease;
        }
        .faq[open] summary::after { content: '–'; }
        .faq p { margin: 0 0 22px; max-width: 68ch; color: var(--fg-soft); }

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
