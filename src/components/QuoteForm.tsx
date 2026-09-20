'use client';

import L from '@/components/L';
import { useState, useRef, useEffect } from 'react';
import { site, fallbackContact } from '@/lib/site';
import { ui } from '@/lib/ui';
import { productCopy } from '@/lib/product-copy';
import { useLocale } from '@/components/LocaleProvider';

type Props = {
  defaultType?: 'quote' | 'bulk' | 'sourcing';
  defaultRef?: string;
  products: { reference: string; name: string }[];
};

/**
 * Keys, not labels.
 *
 * These three were English strings, so the first thing an Arabic or Italian
 * visitor met on the only page that turns a reader into an enquiry was three
 * English options and three English hints. Everything else on the form was
 * translated around them.
 */
const TYPES = [
  { v: 'quote', label: 'qf.type.quote', hint: 'qf.type.quote.hint' },
  { v: 'bulk', label: 'qf.type.bulk', hint: 'qf.type.bulk.hint' },
  { v: 'sourcing', label: 'qf.type.sourcing', hint: 'qf.type.sourcing.hint' },
] as const;

export default function QuoteForm({ defaultType = 'quote', defaultRef = '', products }: Props) {
  // The locale comes from the provider in the root layout, not from the
  // path: see the note in LocaleProvider about prerender and /en.
  const locale = useLocale();
  const t = ui(locale);
  const [type, setType] = useState<string>(defaultType);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Focus follows the confirmation the moment it replaces the form. Focusing
  // scrolls it into view, which is the fix for the sighted visitor, and moves
  // the screen reader's cursor, which is the fix for everyone else.
  useEffect(() => {
    if (state === 'done') doneRef.current?.focus();
  }, [state]);
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
      if (!res.ok || !json.ok) { setError(json.error ?? t('qf.error')); setState('error'); return; }
      setReference(json.reference); setState('done');
    } catch {
      setError(`Network error. ${fallbackContact()}`);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      /**
       * The one screen in the funnel that must land, and it did not.
       *
       * Submitting from the bottom of a long form swapped the form for this
       * block and left the scroll position where it was — 893px down a page
       * that is now 300px tall, so the confirmation and the reference number
       * sat above the viewport and the visitor saw a blank strip and the
       * footer. Nothing announced it either: focus fell to <body> and there
       * was no live region, so a screen reader said nothing at all and the
       * reference number — the only thing the visitor needs to keep — was
       * never spoken.
       *
       * role="status" announces it; focusing the heading (tabindex -1) both
       * scrolls it into view and gives every assistive technology an
       * unambiguous place to start reading.
       */
      <div className="done" role="status" aria-live="polite">
        <h2 ref={doneRef} tabIndex={-1}>{t("Enquiry received.")}</h2>
        <p className="done-ref">{t("Your reference is")} <strong>{reference}</strong></p>
        <p>
          {t("We will come back with availability, lead time and a priced quotation. Very large or out-of-season specimens can take longer to confirm with the nursery.")}
        </p>
        <L className="btn btn-primary" href="/catalog">{t("Back to the catalogue")}</L>
        <style>{`
          .done { padding: 48px 0; max-width: 56ch; }
          .done-ref { font-size: 1.1rem; }
          .done-ref strong { font-family: var(--font-fraunces), serif; color: var(--olive-700); letter-spacing: .02em; }
          .done h2:focus-visible { outline: 2px solid var(--brass-500); outline-offset: 6px; }
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
        {/* `ty`, not `t` — the loop variable shadowed the translator, which is
            why these three were the strings that never got translated. */}
        {TYPES.map((ty) => (
          <label key={ty.v} className={`type ${type === ty.v ? 'on' : ''}`}>
            <input type="radio" name="_type" value={ty.v}
                   checked={type === ty.v} onChange={() => setType(ty.v)} />
            <span className="type-l">{t(ty.label)}</span>
            <span className="type-h">{t(ty.hint)}</span>
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
                <option key={p.reference} value={p.reference}>
                    {p.reference} — {productCopy(p, locale).name}
                  </option>
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
            ? t('qf.msg.sourcing')
            : t('qf.msg.general')}
          {sourcing && <i> *</i>}
        </span>
        <textarea name="message" rows={5} required={sourcing} maxLength={4000} />
      </label>

      {/* honeypot */}
      {/* The honeypot uses the site's own visually-hidden utility rather
          than a rule of its own: it IS a visually-hidden element, and the
          mobile audit already knows that class is not a tap target. */}
      <div className="hp visually-hidden" aria-hidden="true">
        <label>{t("Website")}<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t('qf.consentA')} {site.legalName} {t('qf.consentB')}
        </span>
      </label>

      {state === 'error' && <p role="alert" className="err">{error}</p>}

      <button type="submit" className="btn btn-primary submit" disabled={state === 'sending'}>
        {state === 'sending' ? t('qf.sending') : t('qf.send')}
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

        /* The honeypot. It was off-screen by left: -9999px, which in Arabic is
           off-screen in the direction the page grows — 9999px of sideways
           scroll on /ar/quote, on a form, which is the worst page on the site
           to make unusable. Clipped to nothing instead: no direction involved,
           and it stays invisible to a person while a bot still fills it in. */
        /* The honeypot. It was off-screen by left: -9999px, which in Arabic
           is off-screen in the direction the page GROWS — 9999px of sideways
           scroll on /ar/quote, on a form, which is the worst page on the site
           to make unusable.
           Clipped to nothing instead, and the input inside it collapsed too:
           the wrapper being 1px does not shrink a child that sets its own
           width, and a 250x20 input nobody can see is still a 250x20 input as
           far as a tap-target audit is concerned. It stays in the DOM and
           stays fillable, which is the entire point of a honeypot. */
        /* Was left: -9999px, which in Arabic is off-screen in the direction
           the page GROWS — 9999px of sideways scroll on /ar/quote, on a form,
           which is the worst page on the site to make unusable. The clipping
           comes from .visually-hidden now; this only has to stop the input
           inside from setting its own width, because a 1px wrapper does not
           shrink a child that does. */
        .hp input, .hp label { width: 1px; height: 1px; min-height: 0; padding: 0; border: 0; }

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
