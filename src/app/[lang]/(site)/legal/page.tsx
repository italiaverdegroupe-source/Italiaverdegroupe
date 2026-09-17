import type { Metadata } from 'next';
import { alternates, type Locale } from '@/lib/i18n';
import L from '@/components/L';

const meta = {
  title: 'Legal',
  description:
    'Privacy policy, terms of use, terms of sale, replacements and refunds, and the website disclaimer for Verde Garden Trading.',
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> },
): Promise<Metadata> {
  const { lang } = await params;
  return { ...meta, alternates: alternates(lang, '/legal') };
}

const PAGES = [
  {
    href: '/privacy',
    name: 'Privacy policy',
    line: 'What we record when you send an enquiry, how long we keep it, and who sees it.',
    note: 'No cookies, no analytics, no tracking.',
  },
  {
    href: '/terms',
    name: 'Terms of use',
    line: 'The terms on which this website may be used, and what you may do with what is on it.',
    note: 'About the site, not about buying.',
  },
  {
    href: '/terms-of-sale',
    name: 'Terms of sale',
    line: 'How a quotation becomes an order: lead times, delivery, acceptance, payment, title and risk.',
    note: 'The one to read before you sign.',
  },
  {
    href: '/refunds',
    name: 'Replacements & refunds',
    line: 'What happens when a tree arrives wrong, arrives damaged, or fails after planting.',
    note: 'Windows, evidence, and what we do.',
  },
  {
    href: '/disclaimer',
    name: 'Website disclaimer',
    line: 'What the photographs, sizes and growing notes mean — and what they do not promise.',
    note: 'Where the line is drawn.',
  },
];

export default function LegalIndexPage() {
  return (
    <div className="section">
      <div className="wrap">
        <header className="lgx-head">
          <p className="eyebrow">Legal</p>
          <h1>The small print, written to be read.</h1>
          <p className="lede">
            Five documents, each about one thing, in plain sentences. If any of them
            is unclear, that is a fault in the document — tell us and we will fix it.
          </p>
        </header>

        <ul className="lgx">
          {PAGES.map((p) => (
            <li key={p.href}>
              <L href={p.href}>
                <span className="lgx-n">{p.name}</span>
                <span className="lgx-l">{p.line}</span>
                <span className="lgx-note">{p.note}</span>
              </L>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .lgx-head { max-width: 60ch; }
        .lgx-head .lede { max-width: 52ch; }
        .lgx {
          list-style: none; margin: clamp(36px, 5vw, 56px) 0 0; padding: 0;
          display: grid; gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
        .lgx a {
          display: grid; gap: 4px; height: 100%;
          padding: clamp(18px, 2.2vw, 24px);
          text-decoration: none; background: var(--bg);
          border: 1px solid var(--line); border-radius: var(--radius-lg);
          transition: border-color .18s ease, background .18s ease;
        }
        .lgx a:hover { border-color: var(--olive-300); background: var(--sand-50); }
        .lgx-n {
          font-family: var(--font-display); font-size: 1.2rem;
          color: var(--olive-950); line-height: 1.2;
        }
        .lgx-l { font-size: .92rem; color: var(--fg-soft); }
        .lgx-note {
          margin-top: .35rem; font-size: .75rem; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brass-700);
        }
        @media (prefers-reduced-motion: reduce) { .lgx a { transition: none; } }
      `}</style>
    </div>
  );
}
