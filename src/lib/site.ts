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

  // Commerce. VAT stays OFF until a TRN is issued — charging VAT without
  // registration is an offence, so quotes must not show a VAT line yet.
  currency: 'AED',
  vatEnabled: false,
  vatRate: 0,
  trn: '',
  licenceNumber: '',
  quoteValidityDays: 30,

  sourcingRegions: ['Toscana', 'Sicilia', 'Lombardia', 'Puglia'],

  emirates: [
    { slug: 'dubai', name: 'Dubai' },
    { slug: 'abu-dhabi', name: 'Abu Dhabi' },
    { slug: 'sharjah', name: 'Sharjah' },
    { slug: 'ajman', name: 'Ajman' },
    { slug: 'ras-al-khaimah', name: 'Ras Al Khaimah' },
    { slug: 'fujairah', name: 'Fujairah' },
    { slug: 'umm-al-quwain', name: 'Umm Al Quwain' },
    { slug: 'al-ain', name: 'Al Ain' },
  ],

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
