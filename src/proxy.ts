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
 *   2. LATER — set CANONICAL_REDIRECT=1 and the known alternates 308 to the
 *      canonical host instead.
 *
 * (This file was `middleware.ts`. Next 16 deprecated that convention and
 * renamed it to `proxy`; the file and the exported function are renamed, the
 * matcher below is unchanged. Both files must never exist at once — that is a
 * build error, not a warning.)
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

/**
 * The hosts stage two redirects AWAY FROM. An allowlist, deliberately, rather
 * than "everything that is not the canonical host".
 *
 * The difference is what happens when this code is wrong about what the
 * browser actually asked for. There are two proxies in front of this app now —
 * Cloudflare, then Railway — and the header it reads is whatever the last one
 * decided to send. If that ever disagrees with the address bar, or if
 * NEXT_PUBLIC_SITE_URL is set to something slightly off, the old rule sent a
 * 308 to a host that resolves straight back here, which sends another 308, and
 * the browser gives up after about twenty hops. Every page, every visitor,
 * total outage — from a variable, with no deploy.
 *
 * An allowlist cannot fail that way. An unrecognised host is served as it is,
 * with noindex, exactly as stage one does; only an address we know to be this
 * same deployment is ever bounced. That is the whole of the duplicate-content
 * problem this was written for, because the temporary address IS that address.
 */
function redirectFrom(canonical: string): RegExp[] {
  const bare = canonical.replace(/^www\./, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    // The deployment's own temporary address, which is the whole of the
    // duplicate-content problem this was written for.
    /(^|\.)up\.railway\.app$/,
    // and www, which a visitor types without thinking. Left off the list it
    // would serve the entire site at 200 on a second name for ever, marked
    // noindex, with nothing ever canonicalising a link shared from there.
    new RegExp(`^www\\.${bare}$`),
  ];
}

export function proxy(req: NextRequest) {
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

  if (process.env.CANONICAL_REDIRECT === '1'
      && redirectFrom(canonical).some((re) => re.test(seen))) {
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
