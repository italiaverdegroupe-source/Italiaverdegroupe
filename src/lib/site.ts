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

  // Contact — placeholders until the UAE trade licence is issued.
  phone: '',
  whatsapp: '+393517478254',
  whatsappLabel: '+39 351 747 8254',
  email: 'info@verdegarden.example',

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
