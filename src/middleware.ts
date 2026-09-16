import { NextResponse, type NextRequest } from 'next/server';

/**
 * One canonical host.
 *
 * The site is reachable at its own domain and also at the Railway address it
 * was deployed to. Two hosts serving identical pages is duplicate content: a
 * search engine picks one itself, splits the ranking signals between them, and
 * may well index the temporary one — which then has to be un-indexed later,
 * long after links have been shared.
 *
 * This runs in two stages on purpose, because getting it wrong takes the site
 * down rather than degrading it:
 *
 *   1. NOW — any host that is not the canonical one still serves the site, but
 *      carries X-Robots-Tag: noindex. Nothing breaks, and nothing gets indexed
 *      at the wrong address.
 *   2. ONCE DNS RESOLVES AND THE CERTIFICATE IS ISSUED — set
 *      CANONICAL_REDIRECT=1 and those hosts 301 to the canonical one instead.
 *
 * Redirecting before the domain actually answers would send every visitor to a
 * hostname that does not resolve, so the redirect is a deliberate second step
 * rather than something switched on with the domain.
 */

function canonicalHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Hosts that must be answered as themselves, never redirected.
 *
 * Railway runs its deploy healthcheck from healthcheck.railway.app and treats
 * anything that is not a 2xx as a failure. Redirecting it would have failed
 * every future deployment after the canonical redirect was switched on —
 * found in the platform's own documentation before flipping the switch rather
 * than afterwards, which is the only cheap time to find it.
 */
const PASS_THROUGH = new Set(['healthcheck.railway.app']);

export function middleware(req: NextRequest) {
  const canonical = canonicalHost();

  // The console is never indexed at any host, and never redirected — moving a
  // signed-in operator between hostnames would drop the session cookie.
  const isConsole = req.nextUrl.pathname.startsWith('/admin')
    || req.nextUrl.pathname.startsWith('/api/admin');

  if (!canonical || isConsole) return NextResponse.next();

  // x-forwarded-host is what the platform's proxy sets; host is the fallback.
  const seen = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '')
    .split(',')[0].trim().toLowerCase();
  if (!seen || seen === canonical || PASS_THROUGH.has(seen)) return NextResponse.next();

  if (process.env.CANONICAL_REDIRECT === '1') {
    const url = req.nextUrl.clone();
    url.host = canonical;
    url.port = '';
    url.protocol = 'https:';
    // 308, not 302: permanent, and it keeps the method, so a POST to the wrong
    // host is not silently turned into a GET.
    return NextResponse.redirect(url, 308);
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  // Everything except Next's own assets and the files that are not pages.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|products/).*)'],
};
