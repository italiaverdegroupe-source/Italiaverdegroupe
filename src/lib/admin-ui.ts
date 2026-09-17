import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

/**
 * The console, in the language of the person using it.
 *
 * THE KEY IS THE ENGLISH. Everywhere else in this codebase a translated string
 * has an invented key — 'nav.catalog' — because those are forty strings on a
 * public page and a name makes them findable. The console has four hundred and
 * fifty, spread over twenty screens, and inventing a name for each would mean
 * four hundred and fifty decisions that add nothing: every one of them would be
 * a slightly worse name than the sentence it stands for, and a reader of
 * admin/orders/page.tsx would have to look each one up to know what the screen
 * says.
 *
 * So `t('Mark as delivered')` reads as itself, the English IS the fallback, and
 * `AdminKey` is still a union of the real strings — a typo in a call site is a
 * type error, exactly as it is in ui.ts. What is lost is the compile-time
 * guarantee that every key is translated, because a Record over 450 keys would
 * have to be written three times before anything compiled at all. That is
 * covered by a test instead, which reports coverage per language rather than
 * refusing to build.
 */

/**
 * Every string the console shows, as it reads in English.
 *
 * Grouped by where it appears so the file can be worked through a screen at a
 * time rather than alphabetically.
 */
export const ADMIN_EN = [
  // ── overview ──
  'Total leads', 'Last 7 days', 'Open them →', 'Where they are', 'By emirate',
  'By enquiry', 'How they found us', 'Latest enquiries', 'Type', 'Qty',
  'Received', 'Not stated', 'Win rate — none decided yet',
  'Enquiries, last 30 days', 'Every lead sits at one stage. The percentage is how many of the previous stage reached this one.',
  'uncontacted for more than 24 hours.', 'lead has', 'leads have', 'been sitting',

  // ── the shell ──
  'Console', 'Pipeline', 'Stock', 'Money', 'System', 'Overview', 'Leads', 'Quotations', 'Orders', 'Inventory',
  'Shipments', 'Finance', 'Reports', 'Alerts', 'Content', 'Settings',
  'Backups', 'Accounts', 'Sign out', 'Signed in as', 'Menu', 'Close',
  'Language', 'Owner', 'Sales', 'Viewer',

  // ── things every screen says ──
  'Save', 'Saved', 'Cancel', 'Delete', 'Edit', 'Add', 'Search', 'Filter',
  'All', 'None', 'Open', 'Closed', 'Status', 'Actions', 'Notes', 'Total',
  'Created', 'Updated', 'Date', 'Reference', 'Name', 'Email', 'Phone',
  'Company', 'Emirate', 'Nothing here yet', 'You can see this, but you cannot change it.',
  'just now', 'min ago', 'h ago',

  // ── alerts ──
  'Urgent', 'Warning', 'Info', 'Active rules', 'Last check', 'Inbox', 'Rules',
  'Run checks now', 'Including dealt with', 'Severity', 'What', 'Raised',
  'Dealt with', 'Undo', 'Outgoing', 'Kinds available', 'Send what is waiting',
  'Test', 'Channel', 'To', 'Subject', 'State', 'Queued',

  // ── content ──
  'Site copy', 'Search engine', 'Questions', 'Testimonials', 'Journal',
  'Save copy', 'edited', 'translated', 'English', 'View the site →',
  'View this language →',

  // ── settings ──
  'Company details', 'Contact channels', 'Social', 'Commercial',
  'Registered address', 'Trade licence', 'TRN',
] as const;

export type AdminKey = (typeof ADMIN_EN)[number];

/**
 * Italian first, because the person who owns this company reads Italian and
 * runs the business from these screens every day. Trade vocabulary, not a
 * dictionary rendering: a quotation is a preventivo, a consignment is a
 * partita, stock is giacenza.
 */
const it: Partial<Record<AdminKey, string>> = {
  'Total leads': 'Richieste totali', 'Last 7 days': 'Ultimi 7 giorni',
  'Open them →': 'Aprile →', 'Where they are': 'A che punto sono',
  'By emirate': 'Per emirato', 'By enquiry': 'Per tipo di richiesta',
  'How they found us': 'Come ci hanno trovato', 'Latest enquiries': 'Ultime richieste',
  'Type': 'Tipo', 'Qty': 'Qtà', 'Received': 'Ricevuta', 'Not stated': 'Non indicato',
  'Win rate — none decided yet': 'Tasso di conversione — nessuna ancora decisa',
  'Enquiries, last 30 days': 'Richieste, ultimi 30 giorni',
  'Every lead sits at one stage. The percentage is how many of the previous stage reached this one.':
    'Ogni richiesta si trova in una sola fase. La percentuale indica quante della fase precedente sono arrivate a questa.',
  'uncontacted for more than 24 hours.': 'senza contatto da più di 24 ore.',
  'lead has': 'richiesta è', 'leads have': 'richieste sono', 'been sitting': 'ferma',

  'Console': 'Console', 'Pipeline': 'Flusso commerciale', 'Stock': 'Giacenze',
  'Money': 'Contabilità', 'System': 'Sistema', 'Overview': 'Panoramica', 'Leads': 'Richieste',
  'Quotations': 'Preventivi', 'Orders': 'Ordini', 'Inventory': 'Magazzino',
  'Shipments': 'Spedizioni', 'Finance': 'Amministrazione', 'Reports': 'Report',
  'Alerts': 'Avvisi', 'Content': 'Contenuti', 'Settings': 'Impostazioni',
  'Backups': 'Backup', 'Accounts': 'Utenti', 'Sign out': 'Esci',
  'Signed in as': 'Accesso come', 'Menu': 'Menu', 'Close': 'Chiudi',
  'Language': 'Lingua', 'Owner': 'Titolare', 'Sales': 'Commerciale', 'Viewer': 'Sola lettura',

  'Save': 'Salva', 'Saved': 'Salvato', 'Cancel': 'Annulla', 'Delete': 'Elimina',
  'Edit': 'Modifica', 'Add': 'Aggiungi', 'Search': 'Cerca', 'Filter': 'Filtra',
  'All': 'Tutti', 'None': 'Nessuno', 'Open': 'Aperti', 'Closed': 'Chiusi',
  'Status': 'Stato', 'Actions': 'Azioni', 'Notes': 'Note', 'Total': 'Totale',
  'Created': 'Creato', 'Updated': 'Aggiornato', 'Date': 'Data',
  'Reference': 'Riferimento', 'Name': 'Nome', 'Email': 'E-mail',
  'Phone': 'Telefono', 'Company': 'Azienda', 'Emirate': 'Emirato',
  'Nothing here yet': 'Ancora nulla qui',
  'You can see this, but you cannot change it.': 'Puoi consultare questa sezione, ma non modificarla.',
  'just now': 'adesso', 'min ago': 'min fa', 'h ago': 'h fa',

  'Urgent': 'Urgente', 'Warning': 'Attenzione', 'Info': 'Informazione',
  'Active rules': 'Regole attive', 'Last check': 'Ultimo controllo',
  'Inbox': 'In arrivo', 'Rules': 'Regole', 'Run checks now': 'Esegui i controlli adesso',
  'Including dealt with': 'Inclusi quelli gestiti', 'Severity': 'Gravità',
  'What': 'Cosa', 'Raised': 'Segnalato', 'Dealt with': 'Gestito', 'Undo': 'Annulla',
  'Outgoing': 'In uscita', 'Kinds available': 'Tipi disponibili',
  'Send what is waiting': 'Invia quanto è in attesa', 'Test': 'Prova',
  'Channel': 'Canale', 'To': 'A', 'Subject': 'Oggetto', 'State': 'Stato',
  'Queued': 'In coda',

  'Site copy': 'Testi del sito', 'Search engine': 'Motori di ricerca',
  'Questions': 'Domande', 'Testimonials': 'Testimonianze', 'Journal': 'Giornale',
  'Save copy': 'Salva i testi', 'edited': 'modificato', 'translated': 'tradotto',
  'English': 'Inglese', 'View the site →': 'Vedi il sito →',
  'View this language →': 'Vedi questa lingua →',

  'Company details': 'Dati aziendali', 'Contact channels': 'Canali di contatto',
  'Social': 'Social', 'Commercial': 'Commerciale',
  'Registered address': 'Sede legale', 'Trade licence': 'Licenza commerciale',
  'TRN': 'Partita IVA (TRN)',
};

/** Arabic, for the staff in the Emirates who run the yard and the deliveries. */
const ar: Partial<Record<AdminKey, string>> = {
  'Total leads': 'إجمالي الاستفسارات', 'Last 7 days': 'آخر 7 أيام',
  'Open them →': 'افتحها →', 'Where they are': 'أين وصلت',
  'By emirate': 'حسب الإمارة', 'By enquiry': 'حسب نوع الاستفسار',
  'How they found us': 'كيف وصلوا إلينا', 'Latest enquiries': 'أحدث الاستفسارات',
  'Type': 'النوع', 'Qty': 'الكمية', 'Received': 'وردت', 'Not stated': 'غير محدَّد',
  'Win rate — none decided yet': 'نسبة الإغلاق — لم يُحسم أي منها بعد',
  'Enquiries, last 30 days': 'الاستفسارات، آخر 30 يومًا',
  'Every lead sits at one stage. The percentage is how many of the previous stage reached this one.':
    'كل استفسار في مرحلة واحدة. والنسبة تُظهر كم وصل إلى هذه المرحلة من المرحلة التي قبلها.',
  'uncontacted for more than 24 hours.': 'دون تواصل لأكثر من 24 ساعة.',
  'lead has': 'استفسار', 'leads have': 'استفسارات', 'been sitting': 'بقي',

  'Console': 'لوحة التشغيل', 'Pipeline': 'مسار البيع', 'Stock': 'المخزون',
  'Money': 'المالية', 'System': 'النظام', 'Overview': 'نظرة عامة', 'Leads': 'الاستفسارات',
  'Quotations': 'عروض الأسعار', 'Orders': 'الطلبات', 'Inventory': 'المخزون',
  'Shipments': 'الشحنات', 'Finance': 'المالية', 'Reports': 'التقارير',
  'Alerts': 'التنبيهات', 'Content': 'المحتوى', 'Settings': 'الإعدادات',
  'Backups': 'النسخ الاحتياطية', 'Accounts': 'الحسابات', 'Sign out': 'تسجيل الخروج',
  'Signed in as': 'مسجَّل الدخول باسم', 'Menu': 'القائمة', 'Close': 'إغلاق',
  'Language': 'اللغة', 'Owner': 'المالك', 'Sales': 'المبيعات', 'Viewer': 'اطّلاع فقط',

  'Save': 'حفظ', 'Saved': 'تم الحفظ', 'Cancel': 'إلغاء', 'Delete': 'حذف',
  'Edit': 'تعديل', 'Add': 'إضافة', 'Search': 'بحث', 'Filter': 'تصفية',
  'All': 'الكل', 'None': 'لا شيء', 'Open': 'مفتوحة', 'Closed': 'مغلقة',
  'Status': 'الحالة', 'Actions': 'إجراءات', 'Notes': 'ملاحظات', 'Total': 'الإجمالي',
  'Created': 'أُنشئ', 'Updated': 'حُدّث', 'Date': 'التاريخ',
  'Reference': 'المرجع', 'Name': 'الاسم', 'Email': 'البريد الإلكتروني',
  'Phone': 'الهاتف', 'Company': 'الشركة', 'Emirate': 'الإمارة',
  'Nothing here yet': 'لا يوجد شيء هنا بعد',
  'You can see this, but you cannot change it.': 'يمكنك الاطّلاع على هذا، لكن لا يمكنك تعديله.',
  'just now': 'الآن', 'min ago': 'دقيقة مضت', 'h ago': 'ساعة مضت',

  'Urgent': 'عاجل', 'Warning': 'تحذير', 'Info': 'معلومة',
  'Active rules': 'القواعد المفعّلة', 'Last check': 'آخر فحص',
  'Inbox': 'الوارد', 'Rules': 'القواعد', 'Run checks now': 'شغّل الفحص الآن',
  'Including dealt with': 'بما فيها المعالَجة', 'Severity': 'الأهمية',
  'What': 'ماذا', 'Raised': 'أُثير', 'Dealt with': 'عولج', 'Undo': 'تراجع',
  'Outgoing': 'الصادر', 'Kinds available': 'الأنواع المتاحة',
  'Send what is waiting': 'أرسل ما هو منتظر', 'Test': 'اختبار',
  'Channel': 'القناة', 'To': 'إلى', 'Subject': 'الموضوع', 'State': 'الحالة',
  'Queued': 'في الطابور',

  'Site copy': 'نصوص الموقع', 'Search engine': 'محركات البحث',
  'Questions': 'الأسئلة', 'Testimonials': 'الشهادات', 'Journal': 'المدوّنة',
  'Save copy': 'حفظ النصوص', 'edited': 'معدَّل', 'translated': 'مترجَم',
  'English': 'الإنجليزية', 'View the site →': 'عرض الموقع →',
  'View this language →': 'عرض هذه اللغة →',

  'Company details': 'بيانات الشركة', 'Contact channels': 'قنوات التواصل',
  'Social': 'التواصل الاجتماعي', 'Commercial': 'تجاري',
  'Registered address': 'العنوان المسجّل', 'Trade licence': 'الرخصة التجارية',
  'TRN': 'الرقم الضريبي',
};

export const ADMIN_DICTS: Record<Locale, Partial<Record<AdminKey, string>>> = {
  en: {}, ar, it,
};

/**
 * The console translator.
 *
 *   const t = adminUi(user.locale);
 *   t('Quotations')   ->  'Preventivi'
 *
 * An untranslated string comes back as its own English, which is the key —
 * so a screen that has not been worked through yet is half Italian and fully
 * readable, rather than half empty.
 */
export function adminUi(locale?: string | null) {
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const dict = ADMIN_DICTS[l];
  return (key: AdminKey): string => dict[key] ?? key;
}

/** What the switcher offers, and what the coverage test measures. */
export const ADMIN_KEYS = ADMIN_EN;
