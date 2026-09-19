import { query } from '@/lib/db';
import type { AdminKey } from '@/lib/admin-ui';
import { costShipment, type CostLine, type ShipmentLine, type CostedShipment } from '@/lib/landed-cost';

export const SHIPMENT_STATUSES = [
  'planned', 'booked', 'in_transit', 'arrived', 'customs', 'cleared', 'received', 'cancelled',
] as const;
export const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'] as const;
export const COST_KINDS = [
  'freight', 'insurance', 'customs_duty', 'clearance', 'handling',
  'inland_transport', 'storage', 'inspection', 'other',
] as const;
export const DOC_KINDS = [
  'import_permit', 'phytosanitary', 'cites', 'invoice', 'packing_list',
  'bill_of_lading', 'certificate_of_origin', 'customs_declaration', 'other',
] as const;
export const DOC_STATUSES = ['required', 'requested', 'received', 'verified', 'not_applicable'] as const;

export type DocKind = (typeof DOC_KINDS)[number];
export type DocStatus = (typeof DOC_STATUSES)[number];

/**
 * What each document is called by the people who chase it.
 *
 * Typed as AdminKey rather than string so the label is a translation key by
 * construction: a new document kind whose name nobody has translated is a
 * compile error, not an English row in an Arabic checklist.
 */
export const DOC_LABEL: Record<DocKind, AdminKey> = {
  import_permit: 'Import permit (MOCCAE)',
  phytosanitary: 'Phytosanitary certificate',
  cites: 'CITES certificate',
  invoice: 'Commercial invoice',
  packing_list: 'Packing list',
  bill_of_lading: 'Bill of lading / airway bill',
  certificate_of_origin: 'Certificate of origin',
  customs_declaration: 'Customs declaration',
  other: 'Other',
};

export const DOC_STATUS_LABEL: Record<DocStatus, AdminKey> = {
  required: 'Required',
  requested: 'Requested',
  received: 'Received',
  verified: 'Verified',
  not_applicable: 'Not applicable',
};

/**
 * What a consignment of live plants from Italy needs before it moves.
 *
 * CITES is left off: it applies to a minority of species and putting it on
 * every shipment would train whoever works the list to ignore rows. It is in
 * DOC_KINDS and one click away when a consignment actually needs one.
 */
export const STANDARD_CHECKLIST: DocKind[] = [
  'import_permit', 'phytosanitary', 'invoice', 'packing_list',
  'bill_of_lading', 'certificate_of_origin', 'customs_declaration',
];

export const isDocKind = (v: string): v is DocKind => (DOC_KINDS as readonly string[]).includes(v);
export const isDocStatus = (v: string): v is DocStatus => (DOC_STATUSES as readonly string[]).includes(v);

export type Shipment = {
  id: string; code: string; status: string; incoterm: string | null;
  supplier_name: string | null; carrier: string | null; container_no: string | null;
  bl_number: string | null; origin_port: string | null; destination_port: string | null;
  etd: string | null; eta: string | null; arrived_on: string | null; cleared_on: string | null;
  to_location: string | null; location_name: string | null; notes: string | null;
  permit_number: string | null; permit_expires_on: string | null;
  item_count: string; total_qty: string; deleted_at: string | null;
};

const SHIPMENT_SELECT = `
  SELECT s.id, s.code, s.status, s.incoterm, s.carrier, s.container_no, s.bl_number,
         s.origin_port, s.destination_port, s.etd, s.eta, s.arrived_on, s.cleared_on,
         s.to_location, s.notes, s.deleted_at,
         sup.name AS supplier_name, loc.name AS location_name,
         p.permit_number, p.expires_on AS permit_expires_on,
         (SELECT count(*) FROM shipment_items si WHERE si.shipment_id = s.id)::text AS item_count,
         COALESCE((SELECT sum(si.quantity) FROM shipment_items si WHERE si.shipment_id = s.id), 0)::text AS total_qty
    FROM shipments s
    LEFT JOIN suppliers sup ON sup.id = s.supplier_id
    LEFT JOIN inventory_locations loc ON loc.id = s.to_location
    LEFT JOIN import_permits p ON p.id = s.permit_id`;

export const listShipments = (status?: string, deleted = false) =>
  query<Shipment>(
    `${SHIPMENT_SELECT}
      WHERE s.deleted_at IS ${deleted ? 'NOT NULL' : 'NULL'}
            ${status ? 'AND s.status = $1' : ''}
     ORDER BY COALESCE(s.eta, s.etd) DESC NULLS LAST, s.id DESC LIMIT 200`,
    status ? [status] : []);

export async function getShipment(code: string): Promise<Shipment | undefined> {
  return (await query<Shipment>(`${SHIPMENT_SELECT} WHERE s.code = $1`, [code]))[0];
}

type ItemRow = ShipmentLine & { id: string; received_qty: number; damaged_qty: number; rejected_qty: number; is_specimen: boolean };

export const getShipmentItems = (shipmentId: string) =>
  query<ItemRow>(
    `SELECT id, product_ref, description, quantity,
            unit_cost::float8   AS unit_cost,
            cost_currency,
            fx_rate_to_aed::float8 AS fx_rate_to_aed,
            unit_volume_m3::float8 AS unit_volume_m3,
            unit_weight_kg::float8 AS unit_weight_kg,
            is_specimen, received_qty, damaged_qty, rejected_qty
       FROM shipment_items WHERE shipment_id = $1 ORDER BY id`, [shipmentId]);

export const getShipmentCosts = (shipmentId: string) =>
  query<CostLine & { id: string }>(
    `SELECT id, kind, description, amount::float8 AS amount, currency,
            fx_rate_to_aed::float8 AS fx_rate_to_aed, allocation
       FROM shipment_costs WHERE shipment_id = $1 ORDER BY id`, [shipmentId]);

export const getShipmentDocuments = (shipmentId: string) =>
  query<{ id: string; kind: string; reference: string | null; status: string;
          issued_on: string | null; expires_on: string | null; note: string | null;
          days_to_expiry: string | null }>(
    // The countdown is measured against the clock that stored the date, not
    // the web server's — and it means the page never has to read the time
    // while it renders.
    `SELECT id, kind, reference, status, issued_on::text, expires_on::text, note,
            (expires_on - current_date)::text AS days_to_expiry
       FROM shipment_documents
      WHERE shipment_id = $1
      -- Outstanding first, and inside that the soonest deadline: the order
      -- somebody chasing paperwork actually works in.
      ORDER BY (status IN ('verified','not_applicable')),
               expires_on NULLS LAST, kind`, [shipmentId]);

/**
 * Create, update and remove one compliance document.
 *
 * The table has CHECK constraints on kind and status, so an unexpected value
 * arrives as a Postgres error and a 500 rather than a message. Validated here
 * instead: a form posts strings, and a string from a form is an assertion, not
 * a fact.
 */
export async function saveShipmentDocument(input: {
  shipmentId: string;
  id?: string | null;
  kind: string;
  reference?: string | null;
  status: string;
  issuedOn?: string | null;
  expiresOn?: string | null;
  note?: string | null;
}): Promise<void> {
  if (!isDocKind(input.kind)) throw new Error(`Unknown document type: ${input.kind}`);
  if (!isDocStatus(input.status)) throw new Error(`Unknown document status: ${input.status}`);

  const blank = (v: string | null | undefined) => {
    const t = (v ?? '').trim();
    return t === '' ? null : t;
  };
  const vals = [
    input.kind, blank(input.reference), input.status,
    blank(input.issuedOn), blank(input.expiresOn), blank(input.note),
  ];

  if (input.id) {
    await query(
      `UPDATE shipment_documents
          SET kind=$1, reference=$2, status=$3, issued_on=$4, expires_on=$5,
              note=$6, updated_at=now()
        WHERE id=$7 AND shipment_id=$8`,
      [...vals, input.id, input.shipmentId]);
    return;
  }
  await query(
    `INSERT INTO shipment_documents
       (shipment_id, kind, reference, status, issued_on, expires_on, note)
     VALUES ($7,$1,$2,$3,$4,$5,$6)`,
    [...vals, input.shipmentId]);
}

export async function removeShipmentDocument(shipmentId: string, id: string): Promise<void> {
  await query(`DELETE FROM shipment_documents WHERE id = $1 AND shipment_id = $2`,
    [id, shipmentId]);
}

/**
 * Put the standard checklist on a shipment that has none.
 *
 * Skips anything already there, so pressing it twice does not produce two
 * phytosanitary rows, and returns how many it actually added.
 */
export async function seedShipmentChecklist(shipmentId: string): Promise<number> {
  const rows = await query<{ n: string }>(
    `INSERT INTO shipment_documents (shipment_id, kind, status)
     SELECT $1, k, 'required'
       FROM unnest($2::text[]) AS k
      WHERE NOT EXISTS (
        SELECT 1 FROM shipment_documents d
         WHERE d.shipment_id = $1 AND d.kind = k)
     RETURNING 1 AS n`,
    [shipmentId, STANDARD_CHECKLIST]);
  return rows.length;
}

/** Items + costs, run through the allocation engine. */
export async function costOf(shipmentId: string): Promise<CostedShipment & { items: ItemRow[] }> {
  const [items, costs] = await Promise.all([
    getShipmentItems(shipmentId), getShipmentCosts(shipmentId),
  ]);
  return { ...costShipment(items, costs), items };
}

export type Permit = {
  id: string; permit_number: string; authority: string;
  issued_on: string; expires_on: string; scope: string | null; days_left: number;
};

export const listPermits = () =>
  query<Permit>(
    `SELECT id, permit_number, authority, issued_on, expires_on, scope,
            (expires_on - current_date) AS days_left
       FROM import_permits ORDER BY expires_on`);

/**
 * Permits about to lapse. An expired MOCCAE permit means a container sitting
 * at the port accruing storage with live trees inside it, so this is surfaced
 * on the overview rather than waiting to be looked for.
 */
export const expiringPermits = (withinDays = 45) =>
  query<Permit>(
    `SELECT id, permit_number, authority, issued_on, expires_on, scope,
            (expires_on - current_date) AS days_left
       FROM import_permits
      WHERE expires_on <= current_date + ($1 || ' days')::interval
      ORDER BY expires_on`, [String(withinDays)]);

export async function nextShipmentCode(): Promise<string> {
  const rows = await query<{ n: string | null }>(
    `SELECT max(substring(code from '[0-9]+$')::bigint)::text AS n
       FROM shipments WHERE code LIKE 'SHP-%'`);
  return `SHP-${String(Number(rows[0]?.n ?? 0) + 1).padStart(6, '0')}`;
}
