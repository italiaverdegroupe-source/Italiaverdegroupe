'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

/**
 * The current language, handed down from the root layout.
 *
 * Context rather than the two obvious alternatives, both of which are wrong
 * here:
 *
 *   usePathname() would let any component work the locale out for itself, and
 *   it is wrong during prerender. English pages are BUILT at /en/catalog and
 *   SERVED at /catalog — the proxy rewrites between the two — so a component
 *   reading the path at build time would write /en/ into every href on the
 *   page, and every link on the site would take a 308 hop before it landed.
 *
 *   headers() would be read at request time and correct, and it would opt the
 *   whole site out of static rendering: the header and footer are in the root
 *   layout, so one headers() call in either makes all 200-odd prerendered
 *   pages dynamic.
 *
 * The layout already knows the locale from the route. Passing it is exact,
 * costs nothing at runtime, and keeps every page static.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export const useLocale = () => useContext(LocaleContext);

export default function LocaleProvider(
  { locale, children }: { locale: Locale; children: React.ReactNode },
) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}
