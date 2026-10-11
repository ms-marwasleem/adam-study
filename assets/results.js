/* Public live results page for reviewers. Receives aggregate numbers only. */
(function () {
  'use strict';
  var A = window.Adam, C = window.AdamCharts, el = A.el;

  var R = {
    lang_switch: ['English', 'العربية'],
    eyebrow: ['تحقّق ميداني مباشر · {name}', 'Live market validation · {name}'],
    title: ['كيف يجد الناس {inR} الأماكن والخدمات المحلية', 'How people {inR} find local places and services'],
    lead: ['نتائج دراسة أونلاين مستمرة مع المقيمين وأصحاب الأعمال {inR}. الأرقام تتحدّث تلقائياً.', 'Results from an ongoing online study with residents and business owners {inR}. The numbers update automatically.'],
    updated: ['آخر تحديث {t} · نتائج مباشرة', 'Updated {t} · live results'],
    progress: ['الردود حتى الآن', 'Responses so far'],
    m_res: ['مقيمون شاركوا في الاستبيان', 'Residents who took part'],
    m_wl: ['مقيمون في قائمة الانتظار', 'Residents on the waitlist'],
    m_wl_foot: ['مقيمون سجّلوا ليستخدموا التطبيق عند إطلاقه', 'Residents who signed up to use the app at launch'],
    m_biz: ['أصحاب أعمال شاركوا في الاستبيان', 'Businesses who took part'],
    m_com: ['أصحاب أعمال في التجربة المجانية', 'Businesses in the free pilot'],
    m_com_foot: ['أصحاب أعمال سجّلوا ليجرّبوا التطبيق مجاناً قبل إطلاقه', 'Business owners who signed up to try the app free before launch'],
    findings: ['أهم النتائج', 'Key findings'],
    f_people_trust: ['يثقون بترشيحات من يعرفونهم أكثر من أي مصدر آخر عند القرار النهائي', 'trust people they know more than any other source for the final decision'],
    f_reco3: ['اختاروا مكاناً 3 مرات أو أكثر خلال 3 أشهر بسبب ترشيح من شخص يعرفونه', 'chose a place 3+ times in 3 months because someone they know recommended it'],
    f_disappoint: ['خاب ظنهم بعد الاعتماد على تقييمات الإنترنت', 'have been let down after relying on online ratings'],
    f_people_used: ['يسألون الأصدقاء أو المجموعات عادةً عند البحث', 'usually ask friends or group chats when searching'],
    f_biz_wom40: ['من أصحاب الأعمال يحصلون على 40% أو أكثر من عملائهم الجدد عبر الترشيحات', 'of businesses get 40% or more of new customers through recommendations'],
    f_biz_priority7: ['من أصحاب الأعمال سيستخدمون أداة جديدة توصلهم للعملاء (7 من 10 أو أكثر)', 'of businesses would likely use a new tool that connects them with customers (7/10 or higher)'],
    f_biz_pays: ['من أصحاب الأعمال مستعدون للدفع باشتراك شهري أو بعمولة', 'of businesses would pay by monthly subscription or commission'],
    f_res_interest: ['مهتمون بتجربة وسيلة أسرع وأسهل للوصول إلى خيارات تناسبهم', 'are interested in trying a faster, easier way to find options that fit them'],
    f_res_free: ['سيجربون خدمة جديدة إذا كانت مجانية في البداية', 'would try a new service if it were free at first'],
    f_res_pay: ['مستعدون، أو ربما مستعدون، للدفع مقابل مزايا إضافية إذا أثبتت الخدمة فائدتها', 'would or might pay for extra features once the service proves useful'],
    f_biz_wrong_info: ['من أصحاب الأعمال واجهوا مشكلات بسبب معلومات قديمة أو غير دقيقة عن نشاطهم على الإنترنت', 'of businesses have had problems from outdated or wrong information about them online'],
    f_biz_inq_1h: ['من أصحاب الأعمال يقضي فريقهم ساعة أو أكثر يومياً في الرد على استفسارات متكررة', 'of businesses spend an hour or more a day answering repeat customer questions'],
    f_biz_no_tools: ['من أصحاب الأعمال لا يستخدمون أدوات متخصصة لتحليل الأداء أو قرارات التسويق', 'of businesses don’t use specialised tools to analyse performance or guide marketing'],
    took_part: ['شارك {s} · أكمل {d}', 'Took part {s} · Completed {d}'],
    answered_n: ['أجاب على هذا السؤال: {n}', 'Answered this question: {n}'],
    n_of: ['{k} من {n}', '{k} of {n}'],
    pays_depends: [' · و{d} ({p}) آخرين سيدفعون حسب أداء الأداة', ' · plus {d} ({p}) who would pay depending on how well it works'],
    collecting: ['جارٍ جمع الردود (يُعرض عند {m} رداً)', 'Collecting responses (shown at {m})'],
    growth: ['نمو المشاركة', 'Participation over time'],
    growth_sub: ['إجمالي من أكملوا الاستبيانين (مقيمون + أصحاب أعمال)', 'Total completed surveys (residents + businesses)'],
    respondents: ['مشارك', 'respondents'],
    residents: ['المقيمون', 'Residents'],
    businesses: ['أصحاب الأعمال', 'Business owners'],
    sources: ['المصادر التي يستخدمونها عادةً للبحث', 'Sources they usually use to search'],
    sources_sub: ['يمكن اختيار أكثر من مصدر', 'Multiple answers allowed'],
    trust: ['المصدر الأكثر ثقة عند القرار', 'Most trusted source for the decision'],
    pain: ['أكثر ما يزعجهم في البحث', 'Biggest frustrations when searching'],
    pain_sub: ['حتى خيارين لكل مشارك', 'Up to two per respondent'],
    recos: ['اختيارات بسبب ترشيح شخصي (آخر 3 أشهر)', 'Choices made on a personal recommendation (last 3 months)'],
    category: ['أهم ما يبحثون عنه', 'What they look for most'],
    category_sub: ['حتى 3 لكل مشارك', 'Up to three per respondent'],
    profile: ['من شارك', 'Who took part'],
    channels: ['من أين يأتي عملاؤهم الجدد', 'Where their new customers come from'],
    channels_sub: ['حتى 3 لكل نشاط', 'Up to three per business'],
    wom: ['نسبة العملاء الجدد القادمين بترشيح', 'Share of new customers from recommendations'],
    challenge: ['أصعب تحدٍّ في جذب العملاء', 'Hardest challenge in attracting customers'],
    priority: ['احتمال استخدام أداة جديدة (1–10)', 'Likelihood of using a new tool (1–10)'],
    priority_avg: ['المتوسط {v} من 10', 'Average {v} out of 10'],
    spend: ['الإنفاق الشهري على التسويق', 'Monthly marketing spend'],
    pay: ['طريقة الدفع المفضّلة', 'Preferred way to pay'],
    satisfaction: ['الرضا عن طرق البحث الحالية', 'Satisfaction with current ways of searching'],
    interest: ['الاهتمام بتجربة وسيلة أسرع وأسهل', 'Interest in trying a faster, easier way'],
    features: ['ما يشجعهم على تجربة وسيلة جديدة', 'What would get them to try something new'],
    free: ['تجربة خدمة جديدة إذا كانت مجانية في البداية', 'Trying a new service if it were free at first'],
    rpay: ['الدفع مقابل مزايا إضافية', 'Paying for extra features'],
    update: ['كيف تُحدَّث معلومات النشاط على الإنترنت', 'How their online information is kept up to date'],
    wrong_info: ['مشكلات بسبب معلومات قديمة أو خاطئة', 'Problems from outdated or wrong information'],
    inquiries: ['الاستفسارات المتكررة من العملاء', 'Repeat customer questions'],
    inq_time: ['الوقت اليومي للرد على الاستفسارات', 'Time spent each day on these questions'],
    tools: ['استخدام أدوات رقمية للتحليل والتسويق', 'Use of digital tools for analysis and marketing'],
    tools_sat: ['الرضا عن الأدوات الرقمية الحالية', 'Satisfaction with current digital tools'],
    goals: ['ما يريدون تحسينه خلال 12 شهراً', 'What they want to improve in the next 12 months'],
    success: ['ما يجعل الأداة الجديدة مفيدة في نظرهم', 'What would make a new tool worth it'],
    up3: ['حتى 3 لكل مشارك', 'Up to three per respondent'],
    btype: ['نوع النشاط', 'Business type'],
    com_type: ['تسجيلات التجربة حسب نوع النشاط', 'Pilot sign-ups by business type'],
    method: ['المنهجية', 'Method'],
    method_items: [[
      'الدراسة أونلاين بالكامل، بالعربية والإنجليزية، وتُنشر عبر قنوات تواصل {inR}.',
      'نسبة كل سؤال محسوبة من كل من أجاب عليه، حتى لو لم يكمل الاستبيان، والعدد مكتوب تحت كل سؤال.',
      'يُستبعد من لا يقيم {inR}، والردود السريعة بشكل غير طبيعي، والتسجيلات المكررة.',
      'هذه الصفحة لا تعرض أي بيانات شخصية، فقط أرقاماً مجمّعة.',
      'تسجيلات التجربة يقدّمها أصحاب الأعمال باسم النشاط وبريد إلكتروني أو رقم جوال بعد إكمال الاستبيان.'
    ], [
      'Fully online, in Arabic and English, distributed through channels {inR}.',
      'Each question’s percentages are based on everyone who answered it, even if they didn’t finish the survey; the count is shown under each question.',
      'Excludes people not living {inR}, unusually fast responses and repeat sign-ups.',
      'This page shows aggregate numbers only, never personal details.',
      'Pilot sign-ups are submitted by business owners with their business name and an email or mobile number after completing the survey.'
    ]],
    period: ['فترة الجمع: {a} – {b}', 'Collection period: {a} – {b}'],
    demo: ['بيانات تجريبية للعرض فقط. ستظهر الأرقام الحقيقية بعد ربط الصفحة بالشيت.', 'Sample data for preview only. Real numbers appear once the page is connected.'],
    loading: ['جاري تحميل النتائج المباشرة…', 'Loading live results…'],
    error: ['تعذّر تحميل النتائج الآن. سنحاول مجدداً تلقائياً.', 'Couldn’t load results right now. Retrying automatically.']
  };

  function mount(root, opts) {
    opts = opts || {};
    var P = A.params();
    var lang = opts.lang || (P.lang === 'ar' ? 'ar' : 'en');
    var data = null, failed = false;
    var MIN = typeof A.cfg().PUBLIC_MIN_N === 'number' ? A.cfg().PUBLIC_MIN_N : 0;
    var country = A.validCountry(opts.country || P.c) || A.cfg().DEFAULT_COUNTRY || 'qa';
    A.setCountry(country);
    var CI = A.countryInfo(country);

    function fillCountry(s) {
      var i = A.langIndex(lang);
      return String(s).replace(/\{inR\}/g, A.countryPhrase(lang, true)).replace(/\{name\}/g, CI.name[i]);
    }
    function L(k, v) {
      var s = R[k] ? R[k][A.langIndex(lang)] : k;
      if (v) Object.keys(v).forEach(function (x) { s = String(s).replace('{' + x + '}', v[x]); });
      return fillCountry(s);
    }
    function fmtTime(iso) {
      try { return new Date(iso).toLocaleString(lang === 'ar' ? 'ar-QA' : 'en-GB', { timeZone: CI.tz, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; }
    }
    function fmtDate(iso) {
      try { return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-QA' : 'en-GB', { timeZone: CI.tz, day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; }
    }

    // The last numbers seen on this device show at once, then the live ones replace them.
    var SAVE_KEY = 'adam_results_' + country;
    try { var kept = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (kept && kept.counts && !A.isDemo()) data = kept; } catch (e) {}

    function load(tries) {
      tries = tries || 0;
      A.stats(country).then(function (s) {
        data = s; failed = false; render();
        try { if (!s.demo) localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {}
      }).catch(function () {
        if (tries < 2) { setTimeout(function () { load(tries + 1); }, 2000); return; } // quietly try again first
        failed = true; render();
      });
    }

    function skeleton() {
      var card = function () { return el('div', { class: 'panel meter skel' }, [el('i'), el('b'), el('i')]); };
      return el('div', {}, [
        el('p', { class: 'loading-note', text: L('loading') }),
        el('div', { class: 'grid g4' }, [card(), card(), card(), card()]),
        el('div', { class: 'grid g3', style: 'margin-top:16px' }, [card(), card(), card()])
      ]);
    }

    function panel(title, sub, body) {
      return el('div', { class: 'panel' }, [el('h3', { text: title }), sub ? el('p', { class: 'sub', text: sub }) : null, body]);
    }

    function brandText() {
      return (A.cfg().PROJECT_NAME || '') + (lang === 'ar' ? ' · نتائج التحقق · ' : ' · Validation results · ') + CI.name[A.langIndex(lang)];
    }

    function render() {
      A.setCountry(country);
      document.title = brandText();
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      root.innerHTML = '';
      if (data && data.demo) root.appendChild(el('div', { class: 'demo-banner', text: L('demo') }));
      root.appendChild(el('div', { class: 'serration', 'aria-hidden': 'true' }));
      root.appendChild(el('div', { class: 'topbar' }, [
        el('span', { class: 'brand', text: brandText() }),
        el('button', { class: 'ghost', type: 'button', text: L('lang_switch'), onclick: function () { lang = lang === 'en' ? 'ar' : 'en'; render(); } })
      ]));
      var main = el('main', { class: 'dash' });
      root.appendChild(main);
      main.appendChild(el('header', { class: 'hero' }, [
        el('div', { class: 'eyebrow', text: L('eyebrow') }),
        el('h1', { text: L('title') }),
        el('p', { text: L('lead') }),
        data ? el('div', { class: 'live', text: L('updated', { t: fmtTime(data.updated) }) }) : null
      ]));
      if (failed && !data) { main.appendChild(el('div', { class: 'error-box', text: L('error') })); return; }
      if (!data) { main.appendChild(skeleton()); return; }

      var c = data.counts, li = A.langIndex(lang);
      // Progress
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('progress') })]));
      main.appendChild(el('div', { class: 'grid g4' }, [
        C.stat(L('m_res'), c.residents_started != null ? c.residents_started : c.residents, L('took_part', { s: c.residents_started != null ? c.residents_started : c.residents, d: c.residents })),
        C.stat(L('m_wl'), c.waitlist, L('m_wl_foot')),
        C.stat(L('m_biz'), c.businesses_started != null ? c.businesses_started : c.businesses, L('took_part', { s: c.businesses_started != null ? c.businesses_started : c.businesses, d: c.businesses })),
        C.stat(L('m_com'), c.commitments, L('m_com_foot'))
      ]));

      // Findings
      var F = data.findings;
      var list = [
        ['people_trust', F.people_trust], ['reco3', F.reco3], ['disappoint', F.disappoint],
        ['res_interest', F.res_interest], ['res_free', F.res_free], ['res_pay', F.res_pay],
        ['biz_wom40', F.biz_wom40], ['biz_wrong_info', F.biz_wrong_info], ['biz_inq_1h', F.biz_inq_1h],
        ['biz_priority7', F.biz_priority7], ['biz_no_tools', F.biz_no_tools], ['biz_pays', F.biz_pays]
      ];
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('findings') })]));
      main.appendChild(el('div', { class: 'grid g3' }, list.map(function (it) {
        var k = it[1][0], n = it[1][1];
        var ready = n >= MIN;
        return el('div', { class: 'panel finding' }, [
          el('div', { class: 'big', text: ready ? A.fmtPct(k, n) : '…' }),
          el('p', { text: L('f_' + it[0]) }),
          el('span', { class: 'n', text: ready ? L('n_of', { k: k, n: n }) + (it[0] === 'biz_pays' && F.biz_pays_depends && F.biz_pays_depends[0] ? L('pays_depends', { d: F.biz_pays_depends[0], p: A.fmtPct(F.biz_pays_depends[0], n) }) : '') : L('collecting', { m: MIN }) })
        ]);
      })));

      // Growth
      var pts = data.timeline.map(function (d) { return { d: d.d, v: d.residents + d.businesses }; });
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('growth') })]));
      main.appendChild(el('div', { class: 'panel' }, [el('p', { class: 'sub', text: L('growth_sub') }), C.cumulative(pts, { unit: L('respondents'), aria: L('growth_sub') })]));

      // Residents
      var r = data.res, rn = r.n;
      var hide = L('collecting', { m: MIN });
      var bo = function (field, extra) { return Object.assign({ field: field, lang: lang, minN: MIN, hideMsg: hide, nLabel: L('answered_n') }, extra || {}); };
      // Each question counts everyone who answered it, including people who didn't finish the survey
      var nq = function (group, field) { return (group.ans && group.ans[field]) || 0; };
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('residents') }), el('span', { text: L('took_part', { s: r.started != null ? r.started : rn, d: rn }) })]));
      main.appendChild(el('div', { class: 'grid g2' }, [
        panel(L('sources'), L('sources_sub'), C.bars(r.sources, nq(r, 'r_sources'), bo('r_sources', { highlight: ['friends', 'groups'] }))),
        panel(L('trust'), null, C.bars(r.trust, nq(r, 'r_trust'), bo('r_trust', { highlight: ['friends', 'groups'] }))),
        panel(L('pain'), L('pain_sub'), C.bars(r.pain, nq(r, 'r_pain'), bo('r_pain'))),
        panel(L('recos'), null, C.bars(r.recos, nq(r, 'r_recos'), bo('r_recos', { order: 'schema', highlight: ['3_5', '6p'] }))),
        panel(L('category'), L('category_sub'), C.bars(r.category, nq(r, 'r_category'), bo('r_category'))),
        panel(L('satisfaction'), null, C.bars(r.satisfaction, nq(r, 'r_satisfaction'), bo('r_satisfaction', { order: 'schema', highlight: ['unsat', 'very_unsat'] }))),
        panel(L('interest'), null, C.bars(r.interest, nq(r, 'r_interest'), bo('r_interest', { order: 'schema', highlight: ['very', 'somewhat'] }))),
        panel(L('features'), L('up3'), C.bars(r.features, nq(r, 'r_features'), bo('r_features'))),
        panel(L('free'), null, C.bars(r.free, nq(r, 'r_free'), bo('r_free', { order: 'schema', highlight: ['definitely', 'likely'] }))),
        panel(L('rpay'), null, C.bars(r.pay, nq(r, 'r_pay'), bo('r_pay', { order: 'schema', highlight: ['yes', 'maybe'] }))),
        panel(L('profile'), null, el('div', null, [
          C.bars(r.status, nq(r, 'r_status'), bo('r_status', { order: 'schema' })),
          C.bars(r.age, nq(r, 'r_age'), bo('r_age', { order: 'schema' }))
        ]))
      ]));

      // Businesses
      var b = data.biz, bn = b.n;
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('businesses') }), el('span', { text: L('took_part', { s: b.started != null ? b.started : bn, d: bn }) })]));
      var prio = nq(b, 'b_priority') >= MIN ? el('div', null, [C.columns(b.priority, 1, 10), el('p', { class: 'sub', style: 'margin-top:10px', text: L('priority_avg', { v: b.priority_avg }) }), el('p', { class: 'n-label', text: L('answered_n').replace('{n}', nq(b, 'b_priority')) })])
        : el('p', { class: 'hidden-note', text: hide });
      main.appendChild(el('div', { class: 'grid g2' }, [
        panel(L('channels'), L('channels_sub'), C.bars(b.channels, nq(b, 'b_channels'), bo('b_channels', { highlight: ['wom'] }))),
        panel(L('wom'), null, C.bars(b.wom, nq(b, 'b_wom'), bo('b_wom', { order: 'schema', highlight: ['40_60', '60p'] }))),
        panel(L('challenge'), null, C.bars(b.challenge, nq(b, 'b_challenge'), bo('b_challenge'))),
        panel(L('update'), null, C.bars(b.update, nq(b, 'b_update'), bo('b_update', { order: 'schema' }))),
        panel(L('wrong_info'), null, C.bars(b.wrong_info, nq(b, 'b_wrong_info'), bo('b_wrong_info', { order: 'schema', highlight: ['often', 'sometimes'] }))),
        panel(L('inquiries'), L('up3'), C.bars(b.inquiries, nq(b, 'b_inquiries'), bo('b_inquiries'))),
        panel(L('inq_time'), null, C.bars(b.inq_time, nq(b, 'b_inq_time'), bo('b_inq_time', { order: 'schema', highlight: ['1_3', '3p'] }))),
        panel(L('tools'), null, C.bars(b.tools, nq(b, 'b_tools'), bo('b_tools', { order: 'schema' }))),
        panel(L('tools_sat'), null, C.bars(b.tools_sat, nq(b, 'b_tools_sat'), bo('b_tools_sat', { order: 'schema' }))),
        panel(L('goals'), L('up3'), C.bars(b.goals, nq(b, 'b_goals'), bo('b_goals'))),
        panel(L('success'), L('up3'), C.bars(b.success, nq(b, 'b_success'), bo('b_success'))),
        panel(L('priority'), null, prio),
        panel(L('pay'), null, C.bars(b.pay, nq(b, 'b_pay'), bo('b_pay', { highlight: ['monthly', 'commission'] }))),
        panel(L('spend'), null, C.bars(b.spend, nq(b, 'b_spend'), bo('b_spend', { order: 'schema' }))),
        panel(L('btype'), null, C.bars(b.type, nq(b, 'b_type'), bo('b_type'))),
        panel(L('com_type'), null, C.bars(data.com.type, data.com.n, { field: 'b_type', lang: lang, raw: true, emptyMsg: '–' }))
      ]));

      // Method
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('method') })]));
      var items = R.method_items[li].map(fillCountry);
      if (data.first) items.push(L('period', { a: fmtDate(data.first), b: fmtDate(data.last) }));
      main.appendChild(el('div', { class: 'panel' }, [el('ul', { class: 'method' }, items.map(function (s) { return el('li', { text: s }); }))]));
      main.appendChild(el('p', { class: 'site-foot', text: '© ' + new Date().getFullYear() + ' ' + (A.cfg().PROJECT_NAME || '') }));
    }

    render();
    load();
    var timer = setInterval(load, 2 * 60 * 1000); // refresh every 2 minutes while the page stays open
    return { stop: function () { clearInterval(timer); } };
  }

  window.AdamResults = { mount: mount };
})();
