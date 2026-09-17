import { cache } from 'react';
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

/** Fields the console is allowed to write, and how to coerce what comes back. */
export const EDITABLE = {
  legalName:        { label: 'Legal name', type: 'text' },
  brandName:        { label: 'Brand name', type: 'text' },
  tagline:          { label: 'Tagline', type: 'text' },
  description:      { label: 'Description', type: 'textarea' },
  phone:            { label: 'Phone', type: 'text' },
  whatsapp:         { label: 'WhatsApp number (digits, with country code)', type: 'text' },
  whatsappLabel:    { label: 'WhatsApp, as displayed', type: 'text' },
  email:            { label: 'Email', type: 'text' },
  licenceNumber:    { label: 'Trade licence number', type: 'text' },
  trn:              { label: 'TRN (tax registration number)', type: 'text' },
  vatEnabled:       { label: 'Charge VAT', type: 'boolean' },
  vatRate:          { label: 'VAT rate (0.05 = 5%)', type: 'number' },
  currency:         { label: 'Currency', type: 'text' },
  quoteValidityDays:{ label: 'Quotation validity (days)', type: 'number' },
} as const;

export type EditableKey = keyof typeof EDITABLE;

const coerce = (key: EditableKey, raw: unknown) => {
  const kind = EDITABLE[key].type;
  if (kind === 'boolean') return raw === true || raw === 'true' || raw === 'on';
  if (kind === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
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
