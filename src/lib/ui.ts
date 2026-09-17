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
  'legal.prevails': 'هذه الصفحة ترجمة مقدَّمة للتيسير على القارئ. وفي حال وجود أي اختلاف، يُعتدّ بالنسخة الإنجليزية.',

  'cat.height': 'الارتفاع',
  'cat.addToList': 'أضف إلى القائمة',
  'cat.onList': 'في قائمتك',
  'cat.shortlist': 'قائمتك',
  'cat.newPhoto': 'صورة جديدة قريبًا',
  'cat.priceOnRequest': 'السعر عند الطلب',

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
  'legal.prevails': 'Questa pagina è una traduzione fornita per comodità di lettura. In caso di discrepanza, prevale la versione inglese.',

  'cat.height': 'Altezza',
  'cat.addToList': 'Aggiungi alla lista',
  'cat.onList': 'Nella tua lista',
  'cat.shortlist': 'La tua lista',
  'cat.newPhoto': 'Nuova fotografia in arrivo',
  'cat.priceOnRequest': 'Prezzo su richiesta',

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
