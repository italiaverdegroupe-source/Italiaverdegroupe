/**
 * Three languages, and one of them is read right to left.
 *
 * English is the default and it has NO prefix. That is not a style choice:
 * every URL this site has published — in the sitemap, in the OG tags, in
 * whatever links have already been shared — is unprefixed, and moving them all
 * to /en would either 404 them or add a redirect hop to every page on the
 * site for ever. The proxy rewrites an unprefixed path to the English route
 * internally, so /catalog keeps being /catalog while the router still sees a
 * locale. Arabic and Italian are prefixed, because they are new.
 */

export const LOCALES = ['en', 'ar', 'it'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (v: unknown): v is Locale =>
  typeof v === 'string' && (LOCALES as readonly string[]).includes(v);

/** What the switcher shows. Each language names itself — a visitor looking
 *  for Arabic is looking for العربية, not for the word "Arabic" in English. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  it: 'Italiano',
};

/**
 * The word "Language", in each language.
 *
 * The switcher's accessible name was the English word on every locale, so a
 * screen reader on the Arabic site announced the one control that changes the
 * language in the language its user had already chosen not to read. The names
 * above are each in their own language for the same reason; this is the label
 * that sits in front of them.
 */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'Language', ar: 'اللغة', it: 'Lingua',
};

/** The short label on the switcher button. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN', ar: 'ع', it: 'IT',
};

/** BCP 47, for <html lang> and hreflang. Regioned where the region matters:
 *  this is an Emirates company, and ar-AE is the Arabic its buyers read. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-AE', ar: 'ar-AE', it: 'it-IT',
};

/** Open Graph wants underscores, not hyphens. */
export const LOCALE_OG: Record<Locale, string> = {
  en: 'en_AE', ar: 'ar_AE', it: 'it_IT',
};

export const dir = (locale: Locale): 'ltr' | 'rtl' => (locale === 'ar' ? 'rtl' : 'ltr');

/**
 * The path for a locale.
 *
 *   localePath('en', '/catalog')  -> '/catalog'
 *   localePath('ar', '/catalog')  -> '/ar/catalog'
 *   localePath('ar', '/')         -> '/ar'
 *
 * Takes an UNPREFIXED path — the one written in the code — and returns the
 * one to put in an href. Anything that is not an internal path (a mailto:, a
 * tel:, an absolute URL, a bare #anchor) is returned untouched, because a
 * locale prefix on a telephone number is not a link any more.
 */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith('/')) return path;
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/**
 * The reverse: take whatever is in the address bar and give back the locale
 * and the path without it. Used by the switcher, which has to offer the SAME
 * page in another language rather than sending everybody to the homepage.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = /^\/([a-z]{2})(?=\/|$)/.exec(pathname);
  if (m && isLocale(m[1]) && m[1] !== DEFAULT_LOCALE) {
    return { locale: m[1], path: pathname.slice(3) || '/' };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || '/' };
}

/**
 * The canonical + hreflang block for one page, in every language.
 *
 * Every page in this codebase sets its own `alternates`, and in Next that
 * REPLACES whatever the layout set rather than merging with it — so the
 * layout declaring hreflang once was not enough; the tags vanished on every
 * page that named a canonical, which is all of them. This is the one place
 * that block is built, so a page cannot declare a canonical without also
 * declaring its translations.
 *
 * x-default points at English: it is what a reader with no matching language
 * preference should be given.
 */
export function alternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [LOCALE_TAG[l], localePath(l, path)])),
      'x-default': localePath(DEFAULT_LOCALE, path),
    },
  };
}
