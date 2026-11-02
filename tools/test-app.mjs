// Сквозная проверка приложения в настоящем браузере. Запуск: node tools/test-app.mjs
import fs from 'fs'; import os from 'os'; import path from 'path';
import { serve, browser } from './lib.mjs';

const PORT = 8124, B = `http://localhost:${PORT}/`;
const srv = await serve('site', PORT), br = await browser(), page = await br.newPage();
await page.setViewport({ width: 1440, height: 1024 });
const errs = [], res = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push(m.text()); });
const dl = fs.mkdtempSync(path.join(os.tmpdir(), 'fk-'));
const cdp = await page.createCDPSession();
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl });

const ok = (name, cond, extra = '') => { res.push(cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
const text = (s = 'body') => page.$eval(s, (e) => e.innerText);
const go = async (p) => { await page.goto(B + p, { waitUntil: 'load' }); };
const clickText = (sel, t) => page.evaluate((s, x) => { const e = [...document.querySelectorAll(s)].find((n) => n.textContent.trim().includes(x)); if (!e) throw new Error('нет элемента: ' + x); e.click(); }, sel, t);
const norm = (s) => s.replace(/[\s ]/g, '');
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('fk-state-v1')));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Защита от входа без сессии
await go('dashboard.html'); await page.waitForSelector('#demo');
ok('без входа открывается страница входа', page.url().endsWith('login.html'));

// Проверка формы
await page.type('#email', 'плохой'); await page.type('#pass', '123'); await page.click('button[type=submit]');
ok('ошибки формы входа', (await text()).includes('Проверьте формат email'));

// Регистрация: нужен код и настройка, данные пустые
await clickText('[data-t]', 'Регистрация'); await page.type('#name', 'Тест'); await page.type('#email', 't@e.st'); await page.type('#pass', 'Passw0rd!');
await page.click('#terms'); await page.click('button[type=submit]'); await page.waitForSelector('#code');
await page.type('#code', '123456'); await page.click('#cok'); await page.waitForSelector('#ob-ok');
await page.$eval('#ob-b', (e) => { e.value = '1000'; });
await Promise.all([page.waitForNavigation(), page.click('#ob-ok')]);
ok('регистрация ведёт на пустой обзор', (await text()).includes('Добавить первую операцию'));
await page.evaluate(() => { localStorage.clear(); }); await go('login.html');

// Демо
await Promise.all([page.waitForNavigation(), page.click('#demo')]);
await wait(100);
let t = norm(await text('#view'));
ok('баланс 247 350', t.includes('247350₽'));
ok('доходы 95 000, расходы 61 240', t.includes('+95000₽') && t.includes('−61240₽'));
ok('остаток бюджета 8 760, 87,5 %', t.includes('8760₽') && t.includes('87,5%'));

// Операция и отмена
await page.click('#add'); await page.waitForSelector('[data-amount]');
await page.click('[data-ok]');
ok('нулевая сумма отклоняется', (await text('.dlg')).includes('Введите сумму больше нуля'));
await page.type('[data-amount]', '1 000,50'); await page.type('[data-note]', 'Тестовая покупка');
await page.click('[data-ok]'); await wait(100);
t = norm(await text('#view'));
ok('новая операция меняет баланс', t.includes('246349,5₽'), t.slice(0, 60));
await clickText('.toast button', 'Отменить'); await wait(100);
ok('отмена возвращает баланс', norm(await text('#view')).includes('247350₽'));

// XSS: текст пользователя выводится как текст
await page.click('#add'); await page.waitForSelector('[data-amount]');
await page.type('[data-amount]', '5'); await page.type('[data-note]', '<img src=x onerror=window.__x=1>');
await page.click('[data-ok]'); await wait(150);
ok('разметка в комментарии не исполняется', !(await page.evaluate(() => window.__x)));
await clickText('.toast button', 'Отменить'); await wait(50);

// Приватность и тема
await page.click('#priv'); await wait(50); ok('скрытие сумм', (await text('#view')).includes('••••')); await page.click('#priv');
await page.click('#theme'); ok('тёмная тема', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark'); await page.click('#theme');

// Операции: фильтр и импорт
await go('transactions.html'); await page.select('#f-c', 'cafe'); await wait(50);
ok('фильтр по категории', (await text('#tbl')).includes('Операций: 4'));
const csv = path.join(dl, 'v.csv');
fs.writeFileSync(csv, 'Дата;Сумма;Описание\n30.10.2026;-1200;Обед\n29.10.2026;-500,50;Кофейня "Зёрна"\n29.10.2026;7000;Подработка\nплохо;x;Ошибка\n');
await page.click('#imp'); await page.waitForSelector('#file');
await (await page.$('#file')).uploadFile(csv); await page.waitForSelector('#n2'); await page.click('#n2');
await page.waitForSelector('#n3'); await page.click('#n3'); await page.waitForSelector('#go');
const prev = await text('.dlg');
ok('импорт: дубликат и ошибка найдены', prev.includes('Дубликат') && prev.includes('Ошибка') && prev.includes('Новая'));
await page.click('#go'); await wait(100);
ok('импорт: добавлено 2, пропущено 2', (await text('.toasts')).includes('Добавлено 2, пропущено 2'));

// Бюджеты
await go('budgets.html'); t = await text('#view');
ok('бюджеты: превышение и исчерпание', t.includes('Лимит исчерпан') && t.includes('Превышено'));
await page.click('[data-m="1"]'); await wait(50); ok('пустой месяц', (await text('#view')).includes('Бюджета на этот месяц нет'));
await page.click('#cfg'); await page.waitForSelector('[data-l=food]'); await page.type('[data-l=food]', '15000'); await page.click('#ok'); await wait(50);
ok('новый бюджет создан', (await text('#view')).includes('Продукты'));
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('fk-state-v1')); s.month = '2026-10'; localStorage.setItem('fk-state-v1', JSON.stringify(s)); });

// Цели
await go('goals.html'); t = norm(await text('#view'));
ok('цель: взнос', t.includes('7143₽') && t.includes('75%'), t.slice(0, 120));
await page.click('[data-top]'); await page.waitForSelector('#amt'); await page.type('#amt', '50000'); await page.click('#ok'); await wait(50);
ok('цель достигнута', (await text('#view')).includes('Цель достигнута'));
await clickText('.toast button', 'Отменить'); await wait(50);

// Счета
await go('accounts.html'); await page.click('#add-a'); await page.waitForSelector('#n'); await page.type('#n', 'Доллары'); await page.select('#c', 'USD'); await page.$eval('#o', (e) => { e.value = '100'; }); await page.click('#ok'); await wait(50);
ok('новый счёт в валюте', norm(await text('#view')).includes('100$'));
const hasTx = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-a]')].find((x) => x.dataset.a === 'cash'); b.click(); return true; });
await page.waitForSelector('#rm'); await page.click('#rm'); await wait(50);
ok('счёт с операциями не удаляется молча', hasTx && (await text('.dlg')).includes('Удалить счёт нельзя'));
await page.keyboard.press('Escape');

// Отчёты: файлы настоящие
await go('reports.html'); await page.click('#exp'); await page.waitForSelector('input[value=csv]'); await page.click('input[value=csv]'); await page.click('#go'); await wait(300);
await page.click('#exp'); await page.waitForSelector('input[value=xlsx]'); await page.click('input[value=xlsx]'); await page.click('#go'); await wait(400);
const files = fs.readdirSync(dl), cf = files.find((f) => f.endsWith('.csv') && f.startsWith('fin')), xf = files.find((f) => f.endsWith('.xlsx'));
ok('CSV скачан', !!cf && fs.readFileSync(path.join(dl, cf), 'utf8').includes('Супермаркет'));
ok('XLSX скачан', !!xf && fs.readFileSync(path.join(dl, xf)).subarray(0, 2).toString() === 'PK');
for (const tab of ['flow', 'bal', 'cmp']) { await page.click(`[data-tab=${tab}]`); await wait(30); }
ok('все вкладки отчётов', (await text('#view')).includes('Прошлый месяц'));

// История
await go('history.html'); t = await text('#view');
ok('история с событием', t.includes('3 540') || t.includes('Импорт выписки'));
await clickText('[data-kind]', 'Вход'); await wait(30);
ok('события входа нельзя отменить', (await text('#view')).includes('События безопасности отменить нельзя'));
await clickText('[data-kind]', 'Все'); await wait(30);
await page.evaluate(() => { const e = [...document.querySelectorAll('[data-log]')].find((x) => x.textContent.includes('Изменена сумма')); e.click(); }); await wait(30);
t = await text('#view'); ok('было и стало', t.includes('Было') && t.includes('3 450'));
await page.click('#undo'); await page.waitForSelector('[data-yes]'); await page.click('[data-yes]'); await wait(50);
const s1 = await state(); ok('отмена из истории', s1.txs.find((x) => x.id === 'tx7').amount === 3540);

// Шаблоны
await go('templates.html'); await page.click('[data-use=t1]'); await page.waitForSelector('#in'); await page.click('#ok'); await wait(400);
ok('шаблон задаёт бюджет', page.url().includes('budgets.html'));

// Простой режим
await go('settings.html'); await clickText('[data-s]', 'Оформление'); await wait(30); await page.click('[data-mode=simple]'); await wait(50);
await go('transactions.html'); await page.click('#imp'); await wait(50);
ok('простой режим: импорт закрыт', (await text('.toasts')).includes('расширенном режиме'));
await go('budgets.html'); ok('простой режим: общий бюджет', (await text('#view')).includes('Общий бюджет'));

// Администратор
await page.evaluate(() => localStorage.clear()); await go('login.html');
await Promise.all([page.waitForNavigation(), page.click('#adm')]); await wait(50);
t = await text('body'); ok('админ не видит финансы', t.includes('Анна Кузнецова') && !t.includes('₽'));
await go('dashboard.html'); await wait(100); ok('админ не попадает на обзор', page.url().endsWith('admin.html'));
await page.click('[data-b=u0]'); await wait(30); ok('блокировка', (await text('#view')).includes('Заблокирована учётная запись anna@example.com'));

// Смартфон: нет горизонтальной прокрутки
await page.evaluate(() => localStorage.clear()); await go('login.html'); await Promise.all([page.waitForNavigation(), page.click('#demo')]);
await page.setViewport({ width: 360, height: 780 });
for (const p of ['dashboard', 'transactions', 'budgets', 'goals', 'accounts', 'reports', 'templates', 'history', 'settings']) {
  await go(p + '.html'); await wait(80);
  const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok('ширина 360: ' + p, o <= 0, o > 0 ? 'лишние ' + o + ' px' : '');
}
await page.setViewport({ width: 834, height: 1194 });
for (const p of ['dashboard', 'transactions', 'reports']) { await go(p + '.html'); await wait(80); const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok('ширина 834: ' + p, o <= 0, o > 0 ? 'лишние ' + o + ' px' : ''); }

for (const w of [1024, 1920]) {
  await page.setViewport({ width: w, height: 1000 });
  for (const p of ['dashboard', 'transactions', 'reports']) { await go(p + '.html'); await wait(80); const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok('ширина ' + w + ': ' + p, o <= 0, o > 0 ? 'лишние ' + o + ' px' : ''); }
}

ok('ошибок JavaScript нет', errs.length === 0, errs.slice(0, 3).join(' | '));
await br.close(); srv.close();
const failed = res.filter((x) => !x).length;
console.log(`Итого: ${res.length - failed} из ${res.length}`);
process.exit(failed ? 1 : 0);
