import type { ReactElement } from 'react';

/**
 * The company's accounts, and only the ones that exist.
 *
 * An empty field renders nothing. A row of five icons where three lead to a
 * page that has never been posted on tells a buyer more about the company
 * than two icons would — and the same rule already governs the telephone
 * number and the mailbox everywhere else on this site.
 *
 * Marks are drawn rather than loaded: five brand logos from a CDN is five
 * requests, a third party watching every page view, and a licence question
 * nobody asked. These are the outlines, at one stroke weight, so they read as
 * part of the footer instead of as five different companies' branding.
 */
export type SocialLinks = {
  instagram?: string; linkedin?: string; facebook?: string;
  youtube?: string; tiktok?: string; x?: string;
};

const MARKS: { key: keyof SocialLinks; name: string; path: ReactElement }[] = [
  {
    key: 'instagram', name: 'Instagram',
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    key: 'linkedin', name: 'LinkedIn',
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7.5 10.5V17" />
        <circle cx="7.5" cy="7.4" r=".9" fill="currentColor" stroke="none" />
        <path d="M11.4 17v-3.6a2.4 2.4 0 0 1 4.8 0V17" />
        <path d="M11.4 10.6V17" />
      </>
    ),
  },
  {
    key: 'facebook', name: 'Facebook',
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M15.2 8.2h-1.4a1.8 1.8 0 0 0-1.8 1.8V21" />
        <path d="M9.6 13h5" />
      </>
    ),
  },
  {
    key: 'youtube', name: 'YouTube',
    path: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10.4 9.6 15 12l-4.6 2.4z" />
      </>
    ),
  },
  {
    // Drawn as the letter rather than the old bird. The account is called X,
    // and a bird in 2026 dates the footer of a company that has just started.
    //
    // Named "X (Twitter)" rather than "X" because this string is the
    // accessible name: a screen reader announcing a link as "X" gives a blind
    // visitor one letter that is equally the word for close. The old name is
    // still the one most people recognise, and it costs a sighted reader
    // nothing — the mark next to it is the letter either way.
    key: 'x', name: 'X (Twitter)',
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 8l8 8" />
        <path d="M16 8l-8 8" />
      </>
    ),
  },
  {
    key: 'tiktok', name: 'TikTok',
    path: (
      <>
        <path d="M14.2 3v10.6a3.5 3.5 0 1 1-2.9-3.45" />
        <path d="M14.2 3.4c.5 2.1 2 3.5 4.3 3.7" />
      </>
    ),
  },
];

export default function Social({ links, className = '' }: {
  links: SocialLinks; className?: string;
}) {
  const present = MARKS.filter((m) => {
    const href = links[m.key];
    return typeof href === 'string' && href.startsWith('http');
  });
  if (present.length === 0) return null;

  return (
    <ul className={`soc ${className}`.trim()}>
      {present.map((m) => (
        <li key={m.key}>
          <a href={links[m.key]} target="_blank" rel="noopener noreferrer me"
             aria-label={m.name} title={m.name}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                 stroke="currentColor" strokeWidth="1.5"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {m.path}
            </svg>
          </a>
        </li>
      ))}

      <style>{`
        .soc { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0; }
        .soc a {
          display: grid; place-items: center;
          width: 42px; height: 42px; border-radius: 50%;
          color: inherit; text-decoration: none;
          /* .62 was measured against the footer's olive and came out faint —
             the mark read as a smudge at 19px rather than as a logo somebody
             recognises. These are the only way to a company's Instagram from
             the site, so they have to be legible, not merely present. */
          border: 1px solid currentColor; opacity: .78;
          transition: opacity .18s ease, background .18s ease, transform .18s ease;
        }
        .soc a:hover { opacity: 1; background: rgb(255 255 255 / .08); transform: translateY(-1px); }
        /* 42px is under the floor a thumb needs, and these sit in a row. */
        @media (pointer: coarse) { .soc a { width: 46px; height: 46px; } }
        @media (prefers-reduced-motion: reduce) { .soc a { transition: opacity .18s ease; } }
      `}</style>
    </ul>
  );
}
