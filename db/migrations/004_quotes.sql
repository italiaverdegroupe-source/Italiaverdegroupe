-- ─────────────────────────────────────────────────────────────
-- 004 — quotations
--
-- Three decisions this file exists to get right:
--
-- 1. An issued quotation is never edited. Changing a price or a quantity
--    creates a NEW VERSION and supersedes the old one, because the customer
--    is holding a document and "what did we actually quote?" must stay
--    answerable.
--
-- 2. Every number is SNAPSHOT onto the line: unit price, landed cost, VAT
--    rate, whether VAT applied at all. Looking them up live would rewrite
--    last quarter's quotations the day a setting changes.
--
-- 3. Accepting a quotation RESERVES stock under a row lock, so two
--    salespeople cannot sell the same specimen.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotes (
  id             bigserial PRIMARY KEY,
  code           text NOT NULL,                  -- QT-000042, shared across versions
  version        integer NOT NULL DEFAULT 1,
  supersedes_id  bigint REFERENCES quotes(id) ON DELETE SET NULL,
  UNIQUE (code, version),

  lead_id        bigint REFERENCES leads(id) ON DELETE SET NULL,
  customer_name    text NOT NULL,
  customer_company text,
  customer_email   text,
  customer_phone   text,
  emirate          text,
  project_name     text,

  status         text NOT NULL DEFAULT 'draft' CHECK (status IN
                   ('draft','sent','viewed','negotiation','accepted','rejected','expired','superseded')),
  currency       char(3) NOT NULL DEFAULT 'AED',

  -- Snapshot of the tax position at issue. A quotation issued before the
  -- company held a TRN must never acquire a VAT line later because a setting
  -- changed; charging VAT without registration is an offence, and rewriting
  -- history to look compliant is worse than the original gap.
  vat_enabled    boolean NOT NULL DEFAULT false,
  vat_rate       numeric(5,4) NOT NULL DEFAULT 0,
  trn_at_issue   text,

  issued_on      date,
  valid_until    date,
  accepted_on    date,

  delivery_terms text,
  payment_terms  text,
  terms          text,
  notes          text,
  internal_note  text,

  created_by     bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);
CREATE INDEX IF NOT EXISTS quotes_lead_idx   ON quotes (lead_id);
CREATE INDEX IF NOT EXISTS quotes_code_idx   ON quotes (code, version DESC);

CREATE TABLE IF NOT EXISTS quote_items (
  id            bigserial PRIMARY KEY,
  quote_id      bigint NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_no       integer NOT NULL DEFAULT 1,

  kind          text NOT NULL DEFAULT 'product' CHECK (kind IN ('specimen','product','service')),
  -- A specimen line points at one tree and can only ever be quantity 1.
  stock_item_id bigint REFERENCES stock_items(id) ON DELETE SET NULL,
  batch_id      bigint REFERENCES stock_batches(id) ON DELETE SET NULL,
  product_ref   text,
  description   text NOT NULL,

  quantity      integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price    numeric(12,2) NOT NULL DEFAULT 0,
  discount_pct  numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct <= 100),

  -- Snapshot so margin reporting reflects what was true when the price was
  -- given, not what the landed cost happens to be today.
  landed_unit_cost_aed numeric(12,2),

  CONSTRAINT specimen_line_is_single CHECK (kind <> 'specimen' OR quantity = 1),
  CONSTRAINT specimen_line_has_item  CHECK (kind <> 'specimen' OR stock_item_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS quote_items_idx ON quote_items (quote_id, line_no);

-- One specimen cannot sit on two live quotations at once.
CREATE UNIQUE INDEX IF NOT EXISTS quote_items_specimen_unique
  ON quote_items (stock_item_id)
  WHERE stock_item_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS quote_events (
  id         bigserial PRIMARY KEY,
  quote_id   bigint NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  at         timestamptz NOT NULL DEFAULT now(),
  user_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  user_email text,
  kind       text NOT NULL,
  note       text
);
CREATE INDEX IF NOT EXISTS quote_events_idx ON quote_events (quote_id, at DESC);
