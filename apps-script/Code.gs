/**
 * Adam validation backend (Google Apps Script, bound to a Google Sheet).
 *
 * Setup (once):
 *   1. Extensions > Apps Script in your Google Sheet, paste this whole file into Code.gs, save.
 *   2. Run the function `setup` once and approve the permissions. Copy the ADMIN KEY from the log.
 *   3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Copy the /exec URL.
 *
 * Endpoints:
 *   GET  ?action=stats&country=qa            -> aggregate numbers only (public results page)
 *   POST {action:'submit', kind, data}       -> saves one response
 *   POST {action:'admin', key}               -> all rows (internal dashboard, needs the admin key)
 */

var SENDER_NAME = 'Qatar Local Services Study';
var MIN_SECONDS = { resident: 15, business: 20 }; // faster than this gets flagged, not deleted

// The spreadsheet that holds the responses. Works whether this script was opened from
// inside a Sheet (Extensions > Apps Script) or created on its own at script.google.com:
// in the second case setup() creates a new Sheet in your Drive and remembers it.
function ss_() {
  var active = null;
  try { active = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (active) return active;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var created = SpreadsheetApp.create('Adam Validation Data');
  props.setProperty('SPREADSHEET_ID', created.getId());
  return created;
}

function setup() {
  var ss = ss_();
  Object.keys(AdamStats.COLUMNS).forEach(function (name) { sheet_(name); });
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ADMIN_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    props.setProperty('ADMIN_KEY', key);
  }
  var first = ss.getSheetByName('Sheet1') || ss.getSheetByName('ورقة1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  Logger.log('ADMIN KEY (keep it private): ' + key);
  Logger.log('Responses sheet: ' + ss.getUrl());
  return key;
}

/** Optional: run to get an email copy of every new pilot commitment. */
function setNotifyEmail() {
  PropertiesService.getScriptProperties().setProperty('NOTIFY_EMAIL', Session.getActiveUser().getEmail());
  Logger.log('Notifications will go to ' + Session.getActiveUser().getEmail());
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'stats') {
    // 'c' is a reserved parameter name in Apps Script web apps, so the country comes as 'country'
    var c = String(e.parameter.country || 'qa').toLowerCase();
    if (COUNTRIES.indexOf(c) < 0) return json_({ ok: false, error: 'bad_country' });
    return json_({ ok: true, stats: cachedStats_(c) });
  }
  return json_({ ok: true, service: 'adam-validation' });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  try {
    if (body.action === 'submit') return json_(submit_(body.kind, body.data || {}));
    if (body.action === 'admin') return json_(admin_(body.key));
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

function submit_(kind, data) {
  var name = AdamStats.SHEET_OF[kind];
  if (!name) return { ok: false, error: 'bad_kind' };
  // Bots fill the hidden "website" field. Pretend success and keep nothing.
  if (data.hp) return { ok: true, id: String(data.id || '') };

  var cols = AdamStats.COLUMNS[name];
  var row = {};
  cols.forEach(function (c) { row[c] = clean_(data[c]); });
  row.ts = new Date().toISOString();
  if (!row.id) row.id = Utilities.getUuid().slice(0, 10).toUpperCase();
  if (COUNTRIES.indexOf(row.country) < 0) row.country = 'qa';

  var flags = [];
  var min = MIN_SECONDS[kind];
  var surveyKind = kind === 'resident' || kind === 'business';
  if (surveyKind && row.status !== 'partial') row.status = 'complete';
  if (min && row.status === 'complete' && Number(row.dur) > 0 && Number(row.dur) < min) flags.push('fast');
  if (kind === 'waitlist' || kind === 'commitment') {
    var emailCol = kind === 'waitlist' ? 'w_email' : 'c_email';
    var email = String(row[emailCol] || '').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: 'bad_email' };
    row[emailCol] = email;
    if (emailExists_(name, emailCol, email)) row.dup = 'yes';
  }
  row.flag = flags.join(' ');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_(name);
    var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var at = surveyKind ? findRow_(sh, head, row.id) : 0;
    if (at) {
      // Same survey saved again (answers added as the person goes): update that row.
      var cur = sh.getRange(at, 1, 1, head.length).getValues()[0];
      var curStatus = cur[head.indexOf('status')];
      if (curStatus === 'complete' && row.status === 'partial') return { ok: true, id: row.id }; // never undo a finished survey
      var merged = head.map(function (h, i) {
        if (h === 'ts') return cur[i]; // keep the time they started
        var v = row[h];
        return (v === undefined || v === '') ? cur[i] : v;
      });
      sh.getRange(at, 1, 1, head.length).setValues([merged]);
    } else {
      sh.appendRow(head.map(function (h) { return row[h] === undefined ? '' : row[h]; }));
    }
  } finally {
    lock.releaseLock();
  }

  if (kind === 'commitment') {
    var sent = sendConfirmation_(row);
    setCell_(name, row.id, 'email_sent', sent ? 'yes' : 'failed');
    notifyTeam_(row);
  }
  return { ok: true, id: row.id };
}

function admin_(key) {
  var real = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!real || key !== real) { Utilities.sleep(800); return { ok: false, error: 'unauthorized' }; }
  return { ok: true, rows: allRows_() };
}

var COUNTRIES = ['qa', 'ae', 'sa', 'eg', 'other'];

// The public results page shows a daily snapshot per country: it is taken the first time
// the page is opened each day (Qatar time) and kept in a hidden "_Snapshot" sheet
// (one row per country: country, day, numbers) until the next day.
function cachedStats_(country) {
  var today = AdamStats.qatarDay(new Date().toISOString());
  var key = 'stats_' + country + '_' + today;
  var cache = CacheService.getScriptCache();
  var hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var sh = snapshotSheet_();
  var row = snapshotRow_(sh, country);
  var saved = sh.getRange(row, 1, 1, 3).getValues()[0];
  var stats;
  if (saved[0] === country && saved[1] === today && saved[2]) {
    stats = JSON.parse(saved[2]);
  } else {
    stats = AdamStats.compute(allRows_(), { country: country });
    sh.getRange(row, 1, 1, 3).setValues([[country, today, JSON.stringify(stats)]]);
  }
  cache.put(key, JSON.stringify(stats), 21600);
  return stats;
}

/** Run by hand from the Apps Script editor to update every country's public page right now. */
function refreshPublicStats() {
  var today = AdamStats.qatarDay(new Date().toISOString());
  var rows = allRows_(), sh = snapshotSheet_(), cache = CacheService.getScriptCache();
  COUNTRIES.forEach(function (c) {
    var stats = AdamStats.compute(rows, { country: c });
    sh.getRange(snapshotRow_(sh, c), 1, 1, 3).setValues([[c, today, JSON.stringify(stats)]]);
    cache.put('stats_' + c + '_' + today, JSON.stringify(stats), 21600);
  });
  Logger.log('Public results updated for all countries');
}

function snapshotSheet_() {
  var ss = ss_();
  var sh = ss.getSheetByName('_Snapshot');
  if (!sh) { sh = ss.insertSheet('_Snapshot'); sh.getRange('A1:C10').setNumberFormat('@'); sh.hideSheet(); }
  return sh;
}

function snapshotRow_(sh, country) {
  return COUNTRIES.indexOf(country) + 1; // fixed row per country
}

// ---------- Sheet helpers ----------
function sheet_(name) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  var cols = AdamStats.COLUMNS[name];
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@'); // keep everything as plain text
  } else {
    // Add any column a newer version of the site needs, at the end
    var head = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
    var missing = cols.filter(function (c) { return head.indexOf(c) < 0; });
    if (missing.length) {
      var start = head.join('') === '' ? 1 : head.length + 1;
      if (sh.getMaxColumns() < start + missing.length - 1) sh.insertColumnsAfter(sh.getMaxColumns(), start + missing.length - 1 - sh.getMaxColumns());
      sh.getRange(1, start, 1, missing.length).setValues([missing]).setFontWeight('bold');
      sh.getRange(1, start, sh.getMaxRows(), missing.length).setNumberFormat('@');
    }
  }
  return sh;
}

function allRows_() {
  var out = {};
  Object.keys(AdamStats.COLUMNS).forEach(function (name) {
    var sh = sheet_(name);
    var values = sh.getDataRange().getValues();
    var head = values.shift() || [];
    out[name] = values.filter(function (r) { return r.join('') !== ''; }).map(function (r) {
      var o = {};
      head.forEach(function (h, i) { o[h] = r[i] instanceof Date ? r[i].toISOString() : String(r[i]); });
      return o;
    });
  });
  return out;
}

function findRow_(sh, head, id) {
  var idx = head.indexOf('id');
  if (idx < 0 || !id || sh.getLastRow() < 2) return 0;
  var vals = sh.getRange(2, idx + 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = vals.length - 1; i >= 0; i--) if (String(vals[i][0]) === String(id)) return i + 2;
  return 0;
}

function emailExists_(name, col, email) {
  var sh = sheet_(name);
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var idx = head.indexOf(col);
  if (idx < 0 || sh.getLastRow() < 2) return false;
  var vals = sh.getRange(2, idx + 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (String(vals[i][0]).toLowerCase() === email) return true;
  return false;
}

function setCell_(name, id, col, value) {
  var sh = sheet_(name);
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var idCol = head.indexOf('id'), c = head.indexOf(col);
  if (idCol < 0 || c < 0) return;
  var ids = sh.getRange(2, idCol + 1, Math.max(1, sh.getLastRow() - 1), 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) { sh.getRange(i + 2, c + 1).setValue(value); return; }
}

// Plain text, short, and never starting with a formula character
function clean_(v) {
  if (v === null || v === undefined) return '';
  var s = String(v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 300);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Emails ----------
function esc_(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// Short thank-you to the business owner after they sign up for the pilot
function sendConfirmation_(r) {
  try {
    var ar = r.lang !== 'en';
    var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;max-width:560px">' +
      (ar
        ? '<p dir="rtl" style="text-align:right">مرحباً ' + esc_(r.c_name) + '،<br><br>شكراً لتسجيل ' + esc_(r.c_business) + ' في التجربة المجانية. سنتواصل معك قبل بدء التجربة.</p>'
        : '<p>Hello ' + esc_(r.c_name) + ',<br><br>Thank you for signing ' + esc_(r.c_business) + ' up for the free pilot. We\u2019ll be in touch before it starts.</p>') +
      '</div>';
    MailApp.sendEmail({
      to: r.c_email,
      subject: ar ? 'شكراً لتسجيلك في التجربة المجانية' : 'Thanks for signing up for the free pilot',
      htmlBody: html,
      name: SENDER_NAME
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function notifyTeam_(r) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  try {
    MailApp.sendEmail(to, 'New pilot sign-up: ' + r.c_business, r.c_name + ' (' + r.c_title + ')\n' + r.c_email + ' · ' + r.c_phone + '\nType: ' + r.b_type + '\nRef: ' + r.id);
  } catch (err) { console.error(err); }
}

// ---------- Shared aggregation code (copied from assets/stats.js by build.sh) ----------
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
    Residents: META.concat(['status', 'last_q', 'step', 'r_area', 'r_status', 'r_age', 'r_category', 'r_sources', 'r_trust', 'r_pain', 'r_recos', 'r_disappoint']),
    Waitlist: META.concat(['survey_id', 'w_type', 'w_name', 'w_email', 'w_whatsapp', 'w_area', 'dup']),
    Businesses: META.concat(['status', 'last_q', 'step', 'b_type', 'b_role', 'b_branches', 'b_age', 'b_channels', 'b_wom', 'b_challenge', 'b_spend', 'b_priority', 'b_pay', 'b_pilot']),
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
    var com = uniqueBy(clean(all.Commitments), 'c_email');

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
        disappoint: tally(res, 'r_disappoint')
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
        pilot: tally(biz, 'b_pilot')
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
        biz_pays_depends: share(biz, function (r) { return r.b_pay === 'depends'; })
      }
    };
  }

  return { COLUMNS: COLUMNS, SHEET_OF: SHEET_OF, compute: compute, countryOf: countryOf, isPartial: isPartial, split: split, tally: tally, qatarDay: qatarDay };
})();
