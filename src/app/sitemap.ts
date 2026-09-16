import type { MetadataRoute } from 'next';
import { getAllProducts, getFamilies } from '@/lib/products';
import { locations } from '@/lib/locations';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://verdegarden.example';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ['', '/catalog', '/collections', '/services', '/about', '/quote'];

  return [
    ...staticPages.map((p) => ({
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : 0.8,
    })),
    ...getFamilies().map((f) => ({
      url: `${base}/collections/${f.slug}`,
      lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
    })),
    ...locations.map((l) => ({
      url: `${base}/locations/${l.slug}`,
      lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6,
    })),
    ...getAllProducts().map((p) => ({
      url: `${base}/catalog/${p.slug}`,
      lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6,
    })),
  ];
}
