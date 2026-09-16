-- ─────────────────────────────────────────────────────────────
-- 007 — editable site content: copy, SEO, FAQs, testimonials, posts
--
-- Decisions this file exists to get right:
--
-- 1. CONTENT LAYERS OVER CODE, IT DOES NOT REPLACE IT. Every block has a
--    compiled default. The table holds only what somebody has actually
--    changed, so an empty table renders the site exactly as it ships and a
--    database outage cannot blank the homepage. Same rule the settings table
--    follows, for the same reason.
--
-- 2. A TESTIMONIAL IS A CLAIM ABOUT A REAL PERSON. It carries who said it and
--    the date they agreed to be quoted, and the console refuses to publish one
--    without both. Inventing praise is a legal and reputational risk, not a
--    copywriting shortcut, so the schema makes the honest path the only path.
--
-- 3. SEO IS PER ROUTE, AND OVERRIDES RATHER THAN REPLACES. A row here changes
--    one page's title or description; anything not set keeps what the code
--    generates from the catalogue, which is already correct for 68 products.
-- ─────────────────────────────────────────────────────────────

-- Named pieces of copy on the marketing pages. The key is the identity; the
-- catalogue of keys lives in code beside the defaults.
CREATE TABLE IF NOT EXISTS content_blocks (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by bigint REFERENCES users(id) ON DELETE SET NULL
);

-- One row per route that somebody has chosen to write metadata for.
CREATE TABLE IF NOT EXISTS page_seo (
  path        text PRIMARY KEY,            -- '/', '/services', '/about'
  title       text,
  description text,
  -- Reuses a catalogue photograph rather than an upload: there is no file
  -- store configured, and a broken image link is worse than a known one.
  og_ref      text,
  noindex     boolean NOT NULL DEFAULT false,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  bigint REFERENCES users(id) ON DELETE SET NULL
);

-- Questions customers actually ask. Published ones also feed FAQPage
-- structured data, which is how they reach a search result.
CREATE TABLE IF NOT EXISTS faqs (
  id           bigserial PRIMARY KEY,
  question     text NOT NULL,
  answer       text NOT NULL,
  category     text NOT NULL DEFAULT 'general'
               CHECK (category IN ('general','buying','delivery','planting','care','import','payment')),
  sort_order   integer NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   bigint REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS faqs_live_idx ON faqs (category, sort_order) WHERE is_published;

CREATE TABLE IF NOT EXISTS testimonials (
  id           bigserial PRIMARY KEY,
  body         text NOT NULL,
  author_name  text NOT NULL,
  author_role  text,
  company      text,
  emirate      text,
  project      text,
  -- The date the person agreed to be quoted publicly. Publishing is refused
  -- without it: a testimonial nobody consented to is a liability.
  consent_on   date,
  consent_note text,
  sort_order   integer NOT NULL DEFAULT 100,
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   bigint REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS testimonials_live_idx ON testimonials (sort_order) WHERE is_published;

-- The blog. Its job is search traffic for the questions a UAE buyer types
-- before they know the company exists, so every post carries its own metadata.
CREATE TABLE IF NOT EXISTS posts (
  id           bigserial PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  excerpt      text,
  body         text NOT NULL,             -- a safe markdown subset, rendered in code
  cover_ref    text,                      -- a catalogue reference, not an upload
  author       text,
  status       text NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published')),
  published_at timestamptz,
  seo_title    text,
  seo_description text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   bigint REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS posts_live_idx ON posts (published_at DESC) WHERE status = 'published';

-- A published post must have a date, or it cannot be ordered or dated on the
-- page. Enforced here rather than trusted to the form.
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_published_has_date;
ALTER TABLE posts ADD CONSTRAINT posts_published_has_date
  CHECK (status <> 'published' OR published_at IS NOT NULL);

ALTER TABLE testimonials DROP CONSTRAINT IF EXISTS testimonials_published_has_consent;
ALTER TABLE testimonials ADD CONSTRAINT testimonials_published_has_consent
  CHECK (is_published = false OR consent_on IS NOT NULL);
