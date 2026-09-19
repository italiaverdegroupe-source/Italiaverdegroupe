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

  // Contact.
  //
  // These are REAL and answered, which is the only reason they are here: the
  // rule everywhere on this site is that a channel is advertised when somebody
  // picks it up and not before. The telephone line is still empty for exactly
  // that reason.
  //
  // WhatsApp is an Italian number because the owner is Italian and answers it
  // himself. That is a fact about this company rather than an oversight, and
  // nothing on the site claims it is a UAE line.
  //
  // They live here as compiled defaults rather than only in the settings table
  // so the footer still has a way to reach the company when the database is
  // unreachable — a contact detail is the last thing that should disappear in
  // an outage. The console overrides them the moment anybody edits them.
  phone: '',
  whatsapp: '393517478254',
  whatsappLabel: '+39 351 747 8254',
  email: 'italiaverdegroupe@gmail.com',

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

  /**
   * Who this company is in time and place, for the markup a search engine
   * reads. All four are EMPTY on purpose and are emitted only when set.
   *
   * The site's own story is that the trading company is new in the Emirates
   * while the Italian side of it is not — and there is no way for code to
   * know a founding year. A guess would become a fact Google repeats, and a
   * wrong founding date on a company is worse than none, so nothing here is
   * invented: an empty field is simply left out of the JSON-LD.
   *
   * foundedIn        the UAE company's own founding date — '2025' or '2025-04-01'
   * foundedAt        where it was founded — 'Dubai, United Arab Emirates'
   * italianName      the Italian company behind it, if there is one
   * italianUrl       and its website
   * italianSince     the year the Italian side has been growing or trading —
   *                  the half of this business that is NOT new
   */
  foundedIn: '',
  foundedAt: '',
  italianName: '',
  italianUrl: '',
  italianSince: '',

  /**
   * Where a customer sends the money.
   *
   * Empty for the same reason the trade licence is empty: the account is not
   * open, and a wrong IBAN on a document that has already been emailed is
   * worse than an invoice that says nothing and gets a phone call. The place
   * on the invoice is reserved and wired — type these into Settings and the
   * next invoice carries them.
   */
  /**
   * The name the sign-in screen greets.
   *
   * A console with two people in it is not a product with a user base — it is
   * a company, and the person who opens it every morning owns it. Greeting him
   * by name costs nothing and is the difference between a form and a front
   * door. Empty means the screen simply says "welcome back", which is what it
   * should say before anybody has decided whose console this is.
   */
  consoleWelcome: '',

  bankAccountName: '',
  bankName: '',
  bankIban: '',
  bankSwift: '',
  paymentNote: '',

  sourcingRegions: ['Toscana', 'Sicilia', 'Lombardia', 'Puglia'],

  /**
   * The seven emirates of the United Arab Emirates. This list is the country,
   * not a delivery schedule: it held eight for a while because Al Ain was in
   * it, and Al Ain is a city in the emirate of Abu Dhabi. Two public pages
   * counted the array and printed "all eight emirates".
   *
   * Nothing goes in here that is not an emirate. Somewhere we deliver that is
   * a city belongs in the copy about that place, not in this array.
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
