/**
 * Single source of truth for everything an administrator may change.
 * Nothing here is hardcoded into components — when the CMS lands in Phase 2
 * these values are read from the `settings` table instead, same shape.
 */
export const site = {
  legalName: 'Verde Garden Trading',
  brandName: 'Verde Garden',
  tagline: 'Italian Trees & Plants, Imported for the UAE',
  description:
    'We import premium trees and plants from Italian nurseries and supply landscaping companies, developers, hotels and private estates across the United Arab Emirates.',

  // Contact — deliberately empty. The UAE number and the mailbox both land
  // with the domain, and until then no page should advertise a channel that
  // nobody is answering. `fallbackContact()` below degrades safely.
  phone: '',
  whatsapp: '',
  whatsappLabel: '',
  email: '',

  // The registered office, for the legal pages. Empty until there is one to
  // state: an invented address on a privacy policy is the one lie that makes
  // every other sentence on the page worthless.
  address: '',
  city: 'Dubai',
  country: 'United Arab Emirates',

  // Commerce. VAT stays OFF until a TRN is issued — charging VAT without
  // registration is an offence, so quotes must not show a VAT line yet.
  currency: 'AED',
  vatEnabled: false,
  vatRate: 0,
  trn: '',
  licenceNumber: '',
  quoteValidityDays: 30,

  sourcingRegions: ['Toscana', 'Sicilia', 'Lombardia', 'Puglia'],

  /**
   * The seven. There are seven emirates in the United Arab Emirates, and this
   * list used to hold eight because Al Ain was in it — Al Ain is a city in the
   * emirate of Abu Dhabi, not an eighth emirate. Two public pages counted this
   * array and printed "all eight emirates", which is the kind of mistake a UAE
   * reader notices in the first second and does not need to read twice.
   */
  emirates: [
    { slug: 'dubai', name: 'Dubai' },
    { slug: 'abu-dhabi', name: 'Abu Dhabi' },
    { slug: 'sharjah', name: 'Sharjah' },
    { slug: 'ajman', name: 'Ajman' },
    { slug: 'ras-al-khaimah', name: 'Ras Al Khaimah' },
    { slug: 'fujairah', name: 'Fujairah' },
    { slug: 'umm-al-quwain', name: 'Umm Al Quwain' },
  ],

  /**
   * Places we deliver to that are not emirates. Al Ain has its own landscape
   * market and its own page, and a buyer there searches for it by name — so it
   * stays a destination without being promoted to an emirate.
   */
  otherLocations: [
    { slug: 'al-ain', name: 'Al Ain' },
  ],

  /**
   * Where the company is on the internet. Empty until an account exists — a
   * footer icon linking to a page nobody has posted on says more about the
   * company than no icon does.
   */
  instagram: '',
  linkedin: '',
  facebook: '',
  youtube: '',
  tiktok: '',

  projectTypes: [
    'Villa / Private Estate',
    'Hotel / Resort',
    'Residential Development',
    'Commercial / Retail',
    'Public Realm / Municipality',
    'Nursery / Garden Centre / Reseller',
  ],

  serviceScopes: [
    'Supply only',
    'Supply + delivery',
    'Supply + delivery + planting',
  ],

  leadTimeWeeks: { min: 4, max: 8 },
} as const;

export type Site = typeof site;

/**
 * Everywhere we deliver: the seven emirates and the cities named separately.
 * Used for the enquiry form's list and the location pages — anything that is
 * about reaching somewhere rather than about how many emirates there are.
 */
export function deliveryLocations(s: {
  emirates: readonly { slug: string; name: string }[];
  otherLocations: readonly { slug: string; name: string }[];
}): { slug: string; name: string }[] {
  return [...s.emirates, ...s.otherLocations];
}

/**
 * What to tell someone when the enquiry form itself fails. Never names a
 * channel that has not been configured yet — a dead number in an error
 * message loses the lead twice over.
 */
export function fallbackContact(): string {
  if (site.whatsappLabel) return `Please message us on WhatsApp ${site.whatsappLabel}.`;
  if (site.email) return `Please email ${site.email}.`;
  return 'Please try again in a moment.';
}

/**
 * The card that appears when someone pastes a link into WhatsApp, LinkedIn or
 * X — which, for a UAE trade supplier, is how most links actually travel.
 *
 * Named here rather than dropped in as app/opengraph-image.jpg because Next
 * merges openGraph shallowly: any page that sets a title of its own replaces
 * the whole object, image included, and the convention file then reaches only
 * the pages that never set one. Every page states it instead.
 */
export const ogImage = {
  url: '/brand/og-cover.jpg',
  width: 1200,
  height: 630,
  alt: 'An ancient Italian olive tree on a Dubai terrace at sunrise, with the city skyline behind it.',
} as const;
