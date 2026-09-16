/**
 * Location pages only earn their place if each one says something true and
 * specific. Thin duplicated pages are treated as doorway spam by search
 * engines and, worse, read as filler to a procurement manager.
 */
export type Location = {
  slug: string;
  name: string;
  intro: string;
  notes: string[];
};

export const locations: Location[] = [
  {
    slug: 'dubai',
    name: 'Dubai',
    intro:
      'The densest concentration of villa communities, hotels and landscape contractors in the country, and where most specimen-tree work in the UAE is specified.',
    notes: [
      'Villa communities and gated developments frequently restrict heavy-vehicle access to set hours, so deliveries are scheduled to the community rules rather than ours.',
      'Narrow villa gates and overhead services are the usual constraint on large root balls — we confirm access before a delivery date is fixed.',
      'Crane or hiab offloading is priced into the quotation where the specimen or the site requires it.',
    ],
  },
  {
    slug: 'abu-dhabi',
    name: 'Abu Dhabi',
    intro:
      'Larger master-planned and institutional landscape schemes, where species approval and consistent supply across phases matter more than a single tree.',
    notes: [
      'Phased developments usually need the same species and grade across several consignments — we hold specification against the original selection.',
      'Longer road haul from northern storage is factored into delivery pricing and timing.',
    ],
  },
  {
    slug: 'sharjah',
    name: 'Sharjah',
    intro:
      'Established nursery and horticulture belt, with strong demand from private villas and municipal planting alongside the trade.',
    notes: [
      'Convenient for consolidated deliveries combined with Dubai or Ajman drops on the same route.',
      'Reseller and garden-centre supply is quoted on trade terms.',
    ],
  },
  {
    slug: 'ajman',
    name: 'Ajman',
    intro:
      'Compact and well connected to the northern emirates, typically villa and small-development work.',
    notes: ['Usually served on the same route as Sharjah and Umm Al Quwain.'],
  },
  {
    slug: 'ras-al-khaimah',
    name: 'Ras Al Khaimah',
    intro:
      'Fast-growing resort and residential development, with increasing demand for mature landscape planting on hospitality projects.',
    notes: ['Resort schemes often require instant-impact specimens rather than young stock.'],
  },
  {
    slug: 'fujairah',
    name: 'Fujairah',
    intro:
      'East-coast projects with a different microclimate to the Gulf side — humidity and rainfall differ, which affects species selection.',
    notes: ['Species are recommended against the east-coast conditions, not copied from a Dubai schedule.'],
  },
  {
    slug: 'umm-al-quwain',
    name: 'Umm Al Quwain',
    intro:
      'Smaller market served on the northern delivery route, with villa and farm planting the common requirement.',
    notes: ['Combined deliveries keep transport cost proportionate on smaller orders.'],
  },
  {
    slug: 'al-ain',
    name: 'Al Ain',
    intro:
      'Inland oasis city with a long horticultural tradition and hotter, drier summers than the coast.',
    notes: [
      'Inland summer extremes narrow the safe planting window further than on the coast — timing is part of the advice, not an afterthought.',
    ],
  },
];

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);
