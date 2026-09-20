import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';
import L from '@/components/L';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocaleProvider from '@/components/LocaleProvider';
import { LOCALE_TAG, dir } from '@/lib/i18n';
import { requestLocale } from '@/lib/i18n-server';
import { ui } from '@/lib/ui';
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
 *
 * IT USED TO BE ENGLISH, always, and said in a comment that this was fine
 * because "there is no language to render it in". That was true of /nonsense
 * and plainly false of /ar/nonsense, which says its language in the URL — and
 * because globalNotFound makes this file own every unmatched path, it meant
 * the 404 was English on the Arabic and Italian sites too. The one page where
 * a reader is already lost was the one page that would not speak to them.
 *
 * It reads the locale from the header src/proxy.ts sets, because a not-found
 * is handed no params and `next/root-params` needs `[lang]` above every root
 * layout, which the console's own layout rules out.
 *
 * IT IS THE PUBLIC SITE'S 404 AND ONLY THE PUBLIC SITE'S. Because this file
 * owns every unmatched path, it also used to answer /admin/invoices,
 * /admin/customers and every other guessed console section — putting a
 * signed-in operator out on the marketing header with Catalogue, Collections
 * and "Request a quote" and no link back into the console. It cannot tell the
 * difference itself: the console is exempt from src/proxy.ts, so no path and
 * no locale header reaches this render. The console now catches those URLs
 * before they get here, with src/app/(console)/admin/[...rest]/page.tsx, which
 * hands them to the console's own 404; the reasoning is written out in that
 * file. Nothing under /admin should reach this page any more.
 */

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
});

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

const amiri = Amiri({
  subsets: ['arabic'], weight: ['400', '700'], display: 'swap',
  variable: '--font-arabic-display',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'], weight: ['400', '500', '600'], display: 'swap',
  variable: '--font-arabic-body',
});

export const metadata: Metadata = {
  title: 'Not found — Verde Garden Trading',
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1B2719',
  width: 'device-width',
  initialScale: 1,
};

export default async function GlobalNotFound() {
  const lang = await requestLocale();
  const t = ui(lang);

  // Arabic faces are attached only when the page is Arabic, so a reader of the
  // English 404 never downloads them.
  const latin = `${fraunces.variable} ${inter.variable}`;
  const fonts = lang === 'ar' ? `${latin} ${amiri.variable} ${plexArabic.variable}` : latin;

  return (
    <html lang={LOCALE_TAG[lang]} dir={dir(lang)} className={fonts}>
      <body className="grain">
        {/* L and the header both read the locale from here, so every link on
            this page keeps the reader in the language they arrived in rather
            than dropping them back onto the English site. */}
        <LocaleProvider locale={lang}>
          <a href="#main" className="visually-hidden">{t('nav.skip')}</a>
          <Header locale={lang} />
          {/* tabIndex={-1} is what makes the skip link above actually work. An
              anchor whose target cannot hold focus only moves the scroll
              position: the browser's focus stays on the link, so the next Tab
              goes back into the header the visitor was trying to skip. Chrome
              hides this with its sequential-focus starting point and Safari
              does not. The console's own <main> carries the same attribute for
              the same reason. */}
          <main id="main" tabIndex={-1}>
            <div className="section">
              <div className="wrap nf">
                <p className="eyebrow">404</p>
                <h1>{t('nf.title')}</h1>
                <p className="lede">{t('nf.lede')}</p>
                <p className="nf-cta">
                  <L href="/catalog" className="btn btn-primary">{t('nf.browse')}</L>
                  <L href="/quote" className="btn btn-ghost">{t('cta.quote')}</L>
                </p>
              </div>
            </div>
          </main>
          <Footer locale={lang} />
        </LocaleProvider>
        <style>{`
          .nf { max-width: 60ch; padding-block: clamp(32px, 6vw, 72px); }
          .nf-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2rem; }
        `}</style>
      </body>
    </html>
  );
}
