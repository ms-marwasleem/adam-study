/* Participant flow: entry choice -> resident survey -> waitlist, or business survey -> pilot confirmation. */
(function () {
  'use strict';
  var A = window.Adam, el = A.el;

  function mount(root, opts) {
    opts = opts || {};
    var P = A.params();
    // The country is the first question of each survey. A link with ?c= answers it in advance.
    var fixedCountry = A.validCountry(opts.country || P.c);
    var country = fixedCountry || '';
    A.setCountry(country);
    var coarse = false;
    try { coarse = matchMedia('(pointer: coarse)').matches; } catch (e) {}
    var S = {
      lang: P.lang === 'en' ? 'en' : 'ar',
      view: 'start', kind: null, i: 0, answers: {}, started: Date.now(),
      entry: ['resident', 'business', 'waitlist'].indexOf(P.p) >= 0 ? P.p : 'start',
      meta: {
        src: A.detectSource(P).src, med: (P.utm_medium || A.detectSource(P).how || '').slice(0, 60),
        camp: (P.utm_campaign || '').slice(0, 60), ref: (P.ref || '').slice(0, 60),
        device: (coarse || window.innerWidth < 760) ? 'mobile' : 'desktop'
      },
      ids: {}, pending: null, error: false, wlType: 'resident'
    };

    if (S.entry === 'resident' || S.entry === 'business') begin(S.entry, true);
    else if (S.entry === 'waitlist') S.view = 'waitlist';

    function L(k, v) { return A.t(k, S.lang, v); }
    // Phone placeholder shows the chosen country's dialing code ("+" when the country is not known or is "other")
    function dial(c) { var ci = A.countryInfo(c || country); return (ci && ci.dial) || '+'; }
    function setDir() {
      document.documentElement.lang = S.lang;
      document.documentElement.dir = S.lang === 'en' ? 'ltr' : 'rtl';
    }

    function begin(kind, silent) {
      S.kind = kind; S.i = 0; S.answers = {}; S.started = Date.now(); S.view = 'q'; S.rid = A.uid(); S.queue = null;
      if (fixedCountry) { S.answers.country = fixedCountry; S.i = 1; } // country already known from the link
      if (!silent) render();
    }

    function go(view) { S.view = view; S.error = false; render(); }

    function payload(extra) {
      return Object.assign({ id: A.uid(), country: country, lang: S.lang, entry: S.entry, dur: Math.round((Date.now() - S.started) / 1000) }, S.meta, extra || {});
    }

    function send(kind, data, onOk) {
      S.pending = { kind: kind, data: data, onOk: onOk };
      S.error = false; S.sending = true; render();
      (S.queue || Promise.resolve()).then(function () { return A.submit(kind, data); }).then(function () {
        S.sending = false; S.pending = null; onOk(data);
      }).catch(function () {
        S.sending = false; S.error = true; render();
      });
    }

    function withAnswers(data) {
      A.FLOWS[S.kind].forEach(function (f) {
        var v = S.answers[f];
        data[f] = Array.isArray(v) ? v.join('|') : (v === undefined ? '' : String(v));
      });
      return data;
    }

    // Saves the answers given so far, so nothing is lost if the person closes the page.
    // Saves run one after another; a failed one is skipped quietly.
    function savePartial(field) {
      var data = withAnswers(payload({ id: S.rid, status: 'partial', last_q: field, step: String(S.i + 1) }));
      var kind = S.kind;
      S.queue = (S.queue || Promise.resolve()).then(function () { return A.submit(kind, data).catch(function () {}); });
    }

    function finishSurvey() {
      var kind = S.kind, field = A.FLOWS[kind][S.i];
      var data = withAnswers(payload({ id: S.rid, status: 'complete', last_q: field, step: String(S.i + 1) }));
      send(kind, data, function (d) {
        S.ids[kind] = d.id;
        if (kind === 'resident') go(d.r_area === 'outside' ? 'out' : 'r_done');
        else go(d.b_pilot === 'no' ? 'b_no' : 'commit');
      });
    }

    // ---------- Rendering ----------
    function render() {
      A.setCountry(S.view === 'start' ? '' : country);
      setDir();
      document.title = L('brand_generic');
      root.innerHTML = '';
      if (A.isDemo()) root.appendChild(el('div', { class: 'demo-banner', text: L('demo_banner') }));
      root.appendChild(el('div', { class: 'serration', 'aria-hidden': 'true' }));
      root.appendChild(el('div', { class: 'topbar' }, [
        el('span', { class: 'brand', text: L('brand_generic') }),
        el('button', { class: 'ghost', type: 'button', onclick: function () { S.lang = S.lang === 'en' ? 'ar' : 'en'; render(); }, text: L('lang_switch') })
      ]));
      var wrap = el('main', { class: 'flow' });
      var card = el('section', { class: 'card fade-in' });
      wrap.appendChild(card);
      root.appendChild(wrap);

      if (S.sending) { card.appendChild(el('p', { class: 'lead', text: L('sending') })); return; }
      if (S.error) {
        card.appendChild(el('div', { class: 'error-box', role: 'alert', text: L('send_error') }));
        card.appendChild(el('div', { class: 'nav' }, [el('button', { class: 'btn', type: 'button', text: L('retry'), onclick: function () { var p = S.pending; send(p.kind, p.data, p.onOk); } })]));
        return;
      }
      var views = { start: vStart, q: vQuestion, out: vOut, r_done: vResDone, waitlist: vWaitlist, wl_done: vWlDone, b_no: vBizNo, commit: vCommit, c_done: vComDone, end: vEnd };
      (views[S.view] || vStart)(card);
      wrap.appendChild(el('p', { class: 'footer-note', text: L('privacy') }));
      try { root.scrollIntoView({ block: 'start' }); } catch (e) {}
    }

    function vStart(card) {
      card.appendChild(el('h1', { class: 'q-title', style: 'font-size:24px', text: L('start_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('start_lead') }));
      card.appendChild(el('p', { class: 'q-hint', style: 'margin:22px 0 0', text: L('start_q') }));
      card.appendChild(el('div', { class: 'choice' }, [
        el('button', { class: 'opt', type: 'button', onclick: function () { begin('resident'); } }, [
          el('strong', { text: L('start_res') }), el('span', { text: L('start_res_d') }), el('em', { text: L('minutes_res') })]),
        el('button', { class: 'opt', type: 'button', onclick: function () { begin('business'); } }, [
          el('strong', { text: L('start_biz') }), el('span', { text: L('start_biz_d') }), el('em', { text: L('minutes_biz') })])
      ]));
    }

    function vQuestion(card) {
      var flow = A.FLOWS[S.kind], field = flow[S.i], def = A.Q[field], li = A.langIndex(S.lang);
      var n = flow.length, skip = fixedCountry ? 1 : 0;
      var head = el('div', { class: 'step-meta' }, [
        el('span', { text: L('step_of', { i: S.i + 1 - skip, n: n - skip }) }),
        el('button', { class: 'link-btn', type: 'button', text: L('back'), onclick: function () {
          if (S.i > (fixedCountry ? 1 : 0)) { S.i--; render(); } else { S.entry = 'start'; go('start'); }
        } })
      ]);
      card.appendChild(head);
      card.appendChild(el('div', { class: 'progress', 'aria-hidden': 'true' }, [el('i', { style: 'width:' + Math.round(((S.i - skip) / (n - skip)) * 100) + '%' })]));
      card.appendChild(el('h2', { class: 'q-title', id: 'q-' + field, text: (S.kind === 'business' && def.qBiz ? def.qBiz : def.q)[li] }));
      if (def.hint) card.appendChild(el('p', { class: 'q-hint', text: def.hint[li] }));

      function advance() {
        if (field === 'r_area' && S.answers.r_area === 'outside') { finishSurvey(); return; }
        if (S.i < n - 1) { savePartial(field); S.i++; render(); } else finishSurvey();
      }

      if (def.type === 'single') {
        var box = el('div', { class: 'opts', role: 'group', 'aria-labelledby': 'q-' + field });
        def.opts.forEach(function (o) {
          box.appendChild(el('button', {
            class: 'opt', type: 'button', 'aria-pressed': S.answers[field] === o[0] ? 'true' : 'false',
            onclick: function (e) {
              S.answers[field] = o[0];
              if (field === 'country') country = o[0]; // later questions use this country's wording
              e.currentTarget.setAttribute('aria-pressed', 'true');
              setTimeout(advance, 160);
            }
          }, [el('span', { class: 'tick' }), el('span', { text: o[1 + li] })]));
        });
        card.appendChild(box);
      } else if (def.type === 'multi') {
        var sel = (S.answers[field] = S.answers[field] || []);
        var box2 = el('div', { class: 'opts', role: 'group', 'aria-labelledby': 'q-' + field });
        var next = el('button', { class: 'btn', type: 'button', text: L('next'), disabled: !sel.length, onclick: advance });
        function paint() {
          Array.prototype.forEach.call(box2.children, function (b) {
            var code = b.getAttribute('data-code');
            var on = sel.indexOf(code) >= 0;
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.disabled = !on && sel.length >= def.max;
          });
          next.disabled = !sel.length;
        }
        def.opts.forEach(function (o) {
          box2.appendChild(el('button', {
            class: 'opt multi', type: 'button', 'data-code': o[0],
            onclick: function () {
              var k = sel.indexOf(o[0]);
              if (k >= 0) sel.splice(k, 1);
              else {
                if (def.exclusive && o[0] === def.exclusive) sel.length = 0;
                else if (def.exclusive) { var x = sel.indexOf(def.exclusive); if (x >= 0) sel.splice(x, 1); }
                if (sel.length < def.max) sel.push(o[0]);
              }
              paint();
            }
          }, [el('span', { class: 'tick' }), el('span', { text: o[1 + li] })]));
        });
        card.appendChild(box2);
        card.appendChild(el('div', { class: 'nav' }, [el('span'), next]));
        paint();
      } else if (def.type === 'scale') {
        var sc = el('div', { class: 'scale', role: 'group', 'aria-labelledby': 'q-' + field });
        for (var v = def.min; v <= def.max; v++) (function (v) {
          sc.appendChild(el('button', {
            class: 'opt', type: 'button', 'aria-pressed': String(S.answers[field]) === String(v) ? 'true' : 'false', text: String(v),
            onclick: function (e) { S.answers[field] = String(v); e.currentTarget.setAttribute('aria-pressed', 'true'); setTimeout(advance, 160); }
          }));
        })(v);
        card.appendChild(sc);
        card.appendChild(el('div', { class: 'scale-ends' }, [el('span', { text: '1 · ' + def.ends[0][li] }), el('span', { text: '10 · ' + def.ends[1][li] })]));
      }
    }

    function doneMark() { return el('div', { class: 'done-mark', 'aria-hidden': 'true' }); }

    function field(id, labelText, type, attrs) {
      var input = el('input', Object.assign({ id: id, name: id, type: type || 'text' }, attrs || {}));
      var err = el('div', { class: 'err', id: id + '-err', hidden: true });
      input.setAttribute('aria-describedby', id + '-err');
      input.addEventListener('input', function () { err.hidden = true; input.removeAttribute('aria-invalid'); });
      return { node: el('div', { class: 'field' }, [el('label', { for: id, text: labelText }), input, err]), input: input, err: err };
    }
    function showErr(f, msg) { f.err.textContent = msg; f.err.hidden = !msg; if (msg) f.input.setAttribute('aria-invalid', 'true'); else f.input.removeAttribute('aria-invalid'); }
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
    function honeypot() {
      return el('div', { style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;opacity:0', 'aria-hidden': 'true' },
        [el('label', { for: 'website', text: 'Website' }), el('input', { id: 'website', name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off' })]);
    }

    function waitlistForm(card, opts) {
      var form = el('form', { class: 'fields', novalidate: true });
      var fName = field('w_name', L('f_first'), 'text', { autocomplete: 'given-name', maxlength: '60' });
      var fEmail = field('w_email', L('f_email'), 'email', { autocomplete: 'email', maxlength: '120', inputmode: 'email' });
      var fWa = field('w_whatsapp', L('f_whatsapp'), 'tel', { autocomplete: 'tel', maxlength: '30', placeholder: dial(), dir: 'ltr' });
      var typeSel = null;
      if (opts.askType) {
        typeSel = el('select', { id: 'w_type', name: 'w_type', onchange: function (e) { S.wlType = e.target.value; } },
          A.EXTRA.w_type.opts.map(function (o) { return el('option', { value: o[0], selected: S.wlType === o[0], text: o[1 + A.langIndex(S.lang)] }); }));
        form.appendChild(el('div', { class: 'field' }, [el('label', { for: 'w_type', text: L('f_iam') }), typeSel]));
      }
      var countrySel = null;
      if (!country) { // standalone waitlist link: ask the country here
        countrySel = el('select', { id: 'w_country', name: 'w_country', onchange: function (e) { fWa.input.placeholder = dial(e.target.value); } }, A.Q.country.opts.map(function (o) { return el('option', { value: o[0], text: o[1 + A.langIndex(S.lang)] }); }));
        form.appendChild(el('div', { class: 'field' }, [el('label', { for: 'w_country', text: A.question('country', S.lang) }), countrySel]));
        fWa.input.placeholder = dial(countrySel.value);
      }
      form.appendChild(fName.node); form.appendChild(fEmail.node); form.appendChild(fWa.node); form.appendChild(honeypot());
      form.appendChild(el('button', { class: 'btn block', type: 'submit', text: L('wl_submit') }));
      if (opts.skip) form.appendChild(el('button', { class: 'link-btn', type: 'button', text: L('wl_skip'), onclick: function () { go('end'); } }));
      form.appendChild(el('p', { class: 'note', text: L('wl_note') }));
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = fName.input.value.trim(), email = fEmail.input.value.trim();
        showErr(fName, name ? '' : L('req'));
        showErr(fEmail, !email ? L('req') : (validEmail(email) ? '' : L('bad_email')));
        if (!name || !validEmail(email)) return;
        var type = typeSel ? typeSel.value : 'resident';
        if (countrySel) country = countrySel.value;
        send('waitlist', payload({
          survey_id: S.ids.resident || '', w_type: type, w_name: name, w_email: email,
          w_whatsapp: fWa.input.value.trim(), w_area: S.answers.r_area || '', hp: form.querySelector('#website').value
        }), function () { S.wlType = type; go('wl_done'); });
      });
      card.appendChild(form);
    }

    function vOut(card) {
      card.appendChild(doneMark());
      card.appendChild(el('h2', { class: 'q-title', text: L('out_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('out_body') }));
    }

    function vResDone(card) {
      card.appendChild(doneMark());
      card.appendChild(el('h2', { class: 'q-title', text: L('r_done_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('r_done_body') }));
      waitlistForm(card, { skip: true });
    }

    function vWaitlist(card) {
      card.appendChild(el('h1', { class: 'q-title', style: 'font-size:24px', text: L('wl_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('wl_body') }));
      card.appendChild(el('p', { class: 'q-hint', style: 'margin:16px 0 0', text: L('wl_points_lead') }));
      card.appendChild(el('ul', { class: 'bullets' }, A.T.wl_points[A.langIndex(S.lang)].map(function (s) { return el('li', { text: s }); })));
      waitlistForm(card, { askType: true });
    }

    function shareBox() {
      var link = location.origin + location.pathname + '?c=' + country + '&src=share';
      var input = el('input', { id: 'share-link', type: 'text', readonly: true, value: link, 'aria-label': L('copy_link') });
      var btn = el('button', { class: 'btn', type: 'button', text: L('copy_link'), onclick: function () {
        function ok() { btn.textContent = L('copied'); }
        try { navigator.clipboard.writeText(link).then(ok, function () { input.select(); }); } catch (e) { input.select(); }
      } });
      return el('div', { class: 'share' }, [input, btn]);
    }

    function vWlDone(card) {
      card.appendChild(doneMark());
      card.appendChild(el('h2', { class: 'q-title', text: L('wl_done_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('wl_done_body') }));
      card.appendChild(shareBox());
      if (S.wlType === 'business' && !S.ids.business) {
        card.appendChild(el('div', { class: 'nav' }, [el('button', { class: 'btn block', type: 'button', text: L('start_biz') + ' · ' + L('minutes_biz'), onclick: function () { begin('business'); } })]));
      }
    }

    function vEnd(card) {
      card.appendChild(doneMark());
      card.appendChild(el('h2', { class: 'q-title', text: L('end_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('end_body') }));
      card.appendChild(shareBox());
    }

    function vBizNo(card) {
      card.appendChild(doneMark());
      card.appendChild(el('h2', { class: 'q-title', text: L('b_no_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('b_no_body') }));
    }

    function vCommit(card) {
      var li = A.langIndex(S.lang);
      card.appendChild(el('h2', { class: 'q-title', text: L('c_title') }));
      var form = el('form', { class: 'fields', novalidate: true });
      var f = {
        name: field('c_name', L('c_name'), 'text', { autocomplete: 'name', maxlength: '80' }),
        title: field('c_title', L('c_role'), 'text', { autocomplete: 'organization-title', maxlength: '60' }),
        business: field('c_business', L('c_business'), 'text', { autocomplete: 'organization', maxlength: '100' }),
        cr: field('c_cr', L('c_cr'), 'text', { maxlength: '30', dir: 'ltr', inputmode: 'numeric' }),
        email: field('c_email', L('c_email'), 'email', { autocomplete: 'email', maxlength: '120', inputmode: 'email' }),
        phone: field('c_phone', L('c_phone'), 'tel', { autocomplete: 'tel', maxlength: '30', placeholder: dial(), dir: 'ltr' })
      };
      var area = el('select', { id: 'c_area', name: 'c_area' }, A.Q.r_area.opts.filter(function (o) { return o[0] !== 'outside'; })
        .map(function (o) { return el('option', { value: o[0], text: o[1 + li] }); }));
      [f.name, f.title, f.business, f.cr].forEach(function (x) { form.appendChild(x.node); });
      form.appendChild(el('div', { class: 'field' }, [el('label', { for: 'c_area', text: L('c_area') }), area]));
      form.appendChild(f.email.node); form.appendChild(f.phone.node);

      form.appendChild(honeypot());
      form.appendChild(el('button', { class: 'btn block', type: 'submit', text: L('c_submit') }));

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        ['name', 'title', 'business'].forEach(function (k) {
          var v = f[k].input.value.trim(); showErr(f[k], v ? '' : L('req')); if (!v) ok = false;
        });
        var em = f.email.input.value.trim();
        showErr(f.email, !em ? L('req') : (validEmail(em) ? '' : L('bad_email'))); if (!validEmail(em)) ok = false;
        if (!ok) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
        send('commitment', payload({
          survey_id: S.ids.business || '', b_type: S.answers.b_type || '',
          c_name: f.name.input.value.trim(), c_title: f.title.input.value.trim(), c_business: f.business.input.value.trim(),
          c_cr: f.cr.input.value.trim(), c_area: area.value, c_email: em, c_phone: f.phone.input.value.trim(),
          hp: form.querySelector('#website').value
        }), function (d) { S.ids.commitment = d.id; go('c_done'); });
      });
      card.appendChild(form);
    }

    function vComDone(card) {
      card.appendChild(doneMark());
      card.appendChild(el('h2', { class: 'q-title', text: L('c_done_title') }));
      card.appendChild(el('p', { class: 'lead', text: L('c_done_body') }));
    }

    render();
    return { render: render };
  }

  window.AdamFlow = { mount: mount };
})();
