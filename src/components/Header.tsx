import Link from 'next/link';

const NAV = [
  { href: '/catalog', label: 'Catalogue' },
  { href: '/collections', label: 'Collections' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21V11" strokeLinecap="round" />
              <path d="M12 12c0-4.4 3.1-8 7-8 .4 3.9-2.4 8-7 8Z" strokeLinejoin="round" />
              <path d="M12 16c-3.4 0-6-2.8-6-6.2 3 .3 6 2.9 6 6.2Z" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-txt">
            <strong>Verde Garden</strong>
            <em>Trading</em>
          </span>
        </Link>

        {/* The lockup from the brand sheet: a hairline rule, then the line that
            says what the company is for. Hidden on narrow screens, where it
            would wrap into the navigation. */}
        <p className="brand-line" aria-hidden="true">
          Italian roots<br />for a greener tomorrow
        </p>

        <nav aria-label="Main">
          <ul className="nav">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="hdr-cta">
          <Link href="/quote" className="btn btn-primary">
            Request a quote <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      <style>{`
        /* Light rather than the olive bar it used to be. Every public page
           opens on travertine, and a dark band across the top of all of them
           was doing the work of a frame nobody asked for. */
        .hdr {
          position: sticky; top: 0; z-index: 50;
          background: rgb(252 250 245 / .92);
          -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--line-soft);
        }
        /* On a page whose hero is a full-bleed photograph, the bar would cut a
           line across the top of the picture. :has() lets the header know what
           the page below it looks like without threading a prop through the
           layout — the hero's own travertine wash keeps the navigation legible. */
        body:has(.hero-veil) .hdr {
          background: none;
          -webkit-backdrop-filter: none; backdrop-filter: none;
          border-bottom-color: transparent;
        }
        /* The scrim is a pseudo-element half again as tall as the bar, not the
           bar's own background, for two reasons. A gradient on the bar is
           sized to its padding box and then tiled, so the 1px border strip
           below it gets the gradient's first, near-opaque stop — a bright
           hairline straight across the photograph. And a fade that has to
           finish inside 78px is either too weak to carry the navigation over
           the crown of the tree or steep enough to read as a band. Running it
           past the bar and out to nothing solves both. */
        body:has(.hero-veil) .hdr::before {
          content: ''; position: absolute; z-index: -1; pointer-events: none;
          inset: 0 0 auto 0; height: 190%;
          background: linear-gradient(to bottom,
            rgb(250 247 240 / .93) 0%,
            rgb(250 247 240 / .66) 42%,
            rgb(250 247 240 / .22) 74%,
            rgb(250 247 240 / 0) 100%);
        }
        @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
          .hdr { background: var(--sand-50); }
        }
        .hdr-in { display: flex; align-items: center; gap: 26px; min-height: var(--hdr-h); }

        .brand { display: flex; align-items: center; gap: 11px; text-decoration: none; color: var(--olive-900); }
        .brand-mark { color: var(--olive-700); display: grid; place-items: center; }
        .brand-txt { display: flex; flex-direction: column; line-height: 1.05; }
        .brand-txt strong {
          font-family: var(--font-fraunces), serif;
          font-size: clamp(1.05rem, 3.4vw, 1.3rem); font-weight: 500; letter-spacing: -.01em;
          /* The name is the name. Letting it wrap to "Verde / Garden" on a
             phone turns the brandmark into two words that look unrelated. */
          white-space: nowrap;
        }
        .brand-txt em {
          font-style: normal; font-size: .6rem; letter-spacing: .3em;
          /* ink-400 gives 4.35:1 on travertine — under AA before a photograph
             is anywhere near it. This word is half the company's name. */
          text-transform: uppercase; color: var(--ink-600);
        }

        .brand-line {
          display: none; margin: 0 auto 0 0;
          padding-inline-start: 22px; border-inline-start: 1px solid var(--line);
          font-size: .62rem; line-height: 1.5; letter-spacing: .18em;
          text-transform: uppercase; color: var(--ink-600);
        }

        .nav { display: none; gap: 26px; list-style: none; margin: 0; padding: 0; }
        .nav a {
          color: var(--ink-600); text-decoration: none;
          font-size: .9rem; padding-block: 8px;
          border-bottom: 1px solid transparent;
          transition: color .16s ease, border-color .16s ease;
        }
        .nav a:hover { color: var(--olive-700); border-bottom-color: var(--brass-500); }

        .hdr-cta .btn { padding: .7em 1.3em; font-size: .85rem; }

        @media (min-width: 1100px) { .brand-line { display: block; } }
        @media (min-width: 900px) { .nav { display: flex; } .brand { margin-right: 0; } }
        @media (max-width: 1099px) { .brand { margin-right: auto; } }
        .hdr-cta .btn { white-space: nowrap; }
        @media (max-width: 560px) {
          .hdr-in { gap: 12px; }
          .hdr-cta .btn { padding: .6em .9em; font-size: .78rem; }
        }
        @media (max-width: 380px) {
          /* Below this the arrow is the first thing that can go. */
          .hdr-cta .btn span { display: none; }
        }
      `}</style>
    </header>
  );
}
