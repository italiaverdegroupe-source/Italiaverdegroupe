import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import '../globals.css';

/**
 * The console's own root layout.
 *
 * Until now /admin rendered inside the marketing root layout, so the public
 * navigation — Catalogue, Collections, Request a quote — sat on top of every
 * operations screen, and the sign-in page was a dark slab dropped into a
 * content column meant for tables. Two audiences, two shells: a route group
 * with its own <html> is how the App Router expresses that, and it also means
 * the console never inherits the site's header, footer, grain overlay or
 * indexable metadata by accident.
 *
 * The cost of two root layouts is a full page load when crossing between
 * them. That is the right trade here: going from the public site to the
 * operations console is not a navigation, it is a different application.
 */

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

export const metadata: Metadata = {
  title: { default: 'Operations', template: '%s — Verde Garden Operations' },
  // Stated on the shell rather than per page, so a console screen added later
  // cannot be indexed because somebody forgot.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#14150F',
  width: 'device-width',
  initialScale: 1,
};

export default function ConsoleRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
