import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveLead } from '@/lib/db';
import { site, fallbackContact } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Schema = z.object({
  enquiryType: z.enum(['quote', 'bulk', 'sourcing']).default('quote'),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  emirate: z.string().trim().max(60).optional().or(z.literal('')),
  projectType: z.string().trim().max(80).optional().or(z.literal('')),
  serviceScope: z.string().trim().max(80).optional().or(z.literal('')),
  productRef: z.string().trim().max(40).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).max(100000).optional(),
  requiredDate: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  source: z.string().trim().max(120).optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required.' }) }),
  // honeypot: accepted by the schema on purpose, then discarded below, so a
  // bot gets a success response instead of a hint that it was detected.
  website: z.string().max(200).optional(),
});

const hits = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60_000;
const LIMIT = 6;

function limited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.t > WINDOW) { hits.set(ip, { n: 1, t: now }); return false; }
  cur.n += 1;
  if (hits.size > 5000) hits.clear();
  return cur.n > LIMIT;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ?? 'unknown';

  if (limited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many enquiries from this connection. Please try again shortly.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid submission.' },
      { status: 400 },
    );
  }

  const d = parsed.data;
  if (d.website) {
    // Bot filled the honeypot. Look successful, store nothing.
    return NextResponse.json({ ok: true, reference: 'VG-000000' });
  }

  try {
    const { reference, persisted } = await saveLead({
      enquiryType: d.enquiryType,
      name: d.name,
      company: d.company || undefined,
      email: d.email,
      phone: d.phone || undefined,
      emirate: d.emirate || undefined,
      projectType: d.projectType || undefined,
      serviceScope: d.serviceScope || undefined,
      productRef: d.productRef || undefined,
      quantity: d.quantity,
      requiredDate: d.requiredDate || undefined,
      message: d.message || undefined,
      source: d.source || undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      consent: d.consent,
    });
    return NextResponse.json({ ok: true, reference, persisted });
  } catch (err) {
    console.error('[LEAD:FAILED]', err, JSON.stringify(d));
    return NextResponse.json(
      { ok: false, error: `Could not record the enquiry. ${fallbackContact()}` },
      { status: 500 },
    );
  }
}
