/* SVG 图形：证物图标、人物剪影、月相、黑日、神像、柱廊 */
(function () {
  var CC = window.CC;

  function svg(vb, body, cls) {
    return '<svg viewBox="' + vb + '" class="' + (cls || '') + '" aria-hidden="true">' + body + '</svg>';
  }

  /* ---------- 证物图标（线稿，48×48） ---------- */
  var I = {
    candle:
      '<path d="M24 6c3 4 4 7 0 11c-4-4-3-7 0-11z" class="fill-soft"/>' +
      '<path d="M24 17v3"/><rect x="18" y="20" width="12" height="20" rx="1"/>' +
      '<path d="M18 26c2 1 3 3 3 6"/><path d="M12 42h24"/>',
    robe:
      '<path d="M18 8c2 3 10 3 12 0l8 6-3 6-3-2v24H16V18l-3 2-3-6z"/>' +
      '<path d="M24 11v31" class="thin"/><path d="M20 10c1 2 7 2 8 0" class="thin"/>',
    scroll:
      '<path d="M14 10h20v28H14z"/><path d="M11 10a3 3 0 0 1 6 0M31 38a3 3 0 0 0 6 0V10a3 3 0 0 0-3-3H14"/>' +
      '<path d="M18 16h12M18 21h12M18 26h9M18 31h11" class="thin"/>',
    anemone:
      '<g transform="translate(24 22)">' +
      [0, 60, 120, 180, 240, 300].map(function (a) {
        return '<ellipse cx="0" cy="-8" rx="4.6" ry="8" transform="rotate(' + a + ')"/>';
      }).join('') +
      '<circle r="3.2" class="fill"/></g><path d="M24 31v12M24 38c-3-2-6-2-8 0" class="thin"/>',
    score:
      '<path d="M8 14h32M8 18h32M8 22h32M8 26h32M8 30h32" class="thin"/>' +
      '<ellipse cx="16" cy="28" rx="3" ry="2.2" class="fill"/><path d="M19 28V12"/>' +
      '<ellipse cx="30" cy="24" rx="3" ry="2.2" class="fill"/><path d="M33 24V9l-14 3"/>' +
      '<path d="M10 38h28" class="dash"/>',
    report:
      '<path d="M12 6h17l7 7v29H12z"/><path d="M29 6v7h7"/>' +
      '<path d="M17 18h14M17 23h14M17 28h10" class="thin"/><circle cx="29" cy="35" r="4" class="thin"/>',
    registry:
      '<path d="M10 8h24a4 4 0 0 1 4 4v28H14a4 4 0 0 1-4-4z"/><path d="M10 36a4 4 0 0 1 4-4h24"/>' +
      '<path d="M16 14h16M16 19h16M16 24h12" class="thin"/><path d="M15 19h18" class="strike"/>',
    ledger:
      '<rect x="8" y="9" width="32" height="30"/><path d="M8 16h32M8 23h32M8 30h32M19 9v30M30 9v30" class="thin"/>' +
      '<path d="M22 34l3 2 4-5" />',
    badge:
      '<rect x="6" y="12" width="36" height="24" rx="2"/><rect x="10" y="16" width="10" height="13" class="thin"/>' +
      '<path d="M24 18h14M24 22h10M24 26h12" class="thin"/><path d="M6 31h36" class="thin"/>' +
      '<text x="24" y="34.6" class="tiny">0110</text>',
    gun:
      '<path d="M6 16h30l3-3h3v8h-4l-1 2H22l-2 3 1 9h-7l-2-10 2-4H6z"/>' +
      '<path d="M10 19h22M20 23c1 2 3 3 5 3" class="thin"/><circle cx="34" cy="17" r="1" class="fill"/>',
    sun: sunPath(24, 24, 7, 20, 16),
    hexagram:
      '<path d="M24 5L41 34H7z"/><path d="M24 43L7 14h34z"/><circle cx="24" cy="24" r="4" class="thin"/>',
    bellflower:
      '<path d="M24 42c0-12 2-22 10-30" class="thin"/>' +
      '<path d="M15 14c0 6 2 9 5 10 3-1 5-4 5-10-3-2-7-2-10 0z"/><path d="M15 14l-2 4M25 14l2 4M20 24v3" class="thin"/>' +
      '<path d="M27 26c0 5 2 8 5 9 3-1 5-4 5-9-3-2-7-2-10 0z"/><path d="M27 26l-2 3M37 26l2 3" class="thin"/>',
  };

  function sunPath(cx, cy, r, R, n) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) {
      var a = (Math.PI * i) / n - Math.PI / 2;
      var rr = i % 2 === 0 ? R : r + (R - r) * 0.35;
      pts.push((cx + Math.cos(a) * rr).toFixed(2) + ',' + (cy + Math.sin(a) * rr).toFixed(2));
    }
    var rays = '';
    for (var j = 0; j < n; j++) {
      var a2 = (Math.PI * 2 * j) / n + Math.PI / n;
      rays += '<path class="thin" d="M' + (cx + Math.cos(a2) * (r + 2)).toFixed(2) + ' ' + (cy + Math.sin(a2) * (r + 2)).toFixed(2) +
        'L' + (cx + Math.cos(a2) * (R * 1.12)).toFixed(2) + ' ' + (cy + Math.sin(a2) * (R * 1.12)).toFixed(2) + '"/>';
    }
    return '<polygon points="' + pts.join(' ') + '" class="fill-solid"/>' + rays + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="fill-solid"/>';
  }

  CC.icon = function (name) {
    return svg('0 0 48 48', I[name] || '', 'icon icon--' + name);
  };

  /* ---------- 黑色发散太阳（大） ---------- */
  CC.blackSun = function () {
    var cx = 200, cy = 200, body = '';
    // 长短不一的放射线
    var rand = CC.rng(808);
    for (var i = 0; i < 72; i++) {
      var a = (Math.PI * 2 * i) / 72;
      var len = 120 + rand() * 70 + (i % 3 === 0 ? 30 : 0);
      var w = i % 2 === 0 ? 3.2 : 1.2;
      var a1 = a - 0.018 * w, a2 = a + 0.018 * w;
      body += '<polygon points="' +
        (cx + Math.cos(a1) * 64).toFixed(1) + ',' + (cy + Math.sin(a1) * 64).toFixed(1) + ' ' +
        (cx + Math.cos(a) * len).toFixed(1) + ',' + (cy + Math.sin(a) * len).toFixed(1) + ' ' +
        (cx + Math.cos(a2) * 64).toFixed(1) + ',' + (cy + Math.sin(a2) * 64).toFixed(1) + '"/>';
    }
    body += '<circle cx="200" cy="200" r="70"/>';
    body += '<circle cx="200" cy="200" r="86" fill="none" stroke="#000" stroke-width="1"/>';
    return svg('0 0 400 400', '<g fill="#000">' + body + '</g>', 'black-sun');
  };

  /* ---------- 月相 ----------
     k：被照亮的比例（亏月，亮面在左）。1 满月，0 新月；'double' 双月重叠 */
  CC.moon = function (k, opts) {
    opts = opts || {};
    var r = 20, cx = 24, cy = 24, body;
    if (k === 'double') {
      body =
        '<circle cx="18" cy="24" r="17" class="moon-lit" opacity=".85"/>' +
        '<circle cx="30" cy="24" r="17" class="moon-lit" opacity=".85"/>' +
        '<circle cx="18" cy="24" r="17" class="moon-edge"/><circle cx="30" cy="24" r="17" class="moon-edge"/>';
    } else if (k <= 0) {
      body = '<circle cx="24" cy="24" r="20" class="moon-edge"/>';
    } else if (k >= 1) {
      body = '<circle cx="24" cy="24" r="20" class="moon-lit"/>';
    } else {
      var rx = Math.abs(2 * k - 1) * r;
      var sweep = k > 0.5 ? 0 : 1;
      var d = 'M' + cx + ' ' + (cy - r) +
        ' A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) +
        ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + sweep + ' ' + cx + ' ' + (cy - r) + 'Z';
      body = '<circle cx="24" cy="24" r="20" class="moon-edge"/><path d="' + d + '" class="moon-lit"/>';
    }
    return svg('0 0 48 48', body, 'moon ' + (opts.cls || ''));
  };

  /* ---------- 人物剪影（不画脸，眼睛位置是一道遮挡条） ---------- */
  var P = {
    wei: {
      grad: ['#9fd6f5', '#7fb4ee', '#8a6fe0'],
      bar: 'var(--klein-glow)',
      hair:
        'M64 92c-6-40 22-66 56-64 36 2 58 30 50 70 4 20 2 44 10 62-14 2-22-8-26-20 0 14-6 26-14 34-2-14-2-26-6-36' +
        '-10 10-30 14-46 10 6-6 10-14 10-22-8 8-20 10-30 6 8-8 8-24-4-40z',
      head: '<ellipse cx="116" cy="96" rx="38" ry="46"/>',
      bust: 'M40 240c4-46 34-70 76-72 42 2 72 26 76 72z',
      barY: 92,
    },
    ryan: {
      grad: ['#ffffff', '#e8edf3', '#cfd8e2'],
      bar: '#6fa8ff',
      hair:
        'M72 84c-2-36 24-58 50-56 30 2 52 22 48 56-6-10-14-16-24-18 4 8 2 14-2 18-6-10-18-16-32-16 2 6 0 12-6 16-8-8-20-8-34 0z',
      head: '<ellipse cx="118" cy="98" rx="38" ry="48"/>',
      bust: 'M30 240c6-50 40-74 88-76 48 2 82 26 88 76z',
      barY: 96,
    },
    anka: {
      grad: ['#f6dc8a', '#e9c46a', '#d6a948'],
      bar: '#9dbf6e',
      hair:
        'M76 120c-8-38 14-64 44-64 32 0 52 26 44 64 6 26 4 52 14 70-12 2-22-6-26-18-2 14-10 22-18 26 2-10 0-20-4-28' +
        '-6 8-18 10-30 8 6-8 6-18 2-26-6 10-16 16-28 18 10-16 8-32 2-50z',
      head: '<ellipse cx="120" cy="124" rx="32" ry="38"/>',
      bust: 'M60 240c4-34 28-54 60-56 32 2 56 22 60 56z',
      barY: 122,
    },
  };

  CC.portrait = function (who) {
    var p = P[who];
    if (!p) return '';
    var id = 'g-' + who;
    var body =
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + p.grad[0] + '"/><stop offset=".55" stop-color="' + p.grad[1] + '"/>' +
      '<stop offset="1" stop-color="' + p.grad[2] + '"/></linearGradient></defs>' +
      '<rect width="240" height="240" class="portrait__bg"/>' +
      '<g class="portrait__grid">' + gridLines(240, 20) + '</g>' +
      '<path d="' + p.bust + '" class="portrait__body"/>' +
      '<g class="portrait__body">' + p.head + '</g>' +
      '<path d="' + p.hair + '" fill="url(#' + id + ')" class="portrait__hair"/>' +
      '<rect x="70" y="' + p.barY + '" width="100" height="10" fill="' + p.bar + '" class="portrait__bar"/>';
    return svg('0 0 240 240', body, 'portrait portrait--' + who);
  };

  function gridLines(size, step) {
    var s = '';
    for (var i = step; i < size; i += step) {
      s += '<path d="M' + i + ' 0V' + size + 'M0 ' + i + 'H' + size + '"/>';
    }
    return s;
  }
  CC.gridLines = gridLines;

  function star(x, y, r) {
    return '<path class="star" d="M' + x + ' ' + (y - r * 2) + 'Q' + x + ' ' + y + ' ' + (x + r * 2) + ' ' + y +
      'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r * 2) + 'Q' + x + ' ' + y + ' ' + (x - r * 2) + ' ' + y +
      'Q' + x + ' ' + y + ' ' + x + ' ' + (y - r * 2) + 'Z"/>';
  }
  CC.star = star;
})();
