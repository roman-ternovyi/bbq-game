/* Grill Master – chunky cartoon SVG art for the skewers and UI icons.
   Each skewer: viewBox 0 0 60 120, food fills x 4..56 / y 2..100, short stick handle below. */
(function (root) {
  'use strict';

  var NAMES_UK = ['Шашлик', 'Курка', 'Креветки', 'Кукурудза', 'Ковбаска', 'Овочі',
    'Маршмелоу', 'Яблуко в карамелі', 'Полуниця в шоколаді', 'Броколі', 'Печериці', 'Чорниця',
    'Баклажан', 'Пончик', 'Кавун', 'Ківі', 'Оливки', 'Перепелині яйця', 'Желейні ведмедики', 'Апельсин',
    'Банан у шоколаді', 'Тефтелі', 'Ананас', 'Цукрова вата'];
  var NAMES_EN = ['Beef kebab', 'Chicken', 'Shrimp', 'Corn', 'Sausage', 'Veggies',
    'Marshmallows', 'Candy apple', 'Choc strawberries', 'Broccoli', 'Mushrooms', 'Blueberries',
    'Eggplant', 'Donut', 'Watermelon', 'Kiwi', 'Olives', 'Quail eggs', 'Gummy bears', 'Orange',
    'Choc banana', 'Meatballs', 'Pineapple', 'Cotton candy'];

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

  // 14 Watermelon: red triangle wedges pointing up, green rind at the bottom, black seeds
  S[14] = function () {
    var defs = cel('wf', '#ff8a92', '#ff3b4f', '#c81e35') + cel('wr', '#4fb45a', '#2a8a3a', '#17602a');
    var seeds = '<g fill="#1a0d08">';
    [[-9, 1, -30], [0, -5, 0], [9, 1, 30], [-4, 6, -15], [5, 6, 15]].forEach(function (s) {
      seeds += '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="1.8" ry="2.9" transform="rotate(' + s[2] + ' ' + s[0] + ' ' + s[1] + ')"/>';
    });
    defs += '<g id="wm">' + P('M0 -16L-25 7Q0 26 25 7Z', 'url(#wr)') + '<path d="M0 -16L-25 7Q0 18 25 7Z" fill="#e2f5b8"/>' +
      '<path d="M0 -16L-25 7Q0 12 25 7Z" fill="url(#wf)"/>' + P('M0 -16L-25 7Q0 26 25 7Z', 'none') + seeds + '</g>' +
      hi(-7, -4, 3.4, 1.6, -50, 0.55) + '</g>';
    function w(cy, rot) { return g(30, cy, rot, '<use href="#wm"/>'); }
    return wrap(w(18, -5) + w(50, 5) + w(82, -4), defs);
  };

  // 15 Kiwi: lime-green discs with a white core, black seed ring and brown fuzzy rim
  S[15] = function () {
    var defs = cel('kf', '#d8f77a', '#8fd13a', '#5ea82a') + cel('kr', '#b07a44', '#8b5a2b', '#5e3a18');
    var seeds = '<g fill="#140c06">', rays = '';
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2, x = f(Math.cos(a) * 10.5), y = f(Math.sin(a) * 6.6);
      seeds += '<ellipse cx="' + x + '" cy="' + y + '" rx="1.1" ry="2" transform="rotate(' + f(a * 180 / Math.PI + 90) + ' ' + x + ' ' + y + ')"/>';
      if (i % 2) rays += 'M' + f(Math.cos(a) * 6) + ' ' + f(Math.sin(a) * 3.8) + 'L' + f(Math.cos(a) * 17) + ' ' + f(Math.sin(a) * 11);
    }
    defs += '<g id="kw">' + E(0, 0, 25, 16, 'url(#kr)') + '<ellipse rx="21.5" ry="12.8" fill="url(#kf)"/>' +
      ln(rays, '#effcc0', 1.6, 0.7) + '<ellipse rx="13" ry="8" fill="#c8f080" opacity=".6"/>' + seeds + '</g>' +
      '<ellipse rx="5.5" ry="3.4" fill="#fffbe6"/>' + hi(-11, -6, 3.4, 1.5, -15, 0.6) + '</g>';
    function k(cy, rot) { return g(30, cy, rot, '<use href="#kw"/>'); }
    return wrap(k(18.5, -7) + k(50, 6) + k(81.5, -5), defs);
  };

  // 16 Olives: alternating glossy black and pimento-stuffed green ovals in a zigzag
  S[16] = function () {
    var defs = cel('ob', '#6e6878', '#2c2833', '#100d14') + cel('og', '#d6e276', '#93a932', '#5b6c16') + cel('pm', '#ff7a66', '#e8382a', '#a8180e');
    var gl = hi(-8, -4.5, 6, 2, -8, 0.85) + hi(9, 4, 1.5, 1.5, 0, 0.6);
    defs += '<g id="o0">' + E(0, 0, 18, 10, 'url(#ob)') + E(13.5, 0, 2.6, 4, '#0b080e', 2.2) + gl + '</g>' +
      '<g id="o1">' + E(0, 0, 18, 10, 'url(#og)') + E(13.5, 0, 3.4, 4.8, 'url(#pm)', 2.2) + gl + '</g>';
    var out = '';
    [[26, 12, -6], [34, 31.5, 7], [26, 51, -6], [34, 70.5, 7], [26, 90, -6]].forEach(function (o, i) {
      out += g(o[0], o[1], o[2], '<use href="#o' + (i % 2) + '"/>', i % 2 ? -1 : 0);
    });
    return wrap(out, defs);
  };

  // 17 Quail eggs: speckled cream eggs (pointy top), tilted
  S[17] = function () {
    var egg = 'M0 -18C9.5 -18 16 -6.5 16 3C16 12.5 9 18 0 18C-9 18 -16 12.5 -16 3C-16 -6.5 -9.5 -18 0 -18Z';
    var defs = cel('eq', '#fffef6', '#f1e3c2', '#c9b28a');
    var sp = '<g fill="#5e3c1e">';
    [[-6, -9, 2.8, 2], [5, -6, 3.4, 2.4], [-9, 2, 2.4, 1.9], [2, 3, 3.8, 2.6], [10, 7, 2.2, 1.7], [-4, 11, 3, 2.1], [6, -14, 1.7, 1.3], [-1, -3, 1.7, 1.3], [11, -2, 1.5, 1.3], [-11, -5, 1.4, 1.2], [4, 13, 1.6, 1.3]].forEach(function (s, i) {
      sp += '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="' + s[2] + '" ry="' + s[3] + '" transform="rotate(' + (i * 37 % 90 - 45) + ' ' + s[0] + ' ' + s[1] + ')"' + (i % 3 === 2 ? ' fill="#a07a52"' : '') + '/>';
    });
    defs += '<g id="eq1">' + P(egg, 'url(#eq)') + sp + '</g>' + hi(-7, -8, 3, 5, 20, 0.85) + '</g>';
    function e(x, cy, rot) { return g(x, cy, rot, '<use href="#eq1"/>'); }
    return wrap(e(27.5, 19.5, -14) + e(32.5, 51, 13) + e(27.5, 82, -12), defs);
  };

  // 18 Gummy bears: translucent red, yellow, green and orange bears with round ears
  S[18] = function () {
    var shp = '<circle cx="-7.5" cy="-13" r="4.2"/><circle cx="7.5" cy="-13" r="4.2"/><circle cy="-6.5" r="8.8"/><ellipse cy="6" rx="10.5" ry="9.5"/>' +
      '<ellipse cx="-10.5" cy="1" rx="4.5" ry="3.2" transform="rotate(-30 -10.5 1)"/><ellipse cx="10.5" cy="1" rx="4.5" ry="3.2" transform="rotate(30 10.5 1)"/>' +
      '<ellipse cx="-6.5" cy="14.5" rx="4.8" ry="3.4"/><ellipse cx="6.5" cy="14.5" rx="4.8" ry="3.4"/>';
    var cols = [['#ff9a9a', '#f0282f', '#a80e1c'], ['#fff6a0', '#ffd21a', '#d39400'], ['#b4f480', '#4ccf2a', '#24881a'], ['#ffc888', '#ff8a1a', '#c85400']];
    var defs = '<g id="gb"><g fill="' + OL + '" stroke="' + OL + '" stroke-width="5.6">' + shp + '</g><g>' + shp + '</g></g>' +
      '<g id="gh">' + hi(-4, -10, 3, 1.8, -25, 0.8) + hi(-4.5, 3, 2.4, 4, 15, 0.45) + hi(3, -12, 1, 1, 0, 0.7) +
      '<circle cx="-3" cy="-7" r="1.3" fill="' + OL + '" opacity=".35"/><circle cx="3" cy="-7" r="1.3" fill="' + OL + '" opacity=".35"/></g>';
    var out = '';
    cols.forEach(function (c, i) { defs += cel('b' + i, c[0], c[1], c[2], 0.74); });
    [[27, 19, -10], [33, 40, 9], [27, 61, -9], [33, 82, 8]].forEach(function (b, i) {
      out += g(b[0], b[1], b[2], '<g opacity=".93"><use href="#gb" fill="url(#b' + i + ')"/><use href="#gh"/></g>', 0);
    });
    return wrap(out, defs);
  };

  // 19 Orange: half-moon slices (flat side up) with white pith and segment rays
  S[19] = function () {
    var defs = cel('or', '#ffb24a', '#ff7f00', '#cc5200') + cel('of', '#ffd884', '#ffa420', '#f07800', 0.75);
    var rays = '';
    [30, 60, 90, 120, 150].forEach(function (d) { var a = d * Math.PI / 180; rays += 'M0 -8L' + f(Math.cos(a) * 18.5) + ' ' + f(-9 + Math.sin(a) * 15); });
    defs += '<g id="os">' + P('M-25 -9H25A25 21 0 0 1 -25 -9Z', 'url(#or)') + '<path d="M-22 -9H22A22 18 0 0 1 -22 -9Z" fill="#fff3d6"/>' +
      '<path d="M-20 -9H20A20 15.5 0 0 1 -20 -9Z" fill="url(#of)"/>' + ln(rays, '#fff6e0', 2.2, 0.95) +
      '<path d="M-3.5 -9A3.5 3 0 0 0 3.5 -9Z" fill="#fff6e0"/>' + P('M-25 -9H25A25 21 0 0 1 -25 -9Z', 'none') +
      hi(-12, -3, 2.6, 1.4, 30, 0.7) + hi(9, 0, 1.6, 1, -30, 0.6) + '</g>';
    function o(cy, rot) { return g(30, cy, rot, '<use href="#os"/>'); }
    return wrap(o(11.5, -4) + o(36.5, 5) + o(61.5, -5) + o(86.5, 4), defs);
  };

  // 20 Chocolate banana: one long curved banana, yellow below, chocolate top with sprinkles
  S[20] = function () {
    var B = 'M38 3C8 14 -3 60 26 95Q31 100.5 35.5 96C34 80 34 45 47 9Q46.5 2 38 3Z';
    var defs = cel('bn', '#fff384', '#ffd424', '#d39a00', 0.7) + cel('bc', '#93522a', '#6b3518', '#3c1c0a', 0.7) +
      '<clipPath id="bk"><path d="' + B + '"/></clipPath>';
    var d = 'M0 0H60V50';
    [[31, 6, 3], [23, 12, 3.5], [14, 7, 3.5]].forEach(function (q) {
      d += 'H' + (q[0] + q[2]) + 'V' + (50 + q[1]) + 'A' + q[2] + ' ' + q[2] + ' 0 0 1 ' + (q[0] - q[2]) + ' ' + (50 + q[1]) + 'V50';
    });
    d += 'H0Z';
    var cols = ['#fff27a', '#5ad7ff', '#fff', '#ff6fb5', '#7cf06a'], spr = '';
    [[37, 10, 30], [31, 17, -40], [39, 22, 80], [24, 25, 10], [33, 30, -70], [19, 34, 50], [28, 38, -20], [16, 44, 70], [25, 46, -50]].forEach(function (s, i) {
      spr += g(s[0], s[1], s[2], ln('M-2.6 0H2.6', cols[i % 5], 3.2));
    });
    return wrap(P(B, 'url(#bn)') + ln('M29 52C24 66 24 80 29.5 92', '#fff8c0', 2.6, 0.75) + ln('M37 55C34 70 33 82 34 92', '#c08a00', 2.2, 0.5) +
      '<g clip-path="url(#bk)">' + P(d, 'url(#bc)', 2.4) + spr + ln('M30 9C22 18 17 30 14 42', '#fff', 2.6, 0.4) + '</g>' +
      E(31.5, 96, 2.6, 2.6, '#4a2c12', 0) + P(B, 'none'), defs, 60);
  };

  // 21 Meatballs: four lumpy brown balls, each with a tomato-sauce dollop and parsley
  S[21] = function () {
    var defs = cel('mb', '#b8703f', '#8a4a26', '#55280f') + cel('tg', '#ffa070', '#f2582a', '#b82e10', 0.7);
    var bump = [0.05, -0.04, 0.03, -0.05, 0.06, -0.02, 0.04, -0.05, 0.02, -0.03, 0.05], pts = [], n = 11, i, d;
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2, r = 15 * (1 + bump[i]); pts.push([Math.cos(a) * r * 1.14, Math.sin(a) * r]); }
    function mid(p, q) { return f((p[0] + q[0]) / 2) + ' ' + f((p[1] + q[1]) / 2); }
    d = 'M' + mid(pts[n - 1], pts[0]);
    for (i = 0; i < n; i++) d += 'Q' + f(pts[i][0]) + ' ' + f(pts[i][1]) + ' ' + mid(pts[i], pts[(i + 1) % n]);
    d += 'Z';
    var pars = '<g fill="#4cc23e">';
    [[-5, -9, 20], [5, -6, -40], [-11, 2, 50], [9, 6, -20], [-2, 9, 70]].forEach(function (p) {
      pars += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="2.6" ry="1.6" transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"/>';
    });
    defs += '<g id="mbl">' + P(d, 'url(#mb)') + '<g fill="#4a2410" opacity=".55"><circle cx="-6" cy="8" r="1.4"/><circle cx="6" cy="10" r="1.3"/><circle cx="12" cy="0" r="1.2"/><circle cx="-12" cy="-4" r="1.1"/></g><g transform="scale(1.12)">' +
      P('M-9 -6Q-8.5 -11.5 0 -11.5Q9 -11.5 9.5 -5.5Q10 -1 6.5 0Q5.5 4 3.5 3.5Q2 0.5 -2.5 1Q-4.5 4.5 -6.5 3.5Q-9 1 -9 -6Z', 'url(#tg)', 2.2) +
      hi(-3, -8.5, 3.4, 1.4, -10, 0.8) + hi(-10.5, 3, 1.4, 2.8, 25, 0.4) + pars + '</g></g></g>';
    var out = '';
    [[27.5, 17, -10], [32.5, 39.5, 15], [27.5, 62, -5], [32.5, 84.5, 20]].forEach(function (m) { out += g(m[0], m[1], m[2], '<use href="#mbl"/>'); });
    return wrap(out, defs);
  };

  // 22 Pineapple: green leafy crown on top of pale-yellow chunks with a brown diamond pattern
  S[22] = function () {
    var ch = 'M-21 -10.5H21Q24 -10.5 23.5 -7L22.5 7Q22 10.5 19 10.5H-19Q-22 10.5 -22.5 7L-23.5 -7Q-24 -10.5 -21 -10.5Z';
    var defs = cel('pa', '#fffbd0', '#ffe266', '#e0aa32') + cel('lv', '#a6e46a', '#5cbf3a', '#2f8a25') + cel('ld', '#6cc848', '#3d9a2c', '#246e1c') +
      '<pattern id="dp" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V8M0 0H8" stroke="#b8761e" stroke-width="2.2"/><circle cx="4" cy="4" r="1.2" fill="#8a5410"/></pattern>';
    defs += '<g id="pc">' + P(ch, 'url(#pa)') + P(ch, 'url(#dp)', 0, ' opacity=".75"') + hi(-13, -5, 5, 1.8, -5, 0.6) + P(ch, 'none') + '</g>';
    var crown = P('M30 36C21 30 12 24 4 22C10 28 17 34 25 38Z', 'url(#ld)', 2.4) + P('M30 36C39 30 48 24 56 22C50 28 43 34 35 38Z', 'url(#ld)', 2.4) +
      P('M29 36C23 26 17 16 12 8C20 13 27 22 33 34Z', 'url(#lv)', 2.4) + P('M31 36C37 26 43 16 48 8C40 13 33 22 27 34Z', 'url(#lv)', 2.4) +
      P('M30 37C25 25 26 12 30 2C34 12 35 25 30 37Z', 'url(#lv)', 2.4);
    function c(cy, rot) { return g(30, cy, rot, '<use href="#pc"/>'); }
    return wrap(crown + c(44.5, -3) + c(67, 4) + c(89.5, -3), defs);
  };

  // 23 Cotton candy: one big fluffy pink cloud with cyan swirls
  S[23] = function () {
    var defs = cel('cp', '#fff0f8', '#ffa8d8', '#ee78b8', 0.7), o = '', fi = '';
    [[30, 18, 15], [16, 24, 10.5], [44, 24, 10.5], [21, 10, 8], [39, 10, 8], [14.5, 40, 9.5], [45.5, 40, 9.5], [30, 40, 17],
      [16, 58, 9.5], [44, 58, 9.5], [30, 62, 15], [21, 76, 10], [39, 76, 10], [30, 86, 10]].forEach(function (c) {
      var s = '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="';
      o += s + (c[2] + 2.8) + '"/>'; fi += s + c[2] + '"/>';
    });
    defs += '<clipPath id="cl">' + fi + '</clipPath>';
    return wrap('<g fill="' + OL + '">' + o + '</g><g fill="url(#cp)">' + fi + '</g>' +
      '<g clip-path="url(#cl)" opacity=".9">' + ln('M-5 32C12 22 22 42 34 35S52 20 65 27', '#72d6fa', 9) + ln('M-5 68C10 58 24 78 36 71S54 56 65 62', '#72d6fa', 8) +
      ln('M-5 30C12 20 22 40 34 33S52 18 65 25', '#c8f3ff', 2.6) + '</g>' +
      hi(22, 12, 4, 2.4, -25, 0.75) + hi(12, 37, 2.6, 2, -40, 0.6) + hi(25, 52, 3, 1.8, -20, 0.5), defs, 60);
  };

  // Hidden item for foil levels: a skewer wrapped in crumpled silver foil
  function foil() {
    var body = 'M18 14L42 13L52 22L55 40L51 55L56 70L52 88L41 99L19 100L8 89L5 72L9 56L4 40L8 22Z';
    var defs = lg('fo', [[0, '#eef1f5'], [0.2, '#b9c0c8'], [0.36, '#f8fafc'], [0.52, '#9aa3ad'], [0.68, '#e6eaee'], [0.85, '#aab2bb'], [1, '#dfe3e8']], 0, 0, 1, 1);
    var fac = '';
    [['M18 14L30 28L8 22Z', 1, 0.55], ['M42 13L30 28L52 22Z', 0, 0.18], ['M8 22L30 28L4 40Z', 0, 0.14], ['M52 22L30 28L55 40Z', 1, 0.45],
      ['M4 40L30 28L22 50L9 56Z', 1, 0.4], ['M55 40L30 28L22 50L51 55Z', 0, 0.2], ['M9 56L22 50L30 72L5 72Z', 0, 0.16], ['M51 55L22 50L30 72L56 70Z', 1, 0.5],
      ['M5 72L30 72L8 89Z', 1, 0.3], ['M56 70L30 72L52 88Z', 0, 0.22], ['M8 89L30 72L19 100Z', 0, 0.12], ['M52 88L30 72L41 99Z', 1, 0.4]].forEach(function (q) {
      fac += '<path d="' + q[0] + '" fill="' + (q[1] ? '#fff' : '#3c4652') + '" opacity="' + q[2] + '"/>';
    });
    function spark(x, y, s) { return '<path d="M' + x + ' ' + (y - s) + 'Q' + x + ' ' + y + ' ' + (x + s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + s) + 'Q' + x + ' ' + y + ' ' + (x - s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - s) + 'Z" fill="#fff"/>'; }
    return wrap(P('M23 15Q21 9 15 6.5Q24 3.5 30 10Q36 3.5 45 6.5Q39 9 37 15Z', 'url(#fo)', 2.4) + P(body, 'url(#fo)') + fac +
      ln('M8 22L30 28L52 22M30 28L22 50L30 72L19 100M22 50L4 40M22 50L51 55M30 72L5 72M30 72L56 70M30 28L55 40M30 72L8 89M30 72L41 99', '#7d8691', 1.5, 0.7) +
      ln('M18 14L30 28M30 28L4 40M22 50L9 56M30 72L52 88', '#fff', 1.6, 0.8) + P(body, 'none') +
      spark(16, 34, 4.5) + spark(43, 64, 4) + spark(37, 19, 3), defs);
  }

  var foilUrl;
  function mystery() {
    if (!foilUrl) foilUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(foil());
    return foilUrl;
  }

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

  root.Art = { url: url, preload: preload, count: S.length, NAMES_UK: NAMES_UK, NAMES_EN: NAMES_EN, ICONS: ICONS, svg: function (t) { return S[t](); }, mystery: mystery };
})(this);
