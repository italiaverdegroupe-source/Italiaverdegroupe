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
];

/**
 * The seven emirates in Arabic and Italian.
 *
 * These pages were the last English left on the site. The layout, the
 * navigation and the footer all translated around them, so /ar/locations/dubai
 * rendered an Arabic shell with an English page inside it — and the headline
 * read "توريد الأشجار في Dubai", Arabic prose with a Latin place name dropped
 * into the middle of it, which is the single most obvious tell that a
 * translation was never finished.
 *
 * The emirate names matter more than the prose. "دبي" and "أبوظبي" are how
 * these places are written; transliterating back from English, or leaving the
 * Latin spelling in an Arabic sentence, is what a UAE reader notices first.
 */
type LocalisedLocation = { name: string; intro: string; notes: string[] };

export const locationTranslations: Record<string, Record<string, LocalisedLocation>> = {
  ar: {
    'dubai': {
      name: 'دبي',
      intro: 'أكثف تجمّع لمجمّعات الفلل والفنادق ومقاولي تنسيق الحدائق في الدولة، وحيث يُطلب معظم العمل على الأشجار المميّزة في الإمارات.',
      notes: [
        'كثير من مجمّعات الفلل والمجمّعات المسوّرة تحصر دخول المركبات الثقيلة في ساعات محدّدة، فتُجدول عمليات التسليم وفق قواعد المجمّع لا وفق قواعدنا.',
        'بوّابات الفلل الضيّقة والخدمات العلوية هي العائق المعتاد أمام الكتل الجذرية الكبيرة — نتأكّد من إمكانية الوصول قبل تحديد موعد التسليم.',
        'يُدرَج التفريغ بالونش أو بالرافعة الهيدروليكية في عرض السعر حين تتطلّبه الشجرة أو الموقع.',
      ],
    },
    'abu-dhabi': {
      name: 'أبوظبي',
      intro: 'مشاريع تنسيق حدائق أكبر ضمن مخطّطات رئيسية ومؤسسية، حيث اعتماد الأصناف واتّساق التوريد عبر المراحل أهمّ من شجرة واحدة.',
      notes: [
        'المشاريع المرحلية تحتاج عادةً الصنف والدرجة نفسها عبر عدّة شحنات — نحفظ المواصفة مقابل الاختيار الأصلي.',
        'المسافة البرّية الأطول من المخازن الشمالية محسوبة في تسعير التسليم وتوقيته.',
      ],
    },
    'sharjah': {
      name: 'الشارقة',
      intro: 'حزام راسخ للمشاتل والبستنة، مع طلب قوي من الفلل الخاصة ومن التشجير البلدي إلى جانب التجارة.',
      notes: [
        'مناسبة للتسليمات المجمّعة مع نقاط تسليم في دبي أو عجمان على المسار نفسه.',
        'التوريد لتجّار التجزئة ومراكز الحدائق يُسعَّر بشروط تجارية.',
      ],
    },
    'ajman': {
      name: 'عجمان',
      intro: 'إمارة مدمجة وجيّدة الاتصال بالإمارات الشمالية، والعمل فيها غالباً فلل ومشاريع صغيرة.',
      notes: ['تُخدَم عادةً على المسار نفسه مع الشارقة وأم القيوين.'],
    },
    'ras-al-khaimah': {
      name: 'رأس الخيمة',
      intro: 'تطوير سياحي وسكني سريع النمو، مع طلب متزايد على التشجير الناضج في مشاريع الضيافة.',
      notes: ['مشاريع المنتجعات تطلب غالباً أشجاراً ذات أثر فوري لا شتلات صغيرة.'],
    },
    'fujairah': {
      name: 'الفجيرة',
      intro: 'مشاريع الساحل الشرقي بمناخ محلي مختلف عن جهة الخليج — الرطوبة والأمطار تختلفان، وهذا يؤثّر في اختيار الأصناف.',
      notes: ['تُوصى الأصناف وفق ظروف الساحل الشرقي، لا تُنسخ من جدول أُعدّ لدبي.'],
    },
    'umm-al-quwain': {
      name: 'أم القيوين',
      intro: 'سوق أصغر تُخدَم على مسار التسليم الشمالي، والمطلوب فيها عادةً تشجير الفلل والمزارع.',
      notes: ['التسليمات المجمّعة تبقي كلفة النقل متناسبة مع الطلبات الصغيرة.'],
    },
  },
  it: {
    'dubai': {
      name: 'Dubai',
      intro: 'La concentrazione più fitta di comunità di ville, alberghi e imprese di paesaggistica del Paese, e il luogo dove viene specificata la maggior parte del lavoro su alberi esemplari negli Emirati.',
      notes: [
        'Le comunità di ville e i complessi recintati limitano spesso l\'accesso dei mezzi pesanti a fasce orarie precise: le consegne si programmano sulle regole del complesso, non sulle nostre.',
        'Cancelli stretti e linee aeree sono il vincolo abituale per zolle di grandi dimensioni — verifichiamo l\'accesso prima di fissare la data di consegna.',
        'Lo scarico con gru o autogru è compreso nel preventivo quando l\'esemplare o il cantiere lo richiedono.',
      ],
    },
    'abu-dhabi': {
      name: 'Abu Dhabi',
      intro: 'Interventi paesaggistici più ampi, di piano regolatore e istituzionali, dove l\'approvazione delle specie e la continuità della fornitura fra le fasi contano più del singolo albero.',
      notes: [
        'Gli sviluppi per fasi richiedono di norma la stessa specie e la stessa categoria su più spedizioni — teniamo la specifica fedele alla selezione iniziale.',
        'Il trasporto su strada più lungo dai depositi del nord è considerato nel prezzo e nei tempi di consegna.',
      ],
    },
    'sharjah': {
      name: 'Sharjah',
      intro: 'Zona vivaistica e orticola consolidata, con forte domanda da ville private e dal verde comunale oltre che dal settore.',
      notes: [
        'Comoda per consegne consolidate abbinate a scarichi a Dubai o Ajman sullo stesso percorso.',
        'La fornitura a rivenditori e garden center è quotata a condizioni di settore.',
      ],
    },
    'ajman': {
      name: 'Ajman',
      intro: 'Compatta e ben collegata agli emirati del nord, di norma lavori su ville e piccoli sviluppi.',
      notes: ['Servita abitualmente sullo stesso percorso di Sharjah e Umm Al Quwain.'],
    },
    'ras-al-khaimah': {
      name: 'Ras Al Khaimah',
      intro: 'Sviluppo turistico e residenziale in rapida crescita, con domanda crescente di piante adulte per progetti dell\'ospitalità.',
      notes: ['I progetti dei resort richiedono spesso esemplari d\'effetto immediato anziché piante giovani.'],
    },
    'fujairah': {
      name: 'Fujairah',
      intro: 'Progetti sulla costa orientale, con un microclima diverso dal versante del Golfo — umidità e piovosità cambiano, e questo incide sulla scelta delle specie.',
      notes: ['Le specie si consigliano sulle condizioni della costa orientale, non si copiano da un elenco pensato per Dubai.'],
    },
    'umm-al-quwain': {
      name: 'Umm Al Quwain',
      intro: 'Mercato più piccolo servito sul percorso di consegna settentrionale, dove la richiesta abituale riguarda ville e aziende agricole.',
      notes: ['Le consegne raggruppate mantengono il costo del trasporto proporzionato sugli ordini più piccoli.'],
    },
  },
};

/** The emirate as the reader's language writes it, falling back to English. */
export function localisedLocation(l: Location, locale: string): LocalisedLocation {
  const t = locationTranslations[locale]?.[l.slug];
  return t ?? { name: l.name, intro: l.intro, notes: l.notes };
}

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);
