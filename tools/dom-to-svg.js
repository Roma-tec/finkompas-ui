// Превращает отрисованную страницу в векторный SVG с редактируемым текстом.
// Выполняется внутри браузера: window.__toSVG(ширина, высота).
window.__toSVG = function (W, H) {
  var out = [];
  var FONT = "Inter, 'Segoe UI', sans-serif";
  function e(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function n(v) { return Math.round(v * 100) / 100; }
  function vis(c) { return c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c); }
  function sy(r) { return r.top + scrollY; }
  function rect(r, fill, stroke, sw, rad, op) {
    out.push('<rect x="' + n(r.left + scrollX) + '" y="' + n(sy(r)) + '" width="' + n(r.width) + '" height="' + n(r.height) + '"' + (rad ? ' rx="' + n(rad) + '"' : '') + ' fill="' + (fill || 'none') + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + sw + '"' : '') + (op < 1 ? ' opacity="' + op + '"' : '') + '/>');
  }
  function text(str, x, y, cs, op, anchor) {
    if (!str.trim() || !vis(cs.color)) return;
    out.push('<text x="' + n(x) + '" y="' + n(y) + '" font-family="' + FONT.replace(/"/g, '') + '" font-size="' + parseFloat(cs.fontSize) + '" font-weight="' + cs.fontWeight + '" fill="' + cs.color + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + (op < 1 ? ' opacity="' + op + '"' : '') + ' style="font-feature-settings:\'tnum\'">' + e(str) + '</text>');
  }
  function textNode(node, cs, op) {
    var s = node.nodeValue, r = document.createRange(), line = '', top = null, left = 0, h = 0;
    function flush() { if (line.trim()) text(line.replace(/\s+$/, ''), left + scrollX, top + scrollY + h * 0.8, cs, op); line = ''; }
    for (var i = 0; i < s.length; i++) {
      r.setStart(node, i); r.setEnd(node, i + 1);
      var q = r.getClientRects(); if (!q.length) continue;
      var b = q[q.length - 1];
      if (top === null || Math.abs(b.top - top) > 2) { flush(); top = b.top; h = b.height; left = b.left; }
      if (!line) left = b.left;
      line += s[i];
    }
    flush();
  }
  function svgEl(el, cs, op) {
    var r = el.getBoundingClientRect(), c = el.cloneNode(true);
    c.querySelectorAll('title').forEach(function (t) { t.remove(); });
    var src = [el].concat([].slice.call(el.querySelectorAll('*'))), cl = [c].concat([].slice.call(c.querySelectorAll('*')));
    var j = 0;
    src.forEach(function (o) {
      if (o.tagName.toLowerCase() === 'title') return;
      var d = cl[j++], st = getComputedStyle(o);
      ['fill', 'stroke'].forEach(function (p) { var v = st[p]; d.setAttribute(p, v === 'none' ? 'none' : v); });
      if (st.strokeWidth) d.setAttribute('stroke-width', st.strokeWidth.replace('px', ''));
      if (st.strokeLinecap !== 'butt') d.setAttribute('stroke-linecap', st.strokeLinecap);
      if (st.strokeLinejoin !== 'miter') d.setAttribute('stroke-linejoin', st.strokeLinejoin);
      if (o.tagName.toLowerCase() === 'text') { d.setAttribute('font-family', FONT.replace(/"/g, '')); d.setAttribute('font-size', parseFloat(st.fontSize)); d.setAttribute('font-weight', st.fontWeight); d.setAttribute('stroke', 'none'); }
      d.removeAttribute('class'); d.removeAttribute('style'); d.removeAttribute('data-cat'); d.removeAttribute('role'); d.removeAttribute('aria-label'); d.removeAttribute('aria-hidden');
    });
    c.setAttribute('x', n(r.left + scrollX)); c.setAttribute('y', n(sy(r))); c.setAttribute('width', n(r.width)); c.setAttribute('height', n(r.height));
    if (op < 1) c.setAttribute('opacity', op);
    out.push(new XMLSerializer().serializeToString(c).replace(/ xmlns="[^"]*"/g, ''));
  }
  function control(el, cs, op) {
    var r = el.getBoundingClientRect(), t = (el.type || '').toLowerCase(), tag = el.tagName;
    if (tag === 'INPUT' && t === 'checkbox' && el.parentElement.classList.contains('switch')) {
      rect(r, vis(cs.backgroundColor) ? cs.backgroundColor : '#888', null, 0, 12, op);
      out.push('<circle cx="' + n(r.left + (el.checked ? 32 : 12)) + '" cy="' + n(sy(r) + 12) + '" r="10" fill="#fff"/>'); return;
    }
    var acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), bd = getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim();
    if (t === 'checkbox') {
      rect(r, el.checked ? acc : 'none', el.checked ? null : bd, 1.5, 4, op);
      if (el.checked) out.push('<path d="M' + n(r.left + 4) + ' ' + n(sy(r) + 9) + 'l3.5 3.5l6.5 -7" fill="none" stroke="#fff" stroke-width="2"/>'); return;
    }
    if (t === 'radio') {
      out.push('<circle cx="' + n(r.left + r.width / 2) + '" cy="' + n(sy(r) + r.height / 2) + '" r="' + n(r.width / 2 - 1) + '" fill="none" stroke="' + (el.checked ? acc : bd) + '" stroke-width="1.5"/>');
      if (el.checked) out.push('<circle cx="' + n(r.left + r.width / 2) + '" cy="' + n(sy(r) + r.height / 2) + '" r="' + n(r.width / 4) + '" fill="' + acc + '"/>'); return;
    }
    if (t === 'range' || t === 'file') return;
    var val = tag === 'SELECT' ? (el.selectedOptions[0] ? el.selectedOptions[0].textContent : '') : (el.value || el.placeholder || '');
    var c = Object.create(null); c.color = el.value ? cs.color : getComputedStyle(document.documentElement).getPropertyValue('--text-2').trim(); c.fontSize = cs.fontSize; c.fontWeight = cs.fontWeight;
    text(t === 'password' ? val.replace(/./g, '•') : val, r.left + scrollX + parseFloat(cs.paddingLeft), sy(r) + r.height / 2 + parseFloat(cs.fontSize) * 0.35, c, op);
    if (tag === 'SELECT') out.push('<path d="M' + n(r.right - 20) + ' ' + n(sy(r) + r.height / 2 - 2) + 'l4 4l4 -4" fill="none" stroke="' + bd + '" stroke-width="1.5"/>');
  }
  function walk(el, op) {
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    var o = op * parseFloat(cs.opacity), r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0 && cs.display !== 'contents') return;
    if (r.bottom + scrollY < 0 || r.top + scrollY > H || r.right < 0 || r.left > W) { if (cs.position === 'static' && cs.overflow === 'visible') { /* продолжаем для вложенных */ } else return; }
    if (el.tagName.toLowerCase() === 'svg') { svgEl(el, cs, o); return; }
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
    if (el.tagName !== 'BODY' && el.tagName !== 'HTML' && cs.display !== 'contents') {
      var rad = parseFloat(cs.borderTopLeftRadius) || 0; if (cs.borderTopLeftRadius.indexOf('%') > 0) rad = r.width / 2;
      var fill = vis(cs.backgroundColor) ? cs.backgroundColor : null, bw = ['Top', 'Right', 'Bottom', 'Left'].map(function (s) { return parseFloat(cs['border' + s + 'Width']); }), same = bw[0] === bw[1] && bw[1] === bw[2] && bw[2] === bw[3];
      var isCheck = el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio');
      if (!isCheck) {
        if (cs.backgroundImage.indexOf('gradient') >= 0) fill = getComputedStyle(document.documentElement).getPropertyValue('--bg-muted').trim();
        if (fill || (same && bw[0] > 0 && vis(cs.borderTopColor))) rect(r, fill, same && bw[0] > 0 && vis(cs.borderTopColor) ? cs.borderTopColor : null, bw[0], rad, o);
        if (!same) {
          var L = r.left + scrollX, R = r.right + scrollX, T = sy(r), B = T + r.height;
          [[bw[0], cs.borderTopColor, L, T, R, T], [bw[1], cs.borderRightColor, R, T, R, B], [bw[2], cs.borderBottomColor, L, B, R, B], [bw[3], cs.borderLeftColor, L, T, L, B]].forEach(function (b) {
            if (b[0] > 0 && vis(b[1])) out.push('<line x1="' + n(b[2]) + '" y1="' + n(b[3]) + '" x2="' + n(b[4]) + '" y2="' + n(b[5]) + '" stroke="' + b[1] + '" stroke-width="' + b[0] + '"/>');
          });
        }
      }
    }
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') { control(el, cs, o); return; }
    el.childNodes.forEach(function (c) {
      if (c.nodeType === 3) textNode(c, cs, o); else if (c.nodeType === 1) walk(c, o);
    });
  }
  var bg = getComputedStyle(document.body).backgroundColor;
  document.getAnimations().forEach(function (a) { try { a.finish(); } catch (x) { /* бесконечные анимации */ } });
  walk(document.body, 1);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + bg + '"/>' + out.join('') + '</svg>';
};
