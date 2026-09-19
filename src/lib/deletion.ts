import { query } from '@/lib/db';
import type { SessionUser } from '@/lib/auth';
import { adminUi, type AdminKey } from '@/lib/admin-ui';

/**
 * Removing things, in one place, with one set of rules.
 *
 * The console could delete a FAQ and nothing else. No lead, no quotation, no
 * order, no invoice, no specimen — so a spam enquiry, a quotation raised
 * against the wrong customer and every row somebody typed while learning the
 * system stayed there permanently. The only way to remove any of it was a SQL
 * client, which is to say it never happened.
 *
 * TWO ACTIONS, AND THE DIFFERENCE MATTERS.
 *
 *   Delete      hides the row. Reversible, one click, available to anybody who
 *               can edit. The record survives, so the audit log that points at
 *               it still resolves and last week's report still adds up.
 *
 *   Delete for  removes it from the database. Owner only, refused while
 *   good      anything live still points at it, and audited BEFORE it runs —
 *               afterwards there is no row left to name.
 *
 * WHY THE SECOND ONE IS REFUSED RATHER THAN CASCADED. A cascade is how one
 * click on a customer takes four orders, nine invoices and the payments
 * against them. Refusing while a live child exists forces the deletion to
 * happen in the order somebody would have chosen anyway, and every step of it
 * is visible and reversible until the last.
 */

export type DeletableKind =
  | 'lead' | 'quote' | 'order' | 'invoice' | 'payment'
  | 'shipment' | 'specimen' | 'customer' | 'supplier' | 'delivery';

type Spec = {
  table: string;
  /** The column a person recognises the row by, used in the audit entry. */
  key: string;
  label: string;
  /** Live rows in these tables block a permanent delete, and say why. */
  children: { table: string; fk: string; label: string; soft: boolean }[];
  /**
   * A reason this row must never be permanently removed, whatever its
   * children. Returns the reason to show, or null to allow it.
   */
  guard?: (row: Record<string, unknown>) => BlockReason | null;
};

const SPECS: Record<DeletableKind, Spec> = {
  lead: {
    table: 'leads', key: 'reference', label: 'enquiry',
    children: [{ table: 'quotes', fk: 'lead_id', label: 'quotation', soft: true }],
  },
  quote: {
    table: 'quotes', key: 'code', label: 'quotation',
    children: [{ table: 'orders', fk: 'quote_id', label: 'order', soft: true }],
  },
  order: {
    table: 'orders', key: 'code', label: 'order',
    children: [
      { table: 'invoices', fk: 'order_id', label: 'invoice', soft: true },
      { table: 'deliveries', fk: 'order_id', label: 'delivery', soft: true },
    ],
  },
  invoice: {
    table: 'invoices', key: 'code', label: 'invoice',
    children: [{ table: 'payments', fk: 'invoice_id', label: 'payment', soft: true }],
    // An invoice that has been paid is an accounting record, and UAE
    // commercial and tax law requires those to be kept — which this site's own
    // terms of sale and privacy policy both state in writing. Deleting one is
    // not a preference, it is a breach, so it is refused rather than warned
    // about. Cancelling it leaves the record and marks it void, which is what
    // the law expects and what an auditor can follow.
    guard: (r) => (Number(r.paid ?? 0) > 0 ? { why: 'invoice-paid' } : null),
  },
  payment: {
    table: 'payments', key: 'reference', label: 'payment',
    children: [],
    guard: () => ({ why: 'payment' }),
  },
  delivery: {
    table: 'deliveries', key: 'code', label: 'delivery', children: [],
    // A delivered run has already moved the stock: the trees are off the
    // shelf and on somebody's site, and the order's delivered quantities were
    // derived from it. Removing the record would leave the quantities without
    // the event that produced them. Failing or cancelling it is the way back.
    guard: (r) => (r.status === 'delivered' ? { why: 'delivery-done' } : null),
  },
  shipment: {
    table: 'shipments', key: 'code', label: 'shipment',
    children: [
      { table: 'shipment_items', fk: 'shipment_id', label: 'shipment line', soft: false },
      { table: 'shipment_costs', fk: 'shipment_id', label: 'shipment cost', soft: false },
      { table: 'shipment_documents', fk: 'shipment_id', label: 'shipment document', soft: false },
    ],
  },
  specimen: {
    table: 'stock_items', key: 'code', label: 'specimen',
    children: [
      { table: 'quote_items', fk: 'stock_item_id', label: 'quotation line', soft: false },
      { table: 'order_items', fk: 'stock_item_id', label: 'order line', soft: false },
    ],
  },
  customer: {
    table: 'customers', key: 'code', label: 'customer',
    children: [
      { table: 'orders', fk: 'customer_id', label: 'order', soft: true },
      { table: 'invoices', fk: 'customer_id', label: 'invoice', soft: true },
      { table: 'payments', fk: 'customer_id', label: 'payment', soft: true },
    ],
  },
  supplier: {
    table: 'suppliers', key: 'code', label: 'supplier',
    children: [
      { table: 'stock_items', fk: 'supplier_id', label: 'specimen', soft: true },
      { table: 'purchase_orders', fk: 'supplier_id', label: 'purchase order', soft: true },
      { table: 'shipments', fk: 'supplier_id', label: 'shipment', soft: true },
    ],
  },
};

export const canDelete = (k: string): k is DeletableKind => k in SPECS;
export const specOf = (k: DeletableKind) => SPECS[k];

/** The row a guard is asked about, with the derived figures it needs. */
async function guardRow(kind: DeletableKind, code: string) {
  const s = SPECS[kind];
  const [row] = await query<Record<string, unknown>>(
    kind === 'invoice'
      ? `SELECT i.*, COALESCE((SELECT sum(amount_aed) FROM payments WHERE invoice_id = i.id), 0) AS paid
           FROM invoices i WHERE i.${s.key} = $1`
      : `SELECT * FROM ${s.table} WHERE ${s.key} = $1`, [code]);
  return row;
}

/**
 * Why this record must not be deleted at all — not even reversibly.
 *
 * The guard applies to BOTH deletions, which is the whole point of it. A paid
 * invoice hidden from the lists is a paid invoice missing from what is owed,
 * from the ageing and from the VAT return; "it is only hidden" is not a
 * defence to a tax inspector, so the reversible version is refused for the
 * same reason as the permanent one.
 */
export async function deleteCheck(kind: DeletableKind, code: string): Promise<BlockReason[]> {
  const s = SPECS[kind];
  if (!s.guard) return [];
  const row = await guardRow(kind, code);
  if (!row) return [{ why: 'gone' }];
  const why = s.guard(row);
  return why ? [why] : [];
}

/** True when this kind can never be removed, whatever the row says. */
export const alwaysKept = (kind: DeletableKind) => kind === 'payment';

/**
 * Hide a record. Reversible, and the row — with its audit trail — survives.
 *
 * Matched on the key a person recognises, which for a quotation is a code
 * shared by every version of it. Deleting QT-000042 therefore takes all four
 * versions, which is what somebody asking to delete that quotation means:
 * leaving v1 behind so it reappears in the list would be the surprise.
 *
 * Returns the reasons it was refused; an empty array means it is done.
 */
export async function softDelete(
  kind: DeletableKind, code: string, user: SessionUser,
): Promise<BlockReason[]> {
  const s = SPECS[kind];
  const why = await deleteCheck(kind, code);
  if (why.length) return why;
  const rows = await query<{ id: string }>(
    `UPDATE ${s.table} SET deleted_at = now(), deleted_by = $2
      WHERE ${s.key} = $1 AND deleted_at IS NULL RETURNING id`, [code, user.id]);
  return rows.length > 0 ? [] : [{ why: 'gone-or-deleted' }];
}

export async function restore(kind: DeletableKind, code: string) {
  const s = SPECS[kind];
  const rows = await query<{ id: string }>(
    `UPDATE ${s.table} SET deleted_at = NULL, deleted_by = NULL
      WHERE ${s.key} = $1 AND deleted_at IS NOT NULL RETURNING id`, [code]);
  return rows.length > 0;
}

/**
 * Why this row cannot be removed from the database yet.
 *
 * Returns reasons as DATA, not as English sentences. The console is read in
 * three languages and a refusal is exactly the moment somebody needs to
 * understand why — an untranslated obstacle here would be the one string on
 * the screen they cannot read. `blockerText` turns each one into a sentence in
 * the reader's language. An empty array means the record can go.
 */
export type BlockReason =
  | { why: 'gone' }
  | { why: 'gone-or-deleted' }
  | { why: 'not-deleted-yet' }
  | { why: 'invoice-paid' }
  | { why: 'delivery-done' }
  | { why: 'payment' }
  | { why: 'children'; n: number; child: string; parent: string };

export async function blockers(kind: DeletableKind, code: string): Promise<BlockReason[]> {
  const s = SPECS[kind];
  const found: BlockReason[] = [];

  const row = await guardRow(kind, code);
  if (!row) return [{ why: 'gone' }];

  if (s.guard) {
    const why = s.guard(row);
    if (why) found.push(why);
  }

  for (const c of s.children) {
    // A child that is itself soft-deleted is not an obstacle: it is on its way
    // out too, and refusing because of it would make a pair of records
    // impossible to remove in either order.
    const live = c.soft ? 'AND deleted_at IS NULL' : '';
    // Matched through the key rather than the id, because `code` is not
    // unique everywhere: a quotation is one code over several version rows,
    // and counting only the first version's orders would let the others be
    // destroyed silently.
    const [n] = await query<{ n: string }>(
      `SELECT count(*)::text AS n FROM ${c.table}
        WHERE ${c.fk} IN (SELECT id FROM ${s.table} WHERE ${s.key} = $1) ${live}`, [code]);
    if (Number(n.n) > 0) {
      found.push({ why: 'children', n: Number(n.n), child: c.label, parent: s.label });
    }
  }
  return found;
}

/**
 * Remove the row from the database.
 *
 * Refuses unless it has been soft-deleted first. That is not ceremony: it
 * means every permanent deletion is preceded by a reversible one, so the
 * moment somebody realises they have the wrong record there is still a step
 * where nothing has been lost.
 */
export async function purgeCheck(kind: DeletableKind, code: string): Promise<BlockReason[]> {
  const s = SPECS[kind];
  const [row] = await query<{ deleted_at: string | null }>(
    `SELECT deleted_at FROM ${s.table} WHERE ${s.key} = $1`, [code]);
  if (!row) return [{ why: 'gone' }];
  if (!row.deleted_at) return [{ why: 'not-deleted-yet' }];
  return blockers(kind, code);
}

/**
 * Do it. Separate from the check so the caller can write the audit entry in
 * between: the log has to name the record while the record still exists, and
 * it must not claim a destruction that was then refused.
 */
export async function purgeNow(kind: DeletableKind, code: string): Promise<void> {
  const s = SPECS[kind];
  await query(`DELETE FROM ${s.table} WHERE ${s.key} = $1`, [code]);
}

/** What a list should add to its WHERE clause. */
export const liveOnly = (alias = '') =>
  `${alias ? `${alias}.` : ''}deleted_at IS NULL`;

/**
 * When a record was deleted and by whom, ready to show.
 *
 * `deleted_by` is a user id, and an id on screen tells nobody anything, so the
 * email is resolved here rather than in each of the six pages that need it. A
 * LEFT JOIN, because a user who has since been removed must not make the
 * record look as though it was never deleted.
 */
export async function deletionInfo(
  kind: DeletableKind, code: string,
): Promise<{ at: string | null; by: string | null }> {
  const s = SPECS[kind];
  const [row] = await query<{ at: string | null; by: string | null }>(
    `SELECT d.deleted_at AS at, u.email AS by
       FROM ${s.table} d LEFT JOIN users u ON u.id = d.deleted_by
      WHERE d.${s.key} = $1`, [code]);
  return row ?? { at: null, by: null };
}

/**
 * A refusal, in the reader's language.
 *
 * The labels are AdminKey strings by construction — every `label` in SPECS is
 * a key in ADMIN_EN, which the deletion test asserts, so a new kind of record
 * that forgets its three translations fails the suite rather than showing an
 * English word in the middle of an Arabic sentence.
 */
export function blockerText(r: BlockReason, t: ReturnType<typeof adminUi>): string {
  switch (r.why) {
    case 'gone':
      return t('That record no longer exists.');
    case 'gone-or-deleted':
      return t('That record does not exist, or is already deleted.');
    case 'not-deleted-yet':
      return t('Delete it first. Permanently removing a record that is still live is one click away from removing the wrong one.');
    case 'invoice-paid':
      return t('This invoice has payments against it. An invoice that has been paid is an accounting record the law requires to be kept — cancel it instead, which voids it without erasing it.');
    case 'payment':
      return t('A received payment is an accounting record. Reverse it with a credit rather than deleting the evidence that money arrived.');
    case 'delivery-done':
      return t('This run has been delivered: the stock has moved and the order counts it. Mark it failed or cancelled instead of erasing what happened.');
    case 'children':
      return t('Still linked to this {parent}: {n} × {child}. Remove those first.', {
        parent: t(r.parent as AdminKey),
        child: t(r.child as AdminKey),
        n: r.n,
      });
  }
}

/** Every record label SPECS uses, so a test can check all three languages. */
export const RECORD_LABELS: string[] = [
  ...new Set(Object.values(SPECS).flatMap((s) => [s.label, ...s.children.map((c) => c.label)])),
];
