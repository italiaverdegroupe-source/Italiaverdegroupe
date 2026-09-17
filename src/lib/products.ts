import raw from '@/data/products.json';

export type Product = {
  reference: string;
  name: string;
  slug: string;
  family: string;
  attributes: Record<string, string>;
  description: string;
  availability: string;
  price: string;
  image: string;
  imageSize: string;
  /** false when the catalogue photo contradicts the specimen's own description */
  photoVerified: boolean;
};

export type Family = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
  cover: string;
};

const products = raw as unknown as Product[];

export const FAMILY_BLURB: Record<string, string> = {
  'Olive Trees':
    'Centuries of Mediterranean character — from sculptural ancient specimens to clean standard forms.',
  Palms:
    'Architectural palms selected for structure, silhouette and Gulf-climate resilience.',
  Agaves:
    'Bold rosettes and variegated foliage that hold their form through the UAE summer.',
  'Cacti & Succulents':
    'Sculptural, low-water specimens for desert and contemporary garden schemes.',
  'Ornamental Trees':
    'Shade, canopy and evergreen presence for courtyards, avenues and entrances.',
  'Indoor Plants':
    'Interior specimens for lobbies, atriums and shaded terraces.',
};

export const familySlug = (name: string) =>
  name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function getAllProducts(): Product[] {
  return products;
}

/** Stock safe to lead with — excludes specimens whose photo is still in doubt. */
export function getShowcaseProducts(): Product[] {
  return products.filter((p) => p.photoVerified);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * Resolve a hero/band image from its catalogue reference rather than typing the
 * filename out. A wrong reference now fails the build instead of shipping a
 * broken <img> nobody notices until it is live.
 */
export function imageFor(reference: string): string {
  const p = products.find((x) => x.reference === reference);
  if (!p) throw new Error(`imageFor: no product with reference "${reference}"`);
  return `/products/${p.image}`;
}

export function getFamilies(): Family[] {
  const seen = new Map<string, Product[]>();
  for (const p of products) {
    const list = seen.get(p.family) ?? [];
    list.push(p);
    seen.set(p.family, list);
  }
  return [...seen.entries()].map(([name, list]) => ({
    slug: familySlug(name),
    name,
    blurb: FAMILY_BLURB[name] ?? '',
    count: list.length,
    cover: (list.find((p) => p.photoVerified) ?? list[0]).image,
  }));
}

export function getByFamilySlug(slug: string): Product[] {
  return products.filter((p) => familySlug(p.family) === slug);
}

/** Parse "2.5 - 3.0 m" into a sortable midpoint in metres. */
export function heightMidpoint(p: Product): number {
  const m = (p.attributes.Height ?? '').match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (m) return (parseFloat(m[1]) + parseFloat(m[2])) / 2;
  const one = (p.attributes.Height ?? '').match(/([\d.]+)/);
  return one ? parseFloat(one[1]) : 0;
}

export const SIZE_BANDS = [
  { slug: 'small', name: 'Small', hint: 'up to 1.5 m', test: (h: number) => h <= 1.5 },
  { slug: 'medium', name: 'Medium', hint: '1.5 – 2.5 m', test: (h: number) => h > 1.5 && h <= 2.5 },
  { slug: 'large', name: 'Large', hint: '2.5 – 4 m', test: (h: number) => h > 2.5 && h <= 4 },
  { slug: 'specimen', name: 'Specimen', hint: 'over 4 m', test: (h: number) => h > 4 },
];

export function sizeBand(p: Product): string {
  const h = heightMidpoint(p);
  return SIZE_BANDS.find((b) => b.test(h))?.slug ?? 'medium';
}

/**
 * Catalogue search.
 *
 * Deliberately not a fuzzy matcher. A buyer arriving at this box is typing one
 * of three things — a reference off a quotation, a botanical name they were
 * given by a landscape architect, or a common word like "olive" — and all
 * three are exact-ish. Fuzzy matching would return a Ficus for "Phoenix" and
 * cost more trust than the occasional near-miss it rescues.
 *
 * Every term must match somewhere, so "olive 4m" narrows rather than widens,
 * which is how a filter is expected to behave.
 */
export function searchProducts(list: Product[], q: string): Product[] {
  const terms = q.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean);
  if (terms.length === 0) return list;

  const haystack = (p: Product) => [
    p.reference, p.name, p.family, p.description,
    ...Object.entries(p.attributes).flatMap(([k, v]) => [k, v]),
  ].join(' ').toLowerCase();

  return list.filter((p) => {
    const hay = haystack(p);
    return terms.every((t) => hay.includes(t));
  });
}

/**
 * Ranks a matched set so the obvious answer is first.
 *
 * Someone typing "VG-OL-012" wants that specimen at the top, not alphabetically
 * among the other olives; someone typing "olive" wants the olives before a
 * palm whose description happens to mention one.
 */
export function rankBySearch(list: Product[], q: string): Product[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;
  const score = (p: Product) => {
    const ref = p.reference.toLowerCase();
    const name = p.name.toLowerCase();
    const fam = p.family.toLowerCase();
    let s = 0;
    for (const t of terms) {
      if (ref === t) s += 100;
      else if (ref.includes(t)) s += 40;
      if (name.startsWith(t)) s += 30;
      else if (name.includes(t)) s += 18;
      if (fam.includes(t)) s += 8;
    }
    return s;
  };
  return [...list].sort((a, b) => score(b) - score(a) || a.reference.localeCompare(b.reference));
}
