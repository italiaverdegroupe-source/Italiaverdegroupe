import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { metadataFor } from '@/lib/content';
import L from '@/components/L';
import { getSettings } from '@/lib/settings';
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
  // The title and description were English literals, so /ar/about and /it/about
  // shipped an English SERP snippet under an hreflang cluster that told Google
  // they were the Arabic and Italian pages. The body was translated; only the
  // head was not, which is the half a searcher sees first.
  const { lang } = await params;
  const t = ui(lang);
  return metadataFor(lang, '/about', {
    title: t('seo.aboutTitle'),
    description: t('seo.aboutDesc'),
  });
};

export default async function AboutPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const t = ui(lang);
  const site = await getSettings();
  return (
    <div className="section">
      <div className="wrap prose">
        <p className="eyebrow">{t("About")}</p>
        <h1>{t("Italian horticulture, supplied properly in the Gulf.")}</h1>
        <p className="lede">
          {site.legalName} imports premium trees and plants direct from nurseries in
          {' '}{site.sourcingRegions.join(', ')} and supplies landscaping companies, developers, hotels and private estates across the United Arab Emirates.
        </p>

        <h2>{t("Why Italian stock")}</h2>
        <p>
          {t("Italian growers have spent generations producing the specimen material this region wants — ancient olive trees with genuine trunk character, cloud-pruned and sculptural forms, architectural palms and agaves. The Mediterranean climate that produces them is close enough to Gulf conditions that well-selected material adapts, provided it is handled correctly on the way.")}
        </p>

        <h2>{t("Why quotations, not a checkout")}</h2>
        <p>
          {t("Every specimen is different. Two olive trees of the same nominal height can differ completely in trunk girth, canopy and character — and therefore in price. Add freight, season, quantity, site access and whether planting is in scope, and a fixed online price would be a fiction. So we quote.")}
        </p>

        <h2>{t("Living stock, handled as such")}</h2>
        <p>
          {t("Trees are not freight. They need the right lifting season, correct root-ball handling, documentation for import, a period to acclimatise on arrival, and the right equipment at the point of delivery. Where a timeline or a species is not realistic, we say so before the order rather than after the tree fails.")}
        </p>

        <p className="cta">
          <L href="/quote" className="btn btn-primary">{t("Start an enquiry")}</L>
        </p>
      </div>

      <style>{`
        .prose { max-width: 72ch; }
        .prose h2 { font-size: clamp(1.3rem, 2.2vw, 1.7rem); margin: 2.5rem 0 .75rem; }
        .prose p { color: var(--fg-soft); }
        .prose .lede { color: var(--fg-soft); }
        .cta { margin-top: 2.5rem; }
      `}</style>
    </div>
  );
}
