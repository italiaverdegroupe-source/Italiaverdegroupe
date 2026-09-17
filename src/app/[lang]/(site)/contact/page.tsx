import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import L from '@/components/L';
import { metadataFor } from '@/lib/content';
import { getSettings } from '@/lib/settings';
import { ui } from '@/lib/ui';

export const revalidate = 300;

export const generateMetadata = async (
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> => metadataFor((await params).lang, '/contact', {
  title: 'Contact',
  description:
    'Reach Verde Garden Trading — WhatsApp, phone and email, delivery across the United Arab Emirates, and what to send us so a quotation comes back the same day.',
});

/**
 * A contact page, because "Request a quote" is not one.
 *
 * A form asks somebody to commit to a transaction before they have decided
 * they want to talk to you. A buyer checking whether a supplier is real wants
 * a name, a licence, a number that answers and a sense of where they operate —
 * and if none of that is on the site, the next tab is a competitor's.
 *
 * Nothing here is invented. Every channel appears only once it is configured
 * in the console, and what is not configured is not mentioned rather than
 * shown blank or filled with a placeholder somebody might actually dial.
 */
export default async function ContactPage(
  { params }: { params: Promise<{ lang: Locale }> },
) {
  const { lang } = await params;
  const t = ui(lang);
  const site = await getSettings();

  const channels = [
    site.whatsapp && {
      k: 'WhatsApp',
      v: site.whatsappLabel || site.whatsapp,
      href: `https://wa.me/${site.whatsapp.replace(/[^\d]/g, '')}`,
      note: 'Fastest. Send photographs, sizes and a site location and we can price from them.',
      external: true,
    },
    site.phone && {
      k: 'Phone', v: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}`,
      note: 'For anything urgent — a delivery window, a site access problem.',
    },
    site.email && {
      k: 'Email', v: site.email, href: `mailto:${site.email}`,
      note: 'Best for drawings, plant schedules and bills of quantity.',
    },
  ].filter(Boolean) as { k: string; v: string; href: string; note: string; external?: boolean }[];

  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">{t("Contact")}</p>
        <h1>{t("Talk to us about the project.")}</h1>
        <p className="lede">
          We supply landscaping contractors, developers, hotels and private estates across all {site.emirates.length} emirates. Tell us what the drawing calls for and we will tell you what we hold, what we can bring in, and how long it takes.
        </p>

        {channels.length > 0 ? (
          <ul className="ct-channels">
            {channels.map((c) => (
              <li key={c.k}>
                <span className="ct-k">{c.k}</span>
                <a className="ct-v" href={c.href}
                   {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {c.v}
                </a>
                <span className="ct-note">{c.note}</span>
              </li>
            ))}
          </ul>
        ) : (
          /* Said plainly rather than left as an empty panel. A page that shows
             a heading and nothing under it reads as broken; this reads as a
             company that has not finished setting up, which is the truth. */
          <p className="ct-none">
            Our phone and mailbox are being set up with the domain and are not live yet. Until they are, the enquiry form reaches us and is read every day — <L href="/quote">send it here</L> and we will come back to you by email.
          </p>
        )}

        <div className="ct-grid">
          <section>
            <h2>{t("What to send")}</h2>
            <p>
              {t("The more of this you have, the faster the number comes back — but a photograph and a rough height are enough to start.")}
            </p>
            <ul className="ct-list">
              <li>{t("Species, or a photograph of something close to it")}</li>
              <li>{t("Height or girth, and how many")}</li>
              <li>{t("The emirate, and whether a crane can reach the planting position")}</li>
              <li>{t("When it has to be on site")}</li>
              <li>{t("Supply only, or supply with delivery and planting")}</li>
            </ul>
            <L href="/quote" className="btn btn-primary">
              {t("Start an enquiry")} <span aria-hidden="true">&rarr;</span>
            </L>
          </section>

          <section>
            <h2>{t("Where we deliver")}</h2>
            <p>
              Delivery across the United Arab Emirates. Lead time is normally{' '}
              {site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks from order to site for imported stock, and shorter for anything already acclimatised here.
            </p>
            <ul className="ct-emirates">
              {site.emirates.map((e) => (
                <li key={e.slug}><L href={`/locations/${e.slug}`}>{e.name}</L></li>
              ))}
            </ul>

            <h2 className="ct-h2-second">{t("The company")}</h2>
            <dl className="ct-dl">
              <dt>{t("Registered name")}</dt><dd>{site.legalName}</dd>
              {site.licenceNumber && (<><dt>{t("Trade licence")}</dt><dd>{site.licenceNumber}</dd></>)}
              {site.trn && (<><dt>TRN</dt><dd>{site.trn}</dd></>)}
              <dt>{t("Sourcing")}</dt><dd>{site.sourcingRegions.join(', ')}</dd>
            </dl>
            {!site.trn && (
              <p className="ct-fine">
                {t("Not yet registered for VAT, so quotations carry no VAT line. They state that they are exclusive of VAT where it applies.")}
              </p>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .ct-channels {
          list-style: none; margin: 34px 0 44px; padding: 0;
          display: grid; gap: 1px; background: var(--line-soft);
          border: 1px solid var(--line-soft); border-radius: var(--radius-lg); overflow: hidden;
        }
        .ct-channels li {
          display: grid; gap: 4px; padding: 20px 22px; background: var(--bg);
          grid-template-columns: 120px minmax(0, 1fr);
        }
        .ct-k {
          grid-row: span 2; align-self: center;
          font-size: .68rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--ink-600);
        }
        .ct-v {
          font-family: var(--font-fraunces), serif; font-size: 1.24rem;
          color: var(--olive-900); text-decoration: none;
          border-bottom: 1px solid var(--line); padding-bottom: 2px; justify-self: start;
        }
        .ct-v:hover { border-bottom-color: var(--olive-700); }
        .ct-note { font-size: .86rem; color: var(--fg-soft); }

        .ct-none {
          margin: 34px 0 44px; padding: 20px 22px;
          background: var(--sand-100); border: 1px solid var(--line);
          border-radius: var(--radius-lg); color: var(--fg-soft); max-width: 62ch;
        }

        .ct-grid { display: grid; gap: clamp(28px, 4vw, 56px); grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .ct-grid h2 { margin-bottom: .5em; }
        .ct-h2-second { margin-top: 2em; }
        .ct-grid p { color: var(--fg-soft); max-width: 46ch; }
        .ct-list { margin: 0 0 1.6em; padding-inline-start: 1.1em; color: var(--fg-soft); }
        .ct-list li { margin-bottom: .4em; }

        .ct-emirates {
          list-style: none; margin: 0 0 0; padding: 0;
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        @media (pointer: coarse) {
          .ct-emirates a { display: inline-flex; align-items: center; min-height: 44px; }
        }
        .ct-emirates a {
          display: inline-block; padding: .4em .85em;
          border: 1px solid var(--line); border-radius: 999px;
          font-size: .84rem; color: var(--ink-600); text-decoration: none;
        }
        .ct-emirates a:hover { border-color: var(--olive-700); color: var(--olive-700); }

        .ct-dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 18px; margin: 0; }
        .ct-dl dt { font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-600); align-self: center; }
        .ct-dl dd { margin: 0; color: var(--fg); }
        .ct-fine { font-size: .82rem; margin-top: 1.2em; }

        @media (max-width: 560px) {
          .ct-channels li { grid-template-columns: minmax(0, 1fr); }
          .ct-k { grid-row: auto; }
        }
        /* A row of channels is the whole point of this page; on a phone each
           of them has to be a target rather than a line of text. */
        @media (pointer: coarse) {
          .ch a, .ch-link, .ct-chan a { display: inline-flex; align-items: center; min-height: 44px; }
        }

      `}</style>
    </div>
  );
}
