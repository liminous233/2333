/* 0. 门禁 · 维的桌面档案夹
 *
 * 底图 collage.webp 是从参考拼贴里抠出来的（地板去掉、夹住的纸改 #8F6D5F、米黄纸换成黑色金属板、
 * 荧光绿便签换成克莱因蓝）。坐标系就是这张底图：1290 × 1375，下面所有位置都按它的百分比写。
 *
 *   左边白纸：欢迎信。鼠标停着会慢慢融化，1.5 秒后闪回中文原稿 1 秒；按住可以揉成一团，
 *            点纸团展开，里面是它自己藏的另一版。
 *   右边黑板：证件（可翻面）/ 枪 / 线索便签 / 蘸水笔 / 半张牛皮纸。点一下拿起来，点空白处放回。
 */
(function () {
  var CC = window.CC;
  var G = window.CONTENT.gate;
  var IMG = 'assets/img/gate/';

  var BW = 1290, BH = 1374;                       // 底图尺寸
  function X(px) { return ((px - 38) / BW * 100).toFixed(3) + '%'; }   // 原参考图坐标 → 百分比
  function Y(px) { return ((px - 18) / BH * 100).toFixed(3) + '%'; }
  var PINS = [[710, 247], [1097, 387], [755, 1005]];

  // 黑板上的物件：位置（占舞台宽高的百分比）、宽度（占舞台宽的百分比）、角度
  var OBJ = {
    kraft: { left: 60.5, top: 27.5, w: 29, rot: -7 },
    gun:   { left: 52,   top: 30,   w: 48, rot: -27 },
    card:  { left: 63,   top: 51,   w: 22, rot: 6 },
    clue:  { left: 72,   top: 67,   w: 24, rot: -4 },
    pen:   { left: 90.5, top: 44,   w: 5.2, rot: 17 },
  };
  var ORDER = ['kraft', 'gun', 'card', 'clue', 'pen'];

  /* ---------------------------------------------------------------- 证件 */
  function frameSvg() {
    return '<svg class="idc__frame" viewBox="0 0 1000 630" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect x="14" y="14" width="972" height="602" rx="10"/>' +
      '<rect class="chain" x="26" y="26" width="948" height="578" rx="6"/>' +
      '<rect x="38" y="38" width="924" height="554" rx="3"/>' +
      '</svg>';
  }
  // 证件照位置保持一块纯黑（填了 G.photo 才显示图片）
  function photo() {
    return G.photo ? '<img src="' + CC.esc(G.photo) + '" alt="">' : '';
  }
  function cardFront(data) {
    var c = data || G.card;
    var f = c.fields.map(function (r) {
      return '<span><small>' + CC.esc(r[0]) + '</small>' + CC.esc(r[1]) + '</span>';
    }).join('');
    return '<div class="idc idc--front">' + frameSvg() +
      '<div class="idc__wm" aria-hidden="true">' + CC.esc(c.watermark) + '</div>' +
      '<header class="idc__banner"><b>' + CC.esc(c.bureau) + '</b><span>' + CC.esc(c.ministry) + '</span></header>' +
      '<p class="idc__sub">' + CC.esc(c.subordinate) + '</p>' +
      '<img class="idc__seal idc__seal--l" src="' + IMG + 'seal-compass.webp" alt="">' +
      '<img class="idc__seal idc__seal--r" src="' + IMG + 'seal-sunmoon.webp" alt="">' +
      '<div class="idc__fields">' + f + '</div>' +
      '<div class="idc__text"><p>' + CC.esc(c.lineA) + '</p><p class="idc__title">' + CC.esc(c.title) + '</p><p>' +
        CC.esc(c.lineB) + '</p></div>' +
      '</div>';
  }
  function cardBack(data) {
    var c = data || G.card;
    return '<div class="idc idc--back">' + frameSvg() +
      '<p class="idc__backtext">' + CC.esc(c.back) + '</p>' +
      '<div class="idc__sign"><span class="idc__sig">' + CC.esc(c.signer) + '</span><i></i><small>' +
        CC.esc(c.signer.toUpperCase()) + '</small></div>' +
      '<p class="idc__order">' + CC.esc(c.order) + '</p>' +
      '<div class="idc__photo">' + photo() + '</div>' +
      '<div class="idc__vline"><small>' + CC.esc(c.signatureLabel) + '</small><i></i></div>' +
      '<p class="idc__issued">' + CC.esc(c.issued) + '</p>' +
      '</div>';
  }

  // 手写便签：每个字母随机歪一点、高低不齐、深浅不一（同一个种子每次都一样）
  function wobble(text, seed) {
    var r = CC.rng(seed);
    return text.split(' ').map(function (word) {
      return '<span class="w">' + Array.from(word).map(function (ch) {
        return '<span class="c" style="--r:' + ((r() - 0.5) * 16).toFixed(1) + 'deg;--y:' + ((r() - 0.5) * 0.22).toFixed(3) +
          'em;--s:' + (0.9 + r() * 0.2).toFixed(2) + ';--o:' + (0.72 + r() * 0.28).toFixed(2) + '">' + CC.esc(ch) + '</span>';
      }).join('') + '</span>';
    }).join(' ');
  }

  /* ---------------------------------------------------------------- 各物件的样子（桌上和拿起来共用，字号都按自身宽度算） */
  function look(kind) {
    switch (kind) {
      case 'card':
        return cardFront();
      case 'gun':
        return '<img src="' + IMG + 'gun.webp" alt="" draggable="false">';
      case 'pen':
        return '<img src="' + IMG + 'pen.webp" alt="" draggable="false">';
      case 'clue':
        return '<img src="' + IMG + 'clue.webp" alt="" draggable="false"><div class="clue__ink">' +
          G.clue.map(function (l, i) { return '<p style="--i:' + i + '">' + wobble(l, 17 + i) + '</p>'; }).join('') + '</div>';
      case 'kraft':
        return '<img src="' + IMG + 'kraft.webp" alt="" draggable="false"><b class="kraft__ink">' + CC.esc(G.kraft) + '</b>';
    }
    return '';
  }

  // 证物柜（手提箱）里也放着这几样东西，样子共用
  CC.gateLook = { look: look, cardFront: cardFront, cardBack: cardBack, wobble: wobble };

  /* ---------------------------------------------------------------- 欢迎信 */
  var MELT = [            // [选择器, 坏的程度]：越往后越坏，落款不在这里（永远清晰）
    ['.lt__title', 0.06], ['.lt__greet', 0.1], ['.lt__p0', 0.22], ['.lt__p1', 0.62], ['.lt__p2', 1], ['.lt__closing', 0.45],
    ['.lt__off', 0.3],
  ];
  function letterHtml(L, cls) {
    return '<div class="lt__layer ' + cls + '">' +
      '<h2 class="lt__title">' + CC.esc(L.title) + '</h2>' +
      '<p class="lt__greet">' + CC.esc(L.greeting) + '</p>' +
      L.body.map(function (p, i) { return '<p class="lt__p lt__p' + i + '">' + CC.esc(p) + '</p>'; }).join('') +
      '<p class="lt__closing">' + CC.esc(L.closing) + '</p>' +
      '<p class="lt__sig">' + CC.esc(L.signature) + '</p>' +
      '<p class="lt__off">' + CC.esc(L.signOff) + '</p>' +
      '</div>';
  }
  function meltFilters() {
    return '<svg class="melt-defs" width="0" height="0" aria-hidden="true">' + MELT.map(function (m, i) {
      return '<filter id="melt' + i + '" x="-5%" y="-20%" width="110%" height="160%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.09" numOctaves="2" seed="' + (i + 3) + '" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
        '</filter>';
    }).join('') + '</svg>';
  }

  /* ---------------------------------------------------------------- 页面 */
  CC.pages.gate = function (root) {
    var objs = ORDER.map(function (k) {
      var o = OBJ[k];
      return '<button class="obj obj--' + k + '" data-obj="' + k + '" style="left:' + o.left + '%;top:' + o.top + '%;width:' +
        o.w + '%;--rot:' + o.rot + 'deg" aria-label="' + CC.esc(G.objects[k].zh) + '">' + look(k) + '</button>';
    }).join('');
    var pins = PINS.map(function (p, i) {
      return '<img class="pin pin--' + i + '" src="' + IMG + 'pin.png" alt="" style="left:' + X(p[0]) + ';top:' + Y(p[1]) + '">';
    }).join('');
    var P = PINS.map(function (p) { return [p[0] - 38, p[1] - 18]; });
    function sag(a, b, k) {
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + k;
      return 'M' + a[0] + ',' + a[1] + ' Q' + mx + ',' + my + ' ' + b[0] + ',' + b[1];
    }
    var thread = '<svg class="thread" viewBox="0 0 ' + BW + ' ' + BH + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="thread__shadow t0" d="' + sag(P[0], P[1], 14) + '"/><path class="thread__shadow t1" d="' + sag(P[1], P[2], 10) + '"/>' +
      '<path class="thread__line t0" d="' + sag(P[0], P[1], 14) + '"/><path class="thread__line t1" d="' + sag(P[1], P[2], 10) + '"/>' +
      '</svg>';

    root.innerHTML =
      '<section class="desk">' +
        '<p class="desk__kicker mono">' + CC.esc(G.kicker) + '</p>' +
        '<div class="desk__stage">' +
          '<img class="desk__base" src="' + IMG + 'collage.webp" alt="" draggable="false">' +
          '<article class="letter" style="left:' + X(117) + ';top:' + Y(153) + ';width:' + (649 / BW * 100) + '%;height:' +
            (945 / BH * 100) + '%" aria-label="Welcome letter">' +
            letterHtml(G.letter, 'lt--en') + letterHtml(G.letter.zh, 'lt--zh') +
          '</article>' +
          '<img class="desk__note" src="' + IMG + 'note.webp" alt="" draggable="false" style="left:' + X(438) + ';top:' + Y(963) +
            ';width:' + (417 / BW * 100) + '%">' +
          '<p class="note__ink" style="left:' + X(644.8) + ';top:' + Y(1177.3) + '">' + wobble(G.note, 5) + '</p>' +
          objs + thread + pins +
        '</div>' +
        '<div class="desk__auth">' +
          '<button class="btn btn--klein" id="authBtn">' + CC.esc(G.button) + '</button>' +
          '<p class="gate__status mono" id="authMsg" aria-live="polite"></p>' +
        '</div>' +
        meltFilters() +
      '</section>' +
      '<p class="gate__egg mono">' + CC.esc(G.easterEgg) + '</p>';

    var stage = CC.$('.desk__stage', root);
    var letter = CC.$('.letter', root);
    var cleanups = [];

    /* ---- 欢迎信：融化 + 闪回 ---- */
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var reduce = CC.reducedMotion();
    var parts = MELT.map(function (m, i) {
      return { els: CC.$$('.lt--en ' + m[0], letter), k: m[1], disp: CC.$('#melt' + i + ' feDisplacementMap', root), id: 'melt' + i };
    });
    var melt = 0, hovering = false, raf = 0, lastT = 0, flashTimer = 0, flashUsed = false;

    function paintMelt() {
      var unit = letter.offsetWidth / 450;   // 按纸张大小缩放
      parts.forEach(function (p) {
        var e = Math.min(1, melt * p.k * 1.15);
        if (p.disp) p.disp.setAttribute('scale', (e * 22 * unit).toFixed(2));
        var f = e > 0.002 ? ((coarse ? '' : 'url(#' + p.id + ') ') + 'blur(' + (e * 2.4 * unit).toFixed(2) + 'px)') : '';
        p.els.forEach(function (el) {
          el.style.filter = f;
          el.style.transform = e > 0.002 ? 'translateY(' + (e * 0.35).toFixed(3) + 'em) scaleY(' + (1 + e * 0.16).toFixed(3) + ')' : '';
          el.style.opacity = (1 - e * 0.32).toFixed(3);
          el.style.letterSpacing = e > 0.002 ? (e * 0.04).toFixed(3) + 'em' : '';
        });
      });
    }
    function tick(t) {
      raf = 0;
      var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 1 / 60;
      lastT = t;
      var before = melt;
      if (hovering) melt = Math.min(1, melt + dt * (0.05 + 0.32 * melt));    // 一开始很慢，越来越快
      else melt = Math.max(0, melt - dt * 0.012);                           // 移开后几乎不恢复
      if (melt !== before) paintMelt();
      if (hovering || melt > 0) raf = requestAnimationFrame(tick); else lastT = 0;
    }
    function startHover() {
      if (hovering || crumpled()) return;
      hovering = true;
      if (!reduce && !raf) raf = requestAnimationFrame(tick);
      if (reduce) { melt = Math.max(melt, 0.6); paintMelt(); }
      if (!flashUsed) {
        clearTimeout(flashTimer);
        flashTimer = setTimeout(function () {
          if (!hovering) return;
          flashUsed = true;               // 想再看一次闪回得把鼠标移开再放上来
          letter.classList.add('is-flash');
          flashTimer = setTimeout(function () { letter.classList.remove('is-flash'); }, 1000);
        }, 1500);
      }
      crumple.prepare();
    }
    function endHover() {
      if (!hovering) return;
      hovering = false;
      flashUsed = false;
      clearTimeout(flashTimer);
      letter.classList.remove('is-flash');
      if (!raf && melt > 0 && !reduce) raf = requestAnimationFrame(tick);
    }
    letter.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') startHover(); });
    letter.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') endHover(); });
    // 手机：点一下开始"停留"，点纸外面结束
    function outside(e) { if (hovering && !letter.contains(e.target)) endHover(); }
    document.addEventListener('pointerdown', outside);
    cleanups.push(function () { document.removeEventListener('pointerdown', outside); });

    /* ---- 欢迎信：揉纸团 ---- */
    function crumpled() { var s = stage.getAttribute('data-crumple'); return s && s !== 'restored'; }
    var crumple = CC.crumple({
      host: stage, sheet: letter, label: G.letter.hint, paperColor: '#e4e7ec',
      draw: drawSheet,
      onState: function (s, side) {
        if (s === 'holding') { endHover(); letter.classList.add('is-gone'); }
        if (s === 'restored') { letter.classList.remove('is-gone'); }
      },
    });
    cleanups.push(function () { crumple.destroy(); });
    var idle = setTimeout(function () { crumple.prepare(); }, 2500);
    cleanups.push(function () { clearTimeout(idle); });

    var press = null;
    letter.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      crumple.prepare();
      press = { e: e, x: e.clientX, y: e.clientY, timer: setTimeout(go, e.pointerType === 'touch' ? 650 : 240) };
      try { letter.setPointerCapture(e.pointerId); } catch (err) {}
      function go() {
        if (!press) return;
        var pe = press.e;
        crumple.prepare().then(function () {
          if (!press || press.e !== pe) return;
          try { letter.releasePointerCapture(pe.pointerId); } catch (err) {}
          press = null;
          crumple.grab(pe);
        });
      }
      press.go = go;
    });
    letter.addEventListener('pointermove', function (e) {
      if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > (e.pointerType === 'touch' ? 14 : 6)) { clearTimeout(press.timer); press.go(); }
    });
    function letGo(e) { if (press) {
      if (e.type === 'pointerup' && e.pointerType === 'touch') {
        var on = !letter.classList.contains('is-flash'); endHover(); hovering = on; letter.classList.toggle('is-flash', on);
      }
      clearTimeout(press.timer); press = null;
    } }
    letter.addEventListener('pointerup', letGo);
    letter.addEventListener('pointercancel', letGo);

    // 把白纸按屏幕上现在的样子画进贴图（逐词取位置，融化程度也带上）
    function drawSheet(ctx, w, h, side) {
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#eef0f4'); g.addColorStop(1, '#e6e8ee');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (side === 1) {
        ctx.save();
        ctx.translate(w * 0.5, h * 0.46);
        ctx.rotate(-0.05);
        ctx.fillStyle = 'rgba(14, 18, 34, .9)';
        ctx.font = (w * 0.085).toFixed(1) + 'px "Homemade Apple", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.filter = 'blur(0.4px)';
        ctx.fillText(G.letter.hidden, 0, 0);
        ctx.restore();
        return;
      }
      var box = letter.getBoundingClientRect();
      var sx = w / box.width, sy = h / box.height;
      var layer = CC.$(letter.classList.contains('is-flash') ? '.lt--zh' : '.lt--en', letter);
      CC.$$('h2, p', layer).forEach(function (el) {
        var cs = getComputedStyle(el);
        ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + (parseFloat(cs.fontSize) * sx).toFixed(2) + 'px ' + cs.fontFamily;
        ctx.fillStyle = cs.color;
        ctx.globalAlpha = parseFloat(cs.opacity) || 1;
        var blur = /blur\(([\d.]+)px\)/.exec(el.style.filter || '');
        ctx.filter = blur ? 'blur(' + (parseFloat(blur[1]) * sx).toFixed(2) + 'px)' : 'none';
        ctx.textBaseline = 'middle';
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        var node, range = document.createRange();
        while ((node = walker.nextNode())) {
          var text = node.nodeValue, re = /\S+/g, m;
          while ((m = re.exec(text))) {
            range.setStart(node, m.index);
            range.setEnd(node, m.index + m[0].length);
            var rects = range.getClientRects();
            if (!rects.length) continue;
            var r = rects[0];
            ctx.fillText(m[0], (r.left - box.left) * sx, ((r.top + r.bottom) / 2 - box.top) * sy);
          }
        }
      });
      ctx.globalAlpha = 1;
      ctx.filter = 'none';
    }

    /* ---- 物件：拿起来 / 放回 ---- */
    var lifted = null;
    stage.addEventListener('click', function (e) {
      var b = e.target.closest('.obj');
      if (b && !lifted) pick(b.getAttribute('data-obj'), b);
    });
    function pick(kind, src) {
      var meta = G.objects[kind];
      var layer = document.createElement('div');
      layer.className = 'lift lift--' + kind;
      var inner = kind === 'card'
        ? '<div class="lift__card"><span class="fc__shadow"></span><div class="fc__rotor"><div class="fc__face fc__front">' + cardFront() +
            '<span class="fc__glare"></span></div><div class="fc__face fc__back">' + cardBack() + '<span class="fc__glare"></span></div></div></div>'
        : '<div class="lift__tilt obj--' + kind + '">' + look(kind) + '<span class="fc__glare"></span></div>';
      layer.innerHTML = '<div class="lift__back" data-put></div>' +
        '<figure class="lift__item">' + inner + '</figure>' +
        '<figcaption class="lift__cap mono"><span>' + CC.esc(meta.en) + '</span> · ' + CC.esc(meta.zh) +
          (kind === 'card' ? '<em>' + CC.esc(G.card.flipHint) + '</em>' : '') + '</figcaption>' +
        '<button class="lift__put mono" data-put>' + CC.esc(G.objects.putBack) + '</button>';
      document.body.appendChild(layer);
      if (kind === 'clue') CC.storyUI.clue(layer);
      var item = CC.$('.lift__item', layer);
      var fc = null, tiltEl = CC.$('.lift__tilt', layer);
      if (kind === 'card') { var cardRoot = CC.$('.lift__card', layer);
        fc = CC.flipCard(cardRoot, { tiltMax: 10, onTouchTap: function () { CC.storyUI.toggleCard(cardRoot); } });
        CC.storyUI.card(cardRoot, fc, false);
      }

      // 从桌上的位置飞过来
      var sr = src.getBoundingClientRect(), ir = item.getBoundingClientRect();
      var s = src.offsetWidth / item.offsetWidth;
      var dx = (sr.left + sr.width / 2) - (ir.left + ir.width / 2), dy = (sr.top + sr.height / 2) - (ir.top + ir.height / 2);
      var from = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + OBJ[kind].rot + 'deg) scale(' + s + ')';
      src.classList.add('is-lifted');
      var dur = reduce ? 1 : 520;
      item.animate([{ transform: from }, { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });
      layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.6, fill: 'both' });

      function tilt(e) {
        if (!tiltEl || e.pointerType === 'touch' || reduce) return;
        var r = item.getBoundingClientRect();
        var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        tiltEl.style.transform = 'perspective(1100px) rotateX(' + ((0.5 - py) * 16).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 16).toFixed(2) + 'deg)';
        tiltEl.style.setProperty('--fc-gx', (px * 100).toFixed(1) + '%');
        tiltEl.style.setProperty('--fc-gy', (py * 100).toFixed(1) + '%');
        tiltEl.style.setProperty('--fc-sheen', '1');
      }
      layer.addEventListener('pointermove', tilt);
      function onKey(e) { if (e.key === 'Escape') put(); }
      document.addEventListener('keydown', onKey);
      layer.addEventListener('click', function (e) { if (e.target.closest('[data-put]')) put(); });

      function put() {
        if (!lifted || lifted.layer !== layer) return;
        lifted = null;
        document.removeEventListener('keydown', onKey);
        var sr2 = src.getBoundingClientRect(), ir2 = item.getBoundingClientRect();
        var dx2 = (sr2.left + sr2.width / 2) - (ir2.left + ir2.width / 2), dy2 = (sr2.top + sr2.height / 2) - (ir2.top + ir2.height / 2);
        var to = 'translate(' + dx2 + 'px,' + dy2 + 'px) rotate(' + OBJ[kind].rot + 'deg) scale(' + (src.offsetWidth / item.offsetWidth) + ')';
        if (tiltEl) tiltEl.style.transform = '';
        var a = item.animate([{ transform: getComputedStyle(item).transform === 'none' ? 'none' : getComputedStyle(item).transform }, { transform: to }],
          { duration: dur * 0.85, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.85, fill: 'forwards', easing: 'ease-in' });
        a.onfinish = function () {
          src.classList.remove('is-lifted');
          if (fc) fc.destroy();
          layer.remove();
          src.focus({ preventScroll: true });
        };
      }
      lifted = { layer: layer, put: put };
      var focusTarget = kind === 'card' ? CC.$('.lift__card', layer) : CC.$('.lift__put', layer);
      focusTarget.focus({ preventScroll: true });
    }
    cleanups.push(function () { if (lifted) { lifted.layer.remove(); lifted = null; } });

    /* ---- 验证进入 ---- */
    var btn = CC.$('#authBtn', root);
    btn.addEventListener('click', function () {
      btn.disabled = true;
      var msg = CC.$('#authMsg', root);
      msg.textContent = G.checking;
      stage.classList.add('is-scanning');
      setTimeout(function () {
        stage.classList.remove('is-scanning');
        msg.textContent = CC.story.route() === 'RECONNECT' ? window.CONTENT.v02.welcomeBack : G.success;
        if (CC.story.route() === 'RECONNECT') CC.state.setFlag('v02:reentered');
        CC.state.auth();
        setTimeout(function () { CC.go('home'); }, 1300);
      }, reduce ? 200 : 1600);
    });

    CC.cleanup = function () {
      cancelAnimationFrame(raf);
      clearTimeout(flashTimer);
      cleanups.forEach(function (f) { f(); });
    };
  };
})();
