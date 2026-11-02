/* ==========================================================================
   ФинКомпас — общий модуль приложения
   Данные, расчёты, история изменений, каркас, модальные окна, уведомления
   ========================================================================== */
(function (w) {
  'use strict';

  var KEY = 'fk-state-v1';
  var RATES = { RUB: 1, USD: 90, EUR: 98 }; // демо-курсы, в реальном продукте приходят с сервера
  var SIGN = { RUB: '₽', USD: '$', EUR: '€' };
  var COLORS = ['#0F766E', '#2563EB', '#D97706', '#9333EA', '#DB2777', '#65A30D', '#0891B2', '#DC2626', '#4F46E5', '#CA8A04', '#059669', '#7C3AED'];
  var MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var NAV = [
    ['dashboard', 'Обзор', 'home'], ['transactions', 'Операции', 'list'], ['budgets', 'Бюджеты', 'wallet'],
    ['goals', 'Цели', 'target'], ['accounts', 'Счета и категории', 'card'], ['reports', 'Отчёты', 'chart'],
    ['templates', 'Шаблоны бюджетов', 'template'], ['history', 'История', 'history']
  ];

  /* ---------------- ДЕМО-ДАННЫЕ ---------------- */
  function uid(p) { return (p || 'id') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function seed() {
    var cats = [
      ['food', 'Продукты', 'food', 'expense', 0], ['house', 'Жильё', 'house', 'expense', 1], ['cafe', 'Кафе', 'cafe', 'expense', 2],
      ['bus', 'Транспорт', 'bus', 'expense', 3], ['fun', 'Развлечения', 'film', 'expense', 4], ['health', 'Здоровье', 'health', 'expense', 5],
      ['study', 'Образование', 'book', 'expense', 6], ['other', 'Прочее', 'box', 'expense', 8],
      ['salary', 'Зарплата', 'salary', 'income', 10], ['side', 'Подработка', 'phone', 'income', 11], ['gift', 'Подарки', 'gift', 'income', 9]
    ].map(function (c) { return { id: c[0], name: c[1], icon: c[2], kind: c[3], color: COLORS[c[4]] }; });
    var raw = [
      // Октябрь: доходы 95 000 ₽, расходы 61 240 ₽
      ['2026-10-01', 'income', 55000, 'salary', 'card', 'Зарплата'], ['2026-10-15', 'income', 40000, 'salary', 'card', 'Аванс'],
      ['2026-10-05', 'expense', 25000, 'house', 'card', 'Аренда', true],
      ['2026-10-03', 'expense', 4200, 'food', 'card', 'Супермаркет'], ['2026-10-10', 'expense', 3800, 'food', 'card', 'Рынок'],
      ['2026-10-17', 'expense', 2950, 'food', 'cash', 'Магазин у дома'], ['2026-10-24', 'expense', 4000, 'food', 'card', 'Супермаркет'],
      ['2026-10-28', 'expense', 3450, 'food', 'card', 'Супермаркет'],
      ['2026-10-30', 'expense', 1200, 'cafe', 'card', 'Обед'], ['2026-10-22', 'expense', 2300, 'cafe', 'card', 'Ужин с друзьями'],
      ['2026-10-12', 'expense', 1850, 'cafe', 'cash', 'Кофейня'], ['2026-10-08', 'expense', 2550, 'cafe', 'card', 'Пиццерия'],
      ['2026-10-02', 'expense', 2340, 'bus', 'card', 'Проездной'], ['2026-10-19', 'expense', 3000, 'bus', 'card', 'Такси'],
      ['2026-10-11', 'expense', 1600, 'fun', 'card', 'Кино'], ['2026-10-25', 'expense', 3000, 'fun', 'card', 'Концерт'],
      // Сентябрь
      ['2026-09-01', 'income', 55000, 'salary', 'card', 'Зарплата'], ['2026-09-15', 'income', 35000, 'salary', 'card', 'Аванс'],
      ['2026-09-05', 'expense', 25000, 'house', 'card', 'Аренда'], ['2026-09-09', 'expense', 17300, 'food', 'card', 'Продукты за месяц'],
      ['2026-09-13', 'expense', 6100, 'cafe', 'card', 'Кафе за месяц'], ['2026-09-18', 'expense', 5200, 'bus', 'card', 'Транспорт за месяц'],
      ['2026-09-26', 'expense', 8900, 'fun', 'card', 'День рождения друга'],
      // Август
      ['2026-08-01', 'income', 55000, 'salary', 'card', 'Зарплата'], ['2026-08-15', 'income', 30000, 'salary', 'card', 'Аванс'],
      ['2026-08-05', 'expense', 25000, 'house', 'card', 'Аренда'], ['2026-08-10', 'expense', 16900, 'food', 'card', 'Продукты за месяц'],
      ['2026-08-14', 'expense', 7400, 'cafe', 'card', 'Кафе за месяц'], ['2026-08-21', 'expense', 5100, 'bus', 'card', 'Транспорт за месяц'],
      ['2026-08-27', 'expense', 4300, 'fun', 'card', 'Выставка']
    ];
    var txs = raw.map(function (r, i) {
      return { id: 'tx' + i, date: r[0], type: r[1], amount: r[2], cat: r[3], account: r[4], note: r[5], recurring: !!r[6] };
    });
    var target = { card: 84350, save: 150000, cash: 13000 };
    var accounts = [
      { id: 'card', name: 'Основная карта', kind: 'card', currency: 'RUB', color: COLORS[0], inTotal: true },
      { id: 'save', name: 'Накопительный', kind: 'save', currency: 'RUB', color: COLORS[1], inTotal: true },
      { id: 'cash', name: 'Наличные', kind: 'cash', currency: 'RUB', color: COLORS[2], inTotal: true }
    ];
    accounts.forEach(function (a) {
      var d = 0;
      txs.forEach(function (t) { if (t.account === a.id) d += t.type === 'income' ? t.amount : -t.amount; });
      a.opening = target[a.id] - d;
    });
    return {
      user: null, theme: 'light', privacy: false, month: '2026-10',
      notif: { near: true, over: true, recurring: true, goals: true }, currency: 'RUB',
      accounts: accounts, cats: cats, txs: txs,
      budgets: [{ id: '2026-10', threshold: 80, rollover: false, limits: { house: 25000, food: 20000, cafe: 7000, bus: 6000, fun: 12000 } }],
      goals: [{ id: 'g1', name: 'Отпуск', icon: 'plane', target: 200000, saved: 150000, due: '2027-05-31', account: 'save' }],
      log: [
        { id: 'l3', ts: '2026-10-28T19:42:00', kind: 'tx', text: 'Изменена сумма операции «Супермаркет»: 3 540 ₽ → 3 450 ₽', coll: 'txs', item: 'tx7', before: Object.assign({}, txs[7], { amount: 3540 }), after: txs[7] },
        { id: 'l2', ts: '2026-10-01T10:05:00', kind: 'budget', text: 'Создан бюджет на октябрь 2026', coll: 'budgets', item: '2026-10', before: null, after: null, locked: true },
        { id: 'l1', ts: '2026-10-01T09:58:00', kind: 'login', text: 'Вход с нового устройства: Chrome, Windows', locked: true }
      ],
      users: [
        ['Анна Кузнецова', 'anna@example.com', 'L2', 'active', '02.11.2026'], ['Игорь Лебедев', 'igor@example.com', 'L1', 'active', '01.11.2026'],
        ['Мария Орлова', 'maria@example.com', 'L1', 'active', '30.10.2026'], ['Павел Соколов', 'pavel@example.com', 'L2', 'blocked', '12.10.2026'],
        ['Елена Морозова', 'elena@example.com', 'L1', 'active', '29.10.2026'], ['Дмитрий Волков', 'dmitry@example.com', 'L2', 'active', '02.11.2026'],
        ['Ольга Новикова', 'olga@example.com', 'L1', 'active', '21.10.2026'], ['Сергей Попов', 'sergey@example.com', 'L3', 'active', '02.11.2026']
      ].map(function (u, i) { return { id: 'u' + i, name: u[0], email: u[1], level: u[2], status: u[3], last: u[4], twofa: i % 2 === 0 }; }),
      syslog: [
        { ts: '02.11.2026 09:14', text: 'Обновлён справочник валют' },
        { ts: '30.10.2026 18:02', text: 'Заблокирована учётная запись по запросу владельца' },
        { ts: '28.10.2026 11:40', text: 'Добавлена встроенная категория «Образование»' }
      ]
    };
  }

  /* ---------------- ХРАНИЛИЩЕ ---------------- */
  var S = null;
  function load() {
    try { var v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch (e) { /* хранилище недоступно */ }
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* работаем без сохранения */ } }
  function reset() { S = seed(); save(); }
  S = load();

  /* ---------------- ТЕМА ---------------- */
  function applyTheme() {
    var t = S.theme === 'system' ? (w.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.theme;
    document.documentElement.setAttribute('data-theme', t);
  }
  applyTheme();

  /* ---------------- УТИЛИТЫ ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(n, cls) { return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (w.FK_ICONS[n] || '') + '</svg>'; }
  function num(n) { return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n); }
  function money(n, cur) {
    if (S.privacy) return '••••';
    return num(Math.abs(n)) === num(n) ? num(n) + ' ' + SIGN[cur || 'RUB'] : '−' + num(Math.abs(n)) + ' ' + SIGN[cur || 'RUB'];
  }
  function signed(n, cur) { if (S.privacy) return '••••'; return (n >= 0 ? '+' : '−') + num(Math.abs(n)) + ' ' + SIGN[cur || 'RUB']; }
  function dateRu(d) { var p = d.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function monthRu(m) { var p = m.split('-'); return MONTHS[+p[1] - 1] + ' ' + p[0]; }
  function shiftMonth(m, by) { var p = m.split('-'), d = new Date(+p[0], +p[1] - 1 + by, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function lastDay(m) { var p = m.split('-'); return m + '-' + String(new Date(+p[0], +p[1], 0).getDate()).padStart(2, '0'); }
  function defaultDate() { var t = today(); return t.slice(0, 7) === S.month ? t : lastDay(S.month); }
  function find(coll, id) { return S[coll].filter(function (x) { return x.id === id; })[0]; }
  function adv() { return !S.user || S.user.mode === 'extended'; }

  /* ---------------- РАСЧЁТЫ ---------------- */
  function rub(t) { var a = find('accounts', t.account); return t.amount * RATES[a ? a.currency : 'RUB']; }
  function balance(a) {
    var b = a.opening;
    S.txs.forEach(function (t) {
      if (t.account === a.id) b += t.type === 'income' ? t.amount : -t.amount;
      if (t.type === 'transfer' && t.to === a.id) b += (t.amount * RATES[find('accounts', t.account).currency]) / RATES[a.currency];
    });
    return b;
  }
  function total() { return S.accounts.reduce(function (s, a) { return s + (a.inTotal ? balance(a) * RATES[a.currency] : 0); }, 0); }
  function inMonth(m) { return S.txs.filter(function (t) { return t.date.slice(0, 7) === m; }); }
  function sumType(list, type) { return list.reduce(function (s, t) { return s + (t.type === type ? rub(t) : 0); }, 0); }
  function byCat(list) {
    var r = {};
    list.forEach(function (t) { if (t.type === 'expense') r[t.cat] = (r[t.cat] || 0) + rub(t); });
    return r;
  }
  function budgetFor(m) { return S.budgets.filter(function (b) { return b.id === m; })[0]; }
  function budgetRows(m) {
    var b = budgetFor(m); if (!b) return [];
    var sp = byCat(inMonth(m));
    return Object.keys(b.limits).map(function (id) {
      var c = find('cats', id), s = sp[id] || 0, l = b.limits[id];
      return { cat: c, spent: s, limit: l, pct: l ? s / l * 100 : 0 };
    }).filter(function (r) { return r.cat; });
  }
  function status(pct, thr, spent, limit) {
    if (pct > 100) return { cls: 'x', badge: 'x', text: 'Превышено на ' + money(spent - limit), ic: 'alert' };
    if (pct === 100) return { cls: 'x', badge: 'x', text: 'Лимит исчерпан', ic: 'alert' };
    if (pct >= thr) return { cls: 'w', badge: 'w', text: 'Внимание', ic: 'alert' };
    return { cls: '', badge: 'ok', text: 'В норме', ic: 'check' };
  }

  /* ---------------- ИСТОРИЯ С ОТМЕНОЙ ---------------- */
  // Любое изменение проходит через commit: запись хранит состояние «было / стало», поэтому отмена универсальна.
  function put(coll, id, val) {
    var i = S[coll].findIndex(function (x) { return x.id === id; });
    if (val === null) { if (i >= 0) S[coll].splice(i, 1); } else if (i >= 0) S[coll][i] = val; else S[coll].unshift(val);
  }
  function commit(coll, id, after, text, kind) {
    var cur = find(coll, id), before = cur ? JSON.parse(JSON.stringify(cur)) : null;
    put(coll, id, after);
    var e = { id: uid('l'), ts: new Date().toISOString(), kind: kind, text: text, coll: coll, item: id, before: before, after: after ? JSON.parse(JSON.stringify(after)) : null };
    S.log.unshift(e); S.log = S.log.slice(0, 500); save();
    return e;
  }
  function undo(logId) {
    var e = S.log.filter(function (x) { return x.id === logId; })[0];
    if (!e || e.undone || e.locked) return;
    put(e.coll, e.item, e.before); e.undone = true;
    S.log.unshift({ id: uid('l'), ts: new Date().toISOString(), kind: e.kind, text: 'Отменено: ' + e.text, locked: true });
    save();
  }

  /* ---------------- УВЕДОМЛЕНИЯ ---------------- */
  function toast(text, undoFn) {
    var box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    var t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = '<span class="grow">' + esc(text) + '</span>' + (undoFn ? '<button type="button">Отменить</button><div class="t"></div>' : '');
    box.appendChild(t);
    var timer = setTimeout(function () { t.remove(); }, undoFn ? 5000 : 3500);
    if (undoFn) t.querySelector('button').onclick = function () { clearTimeout(timer); t.remove(); undoFn(); };
  }

  /* ---------------- МОДАЛЬНЫЕ ОКНА ---------------- */
  function modal(title, body, opts) {
    opts = opts || {};
    var ov = document.createElement('div'); ov.className = 'ov';
    ov.innerHTML = '<div class="dlg ' + (opts.wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="row between"><h2>' + esc(title) + '</h2><button class="btn ghost icon sm" data-x aria-label="Закрыть">' + icon('close') + '</button></div>' +
      '<div class="stack" data-body>' + body + '</div></div>';
    var prev = document.activeElement;
    function close() { ov.remove(); document.removeEventListener('keydown', key); if (prev && prev.focus) prev.focus(); }
    function key(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = ov.querySelectorAll('button,input,select,textarea,a[href]'), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    }
    document.addEventListener('keydown', key);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    ov.querySelector('[data-x]').onclick = close;
    document.body.appendChild(ov);
    var api = { el: ov, body: ov.querySelector('[data-body]'), close: close };
    if (opts.mount) opts.mount(api);
    var first = ov.querySelector('[data-body] input,[data-body] select,[data-body] button');
    if (first) first.focus();
    return api;
  }
  function confirmBox(title, text, yes, fn) {
    modal(title, '<p class="small muted">' + esc(text) + '</p><div class="ft"><button class="btn sec" data-no>Отмена</button><button class="btn danger" data-yes>' + esc(yes) + '</button></div>', {
      mount: function (m) { m.el.querySelector('[data-no]').onclick = m.close; m.el.querySelector('[data-yes]').onclick = function () { m.close(); fn(); }; }
    });
  }

  /* ---------------- ФОРМА ОПЕРАЦИИ ---------------- */
  function catChoices(kind) { return S.cats.filter(function (c) { return c.kind === kind; }); }
  function txForm(tx) {
    var t = tx ? JSON.parse(JSON.stringify(tx)) : { type: 'expense', amount: '', cat: 'food', account: S.accounts[0] ? S.accounts[0].id : '', date: defaultDate(), note: '' };
    if (!S.accounts.length) { toast('Сначала создайте счёт'); return; }
    function html() {
      var opts = S.accounts.map(function (a) { return '<option value="' + a.id + '"' + (a.id === t.account ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join('');
      var cats = t.type === 'transfer' ? '' : '<div><div class="small" style="font-weight:500;margin-bottom:4px">Категория</div><div class="cats">' + catChoices(t.type).map(function (c) {
        return '<button type="button" class="cat ' + (c.id === t.cat ? 'on' : '') + '" data-cat="' + c.id + '">' + icon(c.icon) + '<span>' + esc(c.name) + '</span></button>';
      }).join('') + '</div></div>';
      var to = t.type === 'transfer' ? '<label class="f">На счёт<select data-to>' + S.accounts.filter(function (a) { return a.id !== t.account; }).map(function (a) { return '<option value="' + a.id + '"' + (a.id === t.to ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join('') + '</select></label>' : '';
      return '<div class="seg" role="tablist">' + [['expense', 'Расход'], ['income', 'Доход'], ['transfer', 'Перевод']].map(function (x) { return '<button type="button" data-type="' + x[0] + '" class="' + (x[0] === t.type ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<label class="f">Сумма<input type="text" inputmode="decimal" data-amount value="' + esc(t.amount) + '" placeholder="0"><span class="err" data-err></span></label>' + cats +
        '<div class="row wrap"><label class="f grow">Счёт<select data-acc>' + opts + '</select></label><label class="f grow">Дата<input type="date" data-date value="' + esc(t.date) + '"></label></div>' + to +
        '<label class="f">Комментарий<input type="text" data-note maxlength="80" value="' + esc(t.note) + '"></label>' +
        (t.type !== 'transfer' && adv() ? '<label class="check"><input type="checkbox" data-rec ' + (t.recurring ? 'checked' : '') + '>Повторять каждый месяц</label>' : '') +
        '<div class="ft">' + (tx ? '<button class="btn sec" data-del style="margin-right:auto">' + icon('trash') + 'Удалить</button>' : '') + '<button class="btn sec" data-no>Отмена</button><button class="btn" data-ok>Сохранить</button></div>';
    }
    function read(m) {
      var q = function (s) { return m.el.querySelector(s); };
      t.amount = q('[data-amount]').value; t.account = q('[data-acc]').value; t.date = q('[data-date]').value; t.note = q('[data-note]').value;
      if (q('[data-to]')) t.to = q('[data-to]').value;
      if (q('[data-rec]')) t.recurring = q('[data-rec]').checked;
    }
    function bind(m) {
      m.body.innerHTML = html();
      m.el.querySelectorAll('[data-type]').forEach(function (b) { b.onclick = function () { read(m); t.type = b.dataset.type; var c = catChoices(t.type); if (c.length && t.type !== 'transfer' && !c.some(function (x) { return x.id === t.cat; })) t.cat = c[0].id; bind(m); }; });
      m.el.querySelectorAll('[data-cat]').forEach(function (b) { b.onclick = function () { read(m); t.cat = b.dataset.cat; bind(m); }; });
      m.el.querySelector('[data-acc]').onchange = function () { read(m); bind(m); };
      m.el.querySelector('[data-no]').onclick = m.close;
      var del = m.el.querySelector('[data-del]');
      if (del) del.onclick = function () { m.close(); removeTx(tx.id); };
      m.el.querySelector('[data-ok]').onclick = function () {
        read(m);
        var n = parseFloat(String(t.amount).replace(/\s/g, '').replace(',', '.')), a = m.el.querySelector('[data-amount]');
        if (!(n > 0)) { a.classList.add('invalid'); a.setAttribute('aria-invalid', 'true'); m.el.querySelector('[data-err]').textContent = 'Введите сумму больше нуля'; a.focus(); return; }
        if (t.type === 'transfer' && (!t.to || t.to === t.account)) { m.el.querySelector('[data-err]').textContent = 'Для перевода нужен второй счёт'; return; }
        if (!t.date) { m.el.querySelector('[data-err]').textContent = 'Укажите дату'; return; }
        t.amount = n;
        var isNew = !tx; if (isNew) t.id = uid('tx');
        var label = (t.note || (t.type === 'transfer' ? 'Перевод' : find('cats', t.cat).name));
        var entry = commit('txs', t.id, t, (isNew ? 'Добавлена операция «' : 'Изменена операция «') + label + '»: ' + num(n) + ' ' + SIGN[find('accounts', t.account).currency], 'tx');
        m.close(); FK.refresh();
        toast(isNew ? 'Операция сохранена' : 'Изменения сохранены', function () { undo(entry.id); FK.refresh(); });
        checkLimit(t);
      };
    }
    modal(tx ? 'Операция' : 'Новая операция', '', { mount: bind });
  }
  function checkLimit(t) {
    if (t.type !== 'expense' || !S.notif.near) return;
    var m = t.date.slice(0, 7), b = budgetFor(m); if (!b) return;
    var r = budgetRows(m).filter(function (x) { return x.cat.id === t.cat; })[0]; if (!r) return;
    if (r.pct > 100 && S.notif.over) toast('Лимит «' + r.cat.name + '» превышен: ' + Math.round(r.pct) + ' %');
    else if (r.pct >= b.threshold && r.pct <= 100) toast('«' + r.cat.name + '»: использовано ' + Math.round(r.pct) + ' % лимита');
  }
  function removeTx(id) {
    var t = find('txs', id), e = commit('txs', id, null, 'Удалена операция «' + (t.note || 'без названия') + '»: ' + num(t.amount) + ' ₽', 'tx');
    FK.refresh();
    toast('Операция удалена', function () { undo(e.id); FK.refresh(); });
  }

  /* ---------------- КАРКАС ---------------- */
  var LOGO = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#0F766E"/><circle cx="20" cy="20" r="13" stroke="#fff" stroke-width="2"/><path d="M26 14l-3.6 8.4L14 26l3.6-8.4L26 14z" fill="#fff"/></svg>';
  function shell(page, title) {
    var u = S.user || { name: 'Гость', mode: 'simple' }, admin = u.role === 'admin';
    var items = admin ? [['admin', 'Администрирование', 'shield']] : NAV;
    var navHtml = items.map(function (n) { return '<a class="nav ' + (n[0] === page ? 'on' : '') + '" href="' + n[0] + '.html" title="' + n[1] + '">' + icon(n[2]) + '<span>' + n[1] + '</span></a>'; }).join('');
    var mob = [['dashboard', 'Обзор', 'home'], ['transactions', 'Операции', 'list'], null, ['budgets', 'Бюджеты', 'wallet']];
    document.body.innerHTML = '<div class="app"><aside class="side"><a class="logo" href="dashboard.html">' + LOGO + '<span>ФинКомпас</span></a><nav aria-label="Основная навигация" style="display:contents">' + navHtml + '</nav><div class="sp"></div>' +
      '<a class="nav ' + (page === 'settings' ? 'on' : '') + '" href="settings.html" title="Настройки">' + icon('settings') + '<span>Настройки</span></a>' +
      '<div class="who"><div class="ava">' + esc(u.name.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase()) + '</div><div class="grow"><div class="small" style="font-weight:600">' + esc(u.name) + '</div><div class="cap muted">' + (admin ? 'Администратор' : u.mode === 'extended' ? 'Расширенный режим' : 'Простой режим') + '</div></div></div></aside>' +
      '<div class="main"><header class="top"><h1>' + esc(title) + '</h1>' +
      (admin ? '' : '<div class="search hide-t"><input type="search" id="q" placeholder="Поиск операций" aria-label="Поиск операций">' + icon('search') + '</div>' +
      '<button class="btn sec icon" id="priv" aria-label="Скрыть суммы" title="Скрыть суммы">' + icon(S.privacy ? 'eyeoff' : 'eye') + '</button>') +
      '<button class="btn sec icon" id="theme" aria-label="Сменить тему" title="Сменить тему">' + icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon') + '</button>' +
      (admin ? '' : '<button class="btn sec icon" id="bell" aria-label="Уведомления" title="Уведомления">' + icon('bell') + '</button><button class="btn addbtn" id="add">' + icon('plus') + '<span>Операция</span></button>') +
      '</header><main class="content" id="view"></main></div>' +
      '<nav class="mobnav" aria-label="Нижняя навигация">' + mob.map(function (n) { return n ? '<a class="' + (n[0] === page ? 'on' : '') + '" href="' + n[0] + '.html">' + icon(n[2]) + n[1] + '</a>' : '<button class="fab" id="fab" aria-label="Добавить операцию">' + icon('plus', 'lg') + '</button>'; }).join('') + '<button id="more">' + icon('menu') + 'Ещё</button></nav></div>';
    var b = function (id) { return document.getElementById(id); };
    if (b('priv')) b('priv').onclick = function () { S.privacy = !S.privacy; save(); b('priv').innerHTML = icon(S.privacy ? 'eyeoff' : 'eye'); FK.refresh(); };
    b('theme').onclick = function () { S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); b('theme').innerHTML = icon(S.theme === 'dark' ? 'sun' : 'moon'); };
    if (b('add')) b('add').onclick = function () { txForm(); };
    if (b('fab')) b('fab').onclick = function () { txForm(); };
    if (b('bell')) b('bell').onclick = alerts;
    if (b('q')) b('q').onkeydown = function (e) { if (e.key === 'Enter') location.href = 'transactions.html?q=' + encodeURIComponent(e.target.value); };
    b('more').onclick = function () {
      modal('Ещё', '<div class="list">' + items.concat([['settings', 'Настройки', 'settings']]).filter(function (n) { return ['dashboard', 'transactions', 'budgets'].indexOf(n[0]) < 0; }).map(function (n) { return '<a href="' + n[0] + '.html" style="color:inherit;text-decoration:none">' + icon(n[2]) + n[1] + '</a>'; }).join('') + '</div>');
    };
  }
  function alerts() {
    var b = budgetFor(S.month), rows = b ? budgetRows(S.month).filter(function (r) { return r.pct >= b.threshold; }) : [];
    modal('Уведомления', rows.length ? '<div class="list">' + rows.map(function (r) { var st = status(r.pct, b.threshold, r.spent, r.limit); return '<div><span class="badge ' + st.badge + '">' + Math.round(r.pct) + ' %</span><span class="grow small">' + esc(r.cat.name) + ': ' + esc(st.text) + '</span></div>'; }).join('') + '</div>' : '<div class="empty">' + icon('check', 'lg') + 'Новых уведомлений нет</div>');
  }
  function requireUser(page) {
    if (!S.user) { location.replace('login.html'); return false; }
    if (S.user.role === 'admin' && page !== 'admin' && page !== 'settings') { location.replace('admin.html'); return false; }
    return true;
  }

  /* ---------------- ГРАФИКИ ---------------- */
  function donut(rows, centre) {
    var sum = rows.reduce(function (s, r) { return s + r.value; }, 0), off = 0, R = 70, C = 2 * Math.PI * R;
    var arcs = rows.map(function (r) {
      var len = sum ? r.value / sum * C : 0;
      var el = '<circle cx="90" cy="90" r="' + R + '" fill="none" stroke="' + r.color + '" stroke-width="22" stroke-dasharray="' + Math.max(len - 2, 0).toFixed(2) + ' ' + (C - Math.max(len - 2, 0)).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 90 90)" data-cat="' + r.id + '" style="cursor:pointer"><title>' + esc(r.label) + '</title></circle>';
      off += len; return el;
    }).join('');
    return '<svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="Расходы по категориям">' + arcs + '<text x="90" y="86" text-anchor="middle" font-size="12" fill="var(--text-2)" font-weight="500">расходы</text><text x="90" y="106" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text-1)">' + esc(centre) + '</text></svg>';
  }
  function bars(rows) { // rows: {label, a, b}
    var W = 640, H = 240, max = Math.max.apply(null, rows.map(function (r) { return Math.max(r.a, r.b); }).concat([1])), gw = W / rows.length;
    var out = rows.map(function (r, i) {
      var x = i * gw + gw / 2, ha = r.a / max * (H - 44), hb = r.b / max * (H - 44);
      return '<rect x="' + (x - 34) + '" y="' + (H - 24 - ha) + '" width="32" height="' + ha + '" rx="4" fill="var(--income)"><title>Доходы: ' + num(r.a) + ' ₽</title></rect>' +
        '<rect x="' + (x + 2) + '" y="' + (H - 24 - hb) + '" width="32" height="' + hb + '" rx="4" fill="var(--expense)"><title>Расходы: ' + num(r.b) + ' ₽</title></rect>' +
        '<text x="' + x + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12" fill="var(--text-2)">' + esc(r.label) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto" role="img" aria-label="Доходы и расходы по месяцам">' + out + '</svg>';
  }
  function line(rows) { // rows: {label, value}
    var W = 640, H = 240, vals = rows.map(function (r) { return r.value; }), max = Math.max.apply(null, vals), min = Math.min.apply(null, vals), span = (max - min) || 1, n = rows.length;
    var pts = rows.map(function (r, i) { return [40 + i * (W - 80) / Math.max(n - 1, 1), 16 + (1 - (r.value - min) / span) * (H - 60)]; });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto" role="img" aria-label="Динамика баланса"><polyline fill="none" stroke="var(--accent)" stroke-width="3" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>' +
      pts.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="var(--accent)"><title>' + num(rows[i].value) + ' ₽</title></circle><text x="' + p[0] + '" y="' + (H - 6) + '" text-anchor="middle" font-size="12" fill="var(--text-2)">' + esc(rows[i].label) + '</text>'; }).join('') + '</svg>';
  }

  /* ---------------- ЭКСПОРТ ФАЙЛОВ ---------------- */
  function download(name, data, type) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: type })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function cellSafe(v) { var s = String(v == null ? '' : v); return /^[=+\-@]/.test(s) ? "'" + s : s; } // защита от формул при открытии в таблице
  function toCSV(rows) {
    return '﻿' + rows.map(function (r) {
      return r.map(function (v) { if (typeof v === 'number') return String(v).replace('.', ','); var s = cellSafe(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';');
    }).join('\r\n');
  }
  // Минимальный XLSX: ZIP без сжатия с одним листом
  function crc32(b) {
    var c, t = crc32.t;
    if (!t) { t = crc32.t = []; for (var n = 0; n < 256; n++) { c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } }
    c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function zip(files) {
    var enc = new TextEncoder(), chunks = [], central = [], off = 0;
    function u16(n) { return [n & 255, n >>> 8 & 255]; } function u32(n) { return [n & 255, n >>> 8 & 255, n >>> 16 & 255, n >>> 24 & 255]; }
    files.forEach(function (f) {
      var name = enc.encode(f[0]), data = enc.encode(f[1]), crc = crc32(data);
      var head = [].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      var local = new Uint8Array([0x50, 0x4B, 3, 4].concat(head));
      chunks.push(local, name, data);
      central.push(new Uint8Array([0x50, 0x4B, 1, 2, 20, 0].concat(head, u16(0), u16(0), u16(0), u32(0), u32(off))), name);
      off += local.length + name.length + data.length;
    });
    var cs = central.reduce(function (s, c) { return s + c.length; }, 0);
    var end = new Uint8Array([0x50, 0x4B, 5, 6, 0, 0, 0, 0].concat(u16(files.length), u16(files.length), u32(cs), u32(off), u16(0)));
    return new Blob(chunks.concat(central, [end]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  function toXLSX(rows) {
    function x(s) { return esc(s).replace(/&#39;/g, '&apos;'); }
    var sheet = rows.map(function (r, i) {
      return '<row r="' + (i + 1) + '">' + r.map(function (v) { return typeof v === 'number' ? '<c><v>' + v + '</v></c>' : '<c t="inlineStr"><is><t>' + x(v) + '</t></is></c>'; }).join('') + '</row>';
    }).join('');
    return zip([
      ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
      ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Отчёт" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
      ['xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + sheet + '</sheetData></worksheet>']
    ]);
  }

  w.FK = {
    get S() { return S; }, COLORS: COLORS, SIGN: SIGN, RATES: RATES, LOGO: LOGO, MONTHS: MONTHS,
    save: save, reset: reset, uid: uid, esc: esc, icon: icon, num: num, money: money, signed: signed,
    dateRu: dateRu, monthRu: monthRu, shiftMonth: shiftMonth, today: today, find: find, adv: adv,
    rub: rub, balance: balance, total: total, inMonth: inMonth, sumType: sumType, byCat: byCat,
    budgetFor: budgetFor, budgetRows: budgetRows, status: status, commit: commit, undo: undo,
    toast: toast, modal: modal, confirmBox: confirmBox, txForm: txForm, removeTx: removeTx,
    shell: shell, requireUser: requireUser, applyTheme: applyTheme,
    donut: donut, bars: bars, line: line, download: download, toCSV: toCSV, toXLSX: toXLSX,
    refresh: function () {}
  };
})(window);
