/* Grill Master – UI, animations, Telegram Mini App integration. */
(function () {
  'use strict';
  var E = window.Engine;
  var A = window.Art;
  var $ = function (s) { return document.querySelector(s); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // ---------- board geometry (logical px, the board is scaled to fit) ----------
  // cell SW x IH; TOPP leaves room above the cell for the darker skewer of the next layer
  var SW = 40, IH = 80, PAD = 5, CG = 2, TOPP = 9, TGAP = 7, ROWG = 10, BW = 420;
  var GH = TOPP + IH + PAD;
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
    locked: 'Спочатку звільни гриль', conveyor: 'Конвеєр! Грилі рухаються',
    b: { undo: 'Назад', slot: '+1 місце', shuffle: 'Перемішати', chef: 'Кухар' },
    rules: [
      'Торкайся шашликів на грилі. Якщо такий шашлик є в замовленні, він полетить на тарілку.',
      'Якщо замовлення немає, шашлик чекає на решітці. На ній лише 5 місць.',
      '3 однакові шашлики на тарілці – замовлення готове. Збери все, щоб пройти рівень.',
      'Темні шашлики позаду – наступний шар. Вони стануть доступні, коли звільниш увесь гриль.',
      'Деякі грилі їдуть на конвеєрі. Лови потрібний шашлик, поки він на екрані!'
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
    locked: 'Empty the grill first', conveyor: 'Conveyor! The grills move',
    b: { undo: 'Undo', slot: '+1 slot', shuffle: 'Shuffle', chef: 'Chef' },
    rules: [
      'Tap skewers on the grill. If an order needs it, it flies to the plate.',
      'Otherwise the skewer waits on the rack. The rack has only 5 slots.',
      '3 same skewers on a plate complete the order. Serve everything to win.',
      'Dark skewers behind are the next layer. They unlock when the whole grill is empty.',
      'Some grills ride on a conveyor. Catch the skewer you need while it is on screen!'
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
  var arriving = new Map(); // item id -> number of flyers still on the way
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
    clearFx();
    busy = 0; over = false; paused = false;
    syncView();
    buildBoard();
    renderPlates();
    for (var p = 0; p < view.plates.length; p++) renderPlates(p);
    renderRack();
    updateHud();
    layout();
    screen = 'game';
    beltT = 0;
    if (n === 1 && !Save.data.tutorial) setTimeout(showTutorial, 650);
    if (belts.length && !Save.data.seenConveyor) {
      Save.data.seenConveyor = true;
      Save.save();
      setTimeout(function () { toast(T.conveyor); }, 500);
    }
  }

  // ---------- board ----------
  function trayW(t) { return t.slots * SW + (t.slots - 1) * CG + PAD * 2; }

  // Conveyor rows: grills ride on a belt that loops around the visible window.
  var belts = [];
  var beltT = 0, lastFrame = 0, viewExt = 0;

  function buildBoard() {
    var board = $('#board');
    board.innerHTML = '';
    trayEls = [];
    belts = [];
    var y = 6;
    var k = 0;
    def.rows.forEach(function (row, r) {
      var info = (def.rowInfo && def.rowInfo[r]) || { conv: false };
      var rowEl = document.createElement('div');
      rowEl.className = 'row' + (info.conv ? ' conv' : '');
      rowEl.style.top = y + 'px';
      rowEl.style.height = (GH + 4) + 'px';
      rowEl.style.width = BW + 'px';
      if (info.conv) {
        var beltBg = document.createElement('div');
        beltBg.className = 'belt' + (info.dir < 0 ? ' rev' : '');
        beltBg.style.animationDuration = (24 / info.speed) + 's';
        rowEl.appendChild(beltBg);
      }
      board.appendChild(rowEl);
      var widths = row.map(function (ti) { return trayW(state.trays[ti]); });
      var total = widths.reduce(function (a, b) { return a + b; }, 0) + TGAP * (row.length - 1);
      var x = info.conv ? 0 : (BW - total) / 2;
      var belt = info.conv ? { row: rowEl, items: [], dir: info.dir, speed: info.speed, len: 0, wmax: Math.max.apply(null, widths) } : null;
      row.forEach(function (ti, j) {
        var tr = state.trays[ti];
        var el = document.createElement('div');
        el.className = 'tray ' + tr.kind;
        el.dataset.t = ti;
        el.style.width = widths[j] + 'px';
        if (!belt) el.style.left = x + 'px';
        var cells = '';
        for (var s = 0; s < tr.slots; s++) cells += '<div class="cell" data-s="' + s + '" style="left:' + (PAD + s * (SW + CG)) + 'px"></div>';
        el.innerHTML = '<div class="grill">' + cells + '</div><div class="badge"></div>';
        rowEl.appendChild(el);
        trayEls[ti] = el;
        if (belt) belt.items.push({ el: el, base: x, w: widths[j] });
        x += widths[j] + TGAP;
        renderTray(ti, true, k++ * 40);
      });
      if (belt) { belt.len = x; belts.push(belt); }
      y += GH + ROWG;
    });
    boardH = y - ROWG + 6;
    board.style.width = BW + 'px';
    board.style.height = boardH + 'px';
    positionBelts();
  }

  function positionBelts() {
    if (!belts.length) return;
    var win = BW + viewExt * 2;
    belts.forEach(function (b) {
      var L = Math.max(b.len, win + b.wmax + TGAP);
      var shift = b.dir * b.speed * beltT;
      b.items.forEach(function (it) {
        var pos = ((it.base + shift) % L + L) % L;
        var x = pos < L - it.w ? pos : pos - L;
        it.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      });
    });
  }

  function frame(now) {
    var dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    var moving = belts.length && screen === 'game' && !paused && !over;
    document.body.classList.toggle('still', !moving);
    if (moving) {
      beltT += dt;
      positionBelts();
    }
    requestAnimationFrame(frame);
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

  // One cell shows the skewer of the top layer and, behind it, the darker skewer of the next layer.
  function renderTray(ti, pop, delay) {
    var tr = state.trays[ti], el = trayEls[ti];
    if (!el) return;
    var grill = el.children[0], badge = el.children[1];
    var top = tr.layers[0] || [];
    var nxt = tr.layers[1] || [];
    for (var s = 0; s < tr.slots; s++) {
      var cell = grill.children[s];
      var it = top[s], bk = nxt[s];
      var curB = cell.querySelector('img.back');
      if (bk) {
        if (!curB || +curB.dataset.id !== bk.id) {
          if (curB) curB.remove();
          var b = itemImg(bk.type, bk.id, 'back' + (pop ? ' fade' : ''));
          cell.insertBefore(b, cell.firstChild);
        }
      } else if (curB) curB.remove();
      var curF = cell.querySelector('img.front');
      if (it) {
        if (!curF || +curF.dataset.id !== it.id) {
          if (curF) curF.remove();
          var img = itemImg(it.type, it.id, 'front' + (pop ? ' pop' : ''));
          if (pop) img.style.animationDelay = ((delay || 0) + s * 50) + 'ms';
          cell.appendChild(img);
        }
      } else if (curF) curF.remove();
      cell.classList.toggle('locked', !it && !!bk);
    }
    var n = tr.layers.length;
    badge.textContent = n > 1 ? String(n) : '';
    badge.style.display = n > 1 ? '' : 'none';
    el.classList.toggle('done', n === 0);
  }

  function layout() {
    var wrap = $('#boardWrap');
    var board = $('#board');
    if (!wrap || !board) return;
    var W = wrap.clientWidth - 8, H = wrap.clientHeight - 8;
    if (W <= 0 || H <= 0) return;
    var s = Math.min(W / BW, H / boardH, 1.3);
    var x = (wrap.clientWidth - BW * s) / 2;
    var y = Math.max(4, (wrap.clientHeight - boardH * s) / 2);
    board.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    // conveyor rows run across the whole screen width, not only the board width
    viewExt = Math.max(0, (wrap.clientWidth / s - BW) / 2);
    belts.forEach(function (b) {
      b.row.style.left = (-viewExt) + 'px';
      b.row.style.width = (BW + viewExt * 2) + 'px';
    });
    positionBelts();
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
    $('#lvl').innerHTML = T.level + ' ' + def.n + (def.hard ? '<span class="hard" title="' + T.hard + '">🔥</span>' : '');
    showCoins();
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

  // ---------- turn playback ----------
  // The engine state changes at once on every tap, and the plates and the rack are drawn from it at once.
  // So taps are never blocked. Animations only decorate the result: flyers carry items to their slots,
  // and a served plate (a copy over the real plate) waits for its last item, then flies away.
  var ghosts = new Set();
  var lastGhost = {};
  var coinLag = 0; // coins already earned but still flying to the counter

  function markArriving(id) { arriving.set(id, (arriving.get(id) || 0) + 1); }

  function targetEl(id) {
    var q = 'img[data-id="' + id + '"]';
    return document.querySelector('#fx .ghost-plate ' + q) || document.querySelector('#plates ' + q) || document.querySelector('#rack ' + q);
  }

  function land(id) {
    var n = (arriving.get(id) || 1) - 1;
    if (n > 0) { arriving.set(id, n); return; }
    arriving.delete(id);
    var el = targetEl(id);
    if (el) {
      el.classList.remove('arriving');
      el.animate([{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
    }
    ghosts.forEach(checkGhost);
  }

  function flyTo(id, type, from, delay) {
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
      ], { duration: dur, delay: delay || 0, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
      var done = false;
      var finish = function () { if (done) return; done = true; fl.remove(); land(id); resolve(); };
      anim.onfinish = finish;
      anim.oncancel = finish;
    });
    flights.add(p);
    p.then(function () { flights.delete(p); });
    return p;
  }

  function waitFlights() { return Promise.all(Array.from(flights)); }

  // A copy of a finished plate. It covers the real plate (which already shows the next order)
  // until all its items have landed, then it flies away.
  function makeGhost(p, items) {
    var plateEl = $('#plates').children[p];
    if (!plateEl) return;
    var r = plateEl.getBoundingClientRect();
    var g = document.createElement('div');
    g.className = 'plate ghost-plate';
    g.style.cssText = 'position:fixed;margin:0;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    var inner = document.createElement('div');
    inner.className = 'plate-in';
    items.forEach(function (it) {
      var sl = document.createElement('div');
      sl.className = 'pslot';
      sl.appendChild(itemImg(it.type, it.id, arriving.has(it.id) ? 'arriving' : ''));
      inner.appendChild(sl);
    });
    g.appendChild(inner);
    var prev = lastGhost[p];
    var fx = $('#fx');
    if (prev && prev.el.parentNode) fx.insertBefore(g, prev.el); else fx.appendChild(g);
    var gh = { p: p, el: g, ids: items.map(function (i) { return i.id; }), dead: false };
    gh.landed = new Promise(function (res) { gh.onLanded = res; });
    gh.started = new Promise(function (res) { gh.onStarted = res; });
    gh.gone = new Promise(function (res) { gh.onGone = res; });
    ghosts.add(gh);
    lastGhost[p] = gh;
    Promise.all([prev ? prev.started : null, gh.landed])
      .then(function () { return sleep(90); })
      .then(function () { serveGhost(gh); });
    checkGhost(gh);
  }

  function checkGhost(gh) {
    if (gh.ids.every(function (id) { return !arriving.has(id); })) gh.onLanded();
  }

  function serveGhost(gh) {
    if (gh.dead) return;
    gh.onStarted();
    var r = gh.el.getBoundingClientRect();
    Sfx.serve(); Hap.impact('medium');
    coinBurst(r.left + r.width / 2, r.top + r.height / 2, COIN_PER_ORDER);
    setTimeout(function () { coinLag = Math.max(0, coinLag - COIN_PER_ORDER); showCoins(); }, 700);
    if (lastGhost[gh.p] === gh) {
      delete lastGhost[gh.p];
      var real = $('#plates').children[gh.p];
      if (real && !real.classList.contains('empty')) { real.classList.remove('enter'); void real.offsetWidth; real.classList.add('enter'); }
    }
    var anim = gh.el.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.1)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(-46px) scale(.55)', opacity: 0 }
    ], { duration: 480, easing: 'ease-in', fill: 'forwards' });
    var done = function () { gh.el.remove(); ghosts.delete(gh); gh.onGone(); };
    anim.onfinish = done;
    anim.oncancel = done;
  }

  // Stops all flyers and served plates at once (undo, restart, new level).
  function clearFx() {
    ghosts.forEach(function (g) { g.dead = true; g.el.remove(); g.onGone(); });
    ghosts.clear();
    lastGhost = {};
    document.querySelectorAll('#fx .flyer').forEach(function (f) {
      f.getAnimations().forEach(function (a) { a.cancel(); });
      f.remove();
    });
    arriving.clear();
    coinLag = 0;
  }

  function settle() {
    return waitFlights().then(function () {
      return Promise.all(Array.from(ghosts).map(function (g) { return g.gone; }));
    });
  }

  function showCoins() {
    $('#coins').textContent = Save.data.coins - coinLag;
  }

  // ---------- input ----------
  // Big hit area: a tap anywhere on a grill, its frame or the gap next to it picks the nearest skewer slot.
  var HIT_SLACK = 9; // screen px around each grill
  function hitCell(e) {
    var direct = e.target.closest && e.target.closest('.cell');
    if (direct) return direct;
    var x = e.clientX, y = e.clientY, best = null, bd = Infinity;
    for (var ti = 0; ti < trayEls.length; ti++) {
      var el = trayEls[ti];
      if (!el) continue;
      var r = el.getBoundingClientRect();
      if (x < r.left - HIT_SLACK || x > r.right + HIT_SLACK || y < r.top - HIT_SLACK || y > r.bottom + HIT_SLACK) continue;
      var dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
      var d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = el; }
    }
    if (!best) return null;
    var cells = best.children[0].children, pick = null, px = Infinity;
    for (var c = 0; c < cells.length; c++) {
      var cr = cells[c].getBoundingClientRect();
      var cx = Math.abs(x - (cr.left + cr.width / 2));
      if (cx < px) { px = cx; pick = cells[c]; }
    }
    return pick;
  }

  function onBoardDown(e) {
    var cell = hitCell(e);
    if (!cell) return;
    e.preventDefault();
    Sfx.unlock();
    if (over || paused || screen !== 'game' || state.done) return;
    var ti = +cell.closest('.tray').dataset.t;
    var si = +cell.dataset.s;
    var top = state.trays[ti].layers[0];
    var it = top && top[si];
    if (!it) {
      if (cell.classList.contains('locked')) {
        cell.classList.remove('shake'); void cell.offsetWidth; cell.classList.add('shake');
        setTimeout(function () { cell.classList.remove('shake'); }, 320);
        Hap.impact('soft');
        if (!onBoardDown._lockHint) { onBoardDown._lockHint = true; toast(T.locked); }
      }
      return;
    }
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
    var img = cell.querySelector('img.front');
    var rects = {};
    rects[it.id] = img ? img.getBoundingClientRect() : cell.getBoundingClientRect();
    undoStack.push(E.clone(state));
    if (undoStack.length > 40) undoStack.shift();
    var ev = E.tap(state, ti, si);
    play(ev, rects);
  }

  function play(ev, fromRects) {
    var s0 = state;
    var rackBefore = rackRects();
    var touched = {};
    ev.forEach(function (e) { if (e.t === 'take' || e.t === 'reveal') touched[e.tray] = true; });
    Object.keys(touched).forEach(function (ti) { renderTray(+ti, true, 0); });
    // Follow the plates through the events to know which items each served plate holds.
    var sim = view.plates.map(function (p) { return { type: p.type, items: p.items.slice() }; });
    var served = [], moves = [], win = false, stuck = false;
    ev.forEach(function (e) {
      if (e.t === 'toPlate' || e.t === 'toBuffer' || e.t === 'transfer') {
        if (e.t !== 'toBuffer') sim[e.plate].items.push({ id: e.id, type: e.type });
        moves.push({ e: e, from: e.t === 'transfer' ? rackBefore[e.id] : fromRects[e.id] });
        markArriving(e.id);
      } else if (e.t === 'complete') {
        served.push({ p: e.plate, items: sim[e.plate].items });
        sim[e.plate] = { type: null, items: [] };
        Save.data.coins += COIN_PER_ORDER;
        coinLag += COIN_PER_ORDER;
      } else if (e.t === 'order') sim[e.plate] = { type: e.type, items: [] };
      else if (e.t === 'win') win = true;
      else if (e.t === 'stuck') stuck = true;
    });
    syncView();
    renderPlates();
    renderRack(rackBefore);
    served.forEach(function (sv) { makeGhost(sv.p, sv.items); });
    // Items from the board leave one after another; items from the rack go to a new order after the serve.
    var t = 0, tt = 380;
    moves.forEach(function (m) {
      var e = m.e, delay;
      if (e.t === 'transfer') { delay = Math.max(tt, t); tt = delay + 100; } else { delay = t; t += 110; }
      flyTo(e.id, e.type, m.from, delay);
      var sfx = function () {
        if (e.t === 'toBuffer') { Sfx.rack(); Hap.impact('soft'); } else { Sfx.tap(); Hap.impact('light'); }
      };
      if (delay) setTimeout(sfx, delay); else sfx();
    });
    if (win || stuck) {
      settle().then(function () {
        if (state !== s0) return;
        if (win) onWin();
        else if (!state.done && !E.hasMove(state)) onStuck();
      });
    }
    updateHud();
    Save.save();
  }

  // ---------- effects ----------
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
  function useBooster(k) {
    Sfx.unlock();
    if (!state || paused || screen !== 'game') return;
    if (state.done) return;
    if (Save.data.coins < PRICES[k]) { toast(T.noCoins); Sfx.error(); Hap.notify('error'); return; }
    if (k === 'undo' && !undoStack.length) { toast(T.noUndo); return; }
    if (k === 'slot' && state.cap >= E.MAX_CAP) { toast(T.maxSlots); return; }
    if (k === 'chef' && !boosterUsable('chef')) { toast(T.noChef); return; }
    if (k === 'shuffle' && !boosterUsable('shuffle')) return;
    hideTutorial();
    try {
      if (k === 'undo') {
        clearFx();
        state = undoStack.pop();
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
          var cellEl = trayEls[e.tray].children[0].children[e.slot];
          var img = e.depth === 0 ? cellEl.querySelector('img.front') : e.depth === 1 ? cellEl.querySelector('img.back') : null;
          rects[e.id] = (img || cellEl).getBoundingClientRect();
        });
        Save.data.coins -= PRICES[k];
        Sfx.magic();
        play(ev, rects);
        afterRescue();
        return;
      }
      Save.data.coins -= PRICES[k];
      Sfx.magic(); Hap.impact('medium');
      afterRescue();
    } finally {
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
    $('#boardWrap').addEventListener('pointerdown', onBoardDown);
    $('#rack').addEventListener('click', function (e) { if (e.target.closest('.add')) useBooster('slot'); });
    $('#pauseBtn').addEventListener('click', function () { Sfx.unlock(); showPause(); });
    $('#overlay').addEventListener('click', onOverlayClick);
    window.addEventListener('resize', layout);
    requestAnimationFrame(frame);
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
