import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Amiri, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { getSessionUser } from '@/lib/auth';
import { adminUi } from '@/lib/admin-ui';
import { browserLocale } from '@/lib/i18n-server';
import { LOCALE_TAG, dir, isLocale, type Locale } from '@/lib/i18n';
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

/**
 * The same two Arabic faces the public site loads, for the same reason.
 *
 * Fraunces and Inter are subset to Latin and have no Arabic glyphs at all, so
 * an Arabic console left to fall back renders in whatever naskh the machine
 * happens to carry — or, on a machine that carries none, in tofu. The public
 * layout solves this with Amiri for display and IBM Plex Sans Arabic for text
 * and the console had simply never been given the same treatment, because it
 * had never been given a locale either. Both are attached only when the
 * operator's console language IS Arabic, so nobody else downloads them.
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

/**
 * Loading the Arabic faces is not enough on its own: admin.css asks for
 * var(--font-inter) and var(--font-fraunces) by name — it does not go through
 * the --font-sans / --font-display indirection the public stylesheet uses, so
 * there is no single place in it to swap the family for a right-to-left page.
 * Rather than fork the console's typography, the Arabic faces are put at the
 * FRONT of those same two stacks here, on <html>, where an inline style beats
 * the class next/font generates. Every console rule keeps working untouched
 * and simply resolves to Amiri and IBM Plex Sans Arabic instead — which is
 * what [dir='rtl'] does to --font-display and --font-sans on the public side.
 */
const ARABIC_FACES = {
  '--font-fraunces': `${amiri.style.fontFamily}, ${fraunces.style.fontFamily}`,
  '--font-inter': `${plexArabic.style.fontFamily}, ${inter.style.fontFamily}`,
} as React.CSSProperties;

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

export default async function ConsoleRootLayout({ children }: { children: React.ReactNode }) {
  /**
   * The console has been fully translated for a while, and it was still
   * served as `<html lang="en">` with no dir. Two things followed from that.
   * An Italian screen told every assistive technology it was English, so it
   * was read aloud in an English voice; and the Arabic console — every word
   * of it translated — was laid out left to right, because dir is what turns
   * a mirrored layout on and nothing else does.
   *
   * The language lives on the operator's account (users.locale, set by the
   * switch in the sidebar), so the shell has to ask who is signed in before
   * it can open the document. That makes this layout async and dynamic, which
   * costs nothing here: everything underneath it is already force-dynamic.
   *
   * When there is no session — the sign-in page, which renders through this
   * same shell — the browser's own preference is the fallback, because that
   * is precisely what the sign-in page already uses to choose the language it
   * greets you in (admin/login/page.tsx). Anything else would have declared
   * an Italian sign-in form to be English. And .catch() rather than a crash:
   * a database that cannot be read must still produce a document, for the
   * same reason set out in the admin layout below.
   */
  const user = await getSessionUser().catch(() => null);
  const stored = user?.locale ?? null;
  const locale: Locale = isLocale(stored) ? stored : await browserLocale();
  const t = adminUi(locale);

  const latin = `${fraunces.variable} ${inter.variable}`;
  const fonts = locale === 'ar' ? `${latin} ${amiri.variable} ${plexArabic.variable}` : latin;

  return (
    <html lang={LOCALE_TAG[locale]} dir={dir(locale)} className={fonts}
          style={locale === 'ar' ? ARABIC_FACES : undefined}>
      <body>
        {/* Thirteen destinations, three language buttons, the account link and
            sign out: nineteen tab stops stood between the top of every console
            page and the first thing on it, on every page load, all day, with
            no way past them. The target is the <main> the admin layout draws
            around the page; it is only offered when there IS a shell to skip,
            because the sign-in page is returned bare and has no #adm-main to
            jump to. Same visually-hidden-until-focused class as the public
            site's skip link, so the two behave identically. */}
        {user && <a href="#adm-main" className="visually-hidden">{t('Skip to content')}</a>}
        {children}
      </body>
    </html>
  );
}
