import type { Locale } from '@/lib/i18n';

/**
 * The five legal pages, as documents rather than as React.
 *
 * They were 4,463 words of JSX spread across five components, which had three
 * consequences. Nobody could translate them without rewriting the markup. The
 * same clause existed in three files and drifted between them. And a sentence
 * could not be checked for length, for a broken token or for being missing in
 * a language, because it was not a value anywhere — it was a fragment.
 *
 * Here each document is data: a list of blocks per section, per language. So
 * `Record<Locale, LegalDoc>` makes an untranslated document a TYPE ERROR
 * rather than a page that quietly serves English to an Italian reader, and
 * tests/legal.test.mjs can assert that every language has the same sections in
 * the same order with the same tokens.
 *
 * WHY NOT page_docs. The table exists and it is the right home for the day the
 * owner edits a clause from the console. It is not the right home for the only
 * copy: a database outage would serve a blank privacy policy, and a policy is
 * the one page on a site that must render when everything else is down. So the
 * compiled document below is the default, and a page_docs row — when one
 * exists — replaces the body of a section rather than being the only source of
 * it. Until the console grows that screen, this file IS the document.
 */

/** Inline markup permitted inside a block's text: **bold**, [text](/path), {token}. */
export type Block =
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'dl'; items: { term: string; def: string }[] }
  /** The boxed callout — used where one paragraph must not be skimmed past. */
  | { t: 'note'; text: string }
  /** Whose company this is and how to reach it, rendered from Settings. */
  | { t: 'contact' };

export type LegalSection = {
  /** Stable across languages: the anchor in a URL must not move when the reader switches. */
  id: string;
  heading: string;
  body: Block[];
};

export type LegalDoc = {
  /** Also the URL: /privacy, /terms, /terms-of-sale, /refunds, /disclaimer. */
  slug: LegalSlug;
  title: string;
  /** For <title> and the card on /legal — may differ from the h1. */
  metaTitle: string;
  metaDescription: string;
  /** The one-line card on /legal. */
  cardLine: string;
  cardNote: string;
  summary: string;
  /** ISO yyyy-mm-dd, so it can be formatted in the reader's own language. */
  updatedOn: string;
  sections: LegalSection[];
  footnote?: string;
};

export const LEGAL_SLUGS = ['privacy', 'terms', 'terms-of-sale', 'refunds', 'disclaimer'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

/** One date for all five, written down rather than generated. See LegalPage. */
export const LEGAL_UPDATED = '2026-09-17';

export type LegalSet = Record<Locale, LegalDoc>;
