import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces, Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

/**
 * The 404 for a URL that matches no route group at all.
 *
 * With two root layouts there is no layout above this file, so it has to
 * supply its own <html> and <body> — and its own fonts, or the page renders
 * in Times New Roman. Splitting the console out of the site is what made this
 * necessary: (site)/not-found.tsx now only covers unmatched paths beneath the
 * site's own segments, and a bare /nonsense reaches this one instead. Without
 * it the visitor gets Next's unstyled built-in page, which is what happened
 * until this was caught.
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
            <style>{`
              .nf { max-width: 60ch; padding-block: clamp(32px, 6vw, 72px); }
              .nf-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2rem; }
            `}</style>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
