/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Lets src/app/global-not-found.tsx own the whole document for a URL that
  // matches no route group. Without it, a root not-found.tsx is wrapped in a
  // bare <html><body> that it cannot reach, so the served page ends up with
  // two of each and no lang attribute on the one the browser keeps.
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    // Next only serves the quality levels named here, so asking for 88 without
    // listing it returns a 400 rather than a sharper picture. 75 stays for
    // everything else; the hero is the one image on the site that fills the
    // window, and it is the one that shows the difference.
    qualities: [75, 88],
  },
  async redirects() {
    return [
      {
        // /locations/al-ain was a page here, and it was in the sitemap. Al Ain
        // is a city in the emirate of Abu Dhabi, so the page is gone — but a
        // URL that has been published does not get to 404 because we changed
        // our minds about it. It goes where its content went.
        source: '/locations/al-ain',
        destination: '/locations/abu-dhabi',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },

        // A year, and subdomains with it. The certificate is issued and valid
        // and there is nothing on this domain that is meant to be reachable
        // over plain HTTP, so a browser that has been here once should refuse
        // to try. Not `preload`: that is a submission to a list shipped inside
        // browsers and is genuinely hard to undo, and it is not mine to
        // commit this company to.
        { key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains' },

        // What this page is allowed to load.
        //
        // 'unsafe-inline' is in script-src and it is not an oversight. Next
        // bootstraps the router with inline scripts, and the alternative — a
        // per-request nonce from the proxy — makes every page dynamic, which
        // would throw away the prerendering that 200-odd catalogue pages
        // depend on. Trading a real performance guarantee for a partial
        // mitigation is the wrong way round here.
        //
        // What it does buy is the rest, and the rest is worth having: nothing
        // may be loaded from another origin, no <base> can be injected to
        // redirect every relative link, no plugin can be embedded, and — the
        // one that matters most on a site whose whole purpose is a form —
        // form-action 'self' means a posted enquiry cannot be redirected to
        // somebody else's server. There are no third-party scripts, no
        // analytics, no embedded fonts and no iframes on this site, so 'self'
        // is not a compromise anywhere but that one line.
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'self'",
            "form-action 'self'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "style-src 'self' 'unsafe-inline'",
            "script-src 'self' 'unsafe-inline'",
            "connect-src 'self'",
          ].join('; '),
        },
      ],
    }];
  },
};
export default nextConfig;
