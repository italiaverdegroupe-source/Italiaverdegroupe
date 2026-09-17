import type { Locale } from '@/lib/i18n';

/**
 * The catalogue, in the reader's language.
 *
 * This was the last thing on the public site still English in all three: the
 * chrome, the pages and the legal documents were translated while sixty-eight
 * specimen names and their descriptions were not — so /ar/catalog was an
 * Arabic page with an English catalogue down the middle of it, which reads
 * worse than an English page does.
 *
 * WHAT IS NOT TRANSLATED, and must never be. A botanical name is the same in
 * every language — that is the entire purpose of binomial nomenclature, and a
 * plant schedule that says something other than *Cycas revoluta* is a plant
 * schedule somebody will order the wrong tree from. So where the English name
 * IS the botanical name it is carried through unchanged, and only the
 * descriptive qualifier beside it is translated: "Agave Americana Large"
 * becomes "Agave Americana grande", never "Agave americana" rendered into
 * Arabic script. Where the English name is a common name — "Olive Tree
 * Premium", "Barrel Cactus" — it is a description and is translated in full.
 *
 * WHY IN CODE and not in product_translations. The table exists and is the
 * right home for the day the console grows a screen for it. It is not the
 * right home today: reading it would put a database query behind sixty-eight
 * pages that are prerendered, turning the whole catalogue dynamic to fetch
 * text that changes about once a year. The compiled copy keeps them static,
 * and `Record<Locale, …>` means a language cannot be half-finished without
 * the build saying so.
 */

/** The six collections, as they appear in navigation, breadcrumbs and headings. */
export const FAMILY: Record<Locale, Record<string, string>> = {
  en: {
    'Agaves': 'Agaves',
    'Cacti & Succulents': 'Cacti & Succulents',
    'Indoor Plants': 'Indoor Plants',
    'Olive Trees': 'Olive Trees',
    'Ornamental Trees': 'Ornamental Trees',
    'Palms': 'Palms',
  },
  ar: {
    'Agaves': 'الأغاف',
    'Cacti & Succulents': 'الصبّار والعصاريات',
    'Indoor Plants': 'النباتات الداخلية',
    'Olive Trees': 'أشجار الزيتون',
    'Ornamental Trees': 'أشجار الزينة',
    'Palms': 'النخيل',
  },
  it: {
    'Agaves': 'Agavi',
    'Cacti & Succulents': 'Cactus e piante grasse',
    'Indoor Plants': 'Piante da interno',
    'Olive Trees': 'Olivi',
    'Ornamental Trees': 'Alberi ornamentali',
    'Palms': 'Palme',
  },
};

/** The labels down the left of a specimen's specification table. */
export const ATTRIBUTE: Record<Locale, Record<string, string>> = {
  en: {
    Origin: 'Origin', Height: 'Height', Spread: 'Spread',
    Category: 'Category', 'Pot Size': 'Pot size', Diameter: 'Diameter',
  },
  ar: {
    Origin: 'المنشأ', Height: 'الارتفاع', Spread: 'الامتداد',
    Category: 'الفئة', 'Pot Size': 'حجم الأصيص', Diameter: 'القطر',
  },
  it: {
    Origin: 'Origine', Height: 'Altezza', Spread: 'Ampiezza',
    Category: 'Categoria', 'Pot Size': 'Dimensione del vaso', Diameter: 'Diametro',
  },
};

/**
 * Attribute VALUES that are words rather than measurements.
 *
 * A measurement is left exactly as it is: "1.0 - 1.5 m" means the same in
 * every language, and re-typing numbers per locale is how a catalogue ends up
 * quoting a different size to an Arabic reader than to an English one.
 */
export const ATTRIBUTE_VALUE: Record<Locale, Record<string, string>> = {
  en: {
    Italy: 'Italy', Agave: 'Agave', Cactus: 'Cactus', 'Indoor Plant': 'Indoor plant',
    'Olive Tree': 'Olive tree', 'Palm Tree': 'Palm', 'Ornamental Tree': 'Ornamental tree',
  },
  ar: {
    Italy: 'إيطاليا', Agave: 'أغاف', Cactus: 'صبّار', 'Indoor Plant': 'نبات داخلي',
    'Olive Tree': 'شجرة زيتون', 'Palm Tree': 'نخلة', 'Ornamental Tree': 'شجرة زينة',
  },
  it: {
    Italy: 'Italia', Agave: 'Agave', Cactus: 'Cactus', 'Indoor Plant': 'Pianta da interno',
    'Olive Tree': 'Olivo', 'Palm Tree': 'Palma', 'Ornamental Tree': 'Albero ornamentale',
  },
};

export type ProductCopy = { name: string; description: string };

/** The sentence under each collection's name on /collections and its own page. */
export const FAMILY_BLURB_T: Record<Exclude<Locale, 'en'>, Record<string, string>> = {
  ar: {
    'Olive Trees': 'قرون من الطابع المتوسطي — من الأشجار المعمّرة النحتية إلى الأشكال القياسية النظيفة.',
    Palms: 'نخيل بطابع معماري، مُنتقى للبنية والظلّ الخارجي والقدرة على تحمّل مناخ الخليج.',
    Agaves: 'وريدات عريضة وأوراق مبرقشة تحافظ على هيئتها طوال صيف الإمارات.',
    'Cacti & Succulents': 'نباتات نحتية قليلة الاحتياج للماء، لمخططات الحدائق الصحراوية والمعاصرة.',
    'Ornamental Trees': 'ظلّ وتاج وحضور دائم الخضرة للأفنية والممرات والمداخل.',
    'Indoor Plants': 'نباتات داخلية للبهو والأفنية المسقوفة والتراسات المظلّلة.',
  },
  it: {
    'Olive Trees': 'Secoli di carattere mediterraneo — dagli esemplari secolari scultorei alle forme standard pulite.',
    Palms: 'Palme architettoniche scelte per struttura, sagoma e resistenza al clima del Golfo.',
    Agaves: 'Rosette decise e fogliame variegato che tengono la forma per tutta l’estate emiratina.',
    'Cacti & Succulents': 'Esemplari scultorei a basso consumo d’acqua per giardini desertici e contemporanei.',
    'Ornamental Trees': 'Ombra, chioma e presenza sempreverde per cortili, viali e ingressi.',
    'Indoor Plants': 'Esemplari da interno per hall, atri e terrazze ombreggiate.',
  },
};

/** A collection's blurb, falling back to the English compiled in products.ts. */
export const familyBlurb = (family: string, blurb: string, locale: Locale): string =>
  (locale === 'en' ? blurb : FAMILY_BLURB_T[locale]?.[family]) || blurb;


/**
 * Every specimen, in Arabic and Italian.
 *
 * Keyed by reference rather than by slug, because the reference is what a
 * quotation, a delivery note and a customer's own drawing all carry — a slug
 * can be tidied, a reference cannot without breaking three years of paperwork.
 *
 * English is absent on purpose: products.json IS the English, and a second
 * copy of it here is a second thing to keep in step with the first.
 */
export const PRODUCT_COPY: Record<string, Record<Exclude<Locale, 'en'>, ProductCopy>> = {
  "VG-AG-001": {
    ar: { name: "Agave Americana", description: "نبتة القرن الكلاسيكية بأوراق زرقاء مخضرّة عريضة. شجيرة معمارية لافتة لحدائق المناطق الجافة." },
    it: { name: "Agave Americana", description: "Classica pianta del secolo dalle foglie verde-azzurre decise. Esemplare architettonico di grande effetto per giardini aridi." },
  },
  "VG-AG-002": {
    ar: { name: "Agave Americana — كبيرة", description: "نبتة قرن كبيرة بوردة أوراق ضخمة. نقطة ارتكاز مؤثّرة في المساحات الواسعة." },
    it: { name: "Agave Americana grande", description: "Pianta del secolo di grandi dimensioni con rosetta imponente. Punto focale di forte impatto per ampi spazi." },
  },
  "VG-AG-003": {
    ar: { name: "Agave Americana — ناضجة", description: "نبتة قرن ناضجة مكتملة الوردة. الاختيار الأمثل لحدائق الصحراء." },
    it: { name: "Agave Americana matura", description: "Pianta del secolo matura, con rosetta pienamente sviluppata. L'esemplare per eccellenza nei giardini desertici." },
  },
  "VG-AG-004": {
    ar: { name: "Agave Americana Marginata", description: "نبتة قرن مبرقشة بحواف كريمية اللون. تباين لوني لافت في الحديقة." },
    it: { name: "Agave Americana Marginata", description: "Pianta del secolo variegata con margini fogliari color crema. Contrasto cromatico deciso in giardino." },
  },
  "VG-AG-005": {
    ar: { name: "Agave Marginata — كبيرة", description: "نبتة قرن مبرقشة كبيرة بحواف كريمية واضحة. شجيرة تخطف الأنظار." },
    it: { name: "Agave Marginata grande", description: "Pianta del secolo variegata di grandi dimensioni con ampi margini crema. Esemplare che cattura lo sguardo." },
  },
  "VG-AG-006": {
    ar: { name: "Agave Mediopicta", description: "أغاف مبهر بخطّ كريمي في الوسط. حجم مُدمَج مثالي للأصص." },
    it: { name: "Agave Mediopicta", description: "Agave di grande effetto con striscia centrale color crema. Dimensioni contenute, perfetta in vaso." },
  },
  "VG-AG-007": {
    ar: { name: "Agave Mediopicta Alba", description: "أغاف بخطوط بيضاء ناصعة وتباين لافت. مثالي لإبراز زاوية في الحديقة." },
    it: { name: "Agave Mediopicta Alba", description: "Agave a strisce bianche brillanti, dal contrasto marcato. Ideale per valorizzare un angolo del giardino." },
  },
  "VG-AG-008": {
    ar: { name: "Agave Attenuata", description: "أغاف ذيل الثعلب بأوراق طريّة بلا أشواك. هيئة منحنية أنيقة وآمنة لحدائق العائلة." },
    it: { name: "Agave Attenuata", description: "Agave coda di volpe dalle foglie morbide e prive di spine. Portamento arcuato ed elegante, sicura nei giardini di famiglia." },
  },
  "VG-AG-009": {
    ar: { name: "Agave Attenuata — كبير", description: "أغاف ذيل الثعلب كبير بوردة ناضجة. مذهل عند الإزهار بسنبلته الطويلة." },
    it: { name: "Agave Attenuata grande", description: "Agave coda di volpe di grandi dimensioni con rosetta matura. Spettacolare in fioritura, con la sua alta infiorescenza." },
  },
  "VG-AG-010": {
    ar: { name: "Agave Attenuata Variegata", description: "أغاف ذيل الثعلب المبرقش بأوراق مخطّطة بالكريمي. صنف نادر ومطلوب جدًّا." },
    it: { name: "Agave Attenuata Variegata", description: "Agave coda di volpe variegata, con foglie striate di crema. Varietà rara e molto ricercata." },
  },
  "VG-AG-011": {
    ar: { name: "Agave Filifera", description: "أغاف خيطي الأوراق بحواف ليفية مميّزة. مُدمَج وغنيّ بالملمس." },
    it: { name: "Agave Filifera", description: "Agave dalle foglie filifere, con caratteristici bordi fibrosi. Compatta e interessante per la trama." },
  },
  "VG-AG-012": {
    ar: { name: "Agave Filifera — مُدمَج", description: "أغاف خيطي الأوراق مُدمَج، مثالي للمساحات الصغيرة والحدائق الصخرية." },
    it: { name: "Agave Filifera compatta", description: "Agave filifera compatta, perfetta per piccoli spazi e giardini rocciosi." },
  },
  "VG-CA-001": {
    ar: { name: "صبّار عمودي", description: "صبّار عمودي مرتفع بساق مضلّعة وحضور معماري. مثالي للحدائق الحديثة." },
    it: { name: "Cactus colonnare", description: "Cactus colonnare alto, dal fusto costoluto e dalla presenza architettonica. Perfetto per giardini contemporanei." },
  },
  "VG-CA-002": {
    ar: { name: "صبّار عمودي مرتفع", description: "صبّار عمودي مرتفع مؤثّر يمنح بُعدًا رأسيًّا. ظلّ درامي أمام الجدران." },
    it: { name: "Cactus colonnare alto", description: "Imponente cactus colonnare per un accento verticale. Silhouette d'effetto contro un muro." },
  },
  "VG-CA-003": {
    ar: { name: "صبّار برميلي", description: "صبّار برميلي كلاسيكي بأشواك ذهبية وهيئة مستديرة. نبات الصحراء الأيقوني." },
    it: { name: "Cactus a barile", description: "Classico cactus a barile con spine dorate e forma tondeggiante. La pianta iconica del deserto." },
  },
  "VG-CA-004": {
    ar: { name: "صبّار برميلي كبير", description: "صبّار برميلي كبير بحجم مؤثّر وأشواك ذهبية. شجيرة مهيبة." },
    it: { name: "Cactus a barile grande", description: "Cactus a barile di grandi dimensioni con spine dorate. Esemplare maestoso." },
  },
  "VG-CA-005": {
    ar: { name: "صبّار التين الشوكي", description: "تين شوكي كلاسيكي بألواح مسطّحة وأزهار صفراء. صنف بثمار صالحة للأكل." },
    it: { name: "Fico d'India", description: "Classico fico d'India dalle pale appiattite e dai fiori gialli. Varietà a frutto commestibile." },
  },
  "VG-CA-006": {
    ar: { name: "تين شوكي كبير", description: "تين شوكي كبير مكتمل البنية. يعطي أزهارًا وثمارًا وفيرة." },
    it: { name: "Fico d'India grande", description: "Fico d'India di grandi dimensioni, dalla struttura già formata. Produce fiori e frutti in abbondanza." },
  },
  "VG-CA-007": {
    ar: { name: "صبّار أنابيب الأرغن", description: "صبّار أنابيب الأرغن متعدّد السيقان بهيئة رأسية لافتة. أزهاره ليلية." },
    it: { name: "Cactus canna d'organo", description: "Cactus canna d'organo a fusti multipli, dalla forma verticale d'effetto. Fioritura notturna." },
  },
  "VG-CA-008": {
    ar: { name: "صبّار أنابيب الأرغن كبير", description: "صبّار أنابيب أرغن كبير بسيقان متعددة وعالية. نموذج مذهل بأزهاره الليلية." },
    it: { name: "Cactus canna d'organo grande", description: "Cactus canna d'organo di grandi dimensioni con più fusti alti. Esemplare spettacolare a fioritura notturna." },
  },
  "VG-CA-009": {
    ar: { name: "الصبّار البرميلي الذهبي", description: "صبّار برميلي ذهبي كروي تمامًا بأشواك صفراء زاهية. أساسي في حديقة الصحراء." },
    it: { name: "Cactus barile dorato", description: "Cactus barile dorato perfettamente sferico, con spine giallo brillante. Un essenziale del giardino desertico." },
  },
  "VG-CA-010": {
    ar: { name: "صبّار برميلي ذهبي كبير", description: "صبّار برميلي ذهبي كبير بحجم مؤثّر. نقطة ارتكاز خلّابة لأي حديقة." },
    it: { name: "Cactus barile dorato grande", description: "Cactus barile dorato di grandi dimensioni. Punto focale magnifico per qualsiasi giardino." },
  },
  "VG-CA-011": {
    ar: { name: "مجموعة صبّار منسّقة", description: "مجموعة منتقاة من أصناف الصبّار المتكاملة. أثر حديقة صحراوية فوري." },
    it: { name: "Gruppo misto di cactus", description: "Gruppo selezionato di cactus fra loro complementari. Effetto giardino desertico immediato." },
  },
  "VG-IN-001": {
    ar: { name: "Rhapis Excelsa", description: "نخيل السيدة بأوراق مروحية أنيقة. مثالي للمساحات الداخلية والمناطق المظلّلة." },
    it: { name: "Rhapis Excelsa", description: "Palma di bambù dalle eleganti foglie a ventaglio. Perfetta per interni e zone ombreggiate." },
  },
  "VG-OL-001": {
    ar: { name: "شجرة زيتون فاخرة", description: "شجرة زيتون إيطالية فاخرة بجذع ذي طابع بديع. مثالية لتنسيق الفلل والفنادق والمشاريع التجارية." },
    it: { name: "Olivo pregiato", description: "Olivo italiano pregiato, dal tronco di carattere magnifico. Ideale per paesaggistica, ville, hotel e progetti commerciali." },
  },
  "VG-OL-002": {
    ar: { name: "شجرة زيتون بتشذيب سحابي", description: "شجرة زيتون مشذّبة بأسلوب السحاب بتاج متدرّج مميّز. نقطة ارتكاز مثالية للحدائق الفاخرة." },
    it: { name: "Olivo a nuvola", description: "Olivo potato a regola d'arte in stile a nuvola, con chioma a strati ben distinti. Punto focale perfetto per giardini di pregio." },
  },
  "VG-OL-003": {
    ar: { name: "شجرة زيتون متعددة السيقان", description: "شجرة زيتون أنيقة متعددة السيقان ببنية تفرّع رشيقة. تناسب التصاميم المعاصرة." },
    it: { name: "Olivo a più fusti", description: "Elegante olivo a più fusti dalla ramificazione armoniosa. Adatto a progetti paesaggistici contemporanei." },
  },
  "VG-OL-004": {
    ar: { name: "شجرة زيتون مميّزة", description: "شجرة زيتون مهيبة بجذع ذي طابع عتيق. قطعة تصريح عند المداخل الكبرى والأفنية." },
    it: { name: "Olivo esemplare", description: "Maestoso olivo esemplare dal tronco di carattere antico. Elemento distintivo per grandi ingressi e cortili." },
  },
  "VG-OL-005": {
    ar: { name: "شجرة زيتون بتشذيب كروي", description: "شجرة زيتون مشذّبة فنيًّا بكتل أوراق كروية. طابع معماري حديث." },
    it: { name: "Olivo a pon-pon", description: "Olivo potato artisticamente in stile a pon-pon, con ciuffi fogliari sferici. Impronta architettonica moderna." },
  },
  "VG-OL-006": {
    ar: { name: "شجرة زيتون بأسلوب البونساي", description: "شجرة زيتون بأسلوب البونساي بتفاصيل جذع دقيقة وتاج مُدمَج. مثالية للتراسات والأفنية." },
    it: { name: "Olivo stile bonsai", description: "Olivo in stile bonsai, con tronco ricco di dettaglio e chioma compatta. Perfetto per terrazze e cortili." },
  },
  "VG-OL-007": {
    ar: { name: "شجرة زيتون معمّرة", description: "شجرة زيتون عمرها قرون بجذع استثنائي الطابع وتاريخ خاص. قطعة الفخامة القصوى." },
    it: { name: "Olivo secolare", description: "Olivo secolare dal tronco di carattere straordinario e con una storia alle spalle. Il pezzo di lusso per eccellenza." },
  },
  "VG-OL-008": {
    ar: { name: "شجرة زيتون قياسية", description: "شجرة زيتون قياسية كلاسيكية بجذع نظيف وتاج مستدير. خيار متعدّد الاستعمالات لأي موقع." },
    it: { name: "Olivo standard", description: "Classico olivo standard con tronco pulito e chioma tondeggiante. Scelta versatile per qualsiasi progetto." },
  },
  "VG-OL-009": {
    ar: { name: "شجرة زيتون بهيئة عالية", description: "شجرة زيتون عالية بنموّ قائم أنيق. مثالية لإضافة بُعد رأسي إلى الحديقة." },
    it: { name: "Olivo a portamento alto", description: "Olivo a portamento alto, dallo sviluppo eretto ed elegante. Ideale per creare interesse verticale in giardino." },
  },
  "VG-OL-010": {
    ar: { name: "شجرة زيتون متهدّلة", description: "شجرة زيتون متهدّلة رشيقة بأغصان منسدلة. تضيف حركة وأناقة إلى أي موقع." },
    it: { name: "Olivo piangente", description: "Olivo piangente dal portamento armonioso, con rami ricadenti. Aggiunge movimento ed eleganza a qualsiasi spazio." },
  },
  "VG-OL-011": {
    ar: { name: "مجموعة أشجار زيتون", description: "عدة أشجار زيتون تُزرع معًا لأثر بستان فوري. مثالية لخلق أجواء متوسطية." },
    it: { name: "Gruppo di olivi", description: "Più olivi piantati insieme per un effetto uliveto immediato. Perfetti per creare un'atmosfera mediterranea." },
  },
  "VG-OL-012": {
    ar: { name: "شجرة زيتون قزمة", description: "شجرة زيتون قزمة مُدمَجة، مثالية للمساحات الصغيرة والتراسات وحدائق الأصص." },
    it: { name: "Olivo nano", description: "Olivo nano compatto, ideale per spazi ridotti, terrazze e giardini in vaso." },
  },
  "VG-OL-013": {
    ar: { name: "شجرة زيتون نحتية", description: "شجرة زيتون نحتية بتكوين جذع فنّي. عمل فنّي حيّ للحدائق المميّزة." },
    it: { name: "Olivo scultoreo", description: "Olivo scultoreo dal tronco di forma artistica. Un'opera d'arte vivente per giardini di riguardo." },
  },
  "VG-OL-014": {
    ar: { name: "شجرة زيتون عمودية", description: "شجرة زيتون عمودية بهيئة ضيّقة قائمة. مثالية للتسييج والزراعات الرسمية." },
    it: { name: "Olivo colonnare", description: "Olivo colonnare dalla forma stretta ed eretta. Perfetto per schermature e impianti formali." },
  },
  "VG-OL-015": {
    ar: { name: "شجرة زيتون ناضجة", description: "شجرة زيتون ناضجة مكتملة التاج. أثر فوري في مشاريع التنسيق الكبيرة." },
    it: { name: "Olivo maturo", description: "Olivo maturo con chioma pienamente sviluppata. Impatto immediato nei progetti di grande scala." },
  },
  "VG-OL-016": {
    ar: { name: "شجرة زيتون فتيّة", description: "شجرة زيتون فتيّة بإمكانات نموّ ممتازة. خيار اقتصادي للمشاريع المحدودة الميزانية." },
    it: { name: "Olivo giovane", description: "Olivo giovane con ottime potenzialità di crescita. Scelta economica per progetti attenti al budget." },
  },
  "VG-PL-001": {
    ar: { name: "Cycas Revoluta", description: "نخيل الساغو الكلاسيكي بسعف قاسٍ أخضر داكن. ممتاز للأصص والحدائق الاستوائية الطابع." },
    it: { name: "Cycas Revoluta", description: "Classica cicas dalle fronde rigide e verde scuro. Ottima in vaso e nei giardini di ispirazione tropicale." },
  },
  "VG-PL-002": {
    ar: { name: "Cycas Revoluta — كبير", description: "نخيل ساغو كبير بجذع مؤثّر وتاج سعف مكتمل. قطعة تصريح عند المداخل." },
    it: { name: "Cycas Revoluta grande", description: "Cicas esemplare di grandi dimensioni, con tronco imponente e corona di fronde completa. Elemento distintivo per un ingresso." },
  },
  "VG-PL-003": {
    ar: { name: "Cycas Revoluta — نموذج مميّز", description: "نخيل ساغو مميّز بجذع ناضج وتناظر تامّ. بجودة الفنادق والمنتجعات الفاخرة." },
    it: { name: "Cycas Revoluta esemplare", description: "Cicas esemplare di pregio, con tronco maturo e simmetria perfetta. Qualità da hotel e resort di lusso." },
  },
  "VG-PL-004": {
    ar: { name: "Cycas Revoluta — متعدّد الرؤوس", description: "سيكاس متعدّد الرؤوس بتيجان متعددة لأثر لافت. نموذج معماري فريد." },
    it: { name: "Cycas Revoluta a più teste", description: "Cicas a più teste, con corone multiple di grande effetto. Esemplare architettonico unico." },
  },
  "VG-PL-005": {
    ar: { name: "Archontophoenix Alexandrae", description: "نخلة الملك الأنيقة بجذع أملس وسعف منحنٍ رشيق. جمال استوائي كلاسيكي." },
    it: { name: "Archontophoenix Alexandrae", description: "Elegante palma reale dal tronco liscio e dalle fronde arcuate. Classica bellezza tropicale." },
  },
  "VG-PL-006": {
    ar: { name: "Archontophoenix — عالية", description: "نخلة ملك عالية بتاج مكتمل. أجواء استوائية فورية للمساحات الكبيرة." },
    it: { name: "Archontophoenix alta", description: "Palma reale alta, con corona già formata. Atmosfera tropicale immediata per grandi spazi." },
  },
  "VG-PL-007": {
    ar: { name: "Archontophoenix — نموذج مميّز", description: "نخلة ملك مهيبة بتاج كامل. قمّة الفخامة للمنتجعات والعقارات الكبرى." },
    it: { name: "Archontophoenix esemplare", description: "Maestosa palma reale esemplare, con corona completa. Il massimo del lusso per resort e grandi tenute." },
  },
  "VG-PL-008": {
    ar: { name: "Archontophoenix — فتيّة", description: "نخلة ملك فتيّة بإمكانات نموّ ممتازة. خيار اقتصادي للتنسيق الاستوائي." },
    it: { name: "Archontophoenix giovane", description: "Palma reale giovane con ottime potenzialità di crescita. Scelta economica per la paesaggistica tropicale." },
  },
  "VG-PL-009": {
    ar: { name: "Brahea Armata", description: "نخلة المروحة الزرقاء المكسيكية بسعف فضّي مزرقّ خلّاب. تتحمّل الجفاف وذات طابع معماري." },
    it: { name: "Brahea Armata", description: "Palma blu messicana dalle splendide fronde argento-azzurre. Resistente alla siccità e architettonica." },
  },
  "VG-PL-010": {
    ar: { name: "Brahea Armata — كبيرة", description: "نخلة مروحة زرقاء كبيرة بجذع مؤثّر. أوراقها الفضّية تصنع تباينًا لافتًا." },
    it: { name: "Brahea Armata grande", description: "Palma blu di grandi dimensioni con tronco imponente. Il fogliame argentato crea un contrasto d'effetto." },
  },
  "VG-PL-011": {
    ar: { name: "Butia Capitata", description: "نخلة الجيلي بسعف منحنٍ رشيق أزرق مخضرّ. ثمارها صالحة للأكل وتتحمّل البرد." },
    it: { name: "Butia Capitata", description: "Palma della gelatina dalle fronde arcuate verde-azzurre. Frutto commestibile e buona resistenza al freddo." },
  },
  "VG-PL-012": {
    ar: { name: "Butia Capitata — نموذج مميّز", description: "نخلة جيلي مميّزة بتاج كامل وجذع مكتمل. جميلة على مدار السنة." },
    it: { name: "Butia Capitata esemplare", description: "Palma della gelatina esemplare, con corona completa e tronco formato. Bella tutto l'anno." },
  },
  "VG-PL-013": {
    ar: { name: "Chamaerops Humilis", description: "نخلة المروحة الأوروبية بجذوع متعددة وسعف مروحي. شديدة التحمّل ومتعددة الاستعمالات." },
    it: { name: "Chamaerops Humilis", description: "Palma nana europea a più fusti, con fronde a ventaglio. Estremamente rustica e versatile." },
  },
  "VG-PL-014": {
    ar: { name: "Chamaerops Humilis — كبيرة", description: "نخلة مروحة أوروبية كبيرة بهيئة كثيفة متعددة الجذوع. مثالية للحدائق المتوسطية." },
    it: { name: "Chamaerops Humilis grande", description: "Palma nana europea di grandi dimensioni, a più fusti e portamento denso. Perfetta per giardini mediterranei." },
  },
  "VG-PL-015": {
    ar: { name: "Chamaerops Excelsa", description: "نخلة مروحة متوسطية عالية بنموّ قائم. نموذج معماري أنيق." },
    it: { name: "Chamaerops Excelsa", description: "Alta palma mediterranea a ventaglio dallo sviluppo eretto. Esemplare architettonico elegante." },
  },
  "VG-PL-016": {
    ar: { name: "Chamaerops Excelsa — نموذج مميّز", description: "نخلة مروحة عالية مميّزة بتاج كامل. أناقة متوسطية كلاسيكية لأي موقع." },
    it: { name: "Chamaerops Excelsa esemplare", description: "Alta palma a ventaglio esemplare, con corona completa. Classica eleganza mediterranea per ogni contesto." },
  },
  "VG-PL-017": {
    ar: { name: "Phoenix Canariensis", description: "نخلة التمر الكنارية بجذع مهيب وتاج كامل. حضور استوائي أيقوني." },
    it: { name: "Phoenix Canariensis", description: "Palma delle Canarie dal tronco maestoso e dalla corona completa. Presenza tropicale iconica." },
  },
  "VG-PL-018": {
    ar: { name: "Phoenix Canariensis — كبيرة", description: "نخلة تمر كنارية كبيرة بقطر جذع مؤثّر. نموذج بجودة المنتجعات." },
    it: { name: "Phoenix Canariensis grande", description: "Palma delle Canarie di grandi dimensioni, con tronco di diametro imponente. Esemplare da resort." },
  },
  "VG-PL-019": {
    ar: { name: "Washingtonia Robusta", description: "نخلة المروحة المكسيكية بجذع نحيل وتاج كثيف. سريعة النموّ ومهيبة." },
    it: { name: "Washingtonia Robusta", description: "Palma a ventaglio messicana dal tronco slanciato e dalla corona densa. Crescita rapida e portamento maestoso." },
  },
  "VG-PL-020": {
    ar: { name: "Washingtonia Robusta — عالية", description: "نخلة مروحة مكسيكية عالية بارتفاع مؤثّر. مثالية لزراعة الشوارع والمساحات الكبيرة." },
    it: { name: "Washingtonia Robusta alta", description: "Palma a ventaglio messicana di notevole altezza. Perfetta per viali alberati e grandi spazi." },
  },
  "VG-TR-001": {
    ar: { name: "Ficus Microcarpa", description: "تين الغار الهندي بأوراق دائمة الخضرة كثيفة وهيئة أنيقة. ممتاز للتشكيل." },
    it: { name: "Ficus Microcarpa", description: "Ficus dalla chioma sempreverde densa e dalla forma elegante. Ottimo per l'arte topiaria." },
  },
  "VG-TR-002": {
    ar: { name: "Ficus Microcarpa — كبير", description: "تين غار هندي كبير بتاج مكتمل. مثالي للتسييج والتظليل." },
    it: { name: "Ficus Microcarpa grande", description: "Ficus di grandi dimensioni con chioma già formata. Perfetto per schermature e ombreggiatura." },
  },
  "VG-TR-003": {
    ar: { name: "Ficus Microcarpa — هيئة قياسية", description: "تين غار هندي بهيئة قياسية، جذع خالٍ وتاج مستدير. أناقة كلاسيكية." },
    it: { name: "Ficus Microcarpa a standard", description: "Ficus in forma standard, con tronco libero e corona tondeggiante. Eleganza classica." },
  },
  "VG-TR-004": {
    ar: { name: "Yucca Rostrata", description: "يوكا منقارية بأوراق زرقاء مخضرّة خلّابة وهيئة معمارية. شديدة تحمّل الجفاف." },
    it: { name: "Yucca Rostrata", description: "Yucca rostrata dal fogliame verde-azzurro e dalla forma architettonica. Estremamente resistente alla siccità." },
  },
  "VG-TR-005": {
    ar: { name: "Yucca Rostrata — كبيرة", description: "يوكا منقارية كبيرة برأس مكتمل من الأوراق الزرقاء. نموذج معماري خلّاب." },
    it: { name: "Yucca Rostrata grande", description: "Yucca rostrata di grandi dimensioni, con testa piena di fogliame azzurro. Esemplare architettonico di grande effetto." },
  },
  "VG-TR-006": {
    ar: { name: "Yucca Rostrata — نموذج مميّز", description: "يوكا منقارية مميّزة بجذع عالٍ وتناظر تامّ. أبرز ملامح التنسيق الحديث." },
    it: { name: "Yucca Rostrata esemplare", description: "Yucca rostrata esemplare, con tronco alto e simmetria perfetta. L'elemento per eccellenza del paesaggio moderno." },
  },
  "VG-TR-007": {
    ar: { name: "Yucca Rostrata — متعددة الرؤوس", description: "يوكا متعددة الرؤوس بتيجان متعددة لأثر لافت. نموذج نحتي فريد." },
    it: { name: "Yucca Rostrata a più teste", description: "Yucca a più teste, con corone multiple di grande effetto. Esemplare scultoreo unico." },
  },
  "VG-TR-008": {
    ar: { name: "Yucca Rostrata — فتيّة", description: "يوكا منقارية فتيّة بإمكانات نموّ ممتازة. خيار اقتصادي للحدائق الحديثة." },
    it: { name: "Yucca Rostrata giovane", description: "Yucca rostrata giovane con ottime potenzialità di crescita. Scelta economica per giardini moderni." },
  },
};

/**
 * A specimen's name and description in one language.
 *
 * English falls straight through to the catalogue data; the other two read the
 * table above and fall back to English for anything missing, so a specimen
 * added to products.json tomorrow appears in every language immediately —
 * reading its English name rather than rendering blank.
 */
export function productCopy(
  p: { reference: string; name: string; description?: string },
  locale: Locale,
): ProductCopy {
  const en = { name: p.name, description: p.description ?? '' };
  if (locale === 'en') return en;
  const t = PRODUCT_COPY[p.reference]?.[locale];
  return {
    name: t?.name || en.name,
    description: t?.description || en.description,
  };
}

/** A collection's name, falling back to the English the catalogue stores. */
export const familyName = (family: string, locale: Locale): string =>
  FAMILY[locale]?.[family] ?? family;

/**
 * One row of a specification table, translated.
 *
 * A measurement passes through untouched. "1.0 - 1.5 m" means the same thing
 * in every language, and re-typing numbers per locale is how a catalogue ends
 * up quoting one size to an Arabic reader and another to an English one.
 */
export function attribute(name: string, value: string, locale: Locale) {
  return {
    name: ATTRIBUTE[locale]?.[name] ?? name,
    value: ATTRIBUTE_VALUE[locale]?.[value] ?? value,
  };
}

/**
 * "1 specimen", "12 specimens" — and the same sentence in Arabic, which needs
 * six forms rather than two.
 *
 * The site wrote this as `{n} specimen{n === 1 ? '' : 's'}`, which is correct
 * English and produces nonsense anywhere else. Italian needs two forms with
 * different words; Arabic distinguishes none, one, two, a few (3–10), many
 * (11–99) and the rest, and putting an English 's' on the end of an Arabic
 * noun is not a near miss — it is a different word.
 *
 * Intl.PluralRules is what decides which form applies, so the categories come
 * from CLDR rather than from a guess about a language nobody on this side of
 * the code speaks. A category a language does not use is simply never asked
 * for, and `other` is the fallback every language defines.
 */
const SPECIMENS: Record<Locale, Partial<Record<Intl.LDMLPluralRule, string>>> = {
  en: { one: '{n} specimen', other: '{n} specimens' },
  it: { one: '{n} esemplare', other: '{n} esemplari' },
  ar: {
    zero: 'لا نماذج',
    one: 'نموذج واحد',
    two: 'نموذجان',
    few: '{n} نماذج',
    many: '{n} نموذجًا',
    other: '{n} نموذج',
  },
};

export function specimenCount(n: number, locale: Locale): string {
  const forms = SPECIMENS[locale] ?? SPECIMENS.en;
  const tag = locale === 'ar' ? 'ar-AE' : locale === 'it' ? 'it-IT' : 'en-AE';
  const rule = new Intl.PluralRules(tag).select(n);
  return (forms[rule] ?? forms.other ?? '{n}').replace('{n}', String(n));
}
