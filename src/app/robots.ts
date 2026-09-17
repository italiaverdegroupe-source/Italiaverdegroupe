import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://verdegarden.example';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        // The operations console. It is behind a password and every screen
        // already sets noindex, but a crawler should not be spending the
        // site's crawl budget discovering that fifteen times over — and a
        // /admin URL in a search result, even as a login page, is an
        // invitation nobody needs to send.
        '/admin',
        '/admin/',
        // The shortlist is per-visitor and built in the browser; indexed, it
        // would be an empty page competing with the catalogue.
        '/shortlist',
        // Search results pages. The catalogue itself is the page worth
        // ranking; ?q= and ?family= are the same stock sliced, and left
        // crawlable they become hundreds of near-duplicate URLs.
        '/*?q=',
        '/*?family=',
        '/*?sort=',
      ],
    }],
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ''),
  };
}
