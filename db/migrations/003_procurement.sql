-- ─────────────────────────────────────────────────────────────
-- 003 — procurement, shipping, compliance, landed cost
--
-- The decision this file exists to get right: freight is NOT allocated by
-- value. A container is sold by the space it holds, so a large cheap tree
-- consumes far more of the freight bill than a small expensive one. Allocating
-- by value would make the cheap specimen look profitable and the expensive one
-- look bad — exactly backwards — and every pricing decision downstream would
-- inherit the error.
--
-- So each cost line carries its OWN allocation basis: freight by volume,
-- customs duty by value, handling by piece count. Nothing is assumed.
-- ─────────────────────────────────────────────────────────────

-- MOCCAE import permits expire six months from issue. An expired permit is a
-- container stuck at the port accruing storage while live trees sit in it, so
-- it is a first-class record with an expiry, not a file attachment.
CREATE TABLE IF NOT EXISTS import_permits (
  id            bigserial PRIMARY KEY,
  permit_number text NOT NULL,
  authority     text NOT NULL DEFAULT 'MOCCAE',
  issued_on     date NOT NULL,
  expires_on    date NOT NULL,
  scope         text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT permit_expiry_after_issue CHECK (expires_on > issued_on)
);
CREATE INDEX IF NOT EXISTS permits_expiry_idx ON import_permits (expires_on);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id             bigserial PRIMARY KEY,
  code           text UNIQUE NOT NULL,          -- PO-000014
  supplier_id    bigint REFERENCES suppliers(id) ON DELETE SET NULL,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN
                   ('draft','sent','confirmed','preparing','shipped','received','cancelled')),
  currency       char(3) NOT NULL DEFAULT 'EUR',
  -- Incoterms decide who pays which leg, so they decide what belongs in the
  -- landed cost at all.
  incoterm       text CHECK (incoterm IN ('EXW','FCA','FOB','CFR','CIF','DAP','DDP')),
  ordered_on     date,
  expected_ship  date,
  notes          text,
  created_by     bigint REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id            bigserial PRIMARY KEY,
  po_id         bigint NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_ref   text NOT NULL,
  description   text,
  quantity      integer NOT NULL CHECK (quantity > 0),
  unit_cost     numeric(12,2) NOT NULL DEFAULT 0,
  -- Volume drives the freight share, so it is captured at order time rather
  -- than guessed later.
  unit_volume_m3 numeric(10,3),
  unit_weight_kg numeric(10,2),
  is_specimen   boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS po_items_po_idx ON purchase_order_items (po_id);

CREATE TABLE IF NOT EXISTS shipments (
  id              bigserial PRIMARY KEY,
  code            text UNIQUE NOT NULL,         -- SHP-000007
  supplier_id     bigint REFERENCES suppliers(id) ON DELETE SET NULL,
  po_id           bigint REFERENCES purchase_orders(id) ON DELETE SET NULL,
  permit_id       bigint REFERENCES import_permits(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'planned' CHECK (status IN
                    ('planned','booked','in_transit','arrived','customs','cleared','received','cancelled')),
  incoterm        text CHECK (incoterm IN ('EXW','FCA','FOB','CFR','CIF','DAP','DDP')),
  origin_port     text,
  destination_port text,
  carrier         text,
  container_no    text,
  bl_number       text,
  etd             date,
  eta             date,
  arrived_on      date,
  cleared_on      date,
  to_location     bigint REFERENCES inventory_locations(id) ON DELETE SET NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipments_status_idx ON shipments (status);
CREATE INDEX IF NOT EXISTS shipments_eta_idx    ON shipments (eta);

CREATE TABLE IF NOT EXISTS shipment_items (
  id             bigserial PRIMARY KEY,
  shipment_id    bigint NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  po_item_id     bigint REFERENCES purchase_order_items(id) ON DELETE SET NULL,
  product_ref    text NOT NULL,
  description    text,
  quantity       integer NOT NULL CHECK (quantity > 0),
  unit_cost      numeric(12,2) NOT NULL DEFAULT 0,
  cost_currency  char(3) NOT NULL DEFAULT 'EUR',
  -- Locked when the shipment is costed. Recomputing history against today's
  -- rate would silently rewrite last quarter's margins.
  fx_rate_to_aed numeric(12,6),
  unit_volume_m3 numeric(10,3),
  unit_weight_kg numeric(10,2),
  is_specimen    boolean NOT NULL DEFAULT true,
  received_qty   integer NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
  damaged_qty    integer NOT NULL DEFAULT 0 CHECK (damaged_qty >= 0),
  rejected_qty   integer NOT NULL DEFAULT 0 CHECK (rejected_qty >= 0),
  CONSTRAINT received_within_quantity CHECK (received_qty + damaged_qty + rejected_qty <= quantity)
);
CREATE INDEX IF NOT EXISTS shipment_items_idx ON shipment_items (shipment_id);

-- Every cost that lands on a consignment, each with the basis it should be
-- spread by. Freight by volume, duty by value, handling per piece.
CREATE TABLE IF NOT EXISTS shipment_costs (
  id             bigserial PRIMARY KEY,
  shipment_id    bigint NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  kind           text NOT NULL CHECK (kind IN
                   ('freight','insurance','customs_duty','clearance','handling',
                    'inland_transport','storage','inspection','other')),
  description    text,
  amount         numeric(12,2) NOT NULL,
  currency       char(3) NOT NULL DEFAULT 'AED',
  fx_rate_to_aed numeric(12,6) NOT NULL DEFAULT 1,
  allocation     text NOT NULL DEFAULT 'volume' CHECK (allocation IN
                   ('volume','weight','value','count')),
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipment_costs_idx ON shipment_costs (shipment_id);

-- Not "upload a file" — a checklist with a state, because a missing
-- phytosanitary certificate stops the consignment at the border.
CREATE TABLE IF NOT EXISTS shipment_documents (
  id           bigserial PRIMARY KEY,
  shipment_id  bigint NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN
                 ('import_permit','phytosanitary','cites','invoice','packing_list',
                  'bill_of_lading','certificate_of_origin','customs_declaration','other')),
  reference    text,
  status       text NOT NULL DEFAULT 'required' CHECK (status IN
                 ('required','requested','received','verified','not_applicable')),
  issued_on    date,
  expires_on   date,
  note         text,
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipment_docs_idx ON shipment_documents (shipment_id);
