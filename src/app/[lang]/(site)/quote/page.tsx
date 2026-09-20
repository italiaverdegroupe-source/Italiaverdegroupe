import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { metadataFor } from '@/lib/content';
import QuoteForm from '@/components/QuoteForm';
import { getSettings } from '@/lib/settings';
import { getAllProducts } from '@/lib/products';
import { ui } from '@/lib/ui';

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

export const generateMetadata = async (
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> => {
  // The title and description were English literals, so /ar/quote and /it/quote
  // shipped an English SERP snippet under an hreflang cluster that told Google
  // they were the Arabic and Italian pages. The body was translated; only the
  // head was not, which is the half a searcher sees first.
  const { lang } = await params;
  const t = ui(lang);
  return metadataFor(lang, '/quote', {
    title: t('seo.quoteTitle'),
    description: t('seo.quoteDesc'),
  });
};

type Search = { type?: string; ref?: string };

export default async function QuotePage(
  { params, searchParams }: { params: Promise<{ lang: Locale }> } & { searchParams: Promise<Search> },
) {
  const { lang } = await params;
  const t = ui(lang);
  const sp = await searchParams;
  const site = await getSettings();
  const type = sp.type === 'bulk' || sp.type === 'sourcing' ? sp.type : 'quote';
  const products = getAllProducts().map((p) => ({ reference: p.reference, name: p.name }));

  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">{t("Enquiry")}</p>
        <h1>{t("Request a quote")}</h1>
        <p className="lede">
          {t("There is no checkout — every specimen is priced individually against the season, the consignment and the scope of work. Send us the detail and we will price it properly.")}
        </p>
        <div className="qgrid">
          <QuoteForm defaultType={type} defaultRef={sp.ref ?? ''} products={products} />
          <aside className="aside">
            <h2 className="aside-h">{t("What happens next")}</h2>
            <ol className="steps">
              <li><strong>{t("We confirm availability")}</strong><span>{t("Against current stock and the next consignment from Italy.")}</span></li>
              <li><strong>{t("We price the scope")}</strong><span>{t("Supply, delivery, crane and offloading, planting — whatever you need.")}</span></li>
              <li><strong>{t('You get a written quotation')}</strong><span>{t('quote.validFor', { days: site.quoteValidityDays })}</span></li>
            </ol>
            <hr className="rule" />
            <p className="aside-note">
              {t('quote.leadNote', {
                min: site.leadTimeWeeks.min, max: site.leadTimeWeeks.max,
              })}
            </p>
          </aside>
        </div>
      </div>

      <style>{`
        .qgrid { display: grid; gap: clamp(32px, 5vw, 64px); margin-top: 40px; align-items: start; }
        .aside {
          padding: 28px; background: var(--sand-100);
          border: 1px solid var(--line); border-radius: var(--radius-lg);
        }
        .aside-h { font-size: 1.1rem; margin-bottom: 1.25rem; }
        .steps { margin: 0 0 1.5rem; padding: 0 0 0 1.1rem; display: grid; gap: 1rem; }
        .steps li { font-size: .9rem; }
        .steps strong { display: block; font-weight: 500; }
        .steps span { color: var(--fg-soft); }
        .aside-note { font-size: .85rem; color: var(--fg-soft); margin: 1.25rem 0 0; }
        @media (min-width: 1000px) { .qgrid { grid-template-columns: minmax(0, 1.5fr) minmax(280px, .85fr); } }
      `}</style>
    </div>
  );
}
