import L from '@/components/L';
import React from 'react';
import type { Block, LegalDoc } from '@/lib/legal/types';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { ui } from '@/lib/ui';

/**
 * The shell every legal page shares, and the renderer for the documents in
 * src/lib/legal.
 *
 * One layout, because five policies that look like five different websites
 * read as five documents somebody downloaded rather than terms a company
 * stands behind. On a phone the contents list sits above the text and each
 * entry is a proper target; from 1000px it becomes a column beside it.
 *
 * `updated` is a written-down date, never today's. A policy that says it was
 * updated today, every day, is telling you nothing and saying it confidently.
 */

export type LegalTokens = Record<string, string | number>;

export type ContactSite = {
  legalName: string; email: string; phone: string; whatsappLabel: string;
  address: string; city: string; country: string; currency?: string;
  licenceNumber?: string; trn?: string;
};

/** http(s) and same-site links only — the same rule Prose applies to the journal. */
function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  try {
    const u = new URL(href);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

/**
 * Inline formatting, after token substitution.
 *
 * Substitution happens FIRST and on the raw string, so `{legalName}` inside a
 * link's text or inside bold works, and so a value containing a bracket cannot
 * turn into markup — the resolved text is never re-scanned for tokens.
 */
function inline(raw: string, tokens: LegalTokens, keyBase: string): React.ReactNode[] {
  const text = raw.replace(/\{(\w+)\}/g, (all, k) => (k in tokens ? String(tokens[k]) : all));
  return text.split(TOKEN).filter(Boolean).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <span key={key}>{link[1]}</span>;
      if (href.startsWith('/')) return <L key={key} href={href}>{link[1]}</L>;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        return <a key={key} href={href}>{link[1]}</a>;
      }
      return <a key={key} href={href} rel="noopener nofollow" target="_blank">{link[1]}</a>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function renderBlock(
  b: Block, i: number, tokens: LegalTokens, site: ContactSite, locale: Locale,
): React.ReactNode {
  const k = `b${i}`;
  switch (b.t) {
    case 'p':
      return <p key={k}>{inline(b.text, tokens, k)}</p>;
    case 'ul':
      return (
        <ul key={k}>
          {b.items.map((it, j) => <li key={j}>{inline(it, tokens, `${k}-${j}`)}</li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol key={k}>
          {b.items.map((it, j) => <li key={j}>{inline(it, tokens, `${k}-${j}`)}</li>)}
        </ol>
      );
    case 'dl':
      return (
        <dl key={k}>
          {b.items.map((it, j) => (
            <React.Fragment key={j}>
              <dt>{inline(it.term, tokens, `${k}-t${j}`)}</dt>
              <dd>{inline(it.def, tokens, `${k}-d${j}`)}</dd>
            </React.Fragment>
          ))}
        </dl>
      );
    case 'note':
      return <div key={k} className="lgl-note"><p>{inline(b.text, tokens, k)}</p></div>;
    case 'contact':
      return <LegalContact key={k} site={site} locale={locale} />;
  }
}

export default function LegalPage({
  doc, site, locale, tokens = {},
}: {
  doc: LegalDoc;
  site: ContactSite;
  locale: Locale;
  tokens?: LegalTokens;
}) {
  const t = ui(locale);
  // Never today's date. `LEGAL_UPDATED` is an ISO string so that it can be
  // formatted in the reader's own language rather than printed as the English
  // "17 September 2026" on an Arabic page.
  const updated = new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-AE' : locale === 'it' ? 'it-IT' : 'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' },
  ).format(new Date(`${doc.updatedOn}T00:00:00Z`));

  const all: LegalTokens = {
    legalName: site.legalName, city: site.city, country: site.country,
    address: site.address, currency: site.currency ?? 'AED', ...tokens,
  };

  return (
    <div className="section lgl">
      <div className="wrap">
        <header className="lgl-head">
          <p className="eyebrow">{t('legal.eyebrow')}</p>
          <h1>{doc.title}</h1>
          <p className="lede lgl-lede">{inline(doc.summary, all, 'sum')}</p>
          <p className="lgl-date">{t('legal.updated', { date: updated })}</p>
        </header>

        {/* A translated contract is a courtesy, and saying which text governs is
            not a disclaimer of the translation — it is the sentence that stops
            two versions of a clause being argued about later. English only on
            the English page, where it would be circular. */}
        {locale !== DEFAULT_LOCALE && (
          <p className="lgl-prevails">{t('legal.prevails')}</p>
        )}

        <div className="lgl-grid">
          <nav className="lgl-toc" aria-label={t('legal.onThisPage')}>
            <p className="lgl-toc-h">{t('legal.onThisPage')}</p>
            <ol>
              {doc.sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`}>{s.heading}</a></li>
              ))}
            </ol>
          </nav>

          <div className="lgl-body">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2><span aria-hidden="true">{i + 1}.</span> {s.heading}</h2>
                {s.body.map((b, j) => renderBlock(b, j, all, site, locale))}
              </section>
            ))}

            {doc.footnote && (
              <div className="lgl-foot"><p>{inline(doc.footnote, all, 'foot')}</p></div>
            )}

            <p className="lgl-other">
              {t('legal.alsoOnThisSite')}{' '}
              <L href="/privacy">{t('legal.privacy')}</L>{' · '}
              <L href="/terms">{t('legal.terms')}</L>{' · '}
              <L href="/terms-of-sale">{t('legal.termsOfSale')}</L>{' · '}
              <L href="/refunds">{t('legal.refunds')}</L>{' · '}
              <L href="/disclaimer">{t('legal.disclaimer')}</L>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .lgl-head { max-width: 62ch; }
        .lgl-lede { max-width: 54ch; margin-bottom: 1rem; }
        .lgl-date {
          margin: 0; font-size: .78rem; letter-spacing: .12em;
          text-transform: uppercase; color: var(--fg-mute);
        }
        .lgl-prevails {
          margin: clamp(20px, 3vw, 30px) 0 0; padding: .8rem 1.05rem;
          max-width: 62ch; font-size: .86rem; line-height: 1.6;
          color: var(--fg-soft); background: var(--sand-100);
          border: 1px solid var(--line); border-radius: var(--radius);
          border-inline-start: 3px solid var(--brass-700);
        }

        .lgl-grid {
          display: grid; gap: clamp(28px, 4vw, 64px);
          margin-top: clamp(36px, 5vw, 60px);
          align-items: start;
        }
        @media (min-width: 1000px) {
          .lgl-grid { grid-template-columns: 15rem minmax(0, 1fr); }
          .lgl-toc { position: sticky; top: calc(var(--hdr-h) + 20px); }
        }

        .lgl-toc { border-top: 1px solid var(--line); padding-top: 14px; }
        .lgl-toc-h {
          margin: 0 0 .4rem; font-size: .68rem; font-weight: 600;
          letter-spacing: .16em; text-transform: uppercase; color: var(--fg-mute);
        }
        .lgl-toc ol {
          list-style: none; margin: 0; padding: 0;
          counter-reset: toc;
        }
        .lgl-toc li { counter-increment: toc; }
        .lgl-toc a {
          display: flex; gap: .7em; align-items: baseline;
          /* 44px of target, because this is a list of small links and a phone
             is where policies actually get read. */
          padding: .62rem 0; min-height: 44px;
          font-size: .88rem; color: var(--fg-soft); text-decoration: none;
          border-bottom: 1px solid var(--line-soft);
        }
        .lgl-toc a::before {
          content: counter(toc); flex: none; width: 1.4em;
          font-size: .74rem; color: var(--fg-mute);
          font-variant-numeric: tabular-nums;
        }
        .lgl-toc a:hover { color: var(--olive-700); }

        .lgl-body { max-width: 68ch; }
        .lgl-body section { scroll-margin-top: calc(var(--hdr-h) + 24px); }
        .lgl-body section + section { margin-top: clamp(34px, 4vw, 52px); }
        .lgl-body h2 {
          font-size: clamp(1.3rem, 2.4vw, 1.7rem); margin-bottom: .7rem;
          display: flex; gap: .5em; align-items: baseline;
        }
        .lgl-body h2 span { color: var(--brass-700); font-size: .72em; flex: none; }
        .lgl-body p { color: var(--fg-soft); }
        .lgl-body p:last-child { margin-bottom: 0; }
        .lgl-body ul, .lgl-body ol { color: var(--fg-soft); padding-inline-start: 1.3em; margin: 0 0 1.1rem; }
        .lgl-body li { margin-bottom: .45rem; }
        .lgl-body li::marker { color: var(--fg-mute); }
        .lgl-body strong { color: var(--fg); font-weight: 600; }
        .lgl-body a { color: var(--olive-700); }
        .lgl-body dl { margin: 0 0 1.1rem; }
        .lgl-body dt {
          font-weight: 600; color: var(--fg); margin-top: .9rem; font-size: .95rem;
        }
        .lgl-body dd { margin: .2rem 0 0; color: var(--fg-soft); }

        /* The mailbox and the telephone number on a policy page were a 20px
           line of text. On a phone that is not a target, and these are the
           addresses somebody uses when they want to exercise a right the page
           has just told them they have. */
        .lgl-contact a { display: inline-flex; align-items: center; min-height: 34px; }
        @media (pointer: coarse) { .lgl-contact a { min-height: 44px; } }

        .lgl-note {
          margin: 1.2rem 0; padding: 1rem 1.15rem;
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius); font-size: .93rem;
        }
        .lgl-note p:last-child { margin-bottom: 0; }

        .lgl-foot {
          margin-top: clamp(40px, 5vw, 64px); padding-top: 22px;
          border-top: 1px solid var(--line); font-size: .9rem; color: var(--fg-soft);
        }
        .lgl-other {
          margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--line-soft);
          font-size: .86rem; color: var(--fg-mute);
        }
        .lgl-other a {
          display: inline-flex; align-items: center; min-height: 34px;
          color: var(--fg-soft);
        }
        @media (pointer: coarse) { .lgl-other a { min-height: 44px; } }
      `}</style>
    </div>
  );
}

/**
 * How to reach the company, said only about channels that exist.
 *
 * Shared by all five pages, because a policy whose "contact us" paragraph
 * names a mailbox nobody has opened is worse than one that tells you to use
 * the form — and which of those is true changes the day a mailbox is
 * configured, not the day somebody remembers to edit five files.
 *
 * The trade licence and TRN print only once they are set in Settings. A legal
 * page that states a licence number it does not have is worse than one that
 * omits it, so nothing here is invented to fill a line.
 */
export function LegalContact({ site, locale = DEFAULT_LOCALE }: {
  site: ContactSite;
  locale?: Locale;
}) {
  const t = ui(locale);
  const hasChannel = Boolean(site.email || site.phone || site.whatsappLabel);
  return (
    <>
      <p>
        <strong>{site.legalName}</strong>
        {site.address
          ? <>, {site.address}, {site.city}, {site.country}.</>
          : <> — {t('legal.registeredIn', { city: site.city, country: site.country })}</>}
      </p>
      {(site.licenceNumber || site.trn) && (
        <ul>
          {site.licenceNumber && <li>{t('legal.licence')} {site.licenceNumber}</li>}
          {site.trn && <li>{t('legal.trn')} {site.trn}</li>}
        </ul>
      )}
      {hasChannel ? (
        <ul className="lgl-contact">
          {site.email && (
            <li>{t('legal.email')} <a href={`mailto:${site.email}`}>{site.email}</a></li>
          )}
          {site.phone && (
            <li>{t('legal.telephone')} <a href={`tel:${site.phone}`}>{site.phone}</a></li>
          )}
          {site.whatsappLabel && <li>{t('legal.whatsapp')} {site.whatsappLabel}</li>}
        </ul>
      ) : (
        <p>
          {t('legal.noChannelsA')}{' '}
          <L href="/quote">{t('legal.enquiryForm')}</L>{' '}
          {t('legal.noChannelsB')}
        </p>
      )}
    </>
  );
}
