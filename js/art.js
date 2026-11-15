/* Grill Master – hand-drawn SVG art for the skewers and UI icons. */
(function (root) {
  'use strict';

  var NAMES_UK = ['Шашлик', 'Курка з цибулею', 'Креветки', 'Кукурудза', 'Ковбаски', 'Овочі гриль',
    'Маршмелоу', 'Яблуко в карамелі', 'Полуниця в шоколаді', 'Люля-кебаб', 'Печериці', 'Лосось',
    'Баклажан', 'Картопля з салом'];
  var NAMES_EN = ['Shashlik', 'Chicken & leek', 'Shrimp', 'Corn', 'Sausages', 'Grilled veggies',
    'Marshmallows', 'Candy apple', 'Choco strawberries', 'Lula kebab', 'Mushrooms', 'Salmon',
    'Eggplant', 'Potato & bacon'];

  function lg(id, stops, x1, y1, x2, y2) {
    return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 === undefined ? 0 : x2) + '" y2="' + (y2 === undefined ? 1 : y2) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
  }
  function rg(id, stops, cx, cy, r) {
    return '<radialGradient id="' + id + '" cx="' + (cx || 0.5) + '" cy="' + (cy || 0.5) + '" r="' + (r || 0.6) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</radialGradient>';
  }
  function g(cx, cy, rot, body, sx) {
    return '<g transform="translate(' + cx + ' ' + cy + ')' + (rot ? ' rotate(' + rot + ')' : '') + (sx ? ' scale(' + sx + ' 1)' : '') + '">' + body + '</g>';
  }
  function shine(x, y, rx, ry, op) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op || 0.35) + '"/>';
  }
  function marks(lines, color, w, op) {
    return '<path d="' + lines + '" stroke="' + (color || '#3a1606') + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round" opacity="' + (op || 0.5) + '" fill="none"/>';
  }
  function leaf(x, y, rot, s, c) {
    return g(x, y, rot, '<path d="M0 0 C' + (2 * s) + ' ' + (-2 * s) + ' ' + (5 * s) + ' ' + (-2 * s) + ' ' + (7 * s) + ' 0 C' + (5 * s) + ' ' + (2 * s) + ' ' + (2 * s) + ' ' + (2 * s) + ' 0 0Z" fill="' + (c || '#4f9d2d') + '" stroke="#2b6a17" stroke-width=".6"/>');
  }

  function wrap(inner, defs, stickTop) {
    var top = stickTop === undefined ? 2 : stickTop;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 132">' +
      '<defs>' + lg('stk', [[0, '#a96d34'], [0.45, '#f3d095'], [1, '#9c6630']], 0, 0, 1, 0) +
      '<filter id="ds" x="-30%" y="-10%" width="160%" height="130%"><feDropShadow dx="1.3" dy="2.4" stdDeviation="1.3" flood-color="#1a0800" flood-opacity=".42"/></filter>' +
      defs + '</defs><g filter="url(#ds)">' +
      '<path d="M30 ' + top + ' L32.4 ' + (top + 8) + ' L32.4 126 Q30 129.5 27.6 126 L27.6 ' + (top + 8) + ' Z" fill="url(#stk)" stroke="#7a4a1e" stroke-width=".8"/>' +
      inner + '</g></svg>';
  }

  // ---------- 14 skewers ----------
  var S = [];

  // 0 Shashlik: meat chunks with red onion
  S[0] = function () {
    var defs = rg('m', [[0, '#e0904f'], [0.5, '#a9521f'], [1, '#64270c']], 0.4, 0.35, 0.75) +
      lg('on', [[0, '#fbeefa'], [1, '#dcaad6']]);
    function chunk(cy, rot) {
      return g(30, cy, rot,
        '<path d="M-16 -7 C-17 -12 -9 -12.5 -2 -11.5 C6 -12.5 15 -12 16.5 -6 C18 0 17 7 14 10 C8 12.5 -6 12 -12 10.5 C-17.5 9 -18 -1 -16 -7 Z" fill="url(#m)" stroke="#45190a" stroke-width="1.4"/>' +
        marks('M-11 -7 L-5 7 M-1 -9 L5 7 M8 -9 L13 3', '#2e1104', 2.6, 0.55) +
        shine(-7, -6.5, 5, 2, 0.3) +
        '<circle cx="9" cy="4" r="1.1" fill="#5aa832"/><circle cx="-9" cy="3" r=".9" fill="#5aa832"/>');
    }
    function onion(cy) {
      return g(30, cy, 0, '<ellipse rx="15.5" ry="4.4" fill="url(#on)" stroke="#8e3f86" stroke-width="1.7"/><ellipse rx="10" ry="2.3" fill="none" stroke="#b866ad" stroke-width="1"/>');
    }
    return wrap(onion(36) + onion(64) + chunk(22, -6) + chunk(50, 5) + chunk(78, -3) +
      leaf(14, 86, -30, 1.3) + leaf(44, 60, 20, 1.1), defs);
  };

  // 1 Chicken & leek
  S[1] = function () {
    var defs = rg('ch', [[0, '#ffe08f'], [0.45, '#eda243'], [1, '#b0601b']], 0.42, 0.38, 0.72) +
      lg('lk', [[0, '#f1fbdc'], [0.45, '#b6dc72'], [1, '#4c8c27']]);
    function chicken(cy, rot) {
      return g(30, cy, rot,
        '<rect x="-15.5" y="-10" width="31" height="20" rx="9" fill="url(#ch)" stroke="#874310" stroke-width="1.4"/>' +
        marks('M-9 -8 L-4 8 M2 -9 L7 7', '#7a3a0c', 2.2, 0.45) +
        '<path d="M-11 -4 C-6 -8 3 -8 9 -6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55" fill="none"/>' +
        '<ellipse cx="-6" cy="3" rx="1.2" ry=".7" fill="#fff6dc"/><ellipse cx="4" cy="1" rx="1.2" ry=".7" fill="#fff6dc"/><ellipse cx="10" cy="5" rx="1.2" ry=".7" fill="#fff6dc"/>');
    }
    function leek(cy) {
      return g(30, cy, 0,
        '<rect x="-13" y="-5.5" width="26" height="11" rx="3" fill="url(#lk)" stroke="#3f7a1f" stroke-width="1.2"/>' +
        '<ellipse cx="-13" rx="2.2" ry="5.5" fill="#f4fbe6" stroke="#3f7a1f" stroke-width="1"/>' +
        '<ellipse cx="13" rx="2.2" ry="5.5" fill="#f4fbe6" stroke="#3f7a1f" stroke-width="1"/>' +
        '<ellipse cx="4" cy="1" rx="3" ry="2" fill="#6b4a12" opacity=".35"/>');
    }
    return wrap(leek(35.5) + leek(68.5) + chicken(19, -4) + chicken(52, 4) + chicken(85, -3), defs);
  };

  // 2 Shrimp
  S[2] = function () {
    var defs = lg('sh', [[0, '#ffc2a0'], [0.5, '#ff7a4b'], [1, '#e04a2a']]);
    function shrimp(cy, rot) {
      var segs = '';
      [150, 122, 94, 66, 38].forEach(function (a) {
        var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        segs += 'M' + (c * 6.5).toFixed(1) + ' ' + (-4 + s * 5.5).toFixed(1) + ' L' + (c * 15.5).toFixed(1) + ' ' + (-4 + s * 14.5).toFixed(1) + ' ';
      });
      return g(30, cy, rot,
        '<path d="M-11 -4 A11 10 0 1 0 11 -4" fill="none" stroke="#97290f" stroke-width="12.6" stroke-linecap="round"/>' +
        '<path d="M-11 -4 A11 10 0 1 0 11 -4" fill="none" stroke="url(#sh)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="' + segs + '" stroke="#ffe0cf" stroke-width="1.2" opacity=".85"/>' +
        '<path d="M-7 1 A8 6 0 0 0 1 5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>' +
        '<path d="M9 -7 L15 -16 L19 -9 L13 -3 Z" fill="#e8462a" stroke="#97290f" stroke-width="1.1" stroke-linejoin="round"/>' +
        '<path d="M14 -8 L16 -13" stroke="#ffb59a" stroke-width="1" opacity=".8"/>' +
        '<circle cx="-12.5" cy="-6.5" r="1.3" fill="#2a0a02"/>' +
        '<path d="M-14 -9 C-18 -14 -20 -15 -22 -15 M-12 -10 C-14 -16 -15 -18 -17 -19" stroke="#c4462a" stroke-width=".8" fill="none"/>');
    }
    return wrap(shrimp(24, -10) + shrimp(52, 8) + shrimp(80, -8), defs);
  };

  // 3 Corn
  S[3] = function () {
    var defs = lg('cn', [[0, '#e8a31a'], [0.5, '#ffe36a'], [1, '#d98f12']], 0, 0, 1, 0) +
      rg('kn', [[0, '#fff7b8'], [0.55, '#ffd43c'], [1, '#eba417']], 0.4, 0.35, 0.7) +
      lg('cs', [[0, 'rgba(120,60,0,.35)'], [0.3, 'rgba(120,60,0,0)'], [0.7, 'rgba(120,60,0,0)'], [1, 'rgba(120,60,0,.4)']], 0, 0, 1, 0) +
      '<clipPath id="cc"><rect x="17" y="10" width="26" height="80" rx="13"/></clipPath>';
    var k = '';
    for (var r = 0, y = 11; y < 89; r++, y += 6.1) {
      for (var x = 15 + (r % 2 ? 3 : 0); x < 44; x += 6) {
        k += '<rect x="' + x + '" y="' + y.toFixed(1) + '" width="5.3" height="5.5" rx="2.3" fill="url(#kn)" stroke="#d3920f" stroke-width=".5"/>';
      }
    }
    var husk = '<path d="M30 80 C20 88 15 100 18 114 C23 104 27 96 31 90 Z" fill="#d6e79a" stroke="#86a03a" stroke-width="1.1"/>' +
      '<path d="M30 80 C40 88 45 100 42 112 C37 103 33 96 29 90 Z" fill="#c4dc7e" stroke="#86a03a" stroke-width="1.1"/>' +
      '<path d="M22 96 C24 100 25 104 25 108 M38 96 C36 100 35 104 35 107" stroke="#9db84f" stroke-width=".8" fill="none"/>';
    return wrap(husk +
      '<rect x="17" y="10" width="26" height="80" rx="13" fill="url(#cn)" stroke="#b07208" stroke-width="1.4"/>' +
      '<g clip-path="url(#cc)">' + k +
      '<rect x="17" y="10" width="26" height="80" fill="url(#cs)"/>' +
      '<ellipse cx="35" cy="34" rx="4" ry="3" fill="#7a3d0a" opacity=".4"/><ellipse cx="24" cy="60" rx="3.5" ry="2.5" fill="#7a3d0a" opacity=".38"/><ellipse cx="36" cy="74" rx="3" ry="2.4" fill="#7a3d0a" opacity=".35"/>' +
      '<path d="M22 18 C21 35 21 55 22 78" stroke="#fffbe0" stroke-width="3" stroke-linecap="round" opacity=".55" fill="none"/>' +
      '</g><rect x="17" y="10" width="26" height="80" rx="13" fill="none" stroke="#b07208" stroke-width="1.4"/>', defs, 4);
  };

  // 4 Sausages
  S[4] = function () {
    var defs = lg('sg', [[0, '#ffae8a'], [0.35, '#e8603f'], [1, '#8c2614']]);
    function sausage(cy, rot) {
      return g(30, cy, rot,
        '<rect x="-16" y="-8" width="32" height="16" rx="8" fill="url(#sg)" stroke="#6e1b0c" stroke-width="1.4"/>' +
        '<path d="M-9 -7 L-5 7 M-2 -7.5 L2 7.5 M5 -7.5 L9 7" stroke="#ffd2bb" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>' +
        marks('M-13 2 L13 2', '#4a1206', 1.6, 0.35) +
        shine(-6, -4, 7, 1.6, 0.45));
    }
    return wrap(sausage(19, -7) + sausage(39, 6) + sausage(59, -5) + sausage(79, 7) + leaf(16, 88, -40, 1.2) + leaf(43, 48, 30, 1), defs);
  };

  // 5 Grilled veggies
  S[5] = function () {
    var defs = rg('tm', [[0, '#ff9c8c'], [0.5, '#ea3326'], [1, '#9c150d']], 0.38, 0.35, 0.7) +
      lg('yp', [[0, '#fff08a'], [1, '#f2ad0c']]) +
      rg('zc', [[0, '#f4f7cc'], [0.7, '#d4e08f'], [1, '#b7c86a']], 0.5, 0.5, 0.6);
    function tomato(cy) {
      return g(30, cy, 0,
        '<circle r="11" fill="url(#tm)" stroke="#86100a" stroke-width="1.4"/>' +
        '<path d="M0 -10 L-4 -13 L-2 -9 L-6 -8 L0 -8 L6 -8 L2 -9 L4 -13 Z" fill="#3f9b2f" stroke="#226015" stroke-width=".7"/>' +
        shine(-4, -3, 3.5, 2.2, 0.55));
    }
    function pepper(cy, rot) {
      return g(30, cy, rot,
        '<path d="M-14 -6 C-12 -10 -4 -9 0 -8 C5 -9 12 -10 14 -6 C16 0 14 7 10 8 C4 9 -4 9 -10 8 C-14 7 -16 0 -14 -6 Z" fill="url(#yp)" stroke="#b47a05" stroke-width="1.3"/>' +
        marks('M-8 -6 L-4 6 M2 -7 L6 6', '#7a4a06', 2, 0.45) + shine(-6, -4, 4, 1.6, 0.5));
    }
    function zucchini(cy) {
      return g(30, cy, 0,
        '<ellipse rx="14.5" ry="9" fill="url(#zc)" stroke="#2c6417" stroke-width="2.6"/>' +
        '<ellipse rx="6" ry="3.6" fill="none" stroke="#c2cf7c" stroke-width="1"/>' +
        '<g fill="#9fae55"><circle cx="-4" cy="-1" r=".8"/><circle cx="4" cy="1" r=".8"/><circle cx="0" cy="3" r=".8"/><circle cx="1" cy="-3" r=".8"/></g>' +
        marks('M-9 -5 L-4 6 M2 -7 L7 5', '#5a3a0a', 2.2, 0.5));
    }
    return wrap(tomato(20) + pepper(40, -5) + zucchini(59) + tomato(79), defs);
  };

  // 6 Marshmallows
  S[6] = function () {
    var defs = lg('mw', [[0, '#c37a2e'], [0.22, '#f3cf98'], [0.5, '#fffaf2'], [0.8, '#fde8d2'], [1, '#d59346']]) +
      lg('mp', [[0, '#c27a3a'], [0.22, '#f7c4c8'], [0.5, '#ffe1ec'], [0.8, '#fbcadb'], [1, '#d18a55']]) +
      lg('mt', [[0, '#8f4a12'], [0.3, '#d7913f'], [0.6, '#f2c58a'], [1, '#b8651f']]);
    function mm(cy, fill, rot) {
      return g(30, cy, rot,
        '<rect x="-13" y="-10.5" width="26" height="21" rx="7" fill="url(#' + fill + ')" stroke="#a97240" stroke-width="1.3"/>' +
        shine(-5, -2, 4, 5, 0.45) +
        '<ellipse cx="6" cy="-7" rx="3" ry="1.2" fill="#7a3d0d" opacity=".3"/>');
    }
    return wrap(mm(21, 'mt', -5) + mm(46, 'mp', 4) + mm(71, 'mw', -3), defs);
  };

  // 7 Candy apple
  S[7] = function () {
    var defs = rg('ap', [[0, '#ff9a90'], [0.35, '#e8212b'], [0.8, '#9e0c17'], [1, '#6a0610']], 0.35, 0.33, 0.75);
    return wrap(
      '<path d="M30 25 C24 19 9 20 8.5 37 C8 55 19 67 30 65 C41 67 52 55 51.5 37 C51 20 36 19 30 25 Z" fill="url(#ap)" stroke="#5d0710" stroke-width="1.6"/>' +
      '<path d="M15 60 C20 66 25 70 30 70 C35 70 40 66 45 60 C41 64 36 66 30 66 C24 66 19 64 15 60 Z" fill="#b10e1a" stroke="#5d0710" stroke-width="1"/>' +
      '<path d="M18 63 L18 69 Q18 71 19.5 69.5 L20 64 M41 63 L41.5 67 Q42 69 43 67 L43 62" fill="#c4111c" stroke="#5d0710" stroke-width=".6"/>' +
      '<path d="M16 34 C17 27 22 24 27 25" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".8" fill="none"/>' +
      '<circle cx="15.5" cy="40" r="1.8" fill="#fff" opacity=".7"/>' +
      '<path d="M40 54 C44 50 46 45 46 41" stroke="#ff8a8a" stroke-width="1.8" stroke-linecap="round" opacity=".5" fill="none"/>' +
      '<path d="M30 25 C30 19 31 15 33.5 12" stroke="#5a3417" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
      '<path d="M33 15 C37 9 45 9 48 12 C44 17 37 18 33 15 Z" fill="#4caf3a" stroke="#2d7020" stroke-width="1"/>' +
      '<path d="M35 14.5 C39 13 43 12 46 12" stroke="#2d7020" stroke-width=".7" fill="none"/>', defs, 46);
  };

  // 8 Chocolate strawberries
  S[8] = function () {
    var defs = rg('sb', [[0, '#ff8f8f'], [0.5, '#e8232d'], [1, '#a00f18']], 0.38, 0.32, 0.75) +
      lg('cho', [[0, '#7a4224'], [1, '#3b1a0b']]) +
      '<clipPath id="sbc" clipPathUnits="userSpaceOnUse"><path d="M0 -11 C9 -12 13 -6 12 0 C11 8 4 13 0 14 C-4 13 -11 8 -12 0 C-13 -6 -9 -12 0 -11 Z"/></clipPath>';
    function berry(cy, rot) {
      var seeds = '';
      [[-5, -5], [2, -6], [7, -2], [-8, 0], [-2, -1], [4, 2]].forEach(function (p) {
        seeds += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx=".8" ry="1.2" fill="#ffe89a"/>';
      });
      return g(30, cy, rot,
        '<path d="M0 -11 C9 -12 13 -6 12 0 C11 8 4 13 0 14 C-4 13 -11 8 -12 0 C-13 -6 -9 -12 0 -11 Z" fill="url(#sb)" stroke="#7a0a10" stroke-width="1.3"/>' + seeds +
        '<path clip-path="url(#sbc)" d="M-14 3 Q-10 0 -6 3 T2 3 T10 3 T18 3 V16 H-14 Z" fill="url(#cho)"/>' +
        '<path d="M-8 6 L-3 9.5 L2 5.5 L7 9" stroke="#fff2df" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
        '<path d="M0 -14 L-7 -15 L-3 -10.5 L-9 -8 L0 -9 L9 -8 L3 -10.5 L7 -15 Z" fill="#3e9b3a" stroke="#22621f" stroke-width=".8" stroke-linejoin="round"/>' +
        shine(-5, -5, 2.5, 1.6, 0.5));
    }
    return wrap(berry(22, -6) + berry(50, 5) + berry(78, -4), defs);
  };

  // 9 Lula kebab
  S[9] = function () {
    var defs = lg('lu', [[0, '#5b240b'], [0.35, '#b3602e'], [0.65, '#8c4019'], [1, '#4f1e08']], 0, 0, 1, 0);
    var d = 'M30 11 C37 11 41 14 41 20';
    for (var y = 20; y < 84; y += 16) d += ' Q43.5 ' + (y + 8) + ' 41 ' + (y + 16);
    d += ' C41 90 37 93 30 93 C23 93 19 90 19 84';
    for (var y2 = 84; y2 > 20; y2 -= 16) d += ' Q16.5 ' + (y2 - 8) + ' 19 ' + (y2 - 16);
    d += ' C19 14 23 11 30 11 Z';
    var herbs = '';
    [[24, 24, 30], [35, 31, -20], [27, 45, 60], [33, 57, 10], [23, 66, -40], [36, 74, 45], [28, 84, 0], [31, 18, 80]].forEach(function (h) {
      herbs += '<ellipse cx="' + h[0] + '" cy="' + h[1] + '" rx="1.8" ry=".9" transform="rotate(' + h[2] + ' ' + h[0] + ' ' + h[1] + ')" fill="#62b03c"/>';
    });
    [[31, 38], [25, 54], [35, 66], [29, 77]].forEach(function (p) { herbs += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".9" fill="#e0401f"/>'; });
    return wrap(
      '<path d="' + d + '" fill="url(#lu)" stroke="#3a1505" stroke-width="1.4"/>' +
      marks('M21 30 L39 23 M21 48 L39 41 M21 66 L39 59 M21 84 L38 78', '#2a0d02', 3, 0.55) +
      '<path d="M23 17 C22 35 22 60 23 86" stroke="#ffd2a8" stroke-width="2.2" stroke-linecap="round" opacity=".3" fill="none"/>' +
      herbs + leaf(36, 12, -60, 1.3) + leaf(22, 13, -130, 1.1), defs);
  };

  // 10 Mushrooms
  S[10] = function () {
    var defs = rg('mu', [[0, '#f1d7b2'], [0.55, '#c2915f'], [1, '#7b5030']], 0.42, 0.3, 0.8);
    function shroom(cy, rot) {
      return g(30, cy, rot,
        '<rect x="-5" y="2" width="10" height="9" rx="3.5" fill="#f6ead6" stroke="#8a6440" stroke-width=".9"/>' +
        '<path d="M-14 3 C-8 7 8 7 14 3 L13 5 C7 9 -7 9 -13 5 Z" fill="#efdcbf" stroke="#8a6440" stroke-width=".9"/>' +
        '<path d="M-15.5 3 C-15.5 -9 -7 -13.5 0 -13.5 C7 -13.5 15.5 -9 15.5 3 C9 6 -9 6 -15.5 3 Z" fill="url(#mu)" stroke="#5e3a1f" stroke-width="1.3"/>' +
        marks('M-8 -9 L-5 2 M1 -11 L4 2 M9 -8 L10 0', '#4a2a10', 2, 0.45) +
        shine(-6, -7, 4, 2, 0.45));
    }
    return wrap(shroom(23, -6) + shroom(50, 6) + shroom(77, -4) + leaf(17, 88, -35, 1.2) + leaf(42, 63, 25, 1), defs);
  };

  // 11 Salmon with lemon
  S[11] = function () {
    var defs = lg('sa', [[0, '#ffb98a'], [0.5, '#ff8152'], [1, '#df5730']], 0, 0, 1, 1) +
      lg('le', [[0, '#fff6a8'], [1, '#ffd21f']]);
    function salmon(cy, rot) {
      return g(30, cy, rot,
        '<rect x="-14.5" y="-10" width="29" height="20" rx="5" fill="url(#sa)" stroke="#a83a18" stroke-width="1.3"/>' +
        '<path d="M-10 -9 C-5 -4 -5 3 -9 9 M-2 -9.5 C3 -4 3 3 -1 9.5 M6 -9.5 C11 -4 11 3 7 9.5" stroke="#ffe9dc" stroke-width="1.5" fill="none" opacity=".9"/>' +
        marks('M-12 -3 L12 -6 M-12 5 L12 2', '#7a2a0a', 1.8, 0.35) +
        '<path d="M6 -5 l2 -2 m-2 2 l-1 -3 m1 3 l3 1" stroke="#3d8f2a" stroke-width=".8" fill="none"/>');
    }
    function lemon(cy) {
      return g(30, cy, 0,
        '<ellipse rx="14.5" ry="4.6" fill="url(#le)" stroke="#c69400" stroke-width="1.4"/>' +
        '<path d="M-9 0 H9 M-5 -3 L5 3 M-5 3 L5 -3" stroke="#fffbe0" stroke-width=".9" opacity=".9"/>');
    }
    return wrap(lemon(35) + lemon(65) + salmon(20, -4) + salmon(50, 4) + salmon(80, -3), defs);
  };

  // 12 Eggplant
  S[12] = function () {
    var defs = lg('eg', [[0, '#8a4bb0'], [0.5, '#5a2477'], [1, '#34104a']]);
    function chunk(cy, rot) {
      return g(30, cy, rot,
        '<path d="M-15 5 C-15 -6 -8 -10 0 -10 C8 -10 15 -6 15 5 C9 9.5 -9 9.5 -15 5 Z" fill="url(#eg)" stroke="#260836" stroke-width="1.4"/>' +
        '<path d="M-14.5 3.5 C-8 7.5 8 7.5 14.5 3.5 L14.8 5.2 C9 9.5 -9 9.5 -14.8 5.2 Z" fill="#f1e2b6" stroke="#8a6a3a" stroke-width=".8"/>' +
        '<path d="M-9 -7 C-5 -9 2 -9 6 -8" stroke="#e6c8ff" stroke-width="2" stroke-linecap="round" opacity=".55" fill="none"/>' +
        marks('M-6 -6 L-3 6 M4 -7 L7 5', '#1a0426', 2, 0.45));
    }
    return wrap(chunk(19, -5) + chunk(39, 4) + chunk(59, -4) + chunk(79, 5) +
      '<g fill="#5fb03a"><circle cx="22" cy="30" r="1"/><circle cx="37" cy="47" r="1"/><circle cx="26" cy="68" r="1"/><circle cx="35" cy="86" r="1"/></g>', defs);
  };

  // 13 Potato with salo
  S[13] = function () {
    var defs = rg('po', [[0, '#fbe0a0'], [0.55, '#dca44d'], [1, '#9c6125']], 0.4, 0.35, 0.7) +
      lg('sl', [[0, '#c4683e'], [0.15, '#fff6ec'], [0.4, '#fbeee4'], [0.55, '#e8808a'], [0.75, '#fae6dd'], [1, '#b9573a']]);
    function potato(cy, rot) {
      return g(30, cy, rot,
        '<ellipse rx="12.5" ry="11.5" fill="url(#po)" stroke="#734312" stroke-width="1.4"/>' +
        '<g fill="#8a5a24" opacity=".6"><circle cx="5" cy="-5" r="1"/><circle cx="-6" cy="4" r=".9"/><circle cx="6" cy="6" r=".8"/></g>' +
        marks('M-7 -7 L-2 8 M2 -9 L7 6', '#5a2f08', 2.1, 0.45) +
        shine(-5, -4.5, 3.5, 2.2, 0.45) +
        '<path d="M-2 -1 l2 -2 m-2 2 l-2 -1" stroke="#3d8f2a" stroke-width=".9" fill="none"/>');
    }
    function salo(cy) {
      return g(30, cy, 0,
        '<path d="M-15 -4 Q-7.5 -6.5 0 -4 T15 -4 L15 4 Q7.5 6.5 0 4 T-15 4 Z" fill="url(#sl)" stroke="#9a4a26" stroke-width="1.2"/>');
    }
    return wrap(salo(36) + salo(66) + potato(21, -5) + potato(51, 6) + potato(81, -3), defs);
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
