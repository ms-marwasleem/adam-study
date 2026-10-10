/* Internal dashboard for the founders: full responses, profiles, sources, contacts. Protected by the admin key. */
(function () {
  'use strict';
  var A = window.Adam, C = window.AdamCharts, el = A.el;

  var S_ = {
    lang_switch: ['English', 'العربية'],
    title: ['لوحة التحقق الداخلية', 'Internal validation dashboard'],
    sub: ['كل الردود والتفاصيل للتخطيط. لا تشارك هذا الرابط أو المفتاح خارج الفريق.', 'All responses and details for planning. Don’t share this link or key outside the team.'],
    key: ['مفتاح الدخول', 'Access key'],
    key_hint: ['المفتاح الذي ظهر لك عند إعداد Google Sheets.', 'The key shown to you when you set up Google Sheets.'],
    enter: ['دخول', 'Open dashboard'],
    bad_key: ['المفتاح غير صحيح أو تعذّر الاتصال.', 'Wrong key, or the connection failed.'],
    logout: ['خروج', 'Sign out'],
    refresh: ['تحديث', 'Refresh'],
    loaded: ['آخر تحميل {t}', 'Loaded {t}'],
    f_country: ['الدولة', 'Country'], all_countries: ['كل الدول', 'All countries'],
    by_country: ['مقارنة الدول', 'Countries compared'],
    cc_trust: ['يثقون بالأشخاص أكثر', 'Trust people most'], cc_pay: ['أعمال مستعدة للدفع', 'Businesses that would pay'],
    f_range: ['الفترة', 'Period'], all: ['كل الفترة', 'All time'], d7: ['آخر 7 أيام', 'Last 7 days'], d30: ['آخر 30 يوماً', 'Last 30 days'],
    f_src: ['المصدر', 'Source'], f_lang: ['اللغة', 'Language'], f_dev: ['الجهاز', 'Device'], any: ['الكل', 'All'], direct: ['مباشر (غالباً واتساب أو رسالة) / غير معروف', 'Direct (often WhatsApp or a message) / unknown'],
    t_over: ['نظرة عامة', 'Overview'], t_res: ['المقيمون', 'Residents'], t_biz: ['أصحاب الأعمال', 'Businesses'],
    t_wl: ['قائمة الانتظار', 'Waitlist'], t_com: ['تسجيلات التجربة', 'Pilot sign-ups'], t_src: ['المصادر والقنوات', 'Sources & channels'],
    m_res: ['استبيانات المقيمين', 'Resident surveys'], m_wl: ['مقيمون في قائمة الانتظار', 'Residents on the waitlist'],
    m_biz: ['استبيانات الأعمال', 'Business surveys'], m_com: ['أصحاب أعمال في التجربة المجانية', 'Businesses in the free pilot'],
    excluded: ['غير محسوب في الأرقام: {p} استبيان لم يكتمل · {o} خارج البلد · {f} ردود مشبوهة', 'Not counted: {p} unfinished surveys · {o} outside the country · {f} suspicious'],
    dropoff: ['أين توقّف من لم يكمل', 'Where unfinished surveys stopped'],
    dropoff_sub: ['{p} استبيان لم يكتمل. إجاباتهم محفوظة حتى آخر سؤال أجابوه.', '{p} unfinished surveys. Their answers are saved up to the last question answered.'],
    st_complete: ['مكتمل', 'Complete'], st_partial: ['توقّف عند {s}', 'Stopped at {s}'],
    funnel: ['التحويل', 'Conversion'],
    fn_res_wl: ['من أكمل استبيان المقيمين وسجّل في الانتظار', 'Residents who joined the waitlist'],
    fn_biz_pilot: ['أصحاب أعمال قالوا نعم للتجربة', 'Businesses saying yes to the pilot'],
    fn_pilot_com: ['منهم أكملوا التسجيل', 'Of those, completed the sign-up'],
    fn_call: ['تسجيلات فيها رقم جوال', 'Sign-ups with a mobile number'],
    growth: ['النمو التراكمي (استبيانات)', 'Cumulative surveys'],
    daily: ['نشاط آخر 14 يوماً', 'Last 14 days'],
    daily_sub: ['استبيانات وتسجيلات يومياً، حسب يوم الشهر', 'Surveys and sign-ups per day, by day of month'],
    by_src: ['حسب المصدر', 'By source'],
    by_entry: ['حسب الرابط المستخدم', 'By link used'],
    by_lang: ['حسب اللغة', 'By language'], by_dev: ['حسب الجهاز', 'By device'],
    profile: ['ملف المشاركين', 'Participant profile'], behaviour: ['السلوك والمشاكل', 'Behaviour and pain points'],
    area: ['المنطقة', 'Area'], status: ['مدة الإقامة', 'Time in the country'], age: ['العمر', 'Age'],
    sources: ['المصادر المستخدمة', 'Sources used'], trust: ['الأكثر ثقة', 'Most trusted'], pain: ['المشاكل', 'Frustrations'],
    recos: ['اختيارات بترشيح (3 أشهر)', 'Recommendation-led choices (3 months)'], disappoint: ['خيبة من التقييمات', 'Let down by ratings'], category: ['أهم ما يبحثون عنه', 'What they look for most'],
    trust_by_status: ['الثقة بالأشخاص حسب مدة الإقامة', 'Trust in people by time in the country'],
    btype: ['نوع النشاط', 'Business type'], role: ['الدور', 'Role'], branches: ['عدد الفروع', 'Branches'], bage: ['مدة العمل في البلد', 'Years operating in the country'],
    channels: ['قنوات العملاء الجدد', 'New-customer channels'], wom: ['نسبة العملاء بالترشيح', 'Share from recommendations'],
    challenge: ['التحدي الأكبر', 'Hardest challenge'], spend: ['الإنفاق الشهري', 'Monthly spend'], pay: ['طريقة الدفع', 'Preferred payment'],
    pilot: ['الاهتمام بالتجربة', 'Pilot interest'], priority: ['احتمال الاستخدام 1–10', 'Likelihood to use 1–10'],
    rows: ['{n} صف', '{n} rows'], csv: ['تنزيل CSV', 'Download CSV'], search: ['بحث بالاسم أو البريد…', 'Search name or email…'],
    none: ['لا توجد بيانات بعد', 'No data yet'],
    demo: ['وضع تجريبي: بيانات وهمية، والصفحة غير مربوطة بالشيت بعد.', 'Demo mode: sample data, not connected yet.'],
    yes: ['نعم', 'Yes'], no: ['لا', 'No'],
    col: {
      country: ['الدولة', 'Country'],
      ts: ['التاريخ', 'Date'], id: ['المرجع', 'Ref'], src: ['المصدر', 'Source'], lang: ['اللغة', 'Lang'], entry: ['الرابط', 'Link'], device: ['الجهاز', 'Device'], dur: ['ثوانٍ', 'Secs'], flag: ['ملاحظة', 'Flag'],
      w_name: ['الاسم', 'Name'], w_email: ['البريد', 'Email'], w_whatsapp: ['واتساب', 'WhatsApp'], w_type: ['النوع', 'Type'], w_area: ['المنطقة', 'Area'],
      c_business: ['النشاط', 'Business'], b_type: ['النوع', 'Type'], c_name: ['الاسم', 'Name'], c_title: ['المنصب', 'Title'], c_email: ['البريد', 'Email'], c_phone: ['الجوال', 'Phone'],
      c_cr: ['السجل التجاري', 'CR'], c_area: ['المنطقة', 'Area'], c_agree_name: ['يسمح بذكر الاسم', 'May be named'], c_call: ['يقبل مكالمة', 'Call OK'], email_sent: ['إيميل التأكيد', 'Email sent'],
      committed: ['أرسل موافقة', 'Committed'], status: ['الحالة', 'Status']
    }
  };

  function mount(root) {
    var lang = 'ar', key = '', rows = null, demo = false, loadedAt = null, err = '';
    var tab = 'over', F = { country: '', range: 'all', src: '', lang: '', dev: '' }, q = '';
    try { key = sessionStorage.getItem('adam_admin_key') || ''; } catch (e) {}

    function L(k, v) {
      var s = S_[k] ? S_[k][A.langIndex(lang)] : k;
      if (v) Object.keys(v).forEach(function (x) { s = String(s).replace('{' + x + '}', v[x]); });
      return s;
    }
    function colName(c) { return S_.col[c] ? S_.col[c][A.langIndex(lang)] : (A.Q[c] ? A.question(c, lang) : c); }
    function fmt(iso) {
      try { return new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Qatar', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; }
    }

    function load() {
      err = '';
      A.admin(key).then(function (j) {
        rows = j.rows; demo = !!j.demo; loadedAt = new Date().toISOString();
        try { sessionStorage.setItem('adam_admin_key', key); } catch (e) {}
        render();
      }).catch(function () { rows = null; err = L('bad_key'); render(); });
    }

    function filtered(sheet) {
      var list = (rows && rows[sheet]) || [];
      var since = F.range === 'd7' ? Date.now() - 7 * 864e5 : F.range === 'd30' ? Date.now() - 30 * 864e5 : 0;
      return list.filter(function (r) {
        if (since && new Date(r.ts).getTime() < since) return false;
        if (F.src && (F.src === '_none' ? r.src : r.src !== F.src)) return false;
        if (F.lang && r.lang !== F.lang) return false;
        if (F.dev && r.device !== F.dev) return false;
        if (F.country && AdamStats.countryOf(r) !== F.country) return false;
        return true;
      });
    }
    function filteredAll() {
      return { Residents: filtered('Residents'), Waitlist: filtered('Waitlist'), Businesses: filtered('Businesses'), Commitments: filtered('Commitments') };
    }

    function panel(title, body, sub) { return el('div', { class: 'panel' }, [el('h3', { text: title }), sub ? el('p', { class: 'sub', text: sub }) : null, body]); }
    function head(title, note) { return el('div', { class: 'section-head' }, [el('h2', { text: title }), note ? el('span', { text: note }) : null]); }
    function bars(counts, n, field, extra) { return C.bars(counts, n, Object.assign({ field: field, lang: lang, emptyMsg: L('none') }, extra || {})); }

    function csv(name, cols, list) {
      var lines = [cols.join(',')].concat(list.map(function (r) {
        return cols.map(function (c) { var v = r[c] === undefined || r[c] === null ? '' : String(r[c]); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',');
      }));
      var blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      var a = el('a', { href: URL.createObjectURL(blob), download: name + '-' + new Date().toISOString().slice(0, 10) + '.csv' });
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    function table(name, cols, list, decorate) {
      var search = el('input', { type: 'search', id: 'search-' + name, placeholder: L('search'), value: q, oninput: function (e) { q = e.target.value; draw(); } });
      var count = el('span', { class: 'sub' });
      var wrap = el('div', { class: 'table-wrap' });
      function draw() {
        var needle = q.trim().toLowerCase();
        var shown = list.slice().sort(function (a, b) { return String(b.ts).localeCompare(String(a.ts)); }).filter(function (r) {
          return !needle || cols.some(function (c) { return String(r[c] || '').toLowerCase().indexOf(needle) >= 0; });
        });
        count.textContent = L('rows', { n: shown.length });
        var tb = el('tbody', null, shown.map(function (r) {
          return el('tr', null, cols.map(function (c) {
            var v = r[c];
            if (decorate && decorate[c]) return el('td', null, [decorate[c](v, r)]);
            if (c === 'ts') v = fmt(v);
            else if (c === 'c_area' || c === 'w_area') v = A.label('r_area', v, lang);
            else if (A.Q[c] || A.EXTRA[c]) v = AdamStats.split(v).map(function (x) { return A.label(c, x, lang); }).join('، ');
            return el('td', { text: v === undefined ? '' : String(v) });
          }));
        }));
        wrap.innerHTML = '';
        wrap.appendChild(el('table', null, [el('thead', null, [el('tr', null, cols.map(function (c) { return el('th', { text: colName(c) }); }))]), tb]));
      }
      draw();
      return el('div', null, [
        el('div', { class: 'toolbar' }, [search, el('button', { class: 'ghost', type: 'button', text: L('csv'), onclick: function () { csv(name, cols, list); } }), count]),
        wrap
      ]);
    }
    function statusTag(v, r) {
      return v === 'partial' ? el('span', { class: 'tag warn', text: L('st_partial', { s: (r.step || '?') }) }) : el('span', { class: 'tag yes', text: L('st_complete') });
    }
    function dropoff(rowsIn, flow) {
      var parts = rowsIn.filter(AdamStats.isPartial);
      var counts = AdamStats.tally(parts, 'last_q');
      var order = {}; flow.forEach(function (f, i) { order[f] = i; });
      var body = C.bars(counts, parts.length, { lang: lang, raw: true, emptyMsg: L('none'), keys: flow,
        labeler: function (k) { return (order[k] + 1) + '. ' + A.question(k, lang); } });
      return panel(L('dropoff'), body, L('dropoff_sub', { p: parts.length }));
    }
    function yesTag(v) { return el('span', { class: 'tag' + (v === 'yes' ? ' yes' : ''), text: v === 'yes' ? L('yes') : v === 'no' ? L('no') : (v || '') }); }

    // ---------- Views ----------
    function vLogin(main) {
      var input = el('input', { id: 'admin-key', type: 'password', autocomplete: 'current-password', value: key });
      var form = el('form', { class: 'card login fields' }, [
        el('h1', { class: 'q-title', text: L('title') }),
        el('p', { class: 'q-hint', text: L('key_hint') }),
        el('div', { class: 'field' }, [el('label', { for: 'admin-key', text: L('key') }), input]),
        err ? el('div', { class: 'error-box', role: 'alert', text: err }) : null,
        el('button', { class: 'btn block', type: 'submit', text: L('enter') })
      ]);
      form.addEventListener('submit', function (e) { e.preventDefault(); key = input.value.trim(); load(); });
      main.appendChild(form);
    }

    function vOverview(main, D, S) {
      var c = S.counts;
      main.appendChild(el('div', { class: 'grid g4' }, [
        C.stat(L('m_res'), c.residents), C.stat(L('m_wl'), c.waitlist),
        C.stat(L('m_biz'), c.businesses), C.stat(L('m_com'), c.commitments)
      ]));
      var flagged = [].concat(D.Residents, D.Waitlist, D.Businesses, D.Commitments).filter(function (r) { return r.flag; }).length;
      main.appendChild(el('p', { class: 'note', text: L('excluded', { p: c.partial_residents + c.partial_businesses, o: c.screened_out, f: flagged }) }));

      var resIds = {}; D.Waitlist.forEach(function (w) { if (w.survey_id) resIds[w.survey_id] = 1; });
      var resOk = D.Residents.filter(function (r) { return r.r_area !== 'outside' && !r.flag && !AdamStats.isPartial(r); });
      var resToWl = resOk.filter(function (r) { return resIds[r.id]; }).length;
      var pilotYes = D.Businesses.filter(function (b) { return b.b_pilot === 'yes' || b.b_pilot === 'maybe'; });
      var comIds = {}; D.Commitments.forEach(function (x) { if (x.survey_id) comIds[x.survey_id] = 1; });
      var pilotCom = pilotYes.filter(function (b) { return comIds[b.id]; }).length;
      var callOk = D.Commitments.filter(function (x) { return String(x.c_phone || '').trim(); }).length;
      function fn(label, k, n) {
        return el('div', { class: 'panel finding' }, [el('div', { class: 'big', text: A.fmtPct(k, n) }), el('p', { text: label }), el('span', { class: 'n', text: k + ' / ' + n })]);
      }
      if (!F.country) {
        var ccCols = ['country', 'm_res', 'm_wl', 'm_biz', 'm_com', 'cc_trust', 'cc_pay'];
        var ccRows = A.COUNTRY_CODES.map(function (cc) {
          var s2 = AdamStats.compute(D, { country: cc }), f2 = s2.findings;
          return [A.label('country', cc, lang), s2.counts.residents, s2.counts.waitlist, s2.counts.businesses, s2.counts.commitments,
            f2.people_trust[1] ? A.fmtPct(f2.people_trust[0], f2.people_trust[1]) : '–', f2.biz_pays[1] ? A.fmtPct(f2.biz_pays[0], f2.biz_pays[1]) : '–'];
        });
        main.appendChild(head(L('by_country')));
        main.appendChild(el('div', { class: 'table-wrap' }, [el('table', null, [
          el('thead', null, [el('tr', null, ccCols.map(function (k) { return el('th', { text: k === 'country' ? L('f_country') : L(k) }); }))]),
          el('tbody', null, ccRows.map(function (r) { return el('tr', null, r.map(function (v) { return el('td', { text: String(v) }); })); }))
        ])]));
      }
      main.appendChild(head(L('funnel')));
      main.appendChild(el('div', { class: 'grid g4' }, [
        fn(L('fn_res_wl'), resToWl, resOk.length), fn(L('fn_biz_pilot'), pilotYes.length, D.Businesses.length),
        fn(L('fn_pilot_com'), pilotCom, pilotYes.length), fn(L('fn_call'), callOk, D.Commitments.length)
      ]));

      var pts = S.timeline.map(function (d) { return { d: d.d, v: d.residents + d.businesses }; });
      var last14 = {}, today = Date.now();
      for (var i = 13; i >= 0; i--) last14[AdamStats.qatarDay(new Date(today - i * 864e5).toISOString())] = 0;
      S.timeline.forEach(function (d) { if (last14[d.d] !== undefined) last14[d.d] = d.residents + d.businesses + d.waitlist; });
      var daily = {}, keys = Object.keys(last14);
      keys.forEach(function (k, idx) { daily[idx + 1] = last14[k]; });
      main.appendChild(el('div', { class: 'grid g2', style: 'margin-top:14px' }, [
        panel(L('growth'), C.cumulative(pts, { unit: '' })),
        panel(L('daily'), C.columns(daily, 1, 14, keys.map(function (k) { return String(parseInt(k.slice(8), 10)); })), L('daily_sub'))
      ]));
    }

    function bySrc(list) {
      var o = {}; list.forEach(function (r) { var k = r.src || '_none'; o[k] = (o[k] || 0) + 1; }); return o;
    }
    var SRC_NAMES = { whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', x: 'X', snapchat: 'Snapchat',
      tiktok: 'TikTok', telegram: 'Telegram', youtube: 'YouTube', google: 'Google', bing: 'Bing', email: 'Email', share: ['مشاركة من مشارك', 'Shared by a participant'] };
    function srcLabel(k) { if (k === '_none') return L('direct'); var n = SRC_NAMES[k]; return n ? (typeof n === 'string' ? n : n[A.langIndex(lang)]) : k; }

    function vSources(main, D) {
      var srcs = {};
      ['Residents', 'Waitlist', 'Businesses', 'Commitments'].forEach(function (s) { D[s].forEach(function (r) { srcs[r.src || '_none'] = 1; }); });
      var cols = ['src', 'Residents', 'Waitlist', 'Businesses', 'Commitments'];
      var data = Object.keys(srcs).map(function (k) {
        var row = { src: srcLabel(k) };
        ['Residents', 'Waitlist', 'Businesses', 'Commitments'].forEach(function (s) { row[s] = D[s].filter(function (r) { return (r.src || '_none') === k; }).length; });
        return row;
      }).sort(function (a, b) { return (b.Residents + b.Businesses) - (a.Residents + a.Businesses); });
      S_.col.Residents = S_.t_res; S_.col.Waitlist = S_.t_wl; S_.col.Businesses = S_.t_biz; S_.col.Commitments = S_.t_com;
      main.appendChild(head(L('by_src')));
      main.appendChild(el('div', { class: 'table-wrap' }, [el('table', null, [
        el('thead', null, [el('tr', null, cols.map(function (c) { return el('th', { text: colName(c) }); }))]),
        el('tbody', null, data.map(function (r) { return el('tr', null, cols.map(function (c) { return el('td', { text: String(r[c]) }); })); }))
      ])]));
      var all = [].concat(D.Residents, D.Businesses);
      main.appendChild(el('div', { class: 'grid g3', style: 'margin-top:14px' }, [
        panel(L('by_entry'), bars(AdamStats.tally(all, 'entry'), all.length, 'entry')),
        panel(L('by_lang'), bars(AdamStats.tally(all, 'lang'), all.length, 'lang')),
        panel(L('by_dev'), bars(AdamStats.tally(all, 'device'), all.length, 'device'))
      ]));
    }

    function vResidents(main, D, S) {
      var r = S.res, n = r.n;
      var ok = D.Residents.filter(function (x) { return x.r_area !== 'outside' && !x.flag && !AdamStats.isPartial(x); });
      // Cross-tab: share trusting people, by time in Qatar
      var cross = {}, base = {};
      ok.forEach(function (x) { if (!x.r_status) return; base[x.r_status] = (base[x.r_status] || 0) + 1; if (x.r_trust === 'friends' || x.r_trust === 'groups') cross[x.r_status] = (cross[x.r_status] || 0) + 1; });
      var crossPct = {}; Object.keys(base).forEach(function (k) { crossPct[k] = Math.round(((cross[k] || 0) / base[k]) * 100); });
      main.appendChild(head(L('profile'), 'n = ' + n));
      main.appendChild(el('div', { class: 'grid g3' }, [
        panel(L('area'), bars(r.area, n, 'r_area')), panel(L('status'), bars(r.status, n, 'r_status', { order: 'schema' })), panel(L('age'), bars(r.age, n, 'r_age', { order: 'schema' }))
      ]));
      main.appendChild(head(L('behaviour')));
      main.appendChild(el('div', { class: 'grid g2' }, [
        panel(L('sources'), bars(r.sources, n, 'r_sources', { highlight: ['friends', 'groups'] })),
        panel(L('trust'), bars(r.trust, n, 'r_trust', { highlight: ['friends', 'groups'] })),
        panel(L('pain'), bars(r.pain, n, 'r_pain')),
        panel(L('recos'), bars(r.recos, n, 'r_recos', { order: 'schema', highlight: ['3_5', '6p'] })),
        panel(L('disappoint'), bars(r.disappoint, n, 'r_disappoint', { order: 'schema', highlight: ['often', 'sometimes'] })),
        panel(L('category'), bars(r.category, n, 'r_category')),
        dropoff(D.Residents, A.FLOWS.resident),
        panel(L('trust_by_status'), C.bars(crossPct, 100, { field: 'r_status', lang: lang, order: 'schema', raw: false, labeler: function (k) { return A.label('r_status', k, lang) + ' (n=' + base[k] + ')'; } }))
      ]));
      main.appendChild(head(L('t_res')));
      main.appendChild(table('residents', ['ts', 'country', 'status', 'r_area', 'r_status', 'r_age', 'r_category', 'r_sources', 'r_trust', 'r_pain', 'r_recos', 'r_disappoint', 'src', 'lang', 'device', 'dur', 'flag'], D.Residents, { status: statusTag }));
    }

    function vBusinesses(main, D, S) {
      var b = S.biz, n = b.n;
      main.appendChild(head(L('t_biz'), 'n = ' + n));
      main.appendChild(el('div', { class: 'grid g3' }, [
        panel(L('btype'), bars(b.type, n, 'b_type')), panel(L('role'), bars(b.role, n, 'b_role')),
        panel(L('branches'), bars(b.branches, n, 'b_branches', { order: 'schema' })), panel(L('bage'), bars(b.age, n, 'b_age', { order: 'schema' })),
        panel(L('channels'), bars(b.channels, n, 'b_channels', { highlight: ['wom'] })), panel(L('wom'), bars(b.wom, n, 'b_wom', { order: 'schema' })),
        panel(L('challenge'), bars(b.challenge, n, 'b_challenge')), panel(L('spend'), bars(b.spend, n, 'b_spend', { order: 'schema' })),
        panel(L('pay'), bars(b.pay, n, 'b_pay')), panel(L('pilot'), bars(b.pilot, n, 'b_pilot', { order: 'schema' })),
        panel(L('priority'), el('div', null, [C.columns(b.priority, 1, 10), el('p', { class: 'sub', style: 'margin-top:8px', text: 'avg ' + (b.priority_avg || '–') })])),
        dropoff(D.Businesses, A.FLOWS.business)
      ]));
      var com = {}; D.Commitments.forEach(function (x) { if (x.survey_id) com[x.survey_id] = x; });
      var list = D.Businesses.map(function (x) { return Object.assign({}, x, { c_business: com[x.id] ? com[x.id].c_business : '', committed: com[x.id] ? 'yes' : '' }); });
      main.appendChild(head(L('t_biz')));
      main.appendChild(table('businesses', ['ts', 'country', 'status', 'c_business', 'committed', 'b_type', 'b_role', 'b_branches', 'b_age', 'b_channels', 'b_wom', 'b_challenge', 'b_spend', 'b_priority', 'b_pay', 'b_pilot', 'src', 'lang', 'flag'], list, { committed: yesTag, status: statusTag }));
    }

    function vWaitlist(main, D) {
      main.appendChild(head(L('t_wl')));
      main.appendChild(table('waitlist', ['ts', 'country', 'w_name', 'w_email', 'w_whatsapp', 'w_type', 'w_area', 'src', 'lang', 'entry', 'flag'], D.Waitlist));
    }

    function vCommitments(main, D) {
      main.appendChild(head(L('t_com')));
      main.appendChild(table('commitments', ['ts', 'country', 'c_business', 'b_type', 'c_name', 'c_title', 'c_email', 'c_phone', 'c_cr', 'c_area', 'email_sent', 'id', 'src', 'flag'], D.Commitments,
        { c_agree_name: yesTag, c_call: yesTag }));
    }

    function filters(main) {
      var srcs = {};
      ['Residents', 'Waitlist', 'Businesses', 'Commitments'].forEach(function (s) { (rows[s] || []).forEach(function (r) { srcs[r.src || '_none'] = 1; }); });
      function sel(id, label, val, options, onc) {
        return el('label', { for: id, class: 'sub', style: 'display:flex;gap:6px;align-items:center' }, [label,
          el('select', { id: id, onchange: function (e) { onc(e.target.value); render(); } }, options.map(function (o) { return el('option', { value: o[0], selected: o[0] === val, text: o[1] }); }))]);
      }
      main.appendChild(el('div', { class: 'toolbar' }, [
        sel('f-country', L('f_country'), F.country, [['', L('all_countries')]].concat(A.COUNTRY_CODES.map(function (cc) { return [cc, A.label('country', cc, lang)]; })), function (v) { F.country = v; }),
        sel('f-range', L('f_range'), F.range, [['all', L('all')], ['d7', L('d7')], ['d30', L('d30')]], function (v) { F.range = v; }),
        sel('f-src', L('f_src'), F.src, [['', L('any')]].concat(Object.keys(srcs).map(function (k) { return [k, srcLabel(k)]; })), function (v) { F.src = v; }),
        sel('f-lang', L('f_lang'), F.lang, [['', L('any')], ['ar', 'AR'], ['en', 'EN']], function (v) { F.lang = v; }),
        sel('f-dev', L('f_dev'), F.dev, [['', L('any')], ['mobile', A.label('device', 'mobile', lang)], ['desktop', A.label('device', 'desktop', lang)]], function (v) { F.dev = v; })
      ]));
    }

    function render() {
      A.setCountry(F.country || null);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      root.innerHTML = '';
      if (rows && demo) root.appendChild(el('div', { class: 'demo-banner', text: L('demo') }));
      root.appendChild(el('div', { class: 'serration', 'aria-hidden': 'true' }));
      root.appendChild(el('div', { class: 'topbar' }, [
        el('span', { class: 'brand', text: (A.cfg().PROJECT_NAME || '') + ' · ' + L('title') }),
        el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' }, [
          rows ? el('button', { class: 'ghost', type: 'button', text: L('refresh'), onclick: load }) : null,
          rows ? el('button', { class: 'ghost', type: 'button', text: L('logout'), onclick: function () { rows = null; key = ''; try { sessionStorage.removeItem('adam_admin_key'); } catch (e) {} render(); } }) : null,
          el('button', { class: 'ghost', type: 'button', text: L('lang_switch'), onclick: function () { lang = lang === 'ar' ? 'en' : 'ar'; render(); } })
        ])
      ]));
      var main = el('main', { class: 'dash' });
      root.appendChild(main);
      if (!rows) { vLogin(main); return; }

      main.appendChild(el('header', { class: 'hero', style: 'padding-bottom:8px' }, [
        el('h1', { text: L('title') }), el('p', { text: L('sub') }), el('div', { class: 'live', text: L('loaded', { t: fmt(loadedAt) }) })
      ]));
      filters(main);
      var tabs = [['over', 't_over'], ['res', 't_res'], ['biz', 't_biz'], ['wl', 't_wl'], ['com', 't_com'], ['src', 't_src']];
      main.appendChild(el('div', { class: 'tabs', role: 'tablist' }, tabs.map(function (t) {
        return el('button', { type: 'button', role: 'tab', 'aria-selected': tab === t[0] ? 'true' : 'false', text: L(t[1]), onclick: function () { tab = t[0]; q = ''; render(); } });
      })));
      var D = filteredAll(), S = AdamStats.compute(D);
      var body = el('div', { role: 'tabpanel', style: 'margin-top:18px' });
      main.appendChild(body);
      ({ over: vOverview, res: vResidents, biz: vBusinesses, wl: vWaitlist, com: vCommitments, src: vSources })[tab](body, D, S);
    }

    render();
    if (key || A.isDemo()) load();
    setInterval(function () { if (rows) load(); }, 5 * 60 * 1000);
  }

  window.AdamAdmin = { mount: mount };
})();
