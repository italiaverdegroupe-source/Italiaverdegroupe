import type { LegalSet } from './types';

/**
 * Replacements and refunds.
 *
 * Filled in on the way here: who pays to take a rejected tree away, what
 * happens when the replacement itself cannot be sourced, how a refund is
 * actually paid and in what currency, the outside limit on bringing a claim at
 * all, what happens when we disagree after the visit, and that none of it cuts
 * down a statutory right.
 */
export const refunds: LegalSet = {
  en: {
    slug: 'refunds',
    title: 'Replacements & refunds',
    metaTitle: 'Replacements & refunds',
    metaDescription:
      'What happens when a tree arrives wrong, arrives damaged, or fails after planting — the windows, the evidence, who pays for what, and how a refund is made.',
    cardLine: 'What happens when a tree arrives wrong, arrives damaged, or fails after planting.',
    cardNote: 'Windows, evidence, and what we do.',
    summary:
      'A tree is not a product you can send back in its box. This page says plainly what we replace, what we refund, what we will not, and how long you have — so that nobody discovers the answer during an argument.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'principle',
        heading: 'The principle',
        body: [
          { t: 'p', text: 'If we sent the wrong thing, or sent it in poor condition, that is ours to put right and we will. If a sound tree was planted badly, watered badly or planted in the wrong season by somebody else, that is not.' },
          { t: 'p', text: 'Most failures in the first season trace to irrigation or planting depth, and most of them are recoverable if we hear about them early. **Tell us early.** A photograph in week two is worth more than a claim in month four, to you as well as to us.' },
        ],
      },
      {
        id: 'on-delivery',
        heading: 'Something is wrong on delivery',
        body: [
          { t: 'p', text: 'Check the stock as it is offloaded, with our driver present. If anything is visibly wrong:' },
          { t: 'ul', items: [
            'Note it on the delivery note before the driver leaves',
            'Photograph it there, on the lorry or on the ground',
            'Do not plant it',
          ] },
          { t: 'p', text: 'Then, at our cost and our choice:' },
          { t: 'dl', items: [
            { term: 'The wrong specimen, species or grade', def: 'Taken back and replaced with what was ordered, or the line credited in full. If the correct specimen cannot be sourced within a workable window, we credit it — we do not hold you to a substitute you did not ask for.' },
            { term: 'Damaged in transit', def: 'Replaced or credited. A broken leader, a split root ball or a crushed crown is not something you should have to accept and then argue about.' },
            { term: 'Short delivery', def: 'The missing units are delivered on the next run at our cost, or removed from the invoice, whichever you prefer.' },
          ] },
          { t: 'p', text: '**Taking it away is our cost, not yours.** Collection, return freight and any re-handling of a specimen we agree was wrong or damaged are ours. You are asked only not to plant it and to keep it watered and shaded until we collect — a rejected tree is still a living thing, and one that dies standing on your site while we arrange a lorry helps nobody.' },
          { t: 'note', text: '**Why the delivery note matters.** Once a tree is off the lorry and on your site, neither of us can prove what arrived and what happened afterwards. Raised on the day it is straightforwardly ours. Raised in week three it becomes a disagreement about irrigation that nobody can settle. That is the honest reason for the window, not a way of getting out of things.' },
        ],
      },
      {
        id: 'first-days',
        heading: 'Within seven days of delivery',
        body: [
          { t: 'p', text: 'Damage that was not visible on the day — root damage inside the ball, a pest that appears once the tree is out of transit — is covered for **seven days** from delivery. Send us photographs and the reference number and we will come and look, or ask for more pictures if that settles it faster.' },
          { t: 'p', text: 'If the tree was not sound when it left us, it is replaced or credited. If it was sound and something on site has damaged it, we will tell you that as well — and tell you what to do about it, which is usually worth more than the argument.' },
        ],
      },
      {
        id: 'establishment',
        heading: 'A tree that fails after planting',
        body: [
          { t: 'p', text: 'Where **we planted it** — pit preparation, soil amendment, staking and irrigation connection all in our scope — we stand behind establishment for **ninety days** from planting, provided the irrigation we specified has actually been run. A specimen that fails in that period is replaced once, at our cost, in the next suitable planting window.' },
          { t: 'p', text: 'Where **somebody else planted it**, establishment is not something we can warrant, because every factor that decides it was out of our hands. What we will still do is come and look, tell you what we think went wrong, and if the specimen itself was at fault, put it right. We have done that before and we will again.' },
          { t: 'p', text: 'What no establishment cover extends to, anywhere:' },
          { t: 'ul', items: [
            'Drought, or an irrigation system that was off, blocked or never commissioned',
            'Over-watering and waterlogging, which kills more imported trees here than drought',
            'Planting too deep — the commonest cause of a slow death over two years',
            'Storm, flood, fire, vandalism or vehicle damage',
            'Herbicide, salt or construction spoil in the pit',
            'Moving the tree again after we delivered it',
            'A species planted outside the window we advised against in writing',
          ] },
          { t: 'p', text: 'A replacement is the same species and grade. If it genuinely cannot be sourced — the size has gone out of the market, the season has closed on it — we will offer the nearest equivalent for you to accept or refuse, and if you refuse, we credit it. You are never left holding a substitute you did not choose.' },
        ],
      },
      {
        id: 'not-returnable',
        heading: 'What cannot be returned because you changed your mind',
        body: [
          { t: 'p', text: 'Every specimen we supply is selected for one order at a named nursery, certified, shipped and cleared for it. It cannot go back on a ship, and there is no shelf for it to return to.' },
          { t: 'p', text: 'So a tree that is exactly what was quoted, arrived sound and was accepted on delivery is not returnable for a change of plan, a changed drawing, or a project that stalled. That is the honest position and we would rather state it here than imply otherwise and argue later.' },
          { t: 'p', text: 'If a project stalls, talk to us. We can often hold stock, phase it, or take a specimen into another order. Those are things we do because they are sensible, not because this page obliges us to — and they work far better before the lorry is loaded.' },
        ],
      },
      {
        id: 'how',
        heading: 'How to make a claim',
        body: [
          { t: 'ol', items: [
            '**Send it with the reference number.** Every order and every enquiry has one; it is on the quotation and the delivery note.',
            '**Photographs.** The whole tree, the trunk base where it meets the soil, the foliage, and the pit or root ball if it is planted. Daylight, not a floodlight.',
            '**What has been done to it.** When it was planted, how it is watered and how often. This is not us building a defence — it is the fastest route to knowing what is actually wrong.',
          ] },
          { t: 'p', text: 'We acknowledge within two working days and tell you what happens next. Where a visit is needed we arrange it within five, subject to access. Where a decision needs the grower, it can take longer, and we will tell you a date rather than leave it open.' },
          { t: 'p', text: 'Credits go against the invoice for the order. Where a refund is due in money it is paid to the account the payment came from, in the currency it was paid in, within fourteen days of agreeing it. We do not offset a refund against another invoice without asking you first.' },
          { t: 'p', text: 'Outside all of the above, a claim about a consignment should reach us within **twelve months** of delivery. Past that, a tree has had a full year of a site’s weather, irrigation and management on it, and nobody can honestly say what the consignment is answerable for.' },
        ],
      },
      {
        id: 'disagree',
        heading: 'If we disagree',
        body: [
          { t: 'p', text: 'Say so. Most disputes about a tree are a disagreement about what happened to it, and those are settled by somebody going and looking, not by exchanging letters.' },
          { t: 'p', text: 'If a visit does not settle it, either of us may ask for an independent arborist or horticulturist to look, agreed between us. Their view is not binding on either of us, but in practice it usually ends the matter; whoever’s position it goes against pays for the report.' },
          { t: 'p', text: 'A complaint about how we handled a claim — as opposed to the claim itself — goes through the [enquiry form](/quote) with the order reference. We acknowledge it within **two working days** and answer it within **fifteen working days**, naming the person dealing with it. It is not handled by whoever made the decision you are complaining about.' },
          { t: 'p', text: 'If we still disagree after that, the [terms of sale](/terms-of-sale) govern, including their escalation and jurisdiction clause.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'statutory',
        heading: 'Your rights under the law',
        body: [
          { t: 'p', text: 'Nothing on this page removes or reduces a right you have under UAE consumer or commercial law, and nothing on it is intended to. Where a legal right gives you more than this policy does, the legal right applies.' },
          { t: 'p', text: 'The windows here are ours to set and we set them at the point past which nobody can honestly establish what happened. They are not a way of shortening something the law gives you.' },
        ],
      },
      {
        id: 'law',
        heading: 'Governing law and language',
        body: [
          { t: 'p', text: 'This policy is governed by the laws of the United Arab Emirates as applied in {city}, and forms part of the [terms of sale](/terms-of-sale) for every order.' },
          { t: 'p', text: 'This page is published in English, Arabic and Italian. The English text is the one that was written and reviewed; the other two are provided so that it can be read. Where they differ, the English governs.' },
        ],
      },
    ],
    footnote:
      'These windows are ours, set because they are the point past which nobody can honestly establish what happened. They are not a limit on being reasonable: if you are inside the spirit of this page and outside its dates, ask anyway.',
  },

  ar: {
    slug: 'refunds',
    title: 'الاستبدال والاسترجاع',
    metaTitle: 'الاستبدال والاسترجاع',
    metaDescription:
      'ما يحدث حين تصل شجرة خاطئة، أو تصل متضرّرة، أو تفشل بعد الزراعة — المُهَل، والأدلّة، ومن يتحمّل ماذا، وكيف يتمّ الاسترجاع.',
    cardLine: 'ما يحدث حين تصل شجرة خاطئة، أو تصل متضرّرة، أو تفشل بعد الزراعة.',
    cardNote: 'المُهَل، والأدلّة، وما نفعله.',
    summary:
      'الشجرة ليست منتجًا يمكنك إعادته في علبته. تقول هذه الصفحة بوضوح ما الذي نستبدله، وما الذي نسترجع ثمنه، وما الذي لن نفعله، وكم من الوقت أمامك — حتى لا يكتشف أحد الجواب في خضمّ خلاف.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'principle',
        heading: 'المبدأ',
        body: [
          { t: 'p', text: 'إن أرسلنا الشيء الخطأ، أو أرسلناه بحال سيئة، فذلك علينا أن نصلحه وسنفعل. أما إن زُرعت شجرة سليمة زراعةً سيئة، أو سُقيت سقيًا سيئًا، أو زُرعت في الموسم الخطأ على يد غيرنا، فذلك ليس علينا.' },
          { t: 'p', text: 'ومعظم حالات الفشل في الموسم الأول ترجع إلى الرَّي أو عمق الزراعة، ومعظمها قابل للتدارك إن سمعنا به مبكرًا. **أخبرنا مبكرًا.** فصورة في الأسبوع الثاني أثمن من مطالبة في الشهر الرابع، لك كما لنا.' },
        ],
      },
      {
        id: 'on-delivery',
        heading: 'خلل عند التسليم',
        body: [
          { t: 'p', text: 'افحص البضاعة أثناء تنزيلها بحضور سائقنا. فإن كان شيء خاطئًا بشكل ظاهر:' },
          { t: 'ul', items: [
            'دوّنه في إشعار التسليم قبل مغادرة السائق',
            'صوّره هناك، على الشاحنة أو على الأرض',
            'لا تزرعه',
          ] },
          { t: 'p', text: 'ثم، على حسابنا وباختيارنا:' },
          { t: 'dl', items: [
            { term: 'شجرة أو نوع أو درجة خاطئة', def: 'تُعاد وتُستبدل بما طُلب، أو يُقيَّد البند كاملًا لك. وإن تعذّر توفير الشجرة الصحيحة ضمن مهلة عملية، نقيّدها لك — ولا نلزمك ببديل لم تطلبه.' },
            { term: 'تضرّر أثناء النقل', def: 'تُستبدل أو تُقيَّد. فالقائد المكسور أو الكتلة الجذرية المتشقّقة أو التاج المهروس ليست أمورًا يُفترض أن تقبلها ثم تتجادل بشأنها.' },
            { term: 'نقص في الكمية', def: 'تُسلَّم الوحدات الناقصة في الرحلة التالية على حسابنا، أو تُحذف من الفاتورة، أيّهما تفضّل.' },
          ] },
          { t: 'p', text: '**الإعادة على حسابنا لا حسابك.** فالتحميل وأجرة الشحن العائد وأي مناولة إضافية لشجرة نتفق على أنها خاطئة أو متضرّرة كلها علينا. ولا يُطلب منك سوى ألّا تزرعها وأن تُبقيها مرويّة ومظلّلة حتى نستلمها — فالشجرة المرفوضة كائن حيّ، وموتها واقفةً في موقعك بينما نرتّب شاحنة لا يفيد أحدًا.' },
          { t: 'note', text: '**لماذا يهمّ إشعار التسليم.** بمجرد نزول الشجرة من الشاحنة إلى موقعك، لا يستطيع أيّ منّا إثبات ما وصل وما حدث بعده. فالمثار في يومه يكون علينا ببساطة. والمثار في الأسبوع الثالث يصير خلافًا حول الرَّي لا يستطيع أحد حسمه. وهذا هو السبب الصادق للمهلة، لا وسيلة للتهرّب.' },
        ],
      },
      {
        id: 'first-days',
        heading: 'خلال سبعة أيام من التسليم',
        body: [
          { t: 'p', text: 'الضرر غير الظاهر يوم التسليم — ضرر في الجذور داخل الكتلة، أو آفة تظهر بعد خروج الشجرة من النقل — مغطّى لمدة **سبعة أيام** من التسليم. أرسل إلينا الصور والرقم المرجعي وسنأتي وننظر، أو نطلب صورًا إضافية إن كان ذلك يحسم الأمر أسرع.' },
          { t: 'p', text: 'فإن لم تكن الشجرة سليمة حين غادرتنا، تُستبدل أو تُقيَّد. وإن كانت سليمة وأتلفها شيء في الموقع، فسنقول لك ذلك أيضًا — ونقول لك ما العمل، وهو عادةً أثمن من الجدال.' },
        ],
      },
      {
        id: 'establishment',
        heading: 'شجرة تفشل بعد الزراعة',
        body: [
          { t: 'p', text: 'حيث **زرعناها نحن** — تجهيز الحفرة وتحسين التربة والدعامات وتوصيل الرَّي كلها ضمن نطاقنا — نضمن التأصّل لمدة **تسعين يومًا** من الزراعة، شريطة أن يكون الرَّي الذي حدّدناه قد شُغّل فعلًا. والشجرة التي تفشل خلال تلك المدة تُستبدل مرة واحدة على حسابنا في أول موسم زراعة مناسب.' },
          { t: 'p', text: 'وحيث **زرعها غيرنا**، فالتأصّل ليس أمرًا يمكننا ضمانه، لأن كل عامل يقرّره كان خارج أيدينا. ومع ذلك سنأتي وننظر ونقول لك ما نظنّ أنه حدث، وإن كانت الشجرة نفسها هي العيب، أصلحناه. فعلنا ذلك من قبل وسنفعله ثانية.' },
          { t: 'p', text: 'وما لا تمتدّ إليه أي تغطية تأصّل، في أي حال:' },
          { t: 'ul', items: [
            'الجفاف، أو نظام ريّ كان مطفأً أو مسدودًا أو لم يُشغَّل أصلًا',
            'الإفراط في الري والتشبّع بالماء، وهو يقتل من الأشجار المستوردة هنا أكثر مما يقتل الجفاف',
            'الزراعة العميقة أكثر من اللازم — أشهر أسباب الموت البطيء على مدى سنتين',
            'العواصف والفيضانات والحرائق والتخريب وضرر المركبات',
            'مبيدات الأعشاب أو الملح أو مخلّفات البناء في الحفرة',
            'نقل الشجرة مرة أخرى بعد تسليمنا لها',
            'نوع زُرع خارج الموسم الذي حذّرنا منه كتابةً',
          ] },
          { t: 'p', text: 'والبديل يكون من النوع والدرجة نفسيهما. وإن تعذّر توفيره فعلًا — خرج ذلك الحجم من السوق، أو أُغلق موسمه — سنعرض عليك أقرب مكافئ لتقبله أو ترفضه، وإن رفضت قيّدناه لك. فلن تُترك أبدًا ممسكًا ببديل لم تختره.' },
        ],
      },
      {
        id: 'not-returnable',
        heading: 'ما لا يمكن إعادته لتغيّر رأيك',
        body: [
          { t: 'p', text: 'كل شجرة نورّدها تُنتقى لطلب واحد في مشتل بعينه، وتُشهَّد وتُشحَن وتُخلَّص لأجله. ولا يمكن إعادتها على متن سفينة، ولا يوجد رفّ تعود إليه.' },
          { t: 'p', text: 'لذا فالشجرة المطابقة تمامًا لما عُرض، والتي وصلت سليمة وقُبلت عند التسليم، غير قابلة للإرجاع بسبب تغيّر خطة أو تعديل مخطط أو تعثّر مشروع. هذا هو الموقف الصادق، ونفضّل ذكره هنا على الإيحاء بغيره ثم الجدال لاحقًا.' },
          { t: 'p', text: 'وإن تعثّر مشروع، تحدّث إلينا. فكثيرًا ما نستطيع حجز البضاعة، أو تقسيمها على مراحل، أو نقل شجرة إلى طلب آخر. نفعل ذلك لأنه معقول، لا لأن هذه الصفحة تُلزمنا به — وهو أجدى بكثير قبل تحميل الشاحنة.' },
        ],
      },
      {
        id: 'how',
        heading: 'كيف تقدّم مطالبة',
        body: [
          { t: 'ol', items: [
            '**أرسلها مع الرقم المرجعي.** فلكل طلب ولكل استفسار رقم؛ وهو مذكور في عرض السعر وفي إشعار التسليم.',
            '**الصور.** الشجرة كاملة، وقاعدة الجذع حيث تلتقي التربة، والأوراق، والحفرة أو الكتلة الجذرية إن كانت مزروعة. بضوء النهار لا بكشّاف.',
            '**ما الذي جرى لها.** متى زُرعت، وكيف تُسقى وكم مرة. وليس هذا بناءً لدفاع — بل أسرع طريق لمعرفة الخطأ فعلًا.',
          ] },
          { t: 'p', text: 'نُقرّ بالاستلام خلال يومَي عمل ونخبرك بما سيحدث تاليًا. وحيث تلزم زيارة، نرتّبها خلال خمسة أيام رهنًا بإمكان الوصول. وحيث يحتاج القرار إلى مراجعة المزارع، قد يطول الأمر، وسنعطيك تاريخًا بدل تركه مفتوحًا.' },
          { t: 'p', text: 'تُقيَّد المبالغ على فاتورة الطلب. وحيث يُستحقّ استرجاع نقدي، يُدفع إلى الحساب الذي جاء منه الدفع، وبالعملة التي دُفع بها، خلال أربعة عشر يومًا من الاتفاق عليه. ولا نقاصّ استرجاعًا بفاتورة أخرى دون أن نسألك أولًا.' },
          { t: 'p', text: 'وفيما عدا كل ما سبق، ينبغي أن تصلنا المطالبة المتعلقة بشحنة خلال **اثني عشر شهرًا** من التسليم. فبعدها تكون الشجرة قد أمضت سنة كاملة تحت طقس الموقع وريّه وإدارته، ولا يستطيع أحد أن يقول بصدق عمّ تُسأل الشحنة.' },
        ],
      },
      {
        id: 'disagree',
        heading: 'إن اختلفنا',
        body: [
          { t: 'p', text: 'قل ذلك. فمعظم النزاعات حول شجرة خلافٌ على ما جرى لها، وتُحسم بأن يذهب أحد وينظر، لا بتبادل الرسائل.' },
          { t: 'p', text: 'وإن لم تحسم الزيارة الأمر، جاز لأيّ منّا طلب معاينة من خبير أشجار أو بستنة مستقلّ يُتّفق عليه بيننا. ورأيه غير ملزم لأيّ منّا، لكنه عمليًّا ينهي المسألة عادةً؛ ويتحمّل كلفة التقرير من جاء الرأي ضدّ موقفه.' },
          { t: 'p', text: 'أما الشكوى المتعلقة بطريقة معالجتنا للمطالبة — لا بالمطالبة نفسها — فتُقدَّم عبر [نموذج الاستفسار](/quote) مع رقم الطلب. نُقرّ باستلامها خلال **يومَي عمل** ونردّ عليها خلال **خمسة عشر يوم عمل**، مع تسمية من يتولّاها. ولا يتولّاها من اتخذ القرار محلّ الشكوى.' },
          { t: 'p', text: 'وإن بقي الخلاف بعد ذلك، تحكم [شروط البيع](/terms-of-sale)، بما فيها بند التصعيد والاختصاص القضائي.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'statutory',
        heading: 'حقوقك بموجب القانون',
        body: [
          { t: 'p', text: 'لا شيء في هذه الصفحة يُسقط أو يُنقص حقًّا يمنحك إياه قانون حماية المستهلك أو القانون التجاري في دولة الإمارات، ولا شيء فيها يقصد ذلك. وحيثما منحك حقٌّ قانونيّ أكثر مما تمنحه هذه السياسة، فالحقّ القانونيّ هو الذي يسري.' },
          { t: 'p', text: 'والمُهَل المذكورة هنا من وضعنا، وقد وضعناها عند الحدّ الذي لا يستطيع أحد بعده أن يثبت بصدق ما جرى. وليست وسيلة لتقصير ما يمنحك إياه القانون.' },
        ],
      },
      {
        id: 'law',
        heading: 'القانون الواجب التطبيق واللغة',
        body: [
          { t: 'p', text: 'تخضع هذه السياسة لقوانين دولة الإمارات العربية المتحدة كما تُطبَّق في {city}، وتشكّل جزءًا من [شروط البيع](/terms-of-sale) لكل طلب.' },
          { t: 'p', text: 'تُنشر هذه الصفحة بالإنجليزية والعربية والإيطالية. والنص الإنجليزي هو النص الذي كُتب وروجع؛ أما النصّان الآخران فمقدَّمان ليُقرأ. وعند الاختلاف، يُعتدّ بالنص الإنجليزي.' },
        ],
      },
    ],
    footnote:
      'هذه المُهَل من وضعنا، وضعناها لأنها الحدّ الذي لا يستطيع أحد بعده أن يثبت بصدق ما جرى. وليست حدًّا على التعقّل: فإن كنت داخل روح هذه الصفحة وخارج تواريخها، فاسأل على أي حال.',
  },

  it: {
    slug: 'refunds',
    title: 'Sostituzioni e rimborsi',
    metaTitle: 'Sostituzioni e rimborsi',
    metaDescription:
      'Che cosa succede quando un albero arriva sbagliato, arriva danneggiato o non attecchisce — i termini, le prove, chi paga che cosa e come avviene un rimborso.',
    cardLine: 'Che cosa succede quando un albero arriva sbagliato, danneggiato o non attecchisce.',
    cardNote: 'Termini, prove e che cosa facciamo.',
    summary:
      'Un albero non è un prodotto da rimandare indietro nella sua scatola. Questa pagina dice chiaramente che cosa sostituiamo, che cosa rimborsiamo, che cosa non faremo e quanto tempo avete — così che nessuno scopra la risposta nel mezzo di una discussione.',
    updatedOn: '2026-09-17',
    sections: [
      {
        id: 'principle',
        heading: 'Il principio',
        body: [
          { t: 'p', text: 'Se abbiamo mandato la cosa sbagliata, o l’abbiamo mandata in cattive condizioni, tocca a noi rimediare e lo faremo. Se un albero sano è stato piantato male, irrigato male o messo a dimora nella stagione sbagliata da qualcun altro, non tocca a noi.' },
          { t: 'p', text: 'La maggior parte dei fallimenti nella prima stagione dipende dall’irrigazione o dalla profondità d’impianto, e quasi tutti sono recuperabili se lo sappiamo per tempo. **Ditecelo presto.** Una fotografia alla seconda settimana vale più di una contestazione al quarto mese, per voi come per noi.' },
        ],
      },
      {
        id: 'on-delivery',
        heading: 'Qualcosa non va alla consegna',
        body: [
          { t: 'p', text: 'Controllate il materiale allo scarico, con il nostro autista presente. Se qualcosa è visibilmente errato:' },
          { t: 'ul', items: [
            'Annotatelo sul documento di trasporto prima che l’autista se ne vada',
            'Fotografatelo lì, sul camion o a terra',
            'Non piantatelo',
          ] },
          { t: 'p', text: 'Poi, a nostre spese e a nostra scelta:' },
          { t: 'dl', items: [
            { term: 'Esemplare, specie o categoria sbagliati', def: 'Ritirato e sostituito con quanto ordinato, oppure la riga accreditata per intero. Se l’esemplare corretto non è reperibile entro una finestra praticabile, accreditiamo: non vi teniamo legati a un sostituto che non avete chiesto.' },
            { term: 'Danneggiato nel trasporto', def: 'Sostituito o accreditato. Una cima spezzata, una zolla spaccata o una chioma schiacciata non sono cose che dovreste accettare per poi discuterne.' },
            { term: 'Consegna incompleta', def: 'Le unità mancanti sono consegnate al viaggio successivo a nostre spese, oppure tolte dalla fattura, come preferite.' },
          ] },
          { t: 'p', text: '**Il ritiro è a nostro carico, non vostro.** Presa in carico, nolo di rientro e ogni movimentazione di un esemplare che concordiamo essere sbagliato o danneggiato sono nostri. A voi chiediamo solo di non piantarlo e di tenerlo irrigato e all’ombra finché non lo ritiriamo: un albero rifiutato è pur sempre un essere vivo, e uno che muore fermo nel vostro cantiere mentre organizziamo un camion non aiuta nessuno.' },
          { t: 'note', text: '**Perché il documento di trasporto conta.** Una volta che l’albero è sceso dal camion ed è nel vostro cantiere, nessuno dei due può dimostrare che cosa sia arrivato e che cosa sia successo dopo. Sollevato in giornata, è semplicemente nostro. Sollevato alla terza settimana, diventa un disaccordo sull’irrigazione che nessuno può dirimere. È questa l’onesta ragione del termine, non un modo per sottrarci.' },
        ],
      },
      {
        id: 'first-days',
        heading: 'Entro sette giorni dalla consegna',
        body: [
          { t: 'p', text: 'Il danno non visibile in giornata — danni radicali dentro la zolla, un parassita che compare una volta uscito dal trasporto — è coperto per **sette giorni** dalla consegna. Inviateci fotografie e numero di riferimento e verremo a vedere, oppure chiederemo altre immagini se questo risolve più in fretta.' },
          { t: 'p', text: 'Se l’albero non era sano quando è partito da noi, viene sostituito o accreditato. Se era sano e qualcosa in cantiere lo ha danneggiato, ve lo diremo ugualmente — e vi diremo che cosa fare, che di solito vale più della discussione.' },
        ],
      },
      {
        id: 'establishment',
        heading: 'Un albero che non attecchisce dopo la messa a dimora',
        body: [
          { t: 'p', text: 'Dove **lo abbiamo piantato noi** — preparazione della buca, ammendamento, ancoraggio e allacciamento all’irrigazione tutti nel nostro ambito — garantiamo l’attecchimento per **novanta giorni** dalla messa a dimora, a condizione che l’irrigazione da noi prescritta sia stata effettivamente attivata. Un esemplare che fallisce in quel periodo è sostituito una volta, a nostre spese, nella prima finestra d’impianto utile.' },
          { t: 'p', text: 'Dove **lo ha piantato qualcun altro**, l’attecchimento non è qualcosa che possiamo garantire, perché ogni fattore che lo determina era fuori dalle nostre mani. Quello che faremo comunque è venire a vedere, dirvi che cosa pensiamo sia andato storto e, se il difetto era dell’esemplare, rimediare. L’abbiamo già fatto e lo rifaremo.' },
          { t: 'p', text: 'Che cosa nessuna garanzia di attecchimento copre, in nessun caso:' },
          { t: 'ul', items: [
            'Siccità, o un impianto di irrigazione spento, ostruito o mai messo in funzione',
            'Eccesso d’acqua e ristagno, che qui uccide più alberi importati della siccità',
            'Impianto troppo profondo — la causa più comune di una morte lenta nell’arco di due anni',
            'Tempesta, alluvione, incendio, vandalismo o urto di veicoli',
            'Diserbanti, sale o materiale di risulta nella buca',
            'Spostare di nuovo l’albero dopo la nostra consegna',
            'Una specie piantata fuori dalla finestra che avevamo sconsigliato per iscritto',
          ] },
          { t: 'p', text: 'Una sostituzione è della stessa specie e categoria. Se davvero non è reperibile — quella misura è uscita dal mercato, la stagione si è chiusa — vi proporremo l’equivalente più vicino perché lo accettiate o lo rifiutiate, e se lo rifiutate accreditiamo. Non restate mai con un sostituto che non avete scelto.' },
        ],
      },
      {
        id: 'not-returnable',
        heading: 'Che cosa non si può restituire per ripensamento',
        body: [
          { t: 'p', text: 'Ogni esemplare che forniamo è selezionato per un singolo ordine presso un vivaio determinato, certificato, spedito e sdoganato per quello. Non può risalire su una nave, e non c’è uno scaffale a cui tornare.' },
          { t: 'p', text: 'Quindi un albero che è esattamente quello quotato, è arrivato sano ed è stato accettato alla consegna non è restituibile per un cambio di piano, un disegno modificato o un progetto che si è fermato. È la posizione onesta e preferiamo dichiararla qui piuttosto che lasciar intendere altro e discuterne dopo.' },
          { t: 'p', text: 'Se un progetto si ferma, parlatene con noi. Spesso possiamo tenere il materiale, scaglionarlo o spostare un esemplare su un altro ordine. Sono cose che facciamo perché hanno senso, non perché questa pagina ci obblighi — e funzionano molto meglio prima che il camion sia carico.' },
        ],
      },
      {
        id: 'how',
        heading: 'Come presentare una contestazione',
        body: [
          { t: 'ol', items: [
            '**Inviatela con il numero di riferimento.** Ogni ordine e ogni richiesta ne ha uno; è sul preventivo e sul documento di trasporto.',
            '**Fotografie.** L’albero intero, la base del tronco dove incontra il terreno, la chioma e la buca o la zolla se è piantato. Alla luce del giorno, non con un faro.',
            '**Che cosa gli è stato fatto.** Quando è stato piantato, come viene irrigato e con quale frequenza. Non stiamo costruendo una difesa: è la via più rapida per capire che cosa non va davvero.',
          ] },
          { t: 'p', text: 'Riscontriamo entro due giorni lavorativi e vi diciamo che cosa succede dopo. Dove serve un sopralluogo lo organizziamo entro cinque, compatibilmente con l’accesso. Dove la decisione richiede il produttore, può volerci di più, e vi daremo una data anziché lasciare la cosa aperta.' },
          { t: 'p', text: 'Gli accrediti vanno sulla fattura dell’ordine. Dove è dovuto un rimborso in denaro, viene pagato sul conto da cui è arrivato il pagamento, nella valuta in cui è stato pagato, entro quattordici giorni dall’accordo. Non compensiamo un rimborso con un’altra fattura senza chiedervelo prima.' },
          { t: 'p', text: 'Al di là di tutto quanto sopra, una contestazione relativa a una spedizione dovrebbe arrivarci entro **dodici mesi** dalla consegna. Oltre, un albero ha alle spalle un anno intero di clima, irrigazione e gestione di quel cantiere, e nessuno può onestamente dire di che cosa risponda la spedizione.' },
        ],
      },
      {
        id: 'disagree',
        heading: 'Se non siamo d’accordo',
        body: [
          { t: 'p', text: 'Ditelo. La maggior parte delle controversie su un albero è un disaccordo su che cosa gli sia successo, e si risolvono con qualcuno che va a guardare, non scambiandosi lettere.' },
          { t: 'p', text: 'Se il sopralluogo non basta, ciascuno può chiedere il parere di un arboricoltore o agronomo indipendente, concordato fra noi. Il suo parere non vincola nessuno dei due, ma in pratica di solito chiude la questione; paga la perizia la parte contro cui il parere si esprime.' },
          { t: 'p', text: 'Un reclamo su come abbiamo gestito una contestazione — non sulla contestazione in sé — va inviato tramite il [modulo di richiesta](/quote) con il riferimento dell’ordine. Lo riscontriamo entro **due giorni lavorativi** e rispondiamo entro **quindici giorni lavorativi**, indicando chi se ne occupa. Non lo gestisce chi ha preso la decisione di cui vi lamentate.' },
          { t: 'p', text: 'Se anche dopo restiamo in disaccordo, valgono le [condizioni di vendita](/terms-of-sale), comprese la clausola di escalation e quella sul foro competente.' },
          { t: 'contact' },
        ],
      },
      {
        id: 'statutory',
        heading: 'I vostri diritti di legge',
        body: [
          { t: 'p', text: 'Nulla in questa pagina elimina o riduce un diritto che vi spetta secondo la normativa emiratina a tutela dei consumatori o commerciale, e nulla in essa intende farlo. Dove un diritto di legge vi dà più di quanto dia questa politica, vale il diritto di legge.' },
          { t: 'p', text: 'I termini indicati qui li fissiamo noi, e li fissiamo al punto oltre il quale nessuno può onestamente accertare che cosa sia accaduto. Non sono un modo per accorciare ciò che la legge vi riconosce.' },
        ],
      },
      {
        id: 'law',
        heading: 'Legge applicabile e lingua',
        body: [
          { t: 'p', text: 'Questa politica è regolata dalle leggi degli Emirati Arabi Uniti come applicate a {city} e fa parte delle [condizioni di vendita](/terms-of-sale) di ogni ordine.' },
          { t: 'p', text: 'Questa pagina è pubblicata in inglese, arabo e italiano. Il testo inglese è quello redatto e verificato; gli altri due sono forniti perché possa essere letto. In caso di difformità, prevale l’inglese.' },
        ],
      },
    ],
    footnote:
      'Questi termini sono nostri, fissati perché sono il punto oltre il quale nessuno può onestamente accertare che cosa sia successo. Non sono un limite alla ragionevolezza: se siete nello spirito di questa pagina e fuori dalle sue date, chiedete comunque.',
  },
};
