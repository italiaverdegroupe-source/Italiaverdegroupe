import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { COPY_DICTS, type CopyKey } from '@/lib/site-copy';

/**
 * The words the interface is made of, as opposed to the words the business
 * writes.
 *
 * These are deliberately NOT in content_blocks and not editable from the
 * console. The distinction is who owns the text:
 *
 *   The headline, the promise, the reason there is no checkout — the company
 *   rewrites those, so they live in the database and the console edits them,
 *   and an untranslated one falls back to English rather than blocking.
 *
 *   "Catalogue", "Close", "Request a quote" — nobody needs to rewrite those
 *   from a CMS, and making them editable would add three hundred fields to a
 *   screen that has thirty and is already long. They live here.
 *
 * And because they live here, a missing translation is a TYPE ERROR rather
 * than a fallback. `Record<UIKey, string>` means the build fails if Arabic is
 * missing a key. That is the right trade for chrome: an untranslated
 * paragraph reads as work in progress, while an English "Close" button on an
 * otherwise Arabic page reads as a bug — and there are only forty of them, so
 * finishing is not a project.
 */

const en = {
  // ── navigation ──
  'nav.catalog': 'Catalogue',
  'nav.collections': 'Collections',
  'nav.services': 'Services',
  'nav.journal': 'Journal',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.main': 'Main',
  'nav.menu': 'Menu',
  'nav.open': 'Open the menu',
  'nav.closeMenu': 'Close the menu',
  'nav.close': 'Close',
  'nav.skip': 'Skip to content',

  // ── actions ──
  'cta.quote': 'Request a quote',
  'cta.quote.short': 'Quote',
  'cta.bulk': 'Bulk & project pricing',
  'cta.sourcing': 'Source a specific tree',
  'cta.viewAll': 'View the whole catalogue',

  // ── footer ──
  'ftr.catalogue': 'Catalogue',
  'ftr.company': 'Company',
  'ftr.enquiries': 'Enquiries',
  'ftr.aboutUs': 'About us',
  'ftr.legal': 'Legal',
  'ftr.allSpecimens': 'All {n} specimens',
  'ftr.deliveringTo': 'Delivering to',
  'ftr.sourcedFrom': 'Sourced from',
  'ftr.leadTime': 'Lead time',
  'ftr.weeksToSite': '{min}–{max} weeks to site',
  // The only key whose translations carry no {n}. English spells the number
  // ("All seven emirates"); Arabic and Italian inflect it with the noun, and a
  // token cannot be dropped into an inflected phrase without producing
  // something no native reader would write. They say "all the emirates"
  // instead, which cannot drift if the list ever changes — and the count
  // itself is guarded by tests/footer.test.mjs, which is where it belongs.
  'ftr.allEmirates': 'All {n} emirates',
  'ftr.rights': 'All prices on request.',
  'ftr.vat': 'Prices exclusive of VAT where applicable. Specifications are indicative; living stock varies in size and form.',
  'ftr.licence': 'Trade licence {n}',
  'ftr.trn': 'TRN {n}',

  // ── legal pages ──
  'legal.privacy': 'Privacy',
  'legal.terms': 'Terms of use',
  'legal.termsOfSale': 'Terms of sale',
  'legal.refunds': 'Replacements & refunds',
  'legal.disclaimer': 'Disclaimer',
  'legal.onThisPage': 'On this page',
  'legal.updated': 'Last updated {date}',
  'legal.email': 'Email:',
  'legal.telephone': 'Telephone:',
  'legal.enquiryForm': 'enquiry form',
  'legal.eyebrow': 'Legal',
  'legal.indexTitle': 'Legal',
  'legal.indexDescription': 'Privacy policy, terms of use, terms of sale, replacements and refunds, and the website disclaimer for Verde Garden Trading.',
  'legal.alsoOnThisSite': 'Also on this site:',
  'legal.registeredIn': 'registered in {city}, {country}.',
  'legal.licence': 'Trade licence:',
  'legal.trn': 'Tax registration number:',
  'legal.whatsapp': 'WhatsApp:',
  'legal.noChannelsA': 'Our published telephone number and mailbox go live with the company domain. Until they do, the',
  'legal.noChannelsB': 'is the way to reach us, and every enquiry sent through it is read — including one about this document. We would rather tell you that than print an address nobody is answering.',
  'legal.vatCharged': 'Prices are exclusive of VAT, which is added at {rate}% where it applies.',
  'legal.vatNotRegistered': 'Prices are exclusive of VAT. We are not currently VAT-registered, so no VAT is charged and none is shown — a supplier who is not registered may not charge it.',
  // Required by the decision to publish translated legal text at all. The
  // English is the version that was written and reviewed; a translation is
  // provided so it can be READ, and says so rather than implying otherwise.
  'legal.prevails': 'This page is a translation provided for convenience. In the event of any discrepancy, the English version prevails.',

  // ── catalogue ──
  'cat.height': 'Height',
  'cat.addToList': 'Add to list',
  'cat.onList': 'On your list',
  'cat.shortlist': 'Your list',
  'cat.newPhoto': 'New photograph coming',
  'cat.priceOnRequest': 'Price on request',

  // ── specimen page ──
  'det.breadcrumb': 'Breadcrumb',
  'det.request': 'Request this specimen',
  'det.bulk': 'Bulk pricing',
  'det.reference': 'Reference {ref}',
  'det.availability': 'Availability',
  'det.price': 'Price',
  'det.onRequest': 'On request',
  'det.photoNote': 'Catalogue photograph under review — it may not represent this specimen. Current photographs are supplied with the quotation.',
  'det.livingStock': 'Living stock: dimensions are indicative and vary between individual specimens. Final size, form and price are confirmed on the quotation. Typical lead time {min}–{max} weeks from order confirmation to delivery on site.',
  'det.more': 'More from {family}',

  // ── catalogue, collections, journal ──
  'cat.noMatch': 'Nothing in the catalogue matches',
  'cat.askSource': 'Ask us to source it',
  'cat.matching': 'matching',
  'col.see': 'See the collection',
  'col.others': 'The other collections',
  'col.othersAria': 'Other collections',
  'jrn.likeThis': 'Looking for a specimen like this?',
  'jrn.more': 'More from the journal',

  // ── coverage ──
  'loc.eyebrow': 'Coverage',
  'loc.title': 'Tree supply & delivery in {name}',
  'loc.onSite': 'What that means on site',
  'loc.common': 'Commonly specified here',
  'loc.requestPricing': 'Request pricing for {name}',
  'loc.alsoDelivering': 'Also delivering to',
  'loc.otherEmirates': 'Other emirates',

  // ── forms and the page that is not there ──
  'qf.error': 'Something went wrong.',
  'qf.consentA': 'I agree that',
  'qf.consentB': 'may store these details and contact me about this enquiry. We do not sell or share your data.',
  'qf.sending': 'Sending…',
  'qf.send': 'Send enquiry',
  'sl.neededBy': 'Needed by',
  'sl.optional': 'optional',
  'quote.validFor': 'Valid {days} days, with specification and lead time.',
  'quote.leadNote': 'Typical lead time is {min}–{max} weeks from order confirmation to delivery on a UAE site. Large or out-of-season specimens can take longer — we will tell you honestly rather than promise a date we cannot hold.',
  'svc.leadTimeA': 'Typical lead time is',
  'svc.leadTimeWeeks': '{min}–{max} weeks',
  'svc.leadTimeB': 'from order confirmation to site delivery — selection, documentation, sailing and acclimatisation included.',
  'nf.title': 'That page has been replanted.',
  'nf.lede': 'The page you asked for is not here. The catalogue is.',
  'nf.browse': 'Browse the catalogue',
  'map.uae': 'UNITED ARAB EMIRATES',
  'map.allEmirates': 'all seven emirates',
  'map.italy': 'ITALY',

  // ── language ──
  'proof.specimens': 'specimens catalogued',
  'proof.regions': 'Italian growing regions',
  'proof.emirates': 'emirates covered',
  'proof.weeks': 'weeks, order to site',
  'brand.line': 'Italian roots\nfor a greener tomorrow',

  'lang.label': 'Language',
} as const;

export type UIKey = keyof typeof en;

/** Arabic, as a UAE buyer reads it rather than as a dictionary renders it. */
const ar: Record<UIKey, string> = {
  'nav.catalog': 'الكتالوج',
  'nav.collections': 'المجموعات',
  'nav.services': 'الخدمات',
  'nav.journal': 'المدوّنة',
  'nav.about': 'من نحن',
  'nav.contact': 'تواصل معنا',
  'nav.main': 'الرئيسية',
  'nav.menu': 'القائمة',
  'nav.open': 'افتح القائمة',
  'nav.closeMenu': 'أغلق القائمة',
  'nav.close': 'إغلاق',
  'nav.skip': 'تخطَّ إلى المحتوى',

  'cta.quote': 'اطلب عرض سعر',
  'cta.quote.short': 'عرض سعر',
  'cta.bulk': 'أسعار الجملة والمشاريع',
  'cta.sourcing': 'ابحث لي عن شجرة بعينها',
  'cta.viewAll': 'تصفّح الكتالوج كاملًا',

  'ftr.catalogue': 'الكتالوج',
  'ftr.company': 'الشركة',
  'ftr.enquiries': 'الاستفسارات',
  'ftr.aboutUs': 'من نحن',
  'ftr.legal': 'الشؤون القانونية',
  'ftr.allSpecimens': 'جميع الأصناف ({n})',
  'ftr.deliveringTo': 'نوصّل إلى',
  'ftr.sourcedFrom': 'المصدر',
  'ftr.leadTime': 'مدة التوريد',
  'ftr.weeksToSite': 'من {min} إلى {max} أسابيع حتى الموقع',
  'ftr.allEmirates': 'جميع الإمارات',
  'ftr.rights': 'جميع الأسعار عند الطلب.',
  'ftr.vat': 'الأسعار غير شاملة ضريبة القيمة المضافة حيثما تنطبق. المواصفات استرشادية؛ والأشجار كائنات حيّة تتفاوت في الحجم والشكل.',
  'ftr.licence': 'رخصة تجارية رقم {n}',
  'ftr.trn': 'الرقم الضريبي {n}',

  'legal.privacy': 'الخصوصية',
  'legal.terms': 'شروط الاستخدام',
  'legal.termsOfSale': 'شروط البيع',
  'legal.refunds': 'الاستبدال والاسترجاع',
  'legal.disclaimer': 'إخلاء المسؤولية',
  'legal.onThisPage': 'في هذه الصفحة',
  'legal.updated': 'آخر تحديث {date}',
  'legal.email': 'البريد الإلكتروني:',
  'legal.telephone': 'الهاتف:',
  'legal.enquiryForm': 'نموذج الاستفسار',
  'legal.eyebrow': 'القانونية',
  'legal.indexTitle': 'الصفحات القانونية',
  'legal.indexDescription': 'سياسة الخصوصية، وشروط الاستخدام، وشروط البيع، والاستبدال والاسترجاع، وإخلاء المسؤولية لموقع «فيردي غاردن للتجارة».',
  'legal.alsoOnThisSite': 'أيضًا على هذا الموقع:',
  'legal.registeredIn': 'مسجّلة في {city}، {country}.',
  'legal.licence': 'الرخصة التجارية:',
  'legal.trn': 'رقم التسجيل الضريبي:',
  'legal.whatsapp': 'واتساب:',
  'legal.noChannelsA': 'رقم الهاتف وصندوق البريد المُعلنان يبدأان العمل مع إطلاق نطاق الشركة. وإلى أن يحدث ذلك، فإن',
  'legal.noChannelsB': 'هو الطريق للوصول إلينا، وكل استفسار يُرسل عبره يُقرأ — بما في ذلك استفسار عن هذه الوثيقة. نفضّل أن نقول لك ذلك على أن ننشر عنوانًا لا يرد عليه أحد.',
  'legal.vatCharged': 'الأسعار لا تشمل ضريبة القيمة المضافة، وتُضاف بنسبة {rate}% حيث تنطبق.',
  'legal.vatNotRegistered': 'الأسعار لا تشمل ضريبة القيمة المضافة. لسنا مسجلين حاليًا في ضريبة القيمة المضافة، فلا تُحتسب ولا تُعرض — والمورّد غير المسجّل لا يجوز له احتسابها.',
  'legal.prevails': 'هذه الصفحة ترجمة مقدَّمة للتيسير على القارئ. وفي حال وجود أي اختلاف، يُعتدّ بالنسخة الإنجليزية.',

  'cat.height': 'الارتفاع',
  'cat.addToList': 'أضف إلى القائمة',
  'cat.onList': 'في قائمتك',
  'cat.shortlist': 'قائمتك',
  'cat.newPhoto': 'صورة جديدة قريبًا',
  'cat.priceOnRequest': 'السعر عند الطلب',

  'det.breadcrumb': 'مسار التصفّح',
  'det.request': 'اطلب هذه الشجرة',
  'det.bulk': 'أسعار الجملة',
  'det.reference': 'الرقم المرجعي {ref}',
  'det.availability': 'التوفّر',
  'det.price': 'السعر',
  'det.onRequest': 'عند الطلب',
  'det.photoNote': 'صورة الكتالوج قيد المراجعة — وقد لا تمثّل هذه الشجرة بعينها. وتُقدّم الصور الحالية مع عرض السعر.',
  'det.livingStock': 'بضاعة حيّة: الأبعاد استرشادية وتختلف من شجرة إلى أخرى. ويُؤكّد الحجم والشكل والسعر النهائي في عرض السعر. المهلة المعتادة {min}–{max} أسبوعًا من تأكيد الطلب إلى التسليم في الموقع.',
  'det.more': 'المزيد من {family}',

  'cat.noMatch': 'لا شيء في الكتالوج يطابق',
  'cat.askSource': 'اطلب منّا توفيرها',
  'cat.matching': 'مطابق لـ',
  'col.see': 'تصفّح المجموعة',
  'col.others': 'المجموعات الأخرى',
  'col.othersAria': 'مجموعات أخرى',
  'jrn.likeThis': 'تبحث عن شجرة مثل هذه؟',
  'jrn.more': 'المزيد من المدوّنة',

  'loc.eyebrow': 'نطاق التغطية',
  'loc.title': 'توريد الأشجار وتسليمها في {name}',
  'loc.onSite': 'ما يعنيه ذلك في الموقع',
  'loc.common': 'الأكثر طلبًا هنا',
  'loc.requestPricing': 'اطلب تسعيرًا لـ{name}',
  'loc.alsoDelivering': 'نسلّم أيضًا إلى',
  'loc.otherEmirates': 'إمارات أخرى',

  'qf.error': 'حدث خطأ ما.',
  'qf.consentA': 'أوافق على أن تحتفظ',
  'qf.consentB': 'بهذه البيانات وأن تتواصل معي بشأن هذا الاستفسار. ونحن لا نبيع بياناتك ولا نشاركها.',
  'qf.sending': 'جارٍ الإرسال…',
  'qf.send': 'أرسل الاستفسار',
  'sl.neededBy': 'مطلوبة بحلول',
  'sl.optional': 'اختياري',
  'quote.validFor': 'صالح {days} يومًا، مع المواصفة ومهلة التنفيذ.',
  'quote.leadNote': 'المهلة المعتادة {min}–{max} أسبوعًا من تأكيد الطلب إلى التسليم في موقع داخل الإمارات. وقد تطول مع الأشجار الكبيرة أو خارج الموسم — وسنقول لك ذلك بصراحة بدل أن نعد بتاريخ لا نقدر عليه.',
  'svc.leadTimeA': 'المهلة المعتادة',
  'svc.leadTimeWeeks': '{min}–{max} أسبوعًا',
  'svc.leadTimeB': 'من تأكيد الطلب إلى التسليم في الموقع — شاملة الانتقاء والمستندات والإبحار والتأقلم.',
  'nf.title': 'هذه الصفحة نُقلت إلى موضع آخر.',
  'nf.lede': 'الصفحة التي طلبتها ليست هنا. أمّا الكتالوج فهو هنا.',
  'nf.browse': 'تصفّح الكتالوج',
  'map.uae': 'الإمارات العربية المتحدة',
  'map.allEmirates': 'الإمارات السبع جميعها',
  'map.italy': 'إيطاليا',

  'proof.specimens': 'صنفًا في الكتالوج',
  'proof.regions': 'مناطق إنتاج إيطالية',
  'proof.emirates': 'إمارات نغطّيها',
  'proof.weeks': 'أسابيع من الطلب إلى الموقع',
  'brand.line': 'جذورٌ إيطالية\nلغدٍ أكثر خضرة',

  'lang.label': 'اللغة',
};

/** Italian, for the growers and for the half of this brand that is Italian. */
const it: Record<UIKey, string> = {
  'nav.catalog': 'Catalogo',
  'nav.collections': 'Collezioni',
  'nav.services': 'Servizi',
  'nav.journal': 'Giornale',
  'nav.about': 'Chi siamo',
  'nav.contact': 'Contatti',
  'nav.main': 'Principale',
  'nav.menu': 'Menu',
  'nav.open': 'Apri il menu',
  'nav.closeMenu': 'Chiudi il menu',
  'nav.close': 'Chiudi',
  'nav.skip': 'Vai al contenuto',

  'cta.quote': 'Richiedi un preventivo',
  'cta.quote.short': 'Preventivo',
  'cta.bulk': 'Prezzi per volumi e progetti',
  'cta.sourcing': 'Cerca un esemplare specifico',
  'cta.viewAll': 'Sfoglia tutto il catalogo',

  'ftr.catalogue': 'Catalogo',
  'ftr.company': 'Azienda',
  'ftr.enquiries': 'Richieste',
  'ftr.aboutUs': 'Chi siamo',
  'ftr.legal': 'Note legali',
  'ftr.allSpecimens': 'Tutti i {n} esemplari',
  'ftr.deliveringTo': 'Consegniamo in',
  'ftr.sourcedFrom': 'Provenienza',
  'ftr.leadTime': 'Tempi di consegna',
  'ftr.weeksToSite': '{min}–{max} settimane in cantiere',
  'ftr.allEmirates': 'Tutti gli Emirati',
  'ftr.rights': 'Tutti i prezzi su richiesta.',
  'ftr.vat': 'Prezzi IVA esclusa ove applicabile. Le specifiche sono indicative; essendo piante vive, dimensioni e portamento variano.',
  'ftr.licence': 'Licenza commerciale {n}',
  'ftr.trn': 'Partita IVA (TRN) {n}',

  'legal.privacy': 'Privacy',
  'legal.terms': 'Termini di utilizzo',
  'legal.termsOfSale': 'Condizioni di vendita',
  'legal.refunds': 'Sostituzioni e rimborsi',
  'legal.disclaimer': 'Esclusione di responsabilità',
  'legal.onThisPage': 'In questa pagina',
  'legal.updated': 'Ultimo aggiornamento {date}',
  'legal.email': 'E-mail:',
  'legal.telephone': 'Telefono:',
  'legal.enquiryForm': 'modulo di richiesta',
  'legal.eyebrow': 'Note legali',
  'legal.indexTitle': 'Note legali',
  'legal.indexDescription': 'Informativa sulla privacy, termini di utilizzo, condizioni di vendita, sostituzioni e rimborsi ed esclusione di responsabilità di Verde Garden Trading.',
  'legal.alsoOnThisSite': 'Anche su questo sito:',
  'legal.registeredIn': 'registrata a {city}, {country}.',
  'legal.licence': 'Licenza commerciale:',
  'legal.trn': 'Numero di registrazione fiscale:',
  'legal.whatsapp': 'WhatsApp:',
  'legal.noChannelsA': 'Il nostro numero di telefono e la casella di posta pubblicati entreranno in funzione con il dominio aziendale. Fino ad allora, il',
  'legal.noChannelsB': 'è il modo per raggiungerci, e ogni richiesta inviata da lì viene letta — compresa una richiesta su questo documento. Preferiamo dirvelo piuttosto che pubblicare un recapito a cui nessuno risponde.',
  'legal.vatCharged': 'I prezzi sono al netto dell’IVA, che viene aggiunta al {rate}% dove applicabile.',
  'legal.vatNotRegistered': 'I prezzi sono al netto dell’IVA. Attualmente non siamo registrati ai fini IVA, quindi nessuna IVA viene addebitata né indicata — un fornitore non registrato non può addebitarla.',
  'legal.prevails': 'Questa pagina è una traduzione fornita per comodità di lettura. In caso di discrepanza, prevale la versione inglese.',

  'cat.height': 'Altezza',
  'cat.addToList': 'Aggiungi alla lista',
  'cat.onList': 'Nella tua lista',
  'cat.shortlist': 'La tua lista',
  'cat.newPhoto': 'Nuova fotografia in arrivo',
  'cat.priceOnRequest': 'Prezzo su richiesta',

  'det.breadcrumb': 'Percorso di navigazione',
  'det.request': 'Richiedi questo esemplare',
  'det.bulk': 'Prezzi per quantità',
  'det.reference': 'Riferimento {ref}',
  'det.availability': 'Disponibilità',
  'det.price': 'Prezzo',
  'det.onRequest': 'Su richiesta',
  'det.photoNote': 'Fotografia di catalogo in revisione — potrebbe non rappresentare questo esemplare. Le fotografie aggiornate sono fornite con il preventivo.',
  'det.livingStock': 'Materiale vivo: le dimensioni sono indicative e variano da un esemplare all’altro. Misura, forma e prezzo definitivi sono confermati nel preventivo. Tempo tipico {min}–{max} settimane dalla conferma dell’ordine alla consegna in cantiere.',
  'det.more': 'Altro da {family}',

  'cat.noMatch': 'Nulla nel catalogo corrisponde a',
  'cat.askSource': 'Chiedeteci di reperirlo',
  'cat.matching': 'che corrispondono a',
  'col.see': 'Vedi la collezione',
  'col.others': 'Le altre collezioni',
  'col.othersAria': 'Altre collezioni',
  'jrn.likeThis': 'Cercate un esemplare come questo?',
  'jrn.more': 'Altro dal giornale',

  'loc.eyebrow': 'Copertura',
  'loc.title': 'Fornitura e consegna di alberi a {name}',
  'loc.onSite': 'Che cosa significa in cantiere',
  'loc.common': 'Più richiesti qui',
  'loc.requestPricing': 'Richiedi un preventivo per {name}',
  'loc.alsoDelivering': 'Consegniamo anche a',
  'loc.otherEmirates': 'Altri emirati',

  'qf.error': 'Qualcosa è andato storto.',
  'qf.consentA': 'Acconsento a che',
  'qf.consentB': 'conservi questi dati e mi contatti in merito a questa richiesta. Non vendiamo né condividiamo i vostri dati.',
  'qf.sending': 'Invio in corso…',
  'qf.send': 'Invia la richiesta',
  'sl.neededBy': 'Necessario entro',
  'sl.optional': 'facoltativo',
  'quote.validFor': 'Valido {days} giorni, con specifica e tempi di consegna.',
  'quote.leadNote': 'Il tempo tipico è di {min}–{max} settimane dalla conferma dell’ordine alla consegna in un cantiere negli Emirati. Esemplari grandi o fuori stagione possono richiedere più tempo — ve lo diremo onestamente anziché promettere una data che non possiamo mantenere.',
  'svc.leadTimeA': 'Il tempo tipico è di',
  'svc.leadTimeWeeks': '{min}–{max} settimane',
  'svc.leadTimeB': 'dalla conferma dell’ordine alla consegna in cantiere — selezione, documentazione, navigazione e acclimatazione compresi.',
  'nf.title': 'Quella pagina è stata ripiantata altrove.',
  'nf.lede': 'La pagina che cercavate non è qui. Il catalogo sì.',
  'nf.browse': 'Sfoglia il catalogo',
  'map.uae': 'EMIRATI ARABI UNITI',
  'map.allEmirates': 'tutti e sette gli emirati',
  'map.italy': 'ITALIA',

  'proof.specimens': 'esemplari a catalogo',
  'proof.regions': 'regioni italiane di produzione',
  'proof.emirates': 'emirati serviti',
  'proof.weeks': 'settimane dall\'ordine al cantiere',
  'brand.line': 'Radici italiane\nper un domani più verde',

  'lang.label': 'Lingua',
};

const DICTS: Record<Locale, Record<UIKey, string>> = { en, ar, it };

/**
 * The translator for one language.
 *
 *   const t = ui(lang);
 *   t('nav.catalog')                      -> 'الكتالوج'
 *   t('ftr.weeksToSite', { min: 4, max: 8 })
 *
 * Tokens are filled the same way content blocks fill them, and an unknown one
 * is left visible rather than blanked — a label reading "{min} weeks" is a
 * bug somebody reports, while a label reading " weeks" is one nobody notices.
 */
/**
 * The translator for one language.
 *
 * It answers two kinds of key, because there are two kinds of string:
 *
 *   A UIKey — 'nav.catalog' — is chrome, and every language has one. Missing
 *   it is a type error (see the note at the top of this file).
 *
 *   A CopyKey is a sentence from a page, keyed by its own English. Missing it
 *   comes back as that English, which is a page that has not been translated
 *   yet rather than a page with a hole in it.
 *
 * Both go through one function so a page needs one translator rather than two,
 * and so a call site does not have to know which kind of string it is holding.
 */
export function ui(locale: Locale = DEFAULT_LOCALE) {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  const copy = COPY_DICTS[locale] ?? {};
  return (key: UIKey | CopyKey, tokens?: Record<string, string | number>): string => {
    const s = (dict as Record<string, string>)[key]
      ?? copy[key as CopyKey]
      ?? (en as Record<string, string>)[key]
      // A CopyKey IS its English, so an untranslated sentence renders itself.
      ?? key;
    return tokens
      ? s.replace(/\{(\w+)\}/g, (all, k) => (k in tokens ? String(tokens[k]) : all))
      : s;
  };
}

/** For tests, and for a console screen that wants to show what is covered. */
export const UI_KEYS = Object.keys(en) as UIKey[];
export const UI_DICTS = DICTS;
