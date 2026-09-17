import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { metadataFor, publishedFaqs } from '@/lib/content';
import L from '@/components/L';
import { getSettings } from '@/lib/settings';
import { site } from '@/lib/site';

/**
 * Revalidated on a timer as well as on demand.
 *
 * Editing in the console revalidates this page immediately, so a correction is
 * live at once. The timer is for the other case: a deploy whose build could
 * not reach the database bakes the compiled defaults, and without a window
 * the answers somebody published last week would quietly vanish until the next
 * edit. Five minutes means the page heals itself instead.
 */
export const revalidate = 300;

export const generateMetadata = async (
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> => metadataFor((await params).lang, '/services', {
  title: 'Services — supply, import, delivery and planting',
  description:
    'Tree supply from Italian nurseries, import and phytosanitary documentation, acclimatisation, delivery with crane offloading, and planting across the UAE.',
});

/**
 * The six are a sequence, not a menu — a tree passes through all of them in
 * this order — so they are numbered. Laid out as an unordered list of cards,
 * "Planting" read as something you might buy instead of "Import", which is not
 * what is on offer at all.
 */
const STAGES: { title: string; body: string; detail: string }[] = [
  {
    title: 'Selection at the grower',
    body: 'We choose the individual plant in the nursery, in Toscana, Puglia, Sicilia or Lombardia — to your specification, not from whatever a stock list happens to hold that month.',
    detail: 'Photographs of the actual specimen before anything is committed.',
  },
  {
    title: 'Import & documentation',
    body: 'Phytosanitary certification, import permits, customs clearance and the paperwork that live plant material attracts at both ends.',
    detail: 'Handled by us. Nothing on this list becomes your problem at the border.',
  },
  {
    title: 'Acclimatisation',
    body: 'Conditioning on arrival before stock is released to site, so a tree that has just come out of an Italian winter meets a Gulf summer in stages.',
    detail: 'This is the step that decides whether a specimen establishes or fails in year one.',
  },
  {
    title: 'Transport & offloading',
    body: 'Low-loader, and crane or hiab where the root ball demands it. Site access — gate widths, overhead lines, ground bearing — is confirmed before a delivery date is agreed.',
    detail: `Across all ${site.emirates.length} emirates.`,
  },
  {
    title: 'Planting',
    body: 'Pit preparation, soil amendment, staking and irrigation connection, where planting is within the quoted scope.',
    detail: 'Optional. Plenty of contractors take supply only, and that is quoted too.',
  },
  {
    title: 'Project supply',
    body: 'Phased consignments held to one specification across a development, so the trees in phase four match the ones in phase one.',
    detail: 'For schemes that run over months rather than a single delivery.',
  },
];

/** What a buyer reads on a services page is delivery, planting, import and
 *  aftercare. The general and commercial questions stay on the home page. */
const SERVICE_TOPICS = new Set(['delivery', 'planting', 'import', 'care']);

export default async function ServicesPage() {
  const [settings, faqs] = await Promise.all([getSettings(), publishedFaqs()]);
  const scopes = settings.serviceScopes;
  const serviceFaqs = faqs.filter((f) => SERVICE_TOPICS.has(f.category));

  return (
    <>
      <div className="section">
        <div className="wrap">
          <header className="svc-head">
            <div>
              <p className="eyebrow">Services</p>
              <h1>From the Italian nursery to the finished site.</h1>
            </div>
            <div>
              <p className="lede">
                One company carries the tree the whole way, so there is nobody to point at
                when something goes wrong with it.
              </p>
              <p className="svc-note">
                Scope is quoted to what a project actually needs. Supply on its own is a
                perfectly normal request.
              </p>
            </div>
          </header>

          {/* The three ways this is bought, said plainly and in the same words
              the quote form uses — so choosing one there is not a new decision. */}
          <ul className="svc-scopes">
            {scopes.map((s) => <li key={s}>{s}</li>)}
          </ul>

          <ol className="svc-stages">
            {STAGES.map((s, i) => (
              <li key={s.title}>
                <span className="svc-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div className="svc-txt">
                  <h2>{s.title}</h2>
                  <p>{s.body}</p>
                  <p className="svc-detail">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="section-tight svc-band">
        <div className="wrap">
          <div className="svc-timing">
            <div>
              <p className="eyebrow">Timing</p>
              <h2>The calendar decides more than the budget does.</h2>
              <p>
                Trees are living stock. Lifting season in Italy and the UAE summer both limit
                when a specimen can safely move and establish, and no amount of logistics
                gets around either. We will tell you the realistic window for a species
                rather than accept a delivery date that would cost you the tree.
              </p>
              <p className="svc-lead">
                Typical lead time is <strong>{site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks</strong>{' '}
                from order confirmation to site delivery — selection, documentation, sailing
                and acclimatisation included.
              </p>
              <div className="svc-acts">
                <L href="/quote" className="btn btn-primary">Discuss a project</L>
                <L href="/collections" className="btn btn-ghost">See what we carry</L>
              </div>
            </div>
          </div>
        </div>
      </div>

      {serviceFaqs.length > 0 && (
        <section className="section">
          <div className="wrap">
            <header className="svc-head">
              <div>
                <p className="eyebrow">Before you enquire</p>
                <h2>Questions we are asked about the work itself.</h2>
              </div>
            </header>
            <div className="faqs svc-faqs">
              {serviceFaqs.map((f) => (
                <details key={f.id} className="faq">
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
          <script type="application/ld+json" suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: serviceFaqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            }) }} />
        </section>
      )}

      <style>{`
        .svc-head {
          display: grid; gap: clamp(20px, 3vw, 56px); align-items: end;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
        }
        @media (max-width: 900px) { .svc-head { grid-template-columns: 1fr; align-items: start; } }
        .svc-head .lede { max-width: 32ch; margin-bottom: 1rem; }
        .svc-note { max-width: 44ch; font-size: .92rem; color: var(--fg-soft); margin: 0; }

        .svc-scopes {
          list-style: none; display: flex; flex-wrap: wrap; gap: 10px;
          margin: clamp(32px, 4vw, 52px) 0 0; padding: 0;
        }
        .svc-scopes li {
          padding: .5em 1.05em; border: 1px solid var(--line); border-radius: 999px;
          font-size: .82rem; color: var(--olive-900); background: var(--sand-50);
        }

        .svc-stages {
          list-style: none; counter-reset: none; margin: clamp(38px, 5vw, 62px) 0 0; padding: 0;
          border-top: 1px solid var(--line);
        }
        .svc-stages > li {
          display: grid; gap: clamp(16px, 3vw, 48px);
          grid-template-columns: 4.5rem minmax(0, 1fr);
          padding: clamp(24px, 3vw, 36px) 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .svc-num {
          font-family: var(--font-display); font-size: 1.5rem; line-height: 1;
          color: var(--brass-500); padding-top: .18em;
          font-variant-numeric: tabular-nums;
        }
        .svc-txt { display: grid; gap: 0; }
        .svc-txt h2 { font-size: clamp(1.35rem, 2.2vw, 1.85rem); margin-bottom: .5rem; }
        .svc-txt p { margin: 0 0 .6rem; color: var(--fg-soft); max-width: 62ch; }
        .svc-detail {
          font-size: .86rem; color: var(--fg-mute) !important;
          padding-inline-start: .9em; border-inline-start: 2px solid var(--olive-100);
        }
        @media (max-width: 620px) {
          .svc-stages > li { grid-template-columns: 1fr; gap: 6px; }
          .svc-num { font-size: 1.1rem; }
        }

        .svc-band { background: var(--sand-100); border-block: 1px solid var(--line); }
        .svc-timing { max-width: 68ch; }
        .svc-timing h2 { font-size: clamp(1.7rem, 3.2vw, 2.6rem); margin-bottom: .7rem; }
        .svc-timing p { color: var(--fg-soft); }
        .svc-lead { color: var(--olive-900) !important; }
        .svc-lead strong { font-weight: 600; }
        .svc-acts { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 1.6rem; }

        /* The home page owns .faqs; these two lines are all this page needs on
           top of it, and duplicating the rest would be two things to keep in
           step for no gain. */
        .svc-faqs { margin-top: clamp(30px, 4vw, 46px); }
      `}</style>
    </>
  );
}
