import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import LegalPage from '@/components/LegalPage';
import { getLegalDoc } from '@/lib/legal';
import { getSettings } from '@/lib/settings';

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  const doc = getLegalDoc('refunds', lang);
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: alternates(lang, '/refunds'),
  };
}

export default async function RefundsPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const site = await getSettings();

  return (
    <LegalPage doc={getLegalDoc('refunds', lang)} site={site} locale={lang} />
  );
}
