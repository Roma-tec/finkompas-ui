/* ==========================================================================
   ФинКомпас — страницы приложения
   ========================================================================== */
(function () {
  'use strict';
  var F = window.FK, S = F.S, esc = F.esc, ic = F.icon, money = F.money, signed = F.signed;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var view = function () { return $('#view'); };
  var ACC_ICONS = { card: 'card', save: 'piggy', cash: 'cash', credit: 'bank' };
  var ACC_KINDS = { card: 'Карта', cash: 'Наличные', save: 'Накопительный', credit: 'Кредит' };
  var ICONS = ['food', 'house', 'cafe', 'bus', 'film', 'health', 'book', 'box', 'salary', 'gift', 'phone', 'plane', 'card', 'target'];

  function catIc(c) { return '<span class="ic" style="background:' + esc(c ? c.color : '#52606D') + '">' + ic(c ? c.icon : 'swap') + '</span>'; }
  function txLine(t) {
    var c = F.find('cats', t.cat), a = F.find('accounts', t.account), name = t.type === 'transfer' ? 'Перевод' : c ? c.name : 'Без категории';
    var val = t.type === 'transfer' ? money(t.amount, a && a.currency) : signed(t.type === 'income' ? t.amount : -t.amount, a && a.currency);
    return { c: t.type === 'transfer' ? null : c, name: name, val: val, cls: t.type === 'income' ? 'inc' : t.type === 'expense' ? 'exp' : '' };
  }
  function monthSwitch() {
    return '<div class="row"><button class="btn sec icon sm" data-m="-1" aria-label="Предыдущий месяц">' + ic('left') + '</button><strong style="min-width:150px;text-align:center">' + F.monthRu(S.month) + '</strong><button class="btn sec icon sm" data-m="1" aria-label="Следующий месяц">' + ic('right') + '</button></div>';
  }
  function bindMonth(fn) { $$('[data-m]').forEach(function (b) { b.onclick = function () { S.month = F.shiftMonth(S.month, +b.dataset.m); F.save(); fn(); }; }); }
  function field(label, html) { return '<label class="f">' + label + html + '</label>'; }

  /* ---------------- ВХОД ---------------- */
  function login() {
    var mode = 'in', errors = {};
    function render() {
      document.body.innerHTML = '<div class="auth"><section class="hero"><a class="logo" href="index.html">' + F.LOGO + '<span>ФинКомпас</span></a><div class="stack"><h2>Деньги под контролем</h2><p style="max-width:440px">Учёт доходов и расходов, бюджеты, цели и понятные отчёты в одном спокойном интерфейсе.</p></div><p class="small">Учебный проект. Данные хранятся только в этом браузере.</p></section>' +
        '<section class="form"><form class="box" novalidate><a class="logo mlogo" href="index.html">' + F.LOGO + '<span>ФинКомпас</span></a><h1>' + (mode === 'in' ? 'С возвращением' : 'Создайте аккаунт') + '</h1>' +
        '<div class="seg" style="display:flex"><button type="button" data-t="in" style="flex:1" class="' + (mode === 'in' ? 'on' : '') + '">Вход</button><button type="button" data-t="up" style="flex:1" class="' + (mode === 'up' ? 'on' : '') + '">Регистрация</button></div>' +
        (mode === 'up' ? field('Имя', '<input type="text" id="name" autocomplete="name"><span class="err" data-e="name"></span>') : '') +
        field('Email', '<input type="email" id="email" autocomplete="email" placeholder="you@example.com"><span class="err" data-e="email"></span>') +
        field('Пароль', '<div style="position:relative"><input type="password" id="pass" autocomplete="' + (mode === 'in' ? 'current-password' : 'new-password') + '"><button type="button" class="btn ghost icon sm" id="show" aria-label="Показать пароль" style="position:absolute;right:4px;top:4px">' + ic('eye') + '</button></div><span class="err" data-e="pass"></span>') +
        (mode === 'up' ? '<div class="strength"><i id="st"></i></div><div class="cap muted" id="stt">Минимум 8 символов</div><label class="check"><input type="checkbox" id="terms">Принимаю условия обработки персональных данных</label><span class="err" data-e="terms"></span>' : '<div class="row between"><label class="check"><input type="checkbox" id="rem">Запомнить устройство</label><a href="#" id="forgot" class="small">Забыли пароль?</a></div>') +
        '<button class="btn" type="submit">' + (mode === 'in' ? 'Войти' : 'Создать аккаунт') + '</button>' +
        '<button class="btn sec" type="button" id="demo">Открыть демо с данными</button><button class="btn ghost" type="button" id="adm">Войти как администратор</button>' +
        '<p class="cap muted">Демо-версия: пароль никуда не отправляется и не сохраняется.</p></form></section></div>';
      $$('[data-t]').forEach(function (b) { b.onclick = function () { mode = b.dataset.t; errors = {}; render(); }; });
      $('#show').onclick = function () { var p = $('#pass'); p.type = p.type === 'password' ? 'text' : 'password'; };
      if ($('#forgot')) $('#forgot').onclick = function (e) {
        e.preventDefault();
        F.modal('Восстановление пароля', field('Email', '<input type="email" id="fe"><span class="err" id="fer"></span>') + '<div class="ft"><button class="btn" id="fs">Отправить ссылку</button></div>', {
          mount: function (m) { $('#fs', m.el).onclick = function () { if (!/^\S+@\S+\.\S+$/.test($('#fe', m.el).value)) { $('#fer', m.el).textContent = 'Проверьте формат email'; return; } m.close(); F.toast('Если такой аккаунт есть, письмо уже в пути'); }; }
        });
      };
      if ($('#pass') && mode === 'up') $('#pass').oninput = function () {
        var v = this.value, s = (v.length >= 8) + /[A-ZА-Я]/.test(v) + /\d/.test(v) + /[^\wА-Яа-я]/.test(v), lv = [['0', 'var(--expense)', 'Слишком короткий'], ['25%', 'var(--expense)', 'Слабый'], ['50%', 'var(--warning)', 'Средний'], ['75%', 'var(--accent)', 'Хороший'], ['100%', 'var(--income)', 'Надёжный']][s];
        $('#st').style.width = lv[0]; $('#st').style.background = lv[1]; $('#stt').textContent = lv[2];
      };
      $('#demo').onclick = function () { S.user = { name: 'Анна Смирнова', email: 'anna.demo@example.com', mode: 'extended', role: 'user', twofa: false }; F.save(); location.href = 'dashboard.html'; };
      $('#adm').onclick = function () { S.user = { name: 'Администратор', email: 'admin@example.com', mode: 'extended', role: 'admin', twofa: true }; F.save(); location.href = 'admin.html'; };
      $('form').onsubmit = function (e) {
        e.preventDefault();
        var mail = $('#email').value.trim(), p = $('#pass').value, er = {};
        $$('.err').forEach(function (x) { x.textContent = ''; });
        if (mode === 'up' && !$('#name').value.trim()) er.name = 'Введите имя';
        if (!/^\S+@\S+\.\S+$/.test(mail)) er.email = 'Проверьте формат email';
        if (p.length < 8) er.pass = mode === 'in' ? 'Неверный email или пароль' : 'Минимум 8 символов';
        if (mode === 'up' && !$('#terms').checked) er.terms = 'Без согласия регистрация невозможна';
        Object.keys(er).forEach(function (k) { $('[data-e=' + k + ']').textContent = er[k]; });
        if (Object.keys(er).length) return;
        if (mode === 'in') { S.user = { name: mail.split('@')[0], email: mail, mode: 'extended', role: 'user', twofa: false }; F.save(); location.href = 'dashboard.html'; return; }
        verify($('#name').value.trim(), mail);
      };
    }
    function verify(name, mail) {
      F.modal('Подтвердите email', '<p class="small muted">Код отправлен на ' + esc(mail) + '. В демо подойдут любые 6 цифр.</p>' + field('Код', '<input type="text" inputmode="numeric" maxlength="6" id="code"><span class="err" id="ce"></span>') + '<div class="ft"><button class="btn" id="cok">Подтвердить</button></div>', {
        mount: function (m) { $('#cok', m.el).onclick = function () { if (!/^\d{6}$/.test($('#code', m.el).value)) { $('#ce', m.el).textContent = 'Введите 6 цифр'; return; } m.close(); onboarding(name, mail); }; }
      });
    }
    function onboarding(name, mail) {
      F.modal('Первичная настройка', field('Основная валюта', '<select id="ob-c"><option value="RUB">Рубль, ₽</option><option value="USD">Доллар, $</option><option value="EUR">Евро, €</option></select>') +
        field('Режим', '<select id="ob-m"><option value="simple">Простой: только основное</option><option value="extended">Расширенный: все функции</option></select>') +
        field('Название первого счёта', '<input type="text" id="ob-a" value="Основная карта">') + field('Текущий остаток', '<input type="text" inputmode="decimal" id="ob-b" value="0">') + '<div class="ft"><button class="btn" id="ob-ok">Начать</button></div>', {
        mount: function (m) {
          $('#ob-ok', m.el).onclick = function () {
            var cur = $('#ob-c', m.el).value;
            S.user = { name: name, email: mail, mode: $('#ob-m', m.el).value, role: 'user', twofa: false };
            S.txs = []; S.budgets = []; S.goals = []; S.log = []; S.month = F.today().slice(0, 7); S.currency = cur;
            S.accounts = [{ id: 'a1', name: $('#ob-a', m.el).value || 'Счёт', kind: 'card', currency: cur, color: F.COLORS[0], inTotal: true, opening: parseFloat(String($('#ob-b', m.el).value).replace(',', '.').replace(/\s/g, '')) || 0 }];
            F.save(); location.href = 'dashboard.html';
          };
        }
      });
    }
    render();
  }

  /* ---------------- ОБЗОР ---------------- */
  function dashboard() {
    var list = F.inMonth(S.month), inc = F.sumType(list, 'income'), exp = F.sumType(list, 'expense'), b = F.budgetFor(S.month);
    var rows = F.budgetRows(S.month), limit = rows.reduce(function (s, r) { return s + r.limit; }, 0), spent = rows.reduce(function (s, r) { return s + r.spent; }, 0);
    var cat = F.byCat(list), slices = Object.keys(cat).map(function (id) { var c = F.find('cats', id); return { id: id, value: cat[id], color: c ? c.color : '#52606D', label: (c ? c.name : 'Без категории') + ': ' + F.num(cat[id]) + ' ₽', name: c ? c.name : 'Без категории' }; }).sort(function (x, y) { return y.value - x.value; });
    var last = S.txs.slice().sort(function (x, y) { return y.date.localeCompare(x.date); }).slice(0, 5), g = S.goals[0];
    if (!S.txs.length) {
      view().innerHTML = '<div class="card"><div class="empty">' + ic('wallet', 'lg') + '<h2>Здесь появится ваша финансовая картина</h2><p class="small">Добавьте первую операцию, и обзор оживёт.</p><button class="btn" id="first">Добавить первую операцию</button></div></div>';
      $('#first').onclick = function () { F.txForm(); }; return;
    }
    var top = rows.slice().sort(function (x, y) { return y.pct - x.pct; }).slice(0, 3);
    view().innerHTML = '<div class="row between wrap">' + monthSwitch() + '</div><div class="grid">' +
      '<section class="card c4"><div class="muted small">Общий баланс</div><div class="big" id="total">' + money(F.total()) + '</div><div class="list small" style="margin-top:8px">' + S.accounts.map(function (a) { return '<div style="padding:4px 0;border:0"><span class="grow muted">' + esc(a.name) + '</span><span>' + money(F.balance(a), a.currency) + '</span></div>'; }).join('') + '</div></section>' +
      '<section class="card c4"><div class="muted small">' + F.monthRu(S.month) + '</div><div class="big ' + (inc - exp >= 0 ? 'inc' : 'exp') + '">' + signed(inc - exp) + '</div><div class="stack small" style="gap:4px;margin-top:8px"><div class="row between"><span class="muted">Доходы</span><span class="inc">' + signed(inc) + '</span></div><div class="row between"><span class="muted">Расходы</span><span class="exp">' + signed(-exp) + '</span></div></div></section>' +
      '<section class="card c4"><div class="muted small">Осталось по бюджету</div>' + (b ? '<div class="big">' + money(limit - spent) + '</div><div class="small muted" style="margin:4px 0 8px">из ' + money(limit) + ', использовано ' + F.num(Math.round(spent / limit * 1000) / 10) + ' %</div><div class="bar ' + (spent > limit ? 'x' : spent / limit * 100 >= b.threshold ? 'w' : '') + '"><i style="width:' + Math.min(spent / limit * 100, 100) + '%"></i></div>' : '<div class="empty" style="padding:12px"><a class="btn sec sm" href="budgets.html">Создать бюджет</a></div>') + '</section>' +
      '<section class="card c8"><div class="hd"><h2>Расходы по категориям</h2></div>' + (slices.length ? '<div class="row wrap" style="gap:32px">' + F.donut(slices, money(exp)) + '<div class="list small grow" style="min-width:220px">' + slices.map(function (s) { return '<div style="padding:6px 0;cursor:pointer" data-cat="' + s.id + '"><i style="width:12px;height:12px;border-radius:3px;background:' + s.color + ';flex:none"></i><span class="grow">' + esc(s.name) + '</span><span>' + money(s.value) + '</span></div>'; }).join('') + '</div></div>' : '<div class="empty">Расходов за месяц нет</div>') + '</section>' +
      '<section class="card c4"><div class="hd"><h2>Бюджеты</h2><a class="small" href="budgets.html">Все бюджеты</a></div><div class="stack">' + (top.length ? top.map(function (r) { var st = F.status(r.pct, b.threshold, r.spent, r.limit); return '<div><div class="row between small"><span>' + esc(r.cat.name) + '</span><span class="badge ' + st.badge + '">' + Math.round(r.pct) + ' %</span></div><div class="bar ' + st.cls + '" style="margin-top:6px"><i style="width:' + Math.min(r.pct, 100) + '%"></i></div></div>'; }).join('') : '<p class="small muted">Лимиты не заданы</p>') + '</div></section>' +
      '<section class="card c8"><div class="hd"><h2>Последние операции</h2><a class="small" href="transactions.html">Все операции</a></div><div class="list small">' + last.map(function (t) { var l = txLine(t); return '<div data-tx="' + t.id + '" style="cursor:pointer">' + catIc(l.c) + '<div class="grow"><div style="font-weight:500">' + esc(t.note || l.name) + '</div><div class="cap muted">' + esc(l.name) + ' · ' + F.dateRu(t.date) + '</div></div><strong class="' + l.cls + '">' + l.val + '</strong></div>'; }).join('') + '</div></section>' +
      '<section class="card c4"><div class="hd"><h2>Цель</h2><a class="small" href="goals.html">Все цели</a></div>' + (g ? '<div class="row">' + '<span class="ic" style="background:var(--accent);color:var(--on-accent)">' + ic(g.icon) + '</span><strong>' + esc(g.name) + '</strong></div><div class="big" style="margin-top:12px">' + Math.round(g.saved / g.target * 100) + ' %</div><div class="small muted" style="margin-bottom:8px">' + money(g.saved) + ' из ' + money(g.target) + '</div><div class="bar"><i style="width:' + Math.min(g.saved / g.target * 100, 100) + '%"></i></div>' : '<a class="btn sec sm" href="goals.html">Создать цель</a>') + '</section></div>';
    bindMonth(dashboard);
    $$('[data-tx]').forEach(function (r) { r.onclick = function () { F.txForm(F.find('txs', r.dataset.tx)); }; });
    $$('[data-cat]').forEach(function (r) { r.onclick = function () { location.href = 'transactions.html?cat=' + r.dataset.cat + '&month=' + S.month; }; });
  }

  /* ---------------- ОПЕРАЦИИ ---------------- */
  var fl = { month: 'cur', acc: '', cat: '', type: '', q: '', sort: 'date', dir: -1 };
  function transactions() {
    var qs = new URLSearchParams(location.search);
    if (qs.get('q') !== null) { fl.q = qs.get('q'); fl.month = 'all'; }
    if (qs.get('cat')) fl.cat = qs.get('cat');
    function opt(v, t, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(t) + '</option>'; }
    var rec = S.txs.filter(function (t) { return t.recurring; }), seen = {};
    rec = rec.filter(function (t) { var k = t.note + t.amount; if (seen[k]) return false; seen[k] = 1; return true; });
    view().innerHTML = '<div class="filters"><select id="f-m" aria-label="Период">' + opt('cur', F.monthRu(S.month), fl.month) + opt('all', 'Весь период', fl.month) + '</select><select id="f-a" aria-label="Счёт">' + opt('', 'Все счета', fl.acc) + S.accounts.map(function (a) { return opt(a.id, a.name, fl.acc); }).join('') + '</select><select id="f-c" aria-label="Категория">' + opt('', 'Все категории', fl.cat) + S.cats.map(function (c) { return opt(c.id, c.name, fl.cat); }).join('') + '</select><select id="f-t" aria-label="Тип">' + opt('', 'Все типы', fl.type) + opt('expense', 'Расходы', fl.type) + opt('income', 'Доходы', fl.type) + opt('transfer', 'Переводы', fl.type) + '</select><input type="search" id="f-q" placeholder="Описание" value="' + esc(fl.q) + '" aria-label="Поиск по описанию"><button class="btn ghost" id="f-r">Сбросить</button><div class="grow"></div><button class="btn sec" id="imp">' + (F.adv() ? ic('upload') : ic('lock')) + 'Импорт</button></div><section class="card" style="padding:8px 8px 12px"><div id="tbl"></div></section>' +
      (F.adv() && rec.length ? '<section class="card"><div class="hd"><h2>Регулярные платежи</h2></div><div class="list small">' + rec.map(function (t) { return '<div>' + ic('repeat') + '<span class="grow">' + esc(t.note || 'Платёж') + ', ' + money(t.amount) + ' каждый месяц</span><button class="btn sec sm" data-rec="' + t.id + '">Добавить за ' + F.monthRu(S.month) + '</button></div>'; }).join('') + '</div></section>' : '');
    function table() {
      var list = S.txs.filter(function (t) {
        return (fl.month === 'all' || t.date.slice(0, 7) === S.month) && (!fl.acc || t.account === fl.acc) && (!fl.cat || t.cat === fl.cat) && (!fl.type || t.type === fl.type) && (!fl.q || (t.note || '').toLowerCase().indexOf(fl.q.toLowerCase()) >= 0);
      }).sort(function (a, b) { return fl.dir * (fl.sort === 'amount' ? F.rub(a) - F.rub(b) : a.date.localeCompare(b.date)); });
      if (!list.length) { $('#tbl').innerHTML = '<div class="empty">' + ic('search', 'lg') + 'Операций по этим условиям нет</div>'; return; }
      $('#tbl').innerHTML = '<table class="cards"><thead><tr><th style="width:36px" class="hide-t"><input type="checkbox" id="all" aria-label="Выбрать все"></th><th data-sort="date">Дата' + (fl.sort === 'date' ? (fl.dir > 0 ? ' ↑' : ' ↓') : '') + '</th><th>Категория</th><th>Описание</th><th class="hide-t">Счёт</th><th class="r" data-sort="amount">Сумма' + (fl.sort === 'amount' ? (fl.dir > 0 ? ' ↑' : ' ↓') : '') + '</th></tr></thead><tbody>' + list.map(function (t) {
        var l = txLine(t), a = F.find('accounts', t.account);
        return '<tr data-open="' + t.id + '"><td class="hide-t opt"><input type="checkbox" data-sel="' + t.id + '" aria-label="Выбрать операцию"></td><td class="opt">' + F.dateRu(t.date) + '</td><td><div class="row" style="gap:8px">' + catIc(l.c) + '<span>' + esc(l.name) + '</span></div></td><td class="opt">' + esc(t.note) + (t.recurring ? ' ' + ic('repeat') : '') + '</td><td class="hide-t opt">' + esc(a ? a.name : '') + '</td><td class="r"><strong class="' + l.cls + '">' + l.val + '</strong></td></tr>';
      }).join('') + '</tbody></table><div class="row between small" style="padding:12px"><span class="muted">Операций: ' + list.length + '</span><span><span class="inc">' + signed(F.sumType(list, 'income')) + '</span> &nbsp; <span class="exp">' + signed(-F.sumType(list, 'expense')) + '</span></span></div><div class="row" id="bulk" style="display:none;padding:0 12px"><span class="small grow" id="bulkn"></span><select id="bcat" style="width:200px" aria-label="Новая категория">' + S.cats.filter(function (c) { return c.kind === 'expense'; }).map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('') + '</select><button class="btn sec sm" id="bset">Изменить категорию</button><button class="btn danger sm" id="bdel">Удалить</button></div>';
      $$('[data-open]').forEach(function (r) { r.onclick = function (e) { if (e.target.tagName === 'INPUT') return; F.txForm(F.find('txs', r.dataset.open)); }; });
      $$('th[data-sort]').forEach(function (h) { h.onclick = function () { if (fl.sort === h.dataset.sort) fl.dir *= -1; else { fl.sort = h.dataset.sort; fl.dir = -1; } table(); }; });
      function sel() { return $$('[data-sel]:checked').map(function (x) { return x.dataset.sel; }); }
      function upd() { var n = sel().length; $('#bulk').style.display = n && F.adv() ? 'flex' : 'none'; $('#bulkn').textContent = 'Выбрано: ' + n; }
      $$('[data-sel]').forEach(function (c) { c.onchange = upd; });
      if ($('#all')) $('#all').onchange = function () { var v = this.checked; $$('[data-sel]').forEach(function (c) { c.checked = v; }); upd(); };
      $('#bset').onclick = function () { var c = $('#bcat').value; sel().forEach(function (id) { var t = F.find('txs', id); if (t.type === 'expense') F.commit('txs', id, Object.assign({}, t, { cat: c }), 'Изменена категория операции «' + (t.note || '') + '»', 'tx'); }); F.toast('Категория изменена'); table(); };
      $('#bdel').onclick = function () { var ids = sel(); F.confirmBox('Удалить операции?', 'Выбрано операций: ' + ids.length + '. Их можно вернуть в разделе «История».', 'Удалить', function () { ids.forEach(function (id) { var t = F.find('txs', id); F.commit('txs', id, null, 'Удалена операция «' + (t.note || '') + '»', 'tx'); }); F.toast('Операции удалены'); table(); }); };
    }
    $('#f-m').onchange = function () { fl.month = this.value; table(); };
    $('#f-a').onchange = function () { fl.acc = this.value; table(); };
    $('#f-c').onchange = function () { fl.cat = this.value; table(); };
    $('#f-t').onchange = function () { fl.type = this.value; table(); };
    $('#f-q').oninput = function () { fl.q = this.value; table(); };
    $('#f-r').onclick = function () { fl = { month: 'cur', acc: '', cat: '', type: '', q: '', sort: 'date', dir: -1 }; history.replaceState(null, '', 'transactions.html'); transactions(); };
    $('#imp').onclick = function () { if (!F.adv()) F.toast('Импорт доступен в расширенном режиме'); else importer(); };
    $$('[data-rec]').forEach(function (b) {
      b.onclick = function () {
        var t = F.find('txs', b.dataset.rec), day = t.date.slice(8), date = S.month + '-' + day;
        if (S.txs.some(function (x) { return x.date.slice(0, 7) === S.month && x.note === t.note && x.amount === t.amount; })) { F.toast('За этот месяц платёж уже есть'); return; }
        var n = Object.assign({}, t, { id: F.uid('tx'), date: date, recurring: true });
        F.commit('txs', n.id, n, 'Добавлен регулярный платёж «' + t.note + '»', 'tx'); F.toast('Платёж добавлен'); transactions();
      };
    });
    table();
  }

  function parseCSV(text) {
    var head = text.split(/\r?\n/)[0], d = (head.match(/;/g) || []).length >= (head.match(/,/g) || []).length ? ';' : ',', rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; } else if (ch === '"') q = true;
      else if (ch === d) { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r' && ch !== '﻿') cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  function parseOFX(text) {
    var out = [['Дата', 'Сумма', 'Описание']], re = /<STMTTRN>([\s\S]*?)(<\/STMTTRN>|(?=<STMTTRN>))/gi, m;
    function tag(b, t) { var x = new RegExp('<' + t + '>([^<\\r\\n]*)', 'i').exec(b); return x ? x[1].trim() : ''; }
    while ((m = re.exec(text))) { var d = tag(m[1], 'DTPOSTED'); out.push([d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8), tag(m[1], 'TRNAMT'), tag(m[1], 'NAME') || tag(m[1], 'MEMO')]); }
    return out;
  }
  function normDate(s) { s = String(s).trim(); var m = /^(\d{2})[.\/](\d{2})[.\/](\d{4})/.exec(s); if (m) return m[3] + '-' + m[2] + '-' + m[1]; return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : ''; }
  function normNum(s) { return parseFloat(String(s).replace(/[\s ₽]/g, '').replace('−', '-').replace(',', '.')); }
  function guessCat(note) {
    var n = note.toLowerCase(), map = [[/супер|магазин|продукт|пятёроч|перекрёст|рынок/, 'food'], [/кафе|кофе|ресторан|обед|пицц/, 'cafe'], [/метро|такси|проезд|автобус/, 'bus'], [/аренд|жкх|квартир/, 'house'], [/кино|концерт|театр/, 'fun'], [/аптек|клиник|врач/, 'health']];
    for (var i = 0; i < map.length; i++) if (map[i][0].test(n)) return map[i][1];
    return 'other';
  }
  function importer() {
    var rows = null, map = { date: 0, amount: 1, note: 2 }, acc = S.accounts[0].id;
    F.modal('Импорт выписки', '', {
      wide: true, mount: function (m) {
        function step1() {
          m.body.innerHTML = '<p class="small muted">Шаг 1 из 4. Выберите файл CSV или OFX. Файл обрабатывается только в браузере.</p><input type="file" id="file" accept=".csv,.ofx,.txt" aria-label="Файл выписки"><span class="err" id="ferr"></span>';
          $('#file', m.el).onchange = function () {
            var f = this.files[0]; if (!f) return;
            var r = new FileReader();
            r.onload = function () { var t = String(r.result); rows = /<OFX>|<STMTTRN>/i.test(t) ? parseOFX(t) : parseCSV(t); if (rows.length < 2) { $('#ferr', m.el).textContent = 'В файле не найдены операции'; return; } step2(); };
            r.readAsText(f, 'utf-8');
          };
        }
        function step2() {
          m.body.innerHTML = '<p class="small muted">Шаг 2 из 4. На какой счёт загрузить операции?</p><label class="f">Счёт<select id="ia">' + S.accounts.map(function (a) { return '<option value="' + a.id + '">' + esc(a.name) + '</option>'; }).join('') + '</select></label><div class="ft"><button class="btn" id="n2">Далее</button></div>';
          $('#n2', m.el).onclick = function () { acc = $('#ia', m.el).value; step3(); };
        }
        function step3() {
          var cols = rows[0].map(function (c, i) { return '<option value="' + i + '">' + esc(c || 'Колонка ' + (i + 1)) + '</option>'; }).join('');
          m.body.innerHTML = '<p class="small muted">Шаг 3 из 4. Сопоставьте колонки файла с полями.</p>' + [['date', 'Дата'], ['amount', 'Сумма'], ['note', 'Описание']].map(function (x) { return '<label class="f">' + x[1] + '<select data-col="' + x[0] + '">' + cols + '</select></label>'; }).join('') + '<div class="ft"><button class="btn" id="n3">Далее</button></div>';
          $$('[data-col]', m.el).forEach(function (s, i) { var h = rows[0].map(function (c) { return c.toLowerCase(); }), k = [/дат|date/, /сумм|amount/, /опис|назнач|note|desc/][i], at = h.findIndex(function (c) { return k.test(c); }); s.value = at >= 0 ? at : Math.min(i, rows[0].length - 1); });
          $('#n3', m.el).onclick = function () { $$('[data-col]', m.el).forEach(function (s) { map[s.dataset.col] = +s.value; }); step4(); };
        }
        function step4() {
          var items = rows.slice(1).map(function (r) {
            var d = normDate(r[map.date]), n = normNum(r[map.amount]), note = String(r[map.note] || '').trim();
            var dup = S.txs.some(function (t) { return t.account === acc && t.date === d && t.amount === Math.abs(n); });
            return { date: d, n: n, note: note, dup: dup, bad: !d || !isFinite(n) || n === 0, cat: n > 0 ? 'side' : guessCat(note) };
          });
          m.body.innerHTML = '<p class="small muted">Шаг 4 из 4. Проверьте операции. Вероятные дубликаты не будут загружены.</p><div style="max-height:320px;overflow:auto"><table><thead><tr><th>Дата</th><th>Описание</th><th>Категория</th><th class="r">Сумма</th><th>Статус</th></tr></thead><tbody>' + items.map(function (x) {
            var c = F.find('cats', x.cat);
            return '<tr><td>' + esc(x.date || '—') + '</td><td>' + esc(x.note) + '</td><td>' + esc(c ? c.name : 'Прочее') + '</td><td class="r">' + (isFinite(x.n) ? signed(x.n) : '—') + '</td><td>' + (x.bad ? '<span class="badge x">Ошибка</span>' : x.dup ? '<span class="badge w">Дубликат</span>' : '<span class="badge ok">Новая</span>') + '</td></tr>';
          }).join('') + '</tbody></table></div><div class="ft"><button class="btn sec" id="back">Назад</button><button class="btn" id="go">Импортировать</button></div>';
          $('#back', m.el).onclick = step3;
          $('#go', m.el).onclick = function () {
            var ok = items.filter(function (x) { return !x.bad && !x.dup; });
            ok.forEach(function (x) { var t = { id: F.uid('tx'), date: x.date, type: x.n > 0 ? 'income' : 'expense', amount: Math.abs(x.n), cat: x.cat, account: acc, note: x.note }; S.txs.unshift(t); });
            S.log.unshift({ id: F.uid('l'), ts: new Date().toISOString(), kind: 'tx', text: 'Импорт выписки: добавлено ' + ok.length + ', пропущено ' + (items.length - ok.length), locked: true });
            F.save(); m.close(); F.toast('Добавлено ' + ok.length + ', пропущено ' + (items.length - ok.length)); F.refresh();
          };
        }
        step1();
      }
    });
  }

  /* ---------------- БЮДЖЕТЫ ---------------- */
  function budgets() {
    var b = F.budgetFor(S.month), rows = F.budgetRows(S.month).sort(function (x, y) { return y.spent - x.spent; });
    var spent = rows.reduce(function (s, r) { return s + r.spent; }, 0), limit = rows.reduce(function (s, r) { return s + r.limit; }, 0);
    var head = '<div class="row between wrap">' + monthSwitch() + '<button class="btn" id="cfg">' + ic(b ? 'edit' : 'plus') + (b ? 'Настроить бюджет' : 'Создать бюджет') + '</button></div>';
    if (!b) {
      view().innerHTML = head + '<div class="card"><div class="empty">' + ic('wallet', 'lg') + '<h2>Бюджета на этот месяц нет</h2><p class="small">Задайте лимиты сами или <a href="templates.html">возьмите готовый шаблон</a>.</p></div></div>';
    } else if (!F.adv()) {
      var p = limit ? spent / limit * 100 : 0, st0 = F.status(p, b.threshold, spent, limit);
      view().innerHTML = head + '<section class="card"><div class="row between"><div><div class="muted small">Общий бюджет</div><div class="big">' + money(spent) + ' из ' + money(limit) + '</div></div><span class="badge ' + st0.badge + '">' + esc(st0.text) + '</span></div><div class="bar ' + st0.cls + '" style="margin-top:12px"><i style="width:' + Math.min(p, 100) + '%"></i></div></section>';
    } else {
      view().innerHTML = head + '<section class="card"><div class="row between wrap"><div><div class="muted small">Потрачено</div><div class="big">' + money(spent) + ' из ' + money(limit) + '</div></div><div><div class="muted small">Остаток</div><div class="big ' + (limit - spent < 0 ? 'exp' : '') + '">' + money(limit - spent) + '</div></div></div><div class="bar ' + (spent > limit ? 'x' : spent / limit * 100 >= b.threshold ? 'w' : '') + '" style="margin-top:12px"><i style="width:' + Math.min(spent / limit * 100, 100) + '%"></i></div></section><section class="card" style="padding:8px 20px"><div class="list">' + rows.map(function (r) {
        var st = F.status(r.pct, b.threshold, r.spent, r.limit);
        return '<div data-open="' + r.cat.id + '" style="cursor:pointer;flex-wrap:wrap">' + catIc(r.cat) + '<div class="grow" style="min-width:200px"><div class="row between small"><strong>' + esc(r.cat.name) + '</strong><span>' + money(r.spent) + ' из ' + money(r.limit) + '</span></div><div class="bar ' + st.cls + '" style="margin-top:6px"><i style="width:' + Math.min(r.pct, 100) + '%"></i></div></div><span class="small" style="width:44px;text-align:right">' + Math.round(r.pct) + ' %</span><span class="badge ' + st.badge + '" style="min-width:150px;justify-content:center">' + ic(st.ic) + esc(st.text) + '</span></div>';
      }).join('') + '</div></section>';
    }
    bindMonth(budgets);
    $('#cfg').onclick = budgetForm;
    $$('[data-open]').forEach(function (r) { r.onclick = function () { location.href = 'transactions.html?cat=' + r.dataset.open; }; });
  }
  function avg3(id) {
    var s = 0; for (var i = 1; i <= 3; i++) s += F.byCat(F.inMonth(F.shiftMonth(S.month, -i)))[id] || 0;
    return Math.round(s / 3);
  }
  function budgetForm() {
    var b = F.budgetFor(S.month), cats = S.cats.filter(function (c) { return c.kind === 'expense'; }), simple = !F.adv();
    var total = b ? Object.keys(b.limits).reduce(function (s, k) { return s + b.limits[k]; }, 0) : 0;
    var body = (simple ? field('Общий лимит на месяц', '<input type="text" inputmode="decimal" id="tot" value="' + (total || '') + '">') : cats.map(function (c) {
      var hint = avg3(c.id);
      return '<div class="row"><div class="grow"><div class="small" style="font-weight:500">' + esc(c.name) + '</div><div class="cap muted">' + (hint ? 'В среднем за 3 месяца: ' + money(hint) : 'Истории нет') + '</div></div><input type="text" inputmode="decimal" data-l="' + c.id + '" style="width:140px" value="' + (b && b.limits[c.id] || '') + '" aria-label="Лимит: ' + esc(c.name) + '"></div>';
    }).join('')) +
      '<label class="f">Порог уведомления: <span id="thv">' + (b ? b.threshold : 80) + ' %</span><input type="range" id="th" min="50" max="100" step="5" value="' + (b ? b.threshold : 80) + '" style="accent-color:var(--accent)"></label>' +
      (simple ? '' : '<label class="switch">Переносить остаток на следующий месяц<input type="checkbox" id="roll" ' + (b && b.rollover ? 'checked' : '') + '></label>') +
      '<div class="ft"><button class="btn sec" data-no>Отмена</button><button class="btn" id="ok">Сохранить бюджет</button></div>';
    F.modal(b ? 'Настройка бюджета' : 'Новый бюджет', body, {
      wide: false, mount: function (m) {
        $('#th', m.el).oninput = function () { $('#thv', m.el).textContent = this.value + ' %'; };
        $('[data-no]', m.el).onclick = m.close;
        $('#ok', m.el).onclick = function () {
          var limits = {}, n;
          if (simple) { n = parseFloat(String($('#tot', m.el).value).replace(/\s/g, '').replace(',', '.')); if (n > 0) limits.other = n; } else $$('[data-l]', m.el).forEach(function (i) { n = parseFloat(String(i.value).replace(/\s/g, '').replace(',', '.')); if (n > 0) limits[i.dataset.l] = n; });
          if (!Object.keys(limits).length) { F.toast('Задайте хотя бы один лимит'); return; }
          var next = { id: S.month, threshold: +$('#th', m.el).value, rollover: !!($('#roll', m.el) && $('#roll', m.el).checked), limits: limits };
          F.commit('budgets', S.month, next, (b ? 'Изменён бюджет на ' : 'Создан бюджет на ') + F.monthRu(S.month).toLowerCase(), 'budget');
          m.close(); F.toast('Бюджет сохранён'); budgets();
        };
      }
    });
  }

  /* ---------------- ЦЕЛИ ---------------- */
  function monthsLeft(due) { var d = new Date(due), n = new Date(S.month + '-01'); return Math.max((d.getFullYear() - n.getFullYear()) * 12 + d.getMonth() - n.getMonth(), 1); }
  function goals() {
    view().innerHTML = '<div class="acc-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))"><button class="card" id="new" style="cursor:pointer;color:var(--accent);font:600 16px var(--font);min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border-style:dashed">' + ic('plus', 'lg') + 'Новая цель</button>' + S.goals.map(function (g) {
      var pct = Math.round(g.saved / g.target * 100), left = Math.max(g.target - g.saved, 0), mon = monthsLeft(g.due), fee = Math.ceil(left / mon);
      return '<section class="card stack" style="gap:8px"><div class="row"><span class="ic" style="background:var(--accent);color:var(--on-accent)">' + ic(g.icon) + '</span><h2 class="grow">' + esc(g.name) + '</h2><button class="btn ghost icon sm" data-menu="' + g.id + '" aria-label="Действия с целью">' + ic('more') + '</button></div><div class="big">' + pct + ' %</div><div class="small muted">' + money(g.saved) + ' из ' + money(g.target) + '</div><div class="bar"><i style="width:' + Math.min(pct, 100) + '%"></i></div>' +
        (left ? '<div class="small">Осталось ' + money(left) + ' до ' + F.dateRu(g.due) + '</div><div class="small muted">Рекомендуемый взнос: ' + money(fee) + ' в месяц, взносов: ' + mon + '</div><button class="btn sec" data-top="' + g.id + '">Пополнить</button>' : '<span class="badge ok">' + ic('check') + 'Цель достигнута</span>') + '</section>';
    }).join('') + '</div>';
    $('#new').onclick = function () { if (!F.adv() && S.goals.length >= 1) F.toast('В простом режиме доступна одна цель'); else goalForm(); };
    $$('[data-top]').forEach(function (b) {
      b.onclick = function () {
        var g = F.find('goals', b.dataset.top);
        F.modal('Пополнить цель', field('Сумма', '<input type="text" inputmode="decimal" id="amt"><span class="err" id="ae"></span>') + '<div class="ft"><button class="btn" id="ok">Пополнить</button></div>', {
          mount: function (m) {
            $('#ok', m.el).onclick = function () {
              var n = parseFloat(String($('#amt', m.el).value).replace(/\s/g, '').replace(',', '.'));
              if (!(n > 0)) { $('#ae', m.el).textContent = 'Введите сумму больше нуля'; return; }
              var next = Object.assign({}, g, { saved: g.saved + n }), e = F.commit('goals', g.id, next, 'Цель «' + g.name + '» пополнена на ' + F.num(n) + ' ₽', 'goal');
              m.close(); goals();
              F.toast(next.saved >= next.target ? 'Поздравляем! Цель «' + g.name + '» достигнута' : 'Цель пополнена', function () { F.undo(e.id); goals(); });
            };
          }
        });
      };
    });
    $$('[data-menu]').forEach(function (b) {
      b.onclick = function () {
        var g = F.find('goals', b.dataset.menu);
        F.modal(g.name, '<div class="stack"><button class="btn sec" id="ed">' + ic('edit') + 'Изменить</button><button class="btn danger" id="rm">' + ic('trash') + 'Удалить</button></div>', {
          mount: function (m) {
            $('#ed', m.el).onclick = function () { m.close(); goalForm(g); };
            $('#rm', m.el).onclick = function () { m.close(); var e = F.commit('goals', g.id, null, 'Удалена цель «' + g.name + '»', 'goal'); goals(); F.toast('Цель удалена', function () { F.undo(e.id); goals(); }); };
          }
        });
      };
    });
  }
  function goalForm(g) {
    F.modal(g ? 'Изменить цель' : 'Новая цель', field('Название', '<input type="text" id="n" value="' + esc(g ? g.name : '') + '">') + field('Сумма', '<input type="text" inputmode="decimal" id="t" value="' + (g ? g.target : '') + '">') + field('Срок', '<input type="date" id="d" value="' + (g ? g.due : '') + '">') + field('Счёт накопления', '<select id="a">' + S.accounts.map(function (a) { return '<option value="' + a.id + '"' + (g && g.account === a.id ? ' selected' : '') + '>' + esc(a.name) + '</option>'; }).join('') + '</select>') + '<div class="small muted" id="fee">Заполните сумму и срок, и мы посчитаем взнос</div><span class="err" id="e"></span><div class="ft"><button class="btn sec" data-no>Отмена</button><button class="btn" id="ok">Сохранить</button></div>', {
      mount: function (m) {
        function calc() { var t = parseFloat(String($('#t', m.el).value).replace(/\s/g, '').replace(',', '.')), d = $('#d', m.el).value; if (t > 0 && d) { var mon = monthsLeft(d); $('#fee', m.el).textContent = 'Взнос: ' + money(Math.ceil(Math.max(t - (g ? g.saved : 0), 0) / mon)) + ' в месяц, взносов: ' + mon; } }
        $('#t', m.el).oninput = calc; $('#d', m.el).onchange = calc; calc();
        $('[data-no]', m.el).onclick = m.close;
        $('#ok', m.el).onclick = function () {
          var name = $('#n', m.el).value.trim(), t = parseFloat(String($('#t', m.el).value).replace(/\s/g, '').replace(',', '.')), d = $('#d', m.el).value;
          if (!name || !(t > 0) || !d) { $('#e', m.el).textContent = 'Заполните название, сумму и срок'; return; }
          var id = g ? g.id : F.uid('g'), next = Object.assign({ saved: 0, icon: 'target' }, g || {}, { id: id, name: name, target: t, due: d, account: $('#a', m.el).value });
          F.commit('goals', id, next, (g ? 'Изменена цель «' : 'Создана цель «') + name + '»', 'goal'); m.close(); goals();
        };
      }
    });
  }

  /* ---------------- СЧЕТА И КАТЕГОРИИ ---------------- */
  var accTab = 'accounts', catKind = 'expense';
  function accounts() {
    var seg = '<div class="seg"><button data-tab="accounts" class="' + (accTab === 'accounts' ? 'on' : '') + '">Счета</button><button data-tab="cats" class="' + (accTab === 'cats' ? 'on' : '') + '">Категории</button></div>';
    if (accTab === 'accounts') {
      view().innerHTML = '<div class="row between wrap">' + seg + '<div class="row"><span class="small muted">' + (F.adv() ? 'Итого: ' + money(F.total()) : S.accounts.length + ' из 5 счетов') + '</span><button class="btn" id="add-a">' + ic('plus') + 'Добавить счёт</button></div></div><div class="acc-grid">' + S.accounts.map(function (a) {
        return '<section class="card stack" style="gap:8px"><div class="row"><span class="ic" style="background:' + esc(a.color) + '">' + ic(ACC_ICONS[a.kind]) + '</span><div class="grow"><strong>' + esc(a.name) + '</strong><div class="cap muted">' + ACC_KINDS[a.kind] + ', ' + a.currency + '</div></div><button class="btn ghost icon sm" data-a="' + a.id + '" aria-label="Действия со счётом">' + ic('more') + '</button></div><div class="big">' + money(F.balance(a), a.currency) + '</div>' + (a.inTotal ? '' : '<span class="badge">Не входит в баланс</span>') + '</section>';
      }).join('') + '</div>';
      $('#add-a').onclick = function () { if (!F.adv() && S.accounts.length >= 5) F.toast('В простом режиме доступно до 5 счетов'); else accForm(); };
      $$('[data-a]').forEach(function (b) { b.onclick = function () { accMenu(F.find('accounts', b.dataset.a)); }; });
    } else {
      var list = S.cats.filter(function (c) { return c.kind === catKind; });
      view().innerHTML = '<div class="row between wrap">' + seg + '<div class="row"><div class="seg"><button data-k="expense" class="' + (catKind === 'expense' ? 'on' : '') + '">Расходы</button><button data-k="income" class="' + (catKind === 'income' ? 'on' : '') + '">Доходы</button></div><button class="btn" id="add-c">' + (F.adv() ? ic('plus') : ic('lock')) + 'Добавить категорию</button></div></div><section class="card" style="padding:8px 20px"><div class="list small">' + list.map(function (c) {
        var n = S.txs.filter(function (t) { return t.cat === c.id; }).length;
        return '<div>' + catIc(c) + '<strong class="grow">' + esc(c.name) + '</strong><span class="muted">Операций: ' + n + '</span>' + (F.adv() ? '<button class="btn ghost icon sm" data-e="' + c.id + '" aria-label="Изменить категорию">' + ic('edit') + '</button>' : '') + '</div>';
      }).join('') + '</div></section>';
      $$('[data-k]').forEach(function (b) { b.onclick = function () { catKind = b.dataset.k; accounts(); }; });
      $('#add-c').onclick = function () { if (!F.adv()) F.toast('Свои категории доступны в расширенном режиме'); else catForm(); };
      $$('[data-e]').forEach(function (b) { b.onclick = function () { catForm(F.find('cats', b.dataset.e)); }; });
    }
    $$('[data-tab]').forEach(function (b) { b.onclick = function () { accTab = b.dataset.tab; accounts(); }; });
  }
  function colorPick(cur) { return '<div class="colors" role="radiogroup" aria-label="Цвет">' + F.COLORS.map(function (c) { return '<button type="button" style="background:' + c + '" data-color="' + c + '" class="' + (c === cur ? 'on' : '') + '" aria-label="Цвет ' + c + '"></button>'; }).join('') + '</div>'; }
  function bindColors(m, set) { $$('[data-color]', m.el).forEach(function (b) { b.onclick = function () { $$('[data-color]', m.el).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); set(b.dataset.color); }; }); }
  function accForm(a) {
    var color = a ? a.color : F.COLORS[1];
    F.modal(a ? 'Изменить счёт' : 'Новый счёт', field('Тип', '<select id="k">' + Object.keys(ACC_KINDS).map(function (k) { return '<option value="' + k + '"' + (a && a.kind === k ? ' selected' : '') + '>' + ACC_KINDS[k] + '</option>'; }).join('') + '</select>') + field('Название', '<input type="text" id="n" value="' + esc(a ? a.name : '') + '">') +
      '<div class="row">' + field('Валюта', '<select id="c"' + (a ? ' disabled' : '') + '>' + ['RUB', 'USD', 'EUR'].map(function (c) { return '<option' + (a && a.currency === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>') + field('Начальный остаток', '<input type="text" inputmode="decimal" id="o" value="' + (a ? a.opening : '0') + '">') + '</div>' + colorPick(color) + '<label class="switch">Учитывать в общем балансе<input type="checkbox" id="t" ' + (!a || a.inTotal ? 'checked' : '') + '></label><span class="err" id="e"></span><div class="ft"><button class="btn sec" data-no>Отмена</button><button class="btn" id="ok">' + (a ? 'Сохранить' : 'Создать') + '</button></div>', {
      mount: function (m) {
        bindColors(m, function (c) { color = c; });
        $('[data-no]', m.el).onclick = m.close;
        $('#ok', m.el).onclick = function () {
          var name = $('#n', m.el).value.trim(); if (!name) { $('#e', m.el).textContent = 'Введите название'; return; }
          var id = a ? a.id : F.uid('a'), next = { id: id, name: name, kind: $('#k', m.el).value, currency: $('#c', m.el).value, color: color, inTotal: $('#t', m.el).checked, opening: parseFloat(String($('#o', m.el).value).replace(/\s/g, '').replace(',', '.')) || 0 };
          F.commit('accounts', id, next, (a ? 'Изменён счёт «' : 'Создан счёт «') + name + '»', 'account'); m.close(); accounts();
        };
      }
    });
  }
  function accMenu(a) {
    F.modal(a.name, '<div class="stack"><button class="btn sec" id="ed">' + ic('edit') + 'Изменить</button><button class="btn danger" id="rm">' + ic('trash') + 'Удалить</button></div>', {
      mount: function (m) {
        $('#ed', m.el).onclick = function () { m.close(); accForm(a); };
        $('#rm', m.el).onclick = function () {
          m.close();
          var cnt = S.txs.filter(function (t) { return t.account === a.id || t.to === a.id; }).length;
          if (cnt) { F.modal('Удалить счёт нельзя', '<p class="small muted">У счёта операций: ' + cnt + '. Перенесите их на другой счёт, удаление отменить можно будет в истории.</p>' + (S.accounts.length > 1 ? field('Перенести на', '<select id="to">' + S.accounts.filter(function (x) { return x.id !== a.id; }).map(function (x) { return '<option value="' + x.id + '">' + esc(x.name) + '</option>'; }).join('') + '</select>') + '<div class="ft"><button class="btn danger" id="mv">Перенести и удалить</button></div>' : ''), { mount: function (d) { var b = $('#mv', d.el); if (b) b.onclick = function () { var to = $('#to', d.el).value; S.txs.forEach(function (t) { if (t.account === a.id) t.account = to; if (t.to === a.id) t.to = to; }); var dest = F.find('accounts', to); dest.opening += a.opening; F.commit('accounts', a.id, null, 'Удалён счёт «' + a.name + '», операции перенесены', 'account'); d.close(); accounts(); }; } }); return; }
          F.confirmBox('Удалить счёт?', 'Счёт «' + a.name + '» будет удалён.', 'Удалить', function () { F.commit('accounts', a.id, null, 'Удалён счёт «' + a.name + '»', 'account'); accounts(); });
        };
      }
    });
  }
  function catForm(c) {
    var color = c ? c.color : F.COLORS[0], icon = c ? c.icon : 'box';
    F.modal(c ? 'Изменить категорию' : 'Новая категория', field('Название', '<input type="text" id="n" value="' + esc(c ? c.name : '') + '">') + colorPick(color) + '<div class="cats" style="grid-template-columns:repeat(7,1fr)">' + ICONS.map(function (i) { return '<button type="button" class="cat ' + (i === icon ? 'on' : '') + '" data-i="' + i + '" aria-label="Иконка ' + i + '">' + ic(i) + '</button>'; }).join('') + '</div><span class="err" id="e"></span><div class="ft">' + (c ? '<button class="btn sec" id="rm" style="margin-right:auto">Удалить</button>' : '') + '<button class="btn" id="ok">Сохранить</button></div>', {
      mount: function (m) {
        bindColors(m, function (x) { color = x; });
        $$('[data-i]', m.el).forEach(function (b) { b.onclick = function () { $$('[data-i]', m.el).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); icon = b.dataset.i; }; });
        if ($('#rm', m.el)) $('#rm', m.el).onclick = function () {
          var used = S.txs.some(function (t) { return t.cat === c.id; });
          if (used) { $('#e', m.el).textContent = 'В категории есть операции: сначала перенесите их'; return; }
          F.commit('cats', c.id, null, 'Удалена категория «' + c.name + '»', 'account'); m.close(); accounts();
        };
        $('#ok', m.el).onclick = function () {
          var name = $('#n', m.el).value.trim(); if (!name) { $('#e', m.el).textContent = 'Введите название'; return; }
          var id = c ? c.id : F.uid('c');
          F.commit('cats', id, { id: id, name: name, icon: icon, color: color, kind: c ? c.kind : catKind }, (c ? 'Изменена категория «' : 'Создана категория «') + name + '»', 'account'); m.close(); accounts();
        };
      }
    });
  }

  /* ---------------- ОТЧЁТЫ ---------------- */
  var rep = { tab: 'cats', months: 1 };
  function periodMonths() { var r = []; for (var i = rep.months - 1; i >= 0; i--) r.push(F.shiftMonth(S.month, -i)); return r; }
  function reports() {
    var ms = periodMonths(), list = S.txs.filter(function (t) { return ms.indexOf(t.date.slice(0, 7)) >= 0; }), inc = F.sumType(list, 'income'), exp = F.sumType(list, 'expense'), cat = F.byCat(list);
    var slices = Object.keys(cat).map(function (id) { var c = F.find('cats', id); return { id: id, value: cat[id], color: c ? c.color : '#52606D', label: (c ? c.name : '—') + ': ' + F.num(cat[id]) + ' ₽', name: c ? c.name : 'Без категории' }; }).sort(function (a, b) { return b.value - a.value; });
    var tabs = [['cats', 'Расходы по категориям'], ['flow', 'Доходы и расходы'], ['bal', 'Динамика баланса'], ['cmp', 'Сравнение периодов']], chart = '', table = '';
    var six = []; for (var i = 5; i >= 0; i--) six.push(F.shiftMonth(S.month, -i));
    if (rep.tab !== 'cats' && !F.adv()) rep.tab = 'cats';
    if (rep.tab === 'cats') {
      chart = slices.length ? '<div class="row wrap" style="justify-content:center;gap:32px">' + F.donut(slices, money(exp)) + '</div>' : '<div class="empty">За период нет расходов</div>';
      table = slices.map(function (s) { return '<tr data-cat="' + s.id + '" style="cursor:pointer"><td>' + esc(s.name) + '</td><td class="r">' + money(s.value) + '</td><td class="r">' + (exp ? F.num(Math.round(s.value / exp * 1000) / 10) : 0) + ' %</td></tr>'; }).join('');
    } else if (rep.tab === 'flow') {
      var fl6 = six.filter(function (m) { return F.inMonth(m).length; }).map(function (m) { var l = F.inMonth(m); return { label: F.MONTHS[+m.slice(5) - 1], m: m, a: F.sumType(l, 'income'), b: F.sumType(l, 'expense') }; });
      chart = fl6.length ? F.bars(fl6) : '<div class="empty">Нет данных</div>';
      table = fl6.map(function (r) { return '<tr><td>' + F.monthRu(r.m) + '</td><td class="r inc">' + signed(r.a) + '</td><td class="r exp">' + signed(-r.b) + '</td></tr>'; }).join('');
    } else if (rep.tab === 'bal') {
      var endBal = F.total(), pts = [], walk = endBal, latest = S.txs.reduce(function (m, t) { return t.date.slice(0, 7) > m ? t.date.slice(0, 7) : m; }, S.month);
      for (var x = latest; x > S.month; x = F.shiftMonth(x, -1)) { var q = F.inMonth(x); walk -= F.sumType(q, 'income') - F.sumType(q, 'expense'); }
      for (var j = 0; j < 6; j++) { var mm = F.shiftMonth(S.month, -j), ql = F.inMonth(mm); if (!ql.length && j) break; pts.unshift({ label: F.MONTHS[+mm.slice(5) - 1], value: walk, m: mm }); walk -= F.sumType(ql, 'income') - F.sumType(ql, 'expense'); }
      chart = F.line(pts);
      table = pts.map(function (p) { return '<tr><td>' + F.monthRu(p.m) + '</td><td class="r">' + money(p.value) + '</td></tr>'; }).join('');
    } else {
      var prev = F.shiftMonth(S.month, -1), c0 = F.byCat(F.inMonth(S.month)), c1 = F.byCat(F.inMonth(prev)), ids = Object.keys(Object.assign({}, c0, c1));
      chart = '<div class="small muted">' + F.monthRu(S.month) + ' в сравнении с предыдущим месяцем: ' + F.monthRu(prev) + '</div>';
      table = ids.map(function (id) { var c = F.find('cats', id), a = c0[id] || 0, b = c1[id] || 0, d = a - b; return '<tr><td>' + esc(c ? c.name : '—') + '</td><td class="r">' + money(b) + '</td><td class="r">' + money(a) + '</td><td class="r ' + (d > 0 ? 'exp' : d < 0 ? 'inc' : '') + '">' + signed(d) + '</td></tr>'; }).join('');
    }
    var heads = { cats: ['Категория', 'Сумма', 'Доля'], flow: ['Месяц', 'Доходы', 'Расходы'], bal: ['Месяц', 'Баланс'], cmp: ['Категория', 'Прошлый месяц', 'Текущий месяц', 'Разница'] }[rep.tab];
    view().innerHTML = '<div class="row between wrap"><div class="seg" role="tablist">' + tabs.map(function (t, n) { return '<button data-tab="' + t[0] + '" class="' + (t[0] === rep.tab ? 'on' : '') + '">' + (n && !F.adv() ? ic('lock') + ' ' : '') + t[1] + '</button>'; }).join('') + '</div></div><div class="row between wrap">' + monthSwitch() + '<div class="row"><select id="per" style="width:170px" aria-label="Период">' + [[1, 'Один месяц'], [3, '3 месяца'], [6, '6 месяцев']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === rep.months ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select><button class="btn" id="exp">' + ic('download') + 'Экспорт</button></div></div><div class="grid"><section class="card c8"><div class="hd"><h2>' + esc(tabs.filter(function (t) { return t[0] === rep.tab; })[0][1]) + '</h2></div>' + chart + '</section><section class="card c4 stack"><h2>Итоги</h2><div class="row between small"><span class="muted">Доходы</span><strong class="inc">' + money(inc) + '</strong></div><div class="row between small"><span class="muted">Расходы</span><strong class="exp">' + money(exp) + '</strong></div><div class="row between small"><span class="muted">Разница</span><strong>' + signed(inc - exp) + '</strong></div>' + (slices[0] ? '<div class="small"><div class="muted">Крупнейшая категория</div><strong>' + esc(slices[0].name) + ', ' + money(slices[0].value) + '</strong></div>' : '') + '</section><section class="card c12"><table><thead><tr>' + heads.map(function (h, n) { return '<th class="' + (n ? 'r' : '') + '">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + table + '</tbody></table></section></div>';
    bindMonth(reports);
    $$('[data-tab]').forEach(function (b) { b.onclick = function () { if (b.dataset.tab !== 'cats' && !F.adv()) { F.toast('Отчёт доступен в расширенном режиме'); return; } rep.tab = b.dataset.tab; reports(); }; });
    $('#per').onchange = function () { rep.months = +this.value; reports(); };
    $$('[data-cat]').forEach(function (r) { r.onclick = function () { location.href = 'transactions.html?cat=' + r.dataset.cat; }; });
    $('#exp').onclick = function () { exportDialog(list, ms); };
  }
  function exportDialog(list, ms) {
    var locked = !F.adv(), label = ms.length > 1 ? F.monthRu(ms[0]) + ' — ' + F.monthRu(ms[ms.length - 1]) : F.monthRu(ms[0]);
    F.modal('Экспорт отчёта', '<div class="stack" role="radiogroup" aria-label="Формат">' + [['pdf', 'PDF: печать отчёта или сохранение в файл', false], ['csv', 'CSV: операции для таблиц', locked], ['xlsx', 'XLSX: книга Excel', locked]].map(function (f, n) { return '<label class="check"><input type="radio" name="fmt" value="' + f[0] + '" ' + (n ? '' : 'checked') + (f[2] ? ' disabled' : '') + ' style="accent-color:var(--accent);width:18px;height:18px">' + f[1] + (f[2] ? ' ' + ic('lock') : '') + '</label>'; }).join('') + '</div><label class="check"><input type="checkbox" id="com" checked>Включить комментарии</label><p class="small muted">Период: ' + esc(label) + '. Операций: ' + list.length + '.</p><div class="ft"><button class="btn sec" data-no>Отмена</button><button class="btn" id="go">' + ic('download') + 'Скачать</button></div>', {
      mount: function (m) {
        $('[data-no]', m.el).onclick = m.close;
        $('#go', m.el).onclick = function () {
          var fmt = $('input[name=fmt]:checked', m.el).value, com = $('#com', m.el).checked;
          var rows = [['Дата', 'Тип', 'Категория', 'Счёт', 'Сумма'].concat(com ? ['Комментарий'] : [])].concat(list.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).map(function (t) {
            var c = F.find('cats', t.cat), a = F.find('accounts', t.account);
            return [F.dateRu(t.date), { expense: 'Расход', income: 'Доход', transfer: 'Перевод' }[t.type], c ? c.name : '', a ? a.name : '', t.type === 'expense' ? -t.amount : t.amount].concat(com ? [t.note || ''] : []);
          }));
          m.close();
          var name = 'finkompas-' + ms[0] + (ms.length > 1 ? '_' + ms[ms.length - 1] : '');
          if (fmt === 'csv') F.download(name + '.csv', F.toCSV(rows), 'text/csv;charset=utf-8');
          else if (fmt === 'xlsx') F.download(name + '.xlsx', F.toXLSX(rows), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          else window.print();
          S.log.unshift({ id: F.uid('l'), ts: new Date().toISOString(), kind: 'tx', text: 'Экспорт отчёта в ' + fmt.toUpperCase() + ': ' + label, locked: true }); F.save();
          F.toast('Отчёт сформирован');
        };
      }
    });
  }

  /* ---------------- ШАБЛОНЫ БЮДЖЕТОВ ---------------- */
  var TPL = [
    { id: 't1', name: '50/30/20', tag: 'Классика', text: 'Половина на необходимое, 30 % на желания, 20 % в накопления.', shares: { house: 30, food: 15, bus: 5, cafe: 10, fun: 20 } },
    { id: 't2', name: 'Студент', tag: 'Экономия', text: 'Для стипендии и подработки: жёсткий упор на базовые расходы.', shares: { house: 40, food: 30, bus: 10, cafe: 5, study: 5, fun: 5 } },
    { id: 't3', name: 'Семья', tag: 'Семья', text: 'Жильё, продукты и здоровье в приоритете.', shares: { house: 30, food: 30, bus: 8, health: 7, study: 5, fun: 5 } },
    { id: 't4', name: 'Быстрые накопления', tag: 'Экономия', text: 'Откладываете 40 % дохода ради большой цели.', shares: { house: 30, food: 18, bus: 5, cafe: 3, fun: 4 } },
    { id: 't5', name: 'Фриланс', tag: 'Классика', text: 'Держит запас на месяцы с низким доходом.', shares: { house: 28, food: 18, bus: 4, cafe: 6, fun: 9, other: 5 } },
    { id: 't6', name: 'Свобода', tag: 'Классика', text: 'Минимум контроля: лимиты только на крупные статьи.', shares: { house: 35, food: 25, fun: 15 } }
  ];
  var tplTag = 'Все', tplQ = '';
  function templates() {
    var tags = ['Все', 'Классика', 'Экономия', 'Семья'], list = TPL.filter(function (t) { return (tplTag === 'Все' || t.tag === tplTag) && t.name.toLowerCase().indexOf(tplQ.toLowerCase()) >= 0; });
    view().innerHTML = '<div class="filters"><div class="seg">' + tags.map(function (t) { return '<button data-tag="' + t + '" class="' + (t === tplTag ? 'on' : '') + '">' + t + '</button>'; }).join('') + '</div><input type="search" id="tq" placeholder="Поиск шаблона" value="' + esc(tplQ) + '" aria-label="Поиск шаблона"></div><div class="acc-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">' + (list.map(function (t) {
      var sum = Object.keys(t.shares).reduce(function (s, k) { return s + t.shares[k]; }, 0);
      return '<section class="card stack" style="gap:8px"><div class="row between"><h2>' + esc(t.name) + '</h2><span class="badge">' + esc(t.tag) + '</span></div><p class="small muted" style="min-height:40px">' + esc(t.text) + '</p><div style="display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--bg-muted)">' + Object.keys(t.shares).map(function (k) { var c = F.find('cats', k); return '<i style="width:' + t.shares[k] + '%;background:' + (c ? c.color : '#52606D') + '" title="' + esc(c ? c.name : k) + '"></i>'; }).join('') + '</div><div class="cap muted">Распределено ' + sum + ' % дохода</div><button class="btn sec" data-use="' + t.id + '">Использовать</button></section>';
    }).join('') || '<div class="empty">Шаблоны не найдены</div>') + '</div>';
    $$('[data-tag]').forEach(function (b) { b.onclick = function () { tplTag = b.dataset.tag; templates(); }; });
    var q = $('#tq'); q.oninput = function () { tplQ = this.value; var p = this.selectionStart; templates(); var n = $('#tq'); n.focus(); n.setSelectionRange(p, p); };
    $$('[data-use]').forEach(function (b) {
      b.onclick = function () {
        var t = TPL.filter(function (x) { return x.id === b.dataset.use; })[0], inc = F.sumType(F.inMonth(S.month), 'income') || F.sumType(F.inMonth(F.shiftMonth(S.month, -1)), 'income');
        F.modal('Шаблон «' + t.name + '»', field('Доход за месяц', '<input type="text" inputmode="decimal" id="in" value="' + (inc || '') + '">') + '<p class="small muted">Лимиты на ' + F.monthRu(S.month).toLowerCase() + ' будут рассчитаны от этой суммы и заменят текущий бюджет. Отменить можно в истории.</p><div class="ft"><button class="btn" id="ok">Применить</button></div>', {
          mount: function (m) {
            $('#ok', m.el).onclick = function () {
              var n = parseFloat(String($('#in', m.el).value).replace(/\s/g, '').replace(',', '.')); if (!(n > 0)) { F.toast('Укажите доход'); return; }
              var limits = {}; Object.keys(t.shares).forEach(function (k) { if (F.find('cats', k)) limits[k] = Math.round(n * t.shares[k] / 100); });
              F.commit('budgets', S.month, { id: S.month, threshold: 80, rollover: false, limits: limits }, 'Применён шаблон бюджета «' + t.name + '»', 'budget');
              location.href = 'budgets.html';
            };
          }
        });
      };
    });
  }

  /* ---------------- ИСТОРИЯ ---------------- */
  var hist = { kind: '', sel: null };
  function fmtVal(k, v) {
    if (v === null || v === undefined || typeof v === 'object') return v && k === 'limits' ? Object.keys(v).length + ' лимитов' : '—';
    if (typeof v === 'boolean') return v ? 'да' : 'нет';
    if (['amount', 'target', 'saved', 'opening'].indexOf(k) >= 0) return F.num(v) + ' ₽';
    return String(v);
  }
  var FIELD = { amount: 'Сумма', date: 'Дата', note: 'Комментарий', cat: 'Категория', account: 'Счёт', name: 'Название', target: 'Сумма цели', saved: 'Накоплено', due: 'Срок', opening: 'Начальный остаток', threshold: 'Порог', limits: 'Лимиты', type: 'Тип' };
  function history_() {
    var kinds = [['', 'Все'], ['tx', 'Операции'], ['account', 'Счета'], ['budget', 'Бюджеты'], ['goal', 'Цели'], ['login', 'Вход в систему']];
    var cutoff = new Date(F.today()); cutoff.setDate(cutoff.getDate() - 30);
    var list = S.log.filter(function (e) { return (!hist.kind || e.kind === hist.kind) && (F.adv() || new Date(e.ts) >= cutoff); }), groups = {};
    list.forEach(function (e) { var d = e.ts.slice(0, 10); (groups[d] = groups[d] || []).push(e); });
    if (!hist.sel && list.length) hist.sel = list[0].id;
    var cur = list.filter(function (e) { return e.id === hist.sel; })[0], diff = '';
    if (cur && (cur.before || cur.after)) {
      var keys = Object.keys(Object.assign({}, cur.before, cur.after)).filter(function (k) { return FIELD[k] && JSON.stringify((cur.before || {})[k]) !== JSON.stringify((cur.after || {})[k]); });
      diff = '<table><thead><tr><th>Поле</th><th>Было</th><th>Стало</th></tr></thead><tbody>' + keys.map(function (k) { return '<tr><td>' + FIELD[k] + '</td><td>' + esc(fmtVal(k, (cur.before || {})[k])) + '</td><td><strong>' + esc(fmtVal(k, (cur.after || {})[k])) + '</strong></td></tr>'; }).join('') + '</tbody></table>';
    }
    view().innerHTML = '<div class="filters"><div class="seg">' + kinds.map(function (k) { return '<button data-kind="' + k[0] + '" class="' + (k[0] === hist.kind ? 'on' : '') + '">' + k[1] + '</button>'; }).join('') + '</div></div><div class="grid"><section class="card c7" style="padding:8px 20px">' + (list.length ? Object.keys(groups).map(function (d) {
      return '<h3 class="cap muted" style="margin:12px 0 0">' + F.dateRu(d) + '</h3><div class="list small">' + groups[d].map(function (e) {
        return '<div data-log="' + e.id + '" style="cursor:pointer' + (e.id === hist.sel ? ';background:var(--accent-soft);margin:0 -8px;padding:10px 8px;border-radius:8px' : '') + '">' + ic(e.kind === 'login' ? 'lock' : e.kind === 'budget' ? 'wallet' : e.kind === 'goal' ? 'target' : e.kind === 'account' ? 'card' : 'list') + '<span class="grow">' + esc(e.text) + '</span><span class="cap muted">' + e.ts.slice(11, 16) + '</span></div>';
      }).join('') + '</div>';
    }).join('') : '<div class="empty">Событий нет</div>') + '</section><section class="card c5 stack"><h2>Детали</h2>' + (cur ? '<p class="small">' + esc(cur.text) + '</p>' + diff + (cur.locked ? '<p class="cap muted">' + (cur.kind === 'login' ? 'События безопасности отменить нельзя' : 'Это событие не отменяется') + '</p>' : cur.undone ? '<span class="badge">Действие отменено</span>' : '<button class="btn sec" id="undo">' + ic('undo') + 'Отменить действие</button>') + (cur.kind === 'login' ? '<button class="btn sec" id="notme">Это был не я</button>' : '') : '<p class="small muted">Выберите событие</p>') + '</section></div>';
    $$('[data-kind]').forEach(function (b) { b.onclick = function () { hist.kind = b.dataset.kind; hist.sel = null; history_(); }; });
    $$('[data-log]').forEach(function (b) { b.onclick = function () { hist.sel = b.dataset.log; history_(); }; });
    if ($('#undo')) $('#undo').onclick = function () { F.confirmBox('Отменить действие?', cur.text, 'Отменить действие', function () { F.undo(cur.id); hist.sel = null; F.toast('Действие отменено'); history_(); }); };
    if ($('#notme')) $('#notme').onclick = function () { F.toast('Все другие сеансы завершены. Смените пароль в настройках'); };
  }

  /* ---------------- НАСТРОЙКИ ---------------- */
  var setTab = 'profile';
  function settings() {
    var tabs = [['profile', 'Профиль'], ['sec', 'Безопасность'], ['look', 'Оформление'], ['notif', 'Уведомления'], ['cur', 'Валюта'], ['data', 'Данные']], body = '', u = S.user;
    if (setTab === 'profile') body = '<div class="row"><div class="ava" style="width:64px;height:64px;font-size:22px">' + esc(u.name[0].toUpperCase()) + '</div><div><strong>' + esc(u.name) + '</strong><div class="small muted">' + esc(u.email) + '</div></div></div>' + field('Имя', '<input type="text" id="pn" value="' + esc(u.name) + '">') + field('Email', '<input type="email" id="pe" value="' + esc(u.email) + '">') + '<div><button class="btn" id="psave">Сохранить</button></div><hr style="border:0;border-top:1px solid var(--border);width:100%"><button class="btn sec" id="out" style="align-self:flex-start">' + ic('logout') + 'Выйти</button>';
    if (setTab === 'sec') body = '<button class="btn sec" id="pw" style="align-self:flex-start">Сменить пароль</button><label class="switch">Двухфакторная аутентификация<input type="checkbox" id="tf" ' + (u.twofa ? 'checked' : '') + '></label><h3>Активные устройства</h3><div class="list small"><div>' + ic('grid') + '<span class="grow">Этот браузер<div class="cap muted">Сейчас</div></span></div><div>' + ic('phone') + '<span class="grow">Смартфон<div class="cap muted">Вчера</div></span><button class="btn sec sm" id="endd">Завершить сеанс</button></div></div>';
    if (setTab === 'look') body = '<div><div class="small" style="font-weight:500;margin-bottom:4px">Тема</div><div class="seg">' + [['light', 'Светлая'], ['dark', 'Тёмная'], ['system', 'Как в системе']].map(function (t) { return '<button data-th="' + t[0] + '" class="' + (S.theme === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div></div><div><div class="small" style="font-weight:500;margin-bottom:4px">Режим</div><div class="seg">' + [['simple', 'Простой'], ['extended', 'Расширенный']].map(function (t) { return '<button data-mode="' + t[0] + '" class="' + (u.mode === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div><p class="cap muted" style="margin-top:6px">Простой режим скрывает импорт, регулярные платежи и детальные бюджеты.</p></div>';
    if (setTab === 'notif') body = [['near', 'Приближение к лимиту'], ['over', 'Превышение лимита'], ['recurring', 'Регулярные платежи'], ['goals', 'Прогресс целей']].map(function (n) { return '<label class="switch">' + n[1] + '<input type="checkbox" data-n="' + n[0] + '" ' + (S.notif[n[0]] ? 'checked' : '') + '></label>'; }).join('');
    if (setTab === 'cur') body = field('Основная валюта', '<select id="cur">' + ['RUB', 'USD', 'EUR'].map(function (c) { return '<option' + (S.currency === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>') + '<p class="small muted">Курсы для пересчёта в демо постоянные: 1 $ = 90 ₽, 1 € = 98 ₽.</p>';
    if (setTab === 'data') body = '<button class="btn sec" id="ex" style="align-self:flex-start">' + ic('download') + 'Экспортировать все данные</button><button class="btn sec" id="rs" style="align-self:flex-start">Вернуть демо-данные</button><button class="btn danger" id="del" style="align-self:flex-start">' + ic('trash') + 'Удалить аккаунт</button>';
    view().innerHTML = '<div class="grid"><nav class="card c3" style="padding:8px" aria-label="Разделы настроек">' + tabs.map(function (t) { return '<a class="nav ' + (t[0] === setTab ? 'on' : '') + '" href="#" data-s="' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</nav><section class="card c8 stack" style="max-width:640px"><h2>' + tabs.filter(function (t) { return t[0] === setTab; })[0][1] + '</h2>' + body + '</section></div>';
    $$('[data-s]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); setTab = a.dataset.s; settings(); }; });
    var b = function (id, fn) { var el = $('#' + id); if (el) el.onclick = fn; };
    b('psave', function () { var n = $('#pn').value.trim(), m = $('#pe').value.trim(); if (!n || !/^\S+@\S+\.\S+$/.test(m)) { F.toast('Проверьте имя и email'); return; } u.name = n; u.email = m; F.save(); F.toast('Профиль сохранён'); start(); });
    b('out', function () { S.user = null; F.save(); location.href = 'login.html'; });
    b('pw', function () { F.toast('В демо пароль не хранится, менять нечего'); });
    b('endd', function () { F.toast('Сеанс завершён'); this.closest('div').remove(); });
    b('tf', function () { u.twofa = this.checked; F.save(); F.toast(u.twofa ? 'Двухфакторная защита включена' : 'Двухфакторная защита выключена'); });
    $$('[data-th]').forEach(function (x) { x.onclick = function () { S.theme = x.dataset.th; F.save(); F.applyTheme(); settings(); }; });
    $$('[data-mode]').forEach(function (x) { x.onclick = function () { u.mode = x.dataset.mode; F.save(); F.toast('Режим изменён'); start(); }; });
    $$('[data-n]').forEach(function (x) { x.onchange = function () { S.notif[x.dataset.n] = x.checked; F.save(); }; });
    if ($('#cur')) $('#cur').onchange = function () { S.currency = this.value; F.save(); F.toast('Валюта сохранена'); };
    b('ex', function () { F.download('finkompas-data.json', JSON.stringify({ accounts: S.accounts, cats: S.cats, txs: S.txs, budgets: S.budgets, goals: S.goals }, null, 2), 'application/json'); });
    b('rs', function () { F.confirmBox('Вернуть демо-данные?', 'Все текущие данные в этом браузере будут заменены.', 'Заменить', function () { var u0 = S.user; F.reset(); S = F.S; S.user = u0; F.save(); location.reload(); }); });
    b('del', function () {
      F.modal('Удалить аккаунт', '<p class="small muted">Все данные будут удалены без возможности восстановления. Введите слово УДАЛИТЬ.</p><input type="text" id="w" aria-label="Подтверждение"><div class="ft"><button class="btn danger" id="y" disabled>Удалить аккаунт</button></div>', {
        mount: function (m) { $('#w', m.el).oninput = function () { $('#y', m.el).disabled = this.value !== 'УДАЛИТЬ'; }; $('#y', m.el).onclick = function () { F.reset(); location.href = 'login.html'; }; }
      });
    });
  }

  /* ---------------- АДМИНИСТРИРОВАНИЕ ---------------- */
  var adm = { q: '', lvl: '' };
  function admin() {
    var list = S.users.filter(function (u) { return (!adm.lvl || u.level === adm.lvl) && (u.name + u.email).toLowerCase().indexOf(adm.q.toLowerCase()) >= 0; }), active = S.users.filter(function (u) { return u.status === 'active'; }).length;
    view().innerHTML = '<div class="grid">' + [['Всего пользователей', S.users.length], ['Активных', active], ['Заблокировано', S.users.length - active], ['С двухфакторной защитой', S.users.filter(function (u) { return u.twofa; }).length]].map(function (m) { return '<section class="card c3"><div class="small muted">' + m[0] + '</div><div class="big">' + m[1] + '</div></section>'; }).join('') + '</div><div class="row small muted">' + ic('shield') + 'Администратор не видит суммы и операции пользователей.</div><div class="filters"><input type="search" id="aq" placeholder="Имя или email" value="' + esc(adm.q) + '" aria-label="Поиск пользователя"><select id="al" aria-label="Уровень доступа">' + [['', 'Все уровни'], ['L1', 'L1 Базовый'], ['L2', 'L2 Расширенный'], ['L3', 'L3 Администратор']].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === adm.lvl ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div><section class="card" style="padding:8px"><table class="cards"><thead><tr><th>Пользователь</th><th class="hide-t">Email</th><th>Уровень</th><th class="hide-t">Последний вход</th><th>Статус</th><th class="r">Действия</th></tr></thead><tbody>' + list.map(function (u) {
      return '<tr><td>' + esc(u.name) + '</td><td class="hide-t opt">' + esc(u.email) + '</td><td class="opt"><select data-l="' + u.id + '" style="width:80px;height:36px" aria-label="Уровень">' + ['L1', 'L2', 'L3'].map(function (l) { return '<option' + (l === u.level ? ' selected' : '') + '>' + l + '</option>'; }).join('') + '</select></td><td class="hide-t opt">' + u.last + '</td><td><span class="badge ' + (u.status === 'active' ? 'ok' : 'x') + '">' + (u.status === 'active' ? 'Активен' : 'Заблокирован') + '</span></td><td class="r"><button class="btn sec sm" data-b="' + u.id + '">' + (u.status === 'active' ? 'Заблокировать' : 'Разблокировать') + '</button> <button class="btn ghost sm" data-2="' + u.id + '"' + (u.twofa ? '' : ' disabled') + '>Сбросить 2FA</button></td></tr>';
    }).join('') + '</tbody></table></section><section class="card"><div class="hd"><h2>Системный журнал</h2></div><div class="list small">' + S.syslog.map(function (l) { return '<div><span class="cap muted" style="width:130px;flex:none">' + esc(l.ts) + '</span><span>' + esc(l.text) + '</span></div>'; }).join('') + '</div></section>';
    function log(t) { var d = new Date(); S.syslog.unshift({ ts: F.dateRu(F.today()) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), text: t }); F.save(); }
    var aq = $('#aq'); aq.oninput = function () { adm.q = this.value; var p = this.selectionStart; admin(); var n = $('#aq'); n.focus(); n.setSelectionRange(p, p); };
    $('#al').onchange = function () { adm.lvl = this.value; admin(); };
    $$('[data-b]').forEach(function (b) { b.onclick = function () { var u = S.users.filter(function (x) { return x.id === b.dataset.b; })[0]; u.status = u.status === 'active' ? 'blocked' : 'active'; log((u.status === 'active' ? 'Разблокирована' : 'Заблокирована') + ' учётная запись ' + u.email); admin(); }; });
    $$('[data-2]').forEach(function (b) { b.onclick = function () { var u = S.users.filter(function (x) { return x.id === b.dataset['2']; })[0]; u.twofa = false; log('Сброшена двухфакторная защита: ' + u.email); F.toast('Двухфакторная защита сброшена'); admin(); }; });
    $$('[data-l]').forEach(function (s) { s.onchange = function () { var u = S.users.filter(function (x) { return x.id === s.dataset.l; })[0]; u.level = s.value; log('Изменён уровень доступа ' + u.email + ': ' + s.value); admin(); }; });
  }

  /* ---------------- ЗАПУСК ---------------- */
  var PAGES = {
    dashboard: ['Обзор', dashboard], transactions: ['Операции', transactions], budgets: ['Бюджеты', budgets], goals: ['Финансовые цели', goals],
    accounts: ['Счета и категории', accounts], reports: ['Отчёты', reports], templates: ['Шаблоны бюджетов', templates], history: ['История действий', history_],
    settings: ['Настройки', settings], admin: ['Администрирование', admin]
  };
  function start() {
    var page = document.body.dataset.page;
    if (page === 'login') { login(); return; }
    if (!PAGES[page]) return;
    if (!F.requireUser(page)) return;
    F.shell(page, PAGES[page][0]);
    F.refresh = PAGES[page][1];
    F.refresh();
  }
  start();
})();
