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

/**
 * Paths this never touches.
 *
 * The console, the API, and anything with a file extension — robots.txt,
 * sitemap.xml, icon.svg, a photograph. The extension rule is the one that
 * matters: the locale rewrite below would otherwise turn /robots.txt into
 * /en/robots.txt, which is not a route, so the file that tells crawlers what
 * to do would 404 and nobody would notice until the site stopped being
 * crawled.
 */
function isExempt(pathname: string): boolean {
  return pathname.startsWith('/admin')
    || pathname.startsWith('/api')
    || pathname.startsWith('/_next')
    || /\.[a-z0-9]+$/i.test(pathname);
}

/** Already carries a locale that has its own prefix. */
const PREFIXED = /^\/(ar|it)(\/|$)/;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isExempt(pathname)) return NextResponse.next();

  // ── English has no prefix ───────────────────────────────────
  // /en/catalog and /catalog would otherwise be two URLs serving one page,
  // which is the duplicate-content problem this file was written for, aimed
  // at ourselves. The short one is canonical because it is the one already
  // published; the long one permanently redirects to it.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  const canonical = canonicalHost();

  // The console is never indexed at any host, and never redirected — moving a
  // signed-in operator between hostnames would drop the session cookie. (It
  // is already exempt above; this is the host logic's own reading of it.)
  const seen = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '')
    .split(',')[0].trim().toLowerCase();
  const wrongHost = Boolean(canonical) && Boolean(seen)
    && seen !== canonical && !PASS_THROUGH.has(seen);

  if (wrongHost && process.env.CANONICAL_REDIRECT === '1'
      && redirectFrom(canonical!).some((re) => re.test(seen))) {
    const url = req.nextUrl.clone();
    url.host = canonical!;
    url.port = '';
    url.protocol = 'https:';
    // 308, not 302: permanent, and it keeps the method, so a POST to the wrong
    // host is not silently turned into a GET.
    return NextResponse.redirect(url, 308);
  }

  // ── the locale rewrite ──────────────────────────────────────
  // A REWRITE, not a redirect. The address bar keeps saying /catalog while the
  // router resolves /en/catalog, so every URL this site has ever published
  // still answers at the address it was published at — no extra hop, no
  // re-indexing, no dead links in anybody's email.
  //
  // The locale also goes onto the REQUEST as a header. Almost every page reads
  // it from `params`, which is the right way — but not-found.tsx is handed no
  // params by the router, and `next/root-params` needs `[lang]` above every
  // root layout, which the console's own layout rules out. Without this the
  // 404 page is the one page on an Arabic site that is always in English,
  // which is exactly the page where a lost reader most needs their own
  // language. The header is set by us on every request and cannot be spoofed
  // into anything but one of three values, because localeFromHeaders checks.
  const locale = PREFIXED.test(pathname) ? pathname.slice(1, 3) : 'en';
  const headers = new Headers(req.headers);
  headers.set('x-locale', locale);

  // Cloned, not rebuilt. `new URL('/en' + pathname, req.url)` looks equivalent
  // and silently DROPS THE QUERY STRING, because a URL built from a path
  // replaces everything after the host. English is the branch that gets
  // rewritten, so English — and only English — lost every query parameter it
  // was ever sent: /catalog?q=olive came back as all 68 specimens, the bulk
  // and sourcing buttons landed on the ordinary enquiry form, and every
  // ?_rsc= prefetch the router makes answered with HTML instead of a payload,
  // which is an InvariantError per link on every page. Arabic and Italian
  // were fine, which is exactly why nobody noticed.
  const target = req.nextUrl.clone();
  target.pathname = `/en${pathname === '/' ? '' : pathname}`;

  const res = PREFIXED.test(pathname)
    ? NextResponse.next({ request: { headers } })
    : NextResponse.rewrite(target, { request: { headers } });

  if (wrongHost) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  // Everything except Next's own assets and the files that are not pages.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|products/).*)'],
};
