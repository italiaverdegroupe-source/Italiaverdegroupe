import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import type { LegalDoc, LegalSet, LegalSlug } from './types';
import { privacy } from './privacy';
import { terms } from './terms';
import { termsOfSale } from './terms-of-sale';
import { refunds } from './refunds';
import { disclaimer } from './disclaimer';

export * from './types';

const DOCS: Record<LegalSlug, LegalSet> = {
  privacy,
  terms,
  'terms-of-sale': termsOfSale,
  refunds,
  disclaimer,
};

/**
 * The document for a slug in a language.
 *
 * `LegalSet` is a full Record over Locale, so there is no fallback path to
 * write — an untranslated document does not compile. The `?? DEFAULT_LOCALE`
 * is for a locale that reached here from outside the type system (a URL
 * segment that got past the router), not for a missing translation.
 */
export function getLegalDoc(slug: LegalSlug, locale: Locale): LegalDoc {
  const set = DOCS[slug];
  return set[locale] ?? set[DEFAULT_LOCALE];
}

/** Every document in one language — used by /legal to build its index. */
export function getLegalIndex(locale: Locale): LegalDoc[] {
  return (Object.keys(DOCS) as LegalSlug[]).map((s) => getLegalDoc(s, locale));
}

export { DOCS as LEGAL_DOCS };
