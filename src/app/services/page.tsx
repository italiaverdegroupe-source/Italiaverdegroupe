import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Services — supply, import, delivery and planting',
  description:
    'Tree supply from Italian nurseries, import and phytosanitary documentation, acclimatisation, delivery with crane offloading, and planting across the UAE.',
  alternates: { canonical: '/services' },
};

const SERVICES = [
  ['Nursery sourcing', 'Selection at the grower across Toscana, Puglia, Sicilia and Lombardia — by specification, not from a stock list.'],
  ['Import & documentation', 'Phytosanitary certification, import permits, customs clearance and the paperwork that goes with live plant material.'],
  ['Acclimatisation', 'Conditioning on arrival before stock is released to site, so trees establish rather than fail in their first summer.'],
  ['Transport & offloading', 'Low-loader and crane or hiab where the root ball demands it, with site access confirmed before scheduling.'],
  ['Planting', 'Pit preparation, soil amendment, staking and irrigation connection where planting is in scope.'],
  ['Project supply', 'Phased consignments held to one specification across a development, so phase four matches phase one.'],
];

export default function ServicesPage() {
  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">Services</p>
        <h1>From the Italian nursery to the finished site.</h1>
        <p className="lede">
          Scope is quoted to what the project actually needs — {site.serviceScopes.join(', ').toLowerCase()}.
        </p>

        <div className="grid cols-2 svc">
          {SERVICES.map(([t, d]) => (
            <article key={t} className="svc-card">
              <h2>{t}</h2>
              <p>{d}</p>
            </article>
          ))}
        </div>

        <section className="season">
          <h2>A word about timing</h2>
          <p>
            Trees are living stock and the calendar matters. Lifting season in Italy and the
            UAE summer both limit when a specimen can safely move and establish. We will tell
            you the realistic window for a species rather than accept a delivery date that
            would cost you the tree.
          </p>
          <Link href="/quote" className="btn btn-primary">Discuss a project</Link>
        </section>
      </div>

      <style>{`
        .svc { margin-top: 48px; }
        .svc-card { padding-top: 22px; border-top: 2px solid var(--olive-700); }
        .svc-card h2 { font-size: 1.2rem; margin-bottom: .45rem; }
        .svc-card p { color: var(--fg-soft); font-size: .93rem; margin: 0; }
        .season {
          margin-top: clamp(56px, 8vw, 88px); padding: 36px;
          background: var(--sand-100); border: 1px solid var(--line); border-radius: var(--radius-lg);
          max-width: 74ch;
        }
        .season h2 { font-size: 1.5rem; }
        .season p { color: var(--fg-soft); }
      `}</style>
    </div>
  );
}
