import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section">
      <div className="wrap nf">
        <p className="eyebrow">404</p>
        <h1>That page has been replanted.</h1>
        <p className="lede">The page you asked for is not here. The catalogue is.</p>
        <p className="nf-cta">
          <Link href="/catalog" className="btn btn-primary">Browse the catalogue</Link>
          <Link href="/quote" className="btn btn-ghost">Request a quote</Link>
        </p>
      </div>
      <style>{`
        .nf { max-width: 60ch; padding-block: clamp(32px, 6vw, 72px); }
        .nf-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2rem; }
      `}</style>
    </div>
  );
}
