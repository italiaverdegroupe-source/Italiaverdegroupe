import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Fraunces, Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

/**
 * The 404 for a URL that matches no route group at all.
 *
 * (site)/not-found.tsx only covers unmatched paths beneath the site's own
 * segments; once the console was split out, a bare /nonsense had no group and
 * fell through to Next's unstyled built-in page.
 *
 * This is global-not-found.tsx rather than not-found.tsx, and the difference
 * matters. A root not-found.tsx is not a document — Next wraps it in a bare
 * <html><body> of its own, so a file that renders its own pair produces two
 * of each, and a browser silently drops the inner one along with its lang
 * attribute and its font-variable classes. global-not-found IS the document,
 * so the classes land on <html> beside :root where --font-display can resolve
 * against them, and lang is set on the element that actually carries the
 * page's language. It needs experimental.globalNotFound in next.config.mjs.
 */

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
});

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Not found — Verde Garden Trading',
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1B2719',
  width: 'device-width',
  initialScale: 1,
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="grain">
        <a href="#main" className="visually-hidden">Skip to content</a>
        <Header />
        <main id="main">
          <div className="section">
            <div className="wrap nf">
              <p className="eyebrow">404</p>
              <h1>That page has been replanted.</h1>
              <p className="lede">The page you asked for is not here. The catalogue is.</p>
              <p className="nf-cta">
                <Link href="/catalog" className="btn btn-primary">Browse the catalogue</Link>
                <Link href="/quote" className="btn btn-ghost">Request a quote</Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
        <style>{`
          .nf { max-width: 60ch; padding-block: clamp(32px, 6vw, 72px); }
          .nf-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2rem; }
        `}</style>
      </body>
    </html>
  );
}
