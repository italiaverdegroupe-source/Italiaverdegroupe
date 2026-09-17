import L from '@/components/L';
import { getSettings } from '@/lib/settings';
import { getFamilies, getAllProducts } from '@/lib/products';
import { site as fallback } from '@/lib/site';
import Social from './Social';
import { ui } from '@/lib/ui';
import { type Locale } from '@/lib/i18n';

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

export default async function Footer({ locale }: { locale: Locale }) {
  const t = ui(locale);
  const site = await getSettings();
  const families = getFamilies();
  const total = getAllProducts().length;
  const lead = fallback.leadTimeWeeks;
  const hasChannel = Boolean(site.whatsappLabel || site.phone || site.email);

  return (
    <footer className="ftr">
      <div className="wrap">
        {/* ── the company ───────────────────────────────────── */}
        <div className="ftr-top">
          <div className="ftr-id">
            <L href="/" className="ftr-lockup">
              <span className="ftr-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                     stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 21V11" strokeLinecap="round" />
                  <path d="M12 12c0-4.4 3.1-8 7-8 .4 3.9-2.4 8-7 8Z" strokeLinejoin="round" />
                  <path d="M12 16c-3.4 0-6-2.8-6-6.2 3 .3 6 2.9 6 6.2Z" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="ftr-lockup-txt">
                <strong>{site.brandName}</strong>
                <em>Trading</em>
              </span>
            </L>
            <p className="ftr-tag">{site.tagline}</p>
            <p className="ftr-note">{site.description}</p>
            <Social links={site} className="ftr-soc" />
          </div>

          <div className="ftr-cols">
            <nav className="ftr-col" aria-label={t('ftr.catalogue')}>
              <h3 className="ftr-h">{t('ftr.catalogue')}</h3>
              <ul>
                <li><L href="/catalog">{t('ftr.allSpecimens', { n: total })}</L></li>
                {families.map((f) => (
                  <li key={f.slug}><L href={`/collections/${f.slug}`}>{f.name}</L></li>
                ))}
              </ul>
            </nav>

            <nav className="ftr-col" aria-label={t('ftr.company')}>
              <h3 className="ftr-h">{t('ftr.company')}</h3>
              <ul>
                <li><L href="/about">{t('ftr.aboutUs')}</L></li>
                <li><L href="/services">{t('nav.services')}</L></li>
                <li><L href="/journal">{t('nav.journal')}</L></li>
                <li><L href="/contact">{t('nav.contact')}</L></li>
                <li><L href="/legal">{t('ftr.legal')}</L></li>
              </ul>
            </nav>

            <div className="ftr-col">
              <h3 className="ftr-h">{t('ftr.enquiries')}</h3>
              {/* Only channels that are actually answered. An advertised
                  number nobody picks up loses the enquiry twice over. */}
              {hasChannel && (
                <ul className="ftr-contact">
                  {site.whatsappLabel && (
                    <li>
                      <a href={`https://wa.me/${site.whatsapp.replace(/[^\d]/g, '')}`}
                         target="_blank" rel="noopener noreferrer">
                        WhatsApp {site.whatsappLabel}
                      </a>
                    </li>
                  )}
                  {site.phone && <li><a href={`tel:${site.phone}`}>{site.phone}</a></li>}
                  {site.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}
                </ul>
              )}
              <ul>
                <li><L href="/quote">{t('cta.quote')}</L></li>
                <li><L href="/quote?type=bulk">{t('cta.bulk')}</L></li>
                <li><L href="/quote?type=sourcing">{t('cta.sourcing')}</L></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── the facts, one line each ───────────────────────── */}
        <dl className="ftr-facts">
          <div>
            <dt>{t('ftr.deliveringTo')}</dt>
            <dd>
              {/* Was a column of eight links. Seven is the number, and a list
                  of them was a lot of footer for one sentence. */}
              <L href="/locations/dubai">
                {t('ftr.allEmirates', { n: WORDS[site.emirates.length] ?? site.emirates.length })}
              </L>
            </dd>
          </div>
          <div>
            <dt>{t('ftr.sourcedFrom')}</dt>
            <dd>{site.sourcingRegions.join(' · ')}</dd>
          </div>
          <div>
            <dt>{t('ftr.leadTime')}</dt>
            <dd>{t('ftr.weeksToSite', { min: lead.min, max: lead.max })}</dd>
          </div>
        </dl>

        <hr className="rule" />

        {/* ── the small print ───────────────────────────────── */}
        <div className="ftr-base">
          <nav className="ftr-legal" aria-label={t('ftr.legal')}>
            <L href="/privacy">{t('legal.privacy')}</L>
            <L href="/terms">{t('legal.terms')}</L>
            <L href="/terms-of-sale">{t('legal.termsOfSale')}</L>
            <L href="/refunds">{t('legal.refunds')}</L>
            <L href="/disclaimer">{t('legal.disclaimer')}</L>
          </nav>
          <p>© {new Date().getFullYear()} {site.legalName}. {t('ftr.rights')}</p>
          <p className="ftr-sm">
{t('ftr.vat')}
          </p>
          {(site.licenceNumber || site.trn || site.address) && (
            <p className="ftr-sm">
              {site.address && <>{site.address}, {site.city}, {site.country}</>}
              {site.address && (site.licenceNumber || site.trn) && ' · '}
              {site.licenceNumber && <>{t('ftr.licence', { n: site.licenceNumber })}</>}
              {site.licenceNumber && site.trn && ' · '}
              {site.trn && <>{t('ftr.trn', { n: site.trn })}</>}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .ftr {
          background: var(--olive-950); color: rgb(251 249 244 / .72);
          /* The bottom value clears the floating WhatsApp button, so the last
             line of the footer never comes to REST underneath it. Overlapping
             copy while you scroll past is the nature of a floating button;
             permanently covering the bottom of the page is a defect. */
          padding-block: clamp(48px, 7vw, 76px) 96px; margin-top: 0;
        }

        .ftr-top {
          display: grid; gap: clamp(32px, 4vw, 64px);
          padding-bottom: clamp(32px, 4vw, 48px);
        }
        @media (min-width: 900px) {
          .ftr-top { grid-template-columns: minmax(260px, 1fr) minmax(0, 1.9fr); }
        }

        .ftr-lockup {
          display: inline-flex; align-items: center; gap: 11px;
          text-decoration: none; color: #FBF9F4; margin-bottom: 1rem;
        }
        /* The lockup is a link home from the bottom of every page. */
        @media (pointer: coarse) { .ftr-lockup { min-height: 44px; } }
        .ftr-mark { color: var(--brass-300); display: grid; place-items: center; }
        .ftr-lockup-txt { display: flex; flex-direction: column; line-height: 1.05; }
        .ftr-lockup-txt strong {
          font-family: var(--font-fraunces), serif;
          font-size: 1.28rem; font-weight: 500; letter-spacing: -.015em;
        }
        .ftr-lockup-txt em {
          font-style: normal; font-size: .6rem; letter-spacing: .3em;
          text-transform: uppercase; color: var(--brass-300);
        }
        .ftr-tag {
          font-family: var(--font-fraunces), serif; font-size: 1rem;
          color: rgb(251 249 244 / .88); margin-bottom: .7rem; max-width: 34ch;
        }
        .ftr-note {
          font-size: .875rem; line-height: 1.65; color: rgb(251 249 244 / .6);
          max-width: 46ch;
        }
        .ftr-soc { margin-top: 1.3rem; color: #FBF9F4; }

        .ftr-cols {
          display: grid; gap: 32px 28px;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        }
        .ftr-h {
          font-family: var(--font-inter), sans-serif;
          font-size: .7rem; font-weight: 600; letter-spacing: .18em;
          text-transform: uppercase; color: var(--brass-300); margin-bottom: .9rem;
        }
        /* Scoped to the link columns. Written as .ftr ul it also caught the
           row of social marks, which is a list too, and laid them out as a
           grid — one under another down the side of the footer. */
        .ftr-cols ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .2rem; }
        .ftr-contact { margin-bottom: 1rem !important; }
        .ftr-contact a { color: var(--brass-300); }
        .ftr a { color: rgb(251 249 244 / .72); text-decoration: none; font-size: .9rem; }
        .ftr a:hover { color: #FBF9F4; }
        .ftr-col a:hover { text-decoration: underline; text-underline-offset: 3px; }
        /* A footer link was a 17px-tall line of text. On a phone that is not a
           target, it is a hope. The row grows where the pointer is a finger. */
        .ftr-cols li a { display: inline-flex; align-items: center; min-height: 34px; }
        @media (pointer: coarse) {
          .ftr-cols li a { min-height: 44px; }
          .ftr-cols ul { gap: 0; }
        }

        .ftr-facts {
          display: grid; gap: 18px 32px; margin: 0 0 clamp(28px, 3.5vw, 40px);
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          padding-top: clamp(28px, 3.5vw, 40px);
          border-top: 1px solid rgb(251 249 244 / .12);
        }
        .ftr-facts > div { min-width: 0; }
        .ftr-facts dt {
          font-size: .68rem; font-weight: 600; letter-spacing: .16em;
          text-transform: uppercase; color: rgb(251 249 244 / .5); margin-bottom: .4em;
        }
        .ftr-facts dd {
          margin: 0; font-family: var(--font-fraunces), serif;
          font-size: 1rem; line-height: 1.35; color: rgb(251 249 244 / .88);
        }
        .ftr-facts dd a { font-size: inherit; font-family: inherit; }
        .ftr-facts dd a:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (pointer: coarse) {
          .ftr-facts dd a { display: inline-flex; align-items: center; min-height: 44px; }
        }

        .ftr .rule { background: rgb(251 249 244 / .12); border: 0; height: 1px; margin: 0; }

        .ftr-base { padding-top: 24px; display: grid; gap: .35rem; }
        .ftr-base p { margin: 0; font-size: .82rem; color: rgb(251 249 244 / .5); }
        .ftr-legal {
          display: flex; flex-wrap: wrap; align-items: center;
          gap: 0 1.4rem; margin-bottom: .6rem;
        }
        .ftr-legal a {
          display: inline-flex; align-items: center; min-height: 34px;
          font-size: .84rem; color: rgb(251 249 244 / .82);
        }
        .ftr-legal a:hover { text-decoration: underline; text-underline-offset: 3px; }
        @media (pointer: coarse) {
          .ftr-legal { gap: 0 1.2rem; }
          .ftr-legal a { min-height: 44px; }
        }
        .ftr-sm { font-size: .8rem; }
      `}</style>
    </footer>
  );
}
