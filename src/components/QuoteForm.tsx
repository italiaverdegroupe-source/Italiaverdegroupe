'use client';

import L from '@/components/L';
import { useState } from 'react';
import { site, fallbackContact } from '@/lib/site';
import { ui } from '@/lib/ui';
import { useLocale } from '@/components/LocaleProvider';

type Props = {
  defaultType?: 'quote' | 'bulk' | 'sourcing';
  defaultRef?: string;
  products: { reference: string; name: string }[];
};

const TYPES = [
  { v: 'quote', label: 'Quote a specimen', hint: 'You know what you want' },
  { v: 'bulk', label: 'Bulk / project pricing', hint: 'Volume for a project' },
  { v: 'sourcing', label: 'Source a specific tree', hint: 'Not in the catalogue' },
] as const;

export default function QuoteForm({ defaultType = 'quote', defaultRef = '', products }: Props) {
  // The locale comes from the provider in the root layout, not from the
  // path: see the note in LocaleProvider about prerender and /en.
  const t = ui(useLocale());
  const [type, setType] = useState<string>(defaultType);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending'); setError('');
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    payload.consent = fd.get('consent') === 'on';
    payload.enquiryType = type;
    if (!payload.quantity) delete payload.quantity;
    payload.source = typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct';

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error ?? 'Something went wrong.'); setState('error'); return; }
      setReference(json.reference); setState('done');
    } catch {
      setError(`Network error. ${fallbackContact()}`);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="done">
        <h2>{t("Enquiry received.")}</h2>
        <p className="done-ref">{t("Your reference is")} <strong>{reference}</strong></p>
        <p>
          {t("We will come back with availability, lead time and a priced quotation. Very large or out-of-season specimens can take longer to confirm with the nursery.")}
        </p>
        <L className="btn btn-primary" href="/catalog">{t("Back to the catalogue")}</L>
        <style>{`
          .done { padding: 48px 0; max-width: 56ch; }
          .done-ref { font-size: 1.1rem; }
          .done-ref strong { font-family: var(--font-fraunces), serif; color: var(--olive-700); letter-spacing: .02em; }
        `}</style>
      </div>
    );
  }

  const bulk = type === 'bulk';
  const sourcing = type === 'sourcing';

  return (
    <form onSubmit={onSubmit} className="qf" noValidate>
      <fieldset className="types">
        <legend className="flabel">{t("What do you need?")}</legend>
        {TYPES.map((t) => (
          <label key={t.v} className={`type ${type === t.v ? 'on' : ''}`}>
            <input type="radio" name="_type" value={t.v}
                   checked={type === t.v} onChange={() => setType(t.v)} />
            <span className="type-l">{t.label}</span>
            <span className="type-h">{t.hint}</span>
          </label>
        ))}
      </fieldset>

      <div className="row">
        <label className="fld">
          <span>{t("Name")} <i>*</i></span>
          <input name="name" required autoComplete="name" maxLength={120} />
        </label>
        <label className="fld">
          <span>{t("Company")}</span>
          <input name="company" autoComplete="organization" maxLength={160} />
        </label>
      </div>

      <div className="row">
        <label className="fld">
          <span>{t("Email")} <i>*</i></span>
          <input name="email" type="email" required autoComplete="email" maxLength={180} />
        </label>
        <label className="fld">
          <span>{t("Phone / WhatsApp")}</span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+971…" />
        </label>
      </div>

      <div className="row">
        <label className="fld">
          <span>{t("Emirate")}</span>
          <select name="emirate" defaultValue="">
            <option value="">{t("Select…")}</option>
            {site.emirates.map((e) => <option key={e.slug} value={e.name}>{e.name}</option>)}
          </select>
        </label>
        <label className="fld">
          <span>{t("Project type")}</span>
          <select name="projectType" defaultValue="">
            <option value="">{t("Select…")}</option>
            {site.projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      {!sourcing && (
        <div className="row">
          <label className="fld">
            <span>{t("Specimen")}</span>
            <select name="productRef" defaultValue={defaultRef}>
              <option value="">{t("Not sure / several")}</option>
              {products.map((p) => (
                <option key={p.reference} value={p.reference}>{p.reference} — {p.name}</option>
              ))}
            </select>
          </label>
          <label className="fld">
            <span>{t("Quantity")}{bulk && <i> *</i>}</span>
            <input name="quantity" type="number" min={1} max={100000} required={bulk} />
          </label>
        </div>
      )}

      <div className="row">
        <label className="fld">
          <span>{t("Scope required")}</span>
          <select name="serviceScope" defaultValue="">
            <option value="">{t("Select…")}</option>
            {site.serviceScopes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="fld">
          <span>{t("Required on site by")}</span>
          <input name="requiredDate" type="month" />
        </label>
      </div>

      <label className="fld">
        <span>
          {sourcing
            ? 'Describe the tree you are looking for — species, age, height, trunk girth, form'
            : 'Anything else we should know — site access, planting, timeline'}
          {sourcing && <i> *</i>}
        </span>
        <textarea name="message" rows={5} required={sourcing} maxLength={4000} />
      </label>

      {/* honeypot */}
      <div className="hp" aria-hidden="true">
        <label>{t("Website")}<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          I agree thatI agree that {site.legalName} may store these details and contact me about this enquiry. We do not sell or share your data.may store these details and contact me about this enquiry. We do not sell or share your data.
        </span>
      </label>

      {state === 'error' && <p role="alert" className="err">{error}</p>}

      <button type="submit" className="btn btn-primary submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>

      <p className="legal">
        Prices are quoted individually and are exclusive of VAT where applicable. Quotations are valid for {site.quoteValidityDays} days.
      </p>

      <style>{`
        .qf { display: grid; gap: 20px; max-width: 760px; }
        .flabel {
          font-size: .7rem; font-weight: 600; letter-spacing: .14em;
          text-transform: uppercase; color: var(--fg-mute); padding: 0; margin-bottom: 12px;
        }
        .types { border: 0; padding: 0; margin: 0; display: grid; gap: 10px;
                 grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
        .types legend { float: left; width: 100%; }
        .type {
          display: grid; gap: 2px; cursor: pointer; padding: 14px 16px;
          background: var(--bg-raised); border: 1px solid var(--line);
          border-radius: var(--radius); transition: all .16s ease;
        }
        .type input { position: absolute; opacity: 0; pointer-events: none; }
        .type:hover { border-color: var(--olive-400); }
        .type.on { border-color: var(--olive-700); box-shadow: inset 0 0 0 1px var(--olive-700); }
        .type-l { font-weight: 500; font-size: .95rem; }
        .type-h { font-size: .78rem; color: var(--fg-mute); }

        .row { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .fld { display: grid; gap: 6px; }
        .fld > span { font-size: .85rem; font-weight: 500; }
        .fld i { color: var(--brass-700); font-style: normal; }
        .fld input, .fld select, .fld textarea {
          font: inherit; font-size: .95rem; padding: .7em .85em;
          background: var(--bg-raised); color: var(--fg);
          border: 1px solid var(--line); border-radius: var(--radius);
          width: 100%; transition: border-color .16s ease;
        }
        .fld textarea { resize: vertical; line-height: 1.55; }
        .fld input:focus, .fld select:focus, .fld textarea:focus { border-color: var(--olive-700); }

        .hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

        /* The whole label is the target, not the 16px box beside it — the
           consent tick is required, so a visitor who cannot hit it cannot send
           the enquiry at all. */
        .consent {
          display: flex; gap: 10px; align-items: flex-start;
          font-size: .86rem; color: var(--fg-soft);
          padding: .5em 0; cursor: pointer;
        }
        .consent input {
          margin-top: .1em; flex-shrink: 0;
          width: 22px; height: 22px; accent-color: var(--olive-700);
        }
        @media (pointer: coarse) {
          .consent { min-height: 44px; align-items: center; }
          .consent input { width: 26px; height: 26px; margin-top: 0; }
        }

        .err {
          margin: 0; padding: .8em 1em; font-size: .88rem;
          background: #FDF1EC; border: 1px solid #E3B7A4; border-radius: var(--radius); color: #7A2E12;
        }
        .submit { justify-self: start; padding: .95em 2.2em; }
        .submit:disabled { opacity: .6; cursor: progress; }
        .legal { font-size: .78rem; color: var(--fg-mute); margin: 0; }
      `}</style>
    </form>
  );
}
