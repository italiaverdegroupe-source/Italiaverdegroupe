/**
 * When the catalogue last actually changed.
 *
 * WHY THIS IS A WRITTEN-DOWN DATE and not a file timestamp. The sitemap needs
 * a `lastmod` for sixty-eight specimen pages, and it had `new Date()` — which
 * told a crawler all of them changed today, again tomorrow, and the day after.
 * Google says plainly that it ignores lastmod it judges unreliable, so the
 * field was worse than empty: it was teaching a crawler to disregard the one
 * signal that says which pages are worth re-fetching.
 *
 * The obvious fix was products.json's own mtime. That is wrong too, and
 * measurably so: the file is bundled at build time, so its timestamp in a
 * deployed build is the BUILD time. Every deploy would stamp all sixty-eight
 * pages as changed, which is the same lie with an extra step — and it was
 * doing exactly that before this file existed.
 *
 * So the date is written here by a person, and `sha` is what stops that being
 * a promise nobody keeps: tests/seo.test.mjs hashes products.json and fails if
 * it does not match. Change the catalogue and the test tells you to change the
 * date, in the same commit, before it can reach the sitemap.
 */
export const CATALOGUE = {
  /** The day the catalogue last changed. Bump it when products.json changes. */
  updated: '2026-09-17',
  /** sha256 of src/data/products.json as of that date. */
  sha: 'a2bb38b022cf80ba59708be782c70ab43e8e4887cc10ccc6995388e26ffcb92b',
} as const;
