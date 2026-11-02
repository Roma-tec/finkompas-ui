// Экспорт: 32+ векторных макета (SVG), PNG-превью и два PDF. Запуск: node tools/export.mjs
import fs from 'fs'; import path from 'path';
import { serve, browser } from './lib.mjs';

const PORT = 8125, B = `http://localhost:${PORT}/`, SVG = 'design/export/svg', PNG = 'design/export/screens';
const srv = await serve('site', PORT), br = await browser(), page = await br.newPage();
const inject = fs.readFileSync('tools/dom-to-svg.js', 'utf8');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const D = [1440, 1024], M = [390, 844], L = [844, 390];
const screens = [
  ['S1_Auth', 'login', D, 'none'], ['S2_Overview', 'dashboard', D], ['S3_Settings', 'settings', D], ['S4_Transactions', 'transactions', D],
  ['S5_Budgets', 'budgets', D], ['S6_Reports', 'reports', D], ['S7_History', 'history', D], ['S8_Accounts', 'accounts', D], ['S9_Goals', 'goals', D],
  ['S10_Mobile_Portrait', 'dashboard', M], ['S10_Mobile_Landscape', 'transactions', L], ['S11_Templates', 'templates', D], ['S12_Admin', 'admin', D, 'admin']
];

async function setState(theme, role) {
  await page.goto(B + 'login.html');
  await page.evaluate((t, r) => {
    localStorage.clear();
    const s = FK.S; s.theme = t;
    s.user = r === 'none' ? null : r === 'admin' ? { name: 'Администратор', email: 'admin@example.com', mode: 'extended', role: 'admin', twofa: true } : { name: 'Анна Смирнова', email: 'anna.demo@example.com', mode: 'extended', role: 'user', twofa: false };
    FK.save();
  }, theme, role);
}
async function shot(name, url, [w, h], full = true, css = '') {
  await page.setViewport({ width: w, height: h });
  await page.goto(B + url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (css) await page.addStyleTag({ content: css });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}.side{height:auto!important;min-height:100%}' });
  await wait(120);
  await page.screenshot({ path: `${PNG}/${name}.png`, fullPage: full });
  const H = full ? await page.evaluate(() => document.documentElement.scrollHeight) : h;
  await page.evaluate(inject);
  const svg = await page.evaluate((W, H2) => window.__toSVG(W, H2), w, H);
  fs.writeFileSync(`${SVG}/${name}.svg`, svg);
  console.log(name, w + 'x' + H, Math.round(svg.length / 1024) + ' KB');
}

for (const [theme, T] of [['light', 'Light'], ['dark', 'Dark']]) {
  for (const [n, url, size, role] of screens) {
    await setState(theme, role || 'user');
    await shot(`${n}_${T}`, `${url}.html`, size, size === D);
  }
  await setState(theme, 'user');
  await shot(`UI_Kit_${T}`, 'ui-kit.html', D);
}
await setState('light', 'user');
await shot('Moodboard', 'moodboard.html', D);
await shot('00_Cover', 'cover.html', [1440, 1024], false);

// Черновые прототипы: те же зоны без цвета и текста
const WF = `html,body{background:#fff!important}*{color:transparent!important;box-shadow:none!important;border-color:#9AA5B1!important}
.card,.side,.top,.btn,input,select,.seg,.badge,.ic,.bar,.ava,.auth .hero,.nav.on{background:#EDF1F2!important}svg{visibility:hidden}`;
for (const [n, u] of [['S1_Auth', 'login'], ['S2_Overview', 'dashboard'], ['S4_Transactions', 'transactions'], ['S5_Budgets', 'budgets']]) {
  await setState('light', n === 'S1_Auth' ? 'none' : 'user');
  await shot(`Wireframe_${n}`, `${u}.html`, D, true, WF);
}

// Диаграммы: PNG из SVG
for (const [f, w, h] of [['UML_UseCase', 1240, 800], ['A4_User_Flow_Map', 1123, 794]]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.setContent(`<style>${fontFace()}body{margin:0}</style>` + fs.readFileSync(`${SVG}/${f}.svg`, 'utf8'));
  await wait(200);
  await page.screenshot({ path: `${PNG}/${f}.png` });
}
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

function fontFace() {
  return [400, 500, 600, 700].flatMap((w) => ['latin', 'cyrillic'].map((s) => {
    const b = fs.readFileSync(`site/assets/fonts/inter-${s}-${w}-normal.woff2`).toString('base64');
    return `@font-face{font-family:Inter;font-weight:${w};src:url(data:font/woff2;base64,${b}) format('woff2');${s === 'cyrillic' ? 'unicode-range:U+0400-04FF,U+20BD;' : 'unicode-range:U+0000-00FF,U+2000-206F,U+2190-21FF;'}}`;
  })).join('');
}
async function pdf(out, files, landscape = true) {
  const pages = files.map(([f, cap]) => {
    const s = fs.readFileSync(`${SVG}/${f}.svg`, 'utf8').replace(/<svg ([^>]*?)width="[\d.]+" height="[\d.]+"/, '<svg $1');
    return `<section><div class="cap">${cap || ''}</div><div class="fit">${s}</div></section>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>${fontFace()}@page{size:A4 landscape;margin:0}body{margin:0;font:12px Inter}section{width:297mm;height:210mm;page-break-after:always;display:flex;flex-direction:column;padding:6mm;box-sizing:border-box}.cap{height:6mm;color:#52606D}.fit{flex:1;min-height:0;display:flex;justify-content:center}.fit svg{height:100%;width:100%}</style>${pages}`;
  const p = await br.newPage();
  await p.setContent(html, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await wait(300);
  await p.pdf({ path: out, printBackground: true, preferCSSPageSize: true, timeout: 180000 });
  await p.close();
  console.log(out, Math.round(fs.statSync(out).size / 1024) + ' KB');
}
const names = { S1_Auth: 'S1 Регистрация и авторизация', S2_Overview: 'S2 Главный экран', S3_Settings: 'S3 Настройки профиля', S4_Transactions: 'S4 Операции', S5_Budgets: 'S5 Бюджеты', S6_Reports: 'S6 Отчёты и экспорт', S7_History: 'S7 История действий', S8_Accounts: 'S8 Счета и категории', S9_Goals: 'S9 Финансовые цели', S10_Mobile_Portrait: 'S10 Смартфон, портрет', S10_Mobile_Landscape: 'S10 Смартфон, альбомная ориентация', S11_Templates: 'S11 Шаблоны бюджетов', S12_Admin: 'S12 Администрирование' };
const mk = [['00_Cover', ''], ['Moodboard', 'Moodboard'], ['Wireframe_S1_Auth', 'Черновой прототип: S1'], ['Wireframe_S2_Overview', 'Черновой прототип: S2'], ['Wireframe_S4_Transactions', 'Черновой прототип: S4'], ['Wireframe_S5_Budgets', 'Черновой прототип: S5'], ['UI_Kit_Light', 'UI-кит, светлая тема'], ['UI_Kit_Dark', 'UI-кит, тёмная тема']];
for (const [n] of screens) for (const [T, t] of [['Light', 'светлая тема'], ['Dark', 'тёмная тема']]) mk.push([`${n}_${T}`, `${names[n]}, ${t}`]);
await pdf('design/export/FinKompas_Makety.pdf', mk);
await pdf('design/export/FinKompas_Diagrammy.pdf', [['UML_UseCase', 'UML Use-Case диаграмма'], ['A4_User_Flow_Map', '']]);

// Копии для витрины сайта
for (const [a, b] of [[SVG, 'site/assets/svg'], [PNG, 'site/assets/screens']]) { fs.rmSync(b, { recursive: true, force: true }); fs.cpSync(a, b, { recursive: true }); }
fs.mkdirSync('site/pdf', { recursive: true });
for (const f of ['FinKompas_Makety.pdf', 'FinKompas_Diagrammy.pdf']) fs.copyFileSync(`design/export/${f}`, `site/pdf/${f}`);
await br.close(); srv.close();
console.log('svg:', fs.readdirSync(SVG).length, 'png:', fs.readdirSync(PNG).length);
