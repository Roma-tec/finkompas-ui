// Листы User Flow А4: монохромные экраны, одно направление, одна цель. Вызывается из tools/export.mjs.
import fs from 'fs';

const FONT = "Inter, 'Segoe UI', sans-serif", INK = '#14202B', MUTE = '#52606D', LINE = '#374151', ERR = '#B91C1C';
const W = 1123, H = 794, SW = 186, SH = 132, TOP = 250;
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${o.size || 11}" font-weight="${o.w || 400}" fill="${o.fill || INK}" text-anchor="${o.a || 'middle'}">${e(s)}</text>`;
const arrow = (d, c = LINE) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.3" marker-end="url(#${c === ERR ? 'ae' : 'a'})"/>`;

const data = [
  { file: 'UF_1_Add_Operation', title: 'Записать покупку за три действия', who: 'Анна, новичок. Цель: операция учтена, и виден остаток бюджета',
    goal: ['Операция', 'учтена'],
    screens: [['S2_Overview', 'Обзор', 'Видны баланс и остаток'], ['ST_Add_Operation', 'Форма операции', 'Сумма и категория'], ['ST_Undo_Toast', 'Операция сохранена', 'Можно отменить 5 секунд'], ['S5_Budgets', 'Бюджеты', 'Лимит обновился']],
    edges: [{ t: 'Нажать «Операция»' }, { t: 'Данные верны?', main: 'Да', alt: 'Нет', img: 'ST_Form_Error', cap: 'Ошибка у поля: исправить и сохранить' }, { t: 'Открыть бюджеты' }] },
  { file: 'UF_2_Set_Budget', title: 'Задать лимиты на месяц', who: 'Дмитрий, продвинутый пользователь. Цель: бюджет активен, лимиты отслеживаются',
    goal: ['Бюджет', 'активен'],
    screens: [['ST_Budget_Empty', 'Бюджета нет', 'Новый месяц'], ['ST_Budget_Setup', 'Настройка', 'Лимиты и порог 80 %'], ['S5_Budgets', 'Бюджет месяца', 'Прогресс по категориям'], ['S2_Overview', 'Обзор', 'Остаток на главном экране']],
    edges: [{ t: 'Нужен шаблон?', main: 'Нет', alt: 'Да', img: 'S11_Templates', cap: 'Шаблон рассчитал лимиты от дохода' }, { t: 'Сохранить бюджет' }, { t: 'Открыть обзор' }] },
  { file: 'UF_3_Export_Report', title: 'Получить отчёт за месяц файлом', who: 'Дмитрий, продвинутый пользователь. Цель: файл отчёта сохранён',
    goal: ['Файл', 'получен'],
    screens: [['S2_Overview', 'Обзор', 'Итоги месяца'], ['S6_Reports', 'Отчёты', 'Вкладка и период'], ['ST_Export', 'Экспорт', 'PDF, CSV или XLSX']],
    edges: [{ t: 'Открыть «Отчёты»' }, { t: 'Есть данные?', main: 'Да', alt: 'Нет', box: ['Пустое состояние:', 'выбрать другой период'] }] },
  { file: 'UF_4_Import_Statement', title: 'Загрузить выписку без дублей', who: 'Дмитрий, продвинутый пользователь. Цель: операции добавлены, дубликаты пропущены',
    goal: ['Выписка', 'загружена'],
    screens: [['S4_Transactions', 'Операции', 'Нажать «Импорт»'], ['ST_Import_Preview', 'Предпросмотр', 'Новые, дубликаты, ошибки'], ['S4_Transactions', 'Операции', 'Итог: сколько добавлено']],
    edges: [{ t: 'Файл, счёт и колонки' }, { t: 'Есть новые строки?', main: 'Да', alt: 'Нет', box: ['Изменить сопоставление', 'колонок и импортировать'] }] }
];
export const FLOW_FILES = data.map((d) => d.file);

function thumb(dir, name, x, y) {
  const s = fs.readFileSync(`${dir}/Prototype_${name}.svg`, 'utf8'), w = +s.match(/width="(\d+)"/)[1];
  const inner = s.replace(/^<svg [^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg x="${x}" y="${y}" width="${SW}" height="${SH}" viewBox="0 0 ${w} ${Math.round(w * SH / SW)}" preserveAspectRatio="xMidYMin slice">${inner}</svg><rect x="${x}" y="${y}" width="${SW}" height="${SH}" rx="4" fill="none" stroke="${LINE}" stroke-width="1.2"/>`;
}

function sheet(dir, f) {
  const N = f.screens.length, step = (1034 - SW - 104) / (N - 1), X = (i) => 104 + i * step, mid = TOP + SH / 2, p = [];
  p.push(txt(24, 44, f.title, { size: 22, w: 700, a: 'start' }), txt(24, 68, f.who, { size: 13, a: 'start', fill: MUTE }));
  p.push(`<circle cx="46" cy="${mid}" r="24" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.5"/>`, txt(46, mid + 4, 'Вход', { w: 600 }), arrow(`M70 ${mid}H${X(0)}`));
  f.screens.forEach(([n, a, b], i) => {
    p.push(thumb(dir, n, X(i), TOP), txt(X(i) + SW / 2, TOP + SH + 18, a, { w: 600 }), txt(X(i) + SW / 2, TOP + SH + 33, b, { fill: MUTE }));
  });
  f.edges.forEach((ed, i) => {
    const x1 = X(i) + SW, x2 = X(i + 1), g = (x1 + x2) / 2, lw = Math.max(ed.t.length * 6.6 + 20, 96);
    p.push(`<rect x="${g - lw / 2}" y="168" width="${lw}" height="28" rx="14" fill="#EEF0F2" stroke="#9CA3AF"/>`, txt(g, 186, ed.t), `<line x1="${g}" y1="196" x2="${g}" y2="${mid - (ed.alt ? 16 : 0)}" stroke="#9CA3AF" stroke-dasharray="3 3"/>`);
    if (!ed.alt) { p.push(arrow(`M${x1} ${mid}H${x2}`)); return; }
    p.push(arrow(`M${x1} ${mid}H${g - 16}`), `<path d="M${g} ${mid - 16}L${g + 16} ${mid}L${g} ${mid + 16}L${g - 16} ${mid}Z" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.3"/>`, arrow(`M${g + 16} ${mid}H${x2}`), txt(g + 8, mid - 20, ed.main, { size: 10, a: 'start', fill: MUTE }));
    const by = TOP + SH + 70, bw = ed.box ? 170 : SW, bh = ed.box ? 52 : SH, bx = g - bw / 2, nx = X(i + 1) + SW / 2, c = ed.alt === 'Нет' ? ERR : LINE;
    p.push(arrow(`M${g} ${mid + 16}V${by}`, c), txt(g + 6, mid + 40, ed.alt, { size: 10, a: 'start', fill: c }));
    if (ed.box) p.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="#FFFFFF" stroke="${c}" stroke-width="1.2"/>`, txt(g, by + 23, ed.box[0]), txt(g, by + 38, ed.box[1]));
    else p.push(thumb(dir, ed.img, bx, by), `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="none" stroke="${c}" stroke-width="1.2"/>`, txt(g, by + bh + 18, ed.cap, { w: 600 }));
    p.push(arrow(`M${bx + bw} ${by + bh / 2}H${nx}V${TOP + SH + 40}`));
  });
  const ex = X(N - 1) + SW;
  p.push(arrow(`M${ex} ${mid}H1053`), `<circle cx="1085" cy="${mid}" r="32" fill="#E5E7EB" stroke="${INK}" stroke-width="2"/>`, txt(1085, mid - 2, f.goal[0], { size: 10, w: 700 }), txt(1085, mid + 11, f.goal[1], { size: 10, w: 700 }));
  const ly = 712, t = (x, s) => txt(x, ly + 22, s, { a: 'start', fill: MUTE });
  p.push(`<rect x="24" y="${ly - 22}" width="${W - 48}" height="64" rx="8" fill="#FFFFFF" stroke="#D8DEE3"/>`, txt(48, ly - 2, 'Легенда', { w: 700, a: 'start' }),
    `<circle cx="60" cy="${ly + 18}" r="9" fill="#FFFFFF" stroke="${LINE}"/>`, t(76, 'Круг: вход и цель'),
    `<rect x="220" y="${ly + 10}" width="30" height="16" fill="#FFFFFF" stroke="${LINE}"/>`, t(256, 'Прямоугольник: экран'),
    `<rect x="430" y="${ly + 10}" width="30" height="16" rx="8" fill="#EEF0F2" stroke="#9CA3AF"/>`, t(466, 'Овал: действие'),
    `<path d="M630 ${ly + 8}L646 ${ly + 18}L630 ${ly + 28}L614 ${ly + 18}Z" fill="#FFFFFF" stroke="${LINE}"/>`, t(654, 'Ромб: развилка решения'),
    `<line x1="840" y1="${ly + 18}" x2="870" y2="${ly + 18}" stroke="${ERR}" stroke-width="1.5"/>`, t(878, 'Красная линия: ошибка'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${LINE}"/></marker><marker id="ae" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${ERR}"/></marker></defs><rect width="${W}" height="${H}" fill="#FFFFFF"/>${p.join('')}</svg>`;
}

export function flows(dir) { for (const f of data) fs.writeFileSync(`${dir}/${f.file}.svg`, sheet(dir, f)); }
