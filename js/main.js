/* Grill Master – UI, animations, Telegram Mini App integration. */
(function () {
  'use strict';
  var E = window.Engine;
  var A = window.Art;
  var $ = function (s) { return document.querySelector(s); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // ---------- board geometry (logical px, the board is scaled to fit) ----------
  var SW = 44, IH = 97, PAD = 5, CG = 2, TGAP = 8, STRIP = 26, ROWG = 14, BW = 370;
  var PRICES = { undo: 20, slot: 40, shuffle: 50, chef: 70 };
  var COIN_PER_ORDER = 2;
  var START_COINS = 150;

  // ---------- Telegram ----------
  var tg = window.Telegram && window.Telegram.WebApp;
  function tgv(v) { try { return !!(tg && tg.isVersionAtLeast && tg.isVersionAtLeast(v)); } catch (e) { return false; } }
  var inTG = !!(tg && tg.initData);

  function setupTelegram() {
    if (!tg) return;
    try { tg.ready(); } catch (e) { /* not in Telegram */ }
    try { tg.expand(); } catch (e) { /* old client */ }
    try { if (tgv('7.7')) tg.disableVerticalSwipes(); } catch (e) { /* old client */ }
    try { if (tgv('6.9')) { tg.setHeaderColor('#3a2014'); tg.setBackgroundColor('#2a1810'); } } catch (e) { /* old client */ }
    try { if (tgv('7.10')) tg.setBottomBarColor('#33190e'); } catch (e) { /* old client */ }
    try { tg.onEvent('viewportChanged', function () { layout(); }); } catch (e) { /* old client */ }
    try { if (tgv('6.1')) tg.BackButton.onClick(onBack); } catch (e) { /* old client */ }
  }

  var Hap = {
    on: true,
    impact: function (style) {
      if (!this.on) return;
      try {
        if (inTG && tgv('6.1')) tg.HapticFeedback.impactOccurred(style);
        else if (navigator.vibrate) navigator.vibrate(style === 'heavy' ? 25 : 8);
      } catch (e) { /* no haptics */ }
    },
    notify: function (type) {
      if (!this.on) return;
      try {
        if (inTG && tgv('6.1')) tg.HapticFeedback.notificationOccurred(type);
        else if (navigator.vibrate) navigator.vibrate(type === 'error' ? [20, 40, 20] : 30);
      } catch (e) { /* no haptics */ }
    }
  };

  // ---------- language ----------
  var UK = {
    title: 'Гриль-Майстер', subtitle: 'Збирай шашлики за замовленнями', play: 'Грати', level: 'Рівень', hard: 'складний',
    winTitle: 'Смачного!', winSub: function (n) { return 'Рівень ' + n + ' пройдено'; }, next: 'Далі',
    loseTitle: 'Решітка повна!', loseSub: 'Ходів немає. Візьми підказку або почни рівень знову.', retry: 'Почати знову',
    pause: 'Пауза', resume: 'Продовжити', restart: 'Почати рівень знову', sound: 'Звук', haptics: 'Вібрація', on: 'Увімк.', off: 'Вимк.',
    howto: 'Як грати', ok: 'Зрозуміло', noCoins: 'Не вистачає монет', noUndo: 'Нема що скасувати', maxSlots: 'Більше місць не можна',
    noChef: 'Зараз немає замовлення для кухаря', tutorial: 'Торкнись шашлика, який є в замовленні',
    b: { undo: 'Назад', slot: '+1 місце', shuffle: 'Перемішати', chef: 'Кухар' },
    rules: [
      'Торкайся шашликів на грилі. Якщо такий шашлик є в замовленні, він полетить на тарілку.',
      'Якщо замовлення немає, шашлик чекає на решітці. На ній лише 5 місць.',
      '3 однакові шашлики на тарілці – замовлення готове. Збери все, щоб пройти рівень.',
      'Під кожним грилем видно наступний шар. Плануй наперед!'
    ],
    boostHelp: { undo: 'скасувати останній хід', slot: 'ще одне місце на решітці', shuffle: 'потрібні шашлики вийдуть нагору', chef: 'кухар сам збере одне замовлення' }
  };
  var EN = {
    title: 'Grill Master', subtitle: 'Serve skewer orders', play: 'Play', level: 'Level', hard: 'hard',
    winTitle: 'Delicious!', winSub: function (n) { return 'Level ' + n + ' complete'; }, next: 'Next',
    loseTitle: 'Rack is full!', loseSub: 'No moves left. Use a helper or restart the level.', retry: 'Restart',
    pause: 'Pause', resume: 'Resume', restart: 'Restart level', sound: 'Sound', haptics: 'Vibration', on: 'On', off: 'Off',
    howto: 'How to play', ok: 'Got it', noCoins: 'Not enough coins', noUndo: 'Nothing to undo', maxSlots: 'No more slots',
    noChef: 'No order for the chef right now', tutorial: 'Tap a skewer that is in an order',
    b: { undo: 'Undo', slot: '+1 slot', shuffle: 'Shuffle', chef: 'Chef' },
    rules: [
      'Tap skewers on the grill. If an order needs it, it flies to the plate.',
      'Otherwise the skewer waits on the rack. The rack has only 5 slots.',
      '3 same skewers on a plate complete the order. Serve everything to win.',
      'You can peek at the next layer under each grill. Plan ahead!'
    ],
    boostHelp: { undo: 'undo the last move', slot: 'one more rack slot', shuffle: 'needed skewers come to the top', chef: 'the chef serves one order' }
  };
  var langCode = '';
  try { langCode = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code) || navigator.language || ''; } catch (e) { langCode = ''; }
  var qLang = (location.search.match(/[?&]lang=(\w+)/) || [])[1];
  if (qLang) langCode = qLang;
  var T = /^en/i.test(langCode) ? EN : UK;
  document.documentElement.lang = T === EN ? 'en' : 'uk';
  document.title = T.title;

  // ---------- save (Telegram CloudStorage + localStorage) ----------
  var SAVE_KEY = 'grill_master_v1';
  var Save = {
    data: { level: 1, coins: START_COINS, sound: true, haptics: true, tutorial: false, ts: 0 },
    load: function () {
      var self = this;
      var local = null;
      try { local = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { local = null; }
      return new Promise(function (resolve) {
        var finished = false;
        function done(cloud) {
          if (finished) return;
          finished = true;
          var pick = [local, cloud].filter(Boolean).sort(function (a, b) {
            return (b.level || 0) - (a.level || 0) || (b.ts || 0) - (a.ts || 0);
          })[0];
          if (pick) Object.assign(self.data, pick);
          resolve();
        }
        if (inTG && tgv('6.9') && tg.CloudStorage) {
          setTimeout(function () { done(null); }, 1500);
          try {
            tg.CloudStorage.getItem(SAVE_KEY, function (err, val) {
              var c = null;
              try { c = !err && val ? JSON.parse(val) : null; } catch (e) { c = null; }
              done(c);
            });
          } catch (e) { done(null); }
        } else done(null);
      });
    },
    save: function () {
      this.data.ts = Date.now();
      var s = JSON.stringify(this.data);
      try { localStorage.setItem(SAVE_KEY, s); } catch (e) { /* private mode */ }
      if (inTG && tgv('6.9') && tg.CloudStorage) {
        try { tg.CloudStorage.setItem(SAVE_KEY, s); } catch (e) { /* offline */ }
      }
    }
  };

  // ---------- sound (WebAudio, no files) ----------
  var Sfx = {
    ctx: null,
    unlock: function () {
      try {
        if (!this.ctx) {
          var C = window.AudioContext || window.webkitAudioContext;
          if (C) this.ctx = new C();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) { this.ctx = null; }
    },
    tone: function (f, dur, type, vol, when, slide) {
      if (!Save.data.sound || !this.ctx) return;
      try {
        var c = this.ctx, t = c.currentTime + (when || 0);
        var o = c.createOscillator(), gn = c.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + dur);
        gn.gain.setValueAtTime(0.0001, t);
        gn.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012);
        gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(gn); gn.connect(c.destination);
        o.start(t); o.stop(t + dur + 0.02);
      } catch (e) { /* audio busy */ }
    },
    tap: function () { this.tone(560, 0.08, 'triangle', 0.13, 0, 300); },
    rack: function () { this.tone(330, 0.1, 'triangle', 0.12, 0, -90); },
    serve: function () { var s = this; [784, 988, 1319].forEach(function (f, i) { s.tone(f, 0.16, 'sine', 0.11, i * 0.06); }); },
    win: function () { var s = this; [523, 659, 784, 1047, 1319].forEach(function (f, i) { s.tone(f, 0.26, 'triangle', 0.12, i * 0.1); }); },
    lose: function () { this.tone(392, 0.25, 'sawtooth', 0.05, 0, -120); this.tone(262, 0.4, 'sawtooth', 0.05, 0.2, -90); },
    error: function () { this.tone(150, 0.12, 'square', 0.04); },
    magic: function () { var s = this; [660, 880, 1100, 1320].forEach(function (f, i) { s.tone(f, 0.12, 'sine', 0.08, i * 0.04); }); }
  };

  // ---------- game state ----------
  var def = null, state = null, view = null;
  var arriving = new Set();
  var flights = new Set();
  var busy = 0, over = false, paused = false;
  var undoStack = [];
  var trayEls = [];
  var boardH = 300;
  var hint = null;
  var screen = 'start';

  function syncView() {
    view = {
      plates: state.plates.map(function (p) { return { type: p.type, items: p.items.map(function (i) { return { id: i.id, type: i.type }; }) }; }),
      buffer: state.buffer.map(function (i) { return { id: i.id, type: i.type }; })
    };
  }

  function startLevel(n) {
    hideOverlay();
    def = E.generateLevel(n);
    state = E.createState(def);
    E.start(state);
    undoStack = [];
    arriving.clear();
    busy = 0; over = false; paused = false;
    syncView();
    buildBoard();
    renderPlates();
    for (var p = 0; p < view.plates.length; p++) renderPlates(p);
    renderRack();
    updateHud();
    layout();
    screen = 'game';
    if (n === 1 && !Save.data.tutorial) setTimeout(showTutorial, 650);
  }

  // ---------- board ----------
  function trayW(t) { return t.slots * SW + (t.slots - 1) * CG + PAD * 2; }

  function buildBoard() {
    var board = $('#board');
    board.innerHTML = '';
    trayEls = [];
    var y = 6;
    var k = 0;
    def.rows.forEach(function (row) {
      var widths = row.map(function (ti) { return trayW(state.trays[ti]); });
      var total = widths.reduce(function (a, b) { return a + b; }, 0) + TGAP * (row.length - 1);
      var x = (BW - total) / 2;
      row.forEach(function (ti, j) {
        var tr = state.trays[ti];
        var el = document.createElement('div');
        el.className = 'tray ' + tr.kind;
        el.dataset.t = ti;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = widths[j] + 'px';
        var cells = '';
        for (var s = 0; s < tr.slots; s++) cells += '<div class="cell" data-s="' + s + '" style="left:' + (PAD + s * (SW + CG)) + 'px"></div>';
        el.innerHTML = '<div class="grill">' + cells + '</div><div class="strip"></div><div class="badge"></div>';
        board.appendChild(el);
        trayEls[ti] = el;
        x += widths[j] + TGAP;
        renderTray(ti, true, k++ * 45);
      });
      y += IH + PAD * 2 + STRIP + ROWG;
    });
    boardH = y - ROWG + 6;
    board.style.width = BW + 'px';
    board.style.height = boardH + 'px';
  }

  function itemImg(type, id, cls) {
    var img = document.createElement('img');
    img.src = A.url(type);
    img.alt = '';
    img.draggable = false;
    if (id !== undefined) img.dataset.id = id;
    if (cls) img.className = cls;
    return img;
  }

  function renderTray(ti, pop, delay) {
    var tr = state.trays[ti], el = trayEls[ti];
    if (!el) return;
    var grill = el.children[0], strip = el.children[1], badge = el.children[2];
    var top = tr.layers[0] || [];
    for (var s = 0; s < tr.slots; s++) {
      var cell = grill.children[s];
      var it = top[s];
      var cur = cell.firstChild;
      if (it) {
        if (!cur || +cur.dataset.id !== it.id) {
          cell.innerHTML = '';
          var img = itemImg(it.type, it.id, pop ? 'pop' : '');
          if (pop) img.style.animationDelay = ((delay || 0) + s * 50) + 'ms';
          cell.appendChild(img);
        }
      } else if (cur) cell.innerHTML = '';
    }
    var nxt = tr.layers[1];
    var html = '';
    if (nxt) {
      for (var q = 0; q < tr.slots; q++) {
        html += '<div class="mini" style="left:' + (q * (SW + CG) - 1) + 'px">' + (nxt[q] ? '<img alt="" src="' + A.url(nxt[q].type) + '">' : '') + '</div>';
      }
    }
    strip.innerHTML = html;
    strip.classList.toggle('empty', !nxt);
    var n = tr.layers.length;
    badge.textContent = n > 1 ? String(n) : '';
    badge.style.display = n > 1 ? '' : 'none';
    el.classList.toggle('done', n === 0);
  }

  function layout() {
    var wrap = $('#boardWrap');
    var board = $('#board');
    if (!wrap || !board) return;
    var W = wrap.clientWidth - 10, H = wrap.clientHeight - 10;
    if (W <= 0 || H <= 0) return;
    var s = Math.min(W / BW, H / boardH, 1.4);
    var x = (wrap.clientWidth - BW * s) / 2;
    var y = Math.max(4, (wrap.clientHeight - boardH * s) / 2);
    board.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }

  // ---------- plates & rack ----------
  function renderPlates(enter) {
    var wrap = $('#plates');
    if (wrap.children.length !== view.plates.length) {
      wrap.innerHTML = '';
      wrap.style.gridTemplateColumns = 'repeat(' + view.plates.length + ', 1fr)';
      view.plates.forEach(function () {
        var d = document.createElement('div');
        d.className = 'plate';
        d.innerHTML = '<div class="plate-in"></div>';
        wrap.appendChild(d);
      });
    }
    view.plates.forEach(function (pl, p) {
      var el = wrap.children[p];
      var inner = el.firstChild;
      el.classList.toggle('empty', pl.type === null);
      var sig = pl.type + ':' + pl.items.map(function (i) { return i.id + (arriving.has(i.id) ? 'a' : ''); }).join(',');
      if (inner.dataset.sig !== sig) {
        inner.dataset.sig = sig;
        inner.innerHTML = '';
        if (pl.type !== null) {
          for (var j = 0; j < 3; j++) {
            var slot = document.createElement('div');
            slot.className = 'pslot';
            var it = pl.items[j];
            if (it) slot.appendChild(itemImg(it.type, it.id, arriving.has(it.id) ? 'arriving' : ''));
            else slot.appendChild(itemImg(pl.type, undefined, 'ghost'));
            inner.appendChild(slot);
          }
        }
      }
      if (enter === p) {
        el.classList.remove('enter');
        void el.offsetWidth;
        el.classList.add('enter');
      }
    });
  }

  function rackRects() {
    var m = {};
    document.querySelectorAll('#rack img[data-id]').forEach(function (i) { m[i.dataset.id] = i.getBoundingClientRect(); });
    return m;
  }

  function renderRack(before) {
    var box = $('#rack .slots');
    box.innerHTML = '';
    for (var i = 0; i < state.cap; i++) {
      var d = document.createElement('div');
      d.className = 'rslot';
      var it = view.buffer[i];
      if (it) d.appendChild(itemImg(it.type, it.id, arriving.has(it.id) ? 'arriving' : ''));
      box.appendChild(d);
    }
    if (state.cap < E.MAX_CAP) {
      var add = document.createElement('div');
      add.className = 'rslot add';
      add.dataset.b = 'slot';
      add.textContent = '+';
      box.appendChild(add);
    }
    if (before) {
      box.querySelectorAll('img[data-id]').forEach(function (img) {
        var b = before[img.dataset.id];
        if (!b || img.classList.contains('arriving')) return;
        var a = img.getBoundingClientRect();
        var dx = b.left - a.left, dy = b.top - a.top;
        if (Math.abs(dx) + Math.abs(dy) < 1) return;
        img.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 220, easing: 'ease-out' });
      });
    }
    var n = view.buffer.length;
    var rack = $('#rack');
    rack.classList.toggle('warn', n === state.cap - 1);
    rack.classList.toggle('full', n >= state.cap);
  }

  function updateHud() {
    var inPlates = 0;
    state.plates.forEach(function (p) { inPlates += p.items.length; });
    var got = state.collected + inPlates;
    $('#cnt').textContent = got + '/' + state.total;
    $('#bar').style.width = (100 * state.collected / state.total) + '%';
    $('#lvl').innerHTML = T.level + ' ' + def.n + (def.hard ? '<span class="hard">' + T.hard + '</span>' : '');
    $('#coins').textContent = Save.data.coins;
    updateBoosters();
  }

  function updateBoosters() {
    document.querySelectorAll('#boosters .boost').forEach(function (b) {
      var k = b.dataset.b;
      var ok = state && boosterUsable(k);
      b.classList.toggle('off', !ok);
      b.classList.toggle('poor', Save.data.coins < PRICES[k]);
    });
  }

  function boosterUsable(k) {
    if (!state || state.done) return false;
    if (k === 'undo') return undoStack.length > 0;
    if (k === 'slot') return state.cap < E.MAX_CAP;
    if (k === 'shuffle') return E.visible(state).length > 0;
    if (k === 'chef') return state.plates.some(function (p) { return p.type !== null && p.items.length < 3; });
    return false;
  }

  // ---------- flying items ----------
  function targetEl(id) {
    return document.querySelector('#plates img[data-id="' + id + '"]') || document.querySelector('#rack img[data-id="' + id + '"]');
  }

  function land(id) {
    arriving.delete(id);
    var el = targetEl(id);
    if (el) {
      el.classList.remove('arriving');
      el.animate([{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
    }
  }

  function flyTo(id, type, from) {
    var target = targetEl(id);
    if (!target || !from || !from.width) { land(id); return Promise.resolve(); }
    var to = target.getBoundingClientRect();
    var fl = itemImg(type, undefined, 'flyer');
    fl.style.left = from.left + 'px';
    fl.style.top = from.top + 'px';
    fl.style.width = from.width + 'px';
    fl.style.height = from.height + 'px';
    $('#fx').appendChild(fl);
    var dx = to.left - from.left, dy = to.top - from.top;
    var sx = to.width / from.width, sy = to.height / from.height;
    var dur = Math.min(430, 230 + Math.hypot(dx, dy) * 0.32);
    var p = new Promise(function (resolve) {
      var anim = fl.animate([
        { transform: 'translate(0,0) scale(1,1) rotate(0deg)' },
        { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 34) + 'px) scale(' + ((1 + sx) / 2 * 1.1) + ',' + ((1 + sy) / 2 * 1.1) + ') rotate(' + (dx > 0 ? 9 : -9) + 'deg)', offset: 0.55 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ') rotate(0deg)' }
      ], { duration: dur, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
      var finish = function () { fl.remove(); land(id); resolve(); };
      anim.onfinish = finish;
      anim.oncancel = finish;
    });
    flights.add(p);
    p.then(function () { flights.delete(p); });
    return p;
  }

  function waitFlights() { return Promise.all(Array.from(flights)); }

  // ---------- input ----------
  function onBoardDown(e) {
    var cell = e.target.closest('.cell');
    if (!cell) return;
    e.preventDefault();
    Sfx.unlock();
    if (busy || over || paused || screen !== 'game') return;
    var ti = +cell.closest('.tray').dataset.t;
    var si = +cell.dataset.s;
    var top = state.trays[ti].layers[0];
    var it = top && top[si];
    if (!it) return;
    if (!E.canTake(state, ti, si)) {
      cell.classList.remove('shake'); void cell.offsetWidth; cell.classList.add('shake');
      var rack = $('#rack');
      rack.classList.remove('flash'); void rack.offsetWidth; rack.classList.add('flash');
      clearTimeout(onBoardDown._t);
      onBoardDown._t = setTimeout(function () { rack.classList.remove('flash'); cell.classList.remove('shake'); }, 380);
      Sfx.error(); Hap.notify('error');
      return;
    }
    hideTutorial();
    var img = cell.querySelector('img');
    var rects = {};
    rects[it.id] = img ? img.getBoundingClientRect() : cell.getBoundingClientRect();
    undoStack.push(E.clone(state));
    if (undoStack.length > 40) undoStack.shift();
    var ev = E.tap(state, ti, si);
    play(ev, rects);
  }

  var LIGHT = { take: 1, reveal: 1, toPlate: 1, toBuffer: 1 };

  async function play(ev, fromRects) {
    var heavy = ev.some(function (e) { return !LIGHT[e.t]; });
    if (heavy) busy++;
    var touched = {};
    ev.forEach(function (e) { if (e.t === 'take' || e.t === 'reveal') touched[e.tray] = true; });
    Object.keys(touched).forEach(function (ti) { renderTray(+ti, true, 0); });
    var local = [];
    var moves = ev.filter(function (e) { return e.t === 'toPlate' || e.t === 'toBuffer'; }).length;
    try {
      for (var i = 0; i < ev.length; i++) {
        var e = ev[i];
        if (e.t === 'toPlate' || e.t === 'toBuffer') {
          var before = rackRects();
          if (e.t === 'toPlate') view.plates[e.plate].items.push({ id: e.id, type: e.type });
          else view.buffer.splice(e.idx, 0, { id: e.id, type: e.type });
          arriving.add(e.id);
          renderPlates();
          renderRack(before);
          local.push(flyTo(e.id, e.type, fromRects[e.id]));
          if (e.t === 'toPlate') { Sfx.tap(); Hap.impact('light'); } else { Sfx.rack(); Hap.impact('soft'); }
          if (moves > 1) await sleep(110);
        } else if (e.t === 'complete') {
          await Promise.all(local); local = [];
          await sleep(70);
          servePlate(e.plate);
          view.plates[e.plate] = { type: null, items: [] };
          renderPlates();
          Save.data.coins += COIN_PER_ORDER;
          Sfx.serve(); Hap.impact('medium');
          updateHud();
          await sleep(320);
        } else if (e.t === 'order') {
          view.plates[e.plate] = { type: e.type, items: [] };
          renderPlates(e.plate);
          await sleep(220);
        } else if (e.t === 'transfer') {
          var src = targetEl(e.id);
          var from = src ? src.getBoundingClientRect() : null;
          var before2 = rackRects();
          view.buffer = view.buffer.filter(function (b) { return b.id !== e.id; });
          view.plates[e.plate].items.push({ id: e.id, type: e.type });
          arriving.add(e.id);
          renderPlates();
          renderRack(before2);
          local.push(flyTo(e.id, e.type, from));
          Sfx.tap(); Hap.impact('light');
          await sleep(100);
        } else if (e.t === 'win') {
          await Promise.all(local);
          await waitFlights();
          onWin();
        } else if (e.t === 'stuck') {
          await Promise.all(local);
          await waitFlights();
          onStuck();
        }
      }
      if (heavy) await Promise.all(local);
    } finally {
      if (heavy) {
        busy--;
        if (!busy) {
          syncView();
          renderPlates();
          renderRack(rackRects());
        }
      }
      updateHud();
      Save.save();
    }
  }

  // ---------- effects ----------
  function servePlate(p) {
    var el = $('#plates').children[p];
    if (!el) return;
    var r = el.getBoundingClientRect();
    var ghost = el.cloneNode(true);
    ghost.classList.remove('enter');
    ghost.classList.add('ghost-plate');
    ghost.style.position = 'fixed';
    ghost.style.left = r.left + 'px';
    ghost.style.top = r.top + 'px';
    ghost.style.width = r.width + 'px';
    ghost.style.height = r.height + 'px';
    $('#fx').appendChild(ghost);
    var anim = ghost.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.12)', opacity: 1, offset: 0.35 },
      { transform: 'translateY(-46px) scale(.55)', opacity: 0 }
    ], { duration: 560, easing: 'ease-in', fill: 'forwards' });
    anim.onfinish = function () { ghost.remove(); };
    coinBurst(r.left + r.width / 2, r.top + r.height / 2, COIN_PER_ORDER);
  }

  function coinBurst(x, y, amount) {
    var fx = $('#fx');
    var target = $('#coinIc').getBoundingClientRect();
    for (var i = 0; i < 3; i++) {
      (function (i) {
        var c = document.createElement('div');
        c.className = 'coin-fx';
        c.innerHTML = A.ICONS.coin;
        c.style.left = (x - 11) + 'px';
        c.style.top = (y - 11) + 'px';
        fx.appendChild(c);
        var mx = (Math.random() - 0.5) * 70, my = -30 - Math.random() * 30;
        var tx = target.left + target.width / 2 - x, ty = target.top + target.height / 2 - y;
        var a = c.animate([
          { transform: 'translate(0,0) scale(.6)', opacity: 0 },
          { transform: 'translate(' + mx + 'px,' + my + 'px) scale(1.1)', opacity: 1, offset: 0.35 },
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(.7)', opacity: 0.9 }
        ], { duration: 650 + i * 90, easing: 'ease-in-out', fill: 'forwards' });
        a.onfinish = function () { c.remove(); };
      })(i);
    }
    var t = document.createElement('div');
    t.className = 'float-txt';
    t.textContent = '+' + amount;
    t.style.left = (x - 12) + 'px';
    t.style.top = (y - 26) + 'px';
    fx.appendChild(t);
    var ta = t.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-36px)', opacity: 0 }], { duration: 800, easing: 'ease-out', fill: 'forwards' });
    ta.onfinish = function () { t.remove(); };
  }

  function confetti() {
    var fx = $('#fx');
    var W = window.innerWidth, H = window.innerHeight;
    for (var i = 0; i < 26; i++) {
      var c = document.createElement('img');
      c.className = 'confetti';
      c.src = A.url(def.types[i % def.types.length]);
      c.style.left = (Math.random() * W) + 'px';
      fx.appendChild(c);
      var rot = (Math.random() - 0.5) * 720;
      var a = c.animate([
        { transform: 'translate(0,0) rotate(0deg)' },
        { transform: 'translate(' + ((Math.random() - 0.5) * 120) + 'px,' + (H + 120) + 'px) rotate(' + rot + 'deg)' }
      ], { duration: 1600 + Math.random() * 1200, delay: Math.random() * 500, easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'forwards' });
      a.onfinish = (function (el) { return function () { el.remove(); }; })(c);
    }
  }

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 1400);
  }

  // ---------- tutorial ----------
  var HAND = '<svg viewBox="0 0 48 48"><path d="M17 26 V9 C17 6.5 21 6.5 21 9 V22 C21 20 25 20 25 22 V24 C25 22 29 22 29 24 V26 C29 24 33 24 33 26 V34 C33 40 29 44 23 44 C18 44 15 41 13 37 L9 29 C8 27 10.5 25 12.5 26.5 Z" fill="#fff" stroke="#4a2412" stroke-width="2.5" stroke-linejoin="round"/></svg>';

  function showTutorial() {
    hideTutorial();
    if (screen !== 'game' || over) return;
    var vis = E.visible(state).filter(function (v) { return E.accepting(state, v.type) >= 0; });
    if (!vis.length) return;
    var v = vis[0];
    var cell = trayEls[v.tray].children[0].children[v.slot];
    var r = cell.getBoundingClientRect();
    var hand = document.createElement('div');
    hand.className = 'hint-hand';
    hand.innerHTML = HAND;
    hand.style.left = (r.left + r.width / 2 - 14) + 'px';
    hand.style.top = (r.top + r.height * 0.55) + 'px';
    var bub = document.createElement('div');
    bub.className = 'hint-bubble';
    bub.textContent = T.tutorial;
    document.body.appendChild(hand);
    document.body.appendChild(bub);
    var bw = bub.offsetWidth;
    var left = Math.min(window.innerWidth - bw - 10, Math.max(10, r.left + r.width / 2 - bw / 2));
    bub.style.left = left + 'px';
    bub.style.top = Math.max(10, r.top - bub.offsetHeight - 10) + 'px';
    hint = [hand, bub];
  }
  function hideTutorial() {
    if (!hint) return;
    hint.forEach(function (h) { h.remove(); });
    hint = null;
  }

  // ---------- boosters ----------
  async function useBooster(k) {
    Sfx.unlock();
    if (!state || busy || paused || screen !== 'game') return;
    if (state.done) return;
    if (Save.data.coins < PRICES[k]) { toast(T.noCoins); Sfx.error(); Hap.notify('error'); return; }
    if (k === 'undo' && !undoStack.length) { toast(T.noUndo); return; }
    if (k === 'slot' && state.cap >= E.MAX_CAP) { toast(T.maxSlots); return; }
    if (k === 'chef' && !boosterUsable('chef')) { toast(T.noChef); return; }
    if (k === 'shuffle' && !boosterUsable('shuffle')) return;
    busy++;
    try {
      await waitFlights();
      hideTutorial();
      if (k === 'undo') {
        state = undoStack.pop();
        arriving.clear();
        syncView();
        state.trays.forEach(function (_, ti) { renderTray(ti, true, 0); });
        renderPlates();
        renderRack();
      } else if (k === 'slot') {
        E.addSlot(state);
        var before = rackRects();
        renderRack(before);
        var slots = $('#rack .slots').children;
        var nslot = slots[state.cap - 1];
        if (nslot) nslot.animate([{ transform: 'scale(.3)' }, { transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 380 });
      } else if (k === 'shuffle') {
        E.smartShuffle(state);
        undoStack = [];
        state.trays.forEach(function (_, ti) {
          var cells = trayEls[ti].children[0].children;
          for (var c = 0; c < cells.length; c++) cells[c].innerHTML = '';
          renderTray(ti, true, ti * 30);
        });
      } else if (k === 'chef') {
        var ev = E.chef(state);
        if (!ev) return;
        undoStack = [];
        var rects = {};
        ev.forEach(function (e) {
          if (e.t !== 'take') return;
          var trEl = trayEls[e.tray];
          var img = e.depth === 0 ? trEl.children[0].children[e.slot].querySelector('img') : null;
          rects[e.id] = (img || trEl.children[1]).getBoundingClientRect();
        });
        Save.data.coins -= PRICES[k];
        Sfx.magic();
        busy--;
        updateHud();
        await play(ev, rects);
        busy++;
        afterRescue();
        return;
      }
      Save.data.coins -= PRICES[k];
      Sfx.magic(); Hap.impact('medium');
      afterRescue();
    } finally {
      busy--;
      updateHud();
      Save.save();
    }
  }

  function afterRescue() {
    if (over && !state.done && E.hasMove(state)) {
      over = false;
      hideOverlay();
    }
  }

  // ---------- screens ----------
  function coinHtml() { return '<i>' + A.ICONS.coin + '</i>'; }

  function showOverlay(html) {
    $('#card').innerHTML = html;
    $('#overlay').classList.remove('hidden');
    var c = $('#card');
    c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
  }
  function hideOverlay() {
    $('#overlay').classList.add('hidden');
    try { if (tgv('6.1')) tg.BackButton.hide(); } catch (e) { /* old client */ }
  }
  function showBack() { try { if (inTG && tgv('6.1')) tg.BackButton.show(); } catch (e) { /* old client */ } }

  function showStart() {
    screen = 'start';
    var fan = '';
    var picks = [0, 7, 3, 2, 8];
    picks.forEach(function (t, i) {
      var rot = (i - 2) * 16;
      fan += '<img alt="" src="' + A.url(t) + '" style="transform:rotate(' + rot + 'deg) translateY(' + (Math.abs(i - 2) * 6) + 'px)">';
    });
    showOverlay(
      '<div class="fan">' + fan + '</div>' +
      '<h1>' + T.title + '</h1>' +
      '<p>' + T.subtitle + '</p>' +
      '<span class="start-lvl">' + T.level + ' ' + Save.data.level + '</span>' +
      '<button class="btn orange" data-act="play">' + T.play + '</button>' +
      '<button class="btn plain small" data-act="howto">' + T.howto + '</button>');
  }

  function showHowto(back) {
    var rules = T.rules.map(function (r, i) { return '<li><b>' + (i + 1) + '</b>' + r + '</li>'; }).join('');
    var boosts = ['undo', 'slot', 'shuffle', 'chef'].map(function (k) {
      return '<li><i>' + A.ICONS[k] + '</i><strong>' + T.b[k] + '</strong> – ' + T.boostHelp[k] + '</li>';
    }).join('');
    showOverlay('<h2>' + T.howto + '</h2><ul class="rules">' + rules + '</ul><ul class="rules boosts">' + boosts + '</ul>' +
      '<button class="btn" data-act="' + back + '">' + T.ok + '</button>');
    showBack();
  }

  function showPause() {
    if (screen !== 'game' || over) return;
    paused = true;
    hideTutorial();
    showOverlay('<h2>' + T.pause + '</h2>' +
      '<div class="toggle-row"><span>' + T.sound + '</span><button class="switch' + (Save.data.sound ? '' : ' off') + '" data-act="sound">' + (Save.data.sound ? T.on : T.off) + '</button></div>' +
      '<div class="toggle-row"><span>' + T.haptics + '</span><button class="switch' + (Save.data.haptics ? '' : ' off') + '" data-act="haptics">' + (Save.data.haptics ? T.on : T.off) + '</button></div>' +
      '<button class="btn" data-act="resume">' + T.resume + '</button>' +
      '<div class="row2"><button class="btn plain small" data-act="howto-pause">' + T.howto + '</button>' +
      '<button class="btn plain small" data-act="restart">' + T.retry + '</button></div>');
    showBack();
  }

  function onWin() {
    over = true;
    hideTutorial();
    var bonus = 15 + def.n * 2;
    Save.data.coins += bonus;
    Save.data.level = def.n + 1;
    if (def.n === 1) Save.data.tutorial = true;
    Save.save();
    updateHud();
    Sfx.win(); Hap.notify('success');
    confetti();
    setTimeout(function () {
      var fan = '';
      def.types.slice(0, 5).forEach(function (t, i, arr) {
        var mid = (arr.length - 1) / 2;
        fan += '<img alt="" src="' + A.url(t) + '" style="transform:rotate(' + ((i - mid) * 15) + 'deg) translateY(' + (Math.abs(i - mid) * 6) + 'px)">';
      });
      showOverlay('<div class="fan">' + fan + '</div><h1>' + T.winTitle + '</h1><p>' + T.winSub(def.n) + '</p>' +
        '<div class="reward">' + coinHtml() + '+' + (bonus + COIN_PER_ORDER * state.total / 3) + '</div>' +
        '<button class="btn" data-act="next">' + T.next + '</button>');
    }, 450);
  }

  function costBtn(k, cls) {
    var dis = Save.data.coins < PRICES[k] || !boosterUsable(k);
    return '<button class="btn small ' + (cls || '') + '" data-act="b-' + k + '"' + (dis ? ' disabled' : '') + '>' + T.b[k] +
      ' <span class="cost">' + coinHtml() + PRICES[k] + '</span></button>';
  }

  function onStuck() {
    if (over) return;
    over = true;
    hideTutorial();
    Sfx.lose(); Hap.notify('error');
    setTimeout(function () {
      if (!over || state.done) return;
      showOverlay('<h2>' + T.loseTitle + '</h2><p>' + T.loseSub + '</p>' +
        costBtn('slot', 'orange') + costBtn('shuffle', 'orange') + costBtn('undo', 'orange') +
        '<button class="btn plain" data-act="restart">' + T.retry + '</button>');
    }, 500);
  }

  function onBack() {
    if (screen !== 'game') return;
    if (paused) { paused = false; hideOverlay(); }
  }

  function onOverlayClick(e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    Sfx.unlock();
    var act = b.dataset.act;
    Hap.impact('light');
    if (act === 'play') startLevel(Save.data.level);
    else if (act === 'howto') showHowto('back-start');
    else if (act === 'back-start') showStart();
    else if (act === 'howto-pause') showHowto('back-pause');
    else if (act === 'back-pause') { paused = false; showPause(); }
    else if (act === 'resume') { paused = false; hideOverlay(); }
    else if (act === 'restart') startLevel(def.n);
    else if (act === 'next') startLevel(Save.data.level);
    else if (act === 'sound') { Save.data.sound = !Save.data.sound; Save.save(); paused = false; showPause(); }
    else if (act === 'haptics') { Save.data.haptics = !Save.data.haptics; Hap.on = Save.data.haptics; Save.save(); paused = false; showPause(); }
    else if (act.indexOf('b-') === 0) useBooster(act.slice(2));
  }

  // ---------- init ----------
  async function init() {
    setupTelegram();
    $('#coinIc').innerHTML = A.ICONS.coin;
    $('#progIc').innerHTML = '<img alt="" src="' + A.url(0) + '">';
    $('#pauseBtn').innerHTML = A.ICONS.pause;
    document.querySelectorAll('#boosters .boost').forEach(function (b) {
      var k = b.dataset.b;
      b.querySelector('.bi').innerHTML = A.ICONS[k];
      b.querySelector('.price i').innerHTML = A.ICONS.coin;
      b.querySelector('.price b').textContent = PRICES[k];
      b.setAttribute('aria-label', T.b[k]);
      b.addEventListener('click', function () { useBooster(k); });
    });
    $('#board').addEventListener('pointerdown', onBoardDown);
    $('#rack').addEventListener('click', function (e) { if (e.target.closest('.add')) useBooster('slot'); });
    $('#pauseBtn').addEventListener('click', function () { Sfx.unlock(); showPause(); });
    $('#overlay').addEventListener('click', onOverlayClick);
    window.addEventListener('resize', layout);
    await Promise.all([Save.load(), A.preload()]);
    Hap.on = Save.data.haptics !== false;
    // a quiet background level so the start screen has a game behind it
    def = E.generateLevel(Save.data.level);
    state = E.createState(def);
    E.start(state);
    syncView();
    buildBoard();
    renderPlates();
    renderRack();
    updateHud();
    layout();
    showStart();
  }

  // debug hooks for automated checks
  window.__gm = { get state() { return state; }, get def() { return def; }, startLevel: startLevel, useBooster: useBooster, save: Save };

  init();
})();
