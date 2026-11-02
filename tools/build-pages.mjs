// Создаёт HTML-страницы приложения и витрины. Запуск: node tools/build-pages.mjs
import fs from 'fs';

const app = {
  login: 'Вход', dashboard: 'Обзор', transactions: 'Операции', budgets: 'Бюджеты', goals: 'Цели',
  accounts: 'Счета и категории', reports: 'Отчёты', templates: 'Шаблоны бюджетов', history: 'История',
  settings: 'Настройки', admin: 'Администрирование'
};
const head = (t) => `<!doctype html>
<html lang="ru" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t} — ФинКомпас</title>
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/app.css">
</head>`;
for (const [p, t] of Object.entries(app)) {
  fs.writeFileSync(`site/${p}.html`, `${head(t)}
<body data-page="${p}">
<script src="assets/js/icons.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/pages.js"></script>
</body>
</html>
`);
}

const showcase = (title, body) => `${head(title)}
<body>
<main class="content" style="margin:0 auto">
<div class="row between wrap"><h1>${title}</h1><a class="btn sec" href="index.html">К карте сайта</a></div>
${body}
</main>
<script src="assets/js/icons.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
`;

const screens = [
  ['S1_Auth', 'S1. Регистрация и авторизация'], ['S2_Overview', 'S2. Главный экран'], ['S3_Settings', 'S3. Настройки профиля'],
  ['S4_Transactions', 'S4. Операции'], ['S5_Budgets', 'S5. Бюджеты'], ['S6_Reports', 'S6. Отчёты и экспорт'], ['S7_History', 'S7. История действий'],
  ['S8_Accounts', 'S8. Счета и категории'], ['S9_Goals', 'S9. Финансовые цели'], ['S10_Mobile_Portrait', 'S10. Смартфон, портрет'],
  ['S10_Mobile_Landscape', 'S10. Смартфон, альбомная ориентация'], ['S11_Templates', 'S11. Шаблоны бюджетов'], ['S12_Admin', 'S12. Администрирование']
];
const shots = screens.map(([f, t]) => `<section class="card stack"><h2>${t}</h2><div class="grid"><div class="c6"><div class="small muted">Светлая тема</div><a href="assets/svg/${f}_Light.svg"><img class="shot" loading="lazy" src="assets/screens/${f}_Light.png" alt="${t}, светлая тема"></a></div><div class="c6"><div class="small muted">Тёмная тема</div><a href="assets/svg/${f}_Dark.svg"><img class="shot" loading="lazy" src="assets/screens/${f}_Dark.png" alt="${t}, тёмная тема"></a></div></div></section>`).join('\n');
fs.writeFileSync('site/screens.html', showcase('Все макеты', shots));

const img = (f, alt) => `<a href="assets/svg/${f}.svg"><img class="shot" src="assets/svg/${f}.svg" alt="${alt}"></a>`;
fs.writeFileSync('site/flow-map.html', showcase('User Flow Map', img('A4_User_Flow_Map', 'Карта пользовательских потоков')));
fs.writeFileSync('site/use-case.html', showcase('UML Use-Case', img('UML_UseCase', 'Диаграмма прецедентов')));
fs.writeFileSync('site/mobile.html', showcase('Мобильная версия', '<p class="small muted">Внутри рамки работает настоящее приложение: сетка перестраивается по ширине 390 px.</p><div class="phone"><iframe src="dashboard.html" title="Приложение на смартфоне"></iframe></div>'));

const swatches = [['#0F766E', 'Бирюза, основной акцент'], ['#0B5F59', 'Глубокая бирюза'], ['#14202B', 'Ночной графит'], ['#F6F8F8', 'Утренний туман'], ['#15803D', 'Доход'], ['#B91C1C', 'Расход'], ['#B45309', 'Предупреждение'], ['#2DD4BF', 'Акцент тёмной темы']];
fs.writeFileSync('site/moodboard.html', showcase('Moodboard', `<section class="card stack"><h2>Спокойствие, ясность, надёжность</h2><p class="muted">Деньги часто вызывают тревогу. Интерфейс её снижает: приглушённый фон, один спокойный акцент, красный только там, где нужно внимание.</p><div class="row wrap">${['порядок', 'опора', 'прозрачность', 'рост', 'контроль'].map((w) => `<span class="badge" style="height:32px;font-size:14px;padding:0 14px">${w}</span>`).join('')}</div></section>
<div class="grid">
<section class="c6" style="border-radius:12px;min-height:220px;padding:24px;color:#fff;display:flex;align-items:flex-end;background:#0B5F59"><h2>Компас: путь виден, а направление выбираете вы</h2></section>
<section class="c6" style="border-radius:12px;min-height:220px;padding:24px;color:#fff;display:flex;align-items:flex-end;background:#14202B"><h2>Горизонт: ночной графит тёмной темы</h2></section>
<section class="c8 card stack"><h2>Цвет</h2><div class="acc-grid" style="grid-template-columns:repeat(4,1fr)">${swatches.map(([c, t]) => `<div><div style="height:64px;border-radius:8px;background:${c};border:1px solid var(--border)"></div><div class="cap" style="margin-top:6px">${t}</div><div class="cap muted">${c}</div></div>`).join('')}</div></section>
<section class="c4 card stack"><h2>Шрифт Inter</h2><div style="font-size:40px;line-height:48px;font-weight:700">247 350 ₽</div><div class="small">Кириллица читается в мелких размерах, цифры табличные: суммы стоят ровно по разрядам.</div><div class="cap muted">400 · 500 · 600 · 700</div></section>
</div>`));


// Отклонённые варианты стилистики: сравнение с выбранным moodboard
const board = (file, title, idea, bg, ink, accent, why, sample) => fs.writeFileSync(`site/${file}.html`, showcase(title, `<section class="card stack"><h2>${idea}</h2><p class="muted">${why}</p></section>
<div class="grid"><section class="c6" style="border-radius:12px;min-height:240px;padding:24px;background:${bg};color:${ink};display:flex;flex-direction:column;justify-content:flex-end;gap:8px"><h2 style="color:inherit">${sample[0]}</h2><p>${sample[1]}</p></section>
<section class="c6" style="border-radius:12px;min-height:240px;padding:24px;background:${accent};color:${bg};display:flex;flex-direction:column;justify-content:flex-end;gap:8px"><h2 style="color:inherit">247 350 ₽</h2><p>${sample[2]}</p></section>
<section class="c12 card stack"><h2>Палитра</h2><div class="row wrap">${[bg, ink, accent].map((c) => `<div style="width:160px"><div style="height:64px;border-radius:8px;background:${c};border:1px solid var(--border)"></div><div class="cap">${c}</div></div>`).join('')}</div></section></div>`));
board('moodboard-b', 'Moodboard B', 'Вариант B: тёплый блокнот', '#F5ECD9', '#3B2A1A', '#9A5B2C', 'Скевоморфизм: бумага, кожа, рукописные заметки. Отклонён: фактуры тяжелее загружаются, плотные таблицы читаются хуже.', ['Записная книжка расходов', 'Страницы, закладки, чернила', 'Домашняя бухгалтерия']);
board('moodboard-c', 'Moodboard C', 'Вариант C: неоновые плитки', '#101018', '#F2F2FF', '#C026D3', 'Плитки в духе Metro и яркий неон. Отклонён: яркий цвет спорит со смысловыми цветами дохода и расхода и усиливает тревогу.', ['Деньги как игра', 'Большие плитки, резкие акценты', 'Энергия и азарт']);

const states = ['Default', 'Hover', 'Pressed', 'Disabled'];
const ic = (n) => `<span data-ic="${n}"></span>`;
fs.writeFileSync('site/ui-kit.html', showcase('UI-кит', `<section class="card stack"><h2>Кнопки</h2>
${[['', 'Primary'], ['sec', 'Secondary'], ['ghost', 'Ghost'], ['danger', 'Danger']].map(([c, t]) => `<div class="row wrap"><span class="small muted" style="width:90px">${t}</span>${states.map((s) => `<button class="btn ${c}" ${s === 'Disabled' ? 'disabled' : ''} style="${s === 'Pressed' ? 'transform:scale(.97);' : ''}${s === 'Hover' && !c ? 'background:var(--accent-hover);' : ''}${s === 'Hover' && c === 'sec' ? 'background:var(--bg-muted);' : ''}">${s}</button>`).join('')}</div>`).join('\n')}
<div class="row wrap"><span class="small muted" style="width:90px">Со значком</span><button class="btn">${ic('plus')}Операция</button><button class="btn sec icon" aria-label="Скрыть суммы">${ic('eye')}</button><button class="btn sm">Малая</button></div></section>
<div class="grid"><section class="card c6 stack"><h2>Поля ввода</h2>
<label class="f">Обычное<input type="text" placeholder="Подсказка" aria-label="Обычное"></label><label class="f">Заполненное<input type="text" value="84 350 ₽"></label><label class="f">Ошибка<input type="text" class="invalid" value="0"><span class="err">Введите сумму больше нуля</span></label><label class="f">Выпадающий список<select><option>Основная карта</option></select></label></section>
<section class="card c6 stack"><h2>Выбор</h2><label class="check"><input type="checkbox" checked>Чекбокс включён</label><label class="check"><input type="checkbox">Чекбокс выключен</label><label class="check"><input type="radio" name="r" checked style="accent-color:var(--accent);width:18px;height:18px">Радиокнопка</label><label class="switch">Переключатель<input type="checkbox" checked></label><label class="switch">Переключатель выключен<input type="checkbox"></label><div class="seg"><button class="on">Расход</button><button>Доход</button><button>Перевод</button></div></section>
<section class="card c6 stack"><h2>Статусы</h2><div class="row wrap"><span class="badge ok">В норме</span><span class="badge w">Внимание</span><span class="badge x">Превышено на 900 ₽</span><span class="badge">Не входит в баланс</span></div><div class="stack" style="gap:8px"><div class="bar"><i style="width:38%"></i></div><div class="bar w"><i style="width:89%"></i></div><div class="bar x"><i style="width:100%"></i></div></div></section>
<section class="card c6 stack"><h2>Уведомление и загрузка</h2><div class="toast" style="animation:none"><span class="grow">Операция сохранена</span><button type="button">Отменить</button></div><div class="skel"></div></section>
<section class="card c12 stack"><h2>Типографика</h2><div style="font-size:40px;line-height:48px;font-weight:700">Display 40/48</div><h1>H1 28/36</h1><h2>H2 20/28</h2><p>Body 16/24</p><p class="small">Body Small 14/20</p><p class="cap">Caption 12/16</p></section></div>
<script>addEventListener('DOMContentLoaded',function(){document.querySelectorAll('[data-ic]').forEach(function(e){e.outerHTML=FK.icon(e.dataset.ic)})})</script>`));

fs.writeFileSync('site/cover.html', `${head('Обложка')}
<body style="background:#0B5F59;color:#fff">
<main style="min-height:100vh;padding:80px;display:flex;flex-direction:column;justify-content:space-between">
<div class="row" style="gap:16px"><svg width="56" height="56" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="#fff"/><circle cx="20" cy="20" r="13" stroke="#0B5F59" stroke-width="2"/><path d="M26 14l-3.6 8.4L14 26l3.6-8.4L26 14z" fill="#0B5F59"/></svg><strong style="font-size:28px">ФинКомпас</strong></div>
<div><h1 style="font-size:64px;line-height:72px;max-width:900px">Проект интерфейса системы управления финансами</h1><p style="font-size:24px;line-height:32px;margin-top:24px">Лабораторная работа S2G11 «Проект интерфейса программной системы»</p></div>
<p style="font-size:18px">Быстряков Роман · ${new Date().getFullYear()}</p>
</main>
</body>
</html>
`);

const links = [
  ['Приложение', [['login', 'Вход и регистрация'], ['dashboard', 'Обзор'], ['transactions', 'Операции и импорт'], ['budgets', 'Бюджеты'], ['goals', 'Цели'], ['accounts', 'Счета и категории'], ['reports', 'Отчёты и экспорт'], ['templates', 'Шаблоны бюджетов'], ['history', 'История действий'], ['settings', 'Настройки'], ['admin', 'Администрирование'], ['mobile', 'Мобильная версия']]],
  ['Дизайн', [['screens', 'Все макеты'], ['ui-kit', 'UI-кит'], ['moodboard', 'Moodboard'], ['moodboard-b', 'Moodboard B'], ['moodboard-c', 'Moodboard C'], ['flow-map', 'User Flow Map'], ['use-case', 'UML Use-Case'], ['cover', 'Обложка']]]
];
fs.writeFileSync('site/index.html', `${head('Карта сайта')}
<body><main class="content" style="margin:0 auto">
<div><h1>ФинКомпас</h1><p class="muted">Система управления личными финансами. Лабораторная работа S2G11.</p></div>
<div class="row wrap"><a class="btn" href="login.html">Открыть приложение</a><a class="btn sec" href="pdf/FinKompas_Makety.pdf">PDF с макетами</a><a class="btn sec" href="pdf/FinKompas_Diagrammy.pdf">PDF с диаграммами</a></div>
<div class="grid">${links.map(([t, l]) => `<section class="card c6 stack"><h2>${t}</h2><div class="list small">${l.map(([h, n]) => `<a href="${h}.html">${n}</a>`).join('')}</div></section>`).join('')}</div>
</main><script src="assets/js/icons.js"></script><script src="assets/js/app.js"></script></body></html>
`);
console.log('pages ok');
