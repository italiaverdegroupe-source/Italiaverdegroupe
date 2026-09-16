import Link from 'next/link';
import { site } from '@/lib/site';
import { getFamilies } from '@/lib/products';

export default function Footer() {
  const families = getFamilies();
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <p className="ftr-brand">Verde Garden Trading</p>
            <p className="ftr-note">{site.description}</p>
            <p className="ftr-note">
              Sourced from {site.sourcingRegions.join(' · ')}
            </p>
          </div>

          <div>
            <h3 className="ftr-h">Catalogue</h3>
            <ul>
              {families.map((f) => (
                <li key={f.slug}><Link href={`/collections/${f.slug}`}>{f.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="ftr-h">Delivering to</h3>
            <ul>
              {site.emirates.map((e) => (
                <li key={e.slug}><Link href={`/locations/${e.slug}`}>{e.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="ftr-h">Enquiries</h3>
            <ul>
              <li><Link href="/quote">Request a quote</Link></li>
              <li><Link href="/quote?type=bulk">Bulk &amp; project pricing</Link></li>
              <li><Link href="/quote?type=sourcing">Source a specific tree</Link></li>
            </ul>
            <p className="ftr-note ftr-sm">
              Lead time {site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks from order
              confirmation to UAE site delivery.
            </p>
          </div>
        </div>

        <hr className="rule" />

        <div className="ftr-base">
          <p>© {new Date().getFullYear()} {site.legalName}. All prices on request.</p>
          <p className="ftr-sm">
            Prices exclusive of VAT where applicable. Specifications are indicative;
            living stock varies in size and form.
          </p>
        </div>
      </div>

      <style>{`
        .ftr { background: var(--olive-950); color: rgb(251 249 244 / .72); padding-block: 64px 32px; margin-top: 0; }
        .ftr-grid {
          display: grid; gap: 40px 32px;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          padding-bottom: 48px;
        }
        .ftr-grid > div:first-child { grid-column: span 1; min-width: 240px; }
        .ftr-brand {
          font-family: var(--font-fraunces), serif; font-size: 1.25rem;
          color: #FBF9F4; margin-bottom: .6rem;
        }
        .ftr-h {
          font-family: var(--font-inter), sans-serif;
          font-size: .72rem; font-weight: 600; letter-spacing: .16em;
          text-transform: uppercase; color: var(--brass-300); margin-bottom: 1rem;
        }
        .ftr ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
        .ftr a { color: rgb(251 249 244 / .72); text-decoration: none; font-size: .9rem; }
        .ftr a:hover { color: #FBF9F4; text-decoration: underline; text-underline-offset: 3px; }
        .ftr-note { font-size: .875rem; line-height: 1.6; color: rgb(251 249 244 / .6); }
        .ftr-sm { font-size: .8rem; }
        .ftr .rule { background: rgb(251 249 244 / .12); }
        .ftr-base { padding-top: 24px; display: grid; gap: .35rem; }
        .ftr-base p { margin: 0; font-size: .82rem; color: rgb(251 249 244 / .5); }
      `}</style>
    </footer>
  );
}
