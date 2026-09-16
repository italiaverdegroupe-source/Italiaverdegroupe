import { Pool } from 'pg';

/**
 * Leads are the entire point of this site, so losing one is the worst
 * failure mode here. Storage degrades in two steps:
 *   1. DATABASE_URL set  -> persisted to Postgres.
 *   2. no DATABASE_URL   -> written to the server log so the lead is still
 *                           recoverable from Railway's log retention.
 * The API route always reports success to the visitor only when one of
 * those actually succeeded.
 */

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS leads (
  id              bigserial PRIMARY KEY,
  reference       text UNIQUE NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  enquiry_type    text NOT NULL,
  name            text NOT NULL,
  company         text,
  email           text NOT NULL,
  phone           text,
  emirate         text,
  project_type    text,
  service_scope   text,
  product_ref     text,
  quantity        integer,
  required_date   text,
  message         text,
  source          text,
  status          text NOT NULL DEFAULT 'new',
  user_agent      text,
  consent         boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx  ON leads (status);
`;

async function ensureSchema(p: Pool) {
  if (!ready) ready = p.query(SCHEMA).then(() => undefined);
  return ready;
}

export type LeadInput = {
  enquiryType: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  emirate?: string;
  projectType?: string;
  serviceScope?: string;
  productRef?: string;
  quantity?: number;
  requiredDate?: string;
  message?: string;
  source?: string;
  userAgent?: string;
  consent: boolean;
};

export function newLeadReference(): string {
  const n = Date.now().toString(36).toUpperCase().slice(-6);
  const r = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `VG-${n}${r}`;
}

/** Returns the lead reference, or throws if it could not be recorded anywhere. */
export async function saveLead(input: LeadInput): Promise<{ reference: string; persisted: boolean }> {
  const reference = newLeadReference();
  const p = getPool();

  if (p) {
    await ensureSchema(p);
    await p.query(
      `INSERT INTO leads (reference, enquiry_type, name, company, email, phone, emirate,
         project_type, service_scope, product_ref, quantity, required_date, message,
         source, user_agent, consent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [reference, input.enquiryType, input.name, input.company ?? null, input.email,
       input.phone ?? null, input.emirate ?? null, input.projectType ?? null,
       input.serviceScope ?? null, input.productRef ?? null, input.quantity ?? null,
       input.requiredDate ?? null, input.message ?? null, input.source ?? null,
       input.userAgent ?? null, input.consent],
    );
    return { reference, persisted: true };
  }

  // No database configured yet — make sure the lead is at least in the logs.
  console.warn('[LEAD:NO-DB]', JSON.stringify({ reference, ...input }));
  return { reference, persisted: false };
}
