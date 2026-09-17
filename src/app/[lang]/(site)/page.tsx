import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';
import Image from 'next/image';
import RouteMap from '@/components/RouteMap';
import ProductCard from '@/components/ProductCard';
import { getSettings } from '@/lib/settings';
import { ogImage } from '@/lib/site';
import { getBlocks, fill, publishedFaqs, publishedTestimonials, getSeo } from '@/lib/content';
import { getAllProducts, getShowcaseProducts, getFamilies, imageFor } from '@/lib/products';
import { ui } from '@/lib/ui';

// The picture the owner chose, and the reason the rest of this section is
// built the way it is. It lives in public/brand, never public/products: it is
// a scene, not a specimen, so it must not be reachable through imageFor() or
// appear in the catalogue as something a customer can ask a price for.
//
// 1824 x 862, so it is served at its own size up to a 1920 viewport and
// upscaled beyond that. Nothing here can raise that — a larger original is
// the only thing that would.
const HERO = '/brand/hero-terrace.webp';
const SPOT_REF = 'VG-OL-002';
const BAND_REF = 'VG-PL-017';
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

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const [site, seo] = await Promise.all([getSettings(), getSeo('/', lang)]);
  const title = seo?.title ?? `${site.legalName} — ${site.tagline}`;
  const description = seo?.description ?? site.description;
  return {
    title, description,
    alternates: alternates(lang, '/'),
    ...(seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, images: [ogImage] },
  };
}

export default async function HomePage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const t = ui(lang);
  const site = await getSettings();
  const [c, faqs, voices] = await Promise.all([
    getBlocks(lang), publishedFaqs(lang), publishedTestimonials(lang),
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
          <Image src={HERO} alt="" fill priority sizes="100vw" quality={88}
                 className="hero-img" />
        </div>
        <div className="hero-veil" />

        <div className="wrap hero-in">
          {/* The copy sits on a pane of frosted glass rather than on a wash
              spread across half the picture. The wash was the mistake: it lit
              the sunrise, the skyline and the haze all the same flat cream and
              handed back a photograph that had been drained. A pane is the
              opposite trade — everything outside it is the photograph at full
              strength, and the only part that gives way is the rectangle the
              words actually occupy. */}
          <div className="hero-card">
            <p className="eyebrow">{c['home.hero.eyebrow']}</p>
            <h1>{c['home.hero.title']}<br /><em>{c['home.hero.title.em']}</em></h1>
            <p className="hero-lede">
              {fill(c['home.hero.lede'], { regions: site.sourcingRegions.join(', ') })}
            </p>
            <div className="hero-cta">
              <L href="/catalog" className="btn btn-primary btn-lg">
                {c['home.hero.cta']} <span aria-hidden="true">&rarr;</span>
              </L>
              <L href="/quote" className="btn btn-ghost btn-lg">{c['home.hero.cta.two']}</L>
            </div>
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

        <L href={`/collections/${heroFamily.slug}`} className="hero-feat">
          <span className="hero-feat-img">
            <Image src={`/products/${heroFamily.cover}`} alt="" fill sizes="160px" />
          </span>
          <span className="hero-feat-txt">
            <span className="hero-feat-eyebrow">{c['home.featured.eyebrow']}</span>
            <span className="hero-feat-name">{heroFamily.name}</span>
            <span className="hero-feat-note">{c['home.featured.note']}</span>
          </span>
          <span className="hero-feat-go" aria-hidden="true">&rarr;</span>
        </L>

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
            {[[String(all.length), t('proof.specimens')],
              [String(site.sourcingRegions.length), t('proof.regions')],
              [String(site.emirates.length), t('proof.emirates')],
              [`${site.leadTimeWeeks.min}–${site.leadTimeWeeks.max}`, t('proof.weeks')]]
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
              <li><i className="sw sw-it" />{t("Growing regions")}</li>
              <li><i className="sw sw-ae" />{t("Delivery market")}</li>
              <li><i className="sw sw-rt" />{t("Sourcing route")}</li>
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
            <p className="eyebrow">{t("Specimen")}</p>
            <h2>{spotlight.name}</h2>
            <p className="spot-desc">{spotlight.description}</p>
            <dl className="spot-dl">
              {Object.entries(spotlight.attributes).slice(0, 4).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <L href={`/catalog/${spotlight.slug}`} className="btn btn-primary">
              {t("View this specimen")}
            </L>
          </div>
        </div>
      </section>

      {/* ═══════════ collections ═══════════ */}
      <section className="section panel">
        <div className="wrap">
          <header className="head-row reveal">
            <div>
              <p className="eyebrow">{t("The catalogue")}</p>
              <h2>{t("Six collections")}</h2>
            </div>
            <L href="/catalog" className="tlink">{t("View all")} {all.length} {t("specimens →")}</L>
          </header>
          <div className="coll-grid">
            {families.map((f, i) => (
              <L key={f.slug} href={`/collections/${f.slug}`}
                    className={`coll reveal ${i === 0 ? 'coll-lead' : ''}`}>
                <Image src={`/products/${f.cover}`} alt="" fill
                       sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                <span className="coll-scrim" />
                <span className="coll-idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="coll-txt">
                  <span className="coll-h">{f.name}</span>
                  <span className="coll-n">{f.count} specimens</span>
                </span>
              </L>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ featured ═══════════ */}
      <section className="section">
        <div className="wrap">
          <header className="head-row reveal">
            <div>
              <p className="eyebrow">{t("Selected stock")}</p>
              <h2>{t("From the catalogue")}</h2>
            </div>
            <L href="/catalog" className="tlink">{t("See everything →")}</L>
          </header>
          <div className="grid cols-4">
            {featured.map((p) => <ProductCard key={p.reference} p={p} locale={lang} />)}
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
          <L href="/quote" className="btn btn-light btn-lg">{c['home.band.cta']}</L>
        </div>
      </section>

      {/* ═══════════ who + coverage ═══════════ */}
      <section className="section">
        <div className="wrap two-col">
          <div className="reveal">
            <p className="eyebrow">{t("Who we supply")}</p>
            <h2>{c['home.who.title']}</h2>
            <ul className="chips">
              {site.projectTypes.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="cta-row">
              <L href="/quote?type=bulk" className="btn btn-primary">{t("Request bulk pricing")}</L>
              <L href="/quote?type=sourcing" className="btn btn-ghost">{t("Source a specific tree")}</L>
            </div>
          </div>
          <div className="reveal">
            <p className="eyebrow">{t("Coverage")}</p>
            <h2>{c['home.coverage.title']}</h2>
            <ul className="em-list">
              {site.emirates.map((e, i) => (
                <li key={e.slug}>
                  <L href={`/locations/${e.slug}`}>
                    <span className="em-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="em-name">{e.name}</span>
                    <span className="em-arrow">→</span>
                  </L>
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
                <p className="eyebrow">{t("Clients")}</p>
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
                <p className="eyebrow">{t("Before you enquire")}</p>
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
          /* The photograph is 1824 x 862 — a panorama, 2.12 to 1. Every number
             below exists to keep this box near that shape, because object-fit:
             cover has to enlarge the picture by whatever it takes to fill a box
             taller than itself. The previous heading ran to four lines at 83px
             and pushed this box to 1012px, which enlarged a 862px-tall original
             by 1.17 and cut 126px off each side — the sunrise on the left and
             the terrace on the right, the two things the photograph is of. It
             did not read as a crop. It read as a zoom, which is what it was. */
          min-height: min(82vh, 800px);
          display: flex; flex-direction: column; justify-content: center;
          /* Pulled up under the sticky header so the photograph starts at the
             top of the page. Without this the bar sits in the flow and leaves
             a band of travertine above the picture. */
          margin-top: calc(-1 * var(--hdr-h));
          padding-top: calc(var(--hdr-h) + clamp(28px, 4.5vh, 56px));
          padding-bottom: clamp(88px, 10vh, 132px);
          background: var(--sand-50);
          overflow: hidden;
        }
        .hero-media { position: absolute; inset: 0; z-index: -2; }
        .hero-img {
          /* Horizontally 50%, because the two things that must not be trimmed
             — the sunrise and the terrace — are at the far left and the far
             right of the frame.
             Vertically 66% rather than centred. A screen wider than about
             2000px is taller than this panorama can fill, so something is
             trimmed off the top and the bottom; centred, it took equal bites
             out of empty sky and out of the pool and marble at the foot of the
             tree. The sky is the part of this photograph there is most of and
             least in, so the trim comes off the top. */
          object-fit: cover; object-position: 50% 66%;
          /* No grading. This photograph is already lit; saturating it further
             would only push the sky. */
        }
        /* No slow zoom either. The original is 1824px across, and a 1.1 scale
           on top of the upscale a wide screen already applies is the
           difference between sharp and soft. */

        /* What is left of the wash.
           The version before this held a flat cream at .46 across the first
           two fifths of the picture. It passed every contrast measurement and
           it was still wrong: the owner's photograph came back drained, the
           sunrise flattened into beige, and the thing he had actually asked
           for — the picture — was the thing it spent. The copy has a pane of
           its own now, so all that is needed here is to keep the foot of the
           frame from fighting the bar of assurances across it. */
        .hero-veil {
          position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(to top,
            rgb(250 247 240 / .46) 0%,
            rgb(250 247 240 / .14) 12%,
            rgb(250 247 240 / 0) 26%);
        }

        /* the pane */
        .hero-card {
          max-width: min(660px, 100%);
          padding: clamp(26px, 3.1vw, 44px) clamp(24px, 2.9vw, 42px) clamp(28px, 3.3vw, 46px);
          border-radius: 3px;
          background: linear-gradient(142deg,
            rgb(253 251 247 / .50), rgb(253 251 247 / .34) 62%, rgb(253 251 247 / .30));
          -webkit-backdrop-filter: blur(26px) saturate(1.18);
          backdrop-filter: blur(26px) saturate(1.18);
          border: 1px solid rgb(255 255 255 / .46);
          box-shadow: 0 34px 90px -46px rgb(10 14 8 / .62),
                      inset 0 1px 0 rgb(255 255 255 / .34);
        }
        /* Firefox with backdrop-filter disabled, and anything older: there is
           no blur to lift the text off the photograph, so the pane has to be a
           surface on its own or the words land straight on the tree. */
        @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
          .hero-card {
            background: rgb(252 250 245 / .93);
            border-color: rgb(255 255 255 / .8);
          }
        }

        .hero-in { position: relative; z-index: 2; width: 100%; }
        /* Two lines, not four.
           The markup already breaks the sentence in two, so a max-width of
           13ch was breaking each half AGAIN — "Ancient Italian / olives. /
           Planted in the / Emirates." Four lines of 83px type is 360px of
           headline before a word of the offer is read, and it is the thing
           that made the box too tall for its own photograph. Sized to put each
           half on one line inside the pane instead. */
        .hero h1 {
          font-size: clamp(2.3rem, 3.3vw, 3.15rem);
          line-height: 1.04; letter-spacing: -.032em;
          margin: 0 0 .5em; color: var(--olive-950); max-width: 24ch;
          text-wrap: balance;
        }
        .hero h1 em {
          font-style: italic; color: var(--olive-800);
          font-variation-settings: 'SOFT' 40, 'WONK' 1;
        }
        /* Every small piece of copy here is darker than it is elsewhere on the
           site. On a page of travertine, ink-400 and ink-600 read comfortably;
           on a photograph at half the strength of wash they do not, and the
           faintest of the three — the eyebrow — is the one that fails first. */
        /* olive-800, not olive-700. Shortening the headline let the pane sit
           further across the sunrise at around 1024px, and measured off the
           rendered page the eyebrow came back at 4.25:1 there — under 4.5 by a
           margin no stylesheet would have shown. It is the faintest thing on
           the pane and so the first to go; tests/hero-contrast.mjs catches it. */
        .hero .eyebrow { color: var(--olive-800); }
        .hero-lede {
          font-size: clamp(1.02rem, 1.3vw, 1.18rem); line-height: 1.62;
          color: var(--olive-900); max-width: 46ch; margin: 0 0 1.9rem;
        }
        .hero-cta { display: flex; flex-wrap: wrap; gap: 14px; }
        /* The outline button has no surface of its own, so over a picture its
           hairline border disappears and takes 1.4.11 with it. Give it a pane
           of the same travertine the rest of the page is made of. */
        .hero-cta .btn-ghost {
          background: rgb(252 250 245 / .62);
          border-color: rgb(46 68 32 / .34); color: var(--olive-900);
        }
        .hero-cta .btn-ghost:hover {
          background: rgb(252 250 245 / .92); border-color: var(--olive-700);
        }

        /* the seal */
        .hero-seal {
          position: absolute; z-index: 2;
          top: clamp(96px, 13vh, 168px); inset-inline-end: clamp(20px, 4vw, 72px);
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
          inset-inline-end: clamp(16px, 3vw, 56px); bottom: clamp(104px, 13vh, 150px);
          display: flex; align-items: center; gap: 16px;
          max-width: min(430px, calc(100% - 32px));
          padding: 12px 18px 12px 12px; border-radius: 4px; text-decoration: none;
          background: rgb(252 250 245 / .97);
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
          /* ink-400 tops out at 4.35:1 on travertine and this card is not even
             solid travertine, so the label was never quite readable. */
          font-size: .6rem; letter-spacing: .2em; text-transform: uppercase; color: var(--ink-600);
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

        /* ── phones ──
           Below this the overlay stops being worth it. A portrait window onto
           a 2.1:1 photograph throws away nine tenths of the width, and the
           tenth that is left has to sit under a wash heavy enough to read
           four paragraphs through — which leaves a beige page with a rumour
           of a tree on it. So the picture stops being a backdrop and becomes
           a picture: a full-bleed band at the top, at its own shape, with the
           words underneath it on travertine. Same photograph, actually
           visible. */
        @media (max-width: 860px) {
          .hero {
            display: block; min-height: 0;
            padding-top: 0; padding-bottom: 0;
            background: var(--bg-warm);
          }
          .hero-media {
            position: relative; inset: auto; z-index: 0;
            height: clamp(300px, 46vh, 430px);
          }
          /* The trunk and the crown — the part that still says olive tree at
             390px. The sun and the skyline cannot survive this crop at any
             offset, so they are not fought for. */
          .hero-img { object-position: 66% 44%; }
          /* All the veil has left to do is keep the brand mark legible where
             the header floats over the top of the band. */
          .hero-veil {
            inset: 0 0 auto 0; z-index: 1;
            height: calc(var(--hdr-h) + 54px);
            background: linear-gradient(to bottom,
              rgb(250 247 240 / .88) 0%,
              rgb(250 247 240 / .58) 46%,
              rgb(250 247 240 / 0) 100%);
          }
          .hero-in {
            padding-top: clamp(30px, 5.5vh, 44px);
            padding-bottom: clamp(30px, 5vh, 42px);
          }
          /* The words are on travertine here, under the picture rather than on
             it, so a pane would be a box drawn around nothing. */
          .hero-card {
            max-width: none; padding: 0; border: 0; border-radius: 0;
            background: none; box-shadow: none;
            -webkit-backdrop-filter: none; backdrop-filter: none;
          }
          .hero h1 { max-width: 16ch; }
          .hero-lede { margin-bottom: 1.9rem; }
          .hero-cta .btn-ghost {
            background: transparent; -webkit-backdrop-filter: none; backdrop-filter: none;
            border-color: var(--line);
          }
          /* Bigger here than it was, not smaller. At 84px the three lines
             inside were touching the brass ring, and a letter half on the ring
             and half on the disc is a letter on two backgrounds — measured at
             2.9:1 against the ring. The disc has room over the canopy. */
          .hero-seal {
            top: calc(var(--hdr-h) + 16px); bottom: auto;
            right: clamp(14px, 4vw, 26px); width: 108px;
          }
          /* In the flow now, under the copy, rather than floating over the
             foot of a picture that is no longer behind it. */
          .hero-assure-bar {
            position: static; background: transparent;
            -webkit-backdrop-filter: none; backdrop-filter: none;
            border-top: 1px solid var(--line-soft);
          }
          .hero-assure { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .hero h1 { font-size: clamp(2.3rem, 9.4vw, 3.4rem); }
          .hero-cta .btn { width: 100%; }
          .hero-seal { width: 96px; }
        }

        /* ── what we can prove ── */
        .proof { background: var(--bg); border-bottom: 1px solid var(--line-soft); }
        .proof-list {
          display: grid; gap: 0; list-style: none; margin: 0; padding: 0;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
        .proof-list li {
          display: grid; gap: 5px; padding: 28px clamp(14px, 2.4vw, 30px) 30px;
          border-inline-end: 1px solid var(--line-soft);
        }
        .proof-list li:first-child { padding-inline-start: 0; }
        .proof-list li:last-child { border-inline-end: 0; }
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
          border: 1px solid var(--line); border-radius: 3px;
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
          /* margin-INLINE-start. As margin-left this pulled the card toward the
             photograph in English and off the left edge of the page in Arabic,
             where the photograph is on the other side — 20px of sideways
             scroll on the Arabic homepage, which tests/i18n.test.mjs measures. */
          .spot-txt { margin-inline-start: -14%; position: relative; z-index: 2; box-shadow: var(--shadow-lift); }
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
          position: absolute; z-index: 2; top: 18px; inset-inline-end: 20px;
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
