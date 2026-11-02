// Заменяет конструкции SVG, которые Figma импортирует неверно: штриховые дуги и маркеры стрелок.
const num = (s, k) => +(s.match(new RegExp(`\\s${k}="([-\\d.]+)"`)) || [])[1];

function arc(tag) {
  const cx = num(tag, 'cx'), cy = num(tag, 'cy'), r = num(tag, 'r');
  const [len] = tag.match(/stroke-dasharray="([\d.]+)/).slice(1).map(Number);
  const off = -num(tag, 'stroke-dashoffset') || 0;
  const a = off / r - Math.PI / 2, b = a + len / r, big = len / r > Math.PI ? 1 : 0;
  const p = (t) => `${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`;
  const stroke = tag.match(/stroke="([^"]+)"/)[1], w = num(tag, 'stroke-width');
  return `<path d="M${p(a)}A${r} ${r} 0 ${big} 1 ${p(b)}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`;
}

// Абсолютные команды M, L, H, V: возвращает две последние точки линии
function ends(d) {
  const pts = []; let x = 0, y = 0;
  for (const [, c, v] of d.matchAll(/([MLHV])\s*([^MLHV]*)/g)) {
    const n = v.trim().split(/[\s,]+/).map(Number);
    if (c === 'H') x = n[0]; else if (c === 'V') y = n[0]; else [x, y] = n;
    pts.push([x, y]);
  }
  return pts.slice(-2);
}

function arrow(tag) {
  const [[x0, y0], [x1, y1]] = ends(tag.match(/\sd="([^"]+)"/)[1]);
  const id = tag.match(/url\(#(\w+)\)/)[1], stroke = tag.match(/stroke="([^"]+)"/)[1];
  const len = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / len, uy = (y1 - y0) / len, hollow = id === 'tri';
  const L = hollow ? 12 : 8, W = hollow ? 6 : 4, bx = x1 - ux * L, by = y1 - uy * L;
  const pts = [[x1, y1], [bx - uy * W, by + ux * W], [bx + uy * W, by - ux * W]].map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`);
  return tag.replace(/\s*marker-end="[^"]*"/, '') + `<path d="M${pts[0]}L${pts[1]}L${pts[2]}Z" fill="${hollow ? '#FFFFFF' : stroke}" stroke="${stroke}"/>`;
}

export const safe = (s) => s
  .replace(/<circle [^>]*stroke-dasharray[^>]*\/>/g, arc)
  .replace(/<path [^>]*marker-end[^>]*\/>/g, arrow)
  .replace(/<defs>.*?<\/defs>/g, (m) => (m.includes('<marker') ? '' : m));
