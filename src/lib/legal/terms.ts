import type { LegalSet } from './types';

/**
 * Terms of use — the website, not the sale.
 *
 * Added on the way here: reporting a security problem, an accessibility
 * commitment that names a standard rather than gesturing at one, the four
 * boilerplate clauses whose absence is only noticed in the argument they were
 * meant to prevent (severability, entire agreement, no waiver, assignment),
 * third-party names and marks, and the language clause.
 */
export const terms: LegalSet = {
  en: {
    slug: 'terms',
    title: 'Terms of use',
    metaTitle: 'Terms of use',
    metaDescription:
      'The terms on which this website may be used: what the catalogue is, what it is not, what you may do with what is on it, and the law that governs it.',
    cardLine: 'The terms on which this website may be used, and what you may do with what is on it.',
    cardNote: 'About the site, not about buying.',
    summary:
      'These govern the use of this website. The terms that govern buying a tree from us are separate, and they are on the [terms of sale](/terms-of-sale).',
    updatedOn: '2026-09-17',
    sections: [
      { id: 'who', heading: 'Whose site this is', body: [{ t: 'contact' }] },
      {
        id: 'agreement',
        heading: 'Using the site means accepting these terms',
        body: [
          { t: 'p', text: 'By browsing this website you accept these terms. If you do not accept them, the remedy is simple and costs nothing: stop using the site. Nothing here restricts a right you have under UAE law that cannot be given away by agreement.' },
          { t: 'p', text: 'If you are using this site for a company, you are confirming that you are allowed to accept these terms on its behalf, and they bind it as well as you.' },
        ],
      },
      {
        id: 'catalogue',
        heading: 'What the catalogue is, and is not',
        body: [
          { t: 'p', text: 'The catalogue is a record of the kinds of specimen we supply and the sizes they are usually available in. **It is not an offer to sell, and nothing on it is a contract.** No price is published on this site; every specimen is quoted individually, because availability, size and the cost of getting a tree here change with each consignment.' },
          { t: 'p', text: 'A sale begins when we issue a written quotation and you accept it. Until then, an enquiry is a question and our reply is an answer to it.' },
          { t: 'p', text: 'Living stock is not manufactured. Two olives of the same age and grade are not the same tree, and the specimen you receive will not be identical to a photograph. What that means in practice is set out on the [disclaimer](/disclaimer).' },
        ],
      },
      {
        id: 'enquiries',
        heading: 'Enquiries you send us',
        body: [
          { t: 'p', text: 'Send us accurate details. A delivery quoted against the wrong emirate, the wrong access or the wrong quantity is a delivery that has to be re-quoted, and on a live tree that costs time nobody has.' },
          { t: 'p', text: 'You agree not to use the forms on this site to:' },
          { t: 'ul', items: [
            'Send anything unlawful, abusive or deliberately false',
            'Impersonate somebody else or a company you do not represent',
            'Send automated or bulk submissions, or anything designed to overload the site',
            'Send us marketing. We did not ask for any',
            'Attempt to interfere with the site, its security or the data of anybody else using it',
          ] },
          { t: 'p', text: 'We reject submissions that appear automated. That protection counts requests rather than reading them, so on a rare occasion it may delay a genuine enquiry — if a form will not send, tell us and we will take the details directly.' },
        ],
      },
      {
        id: 'content',
        heading: 'What is on the site, and who owns it',
        body: [
          { t: 'p', text: 'The text, photographs, specifications, articles and the design of this site belong to {legalName} or to whoever licensed them to us. The name, the mark and the lockup are ours.' },
          { t: 'p', text: 'You may, without asking:' },
          { t: 'ul', items: [
            'Read, print and save pages for your own use or your project’s',
            'Put a specimen page or a collection into a specification, a tender or a presentation for a client',
            'Link to any page here from anywhere',
          ] },
          { t: 'p', text: 'You may not, without written permission:' },
          { t: 'ul', items: [
            'Republish the catalogue, or a substantial part of it, as your own',
            'Use our photographs in your own marketing or product listings',
            'Scrape or systematically copy the site, by any means, including for the training of a machine-learning model',
            'Present our stock as yours, or imply an agency or a partnership that does not exist',
          ] },
          { t: 'p', text: 'Botanical names are nobody’s property. Nothing here stops you using them.' },
          { t: 'p', text: 'Where the name or mark of another company appears on this site — a grower, a carrier, a certification body, a supplier of the software this site runs on — it belongs to them and is used to say who they are, not to suggest that they endorse us.' },
        ],
      },
      {
        id: 'availability',
        heading: 'Availability of the site',
        body: [
          { t: 'p', text: 'We try to keep this site up, and we do not promise that it always will be. It may be unavailable for maintenance, for a deployment, or because something upstream of us has failed. We may change, move or withdraw any page without notice. An enquiry that does not send because the site was down is not an enquiry we received — if it matters, send it again.' },
          { t: 'p', text: 'We are not in breach of these terms because of something genuinely beyond our control: a failure at our hosting, database or network providers, a general internet or power failure, an act of government, or a natural event. This clause is about the website. What it means for an order is on the [terms of sale](/terms-of-sale), and it is narrower there.' },
        ],
      },
      {
        id: 'accessibility',
        heading: 'Accessibility',
        body: [
          { t: 'p', text: 'This site is built to meet **WCAG 2.2 level AA**: it can be operated from a keyboard alone, it carries text alternatives for its photographs, its colour contrast is measured rather than assumed, and it is tested at phone width with a touch pointer. Those checks run against every page before anything is published.' },
          { t: 'p', text: 'We do not claim it is perfect. If something on this site is unusable with the assistive technology you use, tell us through the [enquiry form](/quote) and we will fix it — and in the meantime we will give you the same information another way, by telephone or by email, at no disadvantage to you.' },
        ],
      },
      {
        id: 'security',
        heading: 'Reporting a security problem',
        body: [
          { t: 'p', text: 'If you find a vulnerability in this site, tell us through the [enquiry form](/quote) with enough detail to reproduce it. We will acknowledge it within two working days and keep you informed until it is closed.' },
          { t: 'p', text: 'We will not pursue anybody who reports a problem in good faith, who stops at the point of proving it exists, and who does not access, alter or publish anybody else’s data. Testing that degrades the service for other people — flooding, denial of service, automated scanning at volume — is outside that, because it takes the site away from the people trying to use it.' },
        ],
      },
      {
        id: 'links',
        heading: 'Links to other sites',
        body: [
          { t: 'p', text: 'Where we link to somebody else — a grower, an authority, a standard — the link is a pointer, not an endorsement, and what is on the other end is not ours to control or to answer for. Check anything you intend to rely on at its source.' },
        ],
      },
      {
        id: 'liability',
        heading: 'Our responsibility for the site itself',
        body: [
          { t: 'p', text: 'Information on this site is given in good faith and for general guidance. Heights, spreads and pot sizes are indicative of the grade, not measurements of the specimen you will receive, and growing advice here is not a substitute for somebody looking at your actual site, soil and irrigation.' },
          { t: 'p', text: 'To the extent the law allows, we are not liable for loss arising from relying on general information on this website, or from the site being unavailable. This does not limit our responsibility for the trees we actually sell you — that is on the [terms of sale](/terms-of-sale), and it is a real responsibility, not a disclaimed one.' },
          { t: 'p', text: 'Nothing here excludes liability for death or personal injury caused by our negligence, or for fraud. No wording can, and we would not want it to.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'Complaints about the site',
        body: [
          { t: 'p', text: 'Something wrong, misleading or broken on this site is a defect in our catalogue and we would rather hear it from you than leave it there. Send it through the [enquiry form](/quote), naming the page. We answer within two working days and tell you what we are doing about it.' },
          { t: 'p', text: 'A complaint about an order, a delivery or a tree is not this page. It goes to the [replacements and refunds policy](/refunds), which sets out the windows and what we do.' },
        ],
      },
      {
        id: 'general',
        heading: 'The rest of it',
        body: [
          { t: 'dl', items: [
            { term: 'If one clause fails', def: 'The rest still stands. A clause a court will not enforce is read down to what it will enforce, or struck out, and nothing else on the page falls with it.' },
            { term: 'Not enforcing something is not giving it up', def: 'If we do not insist on a term on one occasion, we have not waived it and may insist on it later.' },
            { term: 'This is the whole of it', def: 'These terms are the entire agreement about the use of this website, and they replace anything said about it beforehand. They do not replace or limit the [terms of sale](/terms-of-sale), which govern an order.' },
            { term: 'Handing the agreement on', def: 'You may not transfer your rights under these terms to somebody else without our written agreement. We may transfer ours to a company that takes over this business, and if we do, everything here continues to apply unchanged.' },
            { term: 'Other people', def: 'These terms are between you and us. Nobody else acquires a right to enforce them.' },
          ] },
        ],
      },
      {
        id: 'law',
        heading: 'Governing law and language',
        body: [
          { t: 'p', text: 'These terms are governed by the laws of the United Arab Emirates as applied in {city}, and the courts of {city} have jurisdiction over any dispute arising from them.' },
          { t: 'p', text: 'This page is published in English, Arabic and Italian. The English text is the one that was written and reviewed; the other two are provided so that it can be read. Where they differ, the English governs.' },
        ],
      },
      {
        id: 'changes',
        heading: 'Changes to these terms',
        body: [
          { t: 'p', text: 'We may revise these terms. The version that applies to your use of the site is the one published when you use it, and the date at the top says which that is. Terms that apply to an order are fixed when the quotation is accepted and do not change under it afterwards.' },
        ],
      },
    ],
  },

  ar: {
    slug: 'terms',
    title: 'شروط الاستخدام',
    metaTitle: 'شروط الاستخدام',
    metaDescription:
      'الشروط التي يجوز بموجبها استخدام هذا الموقع: ما هو الكتالوج وما ليس به، وما الذي يجوز لك فعله بما فيه، والقانون الذي يحكمه.',
    cardLine: 'الشروط التي يجوز بموجبها استخدام هذا الموقع، وما الذي يجوز لك فعله بما فيه.',
    cardNote: 'عن الموقع، لا عن الشراء.',
    summary:
      'تحكم هذه الشروط استخدام هذا الموقع. أما الشروط التي تحكم شراء شجرة منّا فمنفصلة، وتجدها في [شروط البيع](/terms-of-sale).',
    updatedOn: '2026-09-17',
    sections: [
      { id: 'who', heading: 'لمن هذا الموقع', body: [{ t: 'contact' }] },
      {
        id: 'agreement',
        heading: 'استخدام الموقع يعني قبول هذه الشروط',
        body: [
          { t: 'p', text: 'بتصفّحك هذا الموقع فإنك تقبل هذه الشروط. وإن لم تقبلها، فالحلّ بسيط ولا يكلّف شيئًا: توقّف عن استخدام الموقع. ولا شيء هنا يقيّد حقًّا يمنحك إياه القانون الإماراتي ولا يجوز التنازل عنه بالاتفاق.' },
          { t: 'p', text: 'وإن كنت تستخدم هذا الموقع لحساب شركة، فأنت تؤكّد أنك مخوّل بقبول هذه الشروط نيابةً عنها، وأنها تلزمها كما تلزمك.' },
        ],
      },
      {
        id: 'catalogue',
        heading: 'ما هو الكتالوج، وما ليس به',
        body: [
          { t: 'p', text: 'الكتالوج سجلّ لأنواع الأشجار التي نورّدها والأحجام التي تتوفّر بها عادةً. **وهو ليس عرضًا للبيع، ولا شيء فيه يشكّل عقدًا.** لا يُنشر أي سعر على هذا الموقع؛ فكل شجرة تُسعَّر على حدة، لأن التوفّر والحجم وكلفة إيصال الشجرة إلى هنا تتغيّر مع كل شحنة.' },
          { t: 'p', text: 'يبدأ البيع حين نُصدر عرض سعر مكتوبًا وتقبله أنت. وقبل ذلك، الاستفسار سؤال وردّنا عليه جواب.' },
          { t: 'p', text: 'الشجرة الحيّة ليست منتجًا مصنّعًا. فزيتونتان من العمر والدرجة نفسيهما ليستا الشجرة نفسها، والشجرة التي تصلك لن تكون مطابقة لصورة. وما يعنيه ذلك عمليًّا موضّح في [إخلاء المسؤولية](/disclaimer).' },
        ],
      },
      {
        id: 'enquiries',
        heading: 'الاستفسارات التي ترسلها إلينا',
        body: [
          { t: 'p', text: 'أرسل إلينا تفاصيل دقيقة. فالتسليم المسعَّر على إمارة خاطئة أو مدخل خاطئ أو كمية خاطئة هو تسليم يجب إعادة تسعيره، وذلك مع شجرة حيّة يكلّف وقتًا لا يملكه أحد.' },
          { t: 'p', text: 'وأنت توافق على ألّا تستخدم نماذج هذا الموقع لـ:' },
          { t: 'ul', items: [
            'إرسال أي شيء غير مشروع أو مسيء أو كاذب عن قصد',
            'انتحال شخصية أحد أو صفة شركة لا تمثّلها',
            'إرسال بيانات آلية أو بالجملة، أو أي شيء مصمَّم لإثقال الموقع',
            'إرسال مواد تسويقية إلينا. فنحن لم نطلبها',
            'محاولة العبث بالموقع أو بأمانه أو ببيانات أي مستخدم آخر',
          ] },
          { t: 'p', text: 'نرفض الإرسالات التي تبدو آلية. وهذه الحماية تحصي الطلبات ولا تقرأها، فقد تؤخّر في حالات نادرة استفسارًا حقيقيًّا — فإن تعذّر إرسال النموذج، أخبرنا وسنأخذ التفاصيل مباشرة.' },
        ],
      },
      {
        id: 'content',
        heading: 'ما على الموقع، ولمن يعود',
        body: [
          { t: 'p', text: 'النصوص والصور والمواصفات والمقالات وتصميم هذا الموقع تعود إلى {legalName} أو إلى من رخّصها لنا. والاسم والعلامة وشكلها المركّب ملكنا.' },
          { t: 'p', text: 'يجوز لك، دون استئذان:' },
          { t: 'ul', items: [
            'قراءة الصفحات وطباعتها وحفظها لاستخدامك أو لاستخدام مشروعك',
            'إدراج صفحة شجرة أو مجموعة ضمن مواصفة أو مناقصة أو عرض تقديمي لعميل',
            'الربط إلى أي صفحة هنا من أي مكان',
          ] },
          { t: 'p', text: 'ولا يجوز لك، دون إذن كتابي:' },
          { t: 'ul', items: [
            'إعادة نشر الكتالوج، أو جزء جوهري منه، باسمك',
            'استخدام صورنا في تسويقك أو في قوائم منتجاتك',
            'كشط الموقع أو نسخه بشكل منهجي بأي وسيلة، بما في ذلك لتدريب نموذج تعلّم آلي',
            'تقديم بضاعتنا على أنها بضاعتك، أو الإيحاء بوكالة أو شراكة غير قائمة',
          ] },
          { t: 'p', text: 'الأسماء النباتية ليست ملكًا لأحد. ولا شيء هنا يمنعك من استخدامها.' },
          { t: 'p', text: 'وحيثما ظهر اسم شركة أخرى أو علامتها على هذا الموقع — مشتل، أو ناقل، أو جهة اعتماد، أو مزوّد للبرمجيات التي يعمل عليها الموقع — فهي تعود إليها وتُستخدم للتعريف بها، لا للإيحاء بأنها تزكّينا.' },
        ],
      },
      {
        id: 'availability',
        heading: 'إتاحة الموقع',
        body: [
          { t: 'p', text: 'نحرص على إبقاء هذا الموقع متاحًا، ولا نعدك بأنه سيبقى كذلك دائمًا. فقد يتعذّر الوصول إليه للصيانة أو للنشر أو بسبب عطل لدى جهة أعلى منّا. وقد نغيّر أي صفحة أو ننقلها أو نسحبها دون إشعار. والاستفسار الذي لم يُرسل لأن الموقع كان متوقفًا ليس استفسارًا وصلنا — فإن كان مهمًّا، أعد إرساله.' },
          { t: 'p', text: 'ولا نُعدّ مخلّين بهذه الشروط بسبب أمر خارج عن إرادتنا فعلًا: عطل لدى مزوّدي الاستضافة أو قاعدة البيانات أو الشبكة، أو انقطاع عام للإنترنت أو الكهرباء، أو إجراء حكومي، أو حدث طبيعي. وهذا البند عن الموقع. أما ما يعنيه بالنسبة إلى طلب فموضّح في [شروط البيع](/terms-of-sale)، وهو هناك أضيق.' },
        ],
      },
      {
        id: 'accessibility',
        heading: 'إتاحة الوصول',
        body: [
          { t: 'p', text: 'بُني هذا الموقع ليستوفي **المستوى AA من معيار WCAG 2.2**: يمكن تشغيله بلوحة المفاتيح وحدها، ويحمل بدائل نصية لصوره، وتُقاس فيه نسب تباين الألوان بدل افتراضها، ويُختبر بعرض شاشة هاتف بمؤشّر لمسي. وتُجرى هذه الفحوص على كل صفحة قبل أي نشر.' },
          { t: 'p', text: 'ولا ندّعي أنه مثالي. فإن كان شيء على هذا الموقع غير قابل للاستخدام بالتقنية المساعِدة التي تستعملها، أخبرنا عبر [نموذج الاستفسار](/quote) وسنصلحه — وفي الأثناء سنوصل إليك المعلومات نفسها بطريقة أخرى، هاتفًا أو بريدًا، دون أي انتقاص من حقك.' },
        ],
      },
      {
        id: 'security',
        heading: 'الإبلاغ عن خلل أمني',
        body: [
          { t: 'p', text: 'إن وجدت ثغرة في هذا الموقع، أخبرنا عبر [نموذج الاستفسار](/quote) بتفاصيل تكفي لإعادة إظهارها. سنُقرّ باستلام البلاغ خلال يومَي عمل ونُبقيك على اطّلاع حتى إغلاقه.' },
          { t: 'p', text: 'ولن نلاحق من يبلّغ عن خلل بحسن نيّة، ويتوقف عند حدّ إثبات وجوده، ولا يطّلع على بيانات غيره ولا يعدّلها ولا ينشرها. أما الاختبار الذي يعطّل الخدمة على الآخرين — الإغراق، وحجب الخدمة، والمسح الآلي بكثافة — فخارج ذلك، لأنه يسلب الموقع ممن يحاولون استخدامه.' },
        ],
      },
      {
        id: 'links',
        heading: 'الروابط إلى مواقع أخرى',
        body: [
          { t: 'p', text: 'حين نضع رابطًا إلى جهة أخرى — مشتل، أو جهة رسمية، أو معيار — فالرابط إشارة لا تزكية، وما في الطرف الآخر ليس ملكنا ولا تحت سيطرتنا ولا نسأل عنه. فتحقّق من مصدره من أي شيء تنوي الاعتماد عليه.' },
        ],
      },
      {
        id: 'liability',
        heading: 'مسؤوليتنا عن الموقع نفسه',
        body: [
          { t: 'p', text: 'تُقدَّم المعلومات على هذا الموقع بحسن نيّة وعلى سبيل الإرشاد العام. والارتفاعات والامتدادات وأحجام الأصص مؤشّرة على الدرجة، لا قياسات للشجرة التي ستصلك، والإرشادات الزراعية هنا ليست بديلًا عن معاينة موقعك وتربتك ورَيّك فعليًّا.' },
          { t: 'p', text: 'وبالقدر الذي يجيزه القانون، لسنا مسؤولين عن خسارة ناشئة عن الاعتماد على معلومات عامة في هذا الموقع، أو عن عدم إتاحته. ولا يحدّ ذلك من مسؤوليتنا عن الأشجار التي نبيعها لك فعلًا — فتلك في [شروط البيع](/terms-of-sale)، وهي مسؤولية حقيقية لا مُخلاة.' },
          { t: 'p', text: 'ولا شيء هنا يستبعد المسؤولية عن الوفاة أو الإصابة الجسدية الناجمة عن إهمالنا، أو عن الغش. فلا صياغة تستطيع ذلك، ولا نريدها أن تستطيع.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'الشكاوى المتعلقة بالموقع',
        body: [
          { t: 'p', text: 'أي شيء خاطئ أو مضلّل أو معطّل على هذا الموقع هو عيب في كتالوجنا، ونفضّل أن نسمعه منك على أن يبقى كما هو. أرسله عبر [نموذج الاستفسار](/quote) مع ذكر الصفحة. نردّ خلال يومَي عمل ونخبرك بما نفعله بشأنه.' },
          { t: 'p', text: 'أما الشكوى المتعلقة بطلب أو تسليم أو شجرة فليست هذه الصفحة. مكانها [سياسة الاستبدال والاسترجاع](/refunds)، التي تبيّن المُهَل وما نفعله.' },
        ],
      },
      {
        id: 'general',
        heading: 'ما تبقّى',
        body: [
          { t: 'dl', items: [
            { term: 'إن سقط بند', def: 'يبقى الباقي قائمًا. فالبند الذي لا تُنفّذه المحكمة يُقرأ في أضيق حدّ تنفّذه فيه، أو يُشطب، ولا يسقط معه شيء آخر في الصفحة.' },
            { term: 'عدم المطالبة ليس تنازلًا', def: 'إن لم نتمسّك بشرط في مناسبة، فلم نتنازل عنه، ويجوز لنا التمسّك به لاحقًا.' },
            { term: 'هذا هو الاتفاق كاملًا', def: 'هذه الشروط هي كامل الاتفاق بشأن استخدام هذا الموقع، وتحلّ محلّ أي شيء قيل عنه قبلها. ولا تحلّ محلّ [شروط البيع](/terms-of-sale) التي تحكم الطلب ولا تحدّ منها.' },
            { term: 'إحالة الاتفاق', def: 'لا يجوز لك نقل حقوقك بموجب هذه الشروط إلى غيرك دون موافقتنا الكتابية. ويجوز لنا نقل حقوقنا إلى شركة تتولّى هذا النشاط، وإن فعلنا، يبقى كل ما هنا ساريًا دون تغيير.' },
            { term: 'الغير', def: 'هذه الشروط بيننا وبينك. ولا يكتسب أي طرف آخر حقًّا في المطالبة بتنفيذها.' },
          ] },
        ],
      },
      {
        id: 'law',
        heading: 'القانون الواجب التطبيق واللغة',
        body: [
          { t: 'p', text: 'تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة كما تُطبَّق في {city}، وتختصّ محاكم {city} بأي نزاع ينشأ عنها.' },
          { t: 'p', text: 'تُنشر هذه الصفحة بالإنجليزية والعربية والإيطالية. والنص الإنجليزي هو النص الذي كُتب وروجع؛ أما النصّان الآخران فمقدَّمان ليُقرأ. وعند الاختلاف، يُعتدّ بالنص الإنجليزي.' },
        ],
      },
      {
        id: 'changes',
        heading: 'تعديلات هذه الشروط',
        body: [
          { t: 'p', text: 'قد نعدّل هذه الشروط. والنسخة التي تنطبق على استخدامك للموقع هي المنشورة وقت استخدامك له، والتاريخ في الأعلى يبيّن أيّها. أما الشروط التي تنطبق على طلب فتُثبَّت عند قبول عرض السعر ولا تتغيّر عليه بعد ذلك.' },
        ],
      },
    ],
  },

  it: {
    slug: 'terms',
    title: 'Termini di utilizzo',
    metaTitle: 'Termini di utilizzo',
    metaDescription:
      'I termini a cui questo sito può essere usato: che cos’è il catalogo, che cosa non è, che cosa potete fare con ciò che contiene e quale legge lo regola.',
    cardLine: 'I termini a cui questo sito può essere usato e che cosa potete fare con ciò che contiene.',
    cardNote: 'Riguarda il sito, non l’acquisto.',
    summary:
      'Questi termini regolano l’uso di questo sito. I termini che regolano l’acquisto di un albero da noi sono separati e si trovano nelle [condizioni di vendita](/terms-of-sale).',
    updatedOn: '2026-09-17',
    sections: [
      { id: 'who', heading: 'Di chi è questo sito', body: [{ t: 'contact' }] },
      {
        id: 'agreement',
        heading: 'Usare il sito significa accettare questi termini',
        body: [
          { t: 'p', text: 'Navigando questo sito accettate questi termini. Se non li accettate, il rimedio è semplice e non costa nulla: smettete di usarlo. Nulla di quanto segue limita un diritto che la legge emiratina vi riconosce e a cui non si può rinunciare per accordo.' },
          { t: 'p', text: 'Se usate questo sito per conto di un’azienda, confermate di essere autorizzati ad accettare questi termini per suo conto, e questi vincolano lei oltre a voi.' },
        ],
      },
      {
        id: 'catalogue',
        heading: 'Che cos’è il catalogo, e che cosa non è',
        body: [
          { t: 'p', text: 'Il catalogo è il registro dei tipi di esemplare che forniamo e delle misure in cui di solito sono disponibili. **Non è un’offerta di vendita e nulla di ciò che contiene è un contratto.** Su questo sito non è pubblicato alcun prezzo: ogni esemplare è quotato singolarmente, perché disponibilità, misura e costo per portare qui un albero cambiano a ogni spedizione.' },
          { t: 'p', text: 'Una vendita comincia quando emettiamo un preventivo scritto e voi lo accettate. Fino a quel momento una richiesta è una domanda e la nostra risposta è una risposta.' },
          { t: 'p', text: 'Il materiale vivo non è fabbricato. Due olivi della stessa età e categoria non sono lo stesso albero, e l’esemplare che riceverete non sarà identico a una fotografia. Che cosa significhi in pratica è spiegato nell’[esclusione di responsabilità](/disclaimer).' },
        ],
      },
      {
        id: 'enquiries',
        heading: 'Le richieste che ci inviate',
        body: [
          { t: 'p', text: 'Inviateci dati esatti. Una consegna quotata sull’emirato sbagliato, sull’accesso sbagliato o sulla quantità sbagliata è una consegna da riquotare, e su un albero vivo questo costa tempo che nessuno ha.' },
          { t: 'p', text: 'Vi impegnate a non usare i moduli di questo sito per:' },
          { t: 'ul', items: [
            'Inviare contenuti illeciti, offensivi o deliberatamente falsi',
            'Spacciarvi per qualcun altro o per un’azienda che non rappresentate',
            'Inviare invii automatizzati o massivi, o qualsiasi cosa concepita per sovraccaricare il sito',
            'Inviarci materiale promozionale. Non l’abbiamo chiesto',
            'Tentare di interferire con il sito, con la sua sicurezza o con i dati di chiunque altro lo usi',
          ] },
          { t: 'p', text: 'Respingiamo gli invii che sembrano automatizzati. Quella protezione conta le richieste anziché leggerle, quindi in rari casi può ritardare una richiesta genuina: se un modulo non parte, ditecelo e prenderemo i dati direttamente.' },
        ],
      },
      {
        id: 'content',
        heading: 'Che cosa c’è sul sito, e a chi appartiene',
        body: [
          { t: 'p', text: 'I testi, le fotografie, le schede tecniche, gli articoli e il design di questo sito appartengono a {legalName} o a chi ce li ha concessi in licenza. Il nome, il marchio e il logotipo sono nostri.' },
          { t: 'p', text: 'Potete, senza chiedere:' },
          { t: 'ul', items: [
            'Leggere, stampare e salvare le pagine per uso vostro o del vostro progetto',
            'Inserire la pagina di un esemplare o una collezione in un capitolato, in una gara o in una presentazione per un cliente',
            'Collegarvi a qualunque pagina di questo sito da qualsiasi luogo',
          ] },
          { t: 'p', text: 'Non potete, senza permesso scritto:' },
          { t: 'ul', items: [
            'Ripubblicare il catalogo, o una parte sostanziale di esso, come vostro',
            'Usare le nostre fotografie nel vostro marketing o nelle vostre schede prodotto',
            'Estrarre o copiare sistematicamente il sito, con qualunque mezzo, incluso l’addestramento di un modello di apprendimento automatico',
            'Presentare il nostro materiale come vostro, o lasciare intendere un rapporto di agenzia o una partnership che non esiste',
          ] },
          { t: 'p', text: 'I nomi botanici non appartengono a nessuno. Nulla qui vi impedisce di usarli.' },
          { t: 'p', text: 'Dove sul sito compare il nome o il marchio di un’altra azienda — un vivaio, un vettore, un ente di certificazione, un fornitore del software su cui gira il sito — appartiene a loro ed è usato per dire chi sono, non per suggerire che ci diano un’approvazione.' },
        ],
      },
      {
        id: 'availability',
        heading: 'Disponibilità del sito',
        body: [
          { t: 'p', text: 'Cerchiamo di tenere questo sito online e non promettiamo che lo sarà sempre. Può essere non raggiungibile per manutenzione, per un rilascio o perché qualcosa a monte di noi si è guastato. Possiamo modificare, spostare o ritirare qualsiasi pagina senza preavviso. Una richiesta che non parte perché il sito era giù non è una richiesta che abbiamo ricevuto: se è importante, inviatela di nuovo.' },
          { t: 'p', text: 'Non siamo inadempienti a questi termini per qualcosa di realmente fuori dal nostro controllo: un guasto ai nostri fornitori di hosting, database o rete, un’interruzione generale di internet o dell’energia, un atto dell’autorità, un evento naturale. Questa clausola riguarda il sito. Che cosa significhi per un ordine è nelle [condizioni di vendita](/terms-of-sale), e lì è più stretta.' },
        ],
      },
      {
        id: 'accessibility',
        heading: 'Accessibilità',
        body: [
          { t: 'p', text: 'Questo sito è costruito per soddisfare il **livello AA delle WCAG 2.2**: si può usare con la sola tastiera, porta alternative testuali per le fotografie, il contrasto cromatico è misurato anziché presunto, ed è testato a larghezza di telefono con puntatore tattile. Quei controlli girano su ogni pagina prima di ogni pubblicazione.' },
          { t: 'p', text: 'Non sosteniamo che sia perfetto. Se qualcosa su questo sito è inutilizzabile con la tecnologia assistiva che adoperate, ditecelo tramite il [modulo di richiesta](/quote) e lo correggeremo — e nel frattempo vi daremo le stesse informazioni in un altro modo, per telefono o per e-mail, senza alcuno svantaggio per voi.' },
        ],
      },
      {
        id: 'security',
        heading: 'Segnalare un problema di sicurezza',
        body: [
          { t: 'p', text: 'Se trovate una vulnerabilità in questo sito, segnalatecela tramite il [modulo di richiesta](/quote) con dettagli sufficienti a riprodurla. La riscontreremo entro due giorni lavorativi e vi terremo informati fino alla chiusura.' },
          { t: 'p', text: 'Non perseguiremo chi segnala un problema in buona fede, si ferma al punto di dimostrarne l’esistenza e non accede, altera o pubblica i dati di altri. Restano fuori i test che degradano il servizio per gli altri — flooding, negazione del servizio, scansioni automatiche massive — perché tolgono il sito a chi sta cercando di usarlo.' },
        ],
      },
      {
        id: 'links',
        heading: 'Collegamenti ad altri siti',
        body: [
          { t: 'p', text: 'Quando rimandiamo a qualcun altro — un vivaio, un’autorità, uno standard — il collegamento è un’indicazione, non un’approvazione, e ciò che sta dall’altra parte non è nostro né possiamo risponderne. Verificate alla fonte tutto ciò su cui intendete fare affidamento.' },
        ],
      },
      {
        id: 'liability',
        heading: 'La nostra responsabilità per il sito in sé',
        body: [
          { t: 'p', text: 'Le informazioni su questo sito sono fornite in buona fede e a titolo di orientamento generale. Altezze, diametri di chioma e misure dei vasi sono indicativi della categoria, non misure dell’esemplare che riceverete, e i consigli colturali qui non sostituiscono qualcuno che guardi il vostro cantiere, il vostro suolo e il vostro impianto.' },
          { t: 'p', text: 'Nei limiti consentiti dalla legge, non rispondiamo delle perdite derivanti dall’affidamento su informazioni generali di questo sito o dalla sua indisponibilità. Ciò non limita la nostra responsabilità per gli alberi che vi vendiamo davvero: quella è nelle [condizioni di vendita](/terms-of-sale), ed è una responsabilità reale, non esclusa.' },
          { t: 'p', text: 'Nulla qui esclude la responsabilità per morte o lesioni personali causate da nostra negligenza, né per dolo. Nessuna formulazione potrebbe, e non vorremmo che potesse.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'Reclami sul sito',
        body: [
          { t: 'p', text: 'Qualcosa di sbagliato, fuorviante o rotto su questo sito è un difetto del nostro catalogo, e preferiamo sentircelo dire da voi che lasciarlo lì. Inviatelo tramite il [modulo di richiesta](/quote), indicando la pagina. Rispondiamo entro due giorni lavorativi dicendovi che cosa stiamo facendo.' },
          { t: 'p', text: 'Un reclamo su un ordine, una consegna o un albero non riguarda questa pagina. Va alla [politica di sostituzioni e rimborsi](/refunds), che stabilisce i termini e che cosa facciamo.' },
        ],
      },
      {
        id: 'general',
        heading: 'Il resto',
        body: [
          { t: 'dl', items: [
            { term: 'Se una clausola cade', def: 'Il resto resta in piedi. Una clausola che un giudice non applica viene ridotta a ciò che applicherebbe, oppure eliminata, e nulla d’altro nella pagina cade con essa.' },
            { term: 'Non far valere non è rinunciare', def: 'Se in un’occasione non insistiamo su una previsione, non vi abbiamo rinunciato e potremo farla valere in seguito.' },
            { term: 'Questo è tutto', def: 'Questi termini sono l’intero accordo sull’uso di questo sito e sostituiscono quanto detto in precedenza al riguardo. Non sostituiscono né limitano le [condizioni di vendita](/terms-of-sale), che regolano un ordine.' },
            { term: 'Cessione', def: 'Non potete trasferire ad altri i vostri diritti derivanti da questi termini senza il nostro accordo scritto. Noi possiamo trasferire i nostri a una società che subentri in questa attività, e in tal caso tutto quanto qui previsto continua ad applicarsi invariato.' },
            { term: 'Terzi', def: 'Questi termini valgono fra voi e noi. Nessun altro acquisisce il diritto di farli valere.' },
          ] },
        ],
      },
      {
        id: 'law',
        heading: 'Legge applicabile e lingua',
        body: [
          { t: 'p', text: 'Questi termini sono regolati dalle leggi degli Emirati Arabi Uniti come applicate a {city}, e i tribunali di {city} sono competenti per ogni controversia che ne derivi.' },
          { t: 'p', text: 'Questa pagina è pubblicata in inglese, arabo e italiano. Il testo inglese è quello redatto e verificato; gli altri due sono forniti perché possa essere letto. In caso di difformità, prevale l’inglese.' },
        ],
      },
      {
        id: 'changes',
        heading: 'Modifiche a questi termini',
        body: [
          { t: 'p', text: 'Possiamo rivedere questi termini. La versione che si applica al vostro uso del sito è quella pubblicata nel momento in cui lo usate, e la data in alto dice quale sia. I termini che si applicano a un ordine si fissano quando il preventivo è accettato e non cambiano più sotto di esso.' },
        ],
      },
    ],
  },
};
