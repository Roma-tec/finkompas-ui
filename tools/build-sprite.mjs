// Собирает SVG-спрайт из assets/icons и копирует шрифт со значками Lucide (ISC).
// Запуск: node tools/build-sprite.mjs <путь к lucide-static/font версии с папкой font>
import fs from 'fs'; import path from 'path';

const dir = 'assets/icons', out = [], icons = fs.readdirSync(dir).filter((f) => f.endsWith('.svg'));
for (const f of icons) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const body = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace('</svg>', '').replace(/\s*\n\s*/g, '');
  out.push(`<symbol id="${f.replace('icon_', '').replace('_24.svg', '')}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`);
}
fs.mkdirSync('assets/sprite', { recursive: true });
fs.writeFileSync('assets/sprite/sprite.svg', `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${out.join('')}</svg>\n`);

const font = process.argv[2];
if (font) {
  fs.mkdirSync('assets/iconfont', { recursive: true });
  for (const f of ['lucide.woff2', 'lucide.css']) fs.copyFileSync(path.join(font, f), `assets/iconfont/${f}`);
}
console.log(icons.length, 'symbols');
