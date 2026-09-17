-- Content in three languages.
--
-- Every table here held exactly one version of each thing, keyed by what the
-- thing IS — a block key, a path, a slug. A translation is the same thing in
-- another language, so the key becomes (what it is, which language) and
-- nothing else about the shape changes.
--
-- WHY A ROW PER LANGUAGE AND NOT A COLUMN PER LANGUAGE. `value_en, value_ar,
-- value_it` would mean a migration and a deploy to add a fourth language, and
-- every query would name all three for ever. A row per language is one CHECK
-- constraint to widen.
--
-- WHAT AN ABSENT ROW MEANS. Not "blank" — "not translated yet". Every read
-- falls back: the asked-for language, then English, then the default compiled
-- into the code. So Arabic can go live with the homepage translated and the
-- journal not, and the journal reads English rather than rendering an empty
-- page. That is the difference between shipping a language progressively and
-- having to finish all 6,940 words before anybody can see any of them.

-- ── the shared vocabulary ────────────────────────────────────
DO $$ BEGIN
  CREATE DOMAIN locale_code AS text CHECK (VALUE IN ('en', 'ar', 'it'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── short blocks: headlines, buttons, labels ─────────────────
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS locale locale_code NOT NULL DEFAULT 'en';
ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_pkey;
-- Existing rows are all English by definition — they were written when the
-- site had one language — so the default above is the whole of the backfill.
ALTER TABLE content_blocks ADD PRIMARY KEY (key, locale);

-- ── per-page SEO ─────────────────────────────────────────────
ALTER TABLE page_seo ADD COLUMN IF NOT EXISTS locale locale_code NOT NULL DEFAULT 'en';
ALTER TABLE page_seo DROP CONSTRAINT IF EXISTS page_seo_pkey;
ALTER TABLE page_seo ADD PRIMARY KEY (path, locale);

-- ── long-form pages ──────────────────────────────────────────
-- The legal pages, About and Services are 5,300 words written into React
-- components, which means they cannot be edited from the console at all and
-- cannot be translated without a deploy. Broken into content blocks they would
-- become several hundred fields nobody could navigate; they belong here, as
-- documents, in the same safe markdown subset the journal already renders.
CREATE TABLE IF NOT EXISTS page_docs (
  slug       text NOT NULL,
  locale     locale_code NOT NULL,
  title      text NOT NULL,
  intro      text,
  body       text NOT NULL,
  updated_on date,                       -- what the page prints as "last updated"
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by bigint REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (slug, locale)
);

-- ── the catalogue ────────────────────────────────────────────
-- products.json stays the source of truth for references, photographs, sizes
-- and families. Only the two human-readable fields are translatable, and they
-- live here so translating a specimen does not mean a deploy.
--
-- The botanical name is NOT in this table. Olea europaea is Olea europaea in
-- every language — that is the entire point of binomial nomenclature — and a
-- field inviting somebody to translate it is a field inviting a mistake.
CREATE TABLE IF NOT EXISTS product_translations (
  reference   text NOT NULL,
  locale      locale_code NOT NULL,
  name        text,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  bigint REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (reference, locale)
);

-- ── the journal ──────────────────────────────────────────────
-- A translated article is the same article, so it keeps its slug and the URL
-- differs only by the language prefix: /journal/x and /ar/journal/x. The
-- uniqueness that used to be on the slug alone moves to the pair, or the
-- Arabic version could never be inserted.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS locale locale_code NOT NULL DEFAULT 'en';
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_slug_key;
DO $$ BEGIN
  ALTER TABLE posts ADD CONSTRAINT posts_slug_locale_key UNIQUE (slug, locale);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- ── FAQs and testimonials ────────────────────────────────────
-- These have generated ids rather than natural keys, so a translation is a
-- row that points at the original instead of sharing its key. translation_of
-- NULL means this IS an original.
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS locale locale_code NOT NULL DEFAULT 'en';
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS translation_of bigint
  REFERENCES faqs(id) ON DELETE CASCADE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS locale locale_code NOT NULL DEFAULT 'en';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS translation_of bigint
  REFERENCES testimonials(id) ON DELETE CASCADE;

-- Reads are always "this language, for this page", so that is the index.
CREATE INDEX IF NOT EXISTS content_blocks_locale_idx ON content_blocks (locale);
CREATE INDEX IF NOT EXISTS posts_locale_live_idx ON posts (locale, published_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS faqs_locale_idx ON faqs (locale) WHERE is_published;
CREATE INDEX IF NOT EXISTS testimonials_locale_idx ON testimonials (locale) WHERE is_published;
