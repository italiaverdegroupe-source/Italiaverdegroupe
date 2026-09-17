import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import LegalPage from '@/components/LegalPage';
import { getLegalDoc } from '@/lib/legal';
import { getSettings } from '@/lib/settings';
import { ui } from '@/lib/ui';
import { site as fallback } from '@/lib/site';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const doc = getLegalDoc('terms-of-sale', lang);
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: alternates(lang, '/terms-of-sale'),
  };
}

export default async function TermsOfSalePage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const site = await getSettings();
  const t = ui(lang);
  const lead = fallback.leadTimeWeeks;
  // The VAT sentence is a whole clause, not a word, so it lives in ui.ts where
  // every locale is type-checked rather than being assembled from fragments.
  const vat = site.vatEnabled
    ? t('legal.vatCharged', { rate: (site.vatRate * 100).toFixed(0) })
    : t('legal.vatNotRegistered');

  return (
    <LegalPage doc={getLegalDoc('terms-of-sale', lang)} site={site} locale={lang}
      tokens={{
        quoteValidityDays: site.quoteValidityDays,
        leadMin: lead.min, leadMax: lead.max, vat,
      }} />
  );
}
