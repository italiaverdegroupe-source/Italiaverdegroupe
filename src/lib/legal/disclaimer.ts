import type { LegalSet } from './types';

/**
 * The website disclaimer.
 *
 * `{underReview}` and `{total}` are counted from products.json at render, so
 * the sentence about photographs under review cannot drift from the catalogue
 * — a policy that says "four of sixty-eight" while the catalogue shows six is
 * worse than one that says nothing.
 *
 * Added here: what the translated pages themselves mean, a governing law
 * clause the page lacked, and a plain statement about the journal.
 */
export const disclaimer: LegalSet = {
  en: {
    slug: 'disclaimer',
    title: 'Website disclaimer',
    metaTitle: 'Website disclaimer',
    metaDescription:
      'What the photographs, sizes, names and growing notes on this site mean, and what they do not promise.',
    cardLine: 'What the photographs, sizes and growing notes mean — and what they do not promise.',
    cardNote: 'Where the line is drawn.',
    summary:
      'Everything here is meant to help you specify a tree accurately. None of it is a measurement of the specimen you will receive, and this page says exactly where the line is.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'photographs',
        heading: 'The photographs',
        body: [
          { t: 'p', text: 'A catalogue photograph shows the **kind and grade** of specimen a listing refers to. It is not a photograph of the tree that will be delivered to you, because the tree that will be delivered to you has not been selected yet — it is selected at the nursery against your order.' },
          { t: 'p', text: 'Living stock varies. Two olives of the same age, grade and price will differ in canopy, trunk character and the exact shape of the head. That variation is the thing being bought; a tree that looked identical to a photograph would be a manufactured object.' },
          { t: 'note', text: '**{underReview} of the {total} photographs on this site are currently marked “new photograph coming”.** We reviewed the catalogue against its own descriptions and found images that do not represent the specimen they sit on — a barrel cactus on a listing for a columnar one, a feather palm on a listing for a fan palm. Rather than quietly leave them, each is flagged on its card and on its page while replacements are taken. Those listings are still real stock; only the picture is in doubt.' },
          { t: 'p', text: 'Photographs of the actual specimen are supplied with the quotation, before anything is committed. Those are the ones to decide on.' },
        ],
      },
      {
        id: 'sizes',
        heading: 'Heights, spreads and pot sizes',
        body: [
          { t: 'p', text: 'Sizes on this site describe the **grade** — the band a specimen is sold in — not a measurement taken of one tree. A listing that says 3.0–4.0 m means the grade contains trees between those heights.' },
          { t: 'p', text: 'Height is measured from the top of the root ball, and a tree keeps growing between the quotation and the delivery. Where a scheme depends on an exact dimension — a clear stem under a canopy, a height under a balcony — say so in the enquiry and it will be measured and confirmed on the specific specimen before it ships.' },
          { t: 'p', text: 'Pot and root-ball sizes are nominal and vary with how a grower lifted and prepared the tree.' },
        ],
      },
      {
        id: 'names',
        heading: 'Botanical and common names',
        body: [
          { t: 'p', text: 'We use the names the trade uses, which are not always the names a botanist would. Common names in particular are regional and overlapping. If a specification turns on identity — for a landscape consent, a tender or a plant schedule — quote the botanical name in your enquiry and we will confirm in writing what is being supplied against it.' },
          { t: 'p', text: 'Botanical names are not translated anywhere on this site. *Olea europaea* is *Olea europaea* in every language, and that is the entire point of binomial nomenclature; a page that translated it would be inviting a mistake into a plant schedule.' },
        ],
      },
      {
        id: 'advice',
        heading: 'Growing and planting notes',
        body: [
          { t: 'p', text: 'The notes on this site, and anything in the journal, are general guidance for UAE conditions. They are not advice about your site.' },
          { t: 'p', text: 'Soil, salinity, irrigation water quality, drainage, wind exposure, reflected heat off a wall and the month you plant in all change the answer, and none of them can be known from here. Where the outcome matters, have somebody look at the site — including us, if planting is in scope.' },
          { t: 'p', text: 'Nothing on this site is horticultural, agricultural, legal or financial advice you should rely on without checking it against your own circumstances.' },
        ],
      },
      {
        id: 'availability',
        heading: 'Availability and price',
        body: [
          { t: 'p', text: 'A specimen appearing in the catalogue does not mean one is in stock today. The catalogue records what we supply; availability moves with each consignment and with the lifting season in Italy.' },
          { t: 'p', text: '**No price is published on this site.** Anything you have been told a tree costs, which did not come from a written quotation issued by us, did not come from us. Prices depend on grade, quantity, scope and the freight on that consignment, and a quotation is the only document that binds either of us.' },
          { t: 'p', text: 'Lead times quoted on this site are typical, not promised. What is promised is on the [terms of sale](/terms-of-sale).' },
        ],
      },
      {
        id: 'external',
        heading: 'Links and third parties',
        body: [
          { t: 'p', text: 'Where we link to a grower, an authority or a standard, that is a pointer and not an endorsement, and we do not control what is on the other end of it. Check anything you intend to rely on at its source.' },
        ],
      },
      {
        id: 'translations',
        heading: 'The translated pages',
        body: [
          { t: 'p', text: 'This site is published in English, Arabic and Italian. The Arabic and Italian pages are translations of the English, provided so that the site can be read rather than decoded, and they are checked rather than machine-produced.' },
          { t: 'p', text: 'Where a translation and the English differ, the English is the version that was written and reviewed, and it is the one that governs — on the legal pages explicitly, and everywhere else as a matter of fact. Measurements, references and botanical names are identical in all three; if you find one that is not, that is a defect and we would like to hear about it.' },
        ],
      },
      {
        id: 'accuracy',
        heading: 'Keeping this site accurate',
        body: [
          { t: 'p', text: 'We correct what we find. This page exists because the alternative — a blanket sentence saying nothing here can be relied upon — tells you nothing useful about which parts to check.' },
          { t: 'p', text: 'If something on this site is wrong, tell us. A specimen described incorrectly is a defect in our catalogue, and we would rather hear it from you than have it sit there.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'related',
        heading: 'What this page does not cover',
        body: [
          { t: 'p', text: 'This disclaimer is about information on the website. What we owe you for a tree we actually sold you is on the [terms of sale](/terms-of-sale), and what happens when one arrives wrong or fails is on the [replacements and refunds policy](/refunds). Neither of those is disclaimed by anything here.' },
          { t: 'p', text: 'This page is governed by the laws of the United Arab Emirates as applied in {city}. It is published in English, Arabic and Italian, and where they differ the English governs.' },
        ],
      },
    ],
  },

  ar: {
    slug: 'disclaimer',
    title: 'إخلاء المسؤولية',
    metaTitle: 'إخلاء المسؤولية',
    metaDescription:
      'ماذا تعني الصور والأحجام والأسماء والإرشادات الزراعية على هذا الموقع، وما الذي لا تَعِد به.',
    cardLine: 'ماذا تعني الصور والأحجام والإرشادات الزراعية — وما الذي لا تَعِد به.',
    cardNote: 'أين يُرسم الحدّ.',
    summary:
      'كل ما هنا يهدف إلى مساعدتك على تحديد مواصفة شجرة بدقّة. ولا شيء منه قياس للشجرة التي ستصلك، وهذه الصفحة تبيّن بالضبط أين يقع الحدّ.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'photographs',
        heading: 'الصور',
        body: [
          { t: 'p', text: 'صورة الكتالوج تُظهر **نوع ودرجة** الشجرة التي يشير إليها الإدراج. وهي ليست صورة للشجرة التي ستصلك، لأن تلك الشجرة لم تُنتقَ بعد — فهي تُنتقى في المشتل مقابل طلبك.' },
          { t: 'p', text: 'البضاعة الحيّة تتفاوت. فزيتونتان من العمر والدرجة والسعر نفسها ستختلفان في التاج وطابع الجذع وشكل الرأس بالضبط. وهذا التفاوت هو ما يُشترى أصلًا؛ فالشجرة المطابقة تمامًا لصورة ستكون شيئًا مصنّعًا.' },
          { t: 'note', text: '**{underReview} من أصل {total} صورة على هذا الموقع موسومة حاليًّا بـ«صورة جديدة قادمة».** راجعنا الكتالوج مقابل أوصافه فوجدنا صورًا لا تمثّل الشجرة التي تجلس عليها — صبّار برميلي على إدراج لصبّار عمودي، ونخلة ريشية على إدراج لنخلة مروحية. وبدل تركها بصمت، وُسمت كل واحدة على بطاقتها وعلى صفحتها ريثما تُلتقط بدائلها. وتلك الإدراجات بضاعة حقيقية؛ الصورة وحدها هي موضع الشك.' },
          { t: 'p', text: 'وتُقدَّم صور الشجرة الفعلية مع عرض السعر، قبل الالتزام بأي شيء. وهي الصور التي يُبنى عليها القرار.' },
        ],
      },
      {
        id: 'sizes',
        heading: 'الارتفاعات والامتدادات وأحجام الأصص',
        body: [
          { t: 'p', text: 'الأحجام على هذا الموقع تصف **الدرجة** — النطاق الذي تُباع فيه الشجرة — لا قياسًا أُخذ من شجرة بعينها. فالإدراج الذي يقول 3.0–4.0 م يعني أن الدرجة تضمّ أشجارًا بين هذين الارتفاعين.' },
          { t: 'p', text: 'ويُقاس الارتفاع من أعلى الكتلة الجذرية، والشجرة تواصل النموّ بين عرض السعر والتسليم. وحيث يتوقّف المخطط على بُعد محدّد — ساق خالية تحت مظلّة، أو ارتفاع تحت شرفة — فاذكر ذلك في الاستفسار، ليُقاس ويُؤكَّد على الشجرة بعينها قبل شحنها.' },
          { t: 'p', text: 'وأحجام الأصص والكتل الجذرية اسمية وتتفاوت بحسب طريقة المزارع في قلع الشجرة وتجهيزها.' },
        ],
      },
      {
        id: 'names',
        heading: 'الأسماء النباتية والشائعة',
        body: [
          { t: 'p', text: 'نستخدم الأسماء التي يستخدمها القطاع، وهي ليست دائمًا الأسماء التي يستخدمها عالِم النبات. والأسماء الشائعة على وجه الخصوص إقليمية ومتداخلة. فإن كانت المواصفة تتوقّف على الهوية — لموافقة تنسيق مواقع، أو مناقصة، أو جدول نباتات — فاذكر الاسم النباتي في استفسارك وسنؤكّد كتابةً ما يُورَّد مقابله.' },
          { t: 'p', text: 'ولا تُترجَم الأسماء النباتية في أي موضع من هذا الموقع. فـ*Olea europaea* هي *Olea europaea* بكل لغة، وهذا هو جوهر التسمية الثنائية؛ والصفحة التي تترجمها تدعو الخطأ إلى جدول نباتات.' },
        ],
      },
      {
        id: 'advice',
        heading: 'الإرشادات الزراعية وإرشادات الزراعة',
        body: [
          { t: 'p', text: 'الملاحظات على هذا الموقع، وكل ما في المدوّنة، إرشادات عامة لظروف الإمارات. وهي ليست استشارة بشأن موقعك أنت.' },
          { t: 'p', text: 'فالتربة والملوحة وجودة ماء الري والصرف والتعرّض للرياح والحرارة المنعكسة عن جدار والشهر الذي تزرع فيه، كلها تغيّر الجواب، ولا يمكن معرفة أيٍّ منها من هنا. وحيث تكون النتيجة مهمّة، فليعاين الموقعَ أحد — ونحن منهم، إن كانت الزراعة ضمن النطاق.' },
          { t: 'p', text: 'ولا شيء على هذا الموقع استشارة بستنية أو زراعية أو قانونية أو مالية يُعتمد عليها دون مطابقتها بظروفك.' },
        ],
      },
      {
        id: 'availability',
        heading: 'التوفّر والسعر',
        body: [
          { t: 'p', text: 'ظهور شجرة في الكتالوج لا يعني توفّرها اليوم. فالكتالوج يسجّل ما نورّده؛ والتوفّر يتحرّك مع كل شحنة ومع موسم القلع في إيطاليا.' },
          { t: 'p', text: '**لا يُنشر أي سعر على هذا الموقع.** وأي رقم قيل لك إن الشجرة تكلّفه، ولم يأتِ من عرض سعر مكتوب صادر عنّا، لم يأتِ منّا. فالأسعار تتوقّف على الدرجة والكمية والنطاق وشحن تلك الشحنة، وعرض السعر هو المستند الوحيد الذي يلزم أيًّا منّا.' },
          { t: 'p', text: 'ومُهَل التنفيذ المذكورة على هذا الموقع معتادة لا موعودة. أما الموعود فهو في [شروط البيع](/terms-of-sale).' },
        ],
      },
      {
        id: 'external',
        heading: 'الروابط والأطراف الأخرى',
        body: [
          { t: 'p', text: 'حين نضع رابطًا إلى مشتل أو جهة رسمية أو معيار، فتلك إشارة لا تزكية، ولا نتحكّم بما في الطرف الآخر منها. فتحقّق من مصدره من أي شيء تنوي الاعتماد عليه.' },
        ],
      },
      {
        id: 'translations',
        heading: 'الصفحات المترجَمة',
        body: [
          { t: 'p', text: 'يُنشر هذا الموقع بالإنجليزية والعربية والإيطالية. والصفحتان العربية والإيطالية ترجمتان عن الإنجليزية، مقدَّمتان ليُقرأ الموقع لا ليُفكّك، وهما مراجَعتان لا منتَجتان آليًّا.' },
          { t: 'p', text: 'وحيث تختلف الترجمة عن الإنجليزية، فالإنجليزية هي النسخة التي كُتبت وروجعت، وهي التي يُعتدّ بها — صراحةً في الصفحات القانونية، وواقعًا في كل ما عداها. أما القياسات والمراجع والأسماء النباتية فمتطابقة في اللغات الثلاث؛ فإن وجدت واحدة ليست كذلك، فذلك عيب ونودّ أن نسمع به.' },
        ],
      },
      {
        id: 'accuracy',
        heading: 'إبقاء هذا الموقع دقيقًا',
        body: [
          { t: 'p', text: 'نصحّح ما نجده. وتوجد هذه الصفحة لأن البديل — جملة عامة تقول إنه لا يمكن الاعتماد على شيء هنا — لا يخبرك بشيء مفيد عن الأجزاء التي ينبغي التحقّق منها.' },
          { t: 'p', text: 'فإن كان شيء على هذا الموقع خاطئًا، أخبرنا. فالشجرة الموصوفة وصفًا خاطئًا عيبٌ في كتالوجنا، ونفضّل سماعه منك على بقائه كما هو.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'related',
        heading: 'ما لا تغطّيه هذه الصفحة',
        body: [
          { t: 'p', text: 'إخلاء المسؤولية هذا يتعلق بالمعلومات على الموقع. أما ما ندين لك به عن شجرة بعناها لك فعلًا فهو في [شروط البيع](/terms-of-sale)، وما يحدث حين تصل خاطئة أو تفشل فهو في [سياسة الاستبدال والاسترجاع](/refunds). ولا شيء هنا يُخلي المسؤولية عن أيٍّ منهما.' },
          { t: 'p', text: 'تخضع هذه الصفحة لقوانين دولة الإمارات العربية المتحدة كما تُطبَّق في {city}. وهي منشورة بالإنجليزية والعربية والإيطالية، وعند الاختلاف يُعتدّ بالنص الإنجليزي.' },
        ],
      },
    ],
  },

  it: {
    slug: 'disclaimer',
    title: 'Esclusione di responsabilità',
    metaTitle: 'Esclusione di responsabilità',
    metaDescription:
      'Che cosa significano le fotografie, le misure, i nomi e le note colturali di questo sito, e che cosa non promettono.',
    cardLine: 'Che cosa significano fotografie, misure e note colturali — e che cosa non promettono.',
    cardNote: 'Dove passa la linea.',
    summary:
      'Tutto qui serve ad aiutarvi a specificare un albero con precisione. Nulla di ciò è una misura dell’esemplare che riceverete, e questa pagina dice esattamente dove passa la linea.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'photographs',
        heading: 'Le fotografie',
        body: [
          { t: 'p', text: 'Una fotografia di catalogo mostra il **tipo e la categoria** di esemplare a cui una scheda si riferisce. Non è la fotografia dell’albero che vi sarà consegnato, perché quell’albero non è ancora stato selezionato: viene scelto in vivaio sul vostro ordine.' },
          { t: 'p', text: 'Il materiale vivo varia. Due olivi della stessa età, categoria e prezzo differiranno per chioma, carattere del tronco e forma esatta della testa. Quella variazione è proprio ciò che si compra; un albero identico a una fotografia sarebbe un oggetto fabbricato.' },
          { t: 'note', text: '**{underReview} delle {total} fotografie di questo sito sono attualmente contrassegnate “nuova fotografia in arrivo”.** Abbiamo confrontato il catalogo con le sue stesse descrizioni e trovato immagini che non rappresentano l’esemplare su cui stanno — un cactus a barile su una scheda di uno colonnare, una palma pennata su una scheda di una palma a ventaglio. Anziché lasciarle lì in silenzio, ciascuna è segnalata sulla scheda e sulla pagina mentre si scattano le sostitutive. Quelle schede sono materiale reale; solo l’immagine è in dubbio.' },
          { t: 'p', text: 'Le fotografie dell’esemplare effettivo vengono fornite con il preventivo, prima di qualunque impegno. Sono quelle su cui decidere.' },
        ],
      },
      {
        id: 'sizes',
        heading: 'Altezze, chiome e misure dei vasi',
        body: [
          { t: 'p', text: 'Le misure su questo sito descrivono la **categoria** — la fascia in cui un esemplare è venduto — non una misura presa su un singolo albero. Una scheda che dice 3,0–4,0 m significa che la categoria contiene alberi fra quelle altezze.' },
          { t: 'p', text: 'L’altezza si misura dalla sommità della zolla, e un albero continua a crescere fra il preventivo e la consegna. Dove un progetto dipende da una quota esatta — un fusto libero sotto una chioma, un’altezza sotto un balcone — indicatelo nella richiesta e sarà misurata e confermata sull’esemplare specifico prima della spedizione.' },
          { t: 'p', text: 'Le misure di vaso e zolla sono nominali e variano con il modo in cui il produttore ha espiantato e preparato l’albero.' },
        ],
      },
      {
        id: 'names',
        heading: 'Nomi botanici e nomi comuni',
        body: [
          { t: 'p', text: 'Usiamo i nomi che usa il settore, che non sempre sono quelli che userebbe un botanico. I nomi comuni in particolare sono regionali e si sovrappongono. Se una specifica dipende dall’identità — per un’autorizzazione paesaggistica, una gara o uno schedario piante — indicate il nome botanico nella richiesta e confermeremo per iscritto che cosa viene fornito a fronte di esso.' },
          { t: 'p', text: 'I nomi botanici non sono tradotti in nessun punto di questo sito. *Olea europaea* è *Olea europaea* in ogni lingua, ed è esattamente il senso della nomenclatura binomiale; una pagina che la traducesse inviterebbe un errore dentro uno schedario piante.' },
        ],
      },
      {
        id: 'advice',
        heading: 'Note colturali e di impianto',
        body: [
          { t: 'p', text: 'Le note di questo sito, e tutto ciò che sta nel giornale, sono orientamenti generali per le condizioni degli Emirati. Non sono consulenza sul vostro cantiere.' },
          { t: 'p', text: 'Suolo, salinità, qualità dell’acqua di irrigazione, drenaggio, esposizione al vento, calore riflesso da un muro e il mese in cui si pianta cambiano tutti la risposta, e nessuno di questi elementi è conoscibile da qui. Dove il risultato conta, fate guardare il sito a qualcuno — anche a noi, se la messa a dimora rientra nell’ambito.' },
          { t: 'p', text: 'Nulla su questo sito è consulenza orticola, agronomica, legale o finanziaria su cui fare affidamento senza verificarla rispetto alle vostre circostanze.' },
        ],
      },
      {
        id: 'availability',
        heading: 'Disponibilità e prezzo',
        body: [
          { t: 'p', text: 'Il fatto che un esemplare compaia a catalogo non significa che oggi ce ne sia uno disponibile. Il catalogo registra ciò che forniamo; la disponibilità si muove con ogni spedizione e con la stagione di espianto in Italia.' },
          { t: 'p', text: '**Su questo sito non è pubblicato alcun prezzo.** Qualunque cifra vi sia stata detta per un albero, se non proviene da un preventivo scritto emesso da noi, non viene da noi. I prezzi dipendono da categoria, quantità, ambito e nolo di quella spedizione, e il preventivo è l’unico documento che vincola l’uno o l’altro.' },
          { t: 'p', text: 'I tempi indicati su questo sito sono tipici, non promessi. Ciò che è promesso sta nelle [condizioni di vendita](/terms-of-sale).' },
        ],
      },
      {
        id: 'external',
        heading: 'Collegamenti e terzi',
        body: [
          { t: 'p', text: 'Dove rimandiamo a un vivaio, a un’autorità o a uno standard, si tratta di un’indicazione e non di un’approvazione, e non controlliamo che cosa ci sia dall’altra parte. Verificate alla fonte tutto ciò su cui intendete fare affidamento.' },
        ],
      },
      {
        id: 'translations',
        heading: 'Le pagine tradotte',
        body: [
          { t: 'p', text: 'Questo sito è pubblicato in inglese, arabo e italiano. Le pagine in arabo e in italiano sono traduzioni dall’inglese, fornite perché il sito si possa leggere e non decifrare, e sono verificate anziché prodotte automaticamente.' },
          { t: 'p', text: 'Dove una traduzione e l’inglese divergono, l’inglese è la versione redatta e verificata ed è quella che prevale — esplicitamente nelle pagine legali, e di fatto in tutte le altre. Misure, riferimenti e nomi botanici sono identici in tutte e tre; se ne trovate uno che non lo è, è un difetto e ci farebbe piacere saperlo.' },
        ],
      },
      {
        id: 'accuracy',
        heading: 'Tenere accurato questo sito',
        body: [
          { t: 'p', text: 'Correggiamo ciò che troviamo. Questa pagina esiste perché l’alternativa — una frase generica che dica che nulla qui è affidabile — non vi dice nulla di utile su quali parti verificare.' },
          { t: 'p', text: 'Se qualcosa su questo sito è sbagliato, ditecelo. Un esemplare descritto male è un difetto del nostro catalogo, e preferiamo saperlo da voi che lasciarlo lì.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'related',
        heading: 'Che cosa questa pagina non copre',
        body: [
          { t: 'p', text: 'Questa esclusione riguarda le informazioni del sito. Che cosa vi dobbiamo per un albero che vi abbiamo davvero venduto sta nelle [condizioni di vendita](/terms-of-sale), e che cosa succede quando ne arriva uno sbagliato o non attecchisce sta nella [politica di sostituzioni e rimborsi](/refunds). Nessuna delle due è esclusa da quanto scritto qui.' },
          { t: 'p', text: 'Questa pagina è regolata dalle leggi degli Emirati Arabi Uniti come applicate a {city}. È pubblicata in inglese, arabo e italiano, e in caso di difformità prevale l’inglese.' },
        ],
      },
    ],
  },
};
