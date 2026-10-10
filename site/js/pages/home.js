/* 1. 首页：左边标题；右边月相弧 + 字母唱片 + 穿过唱片的银莲花 + 三个小块（档案 / 状态 / 致谢） */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;

  // 右边画面的坐标系（和截图里的草图对应）：宽 760，高 900
  var VW = 760, VH = 900;
  var DISC = { cx: 360, cy: 616, r: 232, hub: 88, hole: 28 };
  // 花束：茎在图片 (0.455, 0.93) 处穿过唱片中心洞
  var FLOWER = { h: 650, ratio: 1050 / 1364, holeX: 0.455, holeY: 0.93 };

  function pct(v, total) { return (v / total * 100).toFixed(3) + '%'; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- 月相弧（8 天） ---------- */
  function moons() {
    var cx = 360, cy = 414, r = 386, a0 = 214, a1 = 326, size = 44;
    return C.days.map(function (d, i) {
      var a = (a0 + (a1 - a0) * i / (C.days.length - 1)) * Math.PI / 180;
      var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      var img;
      if (d.moon === 'double') {
        img = '<img src="assets/img/moon-1.png" alt=""><img src="assets/img/moon-1.png" alt="" class="moonb__twin">';
      } else if (d.moon <= 0) {
        img = '<img src="assets/img/moon-1.png" alt="" class="moonb__new">';
      } else {
        img = '<img src="assets/img/moon-' + Math.min(d.day, 6) + '.png" alt="">';
      }
      var read = CC.state.seen('day:' + d.day);
      return '<a class="moonb' + (read ? ' is-read' : '') + '" href="#/journal/' + d.day + '" aria-label="第 ' + d.day + ' 日 ' + CC.esc(d.phase) + '"' +
        ' style="left:' + pct(x - size / 2, VW) + ';top:' + pct(y - size / 2, VH) + ';width:' + pct(size, VW) + '">' +
        '<span class="moonb__img">' + img + '</span><span class="moonb__no mono">' + pad(d.day) + '</span></a>';
    }).join('');
  }

  /* ---------- 字母唱片 ---------- */
  function spiralPath(rOut, rIn, gap) {
    var turns = (rOut - rIn) / gap, steps = Math.ceil(turns * 120), d = '';
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var th = -Math.PI / 2 + t * turns * Math.PI * 2;   // 从正上方开始，顺时针向内
      var rr = rOut - t * (rOut - rIn);
      d += (i ? 'L' : 'M') + (Math.cos(th) * rr).toFixed(1) + ' ' + (Math.sin(th) * rr).toFixed(1);
    }
    return d;
  }

  function disc(H) {
    var R = DISC.r - 6;
    var text = H.discText;
    while (text.length < 2600) text += ' ✦ ' + H.discText;
    var hubText = H.hubText;
    return '<svg viewBox="' + (-DISC.r) + ' ' + (-DISC.r) + ' ' + DISC.r * 2 + ' ' + DISC.r * 2 + '" class="disc" aria-hidden="true">' +
      '<defs>' +
        '<path id="discSpiral" d="' + spiralPath(R, DISC.hub + 12, 13.5) + '"/>' +
        '<path id="hubRing" d="M0 -76A76 76 0 1 1 -0.1 -76"/>' +
        '<mask id="hubHole"><rect x="' + (-DISC.r) + '" y="' + (-DISC.r) + '" width="' + DISC.r * 2 + '" height="' + DISC.r * 2 + '" fill="#fff"/><circle r="' + DISC.hole + '" fill="#000"/></mask>' +
      '</defs>' +
      // 和背景同色的底：看不出边，但把后面的茎完全挡住（像布）
      '<circle r="' + DISC.r + '" class="disc__cloth" mask="url(#hubHole)"/>' +
      '<text class="disc__text"><textPath href="#discSpiral">' + CC.esc(text) + '</textPath></text>' +
      '<g class="disc__hub" mask="url(#hubHole)">' +
        '<circle r="' + DISC.hub + '" class="hub__fill"/>' +
        '<circle r="' + DISC.hub + '" class="hub__line"/>' +
        '<circle r="66" class="hub__line hub__line--thin"/>' +
        '<circle r="52" class="hub__line"/>' +
        '<circle r="' + (DISC.hole + 8) + '" class="hub__line hub__line--thin"/>' +
        '<text class="hub__text"><textPath href="#hubRing">' + CC.esc(hubText) + '</textPath></text>' +
      '</g>' +
      '<circle r="' + DISC.hole + '" class="hub__edge"/>' +
    '</svg>';
  }

  /* ---------- 银莲花（整束），前后两层实现"穿针" ---------- */
  function flowerLayer(H, cls) {
    var w = FLOWER.h * FLOWER.ratio;
    var left = DISC.cx - FLOWER.holeX * w, top = DISC.cy - FLOWER.holeY * FLOWER.h;
    var style = 'left:' + pct(left, VW) + ';top:' + pct(top, VH) + ';width:' + pct(w, VW) + ';' +
      '--cut:' + ((1 - FLOWER.holeY) * 100).toFixed(2) + '%';
    if (!H.flowersImage) return '';
    return '<div class="fl ' + cls + '" style="' + style + '">' +
      '<img class="fl__main" src="' + CC.esc(H.flowersImage) + '" alt="">' +
      (H.flowersAltImage ? '<img class="fl__alt" src="' + CC.esc(H.flowersAltImage) + '" alt="">' : '') +
      '<img class="fl__ghost" src="' + CC.esc(H.flowersImage) + '" alt="">' +
      '</div>';
  }

  /* ---------- 茎的延长段：接在花束图底部，从唱片后面穿出底边 ---------- */
  function stems() {
    var w = FLOWER.h * FLOWER.ratio;
    var left = DISC.cx - FLOWER.holeX * w;
    var y0 = DISC.cy + (1 - FLOWER.holeY) * FLOWER.h - 6;   // 花束图底边
    // 图片底部两根茎的位置（占图宽的比例）与粗细
    var list = [
      { x: 0.406, wd: 0.018, bend: -20 },
      { x: 0.470, wd: 0.018, bend: -4 },
      { x: 0.500, wd: 0.019, bend: 14 },
    ];
    var paths = list.map(function (s) {
      var x = left + s.x * w, half = s.wd * w / 2;
      var x1 = x + s.bend, y1 = VH + 20;
      return '<path d="M' + (x - half) + ' ' + y0 + 'C' + (x - half) + ' ' + (y0 + 120) + ' ' + (x1 - half * .8) + ' ' + (y1 - 120) + ' ' + (x1 - half * .7) + ' ' + y1 +
        'L' + (x1 + half * .7) + ' ' + y1 + 'C' + (x1 + half * .8) + ' ' + (y1 - 120) + ' ' + (x + half) + ' ' + (y0 + 120) + ' ' + (x + half) + ' ' + y0 + 'Z"/>';
    }).join('');
    return '<svg class="stems" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="stemGrad" x1="0" x2="1"><stop offset="0" stop-color="#0d1015"/><stop offset=".45" stop-color="#4a515b"/><stop offset="1" stop-color="#0b0d12"/></linearGradient></defs>' +
      '<g fill="url(#stemGrad)">' + paths + '</g></svg>';
  }

  /* ---------- 三个小块：档案 / 状态 / 致谢，沿唱片右侧弧线排开 ---------- */
  function tabs(H) {
    var P = H.panels, s = CC.state;
    var files = ['map', 'evidence', 'rules', 'missing'].map(function (route) {
      var n = C.nav.filter(function (x) { return x.route === route; })[0];
      return '<a class="opt" href="#/' + route + '"><span class="opt__en">' + CC.esc(n.en) + '</span><span class="opt__zh">' + CC.esc(n.zh) + '</span></a>';
    }).join('');

    var held = [];
    if (s.flag('candleLit')) held.push('香烛（燃）');
    if (s.flag('gunLoaded')) held.push('手枪（上膛）');
    if (s.flag('bellflowerWorn')) held.push('风铃草');
    if (s.flag('anemonePressed')) held.push('银莲花');
    var maxDay = s.maxDay();
    var status = [
      ['READING', maxDay ? 'DAY ' + pad(maxDay) : '——'],
      ['STATE', C.ui.stages[s.stage]],
      ['HOLDING', held.length ? held.join(' / ') : '——'],
      ['CASE', CC.esc(C.ui.locked)],
    ].map(function (r) {
      return '<div class="desk__row"><span class="mono">' + r[0] + '</span><span>' + (r[0] === 'CASE' ? r[1] : CC.esc(r[1])) + '</span></div>';
    }).join('');

    // 致谢：图片署名
    var credits = H.credits.map(function (r) {
      return '<div class="desk__row desk__row--credit"><span class="mono">' + CC.esc(r[0]) + '</span><span>' + CC.esc(r[1]) + '</span></div>';
    }).join('');

    var list = [
      { id: 'files', en: P.files, zh: P.filesZh, body: '<div class="opts">' + files + '</div>', ang: -38 },
      { id: 'status', en: P.desk, zh: P.deskZh, body: status, ang: -8 },
      { id: 'credits', en: P.credits, zh: P.creditsZh, body: credits, ang: 22 },
    ];
    return list.map(function (t) {
      var a = t.ang * Math.PI / 180;
      var x = DISC.cx + Math.cos(a) * DISC.r - 74, y = DISC.cy + Math.sin(a) * DISC.r - 19;
      return '<div class="tab" data-tab="' + t.id + '" style="left:' + pct(x, VW) + ';top:' + pct(y, VH) + '">' +
        '<button class="tab__head" aria-expanded="false">' +
          '<img src="assets/img/star.png" alt="" class="tab__star">' +
          '<b>' + CC.esc(t.en) + '</b><span>' + CC.esc(t.zh) + '</span>' +
        '</button>' +
        '<div class="tab__body">' + t.body + '</div>' +
      '</div>';
    }).join('');
  }

  /* ---------- 结局 2 之后：右半页整页换成黑日（小红书 @無山 的作品，要署名），月相弧也不要 ---------- */
  function blackSun() {
    return '<figure class="bsun"><img src="assets/img/church/black-sun.webp" alt="">' +
      '<figcaption>' + CC.esc(C.bliss.sunCredit) + '</figcaption></figure>';
  }

  CC.pages.home = function (root) {
    var H = C.home;
    var B = C.bliss;
    var bliss = CC.state.flag('bliss');
    document.body.classList.toggle('is-bliss', bliss);

    root.innerHTML =
      '<section class="cover' + (bliss ? ' cover--bliss' : '') + '">' +
        '<div class="cover__left">' +
          (bliss
            ? '<div class="cover__bg cover__bg--bliss" style="background-image:url(\'assets/img/church/red-figure.webp\')"></div>' +
              '<div class="bliss__title"><p class="bliss__zh">' + CC.esc(B.zh) + '</p><p class="bliss__en">' + CC.esc(B.en) + '</p></div>'
            : (H.bgImage ? '<div class="cover__bg" style="background-image:url(\'' + CC.esc(H.bgImage) + '\')"></div>' : '')) +
          '<div class="cover__inner">' +
            '<p class="eyebrow mono cover__eyebrow">' + CC.esc(H.kicker) + '</p>' +
            '<h1 class="cover__title"><a class="cover__start" href="#/' + H.startRoute + '" aria-label="' + CC.esc(H.titleA + ' ' + H.titleB + ' · ' + H.startHint) + '">' +
              '<span class="cover__a">' + CC.esc(H.titleA) + '</span>' +
              '<span class="cover__b">' + CC.esc(H.titleB) + '<i>.</i></span>' +
              '<span class="cover__hint mono">' + CC.esc(H.startHint) + ' →</span>' +
            '</a></h1>' +
            '<p class="cover__en">' + CC.esc(H.titleEn) + '</p>' +
            '<p class="cover__party">' + CC.esc(H.partySign) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="cover__right">' +
          (bliss ? blackSun() : '') +
          '<div class="stage">' +
            (bliss ? '' :
              '<div class="stage__moons">' + moons() + '</div>' +
              stems() +
              flowerLayer(H, 'fl--back') +
              '<div class="stage__disc" style="left:' + pct(DISC.cx - DISC.r, VW) + ';top:' + pct(DISC.cy - DISC.r, VH) + ';width:' + pct(DISC.r * 2, VW) + '">' + disc(H) + '</div>' +
              flowerLayer(H, 'fl--front')) +
            tabs(H) +
          '</div>' +
        '</div>' +
      '</section>';

    // 小块：悬停或点击展开，一次只开一个
    var tabEls = CC.$$('.tab', root);
    function open(el, on) {
      tabEls.forEach(function (t) {
        var o = t === el && on;
        t.classList.toggle('is-open', o);
        CC.$('.tab__head', t).setAttribute('aria-expanded', o ? 'true' : 'false');
      });
    }
    // 鼠标离开后停留一会儿再收起，方便移到下面的选项上
    var closeT = 0;
    tabEls.forEach(function (t) {
      CC.$('.tab__head', t).addEventListener('click', function () { clearTimeout(closeT); open(t, !t.classList.contains('is-open')); });
      t.addEventListener('mouseenter', function () { clearTimeout(closeT); open(t, true); });
      t.addEventListener('mouseleave', function () {
        clearTimeout(closeT);
        closeT = setTimeout(function () { if (t.classList.contains('is-open')) open(t, false); }, 600);
      });
    });

    // 鼠标在右边移动：花闪几下故障
    var stage = CC.$('.stage', root);
    if (CC.$('.fl', root) && !CC.reducedMotion()) {
      var right = CC.$('.cover__right', root);
      var last = 0, timer = 0;
      var onMove = function () {
        var now = Date.now();
        if (now - last < 2600) return;
        last = now;
        stage.classList.remove('is-glitch');
        void stage.offsetWidth;
        stage.classList.add('is-glitch');
        clearTimeout(timer);
        timer = setTimeout(function () { stage.classList.remove('is-glitch'); }, 900);
      };
      right.addEventListener('mousemove', onMove);
      CC.cleanup = function () { right.removeEventListener('mousemove', onMove); clearTimeout(timer); };
    }

    // 结局 2 之后：左边待久了开始融化（掉 san）
    if (bliss && !CC.reducedMotion()) {
      var left = CC.$('.cover__left', root);
      left.insertAdjacentHTML('beforeend', '<svg class="melt-defs" width="0" height="0" aria-hidden="true">' +
        '<filter id="blissMelt" x="-5%" y="-5%" width="110%" height="130%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="2" seed="13" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>');
      var disp = CC.$('#blissMelt feDisplacementMap', left);
      var m = 0, raf = 0, t0 = 0;
      var melt = function (t) {
        if (!t0) t0 = t;
        m = Math.min(1, (t - t0) / 45000);             // 45 秒化到底
        var e = m * m;
        disp.setAttribute('scale', (e * 120).toFixed(1));
        left.style.setProperty('--melt', e.toFixed(3));
        if (m < 1) raf = requestAnimationFrame(melt);
      };
      var startT = setTimeout(function () { left.classList.add('is-melting'); raf = requestAnimationFrame(melt); }, B.meltAfter);
      var prev = CC.cleanup;
      CC.cleanup = function () { if (prev) prev(); clearTimeout(startT); cancelAnimationFrame(raf); document.body.classList.remove('is-bliss'); };
    }
  };
})();
