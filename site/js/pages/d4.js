/* DAY4 日志（方案 4，docs/specs/4.日志页面.pdf）
 *
 * 一、黑底：莫比乌斯环月亮在正中，随鼠标左右轻轻晃；蓝色十字架只露出底端尖端，悬在中心圆月上方。
 *     点中心圆月 → 十字架用力往下扎 → 像素交换（React Bits 的 Pixel Swap 参数：随机、40px、隙 5px、
 *     起始缩放 0.3、旋转 35°、总时长 1400ms、单格 450ms、淡出）转成白底。
 * 二、白底：纸页 + 纸后的低饱和十字架 + 最底下一层 Observation Log（黑字蓝色硬边阴影）。
 *     同化值 ≥ 50：纸上长满银莲花，最上方 Game over. → 点了故障（黑白，不要彩色）变成「前往教堂」。
 *     同化值 < 50：维西娅的手写报告，停 1.5 秒变中文 →「本次述职结束」→ 右边黑气泡（莱恩）、
 *     左边克莱因蓝气泡（维西娅），点一条出下一条 → 3 秒后「回望穹顶」/「前往教堂」。
 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;
  var IMG = 'assets/img/d4/';
  var CORE = { x: 49.93, y: 52.24, r: 3.69 };      // 中心圆月在月亮图上的位置（百分比，r 按宽度）

  /* ---------------------------------------------------------------- 像素交换 */
  function pixelSwap(color, onCovered, onDone) {
    var reduce = CC.reducedMotion();
    if (reduce) { onCovered(); onDone(); return function () {}; }
    var SIZE = 40, GAP = 5, TOTAL = 1400, EACH = 450, SPIN = 35, FROM = 0.3, FADE = 320;
    var cv = document.createElement('canvas');
    cv.className = 'pxswap';
    document.body.appendChild(cv);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    var step = SIZE + GAP, cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1, cells = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      cells.push({ x: c * step + SIZE / 2 - GAP, y: r * step + SIZE / 2 - GAP, t: Math.random() * (TOTAL - EACH) });
    }
    var t0 = performance.now(), raf = 0, covered = false, dead = false;
    function ease(k) { return 1 - Math.pow(1 - k, 3); }
    function frame(now) {
      if (dead) return;
      var t = now - t0;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      if (t < TOTAL) {
        cells.forEach(function (p) {
          var k = Math.min(1, Math.max(0, (t - p.t) / EACH));
          if (k <= 0) return;
          var e = ease(k), s = (FROM + (1 - FROM) * e) * (SIZE + GAP + 1);
          ctx.save();
          ctx.globalAlpha = e;
          ctx.translate(p.x, p.y);
          ctx.rotate((1 - e) * SPIN * Math.PI / 180);
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.restore();
        });
        raf = requestAnimationFrame(frame);
        return;
      }
      if (!covered) { covered = true; onCovered(); }
      var f = Math.min(1, (t - TOTAL) / FADE);
      ctx.globalAlpha = 1 - f;
      ctx.fillRect(0, 0, W, H);
      if (f < 1) { raf = requestAnimationFrame(frame); return; }
      cv.remove();
      onDone();
    }
    raf = requestAnimationFrame(frame);
    return function () { dead = true; cancelAnimationFrame(raf); cv.remove(); };
  }

  /* ---------------------------------------------------------------- 纸上的东西 */
  function reportHtml(R, lang) {
    return '<div class="d4-ink d4-ink--' + lang + '"' + (lang === 'zh' ? ' aria-hidden="true"' : '') + '>' +
      '<p class="d4-ink__date">' + CC.esc(R.date) + '</p>' +
      '<p class="d4-ink__head">' + R.head.map(CC.esc).join('<br>') + '</p>' +
      '<p class="d4-ink__to">' + CC.esc(R.to) + '</p>' +
      '<p class="d4-ink__body">' + CC.esc(R.body) + '</p>' +
      '<p class="d4-ink__close">' + CC.esc(R.close) + '</p>' +
      '<p class="d4-ink__sign">' + CC.esc(R.sign) + '</p>' +
      '<p class="d4-ink__code">' + CC.esc(R.code) + '</p>' +
      '</div>';
  }
  // 长满纸的银莲花：先叶子后花，从下往上长；最上面留给 Game over.
  function bloomHtml() {
    var rand = CC.rng(404), out = [];
    var leaves = 12, flowers = 22;
    for (var i = 0; i < leaves + flowers; i++) {
      var leaf = i < leaves;
      var x = -22 + rand() * 112, y = 18 + Math.pow(rand(), 0.8) * 92;
      var w = leaf ? 30 + rand() * 18 : 24 + rand() * 24;
      var src = leaf ? 'leaf-' + (1 + Math.floor(rand() * 2)) : 'fl-0' + (1 + Math.floor(rand() * 4));
      var rot = leaf ? -70 + rand() * 140 : -30 + rand() * 60;
      out.push({ y: y, html: '<img class="bloom__p' + (leaf ? ' is-leaf' : '') + '" src="' + IMG + src + '.webp" alt="" draggable="false" style="left:' +
        x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;width:' + w.toFixed(1) + '%;--r:' + rot.toFixed(0) + 'deg;animation-delay:' +
        (0.25 + (110 - y) / 110 * 1.4 + rand() * 0.6 + (leaf ? 0 : 0.35)).toFixed(2) + 's">' });
    }
    // 下面的先画（被上面的压住）
    return '<div class="bloom" aria-hidden="true">' + out.map(function (o) { return o.html; }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------- 页面 */
  CC.pages.d4 = function (root) {
    var D = C.d4;
    var reduce = CC.reducedMotion();
    var timers = [], cleanups = [];
    function later(f, ms) { var t = setTimeout(f, reduce ? Math.min(ms, 200) : ms); timers.push(t); return t; }

    root.innerHTML =
      '<section class="d4" data-phase="moon">' +
        '<a class="back-arrow" href="#/journal" aria-label="返回">←</a>' +
        '<div class="d4-moon">' +
          '<div class="d4-stage">' +
            '<div class="d4-sway"><img class="d4-moons" src="' + IMG + 'moons.webp" alt="" draggable="false"></div>' +
            '<div class="d4-cross" aria-hidden="true"><img src="' + IMG + 'cross.webp" alt="" draggable="false"></div>' +
            '<button class="d4-core" style="left:' + CORE.x + '%;top:' + CORE.y + '%;width:' + (CORE.r * 2.3) + '%" aria-label="中心的圆月"></button>' +
          '</div>' +
        '</div>' +
      '</section>';

    var sec = CC.$('.d4', root);
    var stage = CC.$('.d4-stage', sec);
    var sway = CC.$('.d4-sway', sec);
    var cross = CC.$('.d4-cross', sec);

    // 月亮随鼠标左右晃一点点
    function onMove(e) {
      if (reduce || e.pointerType === 'touch' || sec.getAttribute('data-phase') !== 'moon') return;
      var k = e.clientX / window.innerWidth - 0.5;
      sway.style.transform = 'translateX(' + (k * 16).toFixed(1) + 'px) rotate(' + (k * 1.6).toFixed(2) + 'deg)';
    }
    document.addEventListener('pointermove', onMove);
    cleanups.push(function () { document.removeEventListener('pointermove', onMove); });

    // 点中心圆月：十字架先往上提一点，再用力扎下去
    var stabbed = false;
    CC.$('.d4-core', sec).addEventListener('click', function () {
      if (stabbed) return;
      stabbed = true;
      sec.classList.add('is-stabbing');
      var sh = stage.offsetHeight;
      var dist = (CORE.y - 38) / 100 * sh;                 // 尖端（38%）到圆月中心
      var a = cross.animate([
        // 保留 CSS 里的 translateX(-50%)，不然十字架会往右偏半个身位
        { transform: 'translate(-50%, 0)' },
        { transform: 'translate(-50%, ' + (-0.06 * sh) + 'px)', offset: 0.55, easing: 'cubic-bezier(.5,0,.75,0)' },
        { transform: 'translate(-50%, ' + dist + 'px)' },
      ], { duration: reduce ? 1 : 640, fill: 'forwards' });
      a.onfinish = function () {
        sec.classList.add('is-hit');
        later(function () {
          var stop = pixelSwap('#ffffff', showLog, function () {});
          cleanups.push(stop);
        }, 380);
      };
    });

    /* ---- 转成白底 ---- */
    function showLog() {
      var bloom = CC.story.lockReport() === 'EARLY_MOON';
      document.body.classList.add('is-white');
      sec.setAttribute('data-phase', 'log');
      sec.innerHTML =
        '<a class="back-arrow" href="#/journal" aria-label="返回">←</a>' +
        '<div class="d4-log' + (bloom ? ' is-bloom' : '') + '">' +
          '<div class="d4-wrap">' +
            '<h2 class="d4-title"><span>Observation</span><span>Log</span></h2>' +
            '<img class="d4-pale" src="' + IMG + 'cross-pale.webp" alt="" draggable="false">' +
            '<div class="d4-sheet">' +
              '<img class="d4-sheet__paper" src="' + IMG + 'paper.webp" alt="" draggable="false">' +
              (bloom
                ? bloomHtml() + '<button class="d4-over">' + CC.esc(D.gameOver) + '</button>'
                : reportHtml(D.report.en, 'en') + reportHtml(D.report.zh, 'zh')) +
            '</div>' +
            '<div class="d4-chat"></div>' +
            '<div class="d4-acts" hidden></div>' +
          '</div>' +
        '</div>';
      if (bloom) { var back = CC.$('.back-arrow', sec); if (back) back.remove(); setupBloom(); } else setupReport();
    }

    /* ---- ≥ 50：Game over. → 故障 → 前往教堂 ---- */
    function setupBloom() {
      var b = CC.$('.d4-over', sec);
      var step = 0;
      b.addEventListener('click', function () {
        if (step === 0) {
          step = 1;
          b.classList.add('is-glitch');
          later(function () {
            b.textContent = D.toChurch;
            b.classList.add('is-church');
            later(function () { b.classList.remove('is-glitch'); step = 2; }, 260);
          }, 620);
        } else if (step === 2) {
          CC.state.setFlag('d4Diamond', true);         // ♢：方案 5 要用
          CC.go('church');
        }
      });
    }

    /* ---- < 50：报告 → 中文 → 述职结束 → 聊天 → 选项 ---- */
    function setupReport() {
      var sheet = CC.$('.d4-sheet', sec);
      var t = 0, popped = false;
      function zh(on) { sheet.classList.toggle('is-zh', on); if (on && !popped) later(pop, 2600); }
      sheet.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; clearTimeout(t); t = later(function () { zh(true); }, 1500); });
      sheet.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; clearTimeout(t); zh(false); });
      sheet.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') zh(!sheet.classList.contains('is-zh')); });
      later(pop, 22000);                                   // 一直不停留也会弹出来

      // 述职结束：报告淡出，纸上换成「您的朋友正在试图联系您…」（停留 1.5 秒变中文，沿用上面的悬停逻辑）
      function ping() {
        var old = CC.$$('.d4-ink', sheet);
        old.forEach(function (el) { el.classList.add('is-gone'); });
        later(function () {
          old.forEach(function (el) { el.remove(); });
          sheet.classList.remove('is-zh');
          sheet.insertAdjacentHTML('beforeend',
            '<div class="d4-ink d4-ink--ping d4-ink--en"><p>' + CC.esc(D.ping.en) + '</p></div>' +
            '<div class="d4-ink d4-ink--ping d4-ink--zh" aria-hidden="true"><p>' + CC.esc(D.ping.zh) + '</p></div>');
        }, 700);
      }

      function pop() {
        if (popped) return;
        popped = true;
        var d = document.createElement('button');
        d.className = 'd4-done';
        d.textContent = D.done;
        CC.$('.d4-wrap', sec).appendChild(d);
        d.addEventListener('click', function () {
          d.classList.add('is-leaving');
          CC.state.setFlag('d4Report', true);          // 述职分支走完：地图钟楼的档案室能进了（DAY 5）
          ping();
          later(function () { d.remove(); say(0); }, 280);
        });
      }
    }
    function say(i) {
      var messages = CC.story.route() === 'ANOMALY' ? C.v02.anomaly.chat : D.chat;
      var m = messages[i];
      var chat = CC.$('.d4-chat', sec);
      var b = document.createElement('button');
      b.className = 'bub bub--' + m.who;
      b.style.setProperty('--i', i);
      b.innerHTML = '<span class="v02-chat-text">' + CC.esc(m.text) + '</span><svg class="bub__tail" viewBox="0 0 18 18" aria-hidden="true"><path d="M0 0C0 9 6 15 18 18C9 18.6 3 16.6 0 13.5Z"/></svg>';
      chat.appendChild(b);
      if (m.scramble) { var effect = CC.scramble(CC.$('.v02-chat-text', b), m.text); cleanups.push(function () { effect.destroy(); }); }
      if (m.liquid) { b.classList.add('v02-liquid'); b.setAttribute('aria-label', m.text || '…'); b.insertAdjacentHTML('beforeend', '<i class="v02-ink-trails" aria-hidden="true"></i>'); }
      if (i === messages.length - 1) { later(options, 3000); return; }
      b.addEventListener('click', function once() {
        b.removeEventListener('click', once);
        b.classList.add('is-read');
        say(i + 1);
      });
    }
    function options() {
      var a = CC.$('.d4-acts', sec);
      if (CC.story.route() === 'ANOMALY') {
        a.innerHTML = C.v02.anomaly.options.map(function (o) { return '<button class="ev-btn" data-route-choice="' + o[0] + '">' + CC.esc(o[1]) + '</button>'; }).join('');
        a.hidden = false;
        a.addEventListener('click', function (e) {
          var b = e.target.closest('[data-route-choice]'); if (!b) return;
          CC.story.decision(b.getAttribute('data-route-choice'));
          var selected = CC.state.choice('v02:d4');
          CC.go(selected === 'reconnect' ? 'gate' : selected === 'church' ? 'church' : 'journal');
        }); return;
      }
      a.innerHTML = '<a class="ev-btn" href="#/journal">' + CC.esc(D.back) + '</a><a class="ev-btn d4-to-church" href="#/church">' + CC.esc(D.toChurch) + '</a>';
      a.hidden = false;
      // 还没看过 DAY 5：提示保留 6 秒，停在提示上可继续阅读或点去地图。
      if (CC.state.seen('day:5')) return;
      var go = CC.$('.d4-to-church', a), tip = null, hideT = 0;
      function show() {
        clearTimeout(hideT);
        if (!tip) {
          tip = document.createElement('a');
          tip.className = 'd4-hint';
          tip.href = '#/map';
          tip.textContent = D.mapHint;
          a.appendChild(tip);
          tip.addEventListener('pointerenter', pause);
          tip.addEventListener('focus', pause);
          tip.addEventListener('pointerleave', scheduleHide);
          tip.addEventListener('blur', scheduleHide);
        }
        tip.classList.add('is-on');
        tip.tabIndex = 0;
        tip.removeAttribute('aria-hidden');
        scheduleHide();
      }
      function pause() { clearTimeout(hideT); }
      function scheduleHide() {
        pause();
        if (tip && tip.matches(':hover, :focus')) return;
        // 阅读时间不随 reduced-motion 缩短。
        hideT = setTimeout(hide, 6000);
        timers.push(hideT);
      }
      function hide() {
        pause();
        if (tip) {
          tip.classList.remove('is-on');
          tip.tabIndex = -1;
          tip.setAttribute('aria-hidden', 'true');
        }
      }
      go.addEventListener('pointerenter', show);
      go.addEventListener('focus', show);
    }

    CC.cleanup = function () {
      timers.forEach(clearTimeout);
      cleanups.forEach(function (f) { f(); });
      document.body.classList.remove('is-white');
    };
  };
  CC.pages.d4.bare = true;
})();
