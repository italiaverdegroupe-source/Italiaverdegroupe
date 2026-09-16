import { query } from '@/lib/db';
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

export type Shipment = {
  id: string; code: string; status: string; incoterm: string | null;
  supplier_name: string | null; carrier: string | null; container_no: string | null;
  bl_number: string | null; origin_port: string | null; destination_port: string | null;
  etd: string | null; eta: string | null; arrived_on: string | null; cleared_on: string | null;
  to_location: string | null; location_name: string | null; notes: string | null;
  permit_number: string | null; permit_expires_on: string | null;
  item_count: string; total_qty: string;
};

const SHIPMENT_SELECT = `
  SELECT s.id, s.code, s.status, s.incoterm, s.carrier, s.container_no, s.bl_number,
         s.origin_port, s.destination_port, s.etd, s.eta, s.arrived_on, s.cleared_on,
         s.to_location, s.notes,
         sup.name AS supplier_name, loc.name AS location_name,
         p.permit_number, p.expires_on AS permit_expires_on,
         (SELECT count(*) FROM shipment_items si WHERE si.shipment_id = s.id)::text AS item_count,
         COALESCE((SELECT sum(si.quantity) FROM shipment_items si WHERE si.shipment_id = s.id), 0)::text AS total_qty
    FROM shipments s
    LEFT JOIN suppliers sup ON sup.id = s.supplier_id
    LEFT JOIN inventory_locations loc ON loc.id = s.to_location
    LEFT JOIN import_permits p ON p.id = s.permit_id`;

export const listShipments = (status?: string) =>
  query<Shipment>(
    `${SHIPMENT_SELECT} ${status ? 'WHERE s.status = $1' : ''}
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
          issued_on: string | null; expires_on: string | null; note: string | null }>(
    `SELECT id, kind, reference, status, issued_on, expires_on, note
       FROM shipment_documents WHERE shipment_id = $1 ORDER BY kind`, [shipmentId]);

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
