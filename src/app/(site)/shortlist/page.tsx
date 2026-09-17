'use client';

import Link from 'next/link';
import { useState } from 'react';
import { removeFromShortlist, setShortlistQty, clearShortlist } from '@/lib/shortlist';
import { useShortlist, useHydrated } from '@/lib/use-shortlist';

/**
 * The shortlist, and one enquiry for all of it.
 *
 * Client-rendered because the list only exists in the visitor's browser —
 * there is nothing on the server to render, and asking for an account to hold
 * six references would lose more enquiries than it saves.
 *
 * The form is deliberately the short one: name, email, and the two fields that
 * change the answer (emirate and when it is needed). Everything else the quote
 * form asks is knowable from the list itself or can be asked in the reply. A
 * buyer who has just spent ten minutes choosing eight trees should not then
 * meet a twelve-field form.
 */
export default function ShortlistPage() {
  const items = useShortlist();
  const ready = useHydrated();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((s, i) => s + i.qty, 0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending || items.length === 0) return;
    setError(null);
    setSending(true);

    const fd = new FormData(e.currentTarget);
    const note = String(fd.get('message') ?? '').trim();

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          enquiryType: 'quote',
          name: String(fd.get('name') ?? ''),
          company: String(fd.get('company') ?? ''),
          email: String(fd.get('email') ?? ''),
          phone: String(fd.get('phone') ?? ''),
          emirate: String(fd.get('emirate') ?? ''),
          requiredDate: String(fd.get('requiredDate') ?? ''),
          // The specimens go in structured, and ONLY structured. Writing them
          // into the message as well put the same table on the screen twice
          // for whoever reads the lead. The notification that goes out carries
          // the written-out version, so nothing that only sees an email loses
          // the list.
          items: items.map((i) => ({ ref: i.ref, name: i.name, slug: i.slug, qty: i.qty })),
          message: note,
          source: 'shortlist',
          website: '',
          consent: true,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error || 'That did not send. Please try again, or message us on WhatsApp.');
        return;
      }
      setDone(body.reference);
      clearShortlist();
    } catch {
      setError('That did not send — the connection dropped. Your list is still here; try again.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="section">
        <div className="wrap sl-narrow">
          <p className="eyebrow">Sent</p>
          <h1>Thank you — we have it.</h1>
          <p className="lede">
            Your reference is <strong>{done}</strong>. We read every enquiry the day
            it arrives and come back with availability, sizes and a price for each
            specimen on the list.
          </p>
          <div className="sl-actions">
            <Link href="/catalog" className="btn btn-primary">Back to the catalogue</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">Your shortlist</p>
        <h1>Everything you picked, one enquiry.</h1>
        <p className="lede sl-lede">
          Set the quantity against each specimen and send the whole list at once.
          We will price them together, which is also how they ship — one
          consignment costs less per tree than six.
        </p>

        {!ready ? (
          <p className="sl-empty">Reading your list…</p>
        ) : items.length === 0 ? (
          <p className="sl-empty">
            Nothing on your list yet. Add specimens from the{' '}
            <Link href="/catalog">catalogue</Link> — the button is on every card
            and on every specimen page.
          </p>
        ) : (
          <div className="sl-grid">
            <div>
              <ul className="sl-items">
                {items.map((i) => (
                  <li key={i.ref}>
                    <span className="sl-item-main">
                      <Link href={`/catalog/${i.slug}`} className="sl-item-name">{i.name}</Link>
                      <span className="sl-item-ref">{i.ref}</span>
                    </span>
                    <span className="sl-qty">
                      <label htmlFor={`q-${i.ref}`} className="visually-hidden">
                        Quantity of {i.name}
                      </label>
                      <input
                        id={`q-${i.ref}`} type="number" min={1} max={9999} value={i.qty}
                        onChange={(e) => setShortlistQty(i.ref, Number(e.target.value))}
                      />
                    </span>
                    <button type="button" className="sl-remove"
                            onClick={() => removeFromShortlist(i.ref)}
                            aria-label={`Remove ${i.name}`}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                           strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="sl-total">
                {items.length} specimen{items.length === 1 ? '' : 's'}
                {total !== items.length && <> · {total} plants in total</>}
                {' · '}
                <button type="button" className="sl-clear" onClick={() => clearShortlist()}>
                  Clear the list
                </button>
              </p>
            </div>

            <form className="sl-form" onSubmit={submit} noValidate={false}>
              <h2>Where should the price go?</h2>

              <div className="sl-row">
                <label htmlFor="sl-name">Your name</label>
                <input id="sl-name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
              </div>
              <div className="sl-row">
                <label htmlFor="sl-company">Company <span>optional</span></label>
                <input id="sl-company" name="company" maxLength={160} autoComplete="organization" />
              </div>
              <div className="sl-row">
                <label htmlFor="sl-email">Email</label>
                <input id="sl-email" name="email" type="email" required maxLength={180} autoComplete="email" />
              </div>
              <div className="sl-row">
                <label htmlFor="sl-phone">Phone or WhatsApp <span>optional</span></label>
                <input id="sl-phone" name="phone" maxLength={40} autoComplete="tel" />
              </div>
              <div className="sl-two">
                <div className="sl-row">
                  <label htmlFor="sl-emirate">Emirate <span>optional</span></label>
                  <input id="sl-emirate" name="emirate" maxLength={60} />
                </div>
                <div className="sl-row">
                  <label htmlFor="sl-when">Needed by <span>optional</span></label>
                  <input id="sl-when" name="requiredDate" maxLength={40} placeholder="e.g. March" />
                </div>
              </div>
              <div className="sl-row">
                <label htmlFor="sl-msg">Anything else <span>optional</span></label>
                <textarea id="sl-msg" name="message" rows={3} maxLength={4000}
                          placeholder="Access for a crane, planting included, a drawing to send over…" />
              </div>

              {error && <p className="sl-error" role="alert">{error}</p>}

              <button type="submit" className="btn btn-primary btn-lg sl-send" disabled={sending}>
                {sending ? 'Sending…' : `Send this list${items.length ? ` (${items.length})` : ''}`}
              </button>
              <p className="sl-fine">
                No prices are published — every specimen is quoted individually, because
                availability and size change with the consignment.
              </p>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .sl-narrow { max-width: 62ch; }
        .sl-lede { max-width: 56ch; }
        .sl-empty { margin: 40px 0; color: var(--fg-soft); font-size: 1.02rem; }
        .sl-actions { margin-top: 2rem; }

        .sl-grid {
          display: grid; gap: clamp(28px, 4vw, 56px); margin-top: 36px;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          align-items: start;
        }
        @media (max-width: 900px) { .sl-grid { grid-template-columns: minmax(0, 1fr); } }

        .sl-items { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
        .sl-items li {
          display: grid; grid-template-columns: minmax(0, 1fr) auto auto;
          align-items: center; gap: 14px;
          padding: 14px 0; border-bottom: 1px solid var(--line-soft);
        }
        .sl-item-main { display: grid; gap: 2px; min-width: 0; }
        .sl-item-name {
          font-family: var(--font-fraunces), serif; font-size: 1.06rem;
          color: var(--olive-950); text-decoration: none;
        }
        .sl-item-name:hover { text-decoration: underline; }
        .sl-item-ref {
          font-size: .68rem; letter-spacing: .13em; text-transform: uppercase;
          color: var(--ink-600);
        }
        .sl-qty input {
          width: 5.5rem; font: inherit; font-size: .92rem; text-align: center;
          padding: .45em .3em; border: 1px solid var(--line); border-radius: var(--radius);
          background: var(--bg); color: var(--fg);
        }
        .sl-qty input:focus { outline: 2px solid var(--olive-700); outline-offset: 1px; }
        .sl-remove {
          display: grid; place-items: center; width: 30px; height: 30px;
          background: none; border: 1px solid var(--line); border-radius: 50%;
          color: var(--ink-600); cursor: pointer;
        }
        .sl-remove:hover { border-color: var(--terra-700); color: var(--terra-700); }
        .sl-total { margin-top: 14px; font-size: .86rem; color: var(--fg-soft); }
        .sl-clear {
          font: inherit; font-size: inherit; background: none; border: 0; padding: 0;
          color: var(--ink-600); text-decoration: underline; cursor: pointer;
        }
        .sl-clear:hover { color: var(--terra-700); }

        .sl-form {
          padding: clamp(22px, 2.6vw, 32px);
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius-lg);
        }
        .sl-form h2 { margin-bottom: 1.1rem; font-size: 1.15rem; }
        .sl-row { display: grid; gap: 5px; margin-bottom: 14px; }
        .sl-row label { font-size: .78rem; font-weight: 500; color: var(--olive-900); }
        .sl-row label span {
          font-weight: 400; color: var(--ink-600); text-transform: uppercase;
          font-size: .64rem; letter-spacing: .1em; margin-inline-start: .5em;
        }
        .sl-row input, .sl-row textarea {
          font: inherit; font-size: .95rem; padding: .6em .75em;
          border: 1px solid var(--line); border-radius: var(--radius);
          background: var(--bg); color: var(--fg); width: 100%;
        }
        .sl-row input:focus, .sl-row textarea:focus {
          outline: 2px solid var(--olive-700); outline-offset: 1px; border-color: var(--olive-700);
        }
        .sl-two { display: grid; gap: 0 14px; grid-template-columns: 1fr 1fr; }
        @media (max-width: 480px) { .sl-two { grid-template-columns: 1fr; } }
        .sl-send { width: 100%; margin-top: 6px; }
        .sl-send[disabled] { opacity: .65; cursor: progress; }
        .sl-error {
          margin: 0 0 12px; padding: .7em .9em; font-size: .86rem;
          background: rgb(155 58 43 / .09); border: 1px solid rgb(155 58 43 / .3);
          border-radius: var(--radius); color: #7C2E22;
        }
        .sl-fine { margin: 14px 0 0; font-size: .78rem; color: var(--fg-soft); }
      `}</style>
    </div>
  );
}
