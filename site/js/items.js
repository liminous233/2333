/* 手提箱里的物件（方案 3）：箱子里的样子、拿起来的样子、下方文案和选项。
 * 证物柜、游客守则页、失踪档案页共用同一套（"互通"：在哪儿选过，另一边也算选过）。
 *
 *   CC.items.look(kind)                     箱子里的样子
 *   CC.items.lift(kind, { src })            从箱子里拿起来（浮层），src 是箱子里那件的元素
 *   CC.items.lift(kind, { page: root })     直接铺在页面上（守则页 / 失踪档案页）
 *
 * 拿起来以后：跟着鼠标微微倾斜（伪 3D），平时轻轻晃。不能翻转（证件除外，证件本来就能翻面）。
 * 选项只能选一次，同化值 / 明晰只在后台记，不弹数值。
 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;
  var E = C.evidence;
  var IMG = 'assets/img/journal/';
  var GATE = ['gun', 'card', 'clue', 'pen', 'kraft'];
  var LABEL = C.gate.objects;

  /* ---------------------------------------------------------------- 各物件的样子 */
  // 短白香烛：用户用 GPT 生成的照片（白底已抠掉）；火苗和光晕是代码叠上去的，点燃时才显示
  function candle() {
    return '<div class="cdl"><img src="' + IMG + 'candle.webp" alt="" draggable="false"><span class="cdl__glow"></span><span class="cdl__flame"></span></div>';
  }

  // 颂歌谱子：米白纸、几行五线谱、花体英文；中文层平时藏着
  function staves() {
    var r = CC.rng(7), out = '';
    for (var s = 0; s < 3; s++) {
      var y0 = 8 + s * 34;
      for (var l = 0; l < 5; l++) out += '<line x1="4" x2="296" y1="' + (y0 + l * 4) + '" y2="' + (y0 + l * 4) + '"/>';
      out += '<path class="clef" d="M10 ' + (y0 + 17) + 'c-4-6 6-14 2-20c-3 4-2 10 1 15c3 5-1 9-5 6"/>';
      var x = 26;
      while (x < 286) {
        var step = Math.floor(r() * 9) - 2, ny = y0 + 8 + step * 2;
        out += '<ellipse cx="' + x.toFixed(1) + '" cy="' + ny + '" rx="2.3" ry="1.6" transform="rotate(-20 ' + x.toFixed(1) + ' ' + ny + ')"' +
          (r() < 0.25 ? ' class="open"' : '') + '/>';
        out += '<line class="stem" x1="' + (x + 2).toFixed(1) + '" x2="' + (x + 2).toFixed(1) + '" y1="' + ny + '" y2="' + (ny - 11) + '"/>';
        if (r() < 0.16) out += '<line x1="' + (x + 9).toFixed(1) + '" x2="' + (x + 9).toFixed(1) + '" y1="' + y0 + '" y2="' + (y0 + 16) + '"/>';
        x += 9 + r() * 10;
      }
    }
    return '<svg class="hymn__staves" viewBox="0 0 300 108" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
  }
  function hymn() {
    var H = C.hymn;
    return '<div class="hymn">' +
      '<p class="hymn__title">' + CC.esc(H.title) + '</p>' + staves() +
      '<div class="hymn__body"><p class="hymn__en">' + CC.esc(H.en) + '</p>' +
        '<p class="hymn__zh" aria-hidden="true">' + CC.esc(H.zh) + '</p></div>' +
      '</div>';
  }

  // 游客守则：笔记本左页手写
  function notebook() {
    var R = C.rules, num = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ'];
    function ink(lang) {
      return '<div class="nb__ink nb__ink--' + lang + '"' + (lang === 'zh' ? ' aria-hidden="true"' : '') + '>' +
        '<p class="nb__title">' + CC.esc(lang === 'zh' ? R.titleZh : R.title) + '</p>' +
        R.items.map(function (it, i) {
          return '<p class="nb__rule' + (it.blur ? ' is-blur' : '') + '" style="--i:' + i + '"><b>' + num[i] + '.</b> ' + CC.esc(it[lang]) + '</p>';
        }).join('') +
        '</div>';
    }
    return '<div class="nb"><img src="' + IMG + 'notebook.webp" alt="" draggable="false">' + ink('en') + ink('zh') + '</div>';
  }

  // 失踪档案：抽出来的旧纸
  function paper() {
    var M = C.missing, L = M.labels;
    function row(k, v, blur) {
      return '<span class="mf__f"><small>' + CC.esc(k) + '：</small>' + (blur ? '<i class="mf__blur">' + '██ 年 █ 月 ██ 日' + '</i>' : CC.esc(v)) + '</span>';
    }
    var people = M.people.map(function (p) {
      return '<div class="mf__p">' +
        row(L.name, p.name) + row(L.sex, p.sex) + row(L.age, p.age) + row(L.job, p.job) +
        '<span class="mf__f mf__f--wide"><small>' + CC.esc(L.when) + '：</small>' + CC.esc(p.when) + '</span>' +
        '<span class="mf__f mf__f--wide"><small>' + CC.esc(L.where) + '：</small>' + CC.esc(p.where) + '</span>' +
        '</div>';
    }).join('');
    return '<div class="mf__paper">' +
      '<img src="' + IMG + 'paper.webp" alt="" draggable="false">' +
      '<div class="mf__ink">' +
        '<h3 class="mf__head">' + CC.esc(M.head) + '</h3>' +
        '<div class="mf__meta">' + M.meta.map(function (m) { return row(m[0], m[1], m[2] === 'blur'); }).join('') + '</div>' +
        '<div class="mf__people">' + people + '</div>' +
      '</div>' +
      '<figure class="mf__photo"><img src="' + IMG + 'photo.webp" alt="" draggable="false"><i class="tape tape--a"></i><i class="tape tape--b"></i></figure>' +
      '</div>';
  }

  // 两半牛皮纸：WE（门禁页那张）+ Forever（居室「游荡」捡到）。坐标按原信纸 1080 × 1420，Forever 从第 758 行开始
  var FOREVER_GOT = function () { return CC.state.flag('forever'); };
  var MERGED = function () { return CC.state.choice('ev:merge') === 'merge'; };
  function forever() {
    return '<div class="kp kp--forever"><img src="assets/img/gate/forever.webp" alt="" draggable="false">' +
      '<b class="forever__ink">' + CC.esc(E.items.forever.ink) + '</b></div>';
  }
  function merged() {
    return '<div class="kmerge"><div class="kp kp--we">' + CC.gateLook.look('kraft') + '</div>' + forever() + '</div>';
  }

  function look(kind) {
    if (kind === 'kraft' && MERGED()) return merged();
    if (kind === 'forever') return forever();
    if (GATE.indexOf(kind) >= 0) return CC.gateLook.look(kind);
    switch (kind) {
      case 'candle': return candle();
      case 'anemone': return '<img src="' + IMG + 'anemone.webp" alt="" draggable="false">';
      case 'hymn': return hymn();
      case 'rules': return notebook();
      case 'missing': return '<img src="' + IMG + 'envelope-closed.webp" alt="" draggable="false">';
    }
    return '';
  }

  /* ---------------------------------------------------------------- 文案 */
  function caption(kind) {
    var it = E.items[kind] || {};
    var hi = CC.state.assim >= E.highAt;
    var html = '';
    var lb = GATE.indexOf(kind) >= 0 ? LABEL[kind] : it.label;
    if (lb) html += '<p class="ev-cap__label mono"><span>' + CC.esc(lb.en) + '</span> · ' + CC.esc(lb.zh) + '</p>';
    var text = it.text || (it.hi ? (hi ? it.hi : it.lo) : '');
    if (text) html += '<p class="ev-cap__text">' + CC.esc(text) + '</p>';
    if (it.textEn) html += '<p class="ev-cap__en">' + CC.esc(it.textEn) + '</p>';
    if (kind === 'card') html += '<p class="ev-cap__hint mono">' + CC.esc(C.gate.card.flipHint) + '</p>';
    return html;
  }
  // 牛皮纸两半共用一个选择（拼合）
  function keyOf(kind) { return kind === 'kraft' || kind === 'forever' ? 'ev:merge' : 'ev:' + kind; }
  function choicesOf(kind) {
    if (kind === 'missing') return C.missing.choices;
    if (kind === 'kraft' || kind === 'forever') return FOREVER_GOT() ? [{ id: 'merge', label: E.items.merge.label, assim: E.items.merge.assim }] : null;
    return (E.items[kind] || {}).choices || null;
  }
  function buttons(kind) {
    var list = choicesOf(kind);
    if (!list || CC.state.choice(keyOf(kind))) return '';
    var forced = kind === 'missing' && CC.state.assim >= C.missing.forceAt;
    return list.map(function (c) {
      var denied = forced && c.id !== 'forget';
      return '<button class="ev-btn' + (denied ? ' is-denied' : '') + '" data-choice="' + c.id + '"' + (denied ? ' aria-disabled="true"' : '') + '>' +
        CC.esc(c.label) + '</button>';
    }).join('');
  }

  /* ---------------------------------------------------------------- 蜡油融化（谱子的中文） */
  function meltDefs() {
    return '<svg class="melt-defs" width="0" height="0" aria-hidden="true"><filter id="hymnMelt" x="-5%" y="-10%" width="110%" height="140%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.008 0.11" numOctaves="2" seed="9" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter></svg>';
  }

  // 停留 ms 毫秒算"看了"：on()；移开：off()。手机上点一下切换
  function dwell(el, ms, on, off) {
    var t = 0, active = false;
    function enter(e) { if (e.pointerType === 'touch') return; clearTimeout(t); t = setTimeout(function () { active = true; on(); }, ms); }
    function leave(e) { if (e.pointerType === 'touch') return; clearTimeout(t); if (active) { active = false; off(); } }
    function tap(e) {
      if (e.pointerType !== 'touch') return;
      clearTimeout(t);
      active = !active;
      if (active) on(); else off();
    }
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerup', tap);
    return function () { clearTimeout(t); };
  }

  /* ---------------------------------------------------------------- 拿起来 */
  var current = null;

  function lift(kind, opts) {
    opts = opts || {};
    if (current && !opts.page) return null;
    var reduce = CC.reducedMotion();
    var page = opts.page || null;
    var src = opts.src || null;
    var cleanups = [];

    var layer = document.createElement('div');
    layer.className = 'lift lift--ev lift--' + kind + (page ? ' lift--page' : '');
    var inner;
    if (kind === 'card') {
      inner = '<div class="lift__card"><span class="fc__shadow"></span><div class="fc__rotor"><div class="fc__face fc__front">' + CC.gateLook.cardFront() +
        '<span class="fc__glare"></span></div><div class="fc__face fc__back">' + CC.gateLook.cardBack() + '<span class="fc__glare"></span></div></div></div>';
    } else if (kind === 'missing') {
      inner = '<div class="lift__tilt"><div class="mf"><img class="mf__env" src="' + IMG + 'envelope-open.webp" alt="" draggable="false">' +
        paper() + '<img class="mf__front" src="' + IMG + 'envelope-open.webp" alt="" draggable="false"></div></div>';
    } else {
      inner = '<div class="lift__tilt obj--' + kind + '">' + look(kind) + '<span class="fc__glare"></span></div>';
    }
    var hint = kind === 'missing' && CC.state.choice('ev:missing') !== 'forget' ? '<p class="ev-cap__hint mono">' + CC.esc(C.missing.hint) + '</p>' : '';
    layer.innerHTML =
      (page ? '' : '<div class="lift__back" data-put></div>') +
      '<figure class="lift__item"><div class="lift__sway">' + inner + '</div></figure>' +
      '<div class="ev-cap">' + caption(kind) + hint + '</div>' +
      '<div class="ev-acts"' + (kind === 'missing' ? ' hidden' : '') + '>' + buttons(kind) + '</div>' +
      (page ? '' : '<button class="lift__put mono" data-put>' + CC.esc(E.putBack) + '</button>') +
      (kind === 'hymn' ? meltDefs() : '');
    (page || document.body).appendChild(layer);

    var item = CC.$('.lift__item', layer);
    var tiltEl = CC.$('.lift__tilt', layer);
    var acts = CC.$('.ev-acts', layer);
    var fc = null;
    if (kind === 'card') fc = CC.flipCard(CC.$('.lift__card', layer), { tiltMax: 10 });

    // 从箱子里飞出来
    var dur = reduce ? 1 : 520;
    var rot = src ? (parseFloat(src.style.getPropertyValue('--rot')) || 0) : 0;
    if (kind === 'kraft' && MERGED()) layer.classList.add('lift--merged');
    function fromSrc() {
      var sr = src.getBoundingClientRect(), ir = item.getBoundingClientRect();
      var dx = (sr.left + sr.width / 2) - (ir.left + ir.width / 2), dy = (sr.top + sr.height / 2) - (ir.top + ir.height / 2);
      return 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(' + (src.offsetWidth / item.offsetWidth) + ')';
    }
    if (src) {
      var from = fromSrc();
      src.classList.add('is-lifted');
      item.animate([{ transform: from }, { transform: 'none' }], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });
      layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * 0.6, fill: 'both' });
    }

    // 伪 3D：跟着鼠标倾斜一点，带一层反光
    function tilt(e) {
      if (!tiltEl || e.pointerType === 'touch' || reduce) return;
      var r = item.getBoundingClientRect();
      var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      tiltEl.style.transform = 'perspective(1100px) rotateX(' + ((0.5 - py) * 14).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 14).toFixed(2) + 'deg)';
      tiltEl.style.setProperty('--fc-gx', (px * 100).toFixed(1) + '%');
      tiltEl.style.setProperty('--fc-gy', (py * 100).toFixed(1) + '%');
      tiltEl.style.setProperty('--fc-sheen', '1');
    }
    function untilt() { if (tiltEl) { tiltEl.style.transform = ''; tiltEl.style.setProperty('--fc-sheen', '0'); } }
    layer.addEventListener('pointermove', tilt);
    item.addEventListener('pointerleave', untilt);

    /* ---- 各物件自己的动静 ---- */
    var fx = item;
    if (kind === 'candle') {
      fx = CC.$('.cdl', layer);
      if (CC.state.choice('ev:candle') === 'light') fx.classList.add('is-lit');
    }
    if (kind === 'anemone') CC.state.once('ev:anemone', E.items.anemone.assim);
    if (kind === 'hymn') {
      var sheet = CC.$('.hymn', layer), disp = CC.$('#hymnMelt feDisplacementMap', layer), melt = 0, raf = 0, on = false, lastT = 0;
      if (CC.state.choice('ev:hymn') === 'sing') sheet.classList.add('is-sung');
      var paint = function () {
        var u = sheet.offsetWidth / 420;
        disp.setAttribute('scale', (melt * 16 * u).toFixed(2));
        CC.$('.hymn__zh', sheet).style.transform = 'translateY(' + (melt * 0.4).toFixed(3) + 'em) scaleY(' + (1 + melt * 0.14).toFixed(3) + ')';
      };
      var step = function (t) {
        raf = 0;
        var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 1 / 60;
        lastT = t;
        melt = on ? Math.min(1, melt + dt * (0.12 + 0.5 * melt)) : Math.max(0, melt - dt * 0.6);
        paint();
        if (on || melt > 0) raf = requestAnimationFrame(step); else lastT = 0;
      };
      cleanups.push(dwell(sheet, 1500, function () {
        on = true; sheet.classList.add('is-zh');
        if (!reduce && !raf) raf = requestAnimationFrame(step);
      }, function () {
        on = false; sheet.classList.remove('is-zh');                // 慢慢变回英文（CSS 里过渡 1.6 秒）
        if (!reduce && !raf) raf = requestAnimationFrame(step);
      }));
      cleanups.push(function () { cancelAnimationFrame(raf); });
      // 鼠标附近的英文字母变粗（可变邻近）
      var prox = CC.proximity(CC.$('.hymn__en', sheet), { radius: 80 });
      cleanups.push(function () { prox.destroy(); });
    }
    if (kind === 'rules') {
      var nb = CC.$('.nb', layer);
      cleanups.push(dwell(nb, 1500, function () { nb.classList.add('is-zh'); }, function () { nb.classList.remove('is-zh'); }));
    }
    if (kind === 'missing') {
      var mf = CC.$('.mf', layer);
      var gone = CC.state.choice('ev:missing') === 'forget';
      if (gone) mf.classList.add('is-forgotten');
      mf.addEventListener('click', function () {
        if (gone || mf.classList.contains('is-out')) return;
        mf.classList.add('is-pulling');
        setTimeout(function () {
          mf.classList.add('is-out');
          var h = CC.$('.ev-cap__hint', layer);
          if (h) h.remove();
          if (acts.innerHTML) acts.hidden = false;
        }, reduce ? 0 : 520);
      });
    }

    /* ---- 选项 ---- */
    acts.addEventListener('click', function (e) {
      var b = e.target.closest('[data-choice]');
      if (!b) return;
      if (b.classList.contains('is-denied')) {         // 同化值太高：不让浏览
        b.classList.remove('is-shake'); void b.offsetWidth; b.classList.add('is-shake');
        return;
      }
      var id = b.getAttribute('data-choice');
      var c = choicesOf(kind).filter(function (x) { return x.id === id; })[0];
      if (!CC.state.choose(keyOf(kind), id, { assim: c.assim, clarity: c.clarity })) return;
      acts.classList.add('is-gone');
      setTimeout(function () { acts.hidden = true; }, 400);
      if (kind === 'candle' && id === 'light') { fx.classList.add('is-lit'); CC.state.setFlag('candleLit', true); }
      if (kind === 'hymn' && id === 'sing') CC.$('.hymn', layer).classList.add('is-sung');
      if (kind === 'hymn' && id === 'fold') { CC.$('.hymn', layer).classList.add('is-folding'); later(put, 900); }
      if (kind === 'candle' && id === 'back') later(put, 500);
      if (id === 'merge') {
        // 手里这半张不动，另外半张从旁边飞过来对上撕口
        tiltEl.innerHTML = merged() + '<span class="fc__glare"></span>';
        layer.classList.add('lift--merged');
        CC.$(kind === 'kraft' ? '.kp--forever' : '.kp--we', tiltEl).classList.add('is-joining');
        // 箱子里：只剩一张拼好的
        var bf = document.querySelector('.bc-item--forever'), bk = document.querySelector('.bc-item--kraft');
        if (bk) CC.$('.bc-item__in', bk).innerHTML = merged();
        if (bf) {
          if (src === bf) { src = bk; rot = bk ? (parseFloat(bk.style.getPropertyValue('--rot')) || 0) : 0; if (bk) bk.classList.add('is-lifted'); }
          bf.remove();
        }
      }
      if (kind === 'missing' && id === 'forget') {
        var m = CC.$('.mf', layer);
        m.classList.remove('is-out'); m.classList.add('is-forgetting');
        later(function () { m.classList.add('is-forgotten'); if (!page) put(); }, 1100);
      }
    });
    function later(f, ms) { var t = setTimeout(f, reduce ? 0 : ms); cleanups.push(function () { clearTimeout(t); }); }

    /* ---- 放回 ---- */
    function onKey(e) { if (e.key === 'Escape') put(); }
    if (!page) {
      document.addEventListener('keydown', onKey);
      layer.addEventListener('click', function (e) { if (e.target.closest('[data-put]')) put(); });
    }
    var closed = false;
    function put() {
      if (closed || page) return;
      closed = true;
      current = null;
      document.removeEventListener('keydown', onKey);
      untilt();
      var to = src ? fromSrc() : 'scale(.9)';
      var a = item.animate([{ transform: 'none' }, { transform: to }], { duration: dur * 0.85, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.85, fill: 'forwards', easing: 'ease-in' });
      a.onfinish = function () {
        destroy();
        if (src) { src.classList.remove('is-lifted'); src.focus({ preventScroll: true }); }
        if (opts.onPut) opts.onPut();
      };
    }
    function destroy() {
      cleanups.forEach(function (f) { f(); });
      if (fc) fc.destroy();
      document.removeEventListener('keydown', onKey);
      layer.remove();
    }

    var handle = { layer: layer, put: put, destroy: destroy };
    if (!page) {
      current = handle;
      var focusTarget = kind === 'card' ? CC.$('.lift__card', layer) : CC.$('.lift__put', layer);
      focusTarget.focus({ preventScroll: true });
    }
    return handle;
  }

  CC.items = {
    look: look,
    // 箱子里要不要放这件（forever 捡到了、还没拼才放）
    has: function (kind) { return kind !== 'forever' || (FOREVER_GOT() && !MERGED()); },
    lift: lift,
    // 换页时把还开着的浮层收掉
    reset: function () { if (current) { current.destroy(); current = null; } },
  };
})();
