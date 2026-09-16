import Link from 'next/link';
import { site } from '@/lib/site';

const NAV = [
  { href: '/catalog', label: 'Catalogue' },
  { href: '/collections', label: 'Collections' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
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

        <nav aria-label="Main">
          <ul className="nav">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="hdr-cta">
          <Link href="/quote" className="btn btn-light">Request a quote</Link>
        </div>
      </div>

      <style>{`
        .hdr {
          position: sticky; top: 0; z-index: 50;
          background: var(--olive-950);
          border-bottom: 1px solid rgb(251 249 244 / .09);
        }
        .hdr-in {
          display: flex; align-items: center; gap: 28px;
          min-height: 68px;
        }
        .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #FBF9F4; margin-right: auto; }
        .brand-mark { color: var(--brass-300); display: grid; place-items: center; }
        .brand-txt { display: flex; flex-direction: column; line-height: 1.05; }
        .brand-txt strong {
          font-family: var(--font-fraunces), serif;
          font-size: 1.12rem; font-weight: 500; letter-spacing: .01em;
        }
        .brand-txt em {
          font-style: normal; font-size: .62rem; letter-spacing: .24em;
          text-transform: uppercase; color: rgb(251 249 244 / .55);
        }

        .nav { display: none; gap: 26px; list-style: none; margin: 0; padding: 0; }
        .nav a {
          color: rgb(251 249 244 / .78); text-decoration: none;
          font-size: .9rem; padding-block: 8px;
          border-bottom: 1px solid transparent;
          transition: color .16s ease, border-color .16s ease;
        }
        .nav a:hover { color: #FBF9F4; border-bottom-color: var(--brass-500); }

        .hdr-cta .btn { padding: .6em 1.15em; font-size: .85rem; }

        @media (min-width: 900px) { .nav { display: flex; } }
        @media (max-width: 420px) { .hdr-cta .btn { padding: .55em .9em; font-size: .8rem; } }
      `}</style>
    </header>
  );
}
