import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import LegalPage from '@/components/LegalPage';
import { getLegalDoc } from '@/lib/legal';
import { getSettings } from '@/lib/settings';
import { getAllProducts } from '@/lib/products';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const doc = getLegalDoc('disclaimer', lang);
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: alternates(lang, '/disclaimer'),
  };
}

export default async function DisclaimerPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const site = await getSettings();
  const all = getAllProducts();
  const underReview = all.filter((p) => !p.photoVerified).length;

  return (
    <LegalPage doc={getLegalDoc('disclaimer', lang)} site={site} locale={lang}
      tokens={{ underReview, total: all.length }} />
  );
}
