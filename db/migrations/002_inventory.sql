-- ─────────────────────────────────────────────────────────────
-- 002 — inventory
--
-- The decision this file exists to get right: trees are not one kind of
-- stock. An ancient olive is a UNIQUE asset — its own trunk, its own photos,
-- its own cost and its own price, quantity always one. A pallet of identical
-- 2 m ficus is FUNGIBLE — any one is as good as another, quantity is a number.
--
-- Modelling both as "product + quantity" is the mistake that forces a rebuild
-- once the first six-figure specimen is sold, so they are separate tables over
-- a shared product, and a single movements ledger explains every change to
-- either.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS suppliers (
  id            bigserial PRIMARY KEY,
  name          text NOT NULL,
  country       text NOT NULL DEFAULT 'Italy',
  region        text,
  contact_name  text,
  email         text,
  phone         text,
  currency      char(3) NOT NULL DEFAULT 'EUR',
  payment_terms text,
  lead_time_days integer,
  notes         text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_locations (
  id         bigserial PRIMARY KEY,
  code       text UNIQUE NOT NULL,
  name       text NOT NULL,
  kind       text NOT NULL CHECK (kind IN
               ('nursery','warehouse','supplier','transit','client_site','temporary')),
  emirate    text,
  -- Stock physically present somewhere that cannot sell from it (a supplier's
  -- yard in Puglia, a container at sea) must never count as available.
  sellable   boolean NOT NULL DEFAULT true,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── individually tracked specimens ───────────────────────────
CREATE TABLE IF NOT EXISTS stock_items (
  id            bigserial PRIMARY KEY,
  code          text UNIQUE NOT NULL,          -- TREE-000417
  product_ref   text NOT NULL,                 -- VG-OL-007, the catalogue type
  supplier_id   bigint REFERENCES suppliers(id) ON DELETE SET NULL,
  location_id   bigint REFERENCES inventory_locations(id) ON DELETE SET NULL,

  status        text NOT NULL DEFAULT 'incoming' CHECK (status IN
                  ('incoming','acclimatising','available','reserved','sold','dead','written_off')),
  -- Arrived stock is NOT sellable stock. An Italian tree needs weeks to adjust
  -- to the Gulf before it can be promised to anyone.
  health        text NOT NULL DEFAULT 'good' CHECK (health IN
                  ('excellent','good','stressed','critical','dead')),
  grade         text CHECK (grade IN ('A','B','C')),

  acquired_at        date,
  arrived_at         date,
  acclimatised_until date,

  purchase_cost      numeric(12,2),
  purchase_currency  char(3) NOT NULL DEFAULT 'EUR',
  fx_rate_to_aed     numeric(12,6),            -- locked at purchase, never live
  landed_cost_aed    numeric(12,2),
  asking_price_aed   numeric(12,2),

  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_items_product_idx  ON stock_items (product_ref);
CREATE INDEX IF NOT EXISTS stock_items_status_idx   ON stock_items (status);
CREATE INDEX IF NOT EXISTS stock_items_location_idx ON stock_items (location_id);

-- A tree grows. Height and girth are observations with a date, not fixed
-- attributes of the product.
CREATE TABLE IF NOT EXISTS specimen_measurements (
  id              bigserial PRIMARY KEY,
  stock_item_id   bigint NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
  measured_at     date NOT NULL DEFAULT current_date,
  measured_by     bigint REFERENCES users(id) ON DELETE SET NULL,
  height_m        numeric(6,2),
  trunk_girth_cm  numeric(6,1),
  crown_width_m   numeric(6,2),
  pot_litres      integer,
  note            text
);
CREATE INDEX IF NOT EXISTS measurements_item_idx ON specimen_measurements (stock_item_id, measured_at DESC);

-- ── fungible stock ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_batches (
  id            bigserial PRIMARY KEY,
  code          text UNIQUE NOT NULL,          -- LOT-000128
  product_ref   text NOT NULL,
  supplier_id   bigint REFERENCES suppliers(id) ON DELETE SET NULL,
  location_id   bigint REFERENCES inventory_locations(id) ON DELETE SET NULL,

  quantity      integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved      integer NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  -- Reserving more than exists is a bug that would otherwise surface as an
  -- oversold order weeks later.
  CONSTRAINT batch_reserved_within_quantity CHECK (reserved <= quantity),

  status        text NOT NULL DEFAULT 'incoming' CHECK (status IN
                  ('incoming','acclimatising','available','depleted')),
  health        text NOT NULL DEFAULT 'good',

  size_label    text,
  arrived_at    date,
  acclimatised_until date,

  unit_cost         numeric(12,2),
  purchase_currency char(3) NOT NULL DEFAULT 'EUR',
  fx_rate_to_aed    numeric(12,6),
  landed_unit_cost_aed numeric(12,2),
  unit_price_aed       numeric(12,2),

  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_batches_product_idx ON stock_batches (product_ref);
CREATE INDEX IF NOT EXISTS stock_batches_status_idx  ON stock_batches (status);

-- ── one ledger explains every change ─────────────────────────
CREATE TABLE IF NOT EXISTS inventory_movements (
  id            bigserial PRIMARY KEY,
  at            timestamptz NOT NULL DEFAULT now(),
  user_id       bigint REFERENCES users(id) ON DELETE SET NULL,
  user_email    text,

  stock_item_id bigint REFERENCES stock_items(id) ON DELETE CASCADE,
  batch_id      bigint REFERENCES stock_batches(id) ON DELETE CASCADE,
  -- Exactly one of the two: a movement is either about a specimen or a lot.
  CONSTRAINT movement_targets_one CHECK (
    (stock_item_id IS NOT NULL) <> (batch_id IS NOT NULL)),

  kind          text NOT NULL CHECK (kind IN (
                  'receipt','transfer','status_change','reserve','release',
                  'sale','mortality','damage','downgrade','adjustment','write_off')),
  quantity      integer NOT NULL DEFAULT 1,
  from_location bigint REFERENCES inventory_locations(id) ON DELETE SET NULL,
  to_location   bigint REFERENCES inventory_locations(id) ON DELETE SET NULL,
  from_status   text,
  to_status     text,
  reason        text,
  note          text,
  ref_type      text,                          -- quote | order | shipment
  ref_id        text
);
CREATE INDEX IF NOT EXISTS movements_item_idx  ON inventory_movements (stock_item_id, at DESC);
CREATE INDEX IF NOT EXISTS movements_batch_idx ON inventory_movements (batch_id, at DESC);
CREATE INDEX IF NOT EXISTS movements_at_idx    ON inventory_movements (at DESC);
