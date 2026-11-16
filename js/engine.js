/* Grill Master – game engine: level generator, rules, solvability simulator.
 * Pure logic, no DOM. Works in the browser (window.Engine) and in Node (module.exports). */
(function (root) {
  'use strict';

  var NUM_TYPES = 24;
  var GEN_VERSION = 6;
  var MAX_CAP = 7;

  // ---------- seeded random ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash() {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < arguments.length; i++) {
      var n = arguments[i] >>> 0;
      h = Math.imul(h ^ (n & 0xffff), 16777619);
      h = Math.imul(h ^ (n >>> 16), 16777619);
    }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return h >>> 0;
  }
  function shuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // ---------- level parameters ----------
  // Row patterns: G = big grill (3 skewers), S = small grill (1 skewer).
  // Static rows must fit the board width; conveyor rows are longer than the screen and loop.
  var POOL_EASY = ['GG', 'GSG', 'SGS'];
  var POOL_MID = POOL_EASY.concat(['GGG', 'SGGS', 'GSSG', 'GSG']);
  var POOL_LATE = POOL_MID.concat(['SSGSS', 'SSSSS', 'GGG']);
  var POOL_CONV = ['GGGG', 'GSGSG', 'GGSGG', 'SGSGSG', 'GGGG'];

  // ---------- level modes ----------
  // Every level has a layout mode. A mode first appears on its "from" level; after that the
  // unlocked modes rotate, so two levels in a row almost never look the same.
  var MODES = [
    { id: 'classic', from: 1 },
    { id: 'giants', from: 4 },
    { id: 'conveyor', from: 6, conv: true },
    { id: 'singles', from: 8 },
    { id: 'pyramid', from: 10, shape: ['S', 'SS', 'SGS', 'GSG', 'GGG'] },
    { id: 'tower', from: 13 },
    { id: 'diamond', from: 16, shape: ['SGS', 'GSG', 'GGG', 'GSG', 'SGS'] },
    { id: 'carousel', from: 19, conv: true },
    { id: 'funnel', from: 22, shape: ['GGG', 'GSG', 'SGS', 'SS', 'S'] },
    { id: 'hourglass', from: 26, shape: ['GGG', 'GSG', 'SS', 'GSG', 'GGG'] }
  ];
  // Twists change the rules of one level. From level 9 some levels get one.
  var TWISTS = [
    { id: 'turbo', from: 9, needConv: true }, // faster conveyors
    { id: 'foil', from: 11 },                 // the next layer is wrapped in foil (hidden)
    { id: 'feast', from: 14 },                // 4 plates, more kinds of food
    { id: 'tight', from: 18 }                 // rack has 4 places
  ];

  function rawMode(n) {
    if (n <= 3) return MODES[0];
    for (var i = 0; i < MODES.length; i++) if (MODES[i].from === n) return MODES[i];
    var U = MODES.filter(function (m) { return m.from <= n; });
    return U[hash(GEN_VERSION, n, 31) % U.length];
  }
  function modeFor(n) {
    var m = rawMode(n);
    if (n > 4 && m.from !== n && m === rawMode(n - 1)) {
      var U = MODES.filter(function (x) { return x.from <= n; });
      m = U[(U.indexOf(m) + 1 + hash(n, 7) % (U.length - 1)) % U.length];
    }
    return m;
  }
  function twistFor(n, mode) {
    var ok = function (t) { return t.from <= n && (!t.needConv || mode.conv); };
    for (var i = 0; i < TWISTS.length; i++) if (TWISTS[i].from === n && ok(TWISTS[i])) return TWISTS[i];
    var U = TWISTS.filter(ok);
    if (!U.length) return null;
    var chance = Math.min(0.55, 0.3 + (n - 9) * 0.01);
    if ((hash(GEN_VERSION, n, 53) % 1000) / 1000 >= chance) return null;
    return U[hash(GEN_VERSION, n, 59) % U.length];
  }

  function levelParams(n) {
    var hard = n >= 5 && n % 5 === 0;
    var mode = modeFor(n);
    if (n === 9) mode = MODES[2]; // the turbo twist is introduced on a conveyor level
    var twist = twistFor(n, mode);
    var tw = twist ? twist.id : null;
    var vary = 0.9 + (hash(GEN_VERSION, n, 71) % 1000) / 1000 * 0.2;
    // More kinds of food make levels harder: 4 on level 1, 8 on level 10, up to 18.
    var types = Math.min(18, 3 + Math.ceil(n * 0.5));
    if (tw === 'feast') types += 2;
    if (tw === 'tight') types -= 1;
    types = clamp(types, 3, NUM_TYPES);
    // Long levels: 30 skewers on level 1, 75 on level 5, up to about 300.
    var base = n <= 3 ? 10 + 5 * (n - 1) : Math.min(100, Math.round(25 + (n - 5) * 2.5));
    var lenMul = { tower: 0.8, singles: 0.85, pyramid: 0.8, diamond: 0.9, funnel: 0.8, hourglass: 0.9 }[mode.id] || 1;
    var triples = Math.max(types + 2, Math.round(base * lenMul * (n <= 3 ? 1 : vary)));
    var speed = (16 + Math.min(16, n * 0.45)) * (mode.id === 'conveyor' ? 1.15 : 1) * (tw === 'turbo' ? 1.5 : 1);

    var lay = { pool: n <= 3 ? POOL_EASY : n <= 7 ? POOL_MID : POOL_LATE, convPool: POOL_CONV,
      rowsMin: 4, rowsMax: 5, convChance: 0.8, convMin: n >= 12 ? 1 : 0, convMax: n < 12 ? 1 : 2,
      speedVar: 0.15, ratio: [1.6, 9], shape: null };
    if (n <= 1) { lay.rowsMin = lay.rowsMax = 2; }
    else if (n <= 3) { lay.rowsMin = lay.rowsMax = 3; }
    else if (n <= 6) { lay.rowsMin = 3; lay.rowsMax = 4; }
    if (n < 3) { lay.convChance = 0; lay.convMax = 0; }
    else if (n <= 5) lay.convChance = 0.6;
    if (mode.id === 'giants') {
      lay.pool = ['GG', 'GGG', 'GG']; lay.convPool = ['GGGG', 'GGGGG'];
      lay.rowsMin = 3; lay.convChance = n >= 6 ? 0.4 : 0; lay.convMin = 0; lay.convMax = 1;
    } else if (mode.id === 'singles') {
      lay.pool = ['SSSS', 'SSSSS', 'SSSSSS', 'SSSSSSS']; lay.convPool = ['SSSSSSSS', 'SSSSSSSSS'];
      lay.rowsMin = 3; lay.convChance = 0.4; lay.convMin = 0; lay.convMax = 1; lay.ratio = [2, 12];
    } else if (mode.id === 'conveyor') {
      lay.rowsMin = 3; lay.convChance = 1; lay.convMin = 2; lay.convMax = 4;
    } else if (mode.id === 'carousel') {
      lay.rowsMin = 3; lay.rowsMax = 4; lay.convChance = 1; lay.convMin = 9; lay.convMax = 9; lay.allConv = true; lay.speedVar = 0.3;
    } else if (mode.id === 'tower') {
      lay.pool = ['GGG', 'SGGS', 'GSG', 'GG']; lay.rowsMin = 2; lay.rowsMax = 3;
      lay.convChance = 0; lay.convMin = 0; lay.convMax = 0; lay.ratio = [4, 16];
    } else if (mode.shape) {
      lay.shape = mode.shape; lay.convChance = 0; lay.convMin = 0; lay.convMax = 0; lay.ratio = [1.6, 13];
    }
    if (hard) {
      lay.rowsMin = lay.rowsMax;
      if (mode.id === 'classic' && n >= 10) lay.convMin = 2;
    }

    var plates = tw === 'feast' ? 4 : 3;
    var cap = tw === 'tight' ? 4 : 5;
    var chaos = clamp((n - 4) * 0.006, 0, 0.1) + (hard ? 0.05 : 0);
    // Share of new orders that ask for food buried deep, not for food the player can reach.
    var mean = n <= 3 ? 0 : n <= 8 ? 0.12 : n <= 15 ? 0.18 : 0.16;
    if (hard) mean += 0.08;
    // Target win rate of the careful simulated player, who uses no boosters.
    var band;
    if (n <= 3) band = [0.85, 1.01];
    else if (n <= 8) band = [0.5, 0.92];
    else if (n <= 15) band = [0.35, 0.7];
    else band = [0.25, 0.5];
    if (hard) band = [band[0] * 0.6, band[1] * 0.75];
    var mix = Math.round(clamp(3 + n * 1.3, 3, 70) * (hard ? 1.4 : 1));
    return {
      n: n, hard: hard, mode: mode.id, twist: tw, fresh: { mode: mode.from === n && n > 1, twist: !!twist && twist.from === n },
      types: types, triples: triples, layout: lay,
      speed: speed, plates: plates, cap: cap, chaos: chaos, mean: mean, band: band, mix: mix
    };
  }

  function slotsOf(pat) { var k = 0; for (var i = 0; i < pat.length; i++) k += pat[i] === 'G' ? 3 : 1; return k; }

  // Picks the rows of grills for one level: how many rows, their patterns and which rows move.
  function pickLayout(P, rng) {
    var L = P.layout;
    if (L.shape) return { rows: L.shape.slice(), info: L.shape.map(function () { return { conv: false }; }) };
    var items = P.triples * 3;
    var best = null;
    for (var tries = 0; tries < 30; tries++) {
      var nRows = L.rowsMin + Math.floor(rng() * (L.rowsMax - L.rowsMin + 1));
      var nConv = 0;
      if (L.convMax > 0 && rng() < L.convChance) nConv = 1 + Math.floor(rng() * L.convMax);
      nConv = Math.max(L.convMin, Math.min(nConv, L.convMax, L.allConv ? nRows : nRows - 1));
      nConv = Math.min(nConv, L.allConv ? nRows : nRows - 1);
      var order = [];
      for (var r = 0; r < nRows; r++) order.push(r);
      var convSet = shuffle(order, rng).slice(0, nConv);
      var rows = [], info = [], slots = 0;
      var dir = rng() < 0.5 ? 1 : -1;
      for (var q = 0; q < nRows; q++) {
        var isConv = convSet.indexOf(q) >= 0;
        var pat = isConv ? L.convPool[Math.floor(rng() * L.convPool.length)] : L.pool[Math.floor(rng() * L.pool.length)];
        rows.push(pat);
        info.push(isConv ? { conv: true, dir: dir, speed: Math.round(P.speed * (1 - L.speedVar + rng() * 2 * L.speedVar)) } : { conv: false });
        if (isConv) dir = -dir;
        slots += slotsOf(pat);
      }
      var ratio = items / slots;
      var score = ratio < L.ratio[0] ? L.ratio[0] - ratio : ratio > L.ratio[1] ? ratio - L.ratio[1] : 0;
      if (!best || score < best.score) best = { rows: rows, info: info, score: score };
      if (score === 0) break;
    }
    return best;
  }

  // Builds one candidate layout. Returns a level definition (plain data).
  function buildDef(P, rng, attempt) {
    var items = P.triples * 3;
    var trays = [];
    var rows = [];
    var layout = pickLayout(P, rng);
    for (var r = 0; r < layout.rows.length; r++) {
      var pat = layout.rows[r];
      var row = [];
      for (var c = 0; c < pat.length; c++) {
        row.push(trays.length);
        trays.push({ kind: pat[c], slots: pat[c] === 'G' ? 3 : 1, n: 0 });
      }
      rows.push(row);
    }
    var S = 0;
    trays.forEach(function (t) { S += t.slots; });
    var L = Math.max(1, Math.ceil(items / (S * 0.92)));
    trays.forEach(function (t) {
      t.n = t.kind === 'G' ? Math.max(1, L - (rng() < 0.25 ? 1 : 0)) : L + 1 + (rng() < 0.5 ? 1 : 0);
    });
    function cap() { var c = 0; trays.forEach(function (t) { c += t.slots * t.n; }); return c; }
    function maxNulls() {
      var m = 0;
      trays.forEach(function (t) { if (t.kind === 'G') m += (t.n - 1) * 2 + 1; });
      return m;
    }
    while (cap() < items) trays[Math.floor(rng() * trays.length)].n++;
    var guard = 0;
    while ((cap() - items > maxNulls() || cap() - items > cap() * 0.22) && guard++ < 500) {
      var cand = trays.filter(function (t) { return t.n > 1 && cap() - t.slots >= items; });
      if (!cand.length) break;
      cand[Math.floor(rng() * cand.length)].n--;
    }

    // layers filled with "slot" markers first, then nulls are punched in
    trays.forEach(function (t) {
      t.layers = [];
      for (var d = 0; d < t.n; d++) {
        var l = [];
        for (var s = 0; s < t.slots; s++) l.push(1);
        t.layers.push(l);
      }
    });
    var nulls = cap() - items;
    var deep = [], top = [];
    trays.forEach(function (t, ti) {
      if (t.kind !== 'G') return;
      for (var d = 0; d < t.n; d++) for (var s = 0; s < 3; s++) (d === 0 ? top : deep).push([ti, d, s]);
    });
    shuffle(deep, rng); shuffle(top, rng);
    function nullsIn(l) { var k = 0; l.forEach(function (x) { if (x === null) k++; }); return k; }
    [deep, top].forEach(function (list, isTop) {
      for (var i = 0; i < list.length && nulls > 0; i++) {
        var p = list[i];
        var layer = trays[p[0]].layers[p[1]];
        if (nullsIn(layer) >= (isTop ? 1 : 2)) continue;
        layer[p[2]] = null; nulls--;
      }
    });
    if (nulls > 0) return null; // layout could not absorb empties, caller retries

    // choose types and per-type counts (multiples of 3)
    var all = [];
    for (var k = 0; k < NUM_TYPES; k++) all.push(k);
    var types = shuffle(all, rng).slice(0, P.types);
    var tripleCount = types.map(function () { return 1; });
    for (var x = types.length; x < P.triples; x++) tripleCount[Math.floor(rng() * types.length)]++;
    // Items follow an "order sequence": triples in random order, shallow positions get the
    // early triples. A windowed shuffle of size P.mix mixes them; a larger window is harder.
    var seq = [];
    types.forEach(function (tp, i) { for (var q = 0; q < tripleCount[i]; q++) seq.push(tp); });
    shuffle(seq, rng);
    var bag = [];
    seq.forEach(function (tp) { bag.push(tp, tp, tp); });
    for (var i = 0; i < bag.length; i++) {
      var j = i + Math.floor(rng() * Math.min(P.mix + 1, bag.length - i));
      var tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
    }
    var maxD = 0;
    trays.forEach(function (t) { maxD = Math.max(maxD, t.layers.length); });
    var bi = 0;
    for (var d = 0; d < maxD; d++) {
      var pos = [];
      trays.forEach(function (t, ti) {
        var l = t.layers[d];
        if (!l) return;
        l.forEach(function (x, si) { if (x !== null) pos.push([ti, si]); });
      });
      shuffle(pos, rng);
      pos.forEach(function (p) { trays[p[0]].layers[d][p[1]] = bag[bi++]; });
    }

    return {
      n: P.n, hard: P.hard, mode: P.mode, twist: P.twist, fresh: P.fresh, plates: P.plates, cap: P.cap, chaos: P.chaos, mean: P.mean,
      seed: hash(GEN_VERSION, P.n, attempt, 99),
      rows: rows, rowInfo: layout.info,
      trays: trays.map(function (t) { return { kind: t.kind, slots: t.slots, layers: t.layers }; }),
      types: types, total: items
    };
  }

  // ---------- game state & rules ----------
  function createState(def) {
    var id = 0;
    var unassigned = [];
    for (var k = 0; k < NUM_TYPES; k++) unassigned.push(0);
    var trays = def.trays.map(function (t) {
      return {
        kind: t.kind, slots: t.slots,
        layers: t.layers.map(function (l) {
          return l.map(function (tp) {
            if (tp === null) return null;
            unassigned[tp]++;
            return { id: id++, type: tp };
          });
        })
      };
    });
    var plates = [];
    for (var p = 0; p < def.plates; p++) plates.push({ type: null, items: [] });
    return {
      trays: trays, plates: plates, buffer: [], cap: def.cap, unassigned: unassigned,
      collected: 0, total: id, orderSeq: 0, seed: def.seed, chaos: def.chaos, mean: def.mean || 0, done: false
    };
  }

  function clone(s) {
    return JSON.parse(JSON.stringify(s));
  }

  function visible(s) {
    var out = [];
    for (var ti = 0; ti < s.trays.length; ti++) {
      var l = s.trays[ti].layers[0];
      if (!l) continue;
      for (var si = 0; si < l.length; si++) if (l[si]) out.push({ tray: ti, slot: si, id: l[si].id, type: l[si].type });
    }
    return out;
  }

  function accepting(s, type) {
    for (var p = 0; p < s.plates.length; p++) {
      var pl = s.plates[p];
      if (pl.type === type && pl.items.length < 3) return p;
    }
    return -1;
  }

  function countBy(list, key) {
    var c = [];
    for (var k = 0; k < NUM_TYPES; k++) c.push(0);
    list.forEach(function (x) { c[key ? x[key] : x.type]++; });
    return c;
  }

  function pickOrder(s) {
    var cands = [];
    for (var t = 0; t < NUM_TYPES; t++) {
      if (s.unassigned[t] < 3) continue;
      var used = false;
      for (var p = 0; p < s.plates.length; p++) if (s.plates[p].type === t) used = true;
      if (!used) cands.push(t);
    }
    if (!cands.length) return null;
    var rng = mulberry32(hash(s.seed, 0x9e37, s.orderSeq++));
    var roll = rng();
    if (roll < s.chaos) return cands[Math.floor(rng() * cands.length)];
    var mean = (s.mean || 0) * (s.buffer.length >= s.cap - 1 ? 0.5 : 1);
    var helpful = roll >= s.chaos + mean; // otherwise ask for food that is hard to reach
    var buf = countBy(s.buffer);
    var top = countBy(visible(s));
    var nxt = countBy([]), nxt2 = countBy([]);
    s.trays.forEach(function (tr) {
      (tr.layers[1] || []).forEach(function (it) { if (it) nxt[it.type]++; });
      (tr.layers[2] || []).forEach(function (it) { if (it) nxt2[it.type]++; });
    });
    var best = cands[0], bs = -1e9;
    cands.forEach(function (t) {
      // Helpful: food in the rack or on top. Not helpful: food the player cannot reach now,
      // but which lies 1-2 layers deeper, so the player has to dig for it.
      var sc = helpful ? buf[t] * 10 + top[t] * 3 + nxt[t] : -(buf[t] * 10 + top[t] * 3) + nxt[t] * 2 + nxt2[t];
      sc += rng() * 0.9;
      if (sc > bs) { bs = sc; best = t; }
    });
    return best;
  }

  function completePlate(s, p, ev) {
    var pl = s.plates[p];
    s.collected += 3;
    ev.push({ t: 'complete', plate: p, type: pl.type, ids: pl.items.map(function (i) { return i.id; }) });
    s.plates[p] = { type: null, items: [] };
    fillPlates(s, ev);
  }

  function fillPlates(s, ev) {
    for (var p = 0; p < s.plates.length; p++) {
      if (s.plates[p].type !== null) continue;
      var t = pickOrder(s);
      if (t === null) continue;
      s.unassigned[t] -= 3;
      s.plates[p].type = t;
      ev.push({ t: 'order', plate: p, type: t });
      var pl = s.plates[p];
      for (var i = 0; i < s.buffer.length && pl.items.length < 3;) {
        if (s.buffer[i].type === t) {
          var it = s.buffer.splice(i, 1)[0];
          pl.items.push(it);
          ev.push({ t: 'transfer', id: it.id, type: t, plate: p, idx: pl.items.length - 1 });
        } else i++;
      }
      if (pl.items.length === 3) completePlate(s, p, ev);
    }
  }

  function hasMove(s) {
    var vis = visible(s);
    if (!vis.length) return false;
    if (s.buffer.length < s.cap) return true;
    for (var i = 0; i < vis.length; i++) if (accepting(s, vis[i].type) >= 0) return true;
    return false;
  }

  function finish(s, ev) {
    if (s.collected >= s.total) { s.done = true; ev.push({ t: 'win' }); }
    else if (!hasMove(s)) ev.push({ t: 'stuck' });
  }

  function start(s) {
    var ev = [];
    fillPlates(s, ev);
    finish(s, ev);
    return ev;
  }

  function canTake(s, ti, si) {
    var l = s.trays[ti] && s.trays[ti].layers[0];
    var it = l && l[si];
    if (!it || s.done) return false;
    return accepting(s, it.type) >= 0 || s.buffer.length < s.cap;
  }

  function dropEmptyLayers(tray) {
    var before = tray.layers.length ? tray.layers[0] : null;
    tray.layers = tray.layers.filter(function (l) { return l.some(Boolean); });
    return tray.layers[0] !== before;
  }

  function place(s, item, ev) {
    var p = accepting(s, item.type);
    if (p >= 0) {
      s.plates[p].items.push(item);
      ev.push({ t: 'toPlate', id: item.id, type: item.type, plate: p, idx: s.plates[p].items.length - 1 });
      if (s.plates[p].items.length === 3) completePlate(s, p, ev);
    } else {
      var pos = s.buffer.length;
      for (var i = s.buffer.length - 1; i >= 0; i--) if (s.buffer[i].type === item.type) { pos = i + 1; break; }
      s.buffer.splice(pos, 0, item);
      ev.push({ t: 'toBuffer', id: item.id, type: item.type, idx: pos });
    }
  }

  function tap(s, ti, si) {
    if (!canTake(s, ti, si)) return null;
    var tray = s.trays[ti];
    var item = tray.layers[0][si];
    var ev = [];
    tray.layers[0][si] = null;
    ev.push({ t: 'take', id: item.id, type: item.type, tray: ti, slot: si, depth: 0 });
    if (dropEmptyLayers(tray)) ev.push({ t: 'reveal', tray: ti });
    place(s, item, ev);
    finish(s, ev);
    return ev;
  }

  // ---------- boosters ----------
  function addSlot(s) {
    if (s.cap >= MAX_CAP) return false;
    s.cap++;
    return true;
  }

  // Rearranges board items so that the items the plates need come to the top layers.
  function smartShuffle(s, rng) {
    rng = rng || Math.random;
    var positions = [];
    var pool = [];
    var maxD = 0;
    s.trays.forEach(function (t) { maxD = Math.max(maxD, t.layers.length); });
    for (var d = 0; d < maxD; d++) {
      var layerPos = [];
      s.trays.forEach(function (t, ti) {
        var l = t.layers[d];
        if (!l) return;
        l.forEach(function (it, si) { if (it) { layerPos.push([ti, d, si]); pool.push(it); } });
      });
      positions = positions.concat(shuffle(layerPos, rng));
    }
    if (!pool.length) return false;
    shuffle(pool, rng);
    var ordered = [];
    function take(type, k) {
      for (var i = 0; i < pool.length && k > 0;) {
        if (pool[i].type === type) { ordered.push(pool.splice(i, 1)[0]); k--; } else i++;
      }
    }
    s.plates.forEach(function (pl) { if (pl.type !== null) take(pl.type, 3 - pl.items.length); });
    var buf = countBy(s.buffer);
    var bt = [];
    for (var t = 0; t < NUM_TYPES; t++) if (buf[t]) bt.push(t);
    bt.sort(function (a, b) { return buf[b] - buf[a]; });
    bt.forEach(function (t) { if (buf[t] < 3) take(t, 3 - buf[t]); });
    ordered = ordered.concat(pool);
    // spread the priority items over different trays: positions of depth 0 are already shuffled
    positions.forEach(function (p, i) { s.trays[p[0]].layers[p[1]][p[2]] = ordered[i]; });
    return true;
  }

  // The chef serves one plate: takes the missing items from anywhere on the board.
  function chef(s) {
    var best = -1;
    s.plates.forEach(function (pl, p) {
      if (pl.type === null || pl.items.length >= 3) return;
      if (best < 0 || pl.items.length > s.plates[best].items.length) best = p;
    });
    if (best < 0) return null;
    var pl = s.plates[best];
    var need = 3 - pl.items.length;
    var found = [];
    var maxD = 0;
    s.trays.forEach(function (t) { maxD = Math.max(maxD, t.layers.length); });
    for (var d = 0; d < maxD && found.length < need; d++) {
      s.trays.forEach(function (t, ti) {
        var l = t.layers[d];
        if (!l) return;
        l.forEach(function (it, si) {
          if (it && it.type === pl.type && found.length < need) found.push({ ti: ti, d: d, si: si, it: it });
        });
      });
    }
    if (found.length < need) return null;
    var ev = [];
    var touched = {};
    found.forEach(function (f) {
      s.trays[f.ti].layers[f.d][f.si] = null;
      touched[f.ti] = true;
      ev.push({ t: 'take', id: f.it.id, type: f.it.type, tray: f.ti, slot: f.si, depth: f.d });
    });
    Object.keys(touched).forEach(function (ti) {
      dropEmptyLayers(s.trays[ti]);
      ev.push({ t: 'reveal', tray: +ti });
    });
    found.forEach(function (f) { place(s, f.it, ev); });
    finish(s, ev);
    return ev;
  }

  // ---------- solvability simulator ----------
  // A careful player: takes food the plates need, prefers moves that open useful food in
  // the next layer (hidden under foil), and keeps pairs together in the rack. No boosters.
  function simulate(def, rng) {
    var s = createState(def);
    start(s);
    var foil = def.twist === 'foil';
    for (var step = 0; step < 4000; step++) {
      if (s.done) return true;
      var vis = visible(s);
      if (!vis.length) return false;
      var buf = countBy(s.buffer), vc = countBy(vis), nx = countBy([]);
      if (!foil) s.trays.forEach(function (tr) { (tr.layers[1] || []).forEach(function (it) { if (it) nx[it.type]++; }); });
      var reveal = function (v) {
        var tr = s.trays[v.tray];
        if (foil || !tr.layers[1] || tr.layers[0].filter(Boolean).length !== 1) return 0;
        return tr.layers[1].filter(function (it) { return it && (buf[it.type] || accepting(s, it.type) >= 0); }).length;
      };
      var pick = null, bs = -1e9;
      var matches = vis.filter(function (v) { return accepting(s, v.type) >= 0; });
      if (matches.length) {
        matches.forEach(function (v) { var sc = reveal(v) * 2 + rng(); if (sc > bs) { bs = sc; pick = v; } });
      } else {
        if (s.buffer.length >= s.cap) return false;
        vis.forEach(function (v) {
          var sc = buf[v.type] * 10 + vc[v.type] * 2 + nx[v.type] + reveal(v) + rng() * 0.8;
          if (sc > bs) { bs = sc; pick = v; }
        });
      }
      tap(s, pick.tray, pick.slot);
    }
    return false;
  }

  function solveRate(def, runs, seed) {
    var rng = mulberry32(seed);
    var wins = 0;
    for (var r = 0; r < runs; r++) if (simulate(def, rng)) wins++;
    return wins / runs;
  }

  // Searches for a layout whose simulated solve rate is inside the level's band.
  // The mixing window adapts: too easy -> mix more, too hard -> mix less.
  function generateLevel(n) {
    var P = levelParams(n);
    var mix = P.mix, types = P.types;
    var best = null;
    for (var a = 0; a < 40; a++) {
      var rng = mulberry32(hash(GEN_VERSION, n, a));
      var def = buildDef(Object.assign({}, P, { mix: mix, types: Math.min(types, P.triples) }), rng, a);
      if (!def) continue;
      var rate = solveRate(def, 32, hash(n, a, 777));
      def.rate = rate;
      def.mix = mix;
      if (rate >= P.band[0] && rate <= P.band[1]) return def;
      var dist = rate < P.band[0] ? P.band[0] - rate : rate - P.band[1];
      if (rate === 0) dist += 1;
      if (!best || dist <= best.dist) best = { def: def, dist: dist };
      // Too easy: mix the order more, then add a kind of food. Too hard: the reverse.
      if (rate > P.band[1]) {
        if (mix >= 60 || rate > 0.99) types = Math.min(NUM_TYPES, types + 1);
        mix = Math.min(120, Math.ceil(mix * 1.35) + 1);
      } else {
        if (mix === 0 || rate < P.band[0] * 0.6) types = Math.max(Math.min(P.types, a < 28 ? 10 : 7), types - 1);
        mix = Math.max(0, Math.floor(mix * 0.7));
      }
    }
    return best.def;
  }

  var Engine = {
    NUM_TYPES: NUM_TYPES, MAX_CAP: MAX_CAP,
    MODES: MODES, TWISTS: TWISTS, levelParams: levelParams, generateLevel: generateLevel, solveRate: solveRate,
    createState: createState, start: start, clone: clone, visible: visible,
    accepting: accepting, canTake: canTake, tap: tap, hasMove: hasMove, finish: finish,
    addSlot: addSlot, smartShuffle: smartShuffle, chef: chef, mulberry32: mulberry32, hash: hash
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(this);
