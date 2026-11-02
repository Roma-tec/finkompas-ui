// Собирает набор иконок: копирует SVG в assets/icons и формирует site/assets/js/icons.js.
// Источник — пакет lucide-static (лицензия ISC). Запуск: node tools/build-icons.mjs <путь к lucide-static/icons>
import fs from 'fs'; import path from 'path';
const src = process.argv[2];
const names = {home:'layout-dashboard',list:'list',wallet:'wallet',target:'target',chart:'bar-chart-3',template:'layout-template',history:'history',settings:'settings',shield:'shield',plus:'plus',search:'search',eye:'eye',eyeoff:'eye-off',bell:'bell',sun:'sun',moon:'moon',logout:'log-out',more:'ellipsis',menu:'menu',close:'x',check:'check',alert:'triangle-alert',info:'info',lock:'lock',upload:'upload',download:'download',edit:'pencil',trash:'trash-2',copy:'copy',undo:'undo-2',repeat:'repeat',card:'credit-card',cash:'banknote',piggy:'piggy-bank',bank:'landmark',left:'chevron-left',right:'chevron-right',up:'arrow-up-right',down:'arrow-down-left',swap:'arrow-left-right',food:'shopping-cart',house:'house',cafe:'coffee',bus:'bus',film:'film',salary:'briefcase',gift:'gift',health:'heart-pulse',book:'book-open',plane:'plane',box:'package',phone:'smartphone',user:'user',users:'users',file:'file-text',sheet:'file-spreadsheet',grid:'layout-grid'};
const out = {};
for (const [k, n] of Object.entries(names)) {
  const s = fs.readFileSync(path.join(src, n + '.svg'), 'utf8');
  fs.writeFileSync(`assets/icons/icon_${k}_24.svg`, s);
  out[k] = s.replace(/<!--[\s\S]*?-->/g, '').replace(/^[\s\S]*?<svg[^>]*>/, '').replace('</svg>', '').replace(/\s*\n\s*/g, '');
}
fs.writeFileSync('site/assets/js/icons.js', '/* Иконки Lucide (ISC). Файл создан tools/build-icons.mjs */\nwindow.FK_ICONS=' + JSON.stringify(out) + ';\n');
console.log(Object.keys(out).length, 'icons');
