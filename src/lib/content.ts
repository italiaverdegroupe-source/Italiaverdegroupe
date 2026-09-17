import { cache } from 'react';
import { query } from '@/lib/db';
import { ogImage } from '@/lib/site';
import { alternates, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

/**
 * Editable site content.
 *
 * The rule is the same one the settings table follows, and it is the reason
 * the public site cannot be broken from the console: the DEFAULTS LIVE IN
 * CODE, and the table holds only what somebody has actually changed. An empty
 * table renders the site exactly as it ships. A database outage renders it
 * exactly as it ships. Nothing a content editor does can leave a blank
 * homepage, because there is no state in which the copy is absent.
 *
 * What is editable is deliberately the copy a business rewrites — the
 * headline, the promise, the reason there is no checkout — and not the
 * structure around it. Letting the console emit markup would make every page
 * one bad paste away from a broken layout, and would hand an XSS vector to
 * anyone who ever gets an admin password. Text in, text out.
 */

export type BlockKind = 'line' | 'text';

export type BlockDef = {
  group: string;
  label: string;
  kind: BlockKind;
  /** What ships in the code, and what is rendered until someone changes it. */
  fallback: string;
  /** Where it appears, so an editor is not guessing. */
  where: string;
};

export const BLOCKS = {
  'home.hero.eyebrow': { group: 'Homepage', label: 'Hero eyebrow', kind: 'line',
    where: 'The small line above the headline',
    fallback: 'Premium Italian trees · UAE wide supply' },
  'home.hero.title': { group: 'Homepage', label: 'Headline, first line', kind: 'line',
    where: 'The largest text on the site', fallback: 'Ancient Italian olives.' },
  'home.hero.title.em': { group: 'Homepage', label: 'Headline, second line (italic)', kind: 'line',
    where: 'Set in italic beneath the first line', fallback: 'Planted in the Emirates.' },
  'home.hero.lede': { group: 'Homepage', label: 'Hero paragraph', kind: 'text',
    where: 'Under the headline. {regions} is replaced by the sourcing regions.',
    fallback: 'Specimen olive trees, palms and architectural plants — selected at the nursery in {regions}, imported, acclimatised, and delivered to site across the UAE.' },
  'home.hero.cta': { group: 'Homepage', label: 'Main button', kind: 'line',
    where: 'The filled button in the hero', fallback: 'Explore our trees' },
  'home.hero.cta.two': { group: 'Homepage', label: 'Second button', kind: 'line',
    where: 'The outlined button beside it', fallback: 'Request a quote' },

  'home.badge.top': { group: 'Homepage', label: 'Seal, first line', kind: 'line',
    where: 'The round seal on the hero photograph', fallback: 'Authentic' },
  'home.badge.mid': { group: 'Homepage', label: 'Seal, middle line', kind: 'line',
    where: 'The round seal on the hero photograph', fallback: 'Italian' },
  'home.badge.low': { group: 'Homepage', label: 'Seal, last line', kind: 'line',
    where: 'The round seal on the hero photograph', fallback: 'Trees' },

  'home.feature.1': { group: 'Homepage', label: 'Assurance 1', kind: 'line',
    where: 'The four short assurances under the hero buttons',
    fallback: 'Imported from Italy' },
  'home.feature.2': { group: 'Homepage', label: 'Assurance 2', kind: 'line',
    where: 'The four short assurances under the hero buttons',
    fallback: 'Wide range of premium trees' },
  'home.feature.3': { group: 'Homepage', label: 'Assurance 3', kind: 'line',
    where: 'The four short assurances under the hero buttons',
    fallback: 'Delivery across the UAE' },
  'home.feature.4': { group: 'Homepage', label: 'Assurance 4', kind: 'line',
    where: 'The four short assurances under the hero buttons',
    fallback: 'Expert support & aftercare' },

  'home.featured.eyebrow': { group: 'Homepage', label: 'Featured card, label', kind: 'line',
    where: 'The small card floating over the hero photograph',
    fallback: 'Featured collection' },
  'home.featured.note': { group: 'Homepage', label: 'Featured card, line', kind: 'line',
    where: 'Under the collection name on the floating card',
    fallback: 'Timeless beauty, rooted in history.' },

  'home.route.eyebrow': { group: 'Homepage', label: 'Map section, small label', kind: 'line',
    where: 'Above the map', fallback: 'Where they come from' },
  'home.route.title': { group: 'Homepage', label: 'Map section, heading', kind: 'line',
    where: 'Above the map', fallback: 'Four Italian regions.' },
  'home.route.title.two': { group: 'Homepage', label: 'Map section, second line', kind: 'line',
    where: 'Second line of the map heading', fallback: 'Seven emirates.' },
  'home.route.note': { group: 'Homepage', label: 'Map section, paragraph', kind: 'text',
    where: 'Beside the map heading',
    fallback: 'We buy at the grower, not from a middleman. Every consignment is inspected, documented for import, and acclimatised here before it reaches a site.' },

  'home.band.eyebrow': { group: 'Homepage', label: 'Quote band, small label', kind: 'line',
    where: 'The full-width photograph band', fallback: 'Why we quote' },
  'home.band.quote': { group: 'Homepage', label: 'Quote band, statement', kind: 'line',
    where: 'The large sentence over the photograph',
    fallback: 'A three-metre olive tree is not a checkout purchase.' },
  'home.band.body': { group: 'Homepage', label: 'Quote band, paragraph', kind: 'text',
    where: 'Beneath the statement',
    fallback: 'Two trees of the same nominal height differ completely in trunk girth, canopy and character — and so in price. Add freight, season, quantity and site access, and a fixed online price would be a fiction.' },
  'home.band.cta': { group: 'Homepage', label: 'Quote band, button', kind: 'line',
    where: 'The button over the photograph', fallback: 'Start an enquiry' },

  'home.who.title': { group: 'Homepage', label: 'Who we supply, heading', kind: 'line',
    where: 'Lower half of the homepage', fallback: 'Built for projects.' },
  'home.coverage.title': { group: 'Homepage', label: 'Coverage, heading', kind: 'line',
    where: 'Lower half of the homepage, above the list of emirates.',
    fallback: 'All seven emirates.' },

  'faq.title': { group: 'Questions', label: 'FAQ section heading', kind: 'line',
    where: 'Above the questions on the homepage', fallback: 'Questions we are asked' },
  'faq.intro': { group: 'Questions', label: 'FAQ section paragraph', kind: 'text',
    where: 'Under the FAQ heading',
    fallback: 'The things buyers ask before they enquire. If yours is not here, ask it in the enquiry form and it will be answered directly.' },

  'testimonials.title': { group: 'Testimonials', label: 'Section heading', kind: 'line',
    where: 'Above the testimonials on the homepage', fallback: 'What clients say' },

  'journal.title': { group: 'Journal', label: 'Journal heading', kind: 'line',
    where: 'Top of /journal', fallback: 'Journal' },
  'journal.intro': { group: 'Journal', label: 'Journal paragraph', kind: 'text',
    where: 'Under the journal heading',
    fallback: 'Notes on selecting, importing and establishing Mediterranean trees in the Gulf — written for the people who have to live with the result.' },
} as const satisfies Record<string, BlockDef>;

export type BlockKey = keyof typeof BLOCKS;

const fallbacks = Object.fromEntries(
  (Object.keys(BLOCKS) as BlockKey[]).map((k) => [k, BLOCKS[k].fallback]),
) as Record<BlockKey, string>;

/**
 * The live copy: stored values layered over the compiled defaults.
 *
 * On any failure the defaults are returned rather than throwing. A content
 * outage must not take the public site down with it — the same decision, and
 * the same reasoning, as the settings loader.
 */
/**
 * Every block, in one language, with the gaps filled in.
 *
 * Three layers, applied in this order, so the last one that has an answer
 * wins:
 *
 *   1. the defaults compiled into this file        — always complete
 *   2. the English rows, if any                    — what the console wrote
 *   3. the asked-for language's rows, if any       — the translation
 *
 * The middle layer is the one that matters. Without it, translating the
 * headline into Arabic would make the Arabic page show the CODE default for
 * everything else, silently undoing whatever the company had rewritten in
 * English. With it, an untranslated block on an Arabic page reads exactly what
 * the English page reads — which is the honest thing for it to say, and means
 * Arabic can go live with the homepage done and the rest following.
 */
export const getBlocks = cache(async (
  locale: Locale = DEFAULT_LOCALE,
): Promise<Record<BlockKey, string>> => {
  try {
    // Both languages in one query. Ordered so the asked-for language is
    // applied last and therefore wins; English first so it fills the gaps.
    const rows = await query<{ key: string; value: string; locale: string }>(
      `SELECT key, value, locale FROM content_blocks
        WHERE locale = $1 OR locale = $2
        ORDER BY (locale = $1) ASC`, [locale, DEFAULT_LOCALE]);
    const merged = { ...fallbacks };
    for (const r of rows) {
      // An unknown key is ignored rather than trusted: it is either a
      // leftover from a renamed block or something that does not belong.
      if (r.key in merged && r.value.trim() !== '') {
        merged[r.key as BlockKey] = r.value;
      }
    }
    return merged;
  } catch {
    return fallbacks;
  }
});

/** Every language's value for every block. The console's editing view. */
export const blocksByLocale = async (): Promise<Record<string, Record<string, string>>> => {
  const rows = await query<{ key: string; value: string; locale: string }>(
    'SELECT key, value, locale FROM content_blocks');
  const out: Record<string, Record<string, string>> = {};
  for (const r of rows) {
    (out[r.key] ??= {})[r.locale] = r.value;
  }
  return out;
};

/** Fill {tokens} in a block. Unknown tokens are left visible rather than blanked. */
export const fill = (s: string, tokens: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (all, k) => (k in tokens ? String(tokens[k]) : all));

// ── SEO ──────────────────────────────────────────────────────

export type Seo = {
  path: string; title: string | null; description: string | null;
  og_ref: string | null; noindex: boolean;
};

/**
 * Metadata written for one route.
 *
 * Returns undefined when nothing has been written, and the caller keeps what
 * the code generates. An override that silently replaced a catalogue-derived
 * title with an empty string would cost rankings on 68 product pages.
 */
/**
 * The stored SEO for one page in one language, falling back field by field.
 *
 * Field by field rather than row by row: an Arabic row that sets only the
 * title should not throw away the English description somebody wrote. COALESCE
 * over the two rows does that in one query.
 */
export const getSeo = cache(async (
  path: string, locale: Locale = DEFAULT_LOCALE,
): Promise<Seo | undefined> => {
  try {
    const rows = await query<Seo>(
      `SELECT $1::text AS path,
              NULLIF(trim(max(title)      FILTER (WHERE locale = $2)), '') AS title_l,
              NULLIF(trim(max(title)      FILTER (WHERE locale = $3)), '') AS title_d,
              NULLIF(trim(max(description) FILTER (WHERE locale = $2)), '') AS desc_l,
              NULLIF(trim(max(description) FILTER (WHERE locale = $3)), '') AS desc_d,
              NULLIF(trim(max(og_ref)     FILTER (WHERE locale = $2)), '') AS og_l,
              NULLIF(trim(max(og_ref)     FILTER (WHERE locale = $3)), '') AS og_d,
              bool_or(noindex) AS noindex,
              count(*) > 0 AS present
         FROM page_seo WHERE path = $1 AND locale IN ($2, $3)`,
      [path, locale, DEFAULT_LOCALE]) as unknown as Array<Record<string, string | boolean | null>>;
    const r = rows[0];
    // Present, not "has text". A row whose only setting is noindex has every
    // text field null, and an earlier version of this returned undefined for
    // it — so a page somebody had asked to hide from search stayed indexed,
    // silently, which is the one failure here that cannot be taken back.
    if (!r || !r.present) return undefined;
    return {
      path,
      title: (r.title_l ?? r.title_d) as string | null,
      description: (r.desc_l ?? r.desc_d) as string | null,
      og_ref: (r.og_l ?? r.og_d) as string | null,
      // noindex is an instruction about the PAGE, not about a translation of
      // it: hiding the English one and leaving the Arabic one indexed would
      // publish exactly what somebody asked to take down.
      noindex: Boolean(r.noindex),
    };
  } catch {
    return undefined;
  }
});

export const listSeo = () =>
  query<Seo & { updated_at: string }>(
    `SELECT path, title, description, og_ref, noindex, updated_at::text FROM page_seo ORDER BY path`);

// ── FAQs ─────────────────────────────────────────────────────

export type Faq = {
  id: string; question: string; answer: string; category: string;
  sort_order: number; is_published: boolean;
};

export const publishedFaqs = cache(async (
  locale: Locale = DEFAULT_LOCALE,
): Promise<Faq[]> => {
  try {
    // DISTINCT ON dictates its own leading ORDER BY, which would throw away
    // the order these are meant to be read in. The pick happens in SQL; the
    // arranging happens outside it.
    const rows = await query<Faq>(
      `SELECT DISTINCT ON (COALESCE(translation_of, id))
              id::text, question, answer, category, sort_order, is_published
         FROM faqs
        WHERE is_published AND locale IN ($1, $2)
        ORDER BY COALESCE(translation_of, id), (locale = $1) DESC`, [locale, DEFAULT_LOCALE]);
    return rows.sort((a, b) => a.sort_order - b.sort_order || Number(a.id) - Number(b.id));
  } catch {
    return [];
  }
});

export const allFaqs = () =>
  query<Faq>(`SELECT id::text, question, answer, category, sort_order, is_published
                FROM faqs ORDER BY sort_order, id`);

// ── testimonials ─────────────────────────────────────────────

export type Testimonial = {
  id: string; body: string; author_name: string; author_role: string | null;
  company: string | null; emirate: string | null; project: string | null;
  consent_on: string | null; consent_note: string | null;
  sort_order: number; is_published: boolean;
};

export const publishedTestimonials = cache(async (
  locale: Locale = DEFAULT_LOCALE,
): Promise<Testimonial[]> => {
  try {
    const rows = await query<Testimonial>(
      `SELECT DISTINCT ON (COALESCE(translation_of, id))
              id::text, body, author_name, author_role, company, emirate, project,
              consent_on::text, consent_note, sort_order, is_published
         FROM testimonials
        WHERE is_published AND locale IN ($1, $2)
        ORDER BY COALESCE(translation_of, id), (locale = $1) DESC`, [locale, DEFAULT_LOCALE]);
    return rows.sort((a, b) => a.sort_order - b.sort_order || Number(a.id) - Number(b.id));
  } catch {
    return [];
  }
});

export const allTestimonials = () =>
  query<Testimonial>(
    `SELECT id::text, body, author_name, author_role, company, emirate, project,
            consent_on::text, consent_note, sort_order, is_published
       FROM testimonials ORDER BY is_published DESC, sort_order, id`);

// ── the journal ──────────────────────────────────────────────

export type Post = {
  id: string; slug: string; title: string; excerpt: string | null; body: string;
  cover_ref: string | null; author: string | null; status: string;
  published_at: string | null; seo_title: string | null; seo_description: string | null;
  updated_at: string; locale: string;
};

const POST_COLS = `id::text, slug, title, excerpt, body, cover_ref, author, status,
              published_at::text, seo_title, seo_description, updated_at::text, locale`;

/**
 * The published articles, one per slug, in the best language available.
 *
 * DISTINCT ON (slug) with the asked-for language ordered first: an article
 * that has been translated appears translated, and one that has not appears
 * in English rather than disappearing. A journal that empties itself when you
 * switch language reads as a broken site, not as an untranslated one.
 */
export const publishedPosts = cache(async (
  locale: Locale = DEFAULT_LOCALE,
): Promise<Post[]> => {
  try {
    return await query<Post>(
      `SELECT DISTINCT ON (slug) ${POST_COLS}
         FROM posts
        WHERE status = 'published' AND published_at <= now()
          AND locale IN ($1, $2)
        ORDER BY slug, (locale = $1) DESC`, [locale, DEFAULT_LOCALE])
      .then((rows) => rows.sort((a, b) =>
        String(b.published_at ?? '').localeCompare(String(a.published_at ?? ''))));
  } catch {
    return [];
  }
});

export const getPost = cache(async (
  slug: string, locale: Locale = DEFAULT_LOCALE,
): Promise<Post | undefined> => {
  try {
    const rows = await query<Post>(
      `SELECT ${POST_COLS} FROM posts
        WHERE slug = $1 AND status = 'published' AND published_at <= now()
          AND locale IN ($2, $3)
        ORDER BY (locale = $2) DESC LIMIT 1`, [slug, locale, DEFAULT_LOCALE]);
    return rows[0];
  } catch {
    return undefined;
  }
});

export const allPosts = () =>
  query<Post>(`SELECT id::text, slug, title, excerpt, body, cover_ref, author, status,
                      published_at::text, seo_title, seo_description, updated_at::text
                 FROM posts ORDER BY COALESCE(published_at, created_at) DESC`);

/** A URL-safe slug. Falls back to a date so a post can never be slugless. */
export function slugify(s: string): string {
  const out = s.toLowerCase().normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return out || `post-${new Date().toISOString().slice(0, 10)}`;
}

/**
 * Layer a stored SEO override over the metadata a page already generates.
 *
 * Override rather than replace: a blank field in the console keeps the
 * compiled title and description. The catalogue already generates correct
 * metadata for 68 product pages, and letting an empty form field wipe that
 * would be a ranking loss with no visible symptom.
 */
export async function metadataFor(
  locale: Locale,
  path: string,
  base: { title: string; description: string },
): Promise<{
  title: string; description: string;
  alternates: ReturnType<typeof alternates>;
  robots?: { index: boolean; follow: boolean };
  openGraph: { title: string; description: string; images: [typeof ogImage] };
}> {
  const seo = await getSeo(path, locale);
  const title = seo?.title ?? base.title;
  const description = seo?.description ?? base.description;
  return {
    title, description,
    alternates: alternates(locale, path),
    ...(seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    // The image has to be repeated here. openGraph is merged shallowly, so a
    // page that names its own title drops everything the layout set.
    openGraph: { title, description, images: [ogImage] },
  };
}
