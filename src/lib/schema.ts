import { site as fallback, ogImage } from '@/lib/site';
import { DEFAULT_LOCALE, LOCALE_TAG, localePath, type Locale } from '@/lib/i18n';
import type { Settings } from '@/lib/settings';
import type { CopyKey } from '@/lib/site-copy';
import { ui, type UIKey } from '@/lib/ui';

/**
 * What this company is, in the form a search engine reads.
 *
 * Until now the site emitted FAQ markup on the homepage, a Service on each
 * location page and a Product on each specimen — and nothing at all that said
 * WHO. A search engine could see that somebody answers questions about olive
 * trees and serves Dubai, and had to infer the rest from prose. The thing a
 * Knowledge Panel is built from, and the thing Search Console reports on, is
 * an Organization, and there wasn't one.
 *
 * Everything here is assembled from settings the company controls. Nothing is
 * invented: an address, a licence number or a founding year that is not set
 * is left out of the markup entirely rather than guessed at, because a wrong
 * fact in structured data is a wrong fact Google will repeat — and the one
 * thing worse than not being in a Knowledge Panel is being in one incorrectly.
 */

const base = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'https://verdegarden.example';
const abs = (path: string) => `${base()}${path}`;

/** Only the social accounts that have actually been filled in. */
function sameAs(s: Settings): string[] {
  return [s.instagram, s.linkedin, s.facebook, s.youtube, s.tiktok, s.x]
    .map((v) => (v ?? '').trim())
    .filter(Boolean);
}

/**
 * A sentence the company wrote about itself, in the language of the page.
 *
 * The description and the strapline are settings: the console writes them,
 * and it writes ONE value in ONE language. So the Organization block — the
 * only part of a page whose entire job is to tell a search engine who this
 * is — described the company in English to an Arabic reader and to an Italian
 * one, on all 190 non-English URLs, underneath a page that was otherwise
 * translated.
 *
 * Settings have no language column yet, and giving them one is a change to
 * the settings table and to the Settings screen rather than to this file.
 * What can be done honestly from here is this. While a setting still holds
 * the sentence this codebase ships with, we know exactly what it says and
 * there is a reviewed translation of that sentence, so we use it. The moment
 * the owner writes their own, we print what they wrote, in whatever language
 * they wrote it — because the alternative is putting words into a company's
 * mouth in the machine-readable layer, which is the one place nobody would
 * think to check.
 *
 * The key IS the shipped default (src/lib/site.ts), passed through rather
 * than copied, so the sentence and its translation cannot drift apart: change
 * the default and the lookup changes with it, and a missing translation shows
 * up as the English sentence rather than as a blank description.
 *
 * `UIKey | CopyKey` because ui() answers both and it does not matter to this
 * function which of the two dictionaries the sentence ends up living in.
 */
function ownWords(set: string | undefined, shipped: UIKey | CopyKey, t: ReturnType<typeof ui>): string {
  const written = (set ?? '').trim();
  return !written || written === shipped ? t(shipped) : written;
}

/**
 * The organisation itself, with a stable @id so every other block on the site
 * can point at it rather than describing the company again and disagreeing.
 *
 * ONE @id MEANS ONE SET OF FACTS, and that is what went wrong here: the @id
 * was fixed while `url`, `description`, `slogan` and `inLanguage` all changed
 * with the language of the page. Three homepages therefore published three
 * different answers about the same identified entity, which is precisely the
 * disagreement a stable @id exists to prevent — and the two answers that
 * mattered most to a reader, the description and the strapline, were English
 * on every one of them. What varies with the page now is only what a company
 * can truthfully say differently in another language: its own prose.
 */
export function organisation(s: Settings, locale: Locale) {
  const t = ui(locale);
  const social = sameAs(s);
  const hasAddress = Boolean((s.address ?? '').trim());
  const trimmed = (v: string | undefined) => (v ?? '').trim();
  const foundedIn = trimmed(s.foundedIn);
  const foundedAt = trimmed(s.foundedAt);
  const italianName = trimmed(s.italianName);
  const italianUrl = trimmed(s.italianUrl);
  const italianSince = trimmed(s.italianSince);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base()}/#organisation`,
    name: s.legalName,
    alternateName: s.brandName,
    // A company has one address on the web. This line used to be
    // abs(localePath(locale, '/')), so the Arabic homepage declared that the
    // entity at this @id lives at /ar and the Italian one that it lives at
    // /it. A translated page is a translation of a page, not a second
    // company; the English homepage is what every canonical, every x-default
    // and the sitemap already name, so it is what this names too.
    url: abs(localePath(DEFAULT_LOCALE, '/')),
    description: ownWords(s.description, fallback.description, t),
    slogan: ownWords(s.tagline, fallback.tagline, t),
    // `inLanguage` stood here, set to the language of the page. It is not a
    // fact about a company — a company is not written in a language — and on
    // a node with one fixed @id, a value that changes from page to page is
    // the contradiction rather than the translation. The languages this
    // business actually answers enquiries in are stated where that claim
    // belongs, on contactPoint.availableLanguage below. The language of the
    // PAGE is declared by <html lang> and by the WebSite block, which has a
    // per-locale @id and can therefore say it without disagreeing with
    // itself.
    logo: { '@type': 'ImageObject', url: abs('/icon.svg') },
    image: abs(ogImage.url),

    // THE SENTENCE THIS WHOLE FILE EXISTS FOR. The trade is Italian nursery
    // stock brought into the Emirates: that is what the company does, and
    // saying it in the machine-readable layer is how a search engine learns
    // it without having to read the prose and guess.
    knowsAbout: [
      'Italian nursery stock', 'Specimen olive trees', 'Ancient olive trees',
      'Mediterranean palms', 'Agaves and succulents', 'Architectural plants',
      'Plant import and phytosanitary documentation',
      'Landscape supply in the United Arab Emirates',
    ],
    ...(hasAddress
      ? {
        address: {
          '@type': 'PostalAddress',
          streetAddress: s.address,
          addressLocality: s.city,
          addressCountry: 'AE',
        },
      }
      : {}),
    areaServed: fallback.emirates.map((e) => ({
      '@type': 'AdministrativeArea',
      name: `${e.name}, United Arab Emirates`,
    })),
    // Where the stock comes from, which is half of what this company is.
    ...(fallback.sourcingRegions.length
      ? {
        makesOffer: {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Specimen trees and plants grown in Italy',
            category: 'Nursery stock',
          },
          areaServed: 'AE',
          availableAtOrFrom: fallback.sourcingRegions.map((r) => ({
            '@type': 'Place',
            name: `${r}, Italy`,
          })),
        },
      }
      : {}),
    // ── new here, not new in Italy ──
    //
    // The thing this company most needs a search engine to understand, and
    // the thing no amount of prose analysis will reliably give it: the trade
    // is Italian nursery stock, the selling is in the Emirates, and the two
    // halves have different ages. `knowsAbout` and `makesOffer` above say
    // WHAT and FROM WHERE. These say WHEN and BY WHOM.
    //
    // Every one is omitted unless the owner has set it. A founding date is a
    // fact Google will repeat in a Knowledge Panel, and inventing one to fill
    // a field would be putting a lie into the machine-readable layer of the
    // site — which is the one place nobody would think to check.
    ...(foundedIn ? { foundingDate: foundedIn } : {}),
    ...(foundedAt ? { foundingLocation: { '@type': 'Place', name: foundedAt } } : {}),
    ...(italianName
      ? {
        parentOrganization: {
          '@type': 'Organization',
          name: italianName,
          ...(italianUrl ? { url: italianUrl } : {}),
          address: { '@type': 'PostalAddress', addressCountry: 'IT' },
          ...(italianSince ? { foundingDate: italianSince } : {}),
        },
      }
      : {}),
    ...(social.length ? { sameAs: social } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...((s.licenceNumber ?? '').trim()
      ? {
        identifier: [{
          '@type': 'PropertyValue',
          name: 'UAE trade licence',
          value: s.licenceNumber,
        }],
      }
      : {}),
    ...((s.trn ?? '').trim() ? { taxID: s.trn } : {}),
    ...(s.email || s.phone
      ? {
        contactPoint: [{
          '@type': 'ContactPoint',
          contactType: 'sales',
          areaServed: 'AE',
          availableLanguage: ['en', 'ar', 'it'],
          ...(s.email ? { email: s.email } : {}),
          ...(s.phone ? { telephone: s.phone } : {}),
        }],
      }
      : {}),
  };
}

/**
 * The website, pointed at the organisation, with the search box declared.
 *
 * potentialAction is what lets a search result offer a search box for this
 * site. The catalogue already takes ?q= — this just says so.
 */
export function website(s: Settings, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    // One node per language, and the @id says which one it is.
    //
    // This was a single fixed '#website' carrying a url, a reading language
    // and a search endpoint that all changed with the locale — three websites
    // published under one identifier. A localised site, unlike the company
    // behind it, genuinely is three things here: /, /ar and /it each have
    // their own address, their own language and their own catalogue search.
    // So each gets its own @id. The English one is byte-for-byte what it
    // always was, because abs(localePath('en', '/')) is the site root.
    '@id': `${abs(localePath(locale, '/'))}#website`,
    url: abs(localePath(locale, '/')),
    name: s.brandName,
    // All three point at the one company, which is the whole reason the
    // organisation's @id does not move.
    publisher: { '@id': `${base()}/#organisation` },
    inLanguage: LOCALE_TAG[locale],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs(`${localePath(locale, '/catalog')}?q={search_term_string}`),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * The trail from the homepage to here.
 *
 * Search results show it instead of a bare URL, and on a catalogue of 68
 * specimens that is the difference between a result that reads
 * "verdegardenae.com › catalog › olive-tree-dwarf" and one that reads
 * "Home › Catalogue › Olive Trees › Olive Tree Dwarf".
 */
export function breadcrumbs(locale: Locale, trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: abs(localePath(locale, step.path)),
    })),
  };
}

/** One <script> for a block of structured data. */
export const ldJson = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c'),
});
