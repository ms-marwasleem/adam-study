/* Public live results page for reviewers. Receives aggregate numbers only. */
(function () {
  'use strict';
  var A = window.Adam, C = window.AdamCharts, el = A.el;

  var R = {
    lang_switch: ['English', 'العربية'],
    eyebrow: ['تحقّق ميداني مباشر · {name}', 'Live market validation · {name}'],
    title: ['كيف يجد الناس {inR} الأماكن والخدمات المحلية', 'How people {inR} find local places and services'],
    lead: ['نتائج دراسة أونلاين مستمرة مع المقيمين وأصحاب الأعمال {inR}. الأرقام تتحدّث تلقائياً كل يوم.', 'Results from an ongoing online study with residents and business owners {inR}. The numbers update automatically every day.'],
    updated: ['آخر تحديث {t} · تتحدّث النتائج يومياً', 'Updated {t} · results update daily'],
    progress: ['التقدّم نحو الأهداف', 'Progress to targets'],
    m_res: ['مقيمون أكملوا الاستبيان', 'Residents surveyed'],
    m_wl: ['مقيمون في قائمة الانتظار', 'Residents on the waitlist'],
    m_wl_foot: ['{p}% من الهدف · مقيمون سجّلوا ليستخدموا التطبيق عند إطلاقه', '{p}% of target · residents who signed up to use the app at launch'],
    m_biz: ['أصحاب أعمال أكملوا الاستبيان', 'Businesses surveyed'],
    m_com: ['أصحاب أعمال في التجربة المجانية', 'Businesses in the free pilot'],
    m_com_foot: ['{p}% من الهدف · أصحاب أعمال سجّلوا ليجرّبوا التطبيق مجاناً قبل إطلاقه', '{p}% of target · business owners who signed up to try the app free before launch'],
    of_target: ['{p}% من الهدف', '{p}% of target'],
    findings: ['أهم النتائج', 'Key findings'],
    f_people_trust: ['يثقون بترشيحات من يعرفونهم أكثر من أي مصدر آخر عند القرار النهائي', 'trust people they know more than any other source for the final decision'],
    f_reco3: ['اختاروا مكاناً 3 مرات أو أكثر خلال 3 أشهر بسبب ترشيح من شخص يعرفونه', 'chose a place 3+ times in 3 months because someone they know recommended it'],
    f_disappoint: ['خاب ظنهم بعد الاعتماد على تقييمات الإنترنت', 'have been let down after relying on online ratings'],
    f_people_used: ['يسألون الأصدقاء أو المجموعات عادةً عند البحث', 'usually ask friends or group chats when searching'],
    f_biz_wom40: ['من أصحاب الأعمال يحصلون على 40% أو أكثر من عملائهم الجدد عبر الترشيحات', 'of businesses get 40% or more of new customers through recommendations'],
    f_biz_priority7: ['من أصحاب الأعمال سيستخدمون أداة جديدة توصلهم للعملاء (7 من 10 أو أكثر)', 'of businesses would likely use a new tool that connects them with customers (7/10 or higher)'],
    f_biz_pays: ['من أصحاب الأعمال مستعدون للدفع باشتراك شهري أو بعمولة', 'of businesses would pay by monthly subscription or commission'],
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
    btype: ['نوع النشاط', 'Business type'],
    com_type: ['تسجيلات التجربة حسب نوع النشاط', 'Pilot sign-ups by business type'],
    method: ['المنهجية', 'Method'],
    method_items: [[
      'الدراسة أونلاين بالكامل، بالعربية والإنجليزية، وتُنشر عبر قنوات تواصل {inR}.',
      'يُستبعد من لا يقيم {inR}، والردود السريعة بشكل غير طبيعي، والتسجيلات المكررة بنفس البريد.',
      'هذه الصفحة لا تعرض أي بيانات شخصية، فقط أرقاماً مجمّعة.',
      'تسجيلات التجربة يقدّمها أصحاب الأعمال باسم النشاط وبريد العمل بعد إكمال الاستبيان.'
    ], [
      'Fully online, in Arabic and English, distributed through channels {inR}.',
      'Excludes people not living {inR}, unusually fast responses and repeat sign-ups with the same email.',
      'This page shows aggregate numbers only, never personal details.',
      'Pilot sign-ups are submitted by business owners with their business name and work email after completing the survey.'
    ]],
    period: ['فترة الجمع: {a} – {b}', 'Collection period: {a} – {b}'],
    demo: ['بيانات تجريبية للعرض فقط. ستظهر الأرقام الحقيقية بعد ربط الصفحة بالشيت.', 'Sample data for preview only. Real numbers appear once the page is connected.'],
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
    var TG = A.targets(country);

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

    function load() {
      A.stats(country).then(function (s) { data = s; failed = false; render(); }).catch(function () { failed = true; render(); });
    }

    function panel(title, sub, body) {
      return el('div', { class: 'panel' }, [el('h3', { text: title }), sub ? el('p', { class: 'sub', text: sub }) : null, body]);
    }

    function render() {
      A.setCountry(country);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      root.innerHTML = '';
      if (data && data.demo) root.appendChild(el('div', { class: 'demo-banner', text: L('demo') }));
      root.appendChild(el('div', { class: 'serration', 'aria-hidden': 'true' }));
      root.appendChild(el('div', { class: 'topbar' }, [
        el('span', { class: 'brand', text: (A.cfg().PROJECT_NAME || '') + (lang === 'ar' ? ' · نتائج التحقق · ' : ' · Validation results · ') + CI.name[A.langIndex(lang)] }),
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
      if (!data) { main.appendChild(el('p', { class: 'lead', text: '…' })); return; }

      var c = data.counts, li = A.langIndex(lang);
      // Progress
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('progress') })]));
      function pct(v, t) { return t ? Math.round((v / t) * 100) : 0; }
      main.appendChild(el('div', { class: 'grid g4' }, [
        C.meter(L('m_res'), c.residents, TG.residents, L('of_target', { p: pct(c.residents, TG.residents) })),
        C.meter(L('m_wl'), c.waitlist, TG.waitlist, L('m_wl_foot', { p: pct(c.waitlist, TG.waitlist) })),
        C.meter(L('m_biz'), c.businesses, TG.businesses, L('of_target', { p: pct(c.businesses, TG.businesses) })),
        C.meter(L('m_com'), c.commitments, TG.commitments, L('m_com_foot', { p: pct(c.commitments, TG.commitments) }))
      ]));

      // Findings
      var F = data.findings;
      var list = [
        ['people_trust', F.people_trust], ['reco3', F.reco3], ['disappoint', F.disappoint],
        ['biz_wom40', F.biz_wom40], ['biz_priority7', F.biz_priority7], ['biz_pays', F.biz_pays]
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
      var bo = function (field, extra) { return Object.assign({ field: field, lang: lang, minN: MIN, hideMsg: hide }, extra || {}); };
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('residents') }), el('span', { text: 'n = ' + rn })]));
      main.appendChild(el('div', { class: 'grid g2' }, [
        panel(L('sources'), L('sources_sub'), C.bars(r.sources, rn, bo('r_sources', { highlight: ['friends', 'groups'] }))),
        panel(L('trust'), null, C.bars(r.trust, rn, bo('r_trust', { highlight: ['friends', 'groups'] }))),
        panel(L('pain'), L('pain_sub'), C.bars(r.pain, rn, bo('r_pain'))),
        panel(L('recos'), null, C.bars(r.recos, rn, bo('r_recos', { order: 'schema', highlight: ['3_5', '6p'] }))),
        panel(L('category'), L('category_sub'), C.bars(r.category, rn, bo('r_category'))),
        panel(L('profile'), null, el('div', null, [
          C.bars(r.status, rn, bo('r_status', { order: 'schema' })),
          C.bars(r.age, rn, bo('r_age', { order: 'schema' }))
        ]))
      ]));

      // Businesses
      var b = data.biz, bn = b.n;
      main.appendChild(el('div', { class: 'section-head' }, [el('h2', { text: L('businesses') }), el('span', { text: 'n = ' + bn })]));
      var prio = bn >= MIN ? el('div', null, [C.columns(b.priority, 1, 10), el('p', { class: 'sub', style: 'margin-top:10px', text: L('priority_avg', { v: b.priority_avg }) })])
        : el('p', { class: 'hidden-note', text: hide });
      main.appendChild(el('div', { class: 'grid g2' }, [
        panel(L('channels'), L('channels_sub'), C.bars(b.channels, bn, bo('b_channels', { highlight: ['wom'] }))),
        panel(L('wom'), null, C.bars(b.wom, bn, bo('b_wom', { order: 'schema', highlight: ['40_60', '60p'] }))),
        panel(L('challenge'), null, C.bars(b.challenge, bn, bo('b_challenge'))),
        panel(L('priority'), null, prio),
        panel(L('pay'), null, C.bars(b.pay, bn, bo('b_pay', { highlight: ['monthly', 'commission'] }))),
        panel(L('spend'), null, C.bars(b.spend, bn, bo('b_spend', { order: 'schema' }))),
        panel(L('btype'), null, C.bars(b.type, bn, bo('b_type'))),
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
    var timer = setInterval(load, 60 * 60 * 1000); // picks up the new daily snapshot if the page stays open
    return { stop: function () { clearInterval(timer); } };
  }

  window.AdamResults = { mount: mount };
})();
