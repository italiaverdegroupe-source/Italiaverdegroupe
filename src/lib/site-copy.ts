import type { Locale } from '@/lib/i18n';

/**
 * The public site's page copy, keyed by its own English.
 *
 * Separate from ui.ts, which holds the chrome — the nav, the buttons, the
 * forty words that frame every page and whose absence in a language is a bug.
 * This is the copy ON the pages: headings, explanations, form labels, the
 * paragraphs that say why there is no checkout.
 *
 * It follows admin-ui.ts rather than ui.ts: the key is the English sentence.
 * There are a hundred and seventeen of them and they are prose, so an invented
 * name would be a worse label than the sentence itself, and a reader of
 * about/page.tsx would have to look each one up to know what the page says.
 *
 * WHAT IS NOT HERE, on purpose: any sentence that the markup breaks in half —
 * around a <Link>, or a {count}. Translated as fragments those come back in
 * English word order with the link stranded in the middle of an Arabic
 * paragraph, which reads as a broken site rather than an untranslated one.
 * scripts/i18n-unmix.mjs finds them and leaves them alone; they are whole
 * English sentences until somebody rewrites the markup so each is one string.
 */

export const COPY_EN = [
  'About', 'Access for a crane, planting included, a drawing to send over…',
  'Against current stock and the next consignment from Italy.', 'All', 'Any',
  'Back to the catalogue', 'Before you enquire', 'Catalogue', 'Clear', 'Clients',
  'Collection', 'Collections', 'Company', 'Contact', 'Coverage', 'Delivered to',
  'Delivery market', 'Discuss a project',
  'Each listing is an individual specimen with its own reference, measured as it stands today rather than at the size it will grow into. Availability moves with each consignment, so every specimen is priced on the day you ask.',
  'Email', 'Emirate', 'Enquiry', 'Enquiry received.',
  'Every specimen is different. Two olive trees of the same nominal height can differ completely in trunk girth, canopy and character — and therefore in price. Add freight, season, quantity, site access and whether planting is in scope, and a fixed online price would be a fiction. So we quote.',
  'Every specimen is quoted individually — availability, size and price depend on the season and the consignment. Tell us what the project needs and we will price it.',
  'Everything you picked, one enquiry.',
  'Five documents, each about one thing, in plain sentences. If any of them is unclear, that is a fault in the document — tell us and we will fix it.',
  'From the Italian nursery to the finished site.', 'From the catalogue',
  'Growing regions', 'Grown in', 'Height', 'Height or girth, and how many',
  'Italian growers have spent generations producing the specimen material this region wants — ancient olive trees with genuine trunk character, cloud-pruned and sculptural forms, architectural palms and agaves. The Mediterranean climate that produces them is close enough to Gulf conditions that well-selected material adapts, provided it is handled correctly on the way.',
  'Italian horticulture, supplied properly in the Gulf.', 'Italian trees & plants',
  'Journal', 'Lead time', 'Legal', 'Living stock, handled as such',
  'Looking for one particular tree?', 'Name', 'New photograph coming',
  'No prices are published — every specimen is quoted individually, because availability and size change with the consignment.',
  'Not sure / several',
  'Not yet registered for VAT, so quotations carry no VAT line. They state that they are exclusive of VAT where it applies.',
  'Nothing published yet. Articles appear here as they are written.',
  'One company carries the tree the whole way, so there is nobody to point at when something goes wrong with it.',
  'Phone / WhatsApp', 'Project type', 'Quantity', 'Quantity of',
  'Questions we are asked about the work itself.', 'Reading your list…',
  'Reference, botanical or common name — VG-OL-012, Olea, palm', 'Registered name',
  'Request a quote', 'Request bulk pricing', 'Required on site by',
  'Scope is quoted to what a project actually needs. Supply on its own is a perfectly normal request.',
  'Scope required', 'Search', 'Search the catalogue', 'See everything →',
  'See what we carry', 'Selected stock', 'Select…', 'Send a specification', 'Sent',
  'Services',
  'Set the quantity against each specimen and send the whole list at once. We will price them together, which is also how they ship — one consignment costs less per tree than six.',
  'Six collections', 'Size', 'Sort', 'Source a specific tree', 'Sourcing',
  'Sourcing route', 'Species, or a photograph of something close to it',
  'Specimen', 'Specimens listed', 'Start an enquiry',
  'Supply only, or supply with delivery and planting',
  'Supply, delivery, crane and offloading, planting — whatever you need.',
  'Talk to us about the project.', 'Thank you — we have it.',
  'The calendar decides more than the budget does.', 'The catalogue', 'The company',
  'The emirate, and whether a crane can reach the planting position',
  'The full catalogue is searchable by name, botanical name, reference or size — and if what you need is not listed, we source it to specification from the grower rather than from a stock list.',
  'The more of this you have, the faster the number comes back — but a photograph and a rough height are enough to start.',
  'The small print, written to be read.',
  'There is no checkout — every specimen is priced individually against the season, the consignment and the scope of work. Send us the detail and we will price it properly.',
  'Timing', 'Trade licence',
  'Trees are living stock. Lifting season in Italy and the UAE summer both limit when a specimen can safely move and establish, and no amount of logistics gets around either. We will tell you the realistic window for a species rather than accept a delivery date that would cost you the tree.',
  'Trees are not freight. They need the right lifting season, correct root-ball handling, documentation for import, a period to acclimatise on arrival, and the right equipment at the point of delivery. Where a timeline or a species is not realistic, we say so before the order rather than after the tree fails.',
  'View all', 'View this specimen', 'We confirm availability', 'We price the scope',
  'You get a written quotation',
  'We will come back with availability, lead time and a priced quotation. Very large or out-of-season specimens can take longer to confirm with the nursery.',
  'Website', 'What do you need?', 'What happens next', 'What to send',
  'When it has to be on site', 'Where should the price go?', 'Where we deliver',
  'Who we supply', 'Why Italian stock', 'Why quotations, not a checkout',
  'Your name', 'Your reference is', 'Your shortlist', 'e.g. March', 'specimens →',
  // The company's own description and strapline. They are the two sentences
  // the Organization JSON-LD publishes about this business, and they were
  // English on the Arabic and Italian homepages — in the machine-readable
  // layer, where nobody would think to check.
  'We import premium trees and plants from Italian nurseries and supply landscaping companies, developers, hotels and private estates across the United Arab Emirates.',
  'Italian Trees & Plants, Imported for the UAE',
] as const;

export type CopyKey = (typeof COPY_EN)[number];

/** Arabic, as a buyer in the Emirates reads it. */
const ar: Record<CopyKey, string> = {
  "We import premium trees and plants from Italian nurseries and supply landscaping companies, developers, hotels and private estates across the United Arab Emirates.":
    "نستورد أشجاراً ونباتات فاخرة من المشاتل الإيطالية ونورّدها لشركات تنسيق الحدائق والمطوّرين والفنادق والمزارع الخاصة في جميع أنحاء الإمارات العربية المتحدة.",
  "Italian Trees & Plants, Imported for the UAE":
    "أشجار ونباتات إيطالية، مستوردة للإمارات",
  "About":
    "من نحن",
  "Access for a crane, planting included, a drawing to send over…":
    "إمكانية دخول رافعة، الغرس ضمن النطاق، مخطط ترسله…",
  "Against current stock and the next consignment from Italy.":
    "مقابل المخزون الحالي والشحنة القادمة من إيطاليا.",
  "All":
    "الكل",
  "Any":
    "أي",
  "Back to the catalogue":
    "العودة إلى الكتالوج",
  "Before you enquire":
    "قبل أن ترسل استفسارك",
  "Catalogue":
    "الكتالوج",
  "Clear":
    "مسح",
  "Clients":
    "العملاء",
  "Collection":
    "المجموعة",
  "Collections":
    "المجموعات",
  "Company":
    "الشركة",
  "Contact":
    "تواصل معنا",
  "Coverage":
    "التغطية",
  "Delivered to":
    "التسليم إلى",
  "Delivery market":
    "سوق التسليم",
  "Discuss a project":
    "تحدّث معنا عن مشروعك",
  "Each listing is an individual specimen with its own reference, measured as it stands today rather than at the size it will grow into. Availability moves with each consignment, so every specimen is priced on the day you ask.":
    "كل بند هنا شجرة بعينها لها مرجعها الخاص، ومقاسها مأخوذ كما هي اليوم لا كما ستصير بعد سنوات. والتوافر يتغيّر مع كل شحنة، لذلك تُسعَّر كل شجرة في يوم سؤالك عنها.",
  "Email":
    "البريد الإلكتروني",
  "Emirate":
    "الإمارة",
  "Enquiry":
    "الاستفسار",
  "Enquiry received.":
    "وصلنا استفسارك.",
  "Every specimen is different. Two olive trees of the same nominal height can differ completely in trunk girth, canopy and character — and therefore in price. Add freight, season, quantity, site access and whether planting is in scope, and a fixed online price would be a fiction. So we quote.":
    "كل شجرة مختلفة. شجرتا زيتون بالارتفاع الاسمي نفسه قد تختلفان تمامًا في محيط الجذع والتاج والطابع — وبالتالي في السعر. أضف الشحن والموسم والكمية وإمكانية الوصول إلى الموقع وما إذا كان الغرس ضمن النطاق، وسيتبيّن أن أي سعر ثابت على الإنترنت هو وهم. لذلك نُصدر عروض أسعار.",
  "Every specimen is quoted individually — availability, size and price depend on the season and the consignment. Tell us what the project needs and we will price it.":
    "كل شجرة تُسعَّر على حدة — فالتوافر والمقاس والسعر تتبع الموسم والشحنة. قل لنا ما يحتاجه المشروع ونحن نُسعّره.",
  "Everything you picked, one enquiry.":
    "كل ما اخترته، في استفسار واحد.",
  "Five documents, each about one thing, in plain sentences. If any of them is unclear, that is a fault in the document — tell us and we will fix it.":
    "خمس وثائق، كل واحدة عن موضوع واحد، بجُمل واضحة. وإن غمض عليك شيء فيها فالعيب في الوثيقة — أخبرنا ونصلحها.",
  "From the Italian nursery to the finished site.":
    "من المشتل الإيطالي إلى الموقع وقد اكتمل.",
  "From the catalogue":
    "من الكتالوج",
  "Growing regions":
    "مناطق الإنتاج",
  "Grown in":
    "مزروعة في",
  "Height":
    "الارتفاع",
  "Height or girth, and how many":
    "الارتفاع أو محيط الجذع، والعدد",
  "Italian growers have spent generations producing the specimen material this region wants — ancient olive trees with genuine trunk character, cloud-pruned and sculptural forms, architectural palms and agaves. The Mediterranean climate that produces them is close enough to Gulf conditions that well-selected material adapts, provided it is handled correctly on the way.":
    "أمضى المزارعون الإيطاليون أجيالًا في إنتاج ما تطلبه هذه المنطقة تحديدًا — أشجار زيتون معمّرة بجذوع ذات طابع حقيقي، وأشكال منحوتة ومشذّبة، ونخيل وصبّار بقيمة معمارية. والمناخ المتوسطي الذي ينتجها قريب بما يكفي من ظروف الخليج لتتأقلم الأشجار المنتقاة جيدًا، شرط أن تُعامل معاملة صحيحة في الطريق.",
  "Italian horticulture, supplied properly in the Gulf.":
    "بستنة إيطالية، تُورَّد في الخليج كما ينبغي.",
  "Italian trees & plants":
    "أشجار ونباتات إيطالية",
  "Journal":
    "المدوّنة",
  "Lead time":
    "مدة التوريد",
  "Legal":
    "الشؤون القانونية",
  "Living stock, handled as such":
    "كائنات حيّة، تُعامَل على هذا الأساس",
  "Looking for one particular tree?":
    "تبحث عن شجرة بعينها؟",
  "Name":
    "الاسم",
  "New photograph coming":
    "صورة جديدة قريبًا",
  "No prices are published — every specimen is quoted individually, because availability and size change with the consignment.":
    "لا نَنشر أسعارًا — كل شجرة تُسعَّر على حدة، لأن التوافر والمقاس يتغيّران مع كل شحنة.",
  "Not sure / several":
    "غير متأكد / أكثر من نوع",
  "Not yet registered for VAT, so quotations carry no VAT line. They state that they are exclusive of VAT where it applies.":
    "غير مسجَّلين لضريبة القيمة المضافة بعد، فعروض الأسعار لا تحمل بند ضريبة. وهي تنصّ على أنها غير شاملة للضريبة حيثما تنطبق.",
  "Nothing published yet. Articles appear here as they are written.":
    "لم يُنشر شيء بعد. ستظهر المقالات هنا كلما كُتبت.",
  "One company carries the tree the whole way, so there is nobody to point at when something goes wrong with it.":
    "شركة واحدة ترافق الشجرة الطريق كله، فلا يوجد طرف آخر يُشار إليه إن حدث خلل.",
  "Phone / WhatsApp":
    "الهاتف / واتساب",
  "Project type":
    "نوع المشروع",
  "Quantity":
    "الكمية",
  "Quantity of":
    "كمية",
  "Questions we are asked about the work itself.":
    "أسئلة تُطرح علينا عن العمل نفسه.",
  "Reading your list…":
    "جارٍ قراءة قائمتك…",
  "Reference, botanical or common name — VG-OL-012, Olea, palm":
    "المرجع أو الاسم النباتي أو الشائع — VG-OL-012، Olea، نخيل",
  "Registered name":
    "الاسم المسجَّل",
  "Request a quote":
    "اطلب عرض سعر",
  "Request bulk pricing":
    "اطلب سعر جملة",
  "Required on site by":
    "مطلوبة في الموقع بحلول",
  "Scope is quoted to what a project actually needs. Supply on its own is a perfectly normal request.":
    "نطاق العمل يُسعَّر على ما يحتاجه المشروع فعلًا. والتوريد وحده طلب طبيعي تمامًا.",
  "Scope required":
    "نطاق العمل المطلوب",
  "Search":
    "بحث",
  "Search the catalogue":
    "ابحث في الكتالوج",
  "See everything →":
    "اعرض الكل →",
  "See what we carry":
    "اطّلع على ما لدينا",
  "Selected stock":
    "مختارات من المخزون",
  "Select…":
    "اختر…",
  "Send a specification":
    "أرسل مواصفات",
  "Sent":
    "أُرسل",
  "Services":
    "الخدمات",
  "Set the quantity against each specimen and send the whole list at once. We will price them together, which is also how they ship — one consignment costs less per tree than six.":
    "حدّد الكمية أمام كل شجرة وأرسل القائمة كاملة دفعة واحدة. سنُسعّرها معًا، وهي كذلك تُشحن معًا — وشحنة واحدة تكلّف للشجرة أقل من ست شحنات.",
  "Six collections":
    "ست مجموعات",
  "Size":
    "المقاس",
  "Sort":
    "الترتيب",
  "Source a specific tree":
    "ابحث لي عن شجرة بعينها",
  "Sourcing":
    "التوريد",
  "Sourcing route":
    "مسار التوريد",
  "Species, or a photograph of something close to it":
    "النوع، أو صورة لشيء قريب منه",
  "Specimen":
    "الشجرة",
  "Specimens listed":
    "الأصناف المدرجة",
  "Start an enquiry":
    "ابدأ استفسارًا",
  "Supply only, or supply with delivery and planting":
    "توريد فقط، أو توريد مع التوصيل والغرس",
  "Supply, delivery, crane and offloading, planting — whatever you need.":
    "توريد، توصيل، رافعة وتنزيل، غرس — ما تحتاجه.",
  "Talk to us about the project.":
    "حدّثنا عن المشروع.",
  "Thank you — we have it.":
    "شكرًا لك — وصلنا طلبك.",
  "The calendar decides more than the budget does.":
    "الرزنامة تقرّر أكثر مما تقرّره الميزانية.",
  "The catalogue":
    "الكتالوج",
  "The company":
    "الشركة",
  "The emirate, and whether a crane can reach the planting position":
    "الإمارة، وهل تصل الرافعة إلى موضع الغرس",
  "The full catalogue is searchable by name, botanical name, reference or size — and if what you need is not listed, we source it to specification from the grower rather than from a stock list.":
    "يمكن البحث في الكتالوج كاملًا بالاسم أو الاسم النباتي أو المرجع أو المقاس — وإن لم يكن ما تريده مدرجًا، نوفّره لك حسب المواصفات من المزارع مباشرةً لا من قائمة مخزون.",
  "The more of this you have, the faster the number comes back — but a photograph and a rough height are enough to start.":
    "كلما توفّر لديك من هذا أكثر، عاد إليك الرقم أسرع — لكن صورة وارتفاعًا تقريبيًا يكفيان للبداية.",
  "The small print, written to be read.":
    "التفاصيل الدقيقة، مكتوبة لتُقرأ.",
  "There is no checkout — every specimen is priced individually against the season, the consignment and the scope of work. Send us the detail and we will price it properly.":
    "لا توجد سلّة شراء — كل شجرة تُسعَّر على حدة وفق الموسم والشحنة ونطاق العمل. أرسل لنا التفاصيل ونُسعّرها كما يجب.",
  "Timing":
    "التوقيت",
  "Trade licence":
    "الرخصة التجارية",
  "Trees are living stock. Lifting season in Italy and the UAE summer both limit when a specimen can safely move and establish, and no amount of logistics gets around either. We will tell you the realistic window for a species rather than accept a delivery date that would cost you the tree.":
    "الأشجار كائنات حيّة. موسم القلع في إيطاليا وصيف الإمارات كلاهما يحدّ من الوقت الذي تستطيع فيه الشجرة أن تنتقل وترسّخ بأمان، ولا توجد خدمات لوجستية تتجاوز أيًّا منهما. سنقول لك النافذة الواقعية للنوع بدلًا من قبول موعد تسليم يكلّفك الشجرة.",
  "Trees are not freight. They need the right lifting season, correct root-ball handling, documentation for import, a period to acclimatise on arrival, and the right equipment at the point of delivery. Where a timeline or a species is not realistic, we say so before the order rather than after the tree fails.":
    "الأشجار ليست بضاعة شحن. تحتاج موسم القلع الصحيح، ومعاملة سليمة لكتلة الجذور، وتوثيقًا للاستيراد، وفترة تأقلم عند الوصول، والمعدّات المناسبة عند التسليم. وحين يكون جدول زمني أو نوع غير واقعي، نقولها قبل الطلب لا بعد أن تموت الشجرة.",
  "View all":
    "اعرض الكل",
  "View this specimen":
    "اعرض هذه الشجرة",
  "We confirm availability":
    "نؤكّد التوافر",
  "We price the scope":
    "نُسعّر نطاق العمل",
  "You get a written quotation":
    "تحصل على عرض سعر مكتوب",
  "We will come back with availability, lead time and a priced quotation. Very large or out-of-season specimens can take longer to confirm with the nursery.":
    "سنعود إليك بالتوافر ومدة التوريد وعرض سعر مفصّل. والأشجار الكبيرة جدًا أو خارج الموسم قد تستغرق وقتًا أطول لتأكيدها مع المشتل.",
  "Website":
    "الموقع الإلكتروني",
  "What do you need?":
    "ما الذي تحتاجه؟",
  "What happens next":
    "ماذا يحدث بعد ذلك",
  "What to send":
    "ماذا ترسل",
  "When it has to be on site":
    "متى يجب أن تكون في الموقع",
  "Where should the price go?":
    "إلى أين نرسل السعر؟",
  "Where we deliver":
    "إلى أين نوصّل",
  "Who we supply":
    "من نورّد لهم",
  "Why Italian stock":
    "لماذا المشتل الإيطالي",
  "Why quotations, not a checkout":
    "لماذا عروض أسعار لا سلّة شراء",
  "Your name":
    "اسمك",
  "Your reference is":
    "رقمك المرجعي هو",
  "Your shortlist":
    "قائمتك",
  "e.g. March":
    "مثال: مارس",
  "specimens →":
    "صنفًا →",
};

/** Italian, for the growers, the suppliers, and the half of this that is Italian. */
const it: Record<CopyKey, string> = {
  "We import premium trees and plants from Italian nurseries and supply landscaping companies, developers, hotels and private estates across the United Arab Emirates.":
    "Importiamo alberi e piante di pregio da vivai italiani e riforniamo imprese di paesaggistica, sviluppatori, alberghi e tenute private in tutti gli Emirati Arabi Uniti.",
  "Italian Trees & Plants, Imported for the UAE":
    "Alberi e piante italiane, importati per gli Emirati",
  "About":
    "Chi siamo",
  "Access for a crane, planting included, a drawing to send over…":
    "Accesso per la gru, messa a dimora inclusa, un disegno da inviarci…",
  "Against current stock and the next consignment from Italy.":
    "Sulla giacenza attuale e sulla prossima partita dall’Italia.",
  "All":
    "Tutti",
  "Any":
    "Qualsiasi",
  "Back to the catalogue":
    "Torna al catalogo",
  "Before you enquire":
    "Prima di scriverci",
  "Catalogue":
    "Catalogo",
  "Clear":
    "Azzera",
  "Clients":
    "Clienti",
  "Collection":
    "Collezione",
  "Collections":
    "Collezioni",
  "Company":
    "Azienda",
  "Contact":
    "Contatti",
  "Coverage":
    "Copertura",
  "Delivered to":
    "Consegniamo a",
  "Delivery market":
    "Mercato di consegna",
  "Discuss a project":
    "Parliamo del progetto",
  "Each listing is an individual specimen with its own reference, measured as it stands today rather than at the size it will grow into. Availability moves with each consignment, so every specimen is priced on the day you ask.":
    "Ogni scheda è un esemplare singolo con un proprio riferimento, misurato com’è oggi e non alla dimensione che raggiungerà. La disponibilità cambia con ogni partita, perciò ogni esemplare viene quotato nel giorno in cui lo chiedete.",
  "Email":
    "E-mail",
  "Emirate":
    "Emirato",
  "Enquiry":
    "Richiesta",
  "Enquiry received.":
    "Richiesta ricevuta.",
  "Every specimen is different. Two olive trees of the same nominal height can differ completely in trunk girth, canopy and character — and therefore in price. Add freight, season, quantity, site access and whether planting is in scope, and a fixed online price would be a fiction. So we quote.":
    "Ogni esemplare è diverso. Due olivi della stessa altezza nominale possono differire completamente per circonferenza del tronco, chioma e carattere — e quindi per prezzo. Aggiungete trasporto, stagione, quantità, accessibilità del cantiere e se la messa a dimora rientra nella fornitura: un prezzo fisso online sarebbe una finzione. Per questo lavoriamo a preventivo.",
  "Every specimen is quoted individually — availability, size and price depend on the season and the consignment. Tell us what the project needs and we will price it.":
    "Ogni esemplare è quotato singolarmente: disponibilità, dimensione e prezzo dipendono dalla stagione e dalla partita. Diteci cosa serve al progetto e lo quotiamo.",
  "Everything you picked, one enquiry.":
    "Tutto quello che avete scelto, in un’unica richiesta.",
  "Five documents, each about one thing, in plain sentences. If any of them is unclear, that is a fault in the document — tell us and we will fix it.":
    "Cinque documenti, ciascuno su un solo argomento, in frasi semplici. Se qualcosa non è chiaro, il difetto è del documento: segnalatecelo e lo correggiamo.",
  "From the Italian nursery to the finished site.":
    "Dal vivaio italiano al cantiere finito.",
  "From the catalogue":
    "Dal catalogo",
  "Growing regions":
    "Regioni di produzione",
  "Grown in":
    "Coltivato in",
  "Height":
    "Altezza",
  "Height or girth, and how many":
    "Altezza o circonferenza, e quanti",
  "Italian growers have spent generations producing the specimen material this region wants — ancient olive trees with genuine trunk character, cloud-pruned and sculptural forms, architectural palms and agaves. The Mediterranean climate that produces them is close enough to Gulf conditions that well-selected material adapts, provided it is handled correctly on the way.":
    "I vivaisti italiani producono da generazioni proprio il materiale che questa regione cerca: olivi secolari con tronchi di vero carattere, forme scultoree e potature a nuvola, palme e agavi di valore architettonico. Il clima mediterraneo che li produce è abbastanza vicino alle condizioni del Golfo perché il materiale ben selezionato si adatti, purché sia trattato correttamente lungo il percorso.",
  "Italian horticulture, supplied properly in the Gulf.":
    "Vivaismo italiano, fornito come si deve nel Golfo.",
  "Italian trees & plants":
    "Alberi e piante italiane",
  "Journal":
    "Giornale",
  "Lead time":
    "Tempi di consegna",
  "Legal":
    "Note legali",
  "Living stock, handled as such":
    "Materiale vivo, trattato come tale",
  "Looking for one particular tree?":
    "Cercate un albero in particolare?",
  "Name":
    "Nome",
  "New photograph coming":
    "Nuova fotografia in arrivo",
  "No prices are published — every specimen is quoted individually, because availability and size change with the consignment.":
    "Non pubblichiamo prezzi: ogni esemplare è quotato singolarmente, perché disponibilità e dimensione cambiano con la partita.",
  "Not sure / several":
    "Non saprei / più di uno",
  "Not yet registered for VAT, so quotations carry no VAT line. They state that they are exclusive of VAT where it applies.":
    "Non ancora registrati ai fini IVA, quindi i preventivi non riportano una riga IVA. Indicano che si intendono IVA esclusa ove applicabile.",
  "Nothing published yet. Articles appear here as they are written.":
    "Ancora nulla di pubblicato. Gli articoli compaiono qui man mano che vengono scritti.",
  "One company carries the tree the whole way, so there is nobody to point at when something goes wrong with it.":
    "Una sola azienda accompagna l’albero per tutto il percorso: se qualcosa va storto non c’è nessun altro da chiamare in causa.",
  "Phone / WhatsApp":
    "Telefono / WhatsApp",
  "Project type":
    "Tipo di progetto",
  "Quantity":
    "Quantità",
  "Quantity of":
    "Quantità di",
  "Questions we are asked about the work itself.":
    "Le domande che ci fanno sul lavoro in sé.",
  "Reading your list…":
    "Lettura della lista…",
  "Reference, botanical or common name — VG-OL-012, Olea, palm":
    "Riferimento, nome botanico o comune — VG-OL-012, Olea, palma",
  "Registered name":
    "Ragione sociale",
  "Request a quote":
    "Richiedi un preventivo",
  "Request bulk pricing":
    "Richiedi un prezzo per volumi",
  "Required on site by":
    "Necessario in cantiere entro",
  "Scope is quoted to what a project actually needs. Supply on its own is a perfectly normal request.":
    "La fornitura viene quotata su ciò che il progetto richiede davvero. La sola fornitura è una richiesta del tutto normale.",
  "Scope required":
    "Prestazioni richieste",
  "Search":
    "Cerca",
  "Search the catalogue":
    "Cerca nel catalogo",
  "See everything →":
    "Vedi tutto →",
  "See what we carry":
    "Guarda cosa trattiamo",
  "Selected stock":
    "Selezione dalla giacenza",
  "Select…":
    "Seleziona…",
  "Send a specification":
    "Invia un capitolato",
  "Sent":
    "Inviata",
  "Services":
    "Servizi",
  "Set the quantity against each specimen and send the whole list at once. We will price them together, which is also how they ship — one consignment costs less per tree than six.":
    "Indicate la quantità accanto a ogni esemplare e inviate l’intera lista in una volta. Li quotiamo insieme, ed è anche così che viaggiano: una sola partita costa meno per albero rispetto a sei.",
  "Six collections":
    "Sei collezioni",
  "Size":
    "Dimensione",
  "Sort":
    "Ordina",
  "Source a specific tree":
    "Cerca un esemplare specifico",
  "Sourcing":
    "Reperimento",
  "Sourcing route":
    "Percorso di fornitura",
  "Species, or a photograph of something close to it":
    "La specie, o una foto di qualcosa di simile",
  "Specimen":
    "Esemplare",
  "Specimens listed":
    "Esemplari a catalogo",
  "Start an enquiry":
    "Invia una richiesta",
  "Supply only, or supply with delivery and planting":
    "Sola fornitura, oppure fornitura con consegna e messa a dimora",
  "Supply, delivery, crane and offloading, planting — whatever you need.":
    "Fornitura, consegna, gru e scarico, messa a dimora — quello che serve.",
  "Talk to us about the project.":
    "Parlateci del progetto.",
  "Thank you — we have it.":
    "Grazie — l’abbiamo ricevuta.",
  "The calendar decides more than the budget does.":
    "Il calendario decide più del budget.",
  "The catalogue":
    "Il catalogo",
  "The company":
    "L’azienda",
  "The emirate, and whether a crane can reach the planting position":
    "L’emirato, e se una gru può raggiungere il punto di impianto",
  "The full catalogue is searchable by name, botanical name, reference or size — and if what you need is not listed, we source it to specification from the grower rather than from a stock list.":
    "Il catalogo completo si cerca per nome, nome botanico, riferimento o dimensione — e se quello che vi serve non è in elenco, lo reperiamo su capitolato direttamente dal produttore e non da una lista di magazzino.",
  "The more of this you have, the faster the number comes back — but a photograph and a rough height are enough to start.":
    "Più informazioni avete, più in fretta arriva il numero — ma per cominciare bastano una foto e un’altezza di massima.",
  "The small print, written to be read.":
    "Le clausole, scritte per essere lette.",
  "There is no checkout — every specimen is priced individually against the season, the consignment and the scope of work. Send us the detail and we will price it properly.":
    "Non c’è un carrello: ogni esemplare viene quotato singolarmente in base alla stagione, alla partita e alle prestazioni richieste. Inviateci i dettagli e lo quotiamo come si deve.",
  "Timing":
    "Tempistiche",
  "Trade licence":
    "Licenza commerciale",
  "Trees are living stock. Lifting season in Italy and the UAE summer both limit when a specimen can safely move and establish, and no amount of logistics gets around either. We will tell you the realistic window for a species rather than accept a delivery date that would cost you the tree.":
    "Gli alberi sono materiale vivo. La stagione di espianto in Italia e l’estate negli Emirati limitano entrambe il periodo in cui un esemplare può spostarsi e attecchire in sicurezza, e nessuna logistica aggira né l’una né l’altra. Vi diremo la finestra realistica per una specie invece di accettare una data di consegna che vi costerebbe l’albero.",
  "Trees are not freight. They need the right lifting season, correct root-ball handling, documentation for import, a period to acclimatise on arrival, and the right equipment at the point of delivery. Where a timeline or a species is not realistic, we say so before the order rather than after the tree fails.":
    "Gli alberi non sono merce. Richiedono la giusta stagione di espianto, una corretta gestione della zolla, la documentazione per l’importazione, un periodo di acclimatazione all’arrivo e i mezzi adatti al momento della consegna. Quando una tempistica o una specie non è realistica, lo diciamo prima dell’ordine e non dopo che l’albero è morto.",
  "View all":
    "Vedi tutti",
  "View this specimen":
    "Vedi questo esemplare",
  "We confirm availability":
    "Confermiamo la disponibilità",
  "We price the scope":
    "Quotiamo le prestazioni",
  "You get a written quotation":
    "Ricevete un preventivo scritto",
  "We will come back with availability, lead time and a priced quotation. Very large or out-of-season specimens can take longer to confirm with the nursery.":
    "Vi risponderemo con disponibilità, tempi di consegna e un preventivo quotato. Per esemplari molto grandi o fuori stagione la conferma con il vivaio può richiedere più tempo.",
  "Website":
    "Sito web",
  "What do you need?":
    "Di cosa avete bisogno?",
  "What happens next":
    "Cosa succede dopo",
  "What to send":
    "Cosa inviare",
  "When it has to be on site":
    "Quando deve essere in cantiere",
  "Where should the price go?":
    "Dove mandiamo il prezzo?",
  "Where we deliver":
    "Dove consegniamo",
  "Who we supply":
    "A chi forniamo",
  "Why Italian stock":
    "Perché materiale italiano",
  "Why quotations, not a checkout":
    "Perché preventivi e non un carrello",
  "Your name":
    "Il vostro nome",
  "Your reference is":
    "Il vostro riferimento è",
  "Your shortlist":
    "La vostra lista",
  "e.g. March":
    "es. marzo",
  "specimens →":
    "esemplari →",
};

export const COPY_DICTS: Record<Locale, Partial<Record<CopyKey, string>>> = { en: {}, ar, it };

/** Present, so a test can measure coverage rather than assume it. */
export const COPY_KEYS = COPY_EN;
