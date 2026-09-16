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
