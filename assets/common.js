/* Shared schema, labels, tracking and data access for all pages. */
(function () {
  'use strict';

  // ---------- Question schema (codes are what gets stored) ----------
  var SOURCES = [
    ['maps', 'خرائط Google', 'Google Maps'],
    ['search', 'بحث Google', 'Google Search'],
    ['social', 'إنستغرام أو تيك توك', 'Instagram or TikTok'],
    ['apps', 'تطبيقات التوصيل أو الحجز', 'Delivery or booking apps'],
    ['friends', 'سألت الأصدقاء أو العائلة', 'Asked friends or family'],
    ['groups', 'مجموعات واتساب أو فيسبوك', 'WhatsApp or Facebook groups'],
    ['ai', 'أداة ذكاء اصطناعي', 'An AI tool'],
    ['other', 'غير ذلك', 'Something else']
  ];

  var Q = {
    // Both surveys start with the country
    country: { type: 'single', q: ['في أي دولة تقيم حالياً؟', 'Which country do you live in?'], qBiz: ['في أي دولة يعمل نشاطك؟', 'Which country does your business operate in?'], opts: [
      ['qa', 'قطر', 'Qatar'], ['ae', 'الإمارات', 'UAE'], ['sa', 'السعودية', 'Saudi Arabia'], ['eg', 'مصر', 'Egypt'], ['other', 'دولة أخرى', 'Another country']] },
    // Residents
    r_area: { type: 'single', q: ['في أي منطقة تقيم؟', 'Which area do you live in?'], opts: [] }, // filled per country
    r_status: { type: 'single', q: ['منذ متى تقيم {in}؟', 'How long have you lived {in}?'], opts: [
      ['citizen', '{citizen}', '{citizen}'],
      ['lt1', 'أقل من سنة', 'Less than a year'],
      ['y1_3', 'من سنة إلى 3 سنوات', '1 to 3 years'],
      ['y3p', 'أكثر من 3 سنوات', 'More than 3 years']] },
    r_age: { type: 'single', q: ['الفئة العمرية', 'Your age group'], opts: [
      ['18_24', '18–24', '18–24'], ['25_34', '25–34', '25–34'], ['35_44', '35–44', '35–44'],
      ['45_54', '45–54', '45–54'], ['55p', '55 أو أكثر', '55 or over']] },
    r_category: { type: 'multi', max: 3, q: ['ما أهم الأماكن أو الخدمات التي تبحث عنها عادةً؟', 'What places or services do you look for most often?'],
      hint: ['اختر حتى 3', 'Choose up to three'], opts: [
      ['food', 'مطعم أو مقهى', 'Restaurant or café'],
      ['health', 'عيادة أو طبيب', 'Clinic or doctor'],
      ['beauty', 'صالون أو سبا', 'Salon or spa'],
      ['home', 'صيانة أو خدمات منزلية', 'Home maintenance or services'],
      ['kids', 'أنشطة أو مدارس للأطفال', 'Kids’ activities or schools'],
      ['car', 'خدمات سيارات', 'Car services'],
      ['other', 'غير ذلك', 'Something else']] },
    r_sources: { type: 'multi', max: 8, q: ['وعادةً، ما المصادر التي تستخدمها للبحث عنها؟', 'And which sources do you usually use to find them?'],
      hint: ['اختر كل ما ينطبق', 'Choose all that apply'], opts: SOURCES },
    r_trust: { type: 'single', q: ['وأيّ مصدر تثق به أكثر عند اتخاذ القرار النهائي؟', 'Which source do you trust most for the final decision?'], opts: SOURCES },
    r_pain: { type: 'multi', max: 2, exclusive: 'none', q: ['ما أكثر ما يزعجك عند البحث؟', 'What frustrates you most when searching?'],
      hint: ['اختر حتى خيارين', 'Choose up to two'], opts: [
      ['outdated', 'معلومات قديمة أو خاطئة (مواعيد، أسعار، أرقام)', 'Outdated or wrong info (hours, prices, numbers)'],
      ['reviews', 'تقييمات لا أثق بها', 'Reviews I don’t trust'],
      ['too_many', 'خيارات كثيرة يصعب مقارنتها', 'Too many options to compare'],
      ['scattered', 'المعلومات موزعة على تطبيقات كثيرة', 'Information spread across many apps'],
      ['no_match', 'صعوبة إيجاد ما يناسب احتياجي تحديداً', 'Hard to find what fits my exact need'],
      ['wait', 'انتظار ردود الأصدقاء', 'Waiting for friends to reply'],
      ['none', 'لا شيء يزعجني', 'Nothing bothers me']] },
    r_recos: { type: 'single', q: ['خلال آخر 3 أشهر، كم مرة اخترت مكاناً لأن شخصاً تعرفه رشّحه لك؟', 'In the last 3 months, how many times did you choose a place because someone you know recommended it?'], opts: [
      ['0', 'ولا مرة', 'Never'], ['1_2', 'مرة أو مرتين', 'Once or twice'], ['3_5', 'من 3 إلى 5 مرات', '3 to 5 times'], ['6p', '6 مرات أو أكثر', '6 times or more']] },
    r_disappoint: { type: 'single', q: ['هل اخترت مكاناً بناءً على تقييمات الإنترنت ثم خاب ظنك؟', 'Have you chosen a place based on online ratings and been disappointed?'], opts: [
      ['often', 'كثيراً', 'Often'], ['sometimes', 'أحياناً', 'Sometimes'], ['rarely', 'نادراً', 'Rarely'], ['never', 'أبداً', 'Never']] },

    // Businesses
    b_type: { type: 'single', q: ['ما نوع نشاطك؟', 'What type of business do you run?'], opts: [
      ['restaurant', 'مطعم', 'Restaurant'], ['cafe', 'مقهى', 'Café'], ['clinic', 'عيادة أو مركز طبي', 'Clinic or medical centre'],
      ['salon', 'صالون أو سبا', 'Salon or spa'], ['other', 'نشاط خدمي آخر', 'Another service business']] },
    b_role: { type: 'single', q: ['ما دورك في النشاط؟', 'What is your role?'], opts: [
      ['owner', 'مالك أو شريك', 'Owner or partner'], ['manager', 'مدير', 'Manager'], ['marketing', 'مسؤول التسويق', 'Marketing lead'], ['other', 'غير ذلك', 'Other']] },
    b_branches: { type: 'single', q: ['كم فرعاً لديكم {in}؟', 'How many branches do you have {in}?'], opts: [
      ['1', 'فرع واحد', 'One'], ['2_3', '2–3', '2–3'], ['4_10', '4–10', '4–10'], ['10p', 'أكثر من 10', 'More than 10']] },
    b_age: { type: 'single', q: ['منذ متى تعملون {in}؟', 'How long have you operated {in}?'], opts: [
      ['lt1', 'أقل من سنة', 'Less than a year'], ['1_3', '1–3 سنوات', '1–3 years'], ['3_10', '3–10 سنوات', '3–10 years'], ['10p', 'أكثر من 10 سنوات', 'More than 10 years']] },
    b_channels: { type: 'multi', max: 3, q: ['من أين يأتي معظم عملائكم الجدد؟', 'Where do most of your new customers come from?'],
      hint: ['اختر حتى 3', 'Choose up to three'], opts: [
      ['wom', 'ترشيحات من عملاء آخرين', 'Recommendations from other customers'],
      ['maps', 'خرائط Google', 'Google Maps'],
      ['social', 'إنستغرام أو تيك توك', 'Instagram or TikTok'],
      ['influencers', 'المؤثرون', 'Influencers'],
      ['apps', 'تطبيقات التوصيل أو الحجز', 'Delivery or booking apps'],
      ['ads', 'إعلانات مدفوعة', 'Paid ads'],
      ['walkin', 'المرور أمام المحل', 'Walk-ins'],
      ['other', 'غير ذلك', 'Other']] },
    b_wom: { type: 'single', q: ['تقريباً، كم نسبة العملاء الجدد الذين يأتون بترشيح من شخص يعرفونه؟', 'Roughly what share of new customers come because someone they know recommended you?'], opts: [
      ['lt20', 'أقل من 20%', 'Under 20%'], ['20_40', '20–40%', '20–40%'], ['40_60', '40–60%', '40–60%'], ['60p', 'أكثر من 60%', 'Over 60%'], ['unknown', 'لا أعرف', 'I don’t know']] },
    b_challenge: { type: 'single', q: ['ما أصعب تحدٍّ تواجهونه الآن في جذب العملاء؟', 'What is your hardest challenge in attracting customers right now?'], opts: [
      ['visibility', 'صعوبة الظهور وسط المنافسين', 'Standing out from competitors'],
      ['cost', 'تكلفة التسويق مرتفعة مقابل النتيجة', 'Marketing costs too much for the result'],
      ['reviews', 'تقييمات غير عادلة أو مزيفة', 'Unfair or fake reviews'],
      ['outdated', 'معلوماتنا على الإنترنت غير محدّثة', 'Our online information is out of date'],
      ['measure', 'لا نعرف أي قناة تجلب العملاء فعلاً', 'We can’t tell which channel really works'],
      ['retention', 'العملاء لا يعودون', 'Customers don’t come back'],
      ['none', 'لا توجد مشكلة حقيقية', 'No real problem']] },
    b_spend: { type: 'single', q: ['كم تنفقون شهرياً تقريباً على التسويق؟', 'Roughly how much do you spend on marketing each month?'],
      hint: ['إعلانات، مؤثرون، عمولات التطبيقات، وكالات', 'Ads, influencers, app commissions, agencies'], opts: [
      ['lt2k', '', ''], ['2_5k', '', ''], ['5_15k', '', ''], ['15kp', '', ''], // spend bands, labelled per country's currency
      ['unknown', 'أفضّل عدم الإجابة', 'Prefer not to say']] },
    b_priority: { type: 'scale', min: 1, max: 10, q: ['لو توفّرت أداة جديدة توفّر عليك الوقت والمجهود وتوصلك للعملاء مباشرة، ما مدى احتمال أن تستخدمها؟', 'If a new tool saved you time and effort and connected you directly with customers, how likely would you be to use it?'],
      hint: ['اختر رقماً من 1 إلى 10', 'Pick a number from 1 to 10'],
      ends: [['غير محتمل', 'Unlikely'], ['بالتأكيد', 'Definitely']] },
    b_pay: { type: 'single', q: ['ولو استخدمت هذه الأداة، كيف تفضّل الدفع مقابلها؟', 'And if you used this tool, how would you prefer to pay for it?'], opts: [
      ['monthly', 'اشتراك شهري بسيط بدون عمولات', 'A simple monthly subscription, no commissions'],
      ['commission', 'عمولة على كل عملية', 'A commission on each transaction'],
      ['free_light', 'استخدام طفيف مجاني', 'Light use for free'],
      ['depends', 'حسب قوة الأداة ونتائجها', 'Depends on how well the tool works']] },
    b_pilot: { type: 'single', q: ['سنطلق تجربة مجانية لأصحاب الأعمال {in}. هل تودّ الانضمام؟', 'We will run a free pilot for businesses {in}. Would you like to join?'], opts: [
      ['yes', 'نعم، أريد الانضمام', 'Yes, count me in'], ['no', 'لا، شكراً', 'No, thanks']] }
  };

  // ---------- Countries ----------
  // in: phrase used inside sentences; inR: same on the results page; bands: monthly marketing spend thresholds
  var COUNTRIES = {
    qa: { name: ['قطر', 'Qatar'], in: ['في قطر', 'in Qatar'], citizen: ['مواطن قطري', 'Qatari citizen'], dial: '+974', cur: ['ر.ق', 'QAR'], bands: [2000, 5000, 15000], tz: 'Asia/Qatar',
      areas: [['doha', 'الدوحة', 'Doha'], ['pearl_westbay', 'اللؤلؤة أو الخليج الغربي', 'The Pearl or West Bay'], ['lusail', 'لوسيل', 'Lusail'],
        ['rayyan', 'الريان', 'Al Rayyan'], ['wakrah', 'الوكرة', 'Al Wakrah'], ['other_qa', 'منطقة أخرى في قطر', 'Elsewhere in Qatar']] },
    ae: { name: ['الإمارات', 'UAE'], in: ['في الإمارات', 'in the UAE'], citizen: ['مواطن إماراتي', 'Emirati citizen'], dial: '+971', cur: ['د.إ', 'AED'], bands: [2000, 5000, 15000], tz: 'Asia/Dubai',
      areas: [['dubai', 'دبي', 'Dubai'], ['abu_dhabi', 'أبوظبي', 'Abu Dhabi'], ['sharjah', 'الشارقة', 'Sharjah'], ['ajman', 'عجمان', 'Ajman'],
        ['al_ain', 'العين', 'Al Ain'], ['other_ae', 'إمارة أخرى', 'Another emirate']] },
    sa: { name: ['السعودية', 'Saudi Arabia'], in: ['في السعودية', 'in Saudi Arabia'], citizen: ['مواطن سعودي', 'Saudi citizen'], dial: '+966', cur: ['ر.س', 'SAR'], bands: [2000, 5000, 15000], tz: 'Asia/Riyadh',
      areas: [['riyadh', 'الرياض', 'Riyadh'], ['jeddah', 'جدة', 'Jeddah'], ['makkah', 'مكة المكرمة', 'Makkah'], ['madinah', 'المدينة المنورة', 'Madinah'],
        ['eastern', 'الدمام والخبر والمنطقة الشرقية', 'Dammam, Khobar and the Eastern Province'], ['other_sa', 'منطقة أخرى في السعودية', 'Elsewhere in Saudi Arabia']] },
    eg: { name: ['مصر', 'Egypt'], in: ['في مصر', 'in Egypt'], citizen: ['مواطن مصري', 'Egyptian citizen'], dial: '+20', cur: ['ج.م', 'EGP'], bands: [5000, 20000, 60000], tz: 'Africa/Cairo',
      areas: [['cairo', 'القاهرة', 'Cairo'], ['giza', 'الجيزة', 'Giza'], ['new_cities', 'القاهرة الجديدة أو 6 أكتوبر أو الشيخ زايد', 'New Cairo, 6th of October or Sheikh Zayed'],
        ['alexandria', 'الإسكندرية', 'Alexandria'], ['delta_canal', 'الدلتا ومدن القناة', 'Delta and Canal cities'], ['upper_egypt', 'الصعيد', 'Upper Egypt'], ['other_eg', 'منطقة أخرى في مصر', 'Elsewhere in Egypt']] },
    other: { name: ['دول أخرى', 'Other countries'], in: ['في بلد إقامتك', 'in your country'], inR: ['في دول أخرى', 'in other countries'], citizen: ['مواطن في بلد إقامتي', 'A citizen of the country I live in'],
      cur: ['دولار', 'USD'], bands: [500, 1500, 4000], tz: 'Asia/Qatar',
      T: { start_res: ['مقيم', 'A resident'], start_biz: ['صاحب نشاط تجاري', 'A business owner'], brand: ['دراسة الخدمات المحلية', 'Local Services Study'] }, areaQ: ['ما هي الدولة تحديداً؟', 'Which country exactly?'], noOutside: true,
      areas: [['kw', 'الكويت', 'Kuwait'], ['bh', 'البحرين', 'Bahrain'], ['om', 'عُمان', 'Oman'], ['jo', 'الأردن', 'Jordan'], ['other_country', 'دولة أخرى', 'Another country']] }
  };
  var COUNTRY_CODES = ['qa', 'ae', 'sa', 'eg', 'other'];
  var GENERIC = { in: ['في البلد', 'in the country'], citizen: ['مواطن', 'Citizen'] };
  var ALL_AREAS = {};
  COUNTRY_CODES.forEach(function (c) { COUNTRIES[c].areas.forEach(function (a) { ALL_AREAS[a[0]] = a; }); });
  ALL_AREAS.outside = ['outside', 'لا يقيم في البلد', 'Lives elsewhere'];

  // Fill the country-specific wording into the questions. country = null means "all countries" (dashboard).
  var BASE = JSON.parse(JSON.stringify(Q));
  var current = null;
  function fmtN(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function setCountry(code) {
    current = COUNTRIES[code] ? code : null;
    var C = COUNTRIES[current] || GENERIC;
    function fill(s, i) { return String(s).replace(/\{in\}/g, C.in[i]).replace(/\{citizen\}/g, C.citizen[i]); }
    Object.keys(BASE).forEach(function (f) {
      var b = BASE[f];
      Q[f].q = [fill(b.q[0], 0), fill(b.q[1], 1)];
      if (b.opts) Q[f].opts = b.opts.map(function (o) { return [o[0], fill(o[1], 0), fill(o[2], 1)]; });
    });
    if (current) {
      Q.r_area.q = C.areaQ || BASE.r_area.q;
      Q.r_area.opts = C.areas.slice();
      var bd = C.bands, cu = C.cur;
      var spend = { lt2k: ['أقل من ' + fmtN(bd[0]) + ' ' + cu[0], 'Under ' + cu[1] + ' ' + fmtN(bd[0])],
        '2_5k': [fmtN(bd[0]) + '–' + fmtN(bd[1]) + ' ' + cu[0], cu[1] + ' ' + fmtN(bd[0]) + '–' + fmtN(bd[1])],
        '5_15k': [fmtN(bd[1]) + '–' + fmtN(bd[2]) + ' ' + cu[0], cu[1] + ' ' + fmtN(bd[1]) + '–' + fmtN(bd[2])],
        '15kp': ['أكثر من ' + fmtN(bd[2]) + ' ' + cu[0], 'Over ' + cu[1] + ' ' + fmtN(bd[2])] };
      Q.b_spend.opts = Q.b_spend.opts.map(function (o) { return spend[o[0]] ? [o[0], spend[o[0]][0], spend[o[0]][1]] : o; });
    } else {
      Q.r_area.opts = Object.keys(ALL_AREAS).map(function (k) { return ALL_AREAS[k]; });
      var gen = { lt2k: ['الشريحة الأقل', 'Lowest band'], '2_5k': ['الشريحة الثانية', 'Second band'], '5_15k': ['الشريحة الثالثة', 'Third band'], '15kp': ['الشريحة الأعلى', 'Highest band'] };
      Q.b_spend.opts = Q.b_spend.opts.map(function (o) { return gen[o[0]] ? [o[0], gen[o[0]][0], gen[o[0]][1]] : o; });
    }
    return current;
  }
  function country() { return current; }
  function countryInfo(code) { return COUNTRIES[code || current] || null; }
  function countryPhrase(lang, forResults) {
    var C = COUNTRIES[current]; var i = lang === 'en' ? 1 : 0;
    if (!C) return GENERIC.in[i];
    return (forResults && C.inR ? C.inR : C.in)[i];
  }
  function validCountry(c) { return COUNTRY_CODES.indexOf(c) >= 0 ? c : null; }

  var FLOWS = {
    resident: ['country', 'r_area', 'r_status', 'r_age', 'r_category', 'r_sources', 'r_trust', 'r_pain', 'r_recos', 'r_disappoint'],
    business: ['country', 'b_type', 'b_role', 'b_branches', 'b_age', 'b_channels', 'b_wom', 'b_challenge', 'b_spend', 'b_priority', 'b_pay', 'b_pilot']
  };

  // Extra labels for fields that are not questions
  var EXTRA = {
    w_type: { opts: [['resident', 'مقيم', 'Resident'], ['business', 'صاحب نشاط', 'Business owner']] },
    entry: { opts: [['start', 'الرابط العام', 'Main link'], ['resident', 'رابط المقيمين', 'Residents link'], ['business', 'رابط الأعمال', 'Business link'], ['waitlist', 'رابط قائمة الانتظار', 'Waitlist link']] },
    lang: { opts: [['ar', 'العربية', 'Arabic'], ['en', 'الإنجليزية', 'English']] },
    device: { opts: [['mobile', 'جوال', 'Mobile'], ['desktop', 'كمبيوتر', 'Desktop']] }
  };
  EXTRA.country = { opts: COUNTRY_CODES.map(function (c) { return [c, COUNTRIES[c].name[0], COUNTRIES[c].name[1]]; }) };


  var TERMS_VERSION = 'pilot-interest-v1';
  var TERMS = [
    ['نؤكد اهتمامنا بالمشاركة في تجربة (Pilot) لأداة رقمية يطوّرها الفريق لمساعدة المقيمين في قطر على اكتشاف الخدمات والأماكن المحلية، فور إتاحتها.',
      'We confirm our interest in joining a pilot of a digital tool the team is developing to help residents of Qatar discover local services and places, once it is available.'],
    ['خلال التجربة، ننوي تزويد الفريق ببيانات نشاطنا الأساسية ومشاركة ملاحظاتنا على التجربة.',
      'During the pilot, we intend to share our basic business information and give feedback on our experience.'],
    ['التجربة مجانية. أي خدمات مدفوعة لاحقاً تحتاج اتفاقاً منفصلاً ومكتوباً.',
      'The pilot is free. Any later paid services require a separate written agreement.'],
    ['هذه الموافقة تعبير عن اهتمام فقط، ولا تُنشئ أي التزام قانوني أو مالي على أي طرف، ويحق لأي طرف الانسحاب في أي وقت.',
      'This is an expression of interest only. It creates no legal or financial obligation for either party, and either party may withdraw at any time.']
  ];

  // ---------- UI strings ----------
  var T = {
    lang_switch: ['English', 'العربية'],
    start_title: ['ساعدنا نفهم كيف تجد الأماكن والخدمات {in}', 'Help us understand how people find places and services {in}'],
    start_lead: ['دراسة قصيرة من فريق بحث مستقل. دقيقتان فقط، وإجاباتك سرية وتُستخدم للبحث فقط.', 'A short study by an independent research team. It takes two minutes, and your answers are confidential and used for research only.'],
    start_q: ['أنت هنا بصفتك…', 'You are here as…'],
    start_res: ['مقيم', 'A resident'],
    start_res_d: ['كيف تجد وتختار المطاعم والعيادات والخدمات وغيرها؟', 'How do you find and choose restaurants, clinics, services and more?'],
    start_biz: ['صاحب نشاط تجاري', 'A business owner'],
    start_biz_d: ['مطعم، عيادة، صالون أو أي نشاط خدمي', 'Restaurant, clinic, salon or any service business'],
    minutes_res: ['دقيقتان تقريباً', 'About 2 minutes'],
    minutes_biz: ['3 دقائق تقريباً', 'About 3 minutes'],
    back: ['رجوع', 'Back'],
    next: ['التالي', 'Next'],
    step_of: ['سؤال {i} من {n}', 'Question {i} of {n}'],
    sending: ['جارٍ الإرسال…', 'Sending…'],
    send_error: ['تعذّر الإرسال. تأكد من الاتصال بالإنترنت ثم حاول مرة أخرى.', 'We couldn’t send that. Check your connection and try again.'],
    retry: ['حاول مرة أخرى', 'Try again'],
    out_title: ['شكراً لاهتمامك', 'Thanks for your interest'],
    out_body: ['هذه الدراسة مخصصة للمقيمين {in} حالياً.', 'This study is only for people who currently live {in}.'],
    r_done_title: ['شكراً! إجاباتك وصلت', 'Thank you, your answers are in'],
    r_done_body: ['نعمل على شيء جديد يوفّر عليك وقت البحث والسؤال والتجربة. سجّل لتكون من أوائل من يجرّبه مجاناً.', 'We’re building something new to save you the searching, asking around and guessing. Sign up to be among the first to try it for free.'],
    wl_title: ['المكان المناسب {in}، أسرع وأوثق', 'The right place {in}, faster and with confidence'],
    wl_body: ['مطعم، عيادة، صالون أو أي خدمة. نطلق قريباً {in}، وأوائل المسجّلين يحصلون على وصول مبكر مجاني.', 'Restaurants, clinics, salons or any service. Launching soon {in}, and early sign-ups get free early access.'],
    wl_points: [['معلومات قديمة ومواعيد خاطئة', 'تقييمات لا تعرف إن كانت حقيقية', 'أسئلة في المجموعات وانتظار الردود'], ['Outdated info and wrong opening hours', 'Reviews you can’t be sure are real', 'Asking in group chats and waiting for replies']],
    wl_points_lead: ['وداعاً لـ', 'No more'],
    f_first: ['الاسم الأول', 'First name'],
    f_email: ['البريد الإلكتروني', 'Email'],
    f_whatsapp: ['رقم واتساب (اختياري)', 'WhatsApp number (optional)'],
    f_iam: ['أنا', 'I am'],
    wl_submit: ['احجز مكانك', 'Save my spot'],
    wl_skip: ['لا شكراً، إنهاء', 'No thanks, finish'],
    wl_note: ['لا رسائل مزعجة.', 'No spam.'],
    wl_done_title: ['تم حجز مكانك', 'You’re on the list'],
    wl_done_body: ['سنراسلك عند الإطلاق. شارك الرابط مع أصدقائك {in}.', 'We’ll email you at launch. Share the link with friends {in}.'],
    copy_link: ['انسخ الرابط', 'Copy link'],
    copied: ['تم النسخ', 'Copied'],
    end_title: ['شكراً لوقتك', 'Thanks for your time'],
    end_body: ['مساهمتك تساعدنا على فهم احتياجات الناس {in}.', 'Your input helps us understand what people {in} need.'],
    b_no_title: ['شكراً لوقتك', 'Thanks for your time'],
    b_no_body: ['إجاباتك وصلت وتساعدنا كثيراً. إن غيّرت رأيك، يمكنك التسجيل لاحقاً من الرابط نفسه.', 'Your answers are in and they help a lot. If you change your mind, you can register later from the same link.'],
    c_title: ['سجّل اهتمامك بالتجربة المجانية', 'Register your interest in the free pilot'],
    c_lead: ['دقيقة واحدة. هذه موافقة إلكترونية غير ملزمة، وستصلك نسخة منها على بريدك.', 'One minute. This is a non-binding online confirmation, and a copy will be emailed to you.'],
    c_name: ['الاسم الكامل', 'Full name'],
    c_role: ['المنصب', 'Job title'],
    c_business: ['اسم النشاط التجاري', 'Business name'],
    c_cr: ['رقم السجل التجاري (اختياري)', 'Commercial registration number (optional)'],
    c_area: ['المنطقة', 'Area'],
    c_email: ['البريد الإلكتروني للعمل', 'Work email'],
    c_phone: ['رقم الجوال (اختياري)', 'Mobile number (optional)'],
    c_note: ['بياناتك تُستخدم لأغراض هذه الدراسة فقط.', 'Your details are used for this study only.'],
    c_terms_head: ['البنود', 'Terms'],
    c_agree: ['قرأت البنود أعلاه وأوافق عليها', 'I have read and agree to the terms above'],
    c_agree_name: ['أوافق على ذكر اسم نشاطنا وفئته كمهتم بالتجربة في طلبات التمويل أو المنح، دون نشر بيانات التواصل', 'You may name our business and category as an interested pilot participant in funding or grant applications, without publishing our contact details'],
    c_call: ['لا مانع من مكالمة قصيرة (15 دقيقة) لمعرفة رأينا', 'Happy to have a short 15-minute call to share our views'],
    c_sign: ['التوقيع: اكتب اسمك الكامل', 'Signature: type your full name'],
    c_sign_hint: ['كتابة اسمك هنا تُعتبر توقيعاً إلكترونياً على هذه الموافقة غير الملزمة.', 'Typing your name here counts as your electronic signature on this non-binding confirmation.'],
    c_submit: ['إرسال', 'Send'],
    c_done_title: ['شكراً، تم التسجيل', 'Thank you, you\u2019re registered'],
    c_done_body: ['سنتواصل معك قبل بدء التجربة.', 'We’ll be in touch before the pilot starts.'],
    c_ref: ['رقم المرجع', 'Reference'],
    req: ['هذا الحقل مطلوب', 'This field is required'],
    bad_email: ['اكتب بريداً إلكترونياً صحيحاً', 'Enter a valid email address'],
    sign_mismatch: ['اكتب اسمك الكامل كما في الأعلى', 'Type your full name as entered above'],
    must_agree: ['يجب الموافقة على البنود للمتابعة', 'Please agree to the terms to continue'],
    privacy: ['نجمع إجاباتك لأغراض البحث فقط.', 'We collect your answers for research only.'],
    brand: ['دراسة الخدمات المحلية {in}', 'Local Services Study {in}'],
    brand_generic: ['دراسة الخدمات المحلية', 'Local Services Study'],
    country_head: ['ساعدنا نفهم كيف تجد الأماكن والخدمات', 'Help us understand how people find places and services'],
    country_q: ['أين تقيم أو تعمل حالياً؟', 'Where do you live or work?'],
    country_other: ['دولة أخرى', 'Another country'],
    change_country: ['تغيير الدولة', 'Change country'],
    demo_banner: ['نسخة تجريبية: لا يتم حفظ أي بيانات', 'Demo mode: nothing is saved']
  };

  // ---------- Language ----------
  function langIndex(lang) { return lang === 'en' ? 1 : 0; }
  function t(key, lang, vars) {
    var src = (current && COUNTRIES[current].T && COUNTRIES[current].T[key]) || T[key];
    var s = src ? src[langIndex(lang)] : key;
    if (vars) Object.keys(vars).forEach(function (k) { s = String(s).replace('{' + k + '}', vars[k]); });
    if (!current) return String(s).replace(/ ?\{in\}/g, '');
    return String(s).replace(/\{in\}/g, countryPhrase(lang));
  }
  function label(field, code, lang) {
    var def = Q[field] || EXTRA[field];
    if (!def || !def.opts) return code;
    for (var i = 0; i < def.opts.length; i++) if (String(def.opts[i][0]) === String(code)) return def.opts[i][1 + langIndex(lang)];
    if (field === 'r_area' && ALL_AREAS[code]) return ALL_AREAS[code][1 + langIndex(lang)];
    if (field === 'country' && COUNTRIES[code]) return COUNTRIES[code].name[langIndex(lang)];
    return code;
  }
  function question(field, lang) { return Q[field] ? Q[field].q[langIndex(lang)] : field; }
  function codes(field) {
    var def = Q[field] || EXTRA[field];
    return def && def.opts ? def.opts.map(function (o) { return String(o[0]); }) : [];
  }

  // ---------- URL params (query string or #hash tokens) ----------
  function params() {
    var out = {};
    try {
      new URLSearchParams(location.search).forEach(function (v, k) { out[k] = v; });
    } catch (e) {}
    var h = (location.hash || '').replace(/^#/, '');
    if (h) h.split(/[-~]/).forEach(function (tok) {
      if (COUNTRY_CODES.indexOf(tok) >= 0) out.c = out.c || tok;
      else if (tok === 'en' || tok === 'ar') out.lang = out.lang || tok;
      else if (['resident', 'business', 'waitlist', 'start'].indexOf(tok) >= 0) out.p = out.p || tok;
    });
    return out;
  }

  function uid() {
    var s = Date.now().toString(36).toUpperCase();
    for (var i = 0; i < 5; i++) s += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)];
    return s.slice(-10);
  }

  function store(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null');
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }

  // ---------- Data access ----------
  function cfg() { return window.ADAM_CONFIG || {}; }
  // Targets for one country; config may give one set for all, or one per country
  function targets(c) {
    var T0 = cfg().TARGETS || {};
    if (T0.residents !== undefined) return T0;
    return T0[c] || T0['default'] || { residents: 0, waitlist: 0, businesses: 0, commitments: 0 };
  }
  function isDemo() { return !cfg().SCRIPT_URL; }

  function post(body) {
    return fetch(cfg().SCRIPT_URL, { method: 'POST', body: JSON.stringify(body) }) // text/plain: no CORS preflight
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'failed'); return j; });
  }

  function submit(kind, data) {
    if (isDemo()) {
      var sheet = AdamStats.SHEET_OF[kind];
      var rows = store('adam_demo_rows') || {};
      var list = (rows[sheet] = rows[sheet] || []);
      var old = null;
      for (var i = 0; i < list.length; i++) if (list[i].id === data.id) old = list[i];
      if (old) { if (old.status !== 'complete' || data.status === 'complete') Object.assign(old, data); }
      else list.push(Object.assign({}, data, { ts: new Date().toISOString() }));
      store('adam_demo_rows', rows);
      return new Promise(function (res) { setTimeout(function () { res({ ok: true, id: data.id, demo: true }); }, 450); });
    }
    return post({ action: 'submit', kind: kind, data: data });
  }

  function stats(c) {
    if (isDemo()) return Promise.resolve(Object.assign(AdamStats.compute(demoRows(), { country: c }), { demo: true }));
    return fetch(cfg().SCRIPT_URL + '?action=stats&country=' + encodeURIComponent(c || 'qa') + '&t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'failed'); return j.stats; });
  }

  function admin(key) {
    if (isDemo()) return Promise.resolve({ ok: true, demo: true, rows: demoRows() });
    return post({ action: 'admin', key: key });
  }

  // ---------- Demo data (clearly fake, only used while SCRIPT_URL is empty) ----------
  function demoRows() {
    var seed = 20261012;
    function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    function pick(w) { var keys = Object.keys(w), tot = 0, i; for (i = 0; i < keys.length; i++) tot += w[keys[i]]; var x = rnd() * tot; for (i = 0; i < keys.length; i++) { x -= w[keys[i]]; if (x <= 0) return keys[i]; } return keys[0]; }
    function multi(w, max) { var out = []; Object.keys(w).forEach(function (k) { if (rnd() < w[k] && out.length < max) out.push(k); }); if (!out.length) out.push(Object.keys(w)[0]); return out.join('|'); }
    var now = Date.now(), DAY = 86400000, span = 20;
    function ts(i, n) { var f = Math.pow(i / n, 0.8); return new Date(now - span * DAY + f * span * DAY + rnd() * DAY * 0.6).toISOString(); }
    var srcW = { instagram: 5, whatsapp: 7, linkedin: 2, facebook: 3, '': 3 };
    function meta(i, n, entry, c) { return { country: c || 'qa', id: 'DEMO' + entry.slice(0, 1).toUpperCase() + i, ts: ts(i, n), lang: rnd() < 0.62 ? 'ar' : 'en', src: pick(srcW), med: '', camp: '', ref: '', entry: entry, device: rnd() < 0.83 ? 'mobile' : 'desktop', dur: 60 + Math.floor(rnd() * 140), flag: '' }; }
    var R = [], W = [], B = [], C = [], i, nR = 330, nB = 40;
    function pickC() { return pick({ qa: 9, ae: 4, sa: 4, eg: 4, other: 1.5 }); }
    function pickArea(c, outside) {
      var w = {}; COUNTRIES[c].areas.forEach(function (a, k) { w[a[0]] = 10 - k; });
      return pick(w);
    }
    for (i = 0; i < nR; i++) {
      var rc = pickC();
      var m = meta(i, nR, rnd() < 0.7 ? 'resident' : 'start', rc);
      var area = pickArea(rc, true);
      R.push(Object.assign(m, {
        r_area: area,
        r_status: area === 'outside' ? '' : pick({ citizen: 2, lt1: 2, y1_3: 4, y3p: 7 }),
        r_age: area === 'outside' ? '' : pick({ '18_24': 3, '25_34': 8, '35_44': 6, '45_54': 3, '55p': 1 }),
        r_category: area === 'outside' ? '' : multi({ food: 0.8, health: 0.45, beauty: 0.35, home: 0.3, kids: 0.25, car: 0.15, other: 0.05 }, 3),
        r_sources: area === 'outside' ? '' : multi({ maps: 0.62, friends: 0.58, social: 0.47, groups: 0.36, search: 0.33, apps: 0.25, ai: 0.07, other: 0.03 }, 8),
        r_trust: area === 'outside' ? '' : pick({ friends: 9, groups: 3, maps: 5, social: 2, search: 1, apps: 1, ai: 0.3 }),
        r_pain: area === 'outside' ? '' : multi({ reviews: 0.46, outdated: 0.41, too_many: 0.27, scattered: 0.22, no_match: 0.2, wait: 0.14 }, 2),
        r_recos: area === 'outside' ? '' : pick({ '0': 1, '1_2': 4, '3_5': 5, '6p': 2 }),
        r_disappoint: area === 'outside' ? '' : pick({ often: 3, sometimes: 7, rarely: 3, never: 1 })
      }));
      if (area !== 'outside' && rnd() < 0.7) W.push(Object.assign(meta(i, nR, 'resident', rc), { ts: R[R.length - 1].ts, survey_id: m.id, w_type: 'resident', w_name: 'Demo ' + (i + 1), w_email: 'demo' + (i + 1) + '@example.com', w_whatsapp: '', w_area: area, dup: '' }));
    }
    for (i = 0; i < 160; i++) W.push(Object.assign(meta(i, 160, 'waitlist', pickC()), { survey_id: '', w_type: rnd() < 0.9 ? 'resident' : 'business', w_name: 'Demo W' + (i + 1), w_email: 'demo-w' + (i + 1) + '@example.com', w_whatsapp: '', w_area: '', dup: '' }));
    var bizNames = ['Demo Grill', 'Demo Dental', 'Demo Beauty', 'Demo Café', 'Demo Clinic'];
    for (i = 0; i < nB; i++) {
      var bc = pickC();
      var bm = meta(i, nB, 'business', bc);
      var type = pick({ restaurant: 6, cafe: 3, clinic: 4, salon: 4, other: 1 });
      var pilot = pick({ yes: 7, no: 3 });
      B.push(Object.assign(bm, {
        b_type: type, b_role: pick({ owner: 6, manager: 4, marketing: 2, other: 0.5 }), b_branches: pick({ '1': 6, '2_3': 4, '4_10': 2, '10p': 0.5 }),
        b_age: pick({ lt1: 1, '1_3': 4, '3_10': 5, '10p': 2 }), b_channels: multi({ wom: 0.72, maps: 0.55, social: 0.5, apps: 0.3, influencers: 0.22, ads: 0.2, walkin: 0.15 }, 3),
        b_wom: pick({ lt20: 2, '20_40': 4, '40_60': 5, '60p': 3, unknown: 1 }), b_challenge: pick({ visibility: 5, cost: 6, reviews: 3, outdated: 2, measure: 3, retention: 2, none: 0.5 }),
        b_spend: pick({ lt2k: 3, '2_5k': 5, '5_15k': 4, '15kp': 1, unknown: 2 }), b_priority: String(Math.min(10, Math.max(3, Math.round(7 + (rnd() - 0.45) * 5)))),
        b_pay: pick({ monthly: 5, commission: 4, free_light: 3, depends: 3 }), b_pilot: pilot
      }));
      if (pilot !== 'no' && rnd() < 0.7) C.push(Object.assign(meta(i, nB, 'business', bc), {
        ts: bm.ts, survey_id: bm.id, b_type: type, c_name: 'Demo Owner ' + (i + 1), c_title: 'Owner', c_business: bizNames[i % 5] + ' ' + (i + 1),
        c_cr: '', c_area: pickArea(bc, false), c_email: 'owner' + (i + 1) + '@example.com', c_phone: '', c_agree_terms: 'yes', c_agree_name: rnd() < 0.7 ? 'yes' : 'no',
        c_call: rnd() < 0.6 ? 'yes' : 'no', c_signature: 'Demo Owner ' + (i + 1), terms_version: TERMS_VERSION, email_sent: 'demo', dup: ''
      }));
    }
    // A few people who closed the page part-way
    [['resident', 'r_category', 4], ['resident', 'r_sources', 5], ['resident', 'r_pain', 7], ['resident', 'r_status', 2], ['business', 'b_wom', 6], ['business', 'b_spend', 8]].forEach(function (p, k) {
      for (var j = 0; j < (p[0] === 'resident' ? 6 - (k % 3) : 2); j++) {
        var src = p[0] === 'resident' ? R[(k * 11 + j * 7) % R.length] : B[(k + j) % B.length];
        var row = Object.assign({}, src, { id: 'DEMOP' + k + j, status: 'partial', last_q: p[1], step: String(p[2]), dur: 25 + j * 9 });
        var flow = FLOWS[p[0]];
        flow.slice(p[2]).forEach(function (f) { row[f] = ''; });
        (p[0] === 'resident' ? R : B).push(row);
      }
    });
    var mine = store('adam_demo_rows') || {};
    return {
      Residents: R.concat(mine.Residents || []),
      Waitlist: W.concat(mine.Waitlist || []),
      Businesses: B.concat(mine.Businesses || []),
      Commitments: C.concat(mine.Commitments || [])
    };
  }

  // ---------- Small DOM helpers ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c !== null && c !== undefined && c !== false) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  function fmtPct(k, n) { return n ? Math.round((k / n) * 100) + '%' : '–'; }

  setCountry((window.ADAM_CONFIG || {}).DEFAULT_COUNTRY || 'qa');

  window.Adam = {
    Q: Q, FLOWS: FLOWS, EXTRA: EXTRA, T: T, TERMS: TERMS, TERMS_VERSION: TERMS_VERSION,
    t: t, label: label, question: question, codes: codes, langIndex: langIndex,
    params: params, uid: uid, store: store, cfg: cfg, isDemo: isDemo,
    COUNTRIES: COUNTRIES, COUNTRY_CODES: COUNTRY_CODES, setCountry: setCountry, country: country, countryInfo: countryInfo,
    countryPhrase: countryPhrase, validCountry: validCountry, targets: targets,
    submit: submit, stats: stats, admin: admin, demoRows: demoRows,
    el: el, fmtPct: fmtPct
  };
})();
