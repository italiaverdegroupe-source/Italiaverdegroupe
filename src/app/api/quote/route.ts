import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveLead } from '@/lib/db';
import { clientIpOf } from '@/lib/client-ip';
import { Limiter } from '@/lib/rate-limit';
import { getSettings, type Settings } from '@/lib/settings';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';
import { ui } from '@/lib/ui';

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
  /* The shortlist, as the visitor's browser held it. Bounded on every axis —
     this arrives from a public endpoint, so the only safe assumption is that
     somebody has edited it by hand. */
  items: z.array(z.object({
    ref: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1).max(160),
    slug: z.string().trim().min(1).max(160),
    qty: z.coerce.number().int().min(1).max(9999),
  })).max(40).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required.' }) }),
  // honeypot: accepted by the schema on purpose, then discarded below, so a
  // bot gets a success response instead of a hint that it was detected.
  website: z.string().max(200).optional(),
});

/**
 * Six enquiries per caller per ten minutes, and a ceiling of sixty ACCEPTED
 * enquiries per window from callers nobody vouched for.
 *
 * Sixty is chosen against this business, not against a threat model: the
 * company has taken fewer enquiries in its life than that ceiling allows in
 * ten minutes, so no real day can reach it, while a machine inventing
 * addresses is bounded at sixty a window instead of unlimited. A visitor
 * arriving through the edge is never refused by it at all. The reasoning, and
 * why there is no cap on distinct unverified callers, is in lib/rate-limit.
 */
const limiter = new Limiter({
  windowMs: 10 * 60_000,
  perCaller: 6,
  globalUnverified: 60,
  onGlobalLimit: (n) => {
    // Loud, because this should never happen and it means enquiries are being
    // refused — the one thing this site exists to collect.
    console.warn('[QUOTE:GLOBAL-LIMIT] refusing enquiries, %d in this window', n);
  },
});

/**
 * What language to refuse an enquiry in.
 *
 * Every refusal this route can produce is shown to the visitor verbatim —
 * QuoteForm renders `json.error` straight into the alert — and until now every
 * one of them was English. On /ar/quote, an Arabic page in an RTL layout where
 * every other word is Arabic, a visitor who mistyped their address was told
 * "email: Invalid email": English, and developer English at that, with the
 * field key exposed. The one moment the form stops working is the one moment
 * it stopped speaking to them.
 *
 * The route cannot read the locale the way pages do. /api is exempt from
 * src/proxy.ts (see isExempt there), so there is no `x-locale` header on this
 * request, and a route handler gets no `params`. What it does have is the
 * Referer, which for a same-origin fetch under this site's own
 * `Referrer-Policy: strict-origin-when-cross-origin` (next.config.mjs) is the
 * full URL of the page the form was submitted from — and on this site the
 * language IS the first path segment. So the language is read from the URL
 * here exactly as it is everywhere else; it just arrives in a header instead
 * of in params.
 *
 * `accept-language` is deliberately NOT consulted as a fallback. lib/i18n-server
 * draws the line this codebase works to: the URL is a fact and the browser's
 * header is a guess, and a guess is only worth having where there is no URL to
 * read — the sign-in screen. Here there is one. A request that arrives with no
 * Referer at all is not a visitor using the form; it is a script, a crawler or
 * somebody with a privacy extension, and English is the honest default for it.
 */
function localeOf(req: Request): Locale {
  const ref = req.headers.get('referer');
  if (!ref) return DEFAULT_LOCALE;
  try {
    // English has no prefix, so the first segment of /quote is "quote" and
    // falls through to the default, which is correct.
    const first = new URL(ref).pathname.split('/')[1] ?? '';
    return isLocale(first) ? first : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

type T = ReturnType<typeof ui>;

/**
 * The sentence that tells somebody how to reach a human when the form itself
 * has failed.
 *
 * lib/settings exports fallbackContactFrom() for this, but it builds the
 * sentence in English around the number, so it cannot be used on a page that
 * is not in English. This reads the same settings and puts them through the
 * dictionary instead — where the sentence is also phrased better for the
 * moment it appears in ("send it to us on WhatsApp instead"), because somebody
 * whose enquiry has just failed to save wants another way to send it, not an
 * apology. The WhatsApp label and the email address are values, not words, so
 * they are interpolated rather than translated.
 */
function contactLine(t: T, s: Settings): string {
  if (s.whatsappLabel) return t('qf.contact.whatsapp', { n: s.whatsappLabel });
  if (s.email) return t('qf.contact.email', { n: s.email });
  return t('qf.contact.retry');
}

/**
 * A rejected field, said to the visitor rather than to a developer.
 *
 * Zod's own `issue.message` is English generated by the library ("String must
 * contain at least 2 character(s)"), which is neither translatable nor written
 * for anybody outside this file. So the issue is mapped to one of a handful of
 * things that can actually be wrong on this form, and the sentence comes out
 * of the dictionary like every other sentence on the page.
 *
 * The `code` and `field` travel back alongside the message so the form can
 * eventually put the message against the input it belongs to rather than at
 * the top of the form. Nothing reads them yet — QuoteForm is not this
 * package's to change — but the shape is what the form will need, and adding
 * it now costs nothing and means the route does not have to change again.
 */
type Refusal = { code: string; field?: string; message: string };

function refusalFor(issue: z.ZodIssue, t: T): Refusal {
  const field = typeof issue.path[0] === 'string' ? issue.path[0] : '';

  // Length first, and before the per-field cases: every text field on this
  // form has a maximum, none of them is a limit a person reaches by accident,
  // and the only thing to say about any of them is the same sentence. The one
  // exception is quantity, where "too big" means the number itself, not the
  // length of it, and the visitor needs to be told the range.
  if (issue.code === 'too_big' && field !== 'quantity') {
    return { code: 'too_long', field: field || undefined, message: t('qf.err.tooLong') };
  }

  switch (field) {
    case 'name':     return { code: 'name', field, message: t('qf.err.name') };
    case 'email':    return { code: 'email', field, message: t('qf.err.email') };
    case 'quantity': return { code: 'quantity', field, message: t('qf.err.quantity') };
    // The checkbox is `z.literal(true)`, so an unticked box arrives as an
    // invalid literal rather than as a missing field. It is the single most
    // likely refusal on this form, because it is the one input a visitor can
    // fill the whole form in and still not have touched.
    case 'consent':  return { code: 'consent', field, message: t('qf.err.consent') };
    default:
      return { code: 'invalid', field: field || undefined, message: t('qf.err.generic') };
  }
}

export async function POST(req: Request) {
  const t = ui(localeOf(req));

  // Cloudflare's own header where it is present, so the allowance is not
  // keyed on whatever the caller typed into x-forwarded-for. Where it is
  // absent the address is passed through as unverified and the limiter
  // decides what that is worth. See lib/client-ip.ts.
  const who = clientIpOf(req.headers);

  if (limiter.limited({ id: who.ip, verified: who.trusted })) {
    return NextResponse.json(
      { ok: false, code: 'rate_limit', error: t('qf.err.rateLimit') },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Not reachable from the form, which always sends JSON — this answers a
    // hand-rolled caller. It still speaks the visitor's language, because the
    // cost of that is one dictionary lookup and the alternative is one more
    // English string that nobody notices until it is on screen.
    return NextResponse.json(
      { ok: false, code: 'malformed', error: t('qf.err.generic') },
      { status: 400 },
    );
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const { code, field, message }: Refusal = first
      ? refusalFor(first, t)
      : { code: 'invalid', message: t('qf.err.generic') };
    // `error` is the field QuoteForm reads and puts in the alert; code and
    // field are for whoever wires the message to its input.
    return NextResponse.json({ ok: false, code, field, error: message }, { status: 400 });
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
      // The first reference still goes in product_ref, so every console link,
      // filter and report that existed before this keeps working untouched.
      productRef: d.productRef || d.items?.[0]?.ref || undefined,
      quantity: d.quantity ?? (d.items?.length === 1 ? d.items[0].qty : undefined),
      items: d.items?.length ? d.items : undefined,
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
      {
        ok: false,
        code: 'not_recorded',
        error: `${t('qf.err.notRecorded')} ${contactLine(t, await getSettings())}`,
      },
      { status: 500 },
    );
  }
}
