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
      ],
    }];
  },
};
export default nextConfig;
