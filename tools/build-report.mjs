// Собирает docs/00-full-report.md и единый векторный отчёт PDF. Запуск после tools/export.mjs.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
import { browser } from './lib.mjs';

const { marked } = createRequire(path.join(process.env.PUPPETEER_DIR, 'x.js'))('marked');
const SVG = 'design/export/svg', OUT = 'design/export/FinKompas_Otchet.pdf';
const files = ['01-tech-spec', '02-research', '03-user-scenarios', '04-ia-userflow', '05-prototyping', '06-style-moodboard', '07-screens', '08-motion', '09-handoff', 'a11y', 'content', 'responsive', '10-report-and-delivery', '11-appendix'];
const pages = JSON.parse(fs.readFileSync('design/export/pages.json', 'utf8'));

const docs = files.map((f) => fs.readFileSync(`docs/${f}.md`, 'utf8').trim());
const head = fs.readFileSync('docs/00-full-report.md', 'utf8').split('\n# 1. ')[0];
fs.writeFileSync('docs/00-full-report.md', head + '\n' + docs.join('\n\n') + '\n');

const vector = (name) => fs.readFileSync(`${SVG}/${name}.svg`, 'utf8').replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1viewBox="0 0 $2 $3"').replace(/viewBox="[^"]*" (viewBox=)/, '$1');
const body = (md) => marked.parse(md)
  .replace(/<p>(<img [^>]*>)<\/p>/g, '$1')
  .replace(/<img src="[^"]*\/([^"/]+)\.png"[^>]*>/g, (m, n) => `<figure>${vector(n)}</figure>`)
  .replace(/<a href="[^"]*\.(md|pdf|svg)">(.*?)<\/a>/g, '$2');
const toc = docs.map((d) => `<li>${d.match(/^# (.*)$/m)[1].replace(/^\d+\.\s*/, '')}</li>`).join('');
const fig = pages.filter(([n]) => n !== '00_Cover').map(([n, c]) => `<section class="land"><div class="cap">${c}</div><div class="fit">${vector(n)}</div></section>`).join('');
const font = [400, 500, 600, 700].flatMap((w) => ['latin', 'cyrillic'].map((s) => `@font-face{font-family:Inter;font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(`site/assets/fonts/inter-${s}-${w}-normal.woff2`).toString('base64')}) format('woff2');${s === 'cyrillic' ? 'unicode-range:U+0400-04FF,U+20BD;' : 'unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF;'}}`)).join('');

const css = `${font}@page{size:A4;margin:18mm 16mm}@page wide{size:A4 landscape;margin:0}
body{margin:0;font:11pt/1.5 Inter,sans-serif;color:#14202B}h1{font-size:20pt;line-height:1.25;page-break-before:always;margin:0 0 12pt}h2{font-size:14pt;margin:16pt 0 6pt}h3{font-size:12pt;margin:12pt 0 4pt}h2,h3{page-break-after:avoid}
table{border-collapse:collapse;width:100%;font-size:9.5pt;margin:8pt 0}th,td{border:1px solid #9AA5B1;padding:4pt 6pt;text-align:left;vertical-align:top}th{background:#EEF0F2}tr{page-break-inside:avoid}
code{font-size:9.5pt}pre{white-space:pre-wrap;font-size:8.5pt;background:#F3F4F6;padding:8pt}figure{margin:8pt 0;page-break-inside:avoid}figure svg{width:100%;height:auto;max-height:230mm}
.title{height:250mm;display:flex;flex-direction:column;justify-content:space-between;text-align:center}.title h2{font-size:22pt;line-height:1.3}.who{text-align:right}
.land{page:wide;page-break-before:always;width:297mm;height:209mm;display:flex;flex-direction:column;padding:6mm;box-sizing:border-box;overflow:hidden}.cap{height:6mm;font-size:10pt;color:#52606D}.fit{flex:1;min-height:0;display:flex;justify-content:center}.fit svg{width:100%;height:100%}`;
const title = `<div class="title"><p>[Наименование вуза]<br>[Кафедра]</p><div><p>Отчёт по лабораторной работе S2G11</p><h2>Проект интерфейса программной системы «ФинКомпас»</h2><p>Вариант: система управления финансами</p></div><div class="who"><p>Выполнил: Кузнецов Е. А., группа [номер группы]<br>Проверил: [ФИО преподавателя]</p></div><p>[Город], 2026</p></div>`;
const html = `<!doctype html><meta charset="utf-8"><title>ФинКомпас: отчёт</title><style>${css}</style>${title}<h1>Содержание</h1><ol>${toc}<li>Приложение: все материалы в векторном виде</li></ol>${docs.map(body).join('')}<h1>Приложение: все материалы в векторном виде</h1>${fig}`;

const br = await browser(), p = await br.newPage();
await p.setContent(html, { waitUntil: 'load', timeout: 180000 });
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true, timeout: 300000 });
await br.close();
fs.copyFileSync(OUT, 'site/pdf/FinKompas_Otchet.pdf');
console.log(OUT, Math.round(fs.statSync(OUT).size / 1024) + ' KB');
