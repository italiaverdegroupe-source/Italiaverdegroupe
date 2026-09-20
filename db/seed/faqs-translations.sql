-- The four published FAQs, in English, Arabic and Italian.
--
--   psql "$DATABASE_URL" -f db/seed/faqs-translations.sql
--
-- Two separate gaps, found the day before handover and fixed together.
--
-- PRODUCTION HAD NO FAQs AT ALL — the table was empty, so the homepage and
-- /services rendered no FAQ section and the FAQPage structured data described
-- nothing. The section was designed, built and tested; nobody had put the
-- content in the live database.
--
-- AND THE FAQs THAT DID EXIST WERE ENGLISH ONLY. publishedFaqs() falls back to
-- English when a locale has no row, so an Arabic reader got four English
-- questions under an Arabic heading — and Google was told the same, in
-- English, on the Arabic URL.
--
-- Everything here is matched on the English QUESTION rather than on an id, and
-- guarded by NOT EXISTS, so it is safe against any database and safe to run
-- twice. Nothing is ever overwritten: an edit made in the console survives a
-- re-run.

-- ── the English originals ──
INSERT INTO faqs (question, answer, category, sort_order, is_published, locale)
SELECT v.question, v.answer, 'general', v.sort_order, true, 'en'
  FROM (VALUES
    ('Who handles the import permits and phytosanitary paperwork?',
     'We do, at both ends. The Italian nursery issues the phytosanitary certificate, we hold the UAE import permit and clear the consignment through customs. You receive the tree, not the file.', 10),
    ('Can you deliver to a site with restricted access?',
     'Usually, but it is decided before the date is agreed rather than on the morning. We ask for gate widths, overhead lines and ground bearing, and bring a hiab or a crane where the root ball needs one.', 20),
    ('Do you plant, or only supply?',
     'Both. Supply only is a normal request from contractors who have their own teams. Where planting is in scope we handle pit preparation, soil amendment, staking and irrigation connection.', 30),
    ('What happens if a tree fails after planting?',
     'Tell us early. Most failures in the first season trace to irrigation or planting depth and are recoverable; where the specimen was not sound on arrival, that is ours to put right. We will come and look before anyone argues about it.', 40)
  ) AS v(question, answer, sort_order)
 WHERE NOT EXISTS (
   SELECT 1 FROM faqs e WHERE e.locale = 'en' AND e.question = v.question
 );

-- ── and the translations, hung off whichever English row now exists ──
INSERT INTO faqs (question, answer, category, sort_order, is_published, locale, translation_of)
SELECT v.question, v.answer, en.category, en.sort_order, true, v.locale, en.id
  FROM faqs en
  JOIN (VALUES
    ('Who handles the import permits and phytosanitary paperwork?', 'ar',
     'من يتولّى تصاريح الاستيراد والأوراق الصحّية النباتية؟',
     'نحن، في الطرفين. المشتل الإيطالي يصدر الشهادة الصحّية النباتية، ونحن نحمل تصريح الاستيراد الإماراتي ونخلّص الشحنة من الجمارك. أنت تستلم الشجرة، لا الملف.'),
    ('Can you deliver to a site with restricted access?', 'ar',
     'هل يمكنكم التسليم إلى موقع ذي وصول محدود؟',
     'غالباً نعم، لكن ذلك يُحسم قبل الاتفاق على الموعد لا في صباح التسليم. نسأل عن عرض البوابات والأسلاك العلوية وتحمّل الأرض، ونُحضر رافعة هيدروليكية أو ونشاً حين تتطلّب الكتلة الجذرية ذلك.'),
    ('Do you plant, or only supply?', 'ar',
     'هل تغرسون الأشجار أم تورّدونها فقط؟',
     'الاثنان. التوريد وحده طلب معتاد من المقاولين الذين لديهم فرقهم. وحين يشمل النطاق الغرس، نتولّى تجهيز الحفرة وتحسين التربة والتدعيم وتوصيل الريّ.'),
    ('What happens if a tree fails after planting?', 'ar',
     'ماذا يحدث لو تدهورت الشجرة بعد الغرس؟',
     'أخبرنا مبكراً. معظم حالات التدهور في الموسم الأول سببها الريّ أو عمق الغرس، وهي قابلة للعلاج؛ وحين تكون الشجرة غير سليمة عند الوصول فتلك مسؤوليّتنا نصحّحها. نأتي وننظر قبل أن يتجادل أحد.'),
    ('Who handles the import permits and phytosanitary paperwork?', 'it',
     'Chi si occupa dei permessi di importazione e dei documenti fitosanitari?',
     'Ce ne occupiamo noi, da entrambe le parti. Il vivaio italiano emette il certificato fitosanitario, noi deteniamo il permesso di importazione degli Emirati e sdoganiamo la spedizione. Lei riceve l''albero, non il fascicolo.'),
    ('Can you deliver to a site with restricted access?', 'it',
     'Potete consegnare in un cantiere con accesso limitato?',
     'Di norma sì, ma si decide prima di fissare la data, non la mattina stessa. Chiediamo la larghezza dei cancelli, le linee aeree e la portanza del terreno, e portiamo un''autogru o una gru quando la zolla lo richiede.'),
    ('Do you plant, or only supply?', 'it',
     'Mettete a dimora o fornite soltanto?',
     'Entrambe le cose. La sola fornitura è una richiesta normale da parte di imprese che hanno squadre proprie. Dove la messa a dimora rientra nell''incarico, curiamo lo scavo, l''ammendamento del terreno, l''ancoraggio e l''allaccio dell''irrigazione.'),
    ('What happens if a tree fails after planting?', 'it',
     'Cosa succede se un albero deperisce dopo la messa a dimora?',
     'Ce lo dica subito. Quasi tutti i deperimenti della prima stagione dipendono dall''irrigazione o dalla profondità di impianto e sono recuperabili; se l''esemplare non era sano all''arrivo, spetta a noi rimediare. Veniamo a vedere prima che qualcuno discuta.')
  ) AS v(en_question, locale, question, answer)
    ON en.question = v.en_question AND en.locale = 'en'
 WHERE NOT EXISTS (
   SELECT 1 FROM faqs t WHERE t.translation_of = en.id AND t.locale = v.locale
 );
