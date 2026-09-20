import { cache } from 'react';
import type { AdminKey } from '@/lib/admin-ui';
import { query } from '@/lib/db';
import { site as defaults, type Site } from '@/lib/site';

/**
 * Settings an administrator can change without a developer.
 *
 * `src/lib/site.ts` holds the DEFAULTS. This module reads the `settings`
 * table on top of them, so the running values can change from the console —
 * VAT, the TRN, contact details, emirates, lead times, terms — without a
 * deploy. That is the rule the whole project was asked to follow: if business
 * data can change, it must not be hardcoded.
 *
 * `cache()` keeps it to one query per request rather than one per component.
 */

/**
 * Widens the literal types that `as const` gives the defaults.
 *
 * src/lib/site.ts is `as const` so the defaults are self-documenting, which
 * makes `whatsapp` the type `""` and `vatEnabled` the type `false`. For a
 * frozen constant that is right. For SETTINGS it is precisely backwards:
 * these are the fields the console exists to write, so the type was telling
 * every consumer that the one thing they can never hold is a real value.
 * `if (s.vatEnabled)` narrowed to never; `site.whatsapp.replace(...)` type-
 * checked only because it was provably the empty string.
 */
type Widen<T> =
  T extends string ? string :
  T extends number ? number :
  T extends boolean ? boolean :
  T extends readonly (infer U)[] ? readonly Widen<U>[] :
  T extends object ? { -readonly [K in keyof T]: Widen<T[K]> } :
  T;

export type Settings = {
  -readonly [K in keyof Site]: Widen<Site[K]>;
};

/**
 * Fields the console is allowed to write, and how to coerce what comes back.
 *
 * Every `label` is an AdminKey, so it is a translation key by construction.
 * They were plain strings, printed straight onto the screen, which meant the
 * whole Settings page — thirty-five field labels and seven headings — stayed
 * in English however the console was set. A new field with no translation is
 * a compile error now rather than another English row.
 */
export const EDITABLE = {
  legalName:        { label: 'Legal name', type: 'text' },
  brandName:        { label: 'Brand name', type: 'text' },
  tagline:          { label: 'Tagline', type: 'text' },
  description:      { label: 'Description', type: 'textarea' },
  phone:            { label: 'Phone', type: 'text' },
  whatsapp:         { label: 'WhatsApp number (digits, with country code)', type: 'text' },
  whatsappLabel:    { label: 'WhatsApp, as displayed', type: 'text' },
  email:            { label: 'Email', type: 'text' },
  address:          { label: 'Registered address', type: 'textarea' },
  city:             { label: 'City / emirate', type: 'text' },
  country:          { label: 'Country', type: 'text' },
  instagram:        { label: 'Instagram link', type: 'url' },
  linkedin:         { label: 'LinkedIn link', type: 'url' },
  facebook:         { label: 'Facebook link', type: 'url' },
  youtube:          { label: 'YouTube link', type: 'url' },
  tiktok:           { label: 'TikTok link', type: 'url' },
  x:                { label: 'X (Twitter) link', type: 'url' },
  licenceNumber:    { label: 'Trade licence number', type: 'text' },
  // The half of the company's story that structured data cannot infer: it is
  // new here and not new in Italy. Left blank until the owner fills them in —
  // see the note in site.ts for why none of these is guessed at.
  foundedIn:        { label: 'Founded (year, or yyyy-mm-dd)', type: 'text' },
  foundedAt:        { label: 'Founded in (city, country)', type: 'text' },
  italianName:      { label: 'Italian company behind this one, if any', type: 'text' },
  italianUrl:       { label: 'Its website', type: 'url' },
  italianSince:     { label: 'Growing / trading in Italy since (year)', type: 'text' },
  trn:              { label: 'TRN (tax registration number)', type: 'text' },
  vatEnabled:       { label: 'Charge VAT', type: 'boolean' },
  vatRate:          { label: 'VAT rate (0.05 = 5%)', type: 'number' },
  currency:         { label: 'Currency', type: 'text' },
  quoteValidityDays:{ label: 'Quotation validity (days)', type: 'number' },
  // Where the money is supposed to go. An invoice with a balance due and no
  // account to pay it into is an invoice that gets paid late while somebody
  // emails to ask. Blank until the account is open, and — like the licence —
  // never invented: a wrong IBAN on a document is worse than none.
  consoleWelcome:   { label: 'Name greeted on the sign-in screen', type: 'text' },
  bankAccountName:  { label: 'Bank: account name', type: 'text' },
  bankName:         { label: 'Bank: name and branch', type: 'text' },
  bankIban:         { label: 'Bank: IBAN', type: 'text' },
  bankSwift:        { label: 'Bank: SWIFT / BIC', type: 'text' },
  paymentNote:      { label: 'Note printed under the bank details', type: 'textarea' },
} as const satisfies Record<string, { label: AdminKey; type: string }>;

export type EditableKey = keyof typeof EDITABLE;

/**
 * A link somebody pasted, made safe to put in an href.
 *
 * "instagram.com/verdegarden" without a scheme is a RELATIVE link: it would
 * point at a page on this site that does not exist, from every page in the
 * footer. And a javascript: or data: URL in a field the console can write is
 * a script we would be rendering on the public site. Both are one paste away,
 * so neither is left to chance: a scheme is added when it is missing, and
 * anything that is not http(s) afterwards is dropped.
 */
export function normaliseUrl(raw: unknown): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return u.toString();
  } catch {
    return '';
  }
}

const coerce = (key: EditableKey, raw: unknown) => {
  const kind = EDITABLE[key].type;
  if (kind === 'boolean') return raw === true || raw === 'true' || raw === 'on';
  if (kind === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  if (kind === 'url') return normaliseUrl(raw);
  return String(raw ?? '');
};

/**
 * The live settings: stored values layered over the code defaults.
 *
 * If the database is unreachable the defaults are used rather than throwing —
 * a settings outage must not take the public site down with it.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const rows = await query<{ key: string; value: unknown }>(
      'SELECT key, value FROM settings');
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const merged: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(EDITABLE) as EditableKey[]) {
      if (key in stored && stored[key] !== null) merged[key] = coerce(key, stored[key]);
    }
    return merged as Settings;
  } catch {
    return defaults;
  }
});

export async function saveSettings(
  values: Partial<Record<EditableKey, unknown>>, userId: number,
): Promise<void> {
  for (const [key, raw] of Object.entries(values) as [EditableKey, unknown][]) {
    if (!(key in EDITABLE)) continue;
    await query(
      `INSERT INTO settings (key, value, updated_by, updated_at)
       VALUES ($1, $2::jsonb, $3, now())
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [key, JSON.stringify(coerce(key, raw)), userId]);
  }
}

/**
 * What to tell someone when the enquiry form itself fails — never a channel
 * that has not been configured.
 */
export function fallbackContactFrom(s: Settings): string {
  if (s.whatsappLabel) return `Please message us on WhatsApp ${s.whatsappLabel}.`;
  if (s.email) return `Please email ${s.email}.`;
  return 'Please try again in a moment.';
}
