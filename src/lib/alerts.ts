import { query, requirePool } from '@/lib/db';

/**
 * Alerts: the part of the system that speaks first.
 *
 * Everything before this waits to be asked. A lead sits in a list until
 * somebody opens the list; an invoice falls overdue silently. In a company of
 * three people the cost of that is the whole margin — a container accruing
 * storage at Jebel Ali because a permit lapsed, a tree dying because nobody
 * read the health note, a contractor at ninety days because the invoice was
 * never chased.
 *
 * Two kinds of trigger, and the difference matters:
 *
 *   EVENT — something happened. A lead arrived, a quotation was accepted, a
 *   payment landed. The code that does the thing raises the alert, so it is
 *   immediate and cannot be missed.
 *
 *   SCAN — nothing happened, and that is the problem. An invoice becomes
 *   overdue by the passage of time; no user action marks the moment. These
 *   need someone to look, so a scheduled pass runs the queries below.
 *
 * The rules are rows (see 006_notifications.sql). What stays in code is the
 * query behind each kind: "warn me five days before instead of three" is a
 * number in a column, but a new kind of warning genuinely is development, and
 * a configuration screen pretending otherwise would be a lie.
 */

export type Severity = 'info' | 'warning' | 'urgent';

export type AlertKind = {
  key: string;
  label: string;
  /** Why this alert exists — shown in the console beside the rule. */
  why: string;
  trigger: 'event' | 'scan';
  /** What the rule's number means for this kind, if it takes one. */
  thresholdLabel?: string;
  defaultThreshold?: number;
  defaultSeverity: Severity;
  /** Tokens a custom message may use. */
  tokens: string[];
};

export const ALERT_KINDS: AlertKind[] = [
  { key: 'lead.created', label: 'New enquiry', trigger: 'event',
    why: 'The first hour decides the sale. An enquiry that waits until someone opens the list has usually already been answered by a competitor.',
    defaultSeverity: 'urgent', tokens: ['name', 'company', 'emirate', 'source', 'reference'] },

  { key: 'lead.unanswered', label: 'Enquiry still unanswered', trigger: 'scan',
    why: 'Catches what the arrival alert missed — an enquiry nobody has touched after the given number of hours.',
    thresholdLabel: 'Hours without contact', defaultThreshold: 4,
    defaultSeverity: 'urgent', tokens: ['name', 'company', 'hours', 'reference'] },

  { key: 'lead.followup_due', label: 'Follow-up due', trigger: 'scan',
    why: 'A promised call that never happens costs the deal and the reputation. Fires for follow-ups due within the given number of days.',
    thresholdLabel: 'Days ahead', defaultThreshold: 0,
    defaultSeverity: 'warning', tokens: ['name', 'company', 'due', 'reference'] },

  { key: 'quote.accepted', label: 'Quotation accepted', trigger: 'event',
    why: 'Acceptance starts a clock: stock is reserved, the order has to be raised and the customer expects confirmation the same day.',
    defaultSeverity: 'urgent', tokens: ['code', 'customer', 'total'] },

  { key: 'quote.expiring', label: 'Quotation about to expire', trigger: 'scan',
    why: 'A quotation nearing its validity date is the cheapest sale left in the pipeline — one call, on a price already agreed.',
    thresholdLabel: 'Days before expiry', defaultThreshold: 3,
    defaultSeverity: 'warning', tokens: ['code', 'customer', 'valid_until', 'total'] },

  { key: 'order.confirmed', label: 'Order confirmed', trigger: 'event',
    why: 'Confirmation is where fulfilment, invoicing and delivery planning all begin.',
    defaultSeverity: 'info', tokens: ['code', 'customer', 'total'] },

  { key: 'delivery.upcoming', label: 'Delivery coming up', trigger: 'scan',
    why: 'A delivery needs a crane, a permit and a driver arranged the day before, not the morning of. Fires for deliveries scheduled within the given number of days.',
    thresholdLabel: 'Days ahead', defaultThreshold: 1,
    defaultSeverity: 'urgent', tokens: ['code', 'order', 'customer', 'when', 'site'] },

  { key: 'shipment.arriving', label: 'Shipment arriving', trigger: 'scan',
    why: 'Live trees do not wait at a port. Clearance, transport and yard space have to be ready before the container lands, not after demurrage starts.',
    thresholdLabel: 'Days before ETA', defaultThreshold: 5,
    defaultSeverity: 'warning', tokens: ['code', 'supplier', 'eta', 'container'] },

  { key: 'permit.expiring', label: 'Import permit expiring', trigger: 'scan',
    why: 'A MOCCAE permit is valid six months. If it lapses while a container is at sea, the shipment cannot clear — and a container of live trees sitting at the port is the most expensive failure in this business.',
    thresholdLabel: 'Days before expiry', defaultThreshold: 30,
    defaultSeverity: 'urgent', tokens: ['permit', 'expires', 'authority'] },

  { key: 'invoice.due', label: 'Invoice falling due', trigger: 'scan',
    why: 'A reminder before the due date collects far more than a chase after it, and costs nothing in goodwill.',
    thresholdLabel: 'Days before due', defaultThreshold: 3,
    defaultSeverity: 'info', tokens: ['code', 'customer', 'due', 'outstanding'] },

  { key: 'invoice.overdue', label: 'Invoice overdue', trigger: 'scan',
    why: 'Contractors here pay late as a matter of course. The alert re-raises as the debt crosses 30, 60 and 90 days, because each band is a different conversation.',
    thresholdLabel: 'Days past due', defaultThreshold: 1,
    defaultSeverity: 'urgent', tokens: ['code', 'customer', 'due', 'days', 'outstanding'] },

  { key: 'payment.received', label: 'Payment received', trigger: 'event',
    why: 'Cash landing is the only event that closes the loop, and the one the owner most wants to see.',
    defaultSeverity: 'info', tokens: ['amount', 'customer', 'invoice', 'method'] },

  { key: 'stock.low', label: 'Stock running low', trigger: 'scan',
    why: 'Replacement stock comes from Italy with a lead time measured in weeks, so the reorder decision has to be made while there is still something to sell.',
    thresholdLabel: 'Units remaining or fewer', defaultThreshold: 5,
    defaultSeverity: 'warning', tokens: ['product', 'lot', 'available'] },

  { key: 'stock.stuck', label: 'Stock not moving', trigger: 'scan',
    why: 'Living stock costs water, labour and space every month it waits, and a tree that has not sold in months is usually mispriced rather than unlucky.',
    thresholdLabel: 'Days in stock', defaultThreshold: 90,
    defaultSeverity: 'info', tokens: ['code', 'product', 'days', 'price'] },

  { key: 'stock.health', label: 'Tree in poor health', trigger: 'scan',
    why: 'A stressed tree can be saved; a dead one is a written-off asset. This is the alert that pays for itself first.',
    defaultSeverity: 'urgent', tokens: ['code', 'product', 'health', 'location'] },

  { key: 'customer.credit', label: 'Customer over credit limit', trigger: 'scan',
    why: 'The limit exists to stop one contractor quietly becoming the whole receivables book. Crossing it should be a decision, not a discovery.',
    defaultSeverity: 'urgent', tokens: ['customer', 'outstanding', 'limit'] },
];

export const kindByKey = (key: string) => ALERT_KINDS.find((k) => k.key === key);

export type Rule = {
  id: string; kind: string; name: string; is_active: boolean;
  severity: Severity; threshold: string | null;
  to_role: string | null; to_user_id: string | null;
  email_to: string | null; whatsapp_to: string | null; template: string | null;
};

export const listRules = () =>
  query<Rule>(`SELECT id::text, kind, name, is_active, severity, threshold::text,
                      to_role, to_user_id::text, email_to, whatsapp_to, template
                 FROM alert_rules ORDER BY kind, id`);

/** One candidate alert: a thing, in a state, at a moment. */
type Candidate = {
  /** Stable identity of the subject, so a re-scan matches the same row. */
  subject: string;
  /**
   * A second dedupe dimension for conditions that worsen. An invoice at 30
   * days and the same invoice at 60 are different news and must both be told;
   * the same invoice scanned twice at 31 days is not.
   */
  bucket?: string;
  title: string;
  body: string;
  entity: string;
  entityId: string;
  href: string;
  tokens: Record<string, string>;
};

const num = (r: Rule, fallback: number) => {
  const n = Number(r.threshold);
  return Number.isFinite(n) ? n : fallback;
};

const today = () => new Date().toISOString().slice(0, 10);

const aed = (v: unknown) =>
  `AED ${new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 }).format(Number(v ?? 0))}`;

/**
 * The scan queries. Each answers "what is true right now that somebody needs
 * to be told about", and each is written to return the subject's own key so
 * the dedupe index can do its job.
 */
const SCANS: Record<string, (rule: Rule) => Promise<Candidate[]>> = {

  'lead.unanswered': async (r) => {
    const hours = num(r, 4);
    const rows = await query<{ reference: string; name: string; company: string | null; hours: string }>(
      `SELECT reference, name, company,
              round(extract(epoch FROM now() - created_at) / 3600)::text AS hours
         FROM leads
        WHERE status = 'new' AND last_contacted IS NULL
          AND created_at < now() - ($1 || ' hours')::interval
        ORDER BY created_at`, [String(hours)]);
    return rows.map((l) => ({
      subject: l.reference,
      title: `Enquiry unanswered for ${l.hours} hours`,
      body: `${l.name}${l.company ? ` — ${l.company}` : ''} has had no contact since it arrived.`,
      entity: 'lead', entityId: l.reference, href: `/admin/leads/${l.reference}`,
      tokens: { name: l.name, company: l.company ?? '', hours: l.hours, reference: l.reference },
    }));
  },

  'lead.followup_due': async (r) => {
    const days = num(r, 0);
    const rows = await query<{ reference: string; name: string; company: string | null; due: string }>(
      `SELECT reference, name, company, next_follow_up::text AS due
         FROM leads
        WHERE next_follow_up IS NOT NULL
          AND next_follow_up <= current_date + ($1 || ' days')::interval
          AND status NOT IN ('won', 'lost')
        ORDER BY next_follow_up`, [String(days)]);
    return rows.map((l) => ({
      subject: l.reference, bucket: l.due,
      title: `Follow up with ${l.name}`,
      body: `Follow-up was set for ${l.due}${l.company ? ` — ${l.company}` : ''}.`,
      entity: 'lead', entityId: l.reference, href: `/admin/leads/${l.reference}`,
      tokens: { name: l.name, company: l.company ?? '', due: l.due, reference: l.reference },
    }));
  },

  'quote.expiring': async (r) => {
    const days = num(r, 3);
    const rows = await query<{ code: string; customer: string; valid_until: string; total: string }>(
      `SELECT q.code, COALESCE(q.customer_company, q.customer_name) AS customer,
              q.valid_until::text AS valid_until,
              COALESCE((SELECT sum(unit_price * quantity * (1 - discount_pct/100))
                          FROM quote_items WHERE quote_id = q.id), 0)::numeric(14,2)::text AS total
         FROM quotes q
        WHERE q.status = 'sent' AND q.valid_until IS NOT NULL
          AND q.valid_until BETWEEN current_date AND current_date + ($1 || ' days')::interval
        ORDER BY q.valid_until`, [String(days)]);
    return rows.map((q) => ({
      subject: q.code, bucket: q.valid_until,
      title: `Quotation ${q.code} expires ${q.valid_until}`,
      body: `${q.customer} — ${aed(q.total)}. A call before it lapses is the cheapest sale in the pipeline.`,
      entity: 'quote', entityId: q.code, href: `/admin/quotes/${q.code}`,
      tokens: { code: q.code, customer: q.customer, valid_until: q.valid_until, total: aed(q.total) },
    }));
  },

  'delivery.upcoming': async (r) => {
    const days = num(r, 1);
    const rows = await query<{
      code: string; order_code: string; customer: string; when: string; site: string | null;
    }>(
      `SELECT d.code, o.code AS order_code,
              COALESCE(o.customer_company, o.customer_name) AS customer,
              d.scheduled_for::text AS when, COALESCE(d.site_address, o.site_address) AS site
         FROM deliveries d
         JOIN orders o ON o.id = d.order_id
        WHERE d.status IN ('scheduled', 'loading', 'in_transit')
          AND d.scheduled_for IS NOT NULL
          AND d.scheduled_for <= current_date + ($1 || ' days')::interval
        ORDER BY d.scheduled_for`, [String(days)]);
    return rows.map((d) => ({
      subject: d.code, bucket: d.when,
      title: `Delivery ${d.code} on ${d.when}`,
      body: `${d.customer}, order ${d.order_code}${d.site ? ` — ${d.site}` : ''}. Crane, driver and site access need confirming.`,
      entity: 'delivery', entityId: d.code, href: `/admin/orders/${d.order_code}`,
      tokens: { code: d.code, order: d.order_code, customer: d.customer, when: d.when, site: d.site ?? '' },
    }));
  },

  'shipment.arriving': async (r) => {
    const days = num(r, 5);
    const rows = await query<{
      code: string; supplier: string | null; eta: string; container: string | null;
    }>(
      `SELECT s.code, sup.name AS supplier, s.eta::text AS eta, s.container_no AS container
         FROM shipments s
         LEFT JOIN suppliers sup ON sup.id = s.supplier_id
        WHERE s.status IN ('planned', 'booked', 'in_transit')
          AND s.eta IS NOT NULL
          AND s.eta <= current_date + ($1 || ' days')::interval
        ORDER BY s.eta`, [String(days)]);
    return rows.map((s) => ({
      subject: s.code, bucket: s.eta,
      title: `Shipment ${s.code} arrives ${s.eta}`,
      body: `${s.supplier ?? 'Supplier not set'}${s.container ? ` — container ${s.container}` : ''}. Clearance, transport and yard space need to be ready before it lands.`,
      entity: 'shipment', entityId: s.code, href: `/admin/shipments/${s.code}`,
      tokens: { code: s.code, supplier: s.supplier ?? '', eta: s.eta, container: s.container ?? '' },
    }));
  },

  'permit.expiring': async (r) => {
    const days = num(r, 30);
    const rows = await query<{
      permit: string; authority: string; expires: string; shipments: string;
    }>(
      `SELECT p.permit_number AS permit, p.authority, p.expires_on::text AS expires,
              count(s.id) FILTER (WHERE s.status NOT IN ('arrived','cleared','cancelled'))::text AS shipments
         FROM import_permits p
         LEFT JOIN shipments s ON s.permit_id = p.id
        WHERE p.expires_on <= current_date + ($1 || ' days')::interval
        GROUP BY p.id, p.permit_number, p.authority, p.expires_on
        ORDER BY p.expires_on`, [String(days)]);
    return rows.map((p) => ({
      subject: p.permit, bucket: p.expires,
      title: p.expires < today()
        ? `${p.authority} permit ${p.permit} has expired`
        : `${p.authority} permit ${p.permit} expires ${p.expires}`,
      body: Number(p.shipments) > 0
        ? `${p.shipments} shipment(s) still reference it. A container cannot clear on a lapsed permit.`
        : 'No open shipment references it yet, but renewal takes time.',
      entity: 'permit', entityId: p.permit, href: '/admin/shipments',
      tokens: { permit: p.permit, expires: p.expires, authority: p.authority },
    }));
  },

  'invoice.due': async (r) => {
    const days = num(r, 3);
    const rows = await query<{ code: string; customer: string; due: string; outstanding: string }>(
      `SELECT i.code, COALESCE(c.company, c.name, 'Customer not linked') AS customer,
              i.due_on::text AS due,
              (i.total_aed - COALESCE(p.amount, 0))::text AS outstanding
         FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id
         LEFT JOIN (SELECT invoice_id, sum(amount_aed) AS amount FROM payments GROUP BY invoice_id) p
                ON p.invoice_id = i.id
        WHERE i.status NOT IN ('draft', 'cancelled', 'paid')
          AND i.due_on IS NOT NULL
          AND i.due_on BETWEEN current_date AND current_date + ($1 || ' days')::interval
          AND i.total_aed - COALESCE(p.amount, 0) > 0
        ORDER BY i.due_on`, [String(days)]);
    return rows.map((i) => ({
      subject: i.code, bucket: i.due,
      title: `Invoice ${i.code} due ${i.due}`,
      body: `${i.customer} — ${aed(i.outstanding)} outstanding. A reminder now collects more than a chase later.`,
      entity: 'invoice', entityId: i.code, href: '/admin/finance',
      tokens: { code: i.code, customer: i.customer, due: i.due, outstanding: aed(i.outstanding) },
    }));
  },

  'invoice.overdue': async (r) => {
    const days = num(r, 1);
    const rows = await query<{
      code: string; customer: string; due: string; days: string; outstanding: string; band: string;
    }>(
      `SELECT i.code, COALESCE(c.company, c.name, 'Customer not linked') AS customer,
              i.due_on::text AS due,
              (current_date - i.due_on)::text AS days,
              (i.total_aed - COALESCE(p.amount, 0))::text AS outstanding,
              CASE WHEN current_date - i.due_on > 90 THEN '90+'
                   WHEN current_date - i.due_on > 60 THEN '61-90'
                   WHEN current_date - i.due_on > 30 THEN '31-60'
                   ELSE '1-30' END AS band
         FROM invoices i
         LEFT JOIN customers c ON c.id = i.customer_id
         LEFT JOIN (SELECT invoice_id, sum(amount_aed) AS amount FROM payments GROUP BY invoice_id) p
                ON p.invoice_id = i.id
        WHERE i.status NOT IN ('draft', 'cancelled', 'paid')
          AND i.due_on IS NOT NULL
          AND current_date - i.due_on >= $1
          AND i.total_aed - COALESCE(p.amount, 0) > 0
        ORDER BY i.due_on`, [String(days)]);
    return rows.map((i) => ({
      // The band is the bucket: crossing 30, 60 and 90 days each raises a
      // fresh alert, because each is a different conversation. Scanning the
      // same invoice twice inside one band does not.
      subject: i.code, bucket: i.band,
      title: `Invoice ${i.code} is ${i.days} days overdue`,
      body: `${i.customer} — ${aed(i.outstanding)} outstanding, due ${i.due}.`,
      entity: 'invoice', entityId: i.code, href: '/admin/finance',
      tokens: { code: i.code, customer: i.customer, due: i.due, days: i.days, outstanding: aed(i.outstanding) },
    }));
  },

  'stock.low': async (r) => {
    const floor = num(r, 5);
    const rows = await query<{ code: string; product_ref: string; available: string }>(
      `SELECT b.code, b.product_ref, (b.quantity - b.reserved)::text AS available
         FROM stock_batches b
         LEFT JOIN inventory_locations loc ON loc.id = b.location_id
        WHERE b.status = 'available'
          AND COALESCE(loc.sellable, false)
          AND b.quantity - b.reserved <= $1
        ORDER BY b.quantity - b.reserved`, [floor]);
    return rows.map((b) => ({
      subject: b.code, bucket: b.available,
      title: `${b.product_ref} down to ${b.available} available`,
      body: `Lot ${b.code}. Replacement comes from Italy with weeks of lead time, so the reorder decision is due now.`,
      entity: 'batch', entityId: b.code, href: '/admin/inventory',
      tokens: { product: b.product_ref, lot: b.code, available: b.available },
    }));
  },

  'stock.stuck': async (r) => {
    const days = num(r, 90);
    const rows = await query<{ code: string; product_ref: string; days: string; price: string | null }>(
      `SELECT si.code, si.product_ref,
              (current_date - COALESCE(si.arrived_at, si.acquired_at, si.created_at::date))::text AS days,
              si.asking_price_aed::text AS price
         FROM stock_items si
        WHERE si.status = 'available'
          AND COALESCE(si.arrived_at, si.acquired_at, si.created_at::date) <= current_date - ($1 || ' days')::interval
        ORDER BY 3 DESC`, [String(days)]);
    return rows.map((s) => ({
      // Bucketed by thirty-day step so a tree that keeps sitting is re-raised
      // occasionally rather than once and then forgotten.
      subject: s.code, bucket: String(Math.floor(Number(s.days) / 30)),
      title: `${s.code} has been in stock ${s.days} days`,
      body: `${s.product_ref}${s.price ? ` at ${aed(s.price)}` : ''}. Living stock costs water, labour and space every month it waits.`,
      entity: 'stock_item', entityId: s.code, href: `/admin/inventory/specimens/${s.code}`,
      tokens: { code: s.code, product: s.product_ref, days: s.days, price: s.price ? aed(s.price) : '' },
    }));
  },

  'stock.health': async () => {
    const rows = await query<{ code: string; product_ref: string; health: string; location: string | null }>(
      `SELECT si.code, si.product_ref, si.health, loc.name AS location
         FROM stock_items si
         LEFT JOIN inventory_locations loc ON loc.id = si.location_id
        WHERE si.health IN ('stressed', 'critical')
          AND si.status NOT IN ('dead', 'written_off', 'sold')
        ORDER BY CASE si.health WHEN 'critical' THEN 0 ELSE 1 END, si.code`);
    return rows.map((s) => ({
      subject: s.code, bucket: s.health,
      title: `${s.code} is ${s.health}`,
      body: `${s.product_ref}${s.location ? ` at ${s.location}` : ''}. A stressed tree can be saved; a dead one is a written-off asset.`,
      entity: 'stock_item', entityId: s.code, href: `/admin/inventory/specimens/${s.code}`,
      tokens: { code: s.code, product: s.product_ref, health: s.health, location: s.location ?? '' },
    }));
  },

  'customer.credit': async () => {
    const rows = await query<{ id: string; customer: string; outstanding: string; limit: string }>(
      `SELECT c.id::text, COALESCE(c.company, c.name) AS customer,
              COALESCE(o.amount, 0)::text AS outstanding,
              c.credit_limit_aed::text AS limit
         FROM customers c
         LEFT JOIN LATERAL (
           SELECT sum(i.total_aed - COALESCE(p.amount, 0)) AS amount
             FROM invoices i
             LEFT JOIN (SELECT invoice_id, sum(amount_aed) AS amount FROM payments GROUP BY invoice_id) p
                    ON p.invoice_id = i.id
            WHERE i.customer_id = c.id AND i.status NOT IN ('draft', 'cancelled', 'paid')
         ) o ON true
        WHERE c.credit_limit_aed > 0 AND COALESCE(o.amount, 0) > c.credit_limit_aed`);
    return rows.map((c) => ({
      subject: c.id, bucket: String(Math.floor(Number(c.outstanding) / 10000)),
      title: `${c.customer} is over their credit limit`,
      body: `${aed(c.outstanding)} outstanding against a limit of ${aed(c.limit)}. Further orders should be a decision, not a discovery.`,
      entity: 'customer', entityId: c.id, href: '/admin/finance',
      tokens: { customer: c.customer, outstanding: aed(c.outstanding), limit: aed(c.limit) },
    }));
  },
};

/** Fill {tokens} in a rule's custom wording. Unknown tokens are left visible. */
export function render(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (all, key) => tokens[key] ?? all);
}

/**
 * Is there a way to send to the outside world?
 *
 * Today: no. The company has no domain, no mailbox and no WhatsApp Business
 * account, so there is nothing to authenticate against. Rather than drop
 * those messages or claim to have sent them, they are queued as 'blocked'
 * with the reason on the row. The day a provider is configured it becomes a
 * driver behind this function, not a rebuild.
 */
function provider(channel: 'email' | 'whatsapp' | 'sms'): string | null {
  if (channel === 'email' && (process.env.SMTP_URL || process.env.RESEND_API_KEY)) return 'configured';
  if (channel === 'whatsapp' && process.env.WHATSAPP_TOKEN) return 'configured';
  return null;
}

const BLOCKED_REASON: Record<string, string> = {
  email: 'No mail provider configured. Set SMTP_URL or RESEND_API_KEY once the company has a domain and mailbox.',
  whatsapp: 'No WhatsApp Business account connected. Set WHATSAPP_TOKEN once the number is verified.',
  sms: 'No SMS provider configured.',
};

/**
 * Raise one alert. Returns true if it is new.
 *
 * The dedupe key carries the rule, the subject and the bucket, and the unique
 * index does the deciding — not a SELECT first, which would race with a
 * second scan running at the same moment.
 */
export async function raise(opts: {
  kind: string;
  subject: string;
  bucket?: string;
  title: string;
  body?: string;
  entity?: string;
  entityId?: string;
  href?: string;
  severity?: Severity;
  ruleId?: string | null;
  toRole?: string | null;
  toUserId?: string | null;
  emailTo?: string | null;
  whatsappTo?: string | null;
}): Promise<boolean> {
  const dedupe = [opts.ruleId ?? opts.kind, opts.kind, opts.subject, opts.bucket ?? ''].join(':');
  const rows = await query<{ id: string }>(
    `INSERT INTO alerts (rule_id, kind, severity, title, body, entity, entity_id, href,
                         dedupe_key, to_role, to_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (dedupe_key) DO NOTHING
     RETURNING id::text`,
    [opts.ruleId ?? null, opts.kind, opts.severity ?? 'info', opts.title, opts.body ?? null,
     opts.entity ?? null, opts.entityId ?? null, opts.href ?? null, dedupe,
     opts.toRole ?? null, opts.toUserId ?? null]);

  if (rows.length === 0) return false;           // already raised; say nothing twice
  const alertId = rows[0].id;

  for (const [channel, address] of [['email', opts.emailTo], ['whatsapp', opts.whatsappTo]] as const) {
    if (!address) continue;
    const ready = provider(channel);
    await query(
      `INSERT INTO outbound_messages (alert_id, channel, address, subject, body, status, status_note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [alertId, channel, address, opts.title, opts.body ?? opts.title,
       ready ? 'queued' : 'blocked', ready ? null : BLOCKED_REASON[channel]]);
  }
  return true;
}

/**
 * Raise whatever the event rules for this kind say to raise.
 *
 * Called by the code that performed the action. If no rule is configured for
 * the kind, nothing happens — silence is the administrator's choice, not a
 * bug. Failures are swallowed deliberately: an alert that cannot be written
 * must never roll back the sale that triggered it.
 */
export async function fire(kind: string, tokens: Record<string, string>, ref: {
  subject: string; title: string; body?: string;
  entity?: string; entityId?: string; href?: string;
}): Promise<void> {
  try {
    const rules = await query<Rule>(
      `SELECT id::text, kind, name, is_active, severity, threshold::text,
              to_role, to_user_id::text, email_to, whatsapp_to, template
         FROM alert_rules WHERE kind = $1 AND is_active`, [kind]);
    for (const rule of rules) {
      await raise({
        kind, subject: ref.subject,
        title: rule.template ? render(rule.template, tokens) : ref.title,
        body: ref.body, entity: ref.entity, entityId: ref.entityId, href: ref.href,
        severity: rule.severity, ruleId: rule.id,
        toRole: rule.to_role, toUserId: rule.to_user_id,
        emailTo: rule.email_to, whatsappTo: rule.whatsapp_to,
      });
    }
  } catch (err) {
    console.error(`[alerts] ${kind} could not be raised:`, err);
  }
}

/** Run every active scan rule. Idempotent: re-running raises nothing new. */
export async function runScan(trigger: 'schedule' | 'manual' | 'startup' = 'schedule'): Promise<{
  raised: number; checked: number; errors: string[];
}> {
  const started = await query<{ id: string }>(
    `INSERT INTO alert_runs (trigger) VALUES ($1) RETURNING id::text`, [trigger]);
  const runId = started[0]?.id;

  let raised = 0, checked = 0;
  const errors: string[] = [];

  const rules = await query<Rule>(
    `SELECT id::text, kind, name, is_active, severity, threshold::text,
            to_role, to_user_id::text, email_to, whatsapp_to, template
       FROM alert_rules WHERE is_active ORDER BY kind`);

  for (const rule of rules) {
    const scan = SCANS[rule.kind];
    if (!scan) continue;                        // event kinds have no scan
    checked += 1;
    try {
      for (const c of await scan(rule)) {
        const isNew = await raise({
          kind: rule.kind, subject: c.subject, bucket: c.bucket,
          title: rule.template ? render(rule.template, c.tokens) : c.title,
          body: c.body, entity: c.entity, entityId: c.entityId, href: c.href,
          severity: rule.severity, ruleId: rule.id,
          toRole: rule.to_role, toUserId: rule.to_user_id,
          emailTo: rule.email_to, whatsappTo: rule.whatsapp_to,
        });
        if (isNew) raised += 1;
      }
    } catch (err) {
      // One broken rule must not stop the other fourteen.
      errors.push(`${rule.kind}: ${(err as Error).message}`);
    }
  }

  if (runId) {
    await query(
      `UPDATE alert_runs SET finished_at = now(), raised = $2, error = $3 WHERE id = $1`,
      [runId, raised, errors.length ? errors.join('; ') : null]);
  }
  return { raised, checked, errors };
}

// ── reading the inbox ────────────────────────────────────────

export type AlertRow = {
  id: string; kind: string; severity: Severity; title: string; body: string | null;
  entity: string | null; entity_id: string | null; href: string | null;
  raised_at: string; read_at: string | null; done_at: string | null;
};

/**
 * What this user should see. A rule addressed to a role or a person is shown
 * to them; an unaddressed rule is shown to everyone, which is the right
 * default in a company this size.
 */
export const listAlerts = (user: { id: number; role: string }, opts: {
  includeDone?: boolean; limit?: number;
} = {}) =>
  query<AlertRow>(
    `SELECT id::text, kind, severity, title, body, entity, entity_id, href,
            raised_at::text, read_at::text, done_at::text
       FROM alerts
      WHERE (to_role IS NULL OR to_role = $1)
        AND (to_user_id IS NULL OR to_user_id = $2)
        AND ($3::boolean OR done_at IS NULL)
      ORDER BY done_at IS NOT NULL,
               CASE severity WHEN 'urgent' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END,
               raised_at DESC
      LIMIT $4`,
    [user.role, user.id, opts.includeDone ?? false, opts.limit ?? 200]);

export const countOpen = async (user: { id: number; role: string }) => {
  const rows = await query<{ n: string; urgent: string }>(
    `SELECT count(*)::text AS n,
            count(*) FILTER (WHERE severity = 'urgent')::text AS urgent
       FROM alerts
      WHERE done_at IS NULL
        AND (to_role IS NULL OR to_role = $1)
        AND (to_user_id IS NULL OR to_user_id = $2)`, [user.role, user.id]);
  return { open: Number(rows[0]?.n ?? 0), urgent: Number(rows[0]?.urgent ?? 0) };
};

export const lastRun = () =>
  query<{ started_at: string; finished_at: string | null; raised: string; trigger: string; error: string | null }>(
    `SELECT started_at::text, finished_at::text, raised::text, trigger, error
       FROM alert_runs ORDER BY started_at DESC LIMIT 1`);

export const outboundQueue = (limit = 50) =>
  query<{
    id: string; channel: string; address: string; subject: string | null;
    status: string; status_note: string | null; queued_at: string;
  }>(`SELECT id::text, channel, address, subject, status, status_note, queued_at::text
        FROM outbound_messages ORDER BY queued_at DESC LIMIT $1`, [limit]);

export async function markRead(ids: string[], userId: number) {
  if (!ids.length) return;
  await query(`UPDATE alerts SET read_at = now(), read_by = $2
                WHERE id = ANY($1::bigint[]) AND read_at IS NULL`, [ids, userId]);
}

/** Dealt with. Kept rather than deleted — "was anyone warned" must stay answerable. */
export async function markDone(id: string, userId: number) {
  await query(`UPDATE alerts SET done_at = now(), done_by = $2,
                      read_at = COALESCE(read_at, now())
                WHERE id = $1`, [id, userId]);
}

export async function reopen(id: string) {
  await query(`UPDATE alerts SET done_at = NULL, done_by = NULL WHERE id = $1`, [id]);
}

/**
 * The rules a new installation starts with.
 *
 * Seeded once, and only when the table is empty, so an administrator who
 * switches one off does not find it back on after the next deploy.
 */
export async function seedDefaultRules(): Promise<number> {
  const pool = requirePool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ n: string }>('SELECT count(*)::text AS n FROM alert_rules');
    if (Number(rows[0].n) > 0) { await client.query('ROLLBACK'); return 0; }
    let n = 0;
    for (const k of ALERT_KINDS) {
      await client.query(
        `INSERT INTO alert_rules (kind, name, severity, threshold) VALUES ($1, $2, $3, $4)`,
        [k.key, k.label, k.defaultSeverity, k.defaultThreshold ?? null]);
      n += 1;
    }
    await client.query('COMMIT');
    return n;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
