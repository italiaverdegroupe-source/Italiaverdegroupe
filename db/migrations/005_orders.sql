-- ─────────────────────────────────────────────────────────────
-- 005 — customers, orders, deliveries, invoices, payments
--
-- Decisions this file exists to get right:
--
-- 1. FULFILMENT IS PARTIAL. An order for 200 trees arrives in three
--    containers over two months. Progress is tracked per LINE with a
--    cumulative delivered quantity, not as one status on the order. A single
--    linear status cannot express "80 delivered, 60 in transit, 60 still in
--    Italy", which is the normal state of this business.
--
-- 2. UAE B2B PAYMENT REALITY. A customer LPO number, an advance, and
--    retention held for months after handover are the norm on landscaping
--    work, not edge cases. An invoice total that ignores them does not match
--    the cash that arrives.
--
-- 3. CREDIT IS THE CASH-FLOW RISK. Contractors pay late. A credit limit and
--    an ageing view are the difference between a busy year and an insolvent
--    one, so they are in the schema rather than in a spreadsheet.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id             bigserial PRIMARY KEY,
  code           text UNIQUE NOT NULL,
  name           text NOT NULL,
  company        text,
  segment        text CHECK (segment IN
                   ('developer','landscaping','hotel','nursery','retail','government','vip')),
  email          text,
  phone          text,
  emirate        text,
  address        text,
  trn            text,
  jurisdiction   text NOT NULL DEFAULT 'mainland'
                 CHECK (jurisdiction IN ('mainland','free_zone','gcc_export','international')),
  credit_limit_aed numeric(12,2) NOT NULL DEFAULT 0,
  payment_terms_days integer NOT NULL DEFAULT 30,
  notes          text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customers_name_idx ON customers (lower(name));

CREATE TABLE IF NOT EXISTS orders (
  id             bigserial PRIMARY KEY,
  code           text UNIQUE NOT NULL,
  quote_id       bigint REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id    bigint REFERENCES customers(id) ON DELETE SET NULL,

  customer_name    text NOT NULL,
  customer_company text,
  customer_email   text,
  customer_phone   text,
  emirate          text,
  project_name     text,
  site_address     text,

  -- A UAE B2B customer's accounts department pays against their own LPO
  -- number. Without it on the invoice, the invoice waits.
  lpo_number     text,

  status         text NOT NULL DEFAULT 'confirmed' CHECK (status IN
                   ('confirmed','preparing','partially_delivered','delivered','completed','cancelled')),
  currency       char(3) NOT NULL DEFAULT 'AED',
  vat_enabled    boolean NOT NULL DEFAULT false,
  vat_rate       numeric(5,4) NOT NULL DEFAULT 0,

  advance_pct    numeric(5,2) NOT NULL DEFAULT 0 CHECK (advance_pct BETWEEN 0 AND 100),
  -- Standard on UAE landscaping work: a slice held back for months after
  -- handover. Treating it as revenue on delivery overstates available cash.
  retention_pct  numeric(5,2) NOT NULL DEFAULT 0 CHECK (retention_pct BETWEEN 0 AND 100),
  retention_release_on date,

  confirmed_on   date NOT NULL DEFAULT current_date,
  required_by    date,
  completed_on   date,
  notes          text,
  created_by     bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_status_idx   ON orders (status);
CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders (customer_id);

CREATE TABLE IF NOT EXISTS order_items (
  id            bigserial PRIMARY KEY,
  order_id      bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_no       integer NOT NULL DEFAULT 1,
  kind          text NOT NULL DEFAULT 'product' CHECK (kind IN ('specimen','product','service')),
  stock_item_id bigint REFERENCES stock_items(id) ON DELETE SET NULL,
  batch_id      bigint REFERENCES stock_batches(id) ON DELETE SET NULL,
  product_ref   text,
  description   text NOT NULL,
  quantity      integer NOT NULL CHECK (quantity > 0),
  -- Accumulates across deliveries. This is what makes partial fulfilment
  -- expressible at all.
  delivered_qty integer NOT NULL DEFAULT 0 CHECK (delivered_qty >= 0),
  unit_price    numeric(12,2) NOT NULL DEFAULT 0,
  discount_pct  numeric(5,2) NOT NULL DEFAULT 0,
  landed_unit_cost_aed numeric(12,2),
  CONSTRAINT delivered_within_ordered CHECK (delivered_qty <= quantity)
);
CREATE INDEX IF NOT EXISTS order_items_idx ON order_items (order_id, line_no);

CREATE TABLE IF NOT EXISTS deliveries (
  id            bigserial PRIMARY KEY,
  code          text UNIQUE NOT NULL,
  order_id      bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'scheduled' CHECK (status IN
                  ('scheduled','loaded','out_for_delivery','delivered','failed','cancelled')),
  scheduled_for date,
  window_from   text,
  window_to     text,
  delivered_at  timestamptz,

  site_address  text,
  site_contact  text,
  site_phone    text,
  -- Trees are not parcels: access and lifting gear decide whether a delivery
  -- is even possible, so they are recorded before the van is booked.
  equipment     text,
  vehicle       text,
  driver        text,
  access_notes  text,

  received_by   text,
  proof_note    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deliveries_order_idx ON deliveries (order_id);
CREATE INDEX IF NOT EXISTS deliveries_date_idx  ON deliveries (scheduled_for);

CREATE TABLE IF NOT EXISTS delivery_items (
  id            bigserial PRIMARY KEY,
  delivery_id   bigint NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_item_id bigint NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  quantity      integer NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS delivery_items_idx ON delivery_items (delivery_id);

CREATE TABLE IF NOT EXISTS invoices (
  id            bigserial PRIMARY KEY,
  code          text UNIQUE NOT NULL,
  order_id      bigint REFERENCES orders(id) ON DELETE SET NULL,
  customer_id   bigint REFERENCES customers(id) ON DELETE SET NULL,
  kind          text NOT NULL DEFAULT 'tax_invoice' CHECK (kind IN
                  ('proforma','advance','tax_invoice','retention','credit_note')),
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN
                  ('draft','issued','part_paid','paid','overdue','cancelled')),

  -- Snapshot, like quotations: an invoice issued without a TRN must never
  -- acquire a VAT line because a setting changed later.
  vat_enabled   boolean NOT NULL DEFAULT false,
  vat_rate      numeric(5,4) NOT NULL DEFAULT 0,
  trn_at_issue  text,
  lpo_number    text,

  issued_on     date,
  due_on        date,
  currency      char(3) NOT NULL DEFAULT 'AED',
  net_aed       numeric(12,2) NOT NULL DEFAULT 0,
  vat_aed       numeric(12,2) NOT NULL DEFAULT 0,
  total_aed     numeric(12,2) NOT NULL DEFAULT 0,
  retention_aed numeric(12,2) NOT NULL DEFAULT 0,

  -- UAE e-invoicing is Peppol PINT AE: structured XML through an accredited
  -- provider, not a PDF. The identifiers it needs are captured now so the
  -- exporter is a mapping rather than a migration.
  pint_id       text,
  pint_status   text NOT NULL DEFAULT 'not_submitted' CHECK (pint_status IN
                  ('not_submitted','queued','accepted','rejected','not_applicable')),

  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoices_status_idx   ON invoices (status);
CREATE INDEX IF NOT EXISTS invoices_due_idx      ON invoices (due_on);
CREATE INDEX IF NOT EXISTS invoices_customer_idx ON invoices (customer_id);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id          bigserial PRIMARY KEY,
  invoice_id  bigint NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_no     integer NOT NULL DEFAULT 1,
  description text NOT NULL,
  quantity    numeric(12,2) NOT NULL DEFAULT 1,
  unit_price  numeric(12,2) NOT NULL DEFAULT 0,
  discount_pct numeric(5,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS invoice_lines_idx ON invoice_lines (invoice_id, line_no);

CREATE TABLE IF NOT EXISTS payments (
  id          bigserial PRIMARY KEY,
  invoice_id  bigint REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id bigint REFERENCES customers(id) ON DELETE SET NULL,
  amount_aed  numeric(12,2) NOT NULL CHECK (amount_aed <> 0),
  method      text CHECK (method IN ('bank_transfer','cheque','cash','card','other')),
  received_on date NOT NULL DEFAULT current_date,
  reference   text,
  note        text,
  recorded_by bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_invoice_idx ON payments (invoice_id);
