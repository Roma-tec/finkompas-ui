// Экспорт: векторные макеты (SVG), PNG-превью и два PDF. Запуск: node tools/export.mjs
import fs from 'fs'; import os from 'os'; import path from 'path';
import { serve, browser } from './lib.mjs';
import { flows, FLOW_FILES } from './build-flows.mjs';

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
  await page.evaluate(() => localStorage.clear());
  await page.goto(B + 'login.html');
  await page.evaluate((t, r) => {
    const s = FK.S; s.theme = t;
    s.user = r === 'none' ? null : r === 'admin' ? { name: 'Администратор', email: 'admin@example.com', mode: 'extended', role: 'admin', twofa: true } : { name: 'Анна Смирнова', email: 'anna.demo@example.com', mode: 'extended', role: 'user', twofa: false };
    if (r === 'empty') s.txs = [];
    FK.save();
  }, theme, role);
}
async function shot(name, url, [w, h], full = true, css = '', act = null) {
  await page.setViewport({ width: w, height: h });
  await page.goto(B + url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}.side{height:auto!important;min-height:100%}' });
  if (act) await act();
  if (css) await page.addStyleTag({ content: css });
  if (css === WF) await page.evaluate(zones);
  await wait(120);
  await page.screenshot({ path: `${PNG}/${name}.png`, fullPage: full });
  const H = full ? await page.evaluate(() => document.documentElement.scrollHeight) : h;
  await page.evaluate(inject);
  const svg = await page.evaluate((W, H2) => window.__toSVG(W, H2), w, H);
  fs.writeFileSync(`${SVG}/${name}.svg`, svg);
  console.log(name, w + 'x' + H, Math.round(svg.length / 1024) + ' KB');
}

// Черновой прототип: зоны с подписями, без цвета, значков и текста
const WF = `html,body{background:#fff!important}*{color:transparent!important;box-shadow:none!important;border-color:#9AA5B1!important}
.card,.side,.top,.filters,.hero,.form,.mobnav{background:#EDF1F2!important}.btn,input,select,.seg{background:#fff!important}svg{visibility:hidden}
.card,.filters,.hero,.form{position:relative!important}.card>*,.side>*,.top>*,.filters>*,.hero>*,.form>*,.mobnav>*{visibility:hidden}
.zl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:8px;visibility:visible!important;color:#52606D!important;font:500 13px/18px Inter,sans-serif}`;
const zones = () => {
  const name = { side: 'Боковое меню', top: 'Верхняя панель', filters: 'Фильтры', hero: 'Описание продукта', form: 'Форма входа и регистрации', mobnav: 'Нижняя панель' };
  document.querySelectorAll('.side,.top,.filters,.hero,.form,.mobnav,.card').forEach((e) => {
    const k = Object.keys(name).find((c) => e.classList.contains(c)), z = document.createElement('div');
    z.className = 'zl'; z.textContent = k ? name[k] : (e.querySelector('h2') || e.querySelector('.muted') || { textContent: 'Блок данных' }).textContent.trim();
    if (getComputedStyle(e).position === 'static') e.style.position = 'relative';
    e.appendChild(z);
  });
};
// Финальный прототип: все элементы и тексты, но без оформления
const PROTO = `:root{--accent:#6B7280;--accent-hover:#4B5563;--accent-soft:#E5E7EB;--income:#374151;--expense:#374151;--warning:#374151;--info:#374151;--soft-income:#E5E7EB;--soft-expense:#E5E7EB;--soft-warning:#E5E7EB;--bg-page:#FFFFFF}
*{box-shadow:none!important}svg{visibility:hidden}.ic,.ava{background:#D1D5DB!important}`;

const type = async (sel, v) => { await page.type(sel, v); };
const tmp = path.join(os.tmpdir(), 'fk-export.csv');
fs.writeFileSync(tmp, 'Дата;Сумма;Описание\n30.10.2026;-1200;Обед\n29.10.2026;-500,50;Кофейня\n29.10.2026;7000;Подработка\nплохо;x;Ошибка\n');
const openAdd = async () => { await page.click('#add'); await page.waitForSelector('[data-amount]'); };
const states = [
  ['ST_Login_Error', 'login', D, 'none', async () => { await type('#email', 'плохой'); await type('#pass', '123'); await page.click('button[type=submit]'); }],
  ['ST_Empty_Overview', 'dashboard', D, 'empty'],
  ['ST_Add_Operation', 'dashboard', D, 'user', openAdd],
  ['ST_Form_Error', 'dashboard', D, 'user', async () => { await openAdd(); await page.click('[data-ok]'); }],
  ['ST_Undo_Toast', 'dashboard', D, 'user', async () => { await openAdd(); await type('[data-amount]', '1200'); await type('[data-note]', 'Обед'); await page.click('[data-ok]'); await wait(100); }],
  ['ST_Import_Preview', 'transactions', D, 'user', async () => { await page.click('#imp'); await page.waitForSelector('#file'); await (await page.$('#file')).uploadFile(tmp); await page.waitForSelector('#n2'); await page.click('#n2'); await page.waitForSelector('#n3'); await page.click('#n3'); await page.waitForSelector('#go'); }],
  ['ST_Budget_Empty', 'budgets', D, 'user', async () => { await page.click('[data-m="1"]'); await wait(50); }],
  ['ST_Budget_Setup', 'budgets', D, 'user', async () => { await page.click('#cfg'); await wait(100); }],
  ['ST_Export', 'reports', D, 'user', async () => { await page.click('#exp'); await page.waitForSelector('input[type=radio]'); }],
  ['ST_Mobile_Sheet', 'dashboard', M, 'user', async () => { await page.click('.mobnav .fab'); await page.waitForSelector('[data-amount]'); }]
];
const tablets = [['S2_Overview', 'dashboard'], ['S4_Transactions', 'transactions'], ['S5_Budgets', 'budgets'], ['S6_Reports', 'reports']];

for (const f of fs.readdirSync(SVG)) if (/^(Wireframe_|Prototype_|ST_|UF_|Moodboard_)/.test(f)) fs.rmSync(`${SVG}/${f}`);
for (const [theme, T] of [['light', 'Light'], ['dark', 'Dark']]) {
  for (const [n, url, size, role] of screens) {
    await setState(theme, role || 'user');
    await shot(`${n}_${T}`, `${url}.html`, size, size === D);
  }
  for (const [n, url] of tablets) { await setState(theme, 'user'); await shot(`${n}_Tablet_${T}`, `${url}.html`, [834, 1194]); }
  for (const [n, url, size, role, act] of states) { await setState(theme, role); await shot(`${n}_${T}`, `${url}.html`, size, false, '', act); }
  await setState(theme, 'user');
  await shot(`UI_Kit_${T}`, 'ui-kit.html', D);
}
await setState('light', 'user');
await shot('Moodboard', 'moodboard.html', D);
await shot('Moodboard_B', 'moodboard-b.html', D);
await shot('Moodboard_C', 'moodboard-c.html', D);
await shot('00_Cover', 'cover.html', [1440, 1024], false);

for (const [n, url, size, role] of screens) {
  await setState('light', role || 'user');
  await shot(`Wireframe_${n}`, `${url}.html`, size, size === D, WF);
  await setState('light', role || 'user');
  await shot(`Prototype_${n}`, `${url}.html`, size, size === D, PROTO);
}
for (const [n, url, size, role, act] of states) { await setState('light', role); await shot(`Prototype_${n}`, `${url}.html`, size, false, PROTO, act); }
flows(SVG);

// Диаграммы: PNG из SVG
for (const [f, w, h] of [['UML_UseCase', 1240, 800], ['A4_User_Flow_Map', 1123, 794], ...FLOW_FILES.map((x) => [x, 1123, 794])]) {
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
const stNames = { ST_Login_Error: 'ошибка входа', ST_Empty_Overview: 'пустой обзор', ST_Add_Operation: 'форма операции', ST_Form_Error: 'ошибка в форме', ST_Undo_Toast: 'отмена операции', ST_Import_Preview: 'предпросмотр импорта', ST_Budget_Empty: 'нет бюджета', ST_Budget_Setup: 'настройка бюджета', ST_Export: 'экспорт', ST_Mobile_Sheet: 'нижний лист на смартфоне' };
const mk = [['00_Cover', ''], ['Moodboard', 'Moodboard A, выбранный'], ['Moodboard_B', 'Moodboard B, отклонённый'], ['Moodboard_C', 'Moodboard C, отклонённый']];
for (const [n] of screens) mk.push([`Wireframe_${n}`, `Черновой прототип: ${names[n]}`]);
for (const [n] of screens) mk.push([`Prototype_${n}`, `Финальный прототип: ${names[n]}`]);
for (const [n] of states) mk.push([`Prototype_${n}`, `Финальный прототип, состояние: ${stNames[n]}`]);
mk.push(['UI_Kit_Light', 'UI-кит, светлая тема'], ['UI_Kit_Dark', 'UI-кит, тёмная тема']);
for (const [n] of screens) for (const [T, t] of [['Light', 'светлая тема'], ['Dark', 'тёмная тема']]) mk.push([`${n}_${T}`, `${names[n]}, ${t}`]);
for (const [n] of tablets) for (const [T, t] of [['Light', 'светлая тема'], ['Dark', 'тёмная тема']]) mk.push([`${n}_Tablet_${T}`, `${names[n]}, планшет, ${t}`]);
for (const [n] of states) for (const [T, t] of [['Light', 'светлая тема'], ['Dark', 'тёмная тема']]) mk.push([`${n}_${T}`, `Состояние: ${stNames[n]}, ${t}`]);
fs.writeFileSync('design/export/pages.json', JSON.stringify(mk, null, 0));
await pdf('design/export/FinKompas_Makety.pdf', mk);
await pdf('design/export/FinKompas_Diagrammy.pdf', [['UML_UseCase', 'UML Use-Case диаграмма'], ['A4_User_Flow_Map', ''], ...FLOW_FILES.map((f) => [f, ''])]);

// Копии для витрины сайта
for (const [a, b] of [[SVG, 'site/assets/svg'], [PNG, 'site/assets/screens']]) { fs.rmSync(b, { recursive: true, force: true }); fs.cpSync(a, b, { recursive: true }); }
fs.mkdirSync('site/pdf', { recursive: true });
for (const f of ['FinKompas_Makety.pdf', 'FinKompas_Diagrammy.pdf']) fs.copyFileSync(`design/export/${f}`, `site/pdf/${f}`);
await br.close(); srv.close();
console.log('svg:', fs.readdirSync(SVG).length, 'png:', fs.readdirSync(PNG).length);
