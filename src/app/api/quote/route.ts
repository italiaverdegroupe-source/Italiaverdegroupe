import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveLead } from '@/lib/db';
import { clientIpOf } from '@/lib/client-ip';
import { Limiter } from '@/lib/rate-limit';
import { getSettings, fallbackContactFrom } from '@/lib/settings';

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

/**
 * Six enquiries per caller per ten minutes, and a ceiling of 240 across
 * everyone — roughly thirty thousand a day, which no real week of this
 * business could approach. The reasoning behind the two numbers, and behind
 * treating verified and unverified callers differently, is in lib/rate-limit.
 */
const limiter = new Limiter({
  windowMs: 10 * 60_000,
  perCaller: 6,
  global: 240,
  onGlobalLimit: (n) => {
    // Loud, because this should never happen and it means enquiries are being
    // refused — the one thing this site exists to collect.
    console.warn('[QUOTE:GLOBAL-LIMIT] refusing enquiries, %d in this window', n);
  },
});

export async function POST(req: Request) {
  // Cloudflare's own header where it is present, so the allowance is not
  // keyed on whatever the caller typed into x-forwarded-for. Where it is
  // absent the address is passed through as unverified and the limiter
  // decides what that is worth. See lib/client-ip.ts.
  const who = clientIpOf(req.headers);

  if (limiter.limited({ id: who.ip, verified: who.trusted })) {
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
      { ok: false, error: `Could not record the enquiry. ${fallbackContactFrom(await getSettings())}` },
      { status: 500 },
    );
  }
}
