/* Small hand-rolled charts shared by the public results page and the internal dashboard. */
(function () {
  'use strict';
  var A = window.Adam, el = A.el;
  var tipEl = null;

  function tip(target, text) {
    function show(e) {
      if (!tipEl) { tipEl = el('div', { class: 'tip', role: 'tooltip' }); document.body.appendChild(tipEl); }
      tipEl.textContent = typeof text === 'function' ? text(e) : text;
      tipEl.hidden = false; move(e);
    }
    function move(e) {
      if (!tipEl) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX), y = (e.touches ? e.touches[0].clientY : e.clientY);
      var w = tipEl.offsetWidth;
      tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
      tipEl.style.top = (y - 40) + 'px';
      if (typeof text === 'function') tipEl.textContent = text(e);
    }
    function hide() { if (tipEl) tipEl.hidden = true; }
    target.addEventListener('mouseenter', show);
    target.addEventListener('mousemove', move);
    target.addEventListener('mouseleave', hide);
    target.addEventListener('touchstart', show, { passive: true });
    target.addEventListener('touchend', hide);
  }

  /* Horizontal bars. counts: {code: n}; n: base for percentages.
     opts: field (for labels), lang, order ('desc' | 'schema'), highlight: [codes], minN, hideMsg */
  function bars(counts, n, opts) {
    opts = opts || {};
    var lang = opts.lang || 'en';
    var wrap = el('div', { class: 'bars' });
    if (opts.minN && n < opts.minN) {
      wrap.appendChild(el('p', { class: 'hidden-note', text: opts.hideMsg || '' }));
      return wrap;
    }
    var keys = opts.keys ? opts.keys.filter(function (k) { return counts[k]; }) : opts.order === 'schema' ? A.codes(opts.field).filter(function (k) { return counts[k] !== undefined || opts.showZero; })
      : Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    if (opts.order === 'schema' && !keys.length) keys = Object.keys(counts);
    var max = 0;
    keys.forEach(function (k) { max = Math.max(max, counts[k] || 0); });
    if (!keys.length) { wrap.appendChild(el('p', { class: 'hidden-note', text: opts.emptyMsg || '–' })); return wrap; }
    keys.forEach(function (k) {
      var v = counts[k] || 0;
      var pct = n ? Math.round((v / n) * 100) : 0;
      var lbl = opts.labeler ? opts.labeler(k) : A.label(opts.field, k, lang);
      var hl = !opts.highlight || opts.highlight.indexOf(k) >= 0;
      var row = el('div', { class: 'bar-row' + (hl ? ' hl' : '') }, [
        el('span', { class: 'bl', text: lbl }),
        el('span', { class: 'bv', text: opts.raw ? String(v) : pct + '%' }),
        el('span', { class: 'bt' }, [el('i', { style: 'width:' + (max ? Math.max(1.5, (v / max) * 100) : 0) + '%' })])
      ]);
      tip(row, lbl + ': ' + v + (opts.raw ? '' : ' / ' + n));
      wrap.appendChild(row);
    });
    if (opts.nLabel) wrap.appendChild(el('p', { class: 'n-label', text: opts.nLabel.replace('{n}', n) }));
    return wrap;
  }

  /* Vertical columns for a 1..10 scale */
  function columns(counts, from, to, labels) {
    var max = 0, v;
    for (v = from; v <= to; v++) max = Math.max(max, counts[v] || 0);
    var box = el('div', { class: 'cols' }), axis = el('div', { class: 'cols-axis' });
    for (v = from; v <= to; v++) {
      var c = counts[v] || 0;
      var col = el('div', { class: 'c' }, [el('span', { text: c ? String(c) : '' }), el('i', { style: 'height:' + (max ? (c / max) * 82 : 0) + '%' })]);
      tip(col, (labels ? labels[v - from] : v) + ': ' + c);
      box.appendChild(col);
      axis.appendChild(el('span', { text: labels ? labels[v - from] : String(v) }));
    }
    return el('div', null, [box, axis]);
  }

  /* Cumulative line over days. points: [{d:'YYYY-MM-DD', v:number}] (daily values, accumulated here) */
  function cumulative(points, opts) {
    opts = opts || {};
    var NS = 'http://www.w3.org/2000/svg';
    function s(tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }
    var W = 640, H = 220, pl = 34, pr = 14, pt = 14, pb = 26;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'line-chart', role: 'img', 'aria-label': opts.aria || '' });
    if (!points.length) return svg;
    var acc = 0, data = points.map(function (p) { acc += p.v; return { d: p.d, v: acc }; });
    if (data.length === 1) data.unshift({ d: data[0].d, v: 0 });
    var max = Math.max(1, data[data.length - 1].v);
    var step = Math.pow(10, Math.floor(Math.log10(max)));
    var nice = Math.ceil(max / step) * step; if (nice / step > 5) step *= 2; nice = Math.ceil(max / step) * step;
    var rtl = document.documentElement.dir === 'rtl';
    function x(i) { var f = data.length > 1 ? i / (data.length - 1) : 0; if (rtl) f = 1 - f; return pl + f * (W - pl - pr); }
    function y(v) { return pt + (1 - v / nice) * (H - pt - pb); }
    for (var g = 0; g <= nice; g += step) {
      svg.appendChild(s('line', { x1: pl, x2: W - pr, y1: y(g), y2: y(g), stroke: 'var(--grid)', 'stroke-width': 1 }));
      var tl = s('text', { x: rtl ? W - pr + 4 : pl - 6, y: y(g) + 4, 'text-anchor': rtl ? 'start' : 'end' }); tl.textContent = g; svg.appendChild(tl);
    }
    var d = data.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(' ');
    var area = d + ' L' + x(data.length - 1).toFixed(1) + ' ' + y(0) + ' L' + x(0).toFixed(1) + ' ' + y(0) + ' Z';
    svg.appendChild(s('path', { d: area, fill: 'var(--chart)', 'fill-opacity': '0.10', stroke: 'none' }));
    svg.appendChild(s('path', { d: d, fill: 'none', stroke: 'var(--chart)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    var last = data[data.length - 1];
    svg.appendChild(s('circle', { cx: x(data.length - 1), cy: y(last.v), r: 4.5, fill: 'var(--chart)', stroke: 'var(--surface)', 'stroke-width': 2 }));
    [0, data.length - 1].forEach(function (i) {
      var t = s('text', { x: x(i), y: H - 6, 'text-anchor': i === 0 ? (rtl ? 'end' : 'start') : (rtl ? 'start' : 'end') });
      t.textContent = data[i].d.slice(5).replace('-', '/'); svg.appendChild(t);
    });
    var cross = s('line', { y1: pt, y2: H - pb, stroke: 'var(--muted)', 'stroke-width': 1, 'stroke-dasharray': '3 3', visibility: 'hidden' });
    var dot = s('circle', { r: 4, fill: 'var(--chart)', stroke: 'var(--surface)', 'stroke-width': 2, visibility: 'hidden' });
    svg.appendChild(cross); svg.appendChild(dot);
    var hit = s('rect', { x: pl, y: pt, width: W - pl - pr, height: H - pt - pb, fill: 'transparent' });
    svg.appendChild(hit);
    function nearest(e) {
      var r = svg.getBoundingClientRect();
      var cx = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width * W;
      var best = 0, bd = 1e9;
      data.forEach(function (p, i) { var dd = Math.abs(x(i) - cx); if (dd < bd) { bd = dd; best = i; } });
      return best;
    }
    tip(hit, function (e) {
      var i = nearest(e), p = data[i];
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(p.v)); dot.setAttribute('visibility', 'visible');
      return p.d + ' · ' + p.v + (opts.unit ? ' ' + opts.unit : '');
    });
    hit.addEventListener('mouseleave', function () { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); });
    return svg;
  }

  function meter(labelText, value, target, foot) {
    var pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
    return el('div', { class: 'panel meter' }, [
      el('div', { class: 'label', text: labelText }),
      el('div', { class: 'num' }, [String(value), el('small', { text: ' / ' + target })]),
      el('div', { class: 'track', role: 'progressbar', 'aria-valuenow': String(value), 'aria-valuemin': '0', 'aria-valuemax': String(target), 'aria-label': labelText }, [el('i', { style: 'width:' + pct + '%' })]),
      el('div', { class: 'foot', text: foot || (pct + '%') })
    ]);
  }

  /* A plain count card: label, big number, optional note. No targets. */
  function stat(labelText, value, foot) {
    return el('div', { class: 'panel meter' }, [
      el('div', { class: 'label', text: labelText }),
      el('div', { class: 'num', text: String(value) }),
      foot ? el('div', { class: 'foot', text: foot }) : null
    ]);
  }

  window.AdamCharts = { bars: bars, columns: columns, cumulative: cumulative, meter: meter, stat: stat, tip: tip };
})();
