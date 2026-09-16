import type { Metadata } from 'next';
import QuoteForm from '@/components/QuoteForm';
import { site } from '@/lib/site';
import { getAllProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Request a quote',
  description:
    'Tell us the species, sizes, quantities and site. We come back with availability, lead time and a priced quotation for delivery anywhere in the UAE.',
};

type Search = { type?: string; ref?: string };

export default async function QuotePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const type = sp.type === 'bulk' || sp.type === 'sourcing' ? sp.type : 'quote';
  const products = getAllProducts().map((p) => ({ reference: p.reference, name: p.name }));

  return (
    <div className="section">
      <div className="wrap">
        <p className="eyebrow">Enquiry</p>
        <h1>Request a quote</h1>
        <p className="lede">
          There is no checkout — every specimen is priced individually against the season,
          the consignment and the scope of work. Send us the detail and we will price it
          properly.
        </p>
        <div className="qgrid">
          <QuoteForm defaultType={type} defaultRef={sp.ref ?? ''} products={products} />
          <aside className="aside">
            <h2 className="aside-h">What happens next</h2>
            <ol className="steps">
              <li><strong>We confirm availability</strong><span>Against current stock and the next consignment from Italy.</span></li>
              <li><strong>We price the scope</strong><span>Supply, delivery, crane and offloading, planting — whatever you need.</span></li>
              <li><strong>You get a written quotation</strong><span>Valid {site.quoteValidityDays} days, with specification and lead time.</span></li>
            </ol>
            <hr className="rule" />
            <p className="aside-note">
              Typical lead time is {site.leadTimeWeeks.min}–{site.leadTimeWeeks.max} weeks from
              order confirmation to delivery on a UAE site. Large or out-of-season specimens
              can take longer — we will tell you honestly rather than promise a date we cannot hold.
            </p>
          </aside>
        </div>
      </div>

      <style>{`
        .qgrid { display: grid; gap: clamp(32px, 5vw, 64px); margin-top: 40px; align-items: start; }
        .aside {
          padding: 28px; background: var(--sand-100);
          border: 1px solid var(--line); border-radius: var(--radius-lg);
        }
        .aside-h { font-size: 1.1rem; margin-bottom: 1.25rem; }
        .steps { margin: 0 0 1.5rem; padding: 0 0 0 1.1rem; display: grid; gap: 1rem; }
        .steps li { font-size: .9rem; }
        .steps strong { display: block; font-weight: 500; }
        .steps span { color: var(--fg-soft); }
        .aside-note { font-size: .85rem; color: var(--fg-soft); margin: 1.25rem 0 0; }
        @media (min-width: 1000px) { .qgrid { grid-template-columns: minmax(0, 1.5fr) minmax(280px, .85fr); } }
      `}</style>
    </div>
  );
}
