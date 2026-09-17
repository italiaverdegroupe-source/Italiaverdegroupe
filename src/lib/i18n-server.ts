import { headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from '@/lib/i18n';

/**
 * The best guess at somebody's language before they have told us.
 *
 * Used on the sign-in screen and nowhere else. Everywhere else in the console
 * the language is a stored preference on the user, which is a fact; this is an
 * inference from a header, which is a guess — and a guess is only better than
 * nothing on the one screen where there is nothing, because the person is not
 * signed in yet. Showing an Italian owner an English form before they have had
 * any chance to say otherwise is a worse default than reading what their
 * browser already says.
 *
 * Deliberately not used on the public site: that reads the language from the
 * URL, and a header-based guess there would make the same address serve
 * different content to different people, which breaks caching and confuses a
 * crawler about what is at that URL.
 */
export async function browserLocale(): Promise<Locale> {
  try {
    const raw = (await headers()).get('accept-language') ?? '';
    // "it-IT,it;q=0.9,en;q=0.8" — in preference order already.
    const wanted = raw.split(',')
      .map((part) => {
        const [tag, q] = part.trim().split(';q=');
        return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
      })
      .filter((x) => x.tag && !Number.isNaN(x.q))
      .sort((a, b) => b.q - a.q);

    for (const { tag } of wanted) {
      // ar-AE and ar both mean Arabic. Match the language subtag.
      const base = tag.split('-')[0];
      if (isLocale(base) && (LOCALES as readonly string[]).includes(base)) return base;
    }
  } catch {
    // headers() is unavailable in some rendering contexts. A guess that cannot
    // be made is not an error; it is the default.
  }
  return DEFAULT_LOCALE;
}

/**
 * The locale of the request being rendered, for the pages the router hands no
 * params to.
 *
 * Exactly one page needs this: not-found.tsx. Next gives a not-found no params
 * — there is no matched route to take them from — and `next/root-params` is
 * unavailable here because it requires `[lang]` above EVERY root layout, which
 * the console's own root layout rules out by design.
 *
 * So src/proxy.ts sets `x-locale` on every request it handles and this reads
 * it. The value is validated rather than trusted: a header can be sent by
 * anybody, and while the worst a forged one could do is render a 404 in the
 * wrong language, `isLocale` costs nothing and means this function can never
 * return something that is not a locale.
 *
 * NOT for anything else. A page that has params must read its locale from
 * them: params are what the URL says, and a header is what a proxy said about
 * it, and when those two ever disagree the URL is right.
 */
export async function requestLocale(): Promise<Locale> {
  try {
    const got = (await headers()).get('x-locale');
    return got && isLocale(got) ? got : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}
