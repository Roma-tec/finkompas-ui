// Рисует UML Use-Case и User Flow Map как векторные SVG. Запуск: node tools/build-diagrams.mjs
import fs from 'fs';
const FONT = "Inter, 'Segoe UI', sans-serif", INK = '#14202B', MUTE = '#52606D', LINE = '#7B8894', ACC = '#0F766E';
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.size || 13}" font-weight="${o.w || 400}" fill="${o.fill || INK}" text-anchor="${o.a || 'middle'}">${e(s)}</text>`;
const lines = (x, y, arr, o = {}) => arr.map((s, i) => txt(x, y + (i - (arr.length - 1) / 2) * ((o.size || 13) + 3) + (o.size || 13) * 0.35, s, o)).join('');

/* ---------- UML Use-Case ---------- */
function useCase() {
  const W = 1240, H = 800, parts = [];
  const uc = {}, draw = (id, x, y, t) => { uc[id] = { x, y }; parts.push(`<ellipse cx="${x}" cy="${y}" rx="100" ry="26" fill="#DDF3F0" stroke="${ACC}" stroke-width="1.5"/>` + lines(x, y, t, { size: 12 })); };
  parts.push(`<rect x="210" y="70" width="830" height="700" rx="12" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/>`, txt(625, 56, 'Система «ФинКомпас»', { size: 16, w: 700 }));
  const c1 = [['UC1', 'Авторизоваться'], ['UC2', 'Добавить операцию'], ['UC3', 'Управлять счетами'], ['UC4', 'Настроить общий бюджет'], ['UC5', 'Вести финансовую цель'], ['UC6', 'Просмотреть отчёт'], ['UC8', 'Отменить действие']];
  c1.forEach(([id, t], i) => draw(id, 340, 110 + i * 64, [t]));
  [['UC10', ['Импортировать выписку']], ['UC11', ['Настроить бюджеты', 'по категориям']], ['UC12', ['Создать регулярную', 'операцию']]].forEach(([id, t], i) => draw(id, 340, 570 + i * 72, t));
  draw('UC9', 640, 230, ['Обновить баланс']); draw('UC7', 640, 380, ['Экспортировать в PDF']); draw('UC13', 640, 470, ['Экспортировать', 'в CSV и XLSX']); draw('UC14', 640, 570, ['Проверить дубликаты']);
  draw('UC15', 905, 340, ['Управлять', 'пользователями']); draw('UC16', 905, 440, ['Редактировать', 'справочники']); draw('UC17', 905, 540, ['Просмотреть', 'системный журнал']);
  const actor = (x, y, t) => `<circle cx="${x}" cy="${y - 34}" r="13" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M${x} ${y - 21}v34M${x - 20} ${y - 10}h40M${x} ${y + 13}l-16 24M${x} ${y + 13}l16 24" fill="none" stroke="${INK}" stroke-width="1.5"/>` + lines(x, y + 58, t, { size: 13, w: 600 });
  const A = { n: { x: 90, y: 300 }, a: { x: 90, y: 640 }, d: { x: 1140, y: 440 } };
  parts.push(actor(A.n.x, A.n.y, ['Новичок']), actor(A.a.x, A.a.y, ['Продвинутый', 'пользователь']), actor(A.d.x, A.d.y, ['Администратор']));
  const seg = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="1.2"/>`;
  c1.forEach(([id]) => parts.push(seg(A.n.x + 22, A.n.y, uc[id].x - 100, uc[id].y)));
  ['UC10', 'UC11', 'UC12'].forEach((id) => parts.push(seg(A.a.x + 22, A.a.y, uc[id].x - 100, uc[id].y)));
  ['UC15', 'UC16', 'UC17'].forEach((id) => parts.push(seg(A.d.x - 22, A.d.y, uc[id].x + 100, uc[id].y)));
  parts.push(`<path d="M${A.d.x - 18} ${A.d.y - 40}L1010 92L${uc.UC1.x + 100} ${uc.UC1.y}" fill="none" stroke="${LINE}" stroke-width="1.2"/>`);
  parts.push(`<path d="M${A.a.x} ${A.a.y - 48}L${A.n.x} ${A.n.y + 90}" fill="none" stroke="${INK}" stroke-width="1.5" marker-end="url(#tri)"/>`, txt(A.n.x + 8, 465, 'обобщение', { size: 11, fill: MUTE, a: 'start' }));
  const dep = (a, b, label, tx, ty) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" fill="none" stroke="${MUTE}" stroke-width="1.2" stroke-dasharray="6 4" marker-end="url(#arr)"/>` + txt(tx, ty, label, { size: 11, fill: MUTE });
  parts.push(dep([440, 174], [544, 222], '«include»', 512, 186));
  parts.push(dep([440, 570], [540, 570], '«include»', 490, 560));
  parts.push(dep([548, 392], [438, 424], '«extend»', 490, 394));
  parts.push(dep([548, 458], [438, 436], '«extend»', 490, 466));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto"><path d="M1 1l10 5l-10 5z" fill="#FFFFFF" stroke="${INK}"/></marker><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M1 1l8 4l-8 4" fill="none" stroke="${MUTE}" stroke-width="1.4"/></marker></defs><rect width="${W}" height="${H}" fill="#F6F8F8"/>${parts.join('')}</svg>`;
}

/* ---------- User Flow Map, A4 альбомная ---------- */
function flowMap() {
  const W = 1123, H = 794, C = { screen: ['#DDF3F0', ACC], action: ['#DBEAFE', '#1D4ED8'], decision: ['#FEF3C7', '#B45309'], goal: ['#DCFCE7', '#15803D'], err: ['#FEE2E2', '#B91C1C'] };
  const n = {}, shapes = [], arrows = [];
  const box = (id, x, y, t, k = 'screen', w = 120, h = 44) => { n[id] = { x, y, w, h }; const [f, s] = C[k]; shapes.push(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="${f}" stroke="${s}" stroke-width="1.5"/>` + lines(x, y, t, { size: 11 })); };
  const oval = (id, x, y, t, k, w = 104, h = 56) => { n[id] = { x, y, w, h }; const [f, s] = C[k]; shapes.push(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${f}" stroke="${s}" stroke-width="2"/>` + lines(x, y, t, { size: 11, w: 600 })); };
  const dia = (id, x, y, t, w = 104, h = 70) => { n[id] = { x, y, w, h }; const [f, s] = C.decision; shapes.push(`<path d="M${x} ${y - h / 2}L${x + w / 2} ${y}L${x} ${y + h / 2}L${x - w / 2} ${y}z" fill="${f}" stroke="${s}" stroke-width="1.5"/>` + lines(x, y, t, { size: 10 })); };
  const link = (a, b, label, opt = {}) => {
    const A = n[a], B = n[b], x1 = A.x + A.w / 2, y1 = A.y, x2 = B.x - B.w / 2, y2 = B.y, mid = opt.mid ?? (x1 + x2) / 2;
    arrows.push(`<path d="M${x1} ${y1}H${mid}V${y2}H${x2}" fill="none" stroke="${opt.err ? C.err[1] : LINE}" stroke-width="1.3" marker-end="url(#a${opt.err ? 'e' : ''})"/>`);
    if (label) arrows.push(txt(opt.lx ?? mid + 4, opt.ly ?? y2 - 5, label, { size: 10, fill: MUTE, a: 'start' }));
  };
  ['Вход', 'Авторизация', 'Настройка', 'Главный экран', 'Разделы', 'Действия', 'Проверка', 'Цель'].forEach((h, i) => { const x = [70, 190, 332, 460, 610, 772, 930, 1058][i]; arrows.push(txt(x, 100, h, { size: 11, w: 700, fill: MUTE })); });
  arrows.push(`<line x1="24" y1="110" x2="${W - 24}" y2="110" stroke="#D8DEE3"/>`);
  const Y = (i) => 145 + i * 68;
  oval('start', 70, Y(4), ['Запуск', 'приложения'], 'screen');
  dia('auth', 195, Y(4), ['Есть сессия?']);
  box('login', 190, Y(2), ['Вход и регистрация'], 'screen', 128);
  box('onb', 332, Y(2), ['Первичная настройка'], 'screen', 132);
  box('dash', 460, Y(4), ['Главный экран:', 'обзор финансов']);
  const sec = [['tx', 'Операции'], ['bud', 'Бюджеты'], ['goal', 'Цели'], ['acc', 'Счета и категории'], ['rep', 'Отчёты'], ['tpl', 'Шаблоны бюджетов'], ['his', 'История действий'], ['set', 'Настройки']];
  sec.forEach(([id, t], i) => box(id, 610, Y(i), [t]));
  box('addtx', 772, Y(0), ['Добавить или', 'импортировать операцию'], 'action', 156);
  box('setlim', 772, Y(1), ['Задать лимиты'], 'action', 156);
  box('topup', 772, Y(2), ['Пополнить цель'], 'action', 156);
  box('editacc', 772, Y(3), ['Настроить счёт'], 'action', 156);
  box('export', 772, Y(4), ['Изучить и экспортировать'], 'action', 156);
  box('apply', 772, Y(5), ['Применить шаблон'], 'action', 156);
  box('undo', 772, Y(6), ['Отменить действие'], 'action', 156);
  box('theme', 772, Y(7), ['Сменить тему и режим'], 'action', 156);
  dia('check', 930, Y(3), ['Данные', 'верны?'], 104, 76);
  box('fix', 940, Y(6), ['Показать ошибку,', 'исправить и повторить'], 'err', 136);
  oval('goalx', 1058, Y(3), ['Пользователь', 'контролирует', 'финансы'], 'goal', 102, 76);
  link('start', 'auth');
  arrows.push(`<path d="M195 ${Y(4) - 35}V${Y(2) + 22}" fill="none" stroke="${LINE}" stroke-width="1.3" marker-end="url(#a)"/>`, txt(200, Y(3), 'Нет', { size: 10, fill: MUTE, a: 'start' }));
  link('auth', 'dash', 'Да', { lx: 300, ly: Y(4) - 5 });
  link('login', 'onb');
  arrows.push(`<path d="M398 ${Y(2)}H425V${Y(4) - 22}" fill="none" stroke="${LINE}" stroke-width="1.3" marker-end="url(#a)"/>`);
  sec.forEach(([id]) => link('dash', id, null, { mid: 535 }));
  [['tx', 'addtx'], ['bud', 'setlim'], ['goal', 'topup'], ['acc', 'editacc'], ['rep', 'export'], ['tpl', 'apply'], ['his', 'undo'], ['set', 'theme']].forEach(([a, b]) => link(a, b));
  ['addtx', 'setlim', 'topup', 'editacc', 'export', 'apply', 'undo', 'theme'].forEach((id) => link(id, 'check', null, { mid: 862 }));
  link('check', 'goalx', 'Да', { lx: 985, ly: Y(3) - 7 });
  arrows.push(`<path d="M930 ${Y(3) + 38}V${Y(6) - 22}" fill="none" stroke="${C.err[1]}" stroke-width="1.3" marker-end="url(#ae)"/>`, txt(935, Y(4) + 10, 'Нет', { size: 10, fill: C.err[1], a: 'start' }));
  // легенда
  const lx = 48, ly = 712, leg = [['screen', 'Экран'], ['action', 'Действие'], ['decision', 'Решение'], ['goal', 'Цель'], ['err', 'Ошибка']];
  const legend = `<rect x="24" y="${ly - 22}" width="${W - 48}" height="64" rx="8" fill="#FFFFFF" stroke="#D8DEE3"/>` + txt(lx, ly - 2, 'Легенда', { size: 11, w: 700, a: 'start' }) + leg.map(([k, t], i) => `<rect x="${lx + i * 120}" y="${ly + 8}" width="18" height="14" rx="3" fill="${C[k][0]}" stroke="${C[k][1]}"/>` + txt(lx + 24 + i * 120, ly + 19, t, { size: 11, a: 'start' })).join('') + txt(lx + 620, ly + 19, 'Весь поток идёт слева направо к одной цели. Точка входа одна.', { size: 11, fill: MUTE, a: 'start' });
  const head = txt(24, 44, 'ФинКомпас: User Flow Map', { size: 22, w: 700, a: 'start' }) + txt(24, 68, 'Цель всех маршрутов: пользователь контролирует свои финансы', { size: 13, fill: MUTE, a: 'start' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1l8 4l-8 4z" fill="${LINE}"/></marker><marker id="ae" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1l8 4l-8 4z" fill="${C.err[1]}"/></marker></defs><rect width="${W}" height="${H}" fill="#F6F8F8"/>${head}${arrows.join('')}${shapes.join('')}${legend}</svg>`;
}

fs.mkdirSync('design/export/svg', { recursive: true });
fs.writeFileSync('design/export/svg/UML_UseCase.svg', useCase());
fs.writeFileSync('design/export/svg/A4_User_Flow_Map.svg', flowMap());
console.log('diagrams ok');
