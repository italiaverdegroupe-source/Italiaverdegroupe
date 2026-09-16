import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Verde Garden Trading imports premium trees and plants from Italian nurseries and supplies landscaping contractors, developers, hotels and private estates across the UAE.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const site = await getSettings();
  return (
    <div className="section">
      <div className="wrap prose">
        <p className="eyebrow">About</p>
        <h1>Italian horticulture, supplied properly in the Gulf.</h1>
        <p className="lede">
          {site.legalName} imports premium trees and plants direct from nurseries in
          {' '}{site.sourcingRegions.join(', ')} and supplies landscaping companies,
          developers, hotels and private estates across the United Arab Emirates.
        </p>

        <h2>Why Italian stock</h2>
        <p>
          Italian growers have spent generations producing the specimen material this region
          wants — ancient olive trees with genuine trunk character, cloud-pruned and sculptural
          forms, architectural palms and agaves. The Mediterranean climate that produces them is
          close enough to Gulf conditions that well-selected material adapts, provided it is
          handled correctly on the way.
        </p>

        <h2>Why quotations, not a checkout</h2>
        <p>
          Every specimen is different. Two olive trees of the same nominal height can differ
          completely in trunk girth, canopy and character — and therefore in price. Add
          freight, season, quantity, site access and whether planting is in scope, and a fixed
          online price would be a fiction. So we quote.
        </p>

        <h2>Living stock, handled as such</h2>
        <p>
          Trees are not freight. They need the right lifting season, correct root-ball handling,
          documentation for import, a period to acclimatise on arrival, and the right equipment
          at the point of delivery. Where a timeline or a species is not realistic, we say so
          before the order rather than after the tree fails.
        </p>

        <p className="cta">
          <Link href="/quote" className="btn btn-primary">Start an enquiry</Link>
        </p>
      </div>

      <style>{`
        .prose { max-width: 72ch; }
        .prose h2 { font-size: clamp(1.3rem, 2.2vw, 1.7rem); margin: 2.5rem 0 .75rem; }
        .prose p { color: var(--fg-soft); }
        .prose .lede { color: var(--fg-soft); }
        .cta { margin-top: 2.5rem; }
      `}</style>
    </div>
  );
}
