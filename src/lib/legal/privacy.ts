import type { LegalSet } from './types';

/**
 * The privacy policy.
 *
 * What changed when it moved here, beyond the language: it now says the things
 * it was missing. A lawful basis against each purpose rather than one sentence
 * about contracts. The address the anti-spam limiter holds in memory, which is
 * processing however briefly it lives. Where to complain when we are the
 * problem, naming the regulator rather than inviting you to write to us about
 * us. That there is no automated decision-making, which is a question the law
 * asks and a silence answers badly. And which law governs the document itself.
 */
export const privacy: LegalSet = {
  en: {
    slug: 'privacy',
    title: 'Privacy policy',
    metaTitle: 'Privacy policy',
    metaDescription:
      'What Verde Garden Trading records when you send an enquiry, the lawful basis for it, how long it is kept, who sees it, where to complain — and what this site does not do.',
    cardLine: 'What we record when you send an enquiry, how long we keep it, and who sees it.',
    cardNote: 'No cookies, no analytics, no tracking.',
    summary:
      'This site sets no cookies for visitors, runs no analytics and carries no advertising or tracking of any kind. The only personal data it holds is what you type into an enquiry form and send us.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'who',
        heading: 'Who is responsible',
        body: [
          { t: 'p', text: '{legalName} is the controller of the personal data described here, which means we decide what is collected and why, and we are the ones answerable for it.' },
          { t: 'p', text: 'We are a trading company registered in the United Arab Emirates. This policy is written against **Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data** and the sectoral rules that sit alongside it. Where you are writing to us from the European Union, we treat your request under this policy rather than turning it away — the rights below are the ones we actually honour, wherever you are.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'what',
        heading: 'What we collect, and only when you send it',
        body: [
          { t: 'p', text: 'Nothing is collected by visiting. The catalogue, the collections and every article on this site can be read without identifying yourself in any way.' },
          { t: 'p', text: 'When you send an enquiry — from the quotation form, a specimen page or a shortlist — we record exactly the fields you filled in:' },
          { t: 'ul', items: [
            'Your name, and your company if you gave one',
            'Your email address, and your telephone or WhatsApp number if you gave one',
            'The emirate, project type and scope you selected, if any',
            'The specimens you asked about and the quantities',
            'Anything you wrote in the message box',
            'Which page the enquiry came from, and your browser’s user-agent string',
            'A reference number, and the date and time it arrived',
          ] },
          { t: 'p', text: 'That is the whole list. **We do not record your IP address against an enquiry**, we do not build a profile of you, and we do not buy or append data about you from anywhere else.' },
          { t: 'p', text: 'Two things happen around a submission that are worth naming rather than leaving to be discovered. The form carries a hidden field a person never sees; if it arrives filled in, the submission was made by a script and is discarded. And the server counts recent requests in memory to stop one machine flooding the form — that count is held against whatever address the connection appears to come from, for a few minutes at most, and it is never written to the database or joined to your enquiry.' },
          { t: 'note', text: '**Your shortlist never leaves your browser.** The specimens you collect are kept in your own device’s local storage. Nothing about them reaches us until you press send on the enquiry, and if you never send one we never know you made a list. Clearing your browser data clears it.' },
        ],
      },
      {
        id: 'basis',
        heading: 'Why we are allowed to hold it',
        body: [
          { t: 'p', text: 'The law asks for a lawful basis against each purpose, not one for the business as a whole. Ours are:' },
          { t: 'dl', items: [
            { term: 'Answering your enquiry and pricing it', def: 'Steps taken at your request before a contract. You asked us for a quotation; we cannot produce one without the specification and a way to send it back to you.' },
            { term: 'Importing, delivering and invoicing an order', def: 'Performance of the contract between us.' },
            { term: 'Keeping accounting and customs records', def: 'A legal obligation. UAE commercial and tax law requires a business to keep its books and the documents behind them.' },
            { term: 'Keeping the site and the console standing up', def: 'Our legitimate interest in not being flooded by a script, weighed against a few minutes of an address held in memory and never stored.' },
            { term: 'Defending a claim about a consignment', def: 'Our legitimate interest in being able to establish what was delivered, when, and in what condition.' },
          ] },
          { t: 'p', text: 'We do not send marketing email. If that ever changes it will be something you opt into deliberately, on consent you can withdraw in one click, and not something an enquiry signs you up to.' },
        ],
      },
      {
        id: 'cookies',
        heading: 'Cookies and tracking',
        body: [
          { t: 'p', text: '**This site sets no cookies on a visitor’s browser.** There is no analytics script, no advertising pixel, no social embed and no third-party tag on any public page. Nothing follows you from here to anywhere else, and this page is not asking you to consent to anything, because there is nothing to consent to.' },
          { t: 'p', text: 'One cookie exists in this system and you will never receive it: a session cookie set when a member of our own staff signs into the operations console at a separate address. It holds a random token, nothing about you, it is marked HttpOnly and Secure, and it is never set on the public site.' },
          { t: 'p', text: 'Your browser stores two things locally, on your device, which are not cookies and are never transmitted: the shortlist you build, and the language you chose to read the site in. Both are cleared when you clear your browser data.' },
        ],
      },
      {
        id: 'who-sees',
        heading: 'Who sees it',
        body: [
          { t: 'p', text: 'Our own staff, through the operations console, and only those with an account. Beyond that, an enquiry is shared only where the work itself requires it:' },
          { t: 'dl', items: [
            { term: 'The Italian nursery', def: 'Receives the specification of what you want — species, size, quantity. It does not need your name or your contact details and is not given them.' },
            { term: 'Freight, clearance and delivery', def: 'Once there is an order, the delivery address, site contact name and telephone number go to the carrier and to customs, because a consignment cannot be cleared or delivered without them.' },
            { term: 'Agricultural and customs authorities', def: 'A consignment of live plants is inspected on both sides. The importer of record and the delivery address appear on the paperwork, because that is what the paperwork is.' },
            { term: 'Our hosting and database providers', def: 'The site runs on Railway and the database on Neon. They process data on our instructions in order to run the service and do not use it for anything of their own.' },
            { term: 'Our email provider', def: 'Sends the acknowledgement and the quotation. It sees the address it is sending to and what is in the message, which is unavoidable in sending it.' },
            { term: 'Our accountants and, if it comes to it, our lawyers', def: 'Under professional duties of confidence, and only what the matter needs.' },
          ] },
          { t: 'p', text: 'We do not sell personal data, and we have never shared it with a marketing, advertising or data-broking business of any kind.' },
        ],
      },
      {
        id: 'where',
        heading: 'Where it is held',
        body: [
          { t: 'p', text: 'Our hosting and database providers operate in data centres outside the United Arab Emirates, so an enquiry is stored abroad. Transfers of that kind are permitted under UAE data protection law where the recipient is bound to protect the data, and both providers are contractually bound to do so under their standard data processing terms.' },
          { t: 'p', text: 'The Italian nursery that grows your trees is in Italy, which means an order’s specification is processed in the European Union. That is not a loophole we are relying on; it is where the trees are.' },
          { t: 'p', text: 'If you would rather your details were not stored this way, send us the specification without them and we will quote it against a reference instead of a name.' },
        ],
      },
      {
        id: 'how-long',
        heading: 'How long we keep it',
        body: [
          { t: 'dl', items: [
            { term: 'An enquiry that never became an order', def: 'Kept while we are still in conversation, and for two years after the last contact — trees are specified years before they are planted, and somebody who asked about olives in 2026 is often the same project in 2028. After that it is deleted.' },
            { term: 'An order, a quotation that became one, and its invoices', def: 'Kept for the period UAE commercial and tax law requires for accounting records — five years from the end of the tax period the record belongs to — and then deleted.' },
            { term: 'Import and phytosanitary paperwork', def: 'Kept for as long as the customs and agricultural authorities require it to be producible, which is the same five-year horizon.' },
            { term: 'A claim, a replacement or a dispute', def: 'Kept until it is closed and then for as long as a claim about it could still be brought.' },
            { term: 'Sign-in records for our own staff accounts', def: 'Ninety days, which is what the lockout that protects those accounts needs in order to work.' },
            { term: 'Backups', def: 'Nightly, encrypted, and rolled forward. A record you asked us to delete disappears from the live database immediately and falls out of the backups as they roll. It is not restored into the live system except in a disaster, and if that happened we would re-apply your deletion.' },
          ] },
        ],
      },
      {
        id: 'rights',
        heading: 'What you can ask us to do',
        body: [
          { t: 'p', text: 'Under UAE data protection law you may ask us to:' },
          { t: 'ul', items: [
            'Tell you what we hold about you, and give you a copy',
            'Correct anything that is wrong',
            'Delete it, where we are not required to keep it',
            'Stop using it for a particular purpose, or restrict what we do with it while something is being sorted out',
            'Hand it over in a form you can take elsewhere',
            'Object to processing we are doing on a legitimate interest',
          ] },
          { t: 'p', text: 'Ask through the [enquiry form](/quote) and quote your reference number if you have one. We will answer within thirty days. There is no charge. If we cannot do what you asked — a paid invoice, for instance — we will tell you which record it is and which obligation stops us, rather than simply refusing.' },
          { t: 'p', text: 'We may ask you to confirm who you are before we send a copy of anything. That is not obstruction: handing somebody’s enquiry history to whoever asks for it would be the worse failure.' },
        ],
      },
      {
        id: 'automated',
        heading: 'Automated decisions and profiling',
        body: [
          { t: 'p', text: '**There are none.** No decision about you, your enquiry or your order is made by a system on its own. Every quotation is priced by a person, every order is confirmed by a person, and nothing on this site scores, ranks or segments the people who use it.' },
          { t: 'p', text: 'The one automated judgement in the system refuses submissions that look like a script, and it is about the request, not about you. If a form will not send, tell us and we will take the details directly.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'If you are not happy with how we handled it',
        body: [
          { t: 'p', text: 'Tell us first, through the [enquiry form](/quote), and say that it is a data protection complaint so that it is not read as an enquiry about trees. We will acknowledge it within two working days and answer it within thirty, and we will tell you what we did rather than that it has been noted.' },
          { t: 'p', text: 'If that does not resolve it, you have the right to complain to the **UAE Data Office**, the federal authority responsible for personal data protection, without going through us first. Complaining to us is not a step you are required to take, only one we would rather you took, because we can usually fix it faster than anybody else can order us to.' },
        ],
      },
      {
        id: 'security',
        heading: 'How it is protected',
        body: [
          { t: 'p', text: 'Everything travels over an encrypted connection. Staff accounts use hashed passwords, expiring sessions and a lockout after repeated failed sign-ins, and every change made in the console is recorded against the account that made it. The database is backed up nightly to encrypted storage and the backup is read back to check it arrived intact.' },
          { t: 'p', text: 'No system is beyond reach. If a breach ever affects your data we will tell you and the regulator, and we will tell you what we know rather than waiting until we know everything.' },
          { t: 'p', text: 'If you have found a security problem in this site, tell us through the [enquiry form](/quote) and we will treat it as urgent. We will not threaten anybody who reports one in good faith.' },
        ],
      },
      {
        id: 'children',
        heading: 'Children',
        body: [
          { t: 'p', text: 'This is a trade catalogue sold to businesses and to adults commissioning landscaping. It is not directed at children and we do not knowingly collect anything from one. If you believe a child has sent us their details, tell us and we will delete them.' },
        ],
      },
      {
        id: 'changes',
        heading: 'Changes to this policy',
        body: [
          { t: 'p', text: 'When this policy changes, the date at the top changes with it. We do not rewrite it quietly. If a change affects what we do with an enquiry you have already sent, we will say so directly rather than relying on you to re-read the page.' },
        ],
      },
      {
        id: 'law',
        heading: 'Governing law and language',
        body: [
          { t: 'p', text: 'This policy is governed by the laws of the United Arab Emirates as applied in {city}, and the courts of {city} have jurisdiction over any dispute about it.' },
          { t: 'p', text: 'This page is published in English, Arabic and Italian. The English text is the one that was written and reviewed; the other two are provided so that it can be read. Where they differ, the English governs.' },
        ],
      },
    ],
    footnote:
      'This policy is written to be read rather than to be survived. If a sentence in it is unclear, that is a fault in the policy — tell us and we will fix the sentence.',
  },

  ar: {
    slug: 'privacy',
    title: 'سياسة الخصوصية',
    metaTitle: 'سياسة الخصوصية',
    metaDescription:
      'ما الذي تسجّله «فيردي غاردن للتجارة» عند إرسالك استفسارًا، والأساس القانوني لذلك، ومدة الاحتفاظ به، ومن يطّلع عليه، وأين تتقدّم بشكوى — وما لا يفعله هذا الموقع.',
    cardLine: 'ما نسجّله عند إرسالك استفسارًا، ومدة احتفاظنا به، ومن يطّلع عليه.',
    cardNote: 'بلا كوكيز، بلا تحليلات، بلا تتبّع.',
    summary:
      'لا يضع هذا الموقع أي ملفات تعريف ارتباط للزوّار، ولا يشغّل أي أدوات تحليل، ولا يحمل أي إعلانات أو تتبّع من أي نوع. البيانات الشخصية الوحيدة التي نحتفظ بها هي ما تكتبه أنت في نموذج الاستفسار وترسله إلينا.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'who',
        heading: 'من المسؤول',
        body: [
          { t: 'p', text: '{legalName} هي المتحكّم في البيانات الشخصية الموصوفة هنا، أي أننا نحن من يقرّر ما الذي يُجمع ولماذا، ونحن المسؤولون عنه.' },
          { t: 'p', text: 'نحن شركة تجارية مسجّلة في دولة الإمارات العربية المتحدة. كُتبت هذه السياسة استنادًا إلى **المرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية** والأنظمة القطاعية المرتبطة به. وإذا كنت تراسلنا من داخل الاتحاد الأوروبي، فإننا نتعامل مع طلبك وفق هذه السياسة بدل ردّه — فالحقوق المذكورة أدناه هي الحقوق التي نلتزم بها فعليًا، أينما كنت.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'what',
        heading: 'ما الذي نجمعه، وفقط حين ترسله أنت',
        body: [
          { t: 'p', text: 'لا يُجمع شيء بمجرد الزيارة. يمكن قراءة الكتالوج والمجموعات وكل مقال على هذا الموقع دون أن تعرّف عن نفسك بأي شكل.' },
          { t: 'p', text: 'عند إرسالك استفسارًا — من نموذج عرض السعر، أو من صفحة شجرة بعينها، أو من قائمتك — نسجّل تحديدًا الحقول التي ملأتها:' },
          { t: 'ul', items: [
            'اسمك، واسم شركتك إن ذكرته',
            'بريدك الإلكتروني، ورقم هاتفك أو واتساب إن ذكرته',
            'الإمارة ونوع المشروع ونطاق العمل الذي اخترته، إن وُجد',
            'الأشجار التي سألت عنها والكميات',
            'أي شيء كتبته في خانة الرسالة',
            'الصفحة التي جاء منها الاستفسار، ونص معرّف متصفحك',
            'رقم مرجعي، وتاريخ ووقت وصوله',
          ] },
          { t: 'p', text: 'هذه هي القائمة كاملة. **لا نسجّل عنوان الـ IP الخاص بك مقترنًا بالاستفسار**، ولا نبني عنك ملفًّا، ولا نشتري أو نضيف بيانات عنك من أي مصدر آخر.' },
          { t: 'p', text: 'يحدث أمران حول كل إرسال يستحقّان الذكر بدل أن يُكتشفا لاحقًا. يحمل النموذج حقلًا مخفيًّا لا يراه الإنسان؛ فإن وصل مملوءًا، فذلك يعني أن الإرسال تمّ عبر برنامج آلي فيُهمل. كما يحصي الخادم الطلبات الحديثة في الذاكرة لمنع جهاز واحد من إغراق النموذج — ويُحفظ هذا العدّ مقابل العنوان الذي يبدو أن الاتصال قادم منه، لدقائق معدودة على الأكثر، ولا يُكتب في قاعدة البيانات ولا يُربط باستفسارك أبدًا.' },
          { t: 'note', text: '**قائمتك لا تغادر متصفحك إطلاقًا.** تُحفظ الأشجار التي تجمعها في التخزين المحلي على جهازك أنت. لا يصلنا عنها شيء حتى تضغط إرسال، وإن لم ترسل فلن نعلم أصلًا أنك أعددت قائمة. ومسح بيانات المتصفح يمسحها.' },
        ],
      },
      {
        id: 'basis',
        heading: 'لماذا يحقّ لنا الاحتفاظ به',
        body: [
          { t: 'p', text: 'يطلب القانون أساسًا قانونيًّا لكل غرض على حدة، لا أساسًا واحدًا للنشاط كله. وأسسنا هي:' },
          { t: 'dl', items: [
            { term: 'الردّ على استفسارك وتسعيره', def: 'خطوات تُتّخذ بناءً على طلبك قبل التعاقد. أنت طلبت عرض سعر، ولا يمكننا إعداده دون المواصفات ودون وسيلة لإعادته إليك.' },
            { term: 'الاستيراد والتسليم وإصدار الفاتورة', def: 'تنفيذ العقد المبرم بيننا.' },
            { term: 'حفظ السجلات المحاسبية والجمركية', def: 'التزام قانوني. يُلزم القانون التجاري والضريبي الإماراتي المنشأة بحفظ دفاترها والمستندات المؤيدة لها.' },
            { term: 'إبقاء الموقع ولوحة التشغيل قائمَين', def: 'مصلحتنا المشروعة في ألّا يغرقنا برنامج آلي، موازنةً بدقائق معدودة يبقى فيها عنوان في الذاكرة دون أن يُخزَّن.' },
            { term: 'الدفاع عن دعوى تتعلق بشحنة', def: 'مصلحتنا المشروعة في القدرة على إثبات ما سُلّم، ومتى، وبأي حال.' },
          ] },
          { t: 'p', text: 'لا نرسل رسائل تسويقية. وإن تغيّر ذلك يومًا، فسيكون اشتراكًا تختاره أنت عمدًا، بموافقة يمكنك سحبها بنقرة واحدة، لا شيئًا يسجّلك فيه استفسار أرسلته.' },
        ],
      },
      {
        id: 'cookies',
        heading: 'ملفات تعريف الارتباط والتتبّع',
        body: [
          { t: 'p', text: '**هذا الموقع لا يضع أي ملف تعريف ارتباط على متصفح الزائر.** لا يوجد أي نص تحليلات، ولا بكسل إعلاني، ولا تضمين لشبكات التواصل، ولا أي وسم طرف ثالث على أي صفحة عامة. لا شيء يتبعك من هنا إلى مكان آخر، وهذه الصفحة لا تطلب منك الموافقة على شيء، لأنه ببساطة لا يوجد ما تُوافق عليه.' },
          { t: 'p', text: 'يوجد في هذا النظام ملف تعريف ارتباط واحد لن تتلقّاه أبدًا: ملف جلسة يُوضع حين يسجّل أحد موظفينا دخوله إلى لوحة التشغيل على عنوان منفصل. يحمل رمزًا عشوائيًّا لا يخصّك، وموسوم بـ HttpOnly وSecure، ولا يُوضع على الموقع العام إطلاقًا.' },
          { t: 'p', text: 'يحفظ متصفحك محليًّا شيئين على جهازك، وليسا ملفَّي تعريف ارتباط ولا يُرسلان إلى أي جهة: القائمة التي تبنيها، واللغة التي اخترت قراءة الموقع بها. ويُمسحان معًا عند مسح بيانات المتصفح.' },
        ],
      },
      {
        id: 'who-sees',
        heading: 'من يطّلع عليه',
        body: [
          { t: 'p', text: 'موظفونا، عبر لوحة التشغيل، ومن يملك حسابًا منهم فقط. وفيما عدا ذلك، لا يُشارَك الاستفسار إلا حيث يقتضيه العمل نفسه:' },
          { t: 'dl', items: [
            { term: 'المشتل الإيطالي', def: 'يتلقّى مواصفات ما تريده — النوع والحجم والكمية. لا يحتاج إلى اسمك ولا إلى بيانات التواصل معك، ولا تُعطى له.' },
            { term: 'الشحن والتخليص والتسليم', def: 'بمجرد وجود طلب، يذهب عنوان التسليم واسم مسؤول الموقع ورقم هاتفه إلى الناقل وإلى الجمارك، لأن الشحنة لا تُخلَّص ولا تُسلَّم بدونها.' },
            { term: 'الجهات الزراعية والجمركية', def: 'تُفحص شحنة النباتات الحيّة على الطرفين. يظهر المستورد المسجّل وعنوان التسليم في المستندات، لأن ذلك هو جوهر المستندات.' },
            { term: 'مزوّدو الاستضافة وقاعدة البيانات لدينا', def: 'يعمل الموقع على Railway وقاعدة البيانات على Neon. يعالجان البيانات بناءً على تعليماتنا لتشغيل الخدمة، ولا يستخدمانها لأي غرض خاص بهما.' },
            { term: 'مزوّد البريد الإلكتروني لدينا', def: 'يرسل الإشعار وعرض السعر. يرى العنوان الذي يُرسل إليه ومحتوى الرسالة، وهو أمر لا مفرّ منه في الإرسال نفسه.' },
            { term: 'محاسبونا، وعند الاقتضاء محامونا', def: 'في إطار واجبات مهنية بالسرية، وبالقدر الذي تقتضيه المسألة فقط.' },
          ] },
          { t: 'p', text: 'لا نبيع البيانات الشخصية، ولم نشاركها يومًا مع أي جهة تسويقية أو إعلانية أو وسيط بيانات من أي نوع.' },
        ],
      },
      {
        id: 'where',
        heading: 'أين يُحفظ',
        body: [
          { t: 'p', text: 'يعمل مزوّدو الاستضافة وقاعدة البيانات لدينا في مراكز بيانات خارج دولة الإمارات، فيكون الاستفسار مخزَّنًا في الخارج. ويُسمح بهذا النوع من النقل بموجب قانون حماية البيانات الإماراتي متى كان المتلقّي ملزَمًا بحماية البيانات، وكلا المزوّدَين ملزَم تعاقديًّا بذلك بموجب شروط معالجة البيانات القياسية لديهما.' },
          { t: 'p', text: 'المشتل الإيطالي الذي يزرع أشجارك يقع في إيطاليا، ما يعني أن مواصفات الطلب تُعالَج داخل الاتحاد الأوروبي. وهذه ليست ثغرة نستند إليها؛ بل هو ببساطة مكان وجود الأشجار.' },
          { t: 'p', text: 'إن كنت تفضّل ألّا تُخزَّن بياناتك بهذه الطريقة، فأرسل إلينا المواصفات دونها وسنسعّرها مقابل رقم مرجعي بدل اسم.' },
        ],
      },
      {
        id: 'how-long',
        heading: 'مدة احتفاظنا به',
        body: [
          { t: 'dl', items: [
            { term: 'استفسار لم يتحوّل إلى طلب', def: 'يُحفظ ما دمنا في تواصل، ولمدة سنتين بعد آخر اتصال — فالأشجار تُحدَّد مواصفاتها قبل سنوات من زراعتها، ومن سأل عن الزيتون في 2026 كثيرًا ما يكون المشروع نفسه في 2028. وبعد ذلك يُحذف.' },
            { term: 'طلب، وعرض سعر تحوّل إليه، وفواتيره', def: 'تُحفظ للمدة التي يفرضها القانون التجاري والضريبي الإماراتي للسجلات المحاسبية — خمس سنوات من نهاية الفترة الضريبية التي يخصّها السجل — ثم تُحذف.' },
            { term: 'مستندات الاستيراد والصحة النباتية', def: 'تُحفظ طوال المدة التي تشترط فيها الجهات الجمركية والزراعية إمكان إبرازها، وهي الأفق الخمسي نفسه.' },
            { term: 'مطالبة أو استبدال أو نزاع', def: 'يُحفظ حتى إغلاقه، ثم للمدة التي يمكن أن تُرفع خلالها دعوى بشأنه.' },
            { term: 'سجلات تسجيل الدخول لحسابات موظفينا', def: 'تسعون يومًا، وهي المدة التي يحتاجها الإيقاف الذي يحمي تلك الحسابات كي يعمل.' },
            { term: 'النسخ الاحتياطية', def: 'ليلية ومشفّرة ومتدرّجة. السجل الذي تطلب حذفه يختفي من قاعدة البيانات الحيّة فورًا، ويسقط من النسخ الاحتياطية مع تدرّجها. ولا يُستعاد إلى النظام الحيّ إلا في كارثة، ولو حدث ذلك لأعدنا تطبيق حذفك.' },
          ] },
        ],
      },
      {
        id: 'rights',
        heading: 'ما يمكنك أن تطلبه منّا',
        body: [
          { t: 'p', text: 'بموجب قانون حماية البيانات الإماراتي، يمكنك أن تطلب منّا:' },
          { t: 'ul', items: [
            'إخبارك بما نحتفظ به عنك، وتزويدك بنسخة',
            'تصحيح أي معلومة خاطئة',
            'حذفها، حيثما لا نكون ملزَمين بحفظها',
            'التوقف عن استخدامها لغرض معيّن، أو تقييد ما نفعله بها ريثما تُحسم مسألة ما',
            'تسليمها بصيغة يمكنك نقلها إلى جهة أخرى',
            'الاعتراض على معالجة نجريها استنادًا إلى مصلحة مشروعة',
          ] },
          { t: 'p', text: 'اطلب ذلك عبر [نموذج الاستفسار](/quote) مع ذكر رقمك المرجعي إن وُجد. وسنردّ خلال ثلاثين يومًا. لا رسوم على ذلك. وإن تعذّر علينا تنفيذ ما طلبت — فاتورة مدفوعة مثلًا — فسنخبرك بأي سجلّ يتعلق الأمر وبأي التزام يمنعنا، بدل الرفض المجرّد.' },
          { t: 'p', text: 'قد نطلب منك إثبات هويتك قبل إرسال نسخة من أي شيء. وليس هذا تعطيلًا: فتسليم سجلّ استفسارات شخص ما لأي من يطلبه سيكون الإخفاق الأكبر.' },
        ],
      },
      {
        id: 'automated',
        heading: 'القرارات الآلية والتنميط',
        body: [
          { t: 'p', text: '**لا وجود لها.** لا يُتَّخذ أي قرار بشأنك أو بشأن استفسارك أو طلبك بواسطة نظام بمفرده. كل عرض سعر يسعّره إنسان، وكل طلب يؤكّده إنسان، ولا شيء في هذا الموقع يصنّف مستخدميه أو يرتّبهم أو يقسّمهم إلى شرائح.' },
          { t: 'p', text: 'الحكم الآلي الوحيد في النظام يرفض الإرسالات التي تبدو صادرة عن برنامج، وهو حكم على الطلب لا عليك. وإن تعذّر إرسال النموذج، أخبرنا وسنأخذ التفاصيل مباشرة.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'إن لم تكن راضيًا عن طريقة تعاملنا',
        body: [
          { t: 'p', text: 'أخبرنا أولًا عبر [نموذج الاستفسار](/quote)، واذكر أنها شكوى تتعلق بحماية البيانات كي لا تُقرأ كاستفسار عن أشجار. سنُقرّ باستلامها خلال يومَي عمل ونردّ عليها خلال ثلاثين يومًا، وسنخبرك بما فعلناه لا بأنها أُحيطت علمًا.' },
          { t: 'p', text: 'وإن لم يحلّ ذلك الأمر، فمن حقك التقدّم بشكوى إلى **مكتب البيانات الإماراتي**، وهو الجهة الاتحادية المعنية بحماية البيانات الشخصية، دون المرور بنا أولًا. فالشكوى إلينا ليست خطوة مفروضة عليك، بل خطوة نفضّل أن تسلكها، لأننا غالبًا نستطيع الإصلاح أسرع مما يستطيع أي طرف أن يأمرنا به.' },
        ],
      },
      {
        id: 'security',
        heading: 'كيف تُحمى',
        body: [
          { t: 'p', text: 'ينتقل كل شيء عبر اتصال مشفّر. تستخدم حسابات الموظفين كلمات مرور مجزّأة، وجلسات تنتهي صلاحيتها، وإيقافًا بعد محاولات دخول فاشلة متكررة، ويُسجَّل كل تغيير يجري في اللوحة مقترنًا بالحساب الذي أجراه. وتُنسخ قاعدة البيانات احتياطيًّا كل ليلة إلى تخزين مشفّر، وتُقرأ النسخة مجدّدًا للتأكد من وصولها سليمة.' },
          { t: 'p', text: 'لا يوجد نظام بمنأى عن الخطر. وإن أثّر اختراق يومًا على بياناتك، فسنخبرك وسنخبر الجهة المنظِّمة، وسنقول لك ما نعرفه بدل الانتظار حتى نعرف كل شيء.' },
          { t: 'p', text: 'إن اكتشفت خللًا أمنيًّا في هذا الموقع، أخبرنا عبر [نموذج الاستفسار](/quote) وسنعامله كأمر عاجل. ولن نهدّد أحدًا أبلغ عن خلل بحسن نيّة.' },
        ],
      },
      {
        id: 'children',
        heading: 'الأطفال',
        body: [
          { t: 'p', text: 'هذا كتالوج تجاري يُباع للشركات وللبالغين الذين يكلّفون بأعمال تنسيق المواقع. وهو غير موجّه إلى الأطفال، ولا نجمع عن قصد أي شيء من طفل. وإن كنت تعتقد أن طفلًا أرسل إلينا بياناته، فأخبرنا وسنحذفها.' },
        ],
      },
      {
        id: 'changes',
        heading: 'تعديلات هذه السياسة',
        body: [
          { t: 'p', text: 'حين تتغيّر هذه السياسة، يتغيّر التاريخ في أعلاها معها. نحن لا نعيد كتابتها في صمت. وإن مسّ تغيير ما نفعله باستفسار سبق أن أرسلته، فسنقول لك ذلك مباشرة بدل الاتّكال على إعادتك قراءة الصفحة.' },
        ],
      },
      {
        id: 'law',
        heading: 'القانون الواجب التطبيق واللغة',
        body: [
          { t: 'p', text: 'تخضع هذه السياسة لقوانين دولة الإمارات العربية المتحدة كما تُطبَّق في {city}، وتختصّ محاكم {city} بأي نزاع بشأنها.' },
          { t: 'p', text: 'تُنشر هذه الصفحة بالإنجليزية والعربية والإيطالية. والنص الإنجليزي هو النص الذي كُتب وروجع؛ أما النصّان الآخران فمقدَّمان ليُقرأ. وعند الاختلاف، يُعتدّ بالنص الإنجليزي.' },
        ],
      },
    ],
    footnote:
      'كُتبت هذه السياسة لتُقرأ لا لتُحتمل. فإن كانت فيها جملة غير واضحة، فذلك عيب في السياسة — أخبرنا وسنصلح الجملة.',
  },

  it: {
    slug: 'privacy',
    title: 'Informativa sulla privacy',
    metaTitle: 'Informativa sulla privacy',
    metaDescription:
      'Che cosa registra Verde Garden Trading quando inviate una richiesta, su quale base giuridica, per quanto tempo la conserva, chi la vede, dove presentare reclamo — e che cosa questo sito non fa.',
    cardLine: 'Che cosa registriamo quando inviate una richiesta, per quanto la conserviamo e chi la vede.',
    cardNote: 'Nessun cookie, nessuna analitica, nessun tracciamento.',
    summary:
      'Questo sito non imposta cookie per i visitatori, non esegue alcuna analitica e non contiene pubblicità o tracciamento di alcun tipo. Gli unici dati personali che conserva sono quelli che scrivete in un modulo di richiesta e ci inviate.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'who',
        heading: 'Chi è il responsabile',
        body: [
          { t: 'p', text: '{legalName} è il titolare del trattamento dei dati personali qui descritti: siamo noi a decidere che cosa viene raccolto e perché, e siamo noi a risponderne.' },
          { t: 'p', text: 'Siamo una società commerciale registrata negli Emirati Arabi Uniti. Questa informativa è redatta sulla base del **Decreto-Legge Federale n. 45 del 2021 sulla protezione dei dati personali** e delle norme settoriali collegate. Se ci scrivete dall’Unione Europea, trattiamo la vostra richiesta secondo questa informativa anziché respingerla: i diritti elencati più avanti sono quelli che riconosciamo davvero, ovunque vi troviate.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'what',
        heading: 'Che cosa raccogliamo, e solo quando lo inviate voi',
        body: [
          { t: 'p', text: 'La semplice visita non raccoglie nulla. Il catalogo, le collezioni e ogni articolo di questo sito si possono leggere senza identificarsi in alcun modo.' },
          { t: 'p', text: 'Quando inviate una richiesta — dal modulo di preventivo, dalla pagina di un esemplare o da una lista — registriamo esattamente i campi che avete compilato:' },
          { t: 'ul', items: [
            'Il vostro nome e, se indicata, la vostra azienda',
            'Il vostro indirizzo e-mail e, se indicati, il telefono o il numero WhatsApp',
            'L’emirato, il tipo di progetto e l’ambito selezionati, se presenti',
            'Gli esemplari su cui avete chiesto informazioni e le quantità',
            'Tutto ciò che avete scritto nel campo messaggio',
            'La pagina da cui è partita la richiesta e la stringa user-agent del browser',
            'Un numero di riferimento, con data e ora di arrivo',
          ] },
          { t: 'p', text: 'L’elenco finisce qui. **Non registriamo il vostro indirizzo IP insieme alla richiesta**, non costruiamo un profilo su di voi e non acquistiamo né integriamo dati che vi riguardano da altre fonti.' },
          { t: 'p', text: 'Attorno a ogni invio accadono due cose che è giusto dire, invece di lasciarle scoprire. Il modulo contiene un campo nascosto che una persona non vede mai; se arriva compilato, l’invio è stato fatto da uno script e viene scartato. E il server conta in memoria le richieste recenti per impedire a una singola macchina di sommergere il modulo: quel conteggio è tenuto rispetto all’indirizzo da cui la connessione sembra provenire, per pochi minuti al massimo, e non viene mai scritto nel database né collegato alla vostra richiesta.' },
          { t: 'note', text: '**La vostra lista non lascia mai il browser.** Gli esemplari che raccogliete restano nell’archivio locale del vostro dispositivo. Non ci arriva nulla finché non premete invio, e se non inviate mai nulla non sapremo neppure che avete fatto una lista. Cancellando i dati del browser la si cancella.' },
        ],
      },
      {
        id: 'basis',
        heading: 'Perché possiamo conservarli',
        body: [
          { t: 'p', text: 'La legge chiede una base giuridica per ciascuna finalità, non una per l’attività nel suo insieme. Le nostre sono:' },
          { t: 'dl', items: [
            { term: 'Rispondere alla vostra richiesta e formularne il prezzo', def: 'Misure precontrattuali adottate su vostra richiesta. Ci avete chiesto un preventivo; non possiamo produrlo senza le specifiche e senza un modo per rimandarvelo.' },
            { term: 'Importare, consegnare e fatturare un ordine', def: 'Esecuzione del contratto fra noi.' },
            { term: 'Tenere le scritture contabili e doganali', def: 'Obbligo di legge. La normativa commerciale e fiscale degli Emirati impone all’impresa di conservare i libri e i documenti che li sostengono.' },
            { term: 'Tenere in piedi il sito e la console', def: 'Nostro legittimo interesse a non essere sommersi da uno script, bilanciato con pochi minuti di un indirizzo tenuto in memoria e mai archiviato.' },
            { term: 'Difenderci da una contestazione su una spedizione', def: 'Nostro legittimo interesse a poter stabilire che cosa è stato consegnato, quando e in quali condizioni.' },
          ] },
          { t: 'p', text: 'Non inviamo e-mail di marketing. Se un giorno ciò cambiasse, sarebbe un’adesione che scegliete deliberatamente, con un consenso revocabile con un clic, non qualcosa a cui una richiesta di preventivo vi iscrive.' },
        ],
      },
      {
        id: 'cookies',
        heading: 'Cookie e tracciamento',
        body: [
          { t: 'p', text: '**Questo sito non imposta alcun cookie sul browser di un visitatore.** Non c’è alcuno script di analitica, alcun pixel pubblicitario, alcun embed social e alcun tag di terze parti su nessuna pagina pubblica. Nulla vi segue da qui ad altrove, e questa pagina non vi sta chiedendo di acconsentire a nulla, perché non c’è nulla a cui acconsentire.' },
          { t: 'p', text: 'In questo sistema esiste un solo cookie, e non lo riceverete mai: un cookie di sessione impostato quando un membro del nostro personale accede alla console operativa, a un indirizzo separato. Contiene un token casuale, nulla che vi riguardi, è marcato HttpOnly e Secure, e non viene mai impostato sul sito pubblico.' },
          { t: 'p', text: 'Il vostro browser conserva localmente, sul vostro dispositivo, due cose che non sono cookie e non vengono mai trasmesse: la lista che componete e la lingua in cui avete scelto di leggere il sito. Entrambe spariscono cancellando i dati del browser.' },
        ],
      },
      {
        id: 'who-sees',
        heading: 'Chi li vede',
        body: [
          { t: 'p', text: 'Il nostro personale, attraverso la console operativa, e solo chi ha un account. Oltre a questo, una richiesta è condivisa solo dove il lavoro stesso lo impone:' },
          { t: 'dl', items: [
            { term: 'Il vivaio italiano', def: 'Riceve la specifica di ciò che volete — specie, misura, quantità. Non ha bisogno del vostro nome né dei vostri recapiti, e non gli vengono dati.' },
            { term: 'Trasporto, sdoganamento e consegna', def: 'Quando c’è un ordine, l’indirizzo di consegna, il nome del referente di cantiere e il suo telefono vanno al vettore e alla dogana, perché senza non si sdogana e non si consegna.' },
            { term: 'Autorità doganali e fitosanitarie', def: 'Una spedizione di piante vive viene ispezionata su entrambi i lati. L’importatore e l’indirizzo di consegna compaiono nei documenti, perché è esattamente ciò che i documenti sono.' },
            { term: 'I nostri fornitori di hosting e database', def: 'Il sito gira su Railway e il database su Neon. Trattano i dati su nostra istruzione per far funzionare il servizio e non li usano per finalità proprie.' },
            { term: 'Il nostro fornitore di posta elettronica', def: 'Invia la conferma e il preventivo. Vede l’indirizzo a cui sta scrivendo e il contenuto del messaggio, cosa inevitabile per poterlo inviare.' },
            { term: 'I nostri commercialisti e, se si arriva a tanto, i nostri legali', def: 'Vincolati da obblighi professionali di riservatezza e limitatamente a quanto la pratica richiede.' },
          ] },
          { t: 'p', text: 'Non vendiamo dati personali e non li abbiamo mai condivisi con alcuna impresa di marketing, pubblicità o intermediazione di dati.' },
        ],
      },
      {
        id: 'where',
        heading: 'Dove sono conservati',
        body: [
          { t: 'p', text: 'I nostri fornitori di hosting e database operano in data center fuori dagli Emirati Arabi Uniti, quindi una richiesta è conservata all’estero. Trasferimenti di questo tipo sono ammessi dalla normativa emiratina sulla protezione dei dati quando il destinatario è vincolato a proteggerli, ed entrambi i fornitori lo sono contrattualmente in forza delle loro condizioni standard di trattamento.' },
          { t: 'p', text: 'Il vivaio italiano che coltiva i vostri alberi si trova in Italia: la specifica di un ordine è quindi trattata nell’Unione Europea. Non è una scappatoia su cui contiamo; è semplicemente dove sono gli alberi.' },
          { t: 'p', text: 'Se preferite che i vostri dati non siano conservati così, inviateci la specifica senza di essi e la quoteremo contro un riferimento anziché un nome.' },
        ],
      },
      {
        id: 'how-long',
        heading: 'Per quanto tempo li conserviamo',
        body: [
          { t: 'dl', items: [
            { term: 'Una richiesta che non è mai diventata un ordine', def: 'Conservata finché siamo in contatto e per due anni dall’ultimo scambio: gli alberi si specificano anni prima di essere piantati, e chi ha chiesto di olivi nel 2026 è spesso lo stesso progetto nel 2028. Dopodiché viene cancellata.' },
            { term: 'Un ordine, il preventivo che lo è diventato e le sue fatture', def: 'Conservati per il periodo che la normativa commerciale e fiscale emiratina impone alle scritture contabili — cinque anni dalla fine del periodo d’imposta cui il documento appartiene — e poi cancellati.' },
            { term: 'Documentazione di importazione e fitosanitaria', def: 'Conservata per tutto il tempo in cui le autorità doganali e agricole ne richiedono l’esibibilità, cioè lo stesso orizzonte di cinque anni.' },
            { term: 'Una contestazione, una sostituzione o una controversia', def: 'Conservata fino alla chiusura e poi per il tempo in cui potrebbe ancora esserne fatta valere una pretesa.' },
            { term: 'Registrazioni di accesso degli account del nostro personale', def: 'Novanta giorni, il tempo di cui ha bisogno il blocco che protegge quegli account per funzionare.' },
            { term: 'Backup', def: 'Notturni, cifrati e a rotazione. Un dato di cui chiedete la cancellazione sparisce subito dal database attivo ed esce dai backup man mano che ruotano. Non viene ripristinato nel sistema attivo se non in caso di disastro; e se accadesse, riapplicheremmo la vostra cancellazione.' },
          ] },
        ],
      },
      {
        id: 'rights',
        heading: 'Che cosa potete chiederci',
        body: [
          { t: 'p', text: 'Ai sensi della normativa emiratina sulla protezione dei dati potete chiederci di:' },
          { t: 'ul', items: [
            'Dirvi che cosa conserviamo su di voi e darvene copia',
            'Correggere ciò che è errato',
            'Cancellarlo, dove non siamo obbligati a conservarlo',
            'Smettere di usarlo per una determinata finalità, o limitarne il trattamento mentre una questione viene chiarita',
            'Consegnarlo in un formato che potete portare altrove',
            'Opporvi a un trattamento fondato su un legittimo interesse',
          ] },
          { t: 'p', text: 'Chiedetelo tramite il [modulo di richiesta](/quote), citando il vostro numero di riferimento se ne avete uno. Risponderemo entro trenta giorni. Non c’è alcun costo. Se non potremo fare ciò che avete chiesto — una fattura già pagata, per esempio — vi diremo di quale documento si tratta e quale obbligo ce lo impedisce, anziché limitarci a un rifiuto.' },
          { t: 'p', text: 'Potremmo chiedervi di confermare la vostra identità prima di inviarvi copia di qualcosa. Non è un ostacolo: consegnare lo storico delle richieste di una persona a chiunque lo domandi sarebbe il danno peggiore.' },
        ],
      },
      {
        id: 'automated',
        heading: 'Decisioni automatizzate e profilazione',
        body: [
          { t: 'p', text: '**Non ce ne sono.** Nessuna decisione su di voi, sulla vostra richiesta o sul vostro ordine è presa da un sistema per conto proprio. Ogni preventivo è quotato da una persona, ogni ordine è confermato da una persona, e nulla su questo sito assegna punteggi, classifica o segmenta chi lo usa.' },
          { t: 'p', text: 'L’unico giudizio automatico del sistema respinge gli invii che sembrano provenire da uno script, e riguarda la richiesta, non voi. Se un modulo non parte, ditecelo e prenderemo i dati direttamente.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'Se non siete soddisfatti di come abbiamo gestito la cosa',
        body: [
          { t: 'p', text: 'Ditelo prima a noi, tramite il [modulo di richiesta](/quote), precisando che si tratta di un reclamo in materia di protezione dei dati, così che non venga letto come una domanda sugli alberi. Lo riscontreremo entro due giorni lavorativi e risponderemo entro trenta, dicendovi che cosa abbiamo fatto e non che ne abbiamo preso nota.' },
          { t: 'p', text: 'Se questo non risolve, avete diritto di presentare reclamo allo **UAE Data Office**, l’autorità federale competente per la protezione dei dati personali, senza passare prima da noi. Reclamare a noi non è un passaggio obbligato: è solo quello che preferiremmo, perché di solito possiamo rimediare più in fretta di quanto chiunque possa ordinarci di farlo.' },
        ],
      },
      {
        id: 'security',
        heading: 'Come sono protetti',
        body: [
          { t: 'p', text: 'Tutto viaggia su connessione cifrata. Gli account del personale usano password sottoposte ad hashing, sessioni a scadenza e un blocco dopo ripetuti accessi falliti, e ogni modifica fatta in console è registrata a nome dell’account che l’ha fatta. Il database è copiato ogni notte su archiviazione cifrata e il backup viene riletto per verificare che sia arrivato integro.' },
          { t: 'p', text: 'Nessun sistema è fuori portata. Se una violazione dovesse mai riguardare i vostri dati, lo diremo a voi e all’autorità, e vi diremo quello che sappiamo anziché aspettare di sapere tutto.' },
          { t: 'p', text: 'Se avete trovato un problema di sicurezza in questo sito, segnalatecelo tramite il [modulo di richiesta](/quote) e lo tratteremo come urgente. Non minacceremo mai chi segnala in buona fede.' },
        ],
      },
      {
        id: 'children',
        heading: 'Minori',
        body: [
          { t: 'p', text: 'Questo è un catalogo professionale rivolto a imprese e ad adulti che commissionano lavori di paesaggio. Non è destinato ai minori e non raccogliamo consapevolmente nulla da un minore. Se ritenete che un minore ci abbia inviato i propri dati, ditecelo e li cancelleremo.' },
        ],
      },
      {
        id: 'changes',
        heading: 'Modifiche a questa informativa',
        body: [
          { t: 'p', text: 'Quando questa informativa cambia, cambia con essa la data in alto. Non la riscriviamo in silenzio. Se una modifica incide su ciò che facciamo con una richiesta che ci avete già inviato, ve lo diremo direttamente anziché contare sul fatto che rileggiate la pagina.' },
        ],
      },
      {
        id: 'law',
        heading: 'Legge applicabile e lingua',
        body: [
          { t: 'p', text: 'Questa informativa è regolata dalle leggi degli Emirati Arabi Uniti come applicate a {city}, e i tribunali di {city} sono competenti per ogni controversia che la riguardi.' },
          { t: 'p', text: 'Questa pagina è pubblicata in inglese, arabo e italiano. Il testo inglese è quello redatto e verificato; gli altri due sono forniti perché possa essere letto. In caso di difformità, prevale l’inglese.' },
        ],
      },
    ],
    footnote:
      'Questa informativa è scritta per essere letta, non per essere sopportata. Se una frase non è chiara, il difetto è dell’informativa — ditecelo e correggeremo la frase.',
  },
};
