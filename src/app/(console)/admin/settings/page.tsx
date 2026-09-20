import { redirect } from 'next/navigation';
import { refuse } from '@/app/(console)/admin/refuse';
import { revalidatePath } from 'next/cache';
import { getSessionUser, audit, assertSameOrigin } from '@/lib/auth';
import { getSettings, saveSettings, EDITABLE, type EditableKey } from '@/lib/settings';
import { query } from '@/lib/db';
import { fmtDate } from '@/components/admin/bits';
import { adminUi, type AdminKey } from '@/lib/admin-ui';

export const dynamic = 'force-dynamic';

async function save(formData: FormData) {
  'use server';
  await assertSameOrigin();
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);
  // Company identity and the tax position are owner-level decisions.
  if (user.role !== 'owner') refuse('/admin/settings', t('Only the owner can change settings.'));

  const before = await getSettings();
  const values: Partial<Record<EditableKey, unknown>> = {};
  for (const key of Object.keys(EDITABLE) as EditableKey[]) {
    values[key] = EDITABLE[key].type === 'boolean'
      ? formData.get(key) === 'on'
      : formData.get(key);
  }

  // Charging VAT without a registration number is an offence. Refuse the
  // combination outright rather than letting it reach a customer document.
  if (values.vatEnabled === true && !String(values.trn ?? '').trim()) {
    refuse('/admin/settings', t('Enter the TRN before switching VAT on — VAT cannot be charged without a registration number.'));
  }

  await saveSettings(values, user.id);
  const after = await getSettings();
  await audit({
    user, action: 'settings.updated', entity: 'setting',
    before: { vatEnabled: before.vatEnabled, trn: before.trn, whatsapp: before.whatsapp },
    after: { vatEnabled: after.vatEnabled, trn: after.trn, whatsapp: after.whatsapp },
  });

  // Public pages read these, so their caches have to go with them — and the
  // public pages are now /[lang]/… , once per language. A list of literal
  // paths ('/', '/quote') matches no route at all since the site gained
  // languages, so the settings would have appeared not to save.
  revalidatePath('/[lang]', 'layout');
  revalidatePath('/admin/settings');
}

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const t = adminUi(user.locale);

  const s = await getSettings();
  const history = await query<{ key: string; updated_at: string; email: string | null }>(
    `SELECT st.key, st.updated_at, u.email::text AS email
       FROM settings st LEFT JOIN users u ON u.id = st.updated_by
      ORDER BY st.updated_at DESC LIMIT 12`);

  // The headings are keys too — see EDITABLE's own note.
  const groups: [AdminKey, EditableKey[]][] = [
    ['Company',  ['legalName', 'brandName', 'tagline', 'description', 'licenceNumber',
                  'consoleWelcome']],
    ['Contact',  ['phone', 'whatsapp', 'whatsappLabel', 'email']],
    ['Registered office', ['address', 'city', 'country']],
    ['Social',   ['instagram', 'linkedin', 'facebook', 'youtube', 'tiktok', 'x']],
    ['Commerce', ['currency', 'quoteValidityDays', 'trn', 'vatEnabled', 'vatRate']],
    // The half of the company's story a search engine cannot infer: new in the
    // Emirates, not new in Italy. Added to the dictionary and to site.ts in one
    // commit and to no group in any of them, so five fields existed, were read
    // by the structured data, and could not be typed into from anywhere. The
    // orphan check below is what caught it — on the screen, in production,
    // rather than in a review.
    ['History', ['foundedIn', 'foundedAt', 'italianName', 'italianUrl', 'italianSince']],
    // Where a customer sends the money. Blank until the account is open; the
    // invoice prints nothing at all rather than half a bank record, and the
    // whole block appears the moment these are filled in.
    ['Payment', ['bankAccountName', 'bankName', 'bankIban', 'bankSwift', 'paymentNote']],
  ];

  // Every editable field belongs in a group or it is not on this screen at
  // all — which is how `address`, `city` and `country` came to be settings
  // nobody could set. Named here rather than left to be noticed.
  const shown = new Set(groups.flatMap(([, keys]) => keys));
  const orphans = (Object.keys(EDITABLE) as EditableKey[]).filter((k) => !shown.has(k));

  return (
    <>
      <h1>{t("Settings")}</h1>
      <p className="adm-sub">
        {t("These are the values the website and every document read at runtime. Changing them here takes effect immediately — no deploy, no developer.")}
      </p>

      {orphans.length > 0 && (
        <p className="adm-err">
          Not shown anywhere on this page, so nobody can change them:{' '}
          {orphans.join(', ')}. Add them to a group in this file.
        </p>
      )}

      {user.role !== 'owner' && (
        <p className="adm-err">{t("You can see these, but only the owner can change them.")}</p>
      )}

      {!s.vatEnabled && (
        <p className="adm-sub">
          <b>{t("VAT is off.")}</b> {t("Quotations and invoices state “exclusive of VAT where applicable” and charge nothing. When the TRN arrives, enter it and switch VAT on — documents already issued keep the position they were issued with, which is the point.")}
        </p>
      )}

      <form action={save}>
        {groups.map(([title, keys]) => (
          <div key={title} className="adm-panel adm-pad" style={{ marginBottom: 20 }}>
            <h2>{t(title)}</h2>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
              {keys.map((key) => {
                const f = EDITABLE[key];
                const value = s[key] as unknown;
                if (f.type === 'boolean') {
                  return (
                    <label key={key} className="adm-field"
                           style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" name={key} defaultChecked={value === true}
                             style={{ width: 16, height: 16 }} disabled={user.role !== 'owner'} />
                      <span>{t(f.label)}</span>
                    </label>
                  );
                }
                if (f.type === 'textarea') {
                  return (
                    <label key={key} className="adm-field" style={{ gridColumn: '1 / -1' }}>
                      <span>{t(f.label)}</span>
                      <textarea name={key} rows={3} defaultValue={String(value ?? '')}
                                disabled={user.role !== 'owner'} />
                    </label>
                  );
                }
                return (
                  <label key={key} className="adm-field">
                    <span>{t(f.label)}</span>
                    <input name={key}
                           type={f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text'}
                           step={f.type === 'number' ? 'any' : undefined}
                           inputMode={f.type === 'url' ? 'url' : undefined}
                           placeholder={f.type === 'url' ? 'https://…' : undefined}
                           defaultValue={String(value ?? '')}
                           disabled={user.role !== 'owner'} />
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {user.role === 'owner' && (
          <button className="adm-btn adm-save-settings" type="submit">{t("Save settings")}</button>
        )}
      </form>

      <h2 style={{ marginTop: 32 }}>{t("Recently changed")}</h2>
      <div className="adm-panel">
        {history.length === 0 ? (
          <p className="adm-empty">{t("Nothing overridden yet — the defaults are in use.")}</p>
        ) : (
          <table className="adm-t">
            <thead><tr><th>{t("Setting")}</th><th>{t("Changed")}</th><th>By</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.key}>
                  <td>{EDITABLE[h.key as EditableKey] ? t(EDITABLE[h.key as EditableKey].label) : h.key}</td>
                  <td className="num">{fmtDate(h.updated_at)}</td>
                  <td>{h.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
