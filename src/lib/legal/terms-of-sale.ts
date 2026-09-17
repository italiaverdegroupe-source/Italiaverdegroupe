import type { LegalSet } from './types';

/**
 * Terms of sale — the document that governs an order.
 *
 * The longest of the five, and the one that was most incomplete. Added: who
 * obtains which permit and what happens when an authority refuses a
 * consignment (this is an import business and the clause was simply missing);
 * force majeure defined rather than gestured at; health and safety on a site
 * we are craning a four-tonne root ball onto; insurance; how a notice is
 * validly given; subcontracting and assignment; confidentiality; anti-bribery;
 * variation in writing; severability, entire agreement and third-party rights;
 * a complaints route with a timetable; and the language clause.
 */
export const termsOfSale: LegalSet = {
  en: {
    slug: 'terms-of-sale',
    title: 'Terms of sale',
    metaTitle: 'Terms of sale',
    metaDescription:
      'How a quotation becomes an order: prices, lead times, import permits, delivery and offloading, acceptance on site, payment, title and risk, and what happens when something goes wrong.',
    cardLine: 'How a quotation becomes an order: lead times, delivery, acceptance, payment, title and risk.',
    cardNote: 'The one to read before you sign.',
    summary:
      'These apply to every quotation we issue and every order that follows one. They are written to be read before you sign, not after something has gone wrong.',
    updatedOn: '2026-09-17',
    sections: [
      { id: 'who', heading: 'Who you are contracting with', body: [{ t: 'contact' }] },
      {
        id: 'quotation',
        heading: 'Quotations',
        body: [
          { t: 'p', text: 'Nothing on this website is priced. Every quotation is written for one enquiry, against the stock and the freight costs available at the time, and it states what it covers.' },
          { t: 'ul', items: [
            'A quotation is valid for **{quoteValidityDays} days** from issue unless it says otherwise. After that it lapses and we re-quote — not to extract more money, but because a consignment, an exchange rate and a nursery’s availability all move.',
            'It is an offer to sell the specimens described, in the scope described. Supply only, supply and delivery, and supply with delivery and planting are three different scopes and three different prices.',
            'Quantities and grades are as stated. A tree is quoted against a size band, not a measured height, because it keeps growing between the quotation and the delivery.',
          ] },
          { t: 'p', text: '{vat}' },
          { t: 'p', text: 'A quotation is priced against the exchange rate and the freight quoted to us on the day it is issued. Within its validity period the price is ours to honour and we will. Past it, those are the two things that move.' },
        ],
      },
      {
        id: 'order',
        heading: 'When an order exists',
        body: [
          { t: 'p', text: 'An order exists when you accept a quotation in writing — by email, by signed copy, or by purchase order referencing it — and we confirm it. Our confirmation is the point at which we commit stock and begin buying. Before that, nothing is reserved.' },
          { t: 'p', text: 'Where your purchase order carries its own printed conditions, they do not replace these. We will not accept terms nobody has read to us; if yours must apply, say so before we confirm and we will agree in writing which ones.' },
          { t: 'p', text: 'Once an order is confirmed, any change to it — specification, quantity, scope, delivery address — is only effective when both of us have agreed it in writing. A change agreed on the telephone and not written down is the commonest way a delivery goes wrong.' },
        ],
      },
      {
        id: 'lead-time',
        heading: 'Lead times, and why they are ranges',
        body: [
          { t: 'p', text: 'Typical lead time is **{leadMin}–{leadMax} weeks** from order confirmation to delivery on site: selection at the grower, phytosanitary certification and permits, the sailing, clearance, and acclimatisation on arrival.' },
          { t: 'p', text: 'A date we give you is an estimate made in good faith. Trees are living stock moving through customs on a ship, and the calendar constrains both ends — lifting season in Italy and the UAE summer both limit when a specimen can safely travel and establish.' },
          { t: 'p', text: '**We will not accept a delivery date that would cost you the tree.** If you need a species outside its window we will say so and propose either a different species or a different date. That is not us being difficult; it is the difference between a tree that establishes and one that dies in its first summer at your cost.' },
          { t: 'p', text: 'Time is not of the essence unless a quotation says so in those words. We are not liable for delay caused by anything outside our control — see the force majeure clause below — but we will tell you as soon as we know, not on the day it was due.' },
        ],
      },
      {
        id: 'import',
        heading: 'Import, permits and plant health',
        body: [
          { t: 'p', text: 'This is an import business, and a consignment of live plants crosses two sets of agricultural controls. Who does what:' },
          { t: 'dl', items: [
            { term: 'We obtain', def: 'The phytosanitary certificate issued at origin, the UAE import permit for the consignment, and the customs clearance. Unless a quotation says otherwise, we are the importer of record and those costs are inside the quoted price.' },
            { term: 'You obtain', def: 'Anything your own site or scheme needs — a landscape consent, a municipality approval, a developer’s plant schedule sign-off, access permits for the road the crane comes down. We will tell you what we think is needed, and it is still yours to hold.' },
            { term: 'Neither of us controls', def: 'Whether an inspector passes the consignment. Live plant material can be held, treated or refused at either border on a finding — a pest, a soil trace, a certificate that does not match the load.' },
          ] },
          { t: 'p', text: 'If an authority refuses, detains or orders the treatment or destruction of a consignment, we tell you the same day we are told. Where the finding is ours — wrong paperwork, material we should not have loaded — it is our cost and we replace or credit it in full. Where it follows from a control neither of us could have met at the time, we will re-source the specimen for the next consignment at the same price; if you would rather not wait, the order is cancelled and everything you have paid for that specimen is returned. **We do not keep money for a tree that never arrived.**' },
          { t: 'p', text: 'Some species, sizes and origins cannot be imported at all, or only in a particular season. We will say so before you commit, not after.' },
        ],
      },
      {
        id: 'delivery',
        heading: 'Delivery, access and offloading',
        body: [
          { t: 'p', text: 'Delivery is to the site named on the order, during working hours, on a date agreed in advance. Where offloading is in scope we bring the crane or hiab the root ball needs.' },
          { t: 'p', text: 'What we need from you, and what happens without it:' },
          { t: 'dl', items: [
            { term: 'Access confirmed before the date is agreed', def: 'Gate widths, overhead lines, ground bearing and the standing room a crane needs. We ask before scheduling. A low-loader that cannot turn into a site is a wasted day charged at cost.' },
            { term: 'Somebody there to receive it', def: 'With authority to sign. A failed delivery because nobody attended is re-charged, and the tree goes back onto a lorry it should not be on.' },
            { term: 'Somewhere to put it', def: 'Pits dug, or a shaded standing area with water. A specimen left in full sun on a slab on a July afternoon can be lost in a day.' },
          ] },
          { t: 'p', text: 'We may deliver an order in parts where it is sensible to, and each part is invoiced as it is delivered.' },
        ],
      },
      {
        id: 'site',
        heading: 'Safety on your site',
        body: [
          { t: 'p', text: 'A crane lifting a four-tonne root ball over a live site is the most dangerous ten minutes of this whole process, and it happens on ground you control.' },
          { t: 'p', text: 'You are responsible for the site being safe for the delivery: a firm and level standing area, the exclusion zone kept clear of people and vehicles while a lift is in progress, and anything overhead identified to us in advance. Our crew follow their own method statement and will stop a lift they judge unsafe. A lift stopped for that reason is rescheduled, and the return visit is charged at cost — which is a great deal cheaper than the alternative.' },
          { t: 'p', text: 'We carry public liability insurance and will produce the certificate on request before a delivery. It does not cover damage caused by ground, structures or services that were not disclosed to us.' },
        ],
      },
      {
        id: 'acceptance',
        heading: 'Checking the trees on arrival',
        body: [
          { t: 'p', text: '**Inspect the stock when it is offloaded, with our driver present.** This is the single most important paragraph on this page. Anything visibly wrong — the wrong specimen, a damaged root ball, a broken leader, a tree that travelled badly — must be raised then and noted on the delivery note, and photographed.' },
          { t: 'p', text: 'Raise it then and it is ours. Raise it three weeks later and neither of us can tell whether it arrived that way, and the answer will turn on irrigation and planting depth rather than on the consignment. That is not a technicality we hide behind: it is the honest limit of what anybody can establish after the fact.' },
          { t: 'p', text: 'Damage not visible on delivery, and anything else, is covered by the [replacements and refunds policy](/refunds), which sets out the windows and what we do.' },
        ],
      },
      {
        id: 'payment',
        heading: 'Payment',
        body: [
          { t: 'p', text: 'Payment terms are stated on the quotation. Because we buy, ship and clear stock before it reaches you, an order normally carries an advance against confirmation, with the balance on delivery. A project supplied in phases may carry a retention, released on the date the order states.' },
          { t: 'ul', items: [
            'Invoices are payable in {currency} unless agreed otherwise.',
            'Bank charges on a payment are yours; we should receive the invoiced amount.',
            'Overdue sums may carry interest at 1% a month from the due date. We would rather telephone you than charge it.',
            'Where an account is materially overdue we may hold further deliveries. We will tell you before we do, not by not arriving.',
            'Payment may not be withheld by set-off against a claim we have not agreed.',
          ] },
        ],
      },
      {
        id: 'title',
        heading: 'Title and risk',
        body: [
          { t: 'p', text: '**Risk** passes when the stock is offloaded at your site. From that moment its watering, shading and protection are yours.' },
          { t: 'p', text: '**Title** stays with us until the invoice for that stock is paid in full. Until then it remains our property, and we may recover it. In practice this matters only where an account goes badly wrong; it is on the page because it would be worse to leave it unsaid.' },
        ],
      },
      {
        id: 'cancellation',
        heading: 'Cancelling or changing an order',
        body: [
          { t: 'p', text: 'Tell us as early as you can. What it costs depends entirely on where the tree has got to:' },
          { t: 'dl', items: [
            { term: 'Before we have committed to the grower', def: 'Cancelled at no charge, and your advance is returned in full.' },
            { term: 'After selection, before it ships', def: 'The costs we have actually incurred — deposit to the nursery, certification, permits — are charged. The rest is returned.' },
            { term: 'Once it has sailed, or on arrival', def: 'A specimen selected to your specification cannot be put back. The order stands. If it is a species we can sell to somebody else we will try, and credit you what we recover, less costs — but we will not promise that in advance.' },
          ] },
          { t: 'p', text: 'Changes of specification are treated as a re-quotation, not an amendment, because they usually change which tree it is.' },
          { t: 'p', text: 'We may cancel an order ourselves only where we cannot lawfully or safely supply it — a refused consignment we cannot re-source, a species that turns out not to be importable. In that case everything you have paid for it is returned, and we do not charge you for the time it took to find out.' },
        ],
      },
      {
        id: 'force-majeure',
        heading: 'Events neither of us controls',
        body: [
          { t: 'p', text: 'Neither of us is in breach for failing to do something because of an event beyond reasonable control: weather, fire or flood; port congestion, vessel delay or the loss of a sailing; customs or agricultural inspection, quarantine, or a change in import rules; an act of government; war or civil disturbance; an epidemic affecting movement or labour; or a grower’s own failure caused by one of these.' },
          { t: 'p', text: 'Price movement is not force majeure. Nor is a supplier we simply chose badly. This clause covers what happens to the consignment, not what happens to our margin.' },
          { t: 'p', text: 'We will tell you promptly, do what can reasonably be done to work around it, and agree a new date with you. If the event puts delivery more than **ninety days** past the agreed date, either of us may cancel the affected part of the order, and you get back everything paid for anything not delivered.' },
        ],
      },
      {
        id: 'liability',
        heading: 'What we are responsible for',
        body: [
          { t: 'p', text: 'We are responsible for supplying stock that matches what was quoted, in sound condition, with the paperwork a consignment of live plants requires. Where we have not, the [replacements and refunds policy](/refunds) says what we do about it.' },
          { t: 'p', text: 'We are not responsible for what happens to a tree after it is planted by somebody else, in ground we did not prepare, on irrigation we did not design. Where planting is in our scope, it is ours.' },
          { t: 'p', text: 'To the extent the law allows, our liability for an order is limited to the value of that order, and we are not liable for loss of profit, loss of contract, delay to a wider programme, or other indirect loss. This does not limit liability for death or personal injury caused by our negligence, or for fraud.' },
        ],
      },
      {
        id: 'confidentiality',
        heading: 'Confidentiality',
        body: [
          { t: 'p', text: 'Drawings, plant schedules, tender documents and prices that either of us shares with the other for an order stay between us. We do not publish a client’s scheme, name a project or use a photograph of your site without asking you first, and a "no" costs you nothing.' },
          { t: 'p', text: 'This does not cover what is already public, what either of us knew beforehand, or what an authority or a court requires to be disclosed.' },
        ],
      },
      {
        id: 'conduct',
        heading: 'How we do business',
        body: [
          { t: 'p', text: 'Neither of us offers or accepts a bribe, a kickback or an improper payment in connection with an order, and neither of us asks the other’s staff for one. A quotation is priced to the customer, not to whoever signs it.' },
          { t: 'p', text: 'We comply with applicable sanctions and export controls, and we will not supply where doing so would breach them.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'Complaints and how they are handled',
        body: [
          { t: 'p', text: 'Send a complaint through the [enquiry form](/quote) or to the contact above, quoting the order reference. We acknowledge within **two working days**, tell you who is dealing with it, and give you an answer within **fifteen working days** — or, if a site visit or the grower is involved and it takes longer, a date by which you will have one.' },
          { t: 'p', text: 'A complaint about a specific tree — wrong, damaged or failing — is handled under the [replacements and refunds policy](/refunds), which has its own windows and evidence.' },
        ],
      },
      {
        id: 'general',
        heading: 'The rest of it',
        body: [
          { t: 'dl', items: [
            { term: 'Notices', def: 'A notice under these terms is valid if it is in writing, sent to the email address on the order or to the registered address above, and it takes effect when it arrives during working hours. A message to a driver or a site foreman is not a notice.' },
            { term: 'Subcontracting', def: 'We use growers, freight forwarders, clearing agents, crane operators and planting crews. We remain responsible to you for what they do on our behalf.' },
            { term: 'Assignment', def: 'Neither of us transfers this contract to somebody else without the other’s written agreement, except that we may transfer it to a company taking over this business.' },
            { term: 'Variation', def: 'A change to these terms or to an order is effective only in writing, agreed by both of us.' },
            { term: 'Entire agreement', def: 'The quotation, the order confirmation and these terms are the whole of the agreement, and they replace anything said beforehand. Nothing in this clause limits liability for anything said fraudulently.' },
            { term: 'If one clause fails', def: 'The rest still stands, and a clause a court will not enforce is read down to what it will.' },
            { term: 'Not enforcing something is not giving it up', def: 'A term we do not insist on once may still be insisted on later.' },
            { term: 'Other people', def: 'This contract is between you and us. Nobody else acquires a right to enforce it.' },
          ] },
        ],
      },
      {
        id: 'law',
        heading: 'Governing law, disputes and language',
        body: [
          { t: 'p', text: 'These terms are governed by the laws of the United Arab Emirates as applied in {city}.' },
          { t: 'p', text: 'Talk to us first — most disputes about a tree are a disagreement about what happened to it, and those are settled by going and looking. If that does not resolve it, each of us appoints somebody senior and they meet, in person or otherwise, within twenty working days. Only if that fails do the courts of {city} take jurisdiction, and they have it exclusively.' },
          { t: 'p', text: 'Nothing here stops either of us going to court immediately for an urgent injunction, or us recovering stock we still own under the title clause above.' },
          { t: 'p', text: 'This page is published in English, Arabic and Italian. The English text is the one that was written and reviewed; the other two are provided so that it can be read. Where they differ, the English governs — and the same is true of a quotation issued in more than one language.' },
        ],
      },
    ],
  },

  ar: {
    slug: 'terms-of-sale',
    title: 'شروط البيع',
    metaTitle: 'شروط البيع',
    metaDescription:
      'كيف يتحوّل عرض السعر إلى طلب: الأسعار، ومُهَل التنفيذ، وتصاريح الاستيراد، والتسليم والتنزيل، والاستلام في الموقع، والدفع، والملكية والمخاطر، وما يحدث حين يقع خطأ.',
    cardLine: 'كيف يتحوّل عرض السعر إلى طلب: مُهَل التنفيذ، والتسليم، والاستلام، والدفع، والملكية والمخاطر.',
    cardNote: 'هذه هي التي تُقرأ قبل التوقيع.',
    summary:
      'تنطبق هذه الشروط على كل عرض سعر نُصدره وكل طلب يترتّب عليه. وقد كُتبت لتُقرأ قبل أن توقّع، لا بعد أن يقع خطأ.',
    updatedOn: '2026-09-17',
    sections: [
      { id: 'who', heading: 'مع من تتعاقد', body: [{ t: 'contact' }] },
      {
        id: 'quotation',
        heading: 'عروض الأسعار',
        body: [
          { t: 'p', text: 'لا شيء على هذا الموقع مسعَّر. فكل عرض سعر يُكتب لاستفسار واحد، مقابل البضاعة وكلف الشحن المتاحة حينها، ويبيّن ما يشمله.' },
          { t: 'ul', items: [
            'عرض السعر صالح لمدة **{quoteValidityDays} يومًا** من إصداره ما لم يذكر خلاف ذلك. وبعدها يسقط ونعيد التسعير — لا لانتزاع مال أكثر، بل لأن الشحنة وسعر الصرف وتوفّر المشتل كلّها تتحرّك.',
            'وهو عرض لبيع الأشجار الموصوفة، ضمن النطاق الموصوف. فالتوريد وحده، والتوريد مع التسليم، والتوريد مع التسليم والزراعة، ثلاثة نطاقات مختلفة وثلاثة أسعار مختلفة.',
            'الكميات والدرجات كما هي مذكورة. وتُسعَّر الشجرة مقابل نطاق حجم، لا مقابل ارتفاع مقيس، لأنها تواصل النموّ بين عرض السعر والتسليم.',
          ] },
          { t: 'p', text: '{vat}' },
          { t: 'p', text: 'يُسعَّر العرض مقابل سعر الصرف وكلفة الشحن المعروضة علينا يوم إصداره. وخلال مدة صلاحيته فالسعر التزام علينا ونحن ملتزمون به. أما بعدها فهذان هما المتغيّران.' },
        ],
      },
      {
        id: 'order',
        heading: 'متى ينعقد الطلب',
        body: [
          { t: 'p', text: 'ينعقد الطلب حين تقبل عرض السعر كتابةً — بالبريد الإلكتروني، أو بنسخة موقّعة، أو بأمر شراء يحيل إليه — ونؤكّده نحن. وتأكيدنا هو اللحظة التي نلتزم فيها بالبضاعة ونبدأ الشراء. وقبل ذلك لا شيء محجوز.' },
          { t: 'p', text: 'وإن كان أمر الشراء لديك يحمل شروطه المطبوعة، فهي لا تحلّ محلّ هذه الشروط. ولن نقبل شروطًا لم يقرأها علينا أحد؛ فإن وجب سريان شروطك، فقل ذلك قبل التأكيد ونتّفق كتابةً على أيّها.' },
          { t: 'p', text: 'وبعد تأكيد الطلب، لا يسري أي تغيير عليه — في المواصفة أو الكمية أو النطاق أو عنوان التسليم — إلا باتفاق كتابي بيننا. فالتغيير المتّفق عليه هاتفيًّا ولم يُدوَّن هو أكثر أسباب فشل التسليم شيوعًا.' },
        ],
      },
      {
        id: 'lead-time',
        heading: 'مُهَل التنفيذ، ولماذا هي نطاقات',
        body: [
          { t: 'p', text: 'المهلة المعتادة **{leadMin}–{leadMax} أسبوعًا** من تأكيد الطلب إلى التسليم في الموقع: الانتقاء لدى المزارع، وشهادة الصحة النباتية والتصاريح، والإبحار، والتخليص، والتأقلم عند الوصول.' },
          { t: 'p', text: 'والتاريخ الذي نعطيك إياه تقدير بحسن نيّة. فالأشجار بضاعة حيّة تعبر الجمارك على متن سفينة، والتقويم يقيّد الطرفين — فموسم القلع في إيطاليا وصيف الإمارات كلاهما يحدّ متى يمكن لشجرة أن تسافر وتتأقلم بأمان.' },
          { t: 'p', text: '**لن نقبل تاريخ تسليم يكلّفك الشجرة.** فإن احتجت نوعًا خارج موسمه، سنقول لك ذلك ونقترح إما نوعًا آخر أو تاريخًا آخر. وليس هذا تعنّتًا منّا؛ بل هو الفرق بين شجرة تتأصّل وأخرى تموت في صيفها الأول على حسابك.' },
          { t: 'p', text: 'والوقت ليس عنصرًا جوهريًّا ما لم ينصّ عرض السعر على ذلك بهذه العبارة. ولسنا مسؤولين عن تأخير سببه أمر خارج عن إرادتنا — انظر بند القوة القاهرة أدناه — لكننا سنخبرك فور علمنا، لا في اليوم الموعود.' },
        ],
      },
      {
        id: 'import',
        heading: 'الاستيراد والتصاريح والصحة النباتية',
        body: [
          { t: 'p', text: 'هذا نشاط استيراد، وشحنة النباتات الحيّة تعبر منظومتَي رقابة زراعية. وتوزيع المهام كالتالي:' },
          { t: 'dl', items: [
            { term: 'نحن نستخرج', def: 'شهادة الصحة النباتية الصادرة في بلد المنشأ، وتصريح الاستيراد الإماراتي للشحنة، والتخليص الجمركي. وما لم ينصّ عرض السعر على خلاف ذلك، فنحن المستورد المسجّل وتلك الكلف داخلة في السعر المعروض.' },
            { term: 'أنت تستخرج', def: 'ما يحتاجه موقعك أو مخططك — موافقة تنسيق المواقع، أو موافقة البلدية، أو اعتماد جدول النباتات لدى المطوّر، أو تصاريح دخول الطريق الذي تسلكه الرافعة. وسنخبرك بما نراه لازمًا، ويبقى استخراجه عليك.' },
            { term: 'ولا أحد منّا يتحكّم في', def: 'ما إذا كان المفتّش سيمرّر الشحنة. فالمواد النباتية الحيّة قد تُحتجز أو تُعالج أو تُرفض على أي من الحدّين بناءً على اكتشاف — آفة، أو أثر تربة، أو شهادة لا تطابق الحمولة.' },
          ] },
          { t: 'p', text: 'وإن رفضت جهة رسمية شحنةً أو احتجزتها أو أمرت بمعالجتها أو إتلافها، نخبرك في اليوم نفسه الذي نُخبَر فيه. فإن كان الاكتشاف عائدًا إلينا — مستندات خاطئة، أو مواد ما كان ينبغي تحميلها — فالكلفة علينا ونستبدلها أو نقيّدها لك كاملة. وإن نشأ عن رقابة ما كان بوسع أحدنا استيفاؤها حينها، فسنعيد توفير الشجرة في الشحنة التالية بالسعر نفسه؛ وإن فضّلت ألّا تنتظر، يُلغى الطلب ويُعاد إليك كل ما دفعته عن تلك الشجرة. **نحن لا نحتفظ بمال شجرة لم تصل.**' },
          { t: 'p', text: 'وبعض الأنواع والأحجام والمناشئ لا يمكن استيرادها إطلاقًا، أو لا يمكن إلا في موسم بعينه. وسنقول ذلك قبل أن تلتزم، لا بعده.' },
        ],
      },
      {
        id: 'delivery',
        heading: 'التسليم والوصول والتنزيل',
        body: [
          { t: 'p', text: 'يتمّ التسليم في الموقع المذكور في الطلب، خلال ساعات العمل، في تاريخ يُتّفق عليه مسبقًا. وحيث يكون التنزيل ضمن النطاق، نُحضر الرافعة أو الونش الذي تحتاجه الكتلة الجذرية.' },
          { t: 'p', text: 'ما نحتاجه منك، وما يحدث بدونه:' },
          { t: 'dl', items: [
            { term: 'تأكيد إمكان الوصول قبل الاتفاق على التاريخ', def: 'عرض البوابات، والأسلاك العلوية، وتحمّل الأرض، ومساحة وقوف الرافعة. نسأل قبل الجدولة. فالمقطورة المنخفضة التي لا تستطيع الدوران إلى الموقع يوم ضائع يُحتسب بالتكلفة.' },
            { term: 'وجود من يستلم', def: 'ولديه صلاحية التوقيع. والتسليم الفاشل لعدم حضور أحد يُعاد احتسابه، وتعود الشجرة إلى شاحنة ما كان ينبغي أن تكون عليها.' },
            { term: 'مكان لوضعها', def: 'حُفَر مجهّزة، أو منطقة وقوف مظلّلة فيها ماء. فالشجرة المتروكة في شمس تموز على بلاطة قد تُفقد في يوم واحد.' },
          ] },
          { t: 'p', text: 'وقد نسلّم الطلب على دفعات حيث يكون ذلك معقولًا، وتُفوتَر كل دفعة عند تسليمها.' },
        ],
      },
      {
        id: 'site',
        heading: 'السلامة في موقعك',
        body: [
          { t: 'p', text: 'رفع رافعة لكتلة جذرية وزنها أربعة أطنان فوق موقع عامل هو أخطر عشر دقائق في هذه العملية كلها، ويحدث على أرض تسيطر عليها أنت.' },
          { t: 'p', text: 'وأنت مسؤول عن أن يكون الموقع آمنًا للتسليم: أرض وقوف صلبة ومستوية، ومنطقة حظر تُبقى خالية من الأشخاص والمركبات أثناء الرفع، وأي شيء علويّ يُعرَّف لنا مسبقًا. ويتّبع طاقمنا بيان طريقة العمل الخاص به وسيوقف أي رفعة يراها غير آمنة. والرفعة الموقوفة لهذا السبب تُعاد جدولتها، وتُحتسب زيارة العودة بالتكلفة — وهي أرخص بكثير من البديل.' },
          { t: 'p', text: 'ولدينا تأمين مسؤولية عامة، ونقدّم الشهادة عند الطلب قبل التسليم. وهي لا تغطّي ضررًا سببته أرض أو منشآت أو خدمات لم يُفصح لنا عنها.' },
        ],
      },
      {
        id: 'acceptance',
        heading: 'فحص الأشجار عند الوصول',
        body: [
          { t: 'p', text: '**افحص البضاعة عند تنزيلها وبحضور سائقنا.** هذه أهمّ فقرة في هذه الصفحة على الإطلاق. فأي خلل ظاهر — شجرة خاطئة، أو كتلة جذرية متضرّرة، أو قائد مكسور، أو شجرة ساءت حالها في الطريق — يجب إثارته حينها وتدوينه في إشعار التسليم وتصويره.' },
          { t: 'p', text: 'أثِره حينها فيكون علينا. أثِره بعد ثلاثة أسابيع فلن يستطيع أحد منّا معرفة ما إذا وصلت هكذا، وسيتوقف الجواب على الرَّي وعمق الزراعة لا على الشحنة. وليست هذه ذريعة نتستّر خلفها: إنها الحدّ الصادق لما يمكن لأي أحد إثباته بعد وقوع الأمر.' },
          { t: 'p', text: 'أما الضرر غير الظاهر عند التسليم، وكل ما عداه، فتغطّيه [سياسة الاستبدال والاسترجاع](/refunds) التي تبيّن المُهَل وما نفعله.' },
        ],
      },
      {
        id: 'payment',
        heading: 'الدفع',
        body: [
          { t: 'p', text: 'شروط الدفع مذكورة في عرض السعر. ولأننا نشتري ونشحن ونخلّص البضاعة قبل وصولها إليك، فإن الطلب يحمل عادةً دفعة مقدّمة عند التأكيد والرصيد عند التسليم. وقد يحمل المشروع المورَّد على مراحل مبلغًا محتجزًا يُفرج عنه في التاريخ المذكور في الطلب.' },
          { t: 'ul', items: [
            'تُسدَّد الفواتير بعملة {currency} ما لم يُتّفق على غير ذلك.',
            'رسوم البنك على الحوالة عليك؛ وينبغي أن يصلنا المبلغ المفوتَر.',
            'قد تحمل المبالغ المتأخرة فائدة بنسبة 1% شهريًّا من تاريخ الاستحقاق. ونفضّل الاتصال بك على احتسابها.',
            'وحيث يتأخّر الحساب تأخّرًا جوهريًّا، قد نوقف التسليمات اللاحقة. وسنخبرك قبل ذلك، لا بعدم الحضور.',
            'ولا يجوز حبس الدفع بالمقاصة مع مطالبة لم نوافق عليها.',
          ] },
        ],
      },
      {
        id: 'title',
        heading: 'الملكية والمخاطر',
        body: [
          { t: 'p', text: 'تنتقل **المخاطر** عند تنزيل البضاعة في موقعك. ومن تلك اللحظة يصبح رَيّها وتظليلها وحمايتها عليك.' },
          { t: 'p', text: 'وتبقى **الملكية** لنا حتى تُسدَّد فاتورة تلك البضاعة كاملة. وحتى ذلك الحين تظلّ ملكًا لنا ويجوز لنا استردادها. وعمليًّا لا يهمّ ذلك إلا حين يتعثّر حساب تعثّرًا شديدًا؛ وهو مذكور هنا لأن إغفاله أسوأ.' },
        ],
      },
      {
        id: 'cancellation',
        heading: 'إلغاء الطلب أو تعديله',
        body: [
          { t: 'p', text: 'أخبرنا في أبكر وقت ممكن. وتتوقف الكلفة كليًّا على المرحلة التي بلغتها الشجرة:' },
          { t: 'dl', items: [
            { term: 'قبل التزامنا تجاه المزارع', def: 'يُلغى دون رسوم، وتُعاد دفعتك المقدّمة كاملة.' },
            { term: 'بعد الانتقاء وقبل الشحن', def: 'تُحتسب الكلف التي تكبّدناها فعلًا — عربون المشتل، والشهادات، والتصاريح. ويُعاد الباقي.' },
            { term: 'بعد الإبحار أو عند الوصول', def: 'الشجرة المنتقاة وفق مواصفتك لا يمكن إعادتها. ويبقى الطلب قائمًا. وإن كان نوعًا يمكننا بيعه لغيرك فسنحاول، ونقيّد لك ما نستردّه بعد خصم الكلف — لكننا لن نعد بذلك مسبقًا.' },
          ] },
          { t: 'p', text: 'وتُعامَل تغييرات المواصفة كإعادة تسعير لا كتعديل، لأنها تغيّر عادةً هويّة الشجرة نفسها.' },
          { t: 'p', text: 'ولا نلغي نحن طلبًا إلا حيث يتعذّر علينا توريده قانونًا أو بأمان — شحنة مرفوضة يتعذّر إعادة توفيرها، أو نوع يتبيّن أنه غير قابل للاستيراد. وفي تلك الحال يُعاد إليك كل ما دفعته عنه، ولا نحاسبك على الوقت الذي استغرقه اكتشاف ذلك.' },
        ],
      },
      {
        id: 'force-majeure',
        heading: 'أحداث لا يتحكّم فيها أيّ منّا',
        body: [
          { t: 'p', text: 'لا يُعدّ أيّ منّا مخلًّا لعدم قيامه بأمر بسبب حدث خارج عن السيطرة المعقولة: الطقس أو الحريق أو الفيضان؛ ازدحام الموانئ أو تأخّر السفينة أو فوات رحلة بحرية؛ التفتيش الجمركي أو الزراعي أو الحجر الصحي أو تغيّر قواعد الاستيراد؛ إجراء حكومي؛ حرب أو اضطراب أهلي؛ وباء يؤثر على الحركة أو العمالة؛ أو إخفاق لدى المزارع نفسه ناجم عن أحد هذه الأسباب.' },
          { t: 'p', text: 'وتقلّب الأسعار ليس قوة قاهرة. وكذلك مورّد أسأنا نحن اختياره. فهذا البند يغطّي ما يحدث للشحنة، لا ما يحدث لهامش ربحنا.' },
          { t: 'p', text: 'وسنخبرك فورًا، ونبذل ما يمكن بذله بشكل معقول لتجاوز الأمر، ونتّفق معك على تاريخ جديد. وإن دفع الحدثُ التسليمَ إلى ما بعد **تسعين يومًا** من التاريخ المتفق عليه، جاز لأيّ منّا إلغاء الجزء المتأثر من الطلب، وتسترد كل ما دُفع مقابل ما لم يُسلَّم.' },
        ],
      },
      {
        id: 'liability',
        heading: 'ما نحن مسؤولون عنه',
        body: [
          { t: 'p', text: 'نحن مسؤولون عن توريد بضاعة مطابقة لما عُرض، بحالة سليمة، ومع المستندات التي تتطلبها شحنة نباتات حيّة. وحيث لم نفعل، تبيّن [سياسة الاستبدال والاسترجاع](/refunds) ما نفعله حيال ذلك.' },
          { t: 'p', text: 'ولسنا مسؤولين عمّا يحدث لشجرة بعد أن يزرعها غيرنا، في أرض لم نجهّزها، على ريّ لم نصمّمه. وحيث تكون الزراعة ضمن نطاقنا، فهي علينا.' },
          { t: 'p', text: 'وبالقدر الذي يجيزه القانون، تقتصر مسؤوليتنا عن أي طلب على قيمة ذلك الطلب، ولسنا مسؤولين عن فوات ربح أو خسارة عقد أو تأخّر برنامج أوسع أو أي خسارة غير مباشرة أخرى. ولا يحدّ ذلك من المسؤولية عن الوفاة أو الإصابة الجسدية الناجمة عن إهمالنا، أو عن الغش.' },
        ],
      },
      {
        id: 'confidentiality',
        heading: 'السرّية',
        body: [
          { t: 'p', text: 'المخططات وجداول النباتات ووثائق المناقصات والأسعار التي يتبادلها أيّ منّا مع الآخر لأجل طلب تبقى بيننا. فنحن لا ننشر مخطط عميل ولا نسمّي مشروعًا ولا نستخدم صورة لموقعك دون أن نستأذنك أولًا، ورفضك لا يكلّفك شيئًا.' },
          { t: 'p', text: 'ولا يشمل ذلك ما هو علنيّ أصلًا، ولا ما كان أيّ منّا يعلمه مسبقًا، ولا ما تفرض جهة رسمية أو محكمة الإفصاح عنه.' },
        ],
      },
      {
        id: 'conduct',
        heading: 'كيف نمارس العمل',
        body: [
          { t: 'p', text: 'لا يعرض أيّ منّا ولا يقبل رشوة أو عمولة غير مشروعة أو دفعة غير سليمة تتعلق بطلب، ولا يطلب أيّ منّا ذلك من موظفي الآخر. فعرض السعر يُسعَّر للعميل، لا لمن يوقّعه.' },
          { t: 'p', text: 'ونلتزم بالعقوبات وضوابط التصدير السارية، ولن نورّد حيث يشكّل ذلك مخالفةً لها.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'الشكاوى وكيفية معالجتها',
        body: [
          { t: 'p', text: 'أرسل الشكوى عبر [نموذج الاستفسار](/quote) أو إلى جهة الاتصال أعلاه، مع ذكر رقم الطلب. نُقرّ بالاستلام خلال **يومَي عمل**، ونخبرك بمن يتولّاها، ونعطيك جوابًا خلال **خمسة عشر يوم عمل** — أو، إن استلزم الأمر زيارة موقع أو مراجعة المزارع واستغرق وقتًا أطول، تاريخًا تحصل فيه على الجواب.' },
          { t: 'p', text: 'أما الشكوى المتعلقة بشجرة بعينها — خاطئة أو متضرّرة أو متدهورة — فتُعالَج بموجب [سياسة الاستبدال والاسترجاع](/refunds) التي لها مُهَلها وأدلّتها.' },
        ],
      },
      {
        id: 'general',
        heading: 'ما تبقّى',
        body: [
          { t: 'dl', items: [
            { term: 'الإخطارات', def: 'يكون الإخطار بموجب هذه الشروط صحيحًا إن كان كتابيًّا، ومرسَلًا إلى البريد الإلكتروني المذكور في الطلب أو إلى العنوان المسجّل أعلاه، ويسري عند وصوله خلال ساعات العمل. أما الرسالة إلى سائق أو مشرف موقع فليست إخطارًا.' },
            { term: 'التعاقد من الباطن', def: 'نستعين بمزارعين ووكلاء شحن ومخلّصين ومشغّلي رافعات وطواقم زراعة. ونبقى مسؤولين أمامك عمّا يفعلونه نيابةً عنّا.' },
            { term: 'التنازل', def: 'لا ينقل أيّ منّا هذا العقد إلى غيره دون موافقة الآخر الكتابية، إلا أنه يجوز لنا نقله إلى شركة تتولّى هذا النشاط.' },
            { term: 'التعديل', def: 'لا يسري تعديل هذه الشروط أو أي طلب إلا كتابةً وباتفاق الطرفين.' },
            { term: 'كامل الاتفاق', def: 'عرض السعر وتأكيد الطلب وهذه الشروط هي كامل الاتفاق، وتحلّ محلّ كل ما قيل قبلها. ولا شيء في هذا البند يحدّ من المسؤولية عن أي قول صادر بغشّ.' },
            { term: 'إن سقط بند', def: 'يبقى الباقي قائمًا، ويُقرأ البند الذي لا تُنفّذه المحكمة في أضيق حدّ تنفّذه فيه.' },
            { term: 'عدم المطالبة ليس تنازلًا', def: 'الشرط الذي لم نتمسّك به مرة يجوز التمسّك به لاحقًا.' },
            { term: 'الغير', def: 'هذا العقد بيننا وبينك. ولا يكتسب أي طرف آخر حقًّا في المطالبة بتنفيذه.' },
          ] },
        ],
      },
      {
        id: 'law',
        heading: 'القانون الواجب التطبيق والنزاعات واللغة',
        body: [
          { t: 'p', text: 'تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة كما تُطبَّق في {city}.' },
          { t: 'p', text: 'تحدّث إلينا أولًا — فمعظم النزاعات حول شجرة هي خلاف على ما جرى لها، وتُحسم بالذهاب والنظر. فإن لم يحلّ ذلك الأمر، يعيّن كلٌّ منّا شخصًا مسؤولًا ويجتمعان، حضوريًّا أو غير ذلك، خلال عشرين يوم عمل. وعندها فقط، إن أخفق ذلك، تختصّ محاكم {city}، ويكون اختصاصها حصريًّا.' },
          { t: 'p', text: 'ولا شيء هنا يمنع أيًّا منّا من اللجوء فورًا إلى القضاء لطلب أمر وقتي عاجل، ولا يمنعنا من استرداد بضاعة ما زلنا نملكها بموجب بند الملكية أعلاه.' },
          { t: 'p', text: 'تُنشر هذه الصفحة بالإنجليزية والعربية والإيطالية. والنص الإنجليزي هو النص الذي كُتب وروجع؛ أما النصّان الآخران فمقدَّمان ليُقرأ. وعند الاختلاف يُعتدّ بالنص الإنجليزي — وينطبق الأمر نفسه على عرض سعر صادر بأكثر من لغة.' },
        ],
      },
    ],
  },

  it: {
    slug: 'terms-of-sale',
    title: 'Condizioni di vendita',
    metaTitle: 'Condizioni di vendita',
    metaDescription:
      'Come un preventivo diventa un ordine: prezzi, tempi di consegna, permessi di importazione, consegna e scarico, accettazione in cantiere, pagamento, proprietà e rischio, e che cosa succede quando qualcosa va storto.',
    cardLine: 'Come un preventivo diventa un ordine: tempi, consegna, accettazione, pagamento, proprietà e rischio.',
    cardNote: 'Da leggere prima di firmare.',
    summary:
      'Si applicano a ogni preventivo che emettiamo e a ogni ordine che ne deriva. Sono scritte per essere lette prima di firmare, non dopo che qualcosa è andato storto.',
    updatedOn: '2026-09-17',
    sections: [
      { id: 'who', heading: 'Con chi state contrattando', body: [{ t: 'contact' }] },
      {
        id: 'quotation',
        heading: 'Preventivi',
        body: [
          { t: 'p', text: 'Nulla su questo sito ha un prezzo. Ogni preventivo è scritto per una singola richiesta, sulla base del materiale e dei costi di trasporto disponibili in quel momento, e dichiara che cosa comprende.' },
          { t: 'ul', items: [
            'Un preventivo è valido **{quoteValidityDays} giorni** dall’emissione salvo diversa indicazione. Poi decade e riquotiamo — non per estrarre più denaro, ma perché una spedizione, un cambio e la disponibilità di un vivaio si muovono tutti.',
            'È un’offerta di vendita degli esemplari descritti, nell’ambito descritto. Sola fornitura, fornitura con consegna e fornitura con consegna e messa a dimora sono tre ambiti diversi e tre prezzi diversi.',
            'Quantità e categorie sono quelle indicate. Un albero è quotato contro una fascia dimensionale, non un’altezza misurata, perché continua a crescere fra il preventivo e la consegna.',
          ] },
          { t: 'p', text: '{vat}' },
          { t: 'p', text: 'Un preventivo è calcolato sul cambio e sul nolo che ci vengono quotati il giorno in cui è emesso. Entro la sua validità il prezzo è un nostro impegno e lo manteniamo. Oltre, sono quelle le due cose che si muovono.' },
        ],
      },
      {
        id: 'order',
        heading: 'Quando esiste un ordine',
        body: [
          { t: 'p', text: 'Un ordine esiste quando accettate un preventivo per iscritto — via e-mail, con copia firmata o con ordine d’acquisto che lo richiama — e noi lo confermiamo. La nostra conferma è il momento in cui impegniamo il materiale e cominciamo ad acquistare. Prima di allora nulla è riservato.' },
          { t: 'p', text: 'Se il vostro ordine d’acquisto porta condizioni proprie stampate, queste non sostituiscono le presenti. Non accettiamo condizioni che nessuno ci ha letto; se le vostre devono applicarsi, ditelo prima che confermiamo e concorderemo per iscritto quali.' },
          { t: 'p', text: 'Dopo la conferma, qualunque modifica — specifica, quantità, ambito, indirizzo di consegna — ha effetto solo se concordata per iscritto da entrambi. Una modifica concordata al telefono e non messa per iscritto è il modo più comune in cui una consegna va storta.' },
        ],
      },
      {
        id: 'lead-time',
        heading: 'Tempi di consegna, e perché sono intervalli',
        body: [
          { t: 'p', text: 'Il tempo tipico è di **{leadMin}–{leadMax} settimane** dalla conferma dell’ordine alla consegna in cantiere: selezione presso il produttore, certificazione fitosanitaria e permessi, navigazione, sdoganamento e acclimatazione all’arrivo.' },
          { t: 'p', text: 'Una data che vi diamo è una stima fatta in buona fede. Gli alberi sono materiale vivo che attraversa la dogana su una nave, e il calendario stringe da entrambi i lati: la stagione di espianto in Italia e l’estate emiratina limitano entrambe quando un esemplare può viaggiare e attecchire in sicurezza.' },
          { t: 'p', text: '**Non accetteremo una data di consegna che vi costerebbe l’albero.** Se vi serve una specie fuori dalla sua finestra ve lo diremo e proporremo un’altra specie o un’altra data. Non è rigidità: è la differenza fra un albero che attecchisce e uno che muore alla prima estate, a vostre spese.' },
          { t: 'p', text: 'Il termine non è essenziale salvo che un preventivo lo dica con queste parole. Non rispondiamo dei ritardi dovuti a cause fuori dal nostro controllo — si veda la clausola di forza maggiore più avanti — ma ve lo diremo appena lo sappiamo, non il giorno della scadenza.' },
        ],
      },
      {
        id: 'import',
        heading: 'Importazione, permessi e sanità delle piante',
        body: [
          { t: 'p', text: 'Questa è un’attività di importazione, e una spedizione di piante vive attraversa due sistemi di controllo fitosanitario. Chi fa che cosa:' },
          { t: 'dl', items: [
            { term: 'Otteniamo noi', def: 'Il certificato fitosanitario emesso all’origine, il permesso di importazione emiratino per la spedizione e lo sdoganamento. Salvo diversa indicazione del preventivo, siamo noi l’importatore e quei costi sono compresi nel prezzo quotato.' },
            { term: 'Ottenete voi', def: 'Tutto ciò che serve al vostro cantiere o al vostro progetto: un’autorizzazione paesaggistica, un nulla osta comunale, l’approvazione dello schedario piante da parte dello sviluppatore, i permessi di accesso alla strada da cui arriva la gru. Vi diremo che cosa riteniamo necessario, e resta comunque vostro ottenerlo.' },
            { term: 'Nessuno dei due controlla', def: 'Se un ispettore lascerà passare la spedizione. Il materiale vegetale vivo può essere fermato, trattato o respinto a entrambe le frontiere per un riscontro: un parassita, una traccia di terreno, un certificato non corrispondente al carico.' },
          ] },
          { t: 'p', text: 'Se un’autorità respinge, trattiene o ordina il trattamento o la distruzione di una spedizione, ve lo diciamo lo stesso giorno in cui lo sappiamo. Dove il riscontro dipende da noi — documenti sbagliati, materiale che non avremmo dovuto caricare — il costo è nostro e sostituiamo o accreditiamo per intero. Dove deriva da un controllo che nessuno dei due avrebbe potuto soddisfare in quel momento, riapprovvigioneremo l’esemplare sulla spedizione successiva allo stesso prezzo; se preferite non aspettare, l’ordine è annullato e tutto quanto avete pagato per quell’esemplare vi viene restituito. **Non teniamo il denaro di un albero mai arrivato.**' },
          { t: 'p', text: 'Alcune specie, misure e origini non sono importabili affatto, o lo sono solo in una determinata stagione. Ve lo diremo prima che vi impegniate, non dopo.' },
        ],
      },
      {
        id: 'delivery',
        heading: 'Consegna, accesso e scarico',
        body: [
          { t: 'p', text: 'La consegna avviene al cantiere indicato nell’ordine, in orario di lavoro, in una data concordata in anticipo. Dove lo scarico rientra nell’ambito, portiamo la gru o l’autogrù che la zolla richiede.' },
          { t: 'p', text: 'Che cosa ci serve da voi, e che cosa succede senza:' },
          { t: 'dl', items: [
            { term: 'Accesso confermato prima di fissare la data', def: 'Larghezza dei cancelli, linee aeree, portanza del terreno e lo spazio di stazionamento che serve alla gru. Lo chiediamo prima di programmare. Un pianale che non riesce a svoltare in cantiere è una giornata persa, addebitata a costo.' },
            { term: 'Qualcuno presente a ricevere', def: 'Con potere di firma. Una consegna fallita perché non c’era nessuno viene riaddebitata, e l’albero torna su un camion su cui non dovrebbe stare.' },
            { term: 'Un posto dove metterlo', def: 'Buche già scavate, oppure un’area di sosta ombreggiata con acqua. Un esemplare lasciato in pieno sole su una soletta in un pomeriggio di luglio si può perdere in un giorno.' },
          ] },
          { t: 'p', text: 'Possiamo consegnare un ordine in più parti dove ha senso, e ogni parte è fatturata alla consegna.' },
        ],
      },
      {
        id: 'site',
        heading: 'Sicurezza nel vostro cantiere',
        body: [
          { t: 'p', text: 'Una gru che solleva una zolla da quattro tonnellate sopra un cantiere attivo è il quarto d’ora più pericoloso di tutto il processo, e avviene su un terreno che controllate voi.' },
          { t: 'p', text: 'Siete responsabili della sicurezza del cantiere per la consegna: un’area di stazionamento solida e in piano, la zona di esclusione tenuta libera da persone e mezzi durante il sollevamento, e qualsiasi ostacolo aereo segnalato a noi in anticipo. La nostra squadra segue la propria procedura e interromperà un sollevamento che giudichi non sicuro. Un sollevamento interrotto per questo motivo viene riprogrammato e il rientro è addebitato a costo — cosa molto più economica dell’alternativa.' },
          { t: 'p', text: 'Abbiamo una polizza di responsabilità civile e ne produciamo il certificato su richiesta prima di una consegna. Non copre i danni causati da terreno, strutture o sottoservizi che non ci sono stati dichiarati.' },
        ],
      },
      {
        id: 'acceptance',
        heading: 'Controllare gli alberi all’arrivo',
        body: [
          { t: 'p', text: '**Ispezionate il materiale allo scarico, con il nostro autista presente.** È il paragrafo più importante di questa pagina. Qualsiasi cosa visibilmente errata — l’esemplare sbagliato, una zolla danneggiata, una cima spezzata, un albero che ha viaggiato male — va sollevata in quel momento, annotata sul documento di trasporto e fotografata.' },
          { t: 'p', text: 'Sollevata allora, è nostra. Sollevata tre settimane dopo, nessuno dei due può dire se fosse già così all’arrivo, e la risposta dipenderà dall’irrigazione e dalla profondità di impianto anziché dalla spedizione. Non è un cavillo dietro cui ci nascondiamo: è l’onesto limite di ciò che chiunque può accertare a posteriori.' },
          { t: 'p', text: 'Il danno non visibile alla consegna, e tutto il resto, è coperto dalla [politica di sostituzioni e rimborsi](/refunds), che stabilisce i termini e che cosa facciamo.' },
        ],
      },
      {
        id: 'payment',
        heading: 'Pagamento',
        body: [
          { t: 'p', text: 'Le condizioni di pagamento sono indicate nel preventivo. Poiché acquistiamo, spediamo e sdoganiamo il materiale prima che vi raggiunga, un ordine prevede normalmente un acconto alla conferma e il saldo alla consegna. Un progetto fornito per fasi può prevedere una ritenuta, svincolata alla data indicata nell’ordine.' },
          { t: 'ul', items: [
            'Le fatture sono pagabili in {currency} salvo diverso accordo.',
            'Le spese bancarie sul pagamento sono a vostro carico; a noi deve arrivare l’importo fatturato.',
            'Gli importi scaduti possono maturare interessi all’1% mensile dalla scadenza. Preferiamo telefonarvi piuttosto che addebitarli.',
            'Se un conto è scaduto in misura rilevante possiamo sospendere le consegne successive. Ve lo diremo prima di farlo, non non presentandoci.',
            'Il pagamento non può essere trattenuto in compensazione con una pretesa che non abbiamo accettato.',
          ] },
        ],
      },
      {
        id: 'title',
        heading: 'Proprietà e rischio',
        body: [
          { t: 'p', text: 'Il **rischio** passa allo scarico presso il vostro cantiere. Da quel momento l’irrigazione, l’ombreggiamento e la protezione sono vostri.' },
          { t: 'p', text: 'La **proprietà** resta nostra fino al pagamento integrale della fattura relativa a quel materiale. Fino ad allora resta cosa nostra e possiamo recuperarla. In pratica rileva solo quando un conto va molto male; è in pagina perché sarebbe peggio tacerlo.' },
        ],
      },
      {
        id: 'cancellation',
        heading: 'Annullare o modificare un ordine',
        body: [
          { t: 'p', text: 'Ditecelo il prima possibile. Il costo dipende interamente da dove è arrivato l’albero:' },
          { t: 'dl', items: [
            { term: 'Prima che ci siamo impegnati con il produttore', def: 'Annullato senza addebito e l’acconto è restituito per intero.' },
            { term: 'Dopo la selezione, prima della spedizione', def: 'Vengono addebitati i costi effettivamente sostenuti — caparra al vivaio, certificazioni, permessi. Il resto è restituito.' },
            { term: 'Una volta salpato, o all’arrivo', def: 'Un esemplare selezionato sulla vostra specifica non si può rimettere indietro. L’ordine resta. Se è una specie che possiamo vendere ad altri ci proveremo e vi accrediteremo quanto recuperato, al netto dei costi — ma non lo promettiamo in anticipo.' },
          ] },
          { t: 'p', text: 'Le modifiche di specifica sono trattate come una riquotazione e non come una variante, perché di norma cambiano quale albero sia.' },
          { t: 'p', text: 'Annulliamo noi un ordine solo quando non possiamo fornirlo legalmente o in sicurezza — una spedizione respinta che non riusciamo a riapprovvigionare, una specie che si rivela non importabile. In quel caso vi viene restituito tutto quanto avete pagato, e non vi addebitiamo il tempo che è servito per scoprirlo.' },
        ],
      },
      {
        id: 'force-majeure',
        heading: 'Eventi che nessuno dei due controlla',
        body: [
          { t: 'p', text: 'Nessuno dei due è inadempiente per non aver fatto qualcosa a causa di un evento fuori dal controllo ragionevole: maltempo, incendio o alluvione; congestione portuale, ritardo della nave o perdita di una partenza; ispezione doganale o fitosanitaria, quarantena o modifica delle regole di importazione; un atto dell’autorità; guerra o disordini civili; un’epidemia che incida su movimenti o manodopera; o l’inadempimento di un produttore causato da una di queste cose.' },
          { t: 'p', text: 'L’oscillazione dei prezzi non è forza maggiore. E neppure un fornitore che abbiamo semplicemente scelto male. Questa clausola copre ciò che accade alla spedizione, non ciò che accade al nostro margine.' },
          { t: 'p', text: 'Ve lo comunicheremo prontamente, faremo quanto ragionevolmente possibile per aggirarlo e concorderemo con voi una nuova data. Se l’evento sposta la consegna oltre **novanta giorni** dalla data concordata, ciascuno dei due può annullare la parte di ordine interessata, e vi viene restituito tutto quanto pagato per ciò che non è stato consegnato.' },
        ],
      },
      {
        id: 'liability',
        heading: 'Di che cosa rispondiamo',
        body: [
          { t: 'p', text: 'Rispondiamo di fornire materiale conforme a quanto quotato, in buone condizioni, con la documentazione che una spedizione di piante vive richiede. Dove non lo abbiamo fatto, la [politica di sostituzioni e rimborsi](/refunds) dice che cosa facciamo.' },
          { t: 'p', text: 'Non rispondiamo di ciò che accade a un albero dopo che è stato piantato da altri, in un terreno che non abbiamo preparato, su un impianto che non abbiamo progettato. Dove la messa a dimora rientra nel nostro ambito, è nostra.' },
          { t: 'p', text: 'Nei limiti consentiti dalla legge, la nostra responsabilità per un ordine è limitata al valore di quell’ordine, e non rispondiamo di mancato guadagno, perdita di contratto, ritardo di un programma più ampio o altre perdite indirette. Ciò non limita la responsabilità per morte o lesioni personali causate da nostra negligenza, né per dolo.' },
        ],
      },
      {
        id: 'confidentiality',
        heading: 'Riservatezza',
        body: [
          { t: 'p', text: 'Disegni, schedari piante, documenti di gara e prezzi che l’uno condivide con l’altro per un ordine restano fra noi. Non pubblichiamo il progetto di un cliente, non nominiamo un cantiere e non usiamo una fotografia del vostro sito senza chiedervelo prima, e un rifiuto non vi costa nulla.' },
          { t: 'p', text: 'Restano fuori le informazioni già pubbliche, quelle già note a uno dei due e quelle di cui un’autorità o un giudice imponga la divulgazione.' },
        ],
      },
      {
        id: 'conduct',
        heading: 'Come facciamo impresa',
        body: [
          { t: 'p', text: 'Nessuno dei due offre o accetta tangenti, provvigioni occulte o pagamenti impropri in relazione a un ordine, e nessuno dei due li chiede al personale dell’altro. Un preventivo è quotato per il cliente, non per chi lo firma.' },
          { t: 'p', text: 'Rispettiamo le sanzioni e i controlli sulle esportazioni applicabili, e non forniremo dove ciò li violerebbe.' },
        ],
      },
      {
        id: 'complaints',
        heading: 'Reclami e come sono gestiti',
        body: [
          { t: 'p', text: 'Inviate un reclamo tramite il [modulo di richiesta](/quote) o al recapito indicato sopra, citando il riferimento dell’ordine. Riscontriamo entro **due giorni lavorativi**, vi diciamo chi se ne occupa e vi diamo una risposta entro **quindici giorni lavorativi** — oppure, se serve un sopralluogo o è coinvolto il produttore e occorre più tempo, una data entro cui l’avrete.' },
          { t: 'p', text: 'Un reclamo su un albero specifico — sbagliato, danneggiato o in sofferenza — è gestito secondo la [politica di sostituzioni e rimborsi](/refunds), che ha termini e prove proprie.' },
        ],
      },
      {
        id: 'general',
        heading: 'Il resto',
        body: [
          { t: 'dl', items: [
            { term: 'Comunicazioni', def: 'Una comunicazione ai sensi di queste condizioni è valida se è scritta, inviata all’indirizzo e-mail indicato nell’ordine o alla sede indicata sopra, e ha effetto quando arriva in orario di lavoro. Un messaggio a un autista o a un capocantiere non è una comunicazione.' },
            { term: 'Subappalto', def: 'Ci avvaliamo di vivai, spedizionieri, agenzie doganali, gruisti e squadre di impianto. Restiamo responsabili verso di voi di ciò che fanno per nostro conto.' },
            { term: 'Cessione', def: 'Nessuno dei due trasferisce questo contratto ad altri senza l’accordo scritto dell’altro, salvo che noi possiamo trasferirlo a una società che subentri in questa attività.' },
            { term: 'Modifiche', def: 'Una modifica a queste condizioni o a un ordine ha effetto solo per iscritto e concordata da entrambi.' },
            { term: 'Intero accordo', def: 'Il preventivo, la conferma d’ordine e queste condizioni sono l’intero accordo e sostituiscono quanto detto in precedenza. Nulla in questa clausola limita la responsabilità per dichiarazioni fraudolente.' },
            { term: 'Se una clausola cade', def: 'Il resto resta in piedi, e una clausola che un giudice non applica è ridotta a ciò che applicherebbe.' },
            { term: 'Non far valere non è rinunciare', def: 'Una previsione su cui non abbiamo insistito una volta può essere fatta valere in seguito.' },
            { term: 'Terzi', def: 'Questo contratto è fra voi e noi. Nessun altro acquisisce il diritto di farlo valere.' },
          ] },
        ],
      },
      {
        id: 'law',
        heading: 'Legge applicabile, controversie e lingua',
        body: [
          { t: 'p', text: 'Queste condizioni sono regolate dalle leggi degli Emirati Arabi Uniti come applicate a {city}.' },
          { t: 'p', text: 'Parlatene prima con noi: la maggior parte delle controversie su un albero è un disaccordo su che cosa gli sia successo, e si risolvono andando a guardare. Se questo non basta, ciascuno nomina un proprio referente senior e questi si incontrano, di persona o altrimenti, entro venti giorni lavorativi. Solo se anche questo fallisce sono competenti i tribunali di {city}, in via esclusiva.' },
          { t: 'p', text: 'Nulla qui impedisce a ciascuno di rivolgersi subito al giudice per un provvedimento d’urgenza, né a noi di recuperare materiale ancora di nostra proprietà ai sensi della clausola sulla proprietà.' },
          { t: 'p', text: 'Questa pagina è pubblicata in inglese, arabo e italiano. Il testo inglese è quello redatto e verificato; gli altri due sono forniti perché possa essere letto. In caso di difformità prevale l’inglese — e lo stesso vale per un preventivo emesso in più di una lingua.' },
        ],
      },
    ],
  },
};
