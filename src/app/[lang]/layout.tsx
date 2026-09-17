import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Fraunces, Inter, Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { ogImage, site } from '@/lib/site';
import {
  LOCALES, LOCALE_TAG, LOCALE_OG, DEFAULT_LOCALE, dir, isLocale, localePath,
} from '@/lib/i18n';
import WhatsAppButton from '@/components/WhatsAppButton';
import ShortlistBar from '@/components/ShortlistBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocaleProvider from '@/components/LocaleProvider';
import { ui } from '@/lib/ui';
import { getSettings } from '@/lib/settings';
import { organisation, website, ldJson } from '@/lib/schema';
import '../globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Arabic needs its own two faces, and the pairing is the same idea.
 *
 * Fraunces and Inter have no Arabic glyphs at all. Left to fall back, every
 * Arabic page would render in whatever the device happens to have — Times on
 * one machine, a system naskh on another — which on a page selling specimen
 * trees to architects is the difference between a brand and a document.
 *
 * Amiri is a classical naskh and carries the same weight Fraunces does in
 * English; IBM Plex Sans Arabic sits beside Inter the way it was drawn to.
 * Both are only attached to <html> when the page IS Arabic, so an English
 * visitor never downloads an Arabic font.
 */
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-arabic-display',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-arabic-body',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://verdegarden.example';

export const viewport: Viewport = {
  themeColor: '#1B2719',
  width: 'device-width',
  initialScale: 1,
};

/** Three, built ahead of time. */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/**
 * hreflang, which is the whole point of prefixing the URLs.
 *
 * Without it a search engine sees three pages saying the same thing in three
 * languages and has to guess whether they are translations or duplicates. It
 * guesses wrong often enough that the Arabic page ends up competing with the
 * English one instead of being offered to Arabic readers. x-default points at
 * English, which is what somebody with no matching preference should get.
 */
export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const languages = Object.fromEntries(
    LOCALES.map((l) => [LOCALE_TAG[l], localePath(l, '/')]),
  );

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${site.legalName} — ${site.tagline}`,
      template: `%s — ${site.legalName}`,
    },
    description: site.description,
    alternates: {
      canonical: localePath(lang, '/'),
      languages: { ...languages, 'x-default': localePath(DEFAULT_LOCALE, '/') },
    },
    openGraph: {
      type: 'website',
      siteName: site.legalName,
      title: `${site.legalName} — ${site.tagline}`,
      description: site.description,
      locale: LOCALE_OG[lang],
      alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => LOCALE_OG[l]),
      images: [ogImage],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> },
) {
  const { lang } = await params;
  // A path like /de/catalog reaches here with lang = 'de'. 404 rather than
  // render the English page under a language we do not publish — that would
  // put an unbounded number of duplicate URLs in front of a crawler.
  if (!isLocale(lang)) notFound();

  // Once, in the layout, so every page carries it — a search engine that
  // lands on a specimen page deep in the catalogue should still learn who
  // publishes it. Both blocks are @id'd, so the per-page markup can point at
  // them instead of describing the company again and disagreeing with itself.
  const settings = await getSettings();

  const latin = `${fraunces.variable} ${inter.variable}`;
  const fonts = lang === 'ar' ? `${latin} ${amiri.variable} ${plexArabic.variable}` : latin;

  return (
    <html lang={LOCALE_TAG[lang]} dir={dir(lang)} className={fonts}>
      <body className="grain">
        <script type="application/ld+json" suppressHydrationWarning
                dangerouslySetInnerHTML={ldJson(organisation(settings, lang))} />
        <script type="application/ld+json" suppressHydrationWarning
                dangerouslySetInnerHTML={ldJson(website(settings, lang))} />
        <LocaleProvider locale={lang}>
          <a href="#main" className="visually-hidden">{ui(lang)('nav.skip')}</a>
          <Header locale={lang} />
          <main id="main">{children}</main>
          <Footer locale={lang} />
          <ShortlistBar />
          <WhatsAppButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
