import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import LegalPage from '@/components/LegalPage';
import { getLegalDoc } from '@/lib/legal';
import { getSettings } from '@/lib/settings';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const doc = getLegalDoc('privacy', lang);
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: alternates(lang, '/privacy'),
  };
}

export default async function PrivacyPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const site = await getSettings();

  return (
    <LegalPage doc={getLegalDoc('privacy', lang)} site={site} locale={lang} />
  );
}
