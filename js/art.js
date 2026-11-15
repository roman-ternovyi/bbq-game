/* Grill Master – chunky cartoon SVG art for the skewers and UI icons.
   Each skewer: viewBox 0 0 60 120, food fills x 4..56 / y 2..100, short stick handle below. */
(function (root) {
  'use strict';

  var NAMES_UK = ['Шашлик', 'Курка', 'Креветки', 'Кукурудза', 'Ковбаска', 'Овочі',
    'Маршмелоу', 'Яблуко в карамелі', 'Полуниця в шоколаді', 'Броколі', 'Печериці', 'Чорниця',
    'Баклажан', 'Пончик'];
  var NAMES_EN = ['Beef kebab', 'Chicken', 'Shrimp', 'Corn', 'Sausage', 'Veggies',
    'Marshmallows', 'Candy apple', 'Choc strawberries', 'Broccoli', 'Mushrooms', 'Blueberries',
    'Eggplant', 'Donut'];

  var OL = '#3b1d0e'; // outline colour for every shape
  var CHAR = '#2a0f05'; // grill char marks

  function f(v) { return +v.toFixed(1); }
  function stops(list) {
    return list.map(function (s) {
      return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] === undefined ? '' : ' stop-opacity="' + s[2] + '"') + '/>';
    }).join('');
  }
  function lg(id, list, x1, y1, x2, y2) {
    return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 === undefined ? 0 : x2) + '" y2="' + (y2 === undefined ? 1 : y2) + '">' + stops(list) + '</linearGradient>';
  }
  // 3-tone cel shading: soft light spot top-left -> base colour -> hard-edged darker crescent lower right.
  function cel(id, light, base, shade, k) {
    k = k || 0.72;
    return '<radialGradient id="' + id + '" cx=".34" cy=".28" r=".85">' + stops([[0, light], [k * 0.6, base], [k, base], [k, shade]]) + '</radialGradient>';
  }
  function g(cx, cy, rot, body, sx) {
    return '<g transform="translate(' + cx + ' ' + cy + ')' + (rot ? ' rotate(' + rot + ')' : '') + (sx ? ' scale(' + sx + ' 1)' : '') + '">' + body + '</g>';
  }
  function sk(sw) { return sw === 0 ? '' : ' stroke="' + OL + '" stroke-width="' + (sw || 2.8) + '" stroke-linejoin="round"'; }
  function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + fill + '"' + sk(sw) + (ex || '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + sk(sw) + '/>'; }
  function el(cx, cy, rx, ry) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>'; }
  function R(x, y, w, h, rx, fill, sw) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + fill + '"' + sk(sw) + '/>'; }
  function hi(x, y, rx, ry, rot, op) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"' + (rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"' : '') + ' fill="#fff" opacity="' + (op || 0.6) + '"/>';
  }
  function ln(d, color, w, op, ex) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (w || 3.2) + '" stroke-linecap="round" stroke-linejoin="round"' + (op ? ' opacity="' + op + '"' : '') + (ex || '') + '/>';
  }
  function star(n, ro, ri, sy) {
    var d = '';
    for (var i = 0; i < n * 2; i++) {
      var a = Math.PI * i / n - Math.PI / 2, r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r * (sy || 1));
    }
    return d + 'Z';
  }
  function ell(rx, ry) { return 'M' + (-rx) + ' 0A' + rx + ' ' + ry + ' 0 1 0 ' + rx + ' 0A' + rx + ' ' + ry + ' 0 1 0 ' + (-rx) + ' 0Z'; }

  // Short wooden handle below the food (y 100..118), optional small pointed tip above it.
  function wrap(inner, defs, stickTop) {
    var t = stickTop === undefined ? 1 : stickTop;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">' +
      '<defs><filter id="ds" filterUnits="userSpaceOnUse" x="-4" y="-4" width="68" height="128"><feDropShadow dx="1" dy="1.8" stdDeviation="1" flood-color="#1a0800" flood-opacity=".4"/></filter>' + defs + '</defs>' +
      '<g filter="url(#ds)">' +
      P('M30 ' + t + 'L33.8 ' + (t + 9) + 'V112Q33.8 117.6 30 117.6Q26.2 117.6 26.2 112V' + (t + 9) + 'Z', '#e8b468', 2.2) +
      ln('M31.8 ' + (t + 11) + 'V112', '#b8793a', 2) +
      inner + '</g></svg>';
  }

  // ---------- 14 skewers ----------
  var S = [];

  // 0 Beef kebab: dark brown cubes, red pepper, white onion
  S[0] = function () {
    var defs = cel('m', '#b8693c', '#8c4321', '#55250e') + cel('p', '#ff7462', '#e8262b', '#a0111a') + cel('o', '#fff', '#f6eee0', '#d3bfa2');
    function meat(cy, rot) {
      return g(30, cy, rot, P('M-21 -10.5C-11 -12 9 -11.5 20.5 -10.8Q25 -10.5 24.6 -6C25.6 -1 25.2 3.5 24.2 7.5Q23.4 11 19 10.8C8 12 -9 11.6 -20 10.8Q-24.6 10.5 -24.6 6C-25.6 1 -25.2 -3.5 -24.6 -7Q-24.4 -10.4 -21 -10.5Z', 'url(#m)') +
        ln('M-20 3Q-14 6 -8 2', '#e0a37a', 2.2, 0.55) +
        ln('M-15 -8.5L-10 8.5M-3 -8.5L2 8.5M9 -8.5L14 8.5', CHAR, 4, 0.6) + hi(-15, -5.5, 5.5, 2.2, -8, 0.4) + hi(18, -5, 1.7, 1.7, 0, 0.45));
    }
    function pep(cy, rot) { return g(30, cy, rot, R(-22, -5, 44, 10, 4, 'url(#p)') + ln('M-15 -2H8', '#fff', 2.4, 0.75)); }
    function oni(cy) { return g(30, cy, 0, R(-23, -5, 46, 10, 5, 'url(#o)') + ln('M-17 .8H17', '#c9b393', 2, 0.9)); }
    return wrap(meat(12.5, -3) + pep(29, 3) + meat(45.5, 3) + oni(62) + meat(78.5, -2) + pep(95, -2), defs);
  };

  // 1 Chicken: golden-orange rounded chunks with green pepper
  S[1] = function () {
    var defs = cel('c', '#ffd772', '#f6a32a', '#c25f0f') + cel('gp', '#94e260', '#4cbf2e', '#2a7d1e');
    var ch = 'M-23 -5C-25 -12 -13 -13 -4 -11.5C6 -13.5 21 -13 23.5 -5C26 2.5 23 11 14 12C4 13.5 -10 13.5 -17.5 11.5C-25 9.5 -25.5 1 -23 -5Z';
    function chunk(cy, rot) {
      return g(30, cy, rot, P(ch, 'url(#c)') + ln('M-14 -9L-9 9M-1 -10L4 10M12 -9L16 5', '#6e2b06', 3.8, 0.55) +
        hi(-12, -5.5, 6, 2.6, -10, 0.6) + '<g fill="#2f7d22">' + el(-5, 5, 1.9, 1.2) + el(8, 1, 1.9, 1.2) + el(17, -3, 1.6, 1.1) + '</g>');
    }
    function gp(cy, rot) {
      return g(30, cy, rot, P('M-20 -4.5Q-20 -6.5 -17 -6.5L17 -5.5Q20 -5.5 20 -2.5L19 4.5Q19 6.5 16 6.5L-17 5.5Q-20 5.5 -20 2.5Z', 'url(#gp)') + ln('M-13 -2.5H9', '#e6ffc8', 2.4, 0.75));
    }
    return wrap(gp(33.5, 3) + gp(69.5, -3) + chunk(15.5, -4) + chunk(51, 4) + chunk(86.5, -2), defs);
  };

  // 2 Shrimp: glossy coral C-shaped curls, thick head tapering to a fan tail
  S[2] = function () {
    var rx = 16, ry = 10.5, N = 14, o = [], n = [], segs = '', hl = [];
    // point on the curled body: s 0 = tail .. 1 = head, side -1 inner edge .. +1 outer edge
    function at(s, side) {
      var th = (-45 - 270 * s) * Math.PI / 180, w = 8 + 9 * Math.pow(s, 0.7);
      return [(rx + side * w / 2) * Math.cos(th), (ry + side * w / 2) * Math.sin(th)];
    }
    function xy(p) { return f(p[0]) + ' ' + f(p[1]); }
    for (var i = 0; i <= N; i++) { o.push(xy(at(i / N, 1))); n.unshift(xy(at(i / N, -1))); }
    var he = at(1, 1), hn = at(1, -1), tx = 8.4, ty = -5.5;
    var body = 'M' + o.join('L') + 'C' + f(he[0] + tx) + ' ' + f(he[1] + ty) + ' ' + f(hn[0] + tx) + ' ' + f(hn[1] + ty) + ' ' + n.join('L') + 'Z';
    [0.26, 0.42, 0.58, 0.74].forEach(function (s) { segs += 'M' + xy(at(s, -0.55)) + 'L' + xy(at(s, 0.7)); });
    [0.06, 0.18, 0.3, 0.42, 0.54].forEach(function (s) { hl.push(xy(at(s, 0.42))); });
    var ey = at(0.92, 0.2), gl = at(0.68, 0.45), t0 = at(0, 0);
    var defs = cel('sh', '#ffb69c', '#ff8466', '#dc5038', 0.7) + cel('tl', '#ff9a7a', '#ff6242', '#d03c22') +
      '<g id="sp">' + g(f(t0[0] + 1), f(t0[1]), -20, P('M-1 -3.5L10 -10Q14.5 -4.5 11 0Q14.5 4.5 10 10L-1 3.5Z', 'url(#tl)', 2.4) + ln('M2 0H9', '#c33a20', 2, 0.7)) +
      P(body, 'url(#sh)') + ln(segs, '#cf4229', 2.6, 0.85) + ln('M' + hl.join('L'), '#fff', 3, 0.75) +
      hi(f(gl[0]), f(gl[1]), 1.8, 1.8, 0, 0.8) +
      '<circle cx="' + f(ey[0]) + '" cy="' + f(ey[1]) + '" r="2.6" fill="' + OL + '"/>' + hi(f(ey[0] - 0.8), f(ey[1] - 0.8), 0.8, 0.8, 0, 0.9) + '</g>';
    function one(cx, cy, rot, sx) { return g(cx, cy, rot, '<use href="#sp"/>', sx); }
    return wrap(one(29, 18, -4) + one(31, 50, 5, -1) + one(29, 82, -4), defs);
  };

  // 3 Corn: single yellow cob with kernel grid, char spots, green husk at the bottom
  S[3] = function () {
    var cob = 'M10 24C10 9 19 2 30 2C41 2 50 9 50 24V72C50 84 41 90 30 90C19 90 10 84 10 72Z';
    var defs = '<pattern id="k" width="6.2" height="6.6" patternUnits="userSpaceOnUse" x="1" y="0"><rect x=".5" y=".5" width="5.2" height="5.6" rx="2.2" fill="#ffd83a"/><rect x="1.2" y="1.2" width="2.4" height="2.2" rx="1" fill="#fff4a8"/></pattern>' +
      lg('cs', [[0, '#fff', 0.3], [0.3, '#fff', 0], [0.64, '#fff', 0], [0.64, '#9a4300', 0.32], [1, '#8a3a00', 0.42]], 0, 0, 1, 0) +
      cel('hk', '#9be060', '#62b834', '#3a8a22') + cel('hf', '#c0ec84', '#8fd456', '#5aa236');
    return wrap(
      P(cob, '#d88c0c') + P(cob, 'url(#k)', 0) +
      '<g fill="#5a2600" opacity=".45">' + el(37, 27, 4.5, 3.5) + el(19, 50, 4, 3.5) + el(38, 62, 4.5, 3.2) + el(24, 14, 3, 2.4) + '</g>' +
      P(cob, 'url(#cs)', 0) + hi(17.5, 32, 3.2, 14, 0, 0.6) + P(cob, 'none') +
      P('M31 100C17 98 6 85 3 58C11 66 21 73 30 81Z', 'url(#hk)') + ln('M27 95C18 90 11 81 7 68', '#c4f08a', 2, 0.8) +
      P('M29 100C43 98 54 85 57 58C49 66 39 73 30 81Z', 'url(#hk)') + ln('M33 95C42 90 49 81 53 68', '#2f7a1c', 2, 0.6) +
      P('M30 101C21 96 20 82 27 66C33 75 38 84 37 92C36 97 33 100 30 101Z', 'url(#hf)'), defs, 0);
  };

  // 4 Sausage: one long bent red-brown tube with diagonal cuts
  S[4] = function () {
    var p0 = [23, 20.5], p1 = [43, 51], p2 = [23, 81.5], c = 'M23 20.5Q43 51 23 81.5', cuts = '';
    for (var i = 0; i < 5; i++) {
      var t = 0.14 + i * 0.18, u = 1 - t;
      var x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
      var a = Math.atan2(2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]), 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])) * 180 / Math.PI;
      cuts += g(f(x + 0.5), f(y), f(a + 60), ln('M-8.5 0H8.5', '#4a1205', 6.2) + ln('M-7.5 -.9H7.5', '#ffbf96', 2.8));
    }
    return wrap(ln(c, OL, 37.5) + ln(c, '#8a2b16', 32) + ln(c, '#c9502c', 25, 0, ' transform="translate(-2.8 -1)"') +
      ln(c, '#e8784c', 11, 0, ' transform="translate(-7 -2)"') + cuts +
      ln('M15.5 34Q20 50 16.5 64', '#fff', 3.6, 0.6) + hi(41, 52, 1.6, 4, 0, 0.35), '');
  };

  // 5 Veggies: glossy red cherry tomatoes and grilled zucchini rounds
  S[5] = function () {
    var defs = cel('t', '#ff7a66', '#ec2f27', '#a3150e') + cel('zf', '#fbffd6', '#e8f0a6', '#c9d67f') +
      cel('zs', '#58b844', '#2f8a2a', '#1b5e1e') + cel('lv', '#7ad35a', '#45b83a', '#2b8526');
    function tom(cy) {
      return g(30, cy, 0, E(0, 0, 16.5, 14, 'url(#t)') + hi(-7, -5.5, 5, 3, -30, 0.85) + hi(8.5, 5, 1.7, 1.7, 0, 0.55) +
        P(star(5, 7.5, 2.8, 0.6), 'url(#lv)', 2, ' transform="translate(0 -11.5)"'));
    }
    function zuc(cy, rot) {
      return g(30, cy, rot, E(0, 2.5, 25, 10, 'url(#zs)') + E(0, -1.5, 25, 8, 'url(#zf)') +
        E(0, -1.5, 15, 4, 'none', 0).replace('/>', ' stroke="#c4d16a" stroke-width="2.2"/>') +
        ln('M-14 -6L-11 3M-2 -7.5L1 4M10 -6.5L13 2', '#4a3006', 3.6, 0.5));
    }
    return wrap(tom(17) + zuc(41.5, -4) + tom(66.5) + zuc(88.5, 4), defs);
  };

  // 6 Marshmallows: white puffy pillows with toasted golden edges
  S[6] = function () {
    var defs = '<radialGradient id="mt" cx=".42" cy=".4" r=".68">' + stops([[0, '#fffdf8'], [0.42, '#fff5e6'], [0.62, '#f8d290'], [0.8, '#de953f'], [1, '#9a4f16']]) + '</radialGradient>';
    var b = 'M-17 -10.5C-6 -12 6 -12 17 -10.5Q23 -10 22.5 -5C24 -2 24 2 22.5 5Q23 10 17 10.5C6 12 -6 12 -17 10.5Q-23 10 -22.5 5C-24 2 -24 -2 -22.5 -5Q-23 -10 -17 -10.5Z';
    function mm(cy, rot) { return g(30, cy, rot, P(b, 'url(#mt)') + E(13, 6.5, 6, 2.6, '#c9772c', 0).replace('/>', ' opacity=".55"/>') + hi(-12, -5, 4, 1.6, -8, 0.9)); }
    return wrap(mm(13.8, -5) + mm(38.3, 4) + mm(62.8, -3) + mm(87.3, 5), defs);
  };

  // 7 Candy apple: one big glossy red sphere, caramel cap with drips, caramel foot, leaf
  S[7] = function () {
    var ap = 'M30 30C20 21 3 24 3 52C3 80 17 96 30 93C43 96 57 80 57 52C57 24 40 21 30 30Z';
    var defs = cel('a', '#ff5a60', '#e01b2b', '#930c19', 0.7) + cel('cr', '#ffd27a', '#f2a630', '#c47212', 0.7) +
      cel('lf', '#8fe060', '#5cc23c', '#2f8a25') + '<clipPath id="ac"><path d="' + ap + '"/></clipPath>';
    var d = 'M0 0H60V42';
    [[49, 7, 4], [38, 14, 4.5], [25, 19, 4.5], [13, 10, 4]].forEach(function (q) {
      d += 'H' + (q[0] + q[2]) + 'V' + (42 + q[1]) + 'A' + q[2] + ' ' + q[2] + ' 0 0 1 ' + (q[0] - q[2]) + ' ' + (42 + q[1]) + 'V42';
    });
    d += 'H0Z';
    return wrap(
      P(ap, 'url(#a)') +
      '<g clip-path="url(#ac)">' + P(d, '#f2a630', 2.4) + ln('M8 38Q14 33 22 33', '#ffe2a0', 3, 0.8) + '</g>' + P(ap, 'none') +
      P('M15 89Q30 98 45 89Q49 95 42 99.5H18Q11 95 15 89Z', 'url(#cr)', 2.4) +
      hi(11.5, 64, 3.6, 10, 18, 0.85) + hi(14.5, 81, 2, 2, 0, 0.75) + hi(47, 74, 2.4, 6, -25, 0.3) +
      ln('M30 31Q30 20 33 11', OL, 7.4) + ln('M30 31Q30 20 33 11', '#7a4420', 3.4) +
      P('M33 16C36 7 46 5 52 9C48 16 40 19 33 16Z', 'url(#lf)', 2.4) + ln('M35 15Q43 11 49 9', '#2f7a22', 1.6), defs, 70);
  };

  // 8 Chocolate strawberries: glossy red berries, green tops, chocolate-dipped bottoms
  S[8] = function () {
    var B = 'M0 -11.5C12.5 -15 21 -8 20 0C19.5 9 9 16.5 0 19C-9 16.5 -19.5 9 -20 0C-21 -8 -12.5 -15 0 -11.5Z';
    var defs = cel('sb', '#ff7884', '#f5293d', '#ad1020') + cel('ck', '#8f4e28', '#6b3518', '#3c1c0a') + cel('lv', '#7ad35a', '#45b83a', '#2b8526') +
      '<clipPath id="bc"><path d="' + B + '"/></clipPath>';
    var seeds = '<g fill="#ffe27a">';
    [[-12, -5], [-4, -8], [4, -8], [12, -5], [-7, -1.5], [1, -2.5], [8, -1]].forEach(function (p) { seeds += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="1.2" ry="1.9"/>'; });
    defs += '<g id="sw">' + P(B, 'url(#sb)') + seeds + '</g>' +
      '<g clip-path="url(#bc)">' + P('M-23 3Q-17.5 -1 -11.5 3T0 3T11.5 3T23 3V22H-23Z', 'url(#ck)', 2.4) +
      ln('M-16 10L-9 13.5L-2 9L5 13.5L12 9L18 12', '#fff3e0', 2.4, 0.9) + '</g>' + P(B, 'none') +
      hi(-10, -6, 3.6, 2, -25, 0.8) + hi(12.5, -5.5, 1.4, 1.4, 0, 0.6) +
      P(star(5, 11, 4, 0.55), 'url(#lv)', 2.2, ' transform="translate(0 -12.5)"') + '</g>';
    function berry(cy, rot) { return g(30, cy, rot, '<use href="#sw"/>'); }
    return wrap(berry(20.5, -6) + berry(50.8, 6) + berry(81, -5), defs);
  };

  // 9 Broccoli: two big vivid green bumpy florets (tree silhouettes) on pale stems
  S[9] = function () {
    var defs = cel('b', '#8ae462', '#3fbf3a', '#22852a', 0.7) + cel('st', '#dcf3a8', '#b5df78', '#7fb24a');
    var o = '', fi = '';
    [[-14, -6, 10], [14, -6, 10], [-8, -15, 10], [8, -15, 10], [0, -5, 11], [0, -18, 8]].forEach(function (b) {
      o += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + (b[2] + 2.8) + '"/>';
      fi += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '"/>';
    });
    defs += '<g id="fl">' + P('M-7.5 2L-5.5 19Q0 22 5.5 19L7.5 2Z', 'url(#st)', 2.6) + ln('M-2 8V17', '#fff', 2, 0.5) +
      '<g fill="' + OL + '">' + o + '</g><g fill="url(#b)">' + fi + '</g>' +
      hi(-11, -19, 3.4, 2, -20, 0.5) + hi(-18, -9, 2.6, 1.6, -30, 0.45) + hi(3, -23, 2.4, 1.4, -10, 0.45) + hi(-3, -8, 2.6, 1.6, -20, 0.4) + '</g>';
    return wrap(g(30, 31, -4, '<use href="#fl"/>') + g(30, 80, 4, '<use href="#fl"/>'), defs);
  };

  // 10 Mushrooms: beige-brown grilled domed caps on cream stems
  S[10] = function () {
    var defs = cel('mu', '#e4b78a', '#c48a58', '#8a5733') + cel('ms', '#fffaf0', '#f3e6cc', '#d4bc94');
    defs += '<g id="mu1">' + P('M-8 1L-7 15.5Q0 18.5 7 15.5L8 1Z', 'url(#ms)', 2.6) + E(0, 2.5, 21, 4, '#e3cba2', 2.4) +
      P('M-25 1C-25.5 -10 -14 -16 0 -16C14 -16 25.5 -10 25 1C17 5 -17 5 -25 1Z', 'url(#mu)') +
      ln('M-12 -12L-9 1M1 -14L3.5 2M13 -11L15 -1', CHAR, 3.6, 0.5) + hi(-12, -8, 5.5, 2.4, -20, 0.6) + hi(19, -5, 1.4, 1.4, 0, 0.5) + '</g>';
    function sh(cy, rot) { return g(30, cy, rot, '<use href="#mu1"/>'); }
    return wrap(sh(18, -5) + sh(50, 5) + sh(82, -4), defs);
  };

  // 11 Blueberries: cluster of glossy blue berries with dark crowns
  S[11] = function () {
    var defs = cel('bb', '#7c95f2', '#3b5bdb', '#243a9a') + '<g id="be"><circle r="11" fill="url(#bb)"' + sk(2.6) + '/>' +
      hi(-4.5, -4.5, 3.2, 2.1, -30, 0.85) + hi(5.5, 4.5, 1.2, 1.2, 0, 0.5) +
      '<path d="' + star(5, 3.8, 1.6) + '" transform="translate(1.5 -1)" fill="#1a256a"/></g>';
    var out = '';
    for (var i = 0; i < 7; i++) {
      var y = 13 + i * 12.67, xs = i % 2 ? [19, 43] : [17.5, 41.5];
      xs.forEach(function (x, j) { out += '<use href="#be" x="' + x + '" y="' + f(y + j * 2) + '"/>'; });
    }
    return wrap(out, defs);
  };

  // 12 Eggplant: green-capped stem end plus grilled purple oval slices with a pale flesh rim
  S[12] = function () {
    var defs = cel('eg', '#b46ee6', '#8b3fc8', '#55188a', 0.7) + cel('fl', '#fffbe6', '#f1e6bf', '#d5c592') + cel('lv', '#8ad860', '#5cbf3a', '#2f8a25');
    defs += '<g id="es">' + E(0, 0, 25, 11.5, 'url(#fl)') + '<ellipse cy="2.2" rx="23.3" ry="9" fill="url(#eg)"/>' +
      ln('M-13 -2.5L-9.5 8.5M0 -3.5L3.5 9.5M13 -2.5L15.5 6.5', '#250838', 3.6, 0.55) + hi(-13, 0.5, 5.5, 2, -8, 0.5) + '</g>';
    var end = g(30, 17, -6, E(0, 3, 21, 11.5, 'url(#eg)') + hi(-10, 4, 4.5, 2.2, -15, 0.5) +
      P('M-2.5 -5L-1.5 -14Q0 -15.5 2 -14L3 -5Z', '#4a9a2c', 2.2) +
      P('M-16 -2Q0 -12 16 -2L13 4.5L8.5 0L3.5 6.5L-1 0L-6 5.5L-10.5 0L-14 4.5Z', 'url(#lv)', 2.2));
    function sl(cy, rot) { return g(30, cy, rot, '<use href="#es"/>'); }
    return wrap(end + sl(43.5, 6) + sl(66, -6) + sl(88.5, 6), defs);
  };

  // 13 Donut: hot pink glossy glazed rings with sprinkles
  S[13] = function () {
    var defs = cel('dg', '#ffd9a0', '#eeb064', '#bf7a36') + cel('gl', '#ff9ad0', '#ff4fae', '#d42684', 0.7);
    var gz = '';
    for (var i = 0; i < 48; i++) {
      var a = i / 48 * Math.PI * 2, k = 1 + 0.05 * Math.sin(a * 7) + 0.03 * Math.sin(a * 3 + 1) +
        0.14 * Math.exp(-Math.pow(a - 1.2, 2) / 0.02) + 0.11 * Math.exp(-Math.pow(a - 2.1, 2) / 0.02);
      gz += (i ? 'L' : 'M') + f(Math.cos(a) * 22 * k) + ' ' + f(Math.sin(a) * 19.5 * k);
    }
    gz += 'Z' + ell(10, 8.8);
    var cols = ['#fff27a', '#5ad7ff', '#fff', '#7cf06a', '#fff27a', '#fff', '#5ad7ff', '#ffb21e', '#7cf06a', '#fff'], spr = '';
    cols.forEach(function (c, j) {
      var a = j / cols.length * Math.PI * 2 + 0.4, r = j % 2 ? 14.5 : 16.5;
      spr += g(f(Math.cos(a) * r), f(Math.sin(a) * r * 0.88), (j * 47) % 180, ln('M-3 0H3', c, 3.4));
    });
    defs += '<g id="dn">' + P(ell(26, 23.5) + ell(7.5, 6.5), 'url(#dg)', 2.8, ' fill-rule="evenodd"') +
      P(gz, 'url(#gl)', 2.2, ' fill-rule="evenodd"') + spr + ln('M-18 -8Q-13.5 -15 -4 -17', '#fff', 3.4, 0.75) + hi(13, -12.5, 1.8, 1.8, 0, 0.8) + '</g>';
    return wrap(g(30, 25.5, -4, '<use href="#dn"/>') + g(30, 76.5, 5, '<use href="#dn"/>'), defs);
  };

  // ---------- caching to data URLs ----------
  var cache = [];
  function url(type) {
    if (!cache[type]) cache[type] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(S[type]());
    return cache[type];
  }
  function preload() {
    var list = [];
    for (var i = 0; i < S.length; i++) {
      var im = new Image();
      im.src = url(i);
      list.push(im.decode ? im.decode().catch(function () {}) : Promise.resolve());
    }
    return Promise.all(list);
  }

  // ---------- UI icons (inline SVG strings) ----------
  var ICONS = {
    coin: '<svg viewBox="0 0 24 24"><defs><radialGradient id="cg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6b0"/><stop offset=".5" stop-color="#ffc83a"/><stop offset="1" stop-color="#d98a06"/></radialGradient></defs><circle cx="12" cy="12" r="10.5" fill="url(#cg)" stroke="#a0600a" stroke-width="1.5"/><circle cx="12" cy="12" r="7" fill="none" stroke="#e8a21a" stroke-width="1.2"/><path d="M12 7.2 L13.4 10.4 L16.8 10.6 L14.2 12.8 L15 16.2 L12 14.4 L9 16.2 L9.8 12.8 L7.2 10.6 L10.6 10.4 Z" fill="#fff3c4" stroke="#c07a08" stroke-width=".7"/></svg>',
    undo: '<svg viewBox="0 0 32 32"><path d="M11 7 L4 13 L11 19" fill="none" stroke="#7a3a12" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 13 H19 C24 13 27 16.5 27 20.5 C27 24.5 24 27 19.5 27 H13" fill="none" stroke="#7a3a12" stroke-width="3.6" stroke-linecap="round"/><path d="M11 7 L4 13 L11 19" fill="none" stroke="#ff9a3c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    slot: '<svg viewBox="0 0 32 32"><rect x="3" y="10" width="26" height="14" rx="3" fill="#cfd5db" stroke="#5b636b" stroke-width="2"/><path d="M9 10 V24 M16 10 V24 M23 10 V24" stroke="#5b636b" stroke-width="1.5"/><circle cx="24" cy="9" r="7" fill="#36b24a" stroke="#1d6e2a" stroke-width="1.6"/><path d="M24 5.5 V12.5 M20.5 9 H27.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    shuffle: '<svg viewBox="0 0 32 32"><path d="M4 9 H9 C15 9 17 23 23 23 H27" fill="none" stroke="#e8462a" stroke-width="3.6" stroke-linecap="round"/><path d="M4 23 H9 C15 23 17 9 23 9 H27" fill="none" stroke="#f2b01e" stroke-width="3.6" stroke-linecap="round"/><path d="M23 5 L28 9 L23 13 M23 19 L28 23 L23 27" fill="none" stroke="#7a3a12" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chef: '<svg viewBox="0 0 32 32"><path d="M8 19 C3 18 3 10 8.5 10 C9 5 15 3.5 17.5 7 C20 4 26.5 5.5 25.5 11 C30 11.5 29.5 18.5 24 19 Z" fill="#fff" stroke="#7a3a12" stroke-width="2" stroke-linejoin="round"/><rect x="8.5" y="19" width="15.5" height="7" rx="1.5" fill="#fff" stroke="#7a3a12" stroke-width="2"/><path d="M12 22.5 H20.5" stroke="#e8462a" stroke-width="2" stroke-linecap="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.6" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.6" fill="currentColor"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5 V8 C8 5.5 9.8 4 12 4 C14.2 4 16 5.5 16 8 V10.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>'
  };

  root.Art = { url: url, preload: preload, count: S.length, NAMES_UK: NAMES_UK, NAMES_EN: NAMES_EN, ICONS: ICONS, svg: function (t) { return S[t](); } };
})(this);
