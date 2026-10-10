/*
 * Shared between the web pages and the Google Apps Script backend.
 * - COLUMNS: the sheet columns for each kind of submission.
 * - compute(): turns raw rows into aggregate numbers. The public results page
 *   only ever receives this output, which holds counts and percentages and no
 *   personal details.
 * Keep this file free of browser-only and Apps-Script-only APIs.
 */
var AdamStats = (function () {
  var META = ['id', 'ts', 'country', 'lang', 'src', 'med', 'camp', 'ref', 'entry', 'device', 'dur', 'flag'];

  var COLUMNS = {
    Residents: META.concat(['status', 'last_q', 'step', 'r_area', 'r_status', 'r_age', 'r_category', 'r_sources', 'r_trust', 'r_pain', 'r_recos', 'r_disappoint',
      'r_satisfaction', 'r_interest', 'r_features', 'r_free', 'r_pay']),
    Waitlist: META.concat(['survey_id', 'w_type', 'w_name', 'w_email', 'w_whatsapp', 'w_area', 'dup']),
    Businesses: META.concat(['status', 'last_q', 'step', 'b_type', 'b_role', 'b_branches', 'b_age', 'b_channels', 'b_wom', 'b_challenge', 'b_spend', 'b_priority', 'b_pay', 'b_pilot',
      'b_update', 'b_wrong_info', 'b_inquiries', 'b_inq_time', 'b_tools', 'b_tools_sat', 'b_goals', 'b_success']),
    Commitments: META.concat(['survey_id', 'b_type', 'c_name', 'c_title', 'c_business', 'c_cr', 'c_area', 'c_email', 'c_phone',
      'c_agree_terms', 'c_agree_name', 'c_call', 'c_signature', 'terms_version', 'email_sent', 'dup'])
  };

  // Kind name used by the pages -> sheet name
  var SHEET_OF = { resident: 'Residents', waitlist: 'Waitlist', business: 'Businesses', commitment: 'Commitments' };

  function split(v) {
    if (v === null || v === undefined || v === '') return [];
    return String(v).split('|').filter(function (x) { return x; });
  }

  function tally(rows, key, multi) {
    var out = {};
    rows.forEach(function (r) {
      var vals = multi ? split(r[key]) : [r[key]];
      vals.forEach(function (v) {
        if (v === '' || v === null || v === undefined) return;
        v = String(v);
        out[v] = (out[v] || 0) + 1;
      });
    });
    return out;
  }

  function qatarDay(ts) {
    var t = new Date(ts).getTime();
    if (isNaN(t)) return '';
    return new Date(t + 3 * 3600 * 1000).toISOString().slice(0, 10); // Qatar is UTC+3 all year
  }

  // Rows that count: finished, and not flagged as suspect
  function isPartial(r) { return r.status === 'partial'; }
  function clean(rows) {
    return (rows || []).filter(function (r) { return !r.flag && !isPartial(r); });
  }

  function uniqueBy(rows, key) {
    var seen = {};
    return rows.filter(function (r) {
      var k = String(r[key] || '').trim().toLowerCase();
      if (!k) return true;
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }

  function share(rows, test) {
    var k = 0;
    rows.forEach(function (r) { if (test(r)) k++; });
    return [k, rows.length];
  }

  function hasAny(r, key, codes) {
    var vals = split(r[key]);
    for (var i = 0; i < codes.length; i++) if (vals.indexOf(codes[i]) >= 0) return true;
    return false;
  }

  function answered(rows, key) { return rows.filter(function (r) { return r[key] !== '' && r[key] !== null && r[key] !== undefined; }); }

  function countryOf(r) { return r.country || 'qa'; } // rows saved before countries were added are Qatar

  // opts.country: only that country's rows; leave it out for all countries together
  function compute(all, opts) {
    all = all || {};
    var c = opts && opts.country;
    if (c) {
      var only = {};
      Object.keys(all).forEach(function (k) { only[k] = (all[k] || []).filter(function (r) { return countryOf(r) === c; }); });
      all = only;
    }
    var resAll = clean(all.Residents);
    var res = resAll.filter(function (r) { return r.r_area && r.r_area !== 'outside'; });
    // Waitlist = residents who want to use the app at launch (business owners are counted in the pilot instead)
    var wl = uniqueBy(clean(all.Waitlist).filter(function (r) { return r.w_type !== 'business'; }), 'w_email');
    var biz = clean(all.Businesses);
    var com = uniqueBy(clean(all.Commitments).map(function (r) {
      // one sign-up per email, or per mobile number when no email was given
      return Object.assign({}, r, { _contact: r.c_email || String(r.c_phone || '').replace(/\D/g, '') });
    }), '_contact');

    // Daily timeline (Qatar time)
    var days = {};
    function bump(rows, k) {
      rows.forEach(function (r) {
        var d = qatarDay(r.ts);
        if (!d) return;
        if (!days[d]) days[d] = { d: d, residents: 0, waitlist: 0, businesses: 0, commitments: 0 };
        days[d][k]++;
      });
    }
    bump(res, 'residents'); bump(wl, 'waitlist'); bump(biz, 'businesses'); bump(com, 'commitments');
    var timeline = Object.keys(days).sort().map(function (d) { return days[d]; });

    var priority = {};
    var psum = 0, pn = 0;
    biz.forEach(function (r) {
      var p = parseInt(r.b_priority, 10);
      if (p >= 1 && p <= 10) { priority[p] = (priority[p] || 0) + 1; psum += p; pn++; }
    });

    var tsAll = [].concat(res, wl, biz, com).map(function (r) { return new Date(r.ts).getTime(); }).filter(function (t) { return !isNaN(t); });

    return {
      country: c || 'all',
      updated: new Date().toISOString(),
      first: tsAll.length ? new Date(Math.min.apply(null, tsAll)).toISOString() : null,
      last: tsAll.length ? new Date(Math.max.apply(null, tsAll)).toISOString() : null,
      counts: {
        residents: res.length,
        waitlist: wl.length,
        businesses: biz.length,
        commitments: com.length,
        screened_out: resAll.length - res.length,
        partial_residents: (all.Residents || []).filter(isPartial).length,
        partial_businesses: (all.Businesses || []).filter(isPartial).length
      },
      timeline: timeline,
      res: {
        n: res.length,
        area: tally(res, 'r_area'),
        status: tally(res, 'r_status'),
        age: tally(res, 'r_age'),
        category: tally(res, 'r_category', true),
        sources: tally(res, 'r_sources', true),
        trust: tally(res, 'r_trust'),
        pain: tally(res, 'r_pain', true),
        recos: tally(res, 'r_recos'),
        disappoint: tally(res, 'r_disappoint'),
        satisfaction: tally(res, 'r_satisfaction'),
        interest: tally(res, 'r_interest'),
        features: tally(res, 'r_features', true),
        free: tally(res, 'r_free'),
        pay: tally(res, 'r_pay')
      },
      biz: {
        n: biz.length,
        type: tally(biz, 'b_type'),
        role: tally(biz, 'b_role'),
        branches: tally(biz, 'b_branches'),
        age: tally(biz, 'b_age'),
        channels: tally(biz, 'b_channels', true),
        wom: tally(biz, 'b_wom'),
        challenge: tally(biz, 'b_challenge'),
        spend: tally(biz, 'b_spend'),
        priority: priority,
        priority_avg: pn ? Math.round((psum / pn) * 10) / 10 : null,
        pay: tally(biz, 'b_pay'),
        pilot: tally(biz, 'b_pilot'),
        update: tally(biz, 'b_update'),
        wrong_info: tally(biz, 'b_wrong_info'),
        inquiries: tally(biz, 'b_inquiries', true),
        inq_time: tally(biz, 'b_inq_time'),
        tools: tally(biz, 'b_tools'),
        tools_sat: tally(biz, 'b_tools_sat'),
        goals: tally(biz, 'b_goals', true),
        success: tally(biz, 'b_success', true)
      },
      com: { n: com.length, type: tally(com, 'b_type') },
      findings: {
        reco3: share(res, function (r) { return r.r_recos === '3_5' || r.r_recos === '6p'; }),
        people_used: share(res, function (r) { return hasAny(r, 'r_sources', ['friends', 'groups']); }),
        people_trust: share(res, function (r) { return r.r_trust === 'friends' || r.r_trust === 'groups'; }),
        disappoint: share(res, function (r) { return r.r_disappoint === 'often' || r.r_disappoint === 'sometimes'; }),
        info_pain: share(res, function (r) { return hasAny(r, 'r_pain', ['outdated', 'reviews', 'scattered']); }),
        biz_priority7: share(biz.filter(function (r) { return r.b_priority; }), function (r) { return parseInt(r.b_priority, 10) >= 7; }),
        biz_wom40: share(biz, function (r) { return r.b_wom === '40_60' || r.b_wom === '60p'; }),
        biz_pilot: share(biz, function (r) { return r.b_pilot === 'yes' || r.b_pilot === 'maybe'; }),
        biz_pays: share(biz, function (r) { return r.b_pay === 'monthly' || r.b_pay === 'commission'; }),
        biz_pays_depends: share(biz, function (r) { return r.b_pay === 'depends'; }),
        res_unsat: share(answered(res, 'r_satisfaction'), function (r) { return r.r_satisfaction === 'unsat' || r.r_satisfaction === 'very_unsat'; }),
        res_interest: share(answered(res, 'r_interest'), function (r) { return r.r_interest === 'very' || r.r_interest === 'somewhat'; }),
        res_free: share(answered(res, 'r_free'), function (r) { return r.r_free === 'definitely' || r.r_free === 'likely'; }),
        res_pay: share(answered(res, 'r_pay'), function (r) { return r.r_pay === 'yes' || r.r_pay === 'maybe'; }),
        biz_wrong_info: share(answered(biz, 'b_wrong_info'), function (r) { return r.b_wrong_info === 'often' || r.b_wrong_info === 'sometimes'; }),
        biz_inq_1h: share(answered(biz, 'b_inq_time'), function (r) { return r.b_inq_time === '1_3' || r.b_inq_time === '3p'; }),
        biz_no_tools: share(answered(biz, 'b_tools'), function (r) { return r.b_tools !== 'advanced'; })
      }
    };
  }

  return { COLUMNS: COLUMNS, SHEET_OF: SHEET_OF, compute: compute, countryOf: countryOf, isPartial: isPartial, split: split, tally: tally, qatarDay: qatarDay };
})();
