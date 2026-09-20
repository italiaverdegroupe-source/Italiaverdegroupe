import type { MetadataRoute } from 'next';

/**
 * Read at REQUEST time, not build time.
 *
 * This file is what a crawler reads first, and it was the one page on the site
 * that could never correct itself. Next prerenders it once during `next build`
 * and serves that copy for the life of the deployment — and the production
 * build runs inside Docker, where NEXT_PUBLIC_SITE_URL is not visible unless
 * the Dockerfile declares it as a build argument, which it did not. So the
 * fallback below won, and the live robots.txt told Google the sitemap was at
 * https://verdegarden.example/sitemap.xml — a domain that does not exist —
 * while every page on the site correctly said verdegardenae.com.
 *
 * Nothing reported it. The sitemap looked right, because a sitemap revalidates
 * and is re-rendered at runtime where the variable IS set. Only robots.txt is
 * frozen, and only robots.txt matters before a crawl.
 *
 * The Dockerfile now passes the variable through as well, so the prerendered
 * pages are right from their first serve. This line is the belt to that
 * braces: a file this small, read this rarely, costs nothing to build per
 * request, and cannot be stale.
 */
export const dynamic = 'force-dynamic';

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
