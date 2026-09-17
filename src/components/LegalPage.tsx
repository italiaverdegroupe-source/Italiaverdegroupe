import L from '@/components/L';
import type { ReactNode } from 'react';

export type LegalSection = { id: string; heading: string; body: ReactNode };

/**
 * The shell every legal page shares.
 *
 * One layout, because five policies that look like five different websites
 * read as five documents somebody downloaded rather than terms a company
 * stands behind. On a phone the contents list sits above the text and each
 * entry is a proper target; from 1000px it becomes a column beside it.
 *
 * `updated` is a written-down date, never today's. A policy that says it was
 * updated today, every day, is telling you nothing and saying it confidently.
 */
export default function LegalPage({
  eyebrow, title, updated, summary, sections, footnote,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  summary: ReactNode;
  sections: LegalSection[];
  footnote?: ReactNode;
}) {
  return (
    <div className="section lgl">
      <div className="wrap">
        <header className="lgl-head">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede lgl-lede">{summary}</p>
          <p className="lgl-date">Last updated {updated}</p>
        </header>

        <div className="lgl-grid">
          <nav className="lgl-toc" aria-label="On this page">
            <p className="lgl-toc-h">On this page</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`}>{s.heading}</a></li>
              ))}
            </ol>
          </nav>

          <div className="lgl-body">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id}>
                <h2><span aria-hidden="true">{i + 1}.</span> {s.heading}</h2>
                {s.body}
              </section>
            ))}

            {footnote && <div className="lgl-foot">{footnote}</div>}

            <p className="lgl-other">
              Also on this site: <L href="/privacy">Privacy</L>{' · '}
              <L href="/terms">Terms of use</L>{' · '}
              <L href="/terms-of-sale">Terms of sale</L>{' · '}
              <L href="/refunds">Replacements &amp; refunds</L>{' · '}
              <L href="/disclaimer">Disclaimer</L>
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
 */
export function LegalContact({ site }: {
  site: { legalName: string; email: string; phone: string; whatsappLabel: string;
          address: string; city: string; country: string };
}) {
  const hasChannel = Boolean(site.email || site.phone || site.whatsappLabel);
  return (
    <>
      <p>
        <strong>{site.legalName}</strong>
        {site.address
          ? <>, {site.address}, {site.city}, {site.country}.</>
          : <> — registered in {site.city}, {site.country}.</>}
      </p>
      {hasChannel ? (
        <ul>
          {site.email && <li>Email: <a href={`mailto:${site.email}`}>{site.email}</a></li>}
          {site.phone && <li>Telephone: <a href={`tel:${site.phone}`}>{site.phone}</a></li>}
          {site.whatsappLabel && <li>WhatsApp: {site.whatsappLabel}</li>}
        </ul>
      ) : (
        <p>
          Our published telephone number and mailbox go live with the company
          domain. Until they do, the <L href="/quote">enquiry form</L> is the
          way to reach us, and every enquiry sent through it is read — including
          one about this policy. We would rather tell you that than print an
          address nobody is answering.
        </p>
      )}
    </>
  );
}
