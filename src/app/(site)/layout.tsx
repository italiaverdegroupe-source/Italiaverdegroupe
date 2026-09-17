import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { ogImage, site } from '@/lib/site';
import WhatsAppButton from '@/components/WhatsAppButton';
import ShortlistBar from '@/components/ShortlistBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://verdegarden.example';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${site.legalName} — ${site.tagline}`,
    template: `%s — ${site.legalName}`,
  },
  description: site.description,
  openGraph: {
    type: 'website',
    siteName: site.legalName,
    title: `${site.legalName} — ${site.tagline}`,
    description: site.description,
    locale: 'en_AE',
    images: [ogImage],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1B2719',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="grain">
        <a href="#main" className="visually-hidden">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <ShortlistBar />
        <WhatsAppButton />
      </body>
    </html>
  );
}
