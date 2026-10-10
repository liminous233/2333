/* 教堂（方案 5，docs/specs/5.教堂界面.pdf）
 *
 * 底图是白色的巴洛克教堂，上下各有一点电影式的黑边渐变。左上角 Welcome +「参加大颂礼」。
 *   ♢（DAY4 同化值 ≥ 50，从 Game over 进来，flag d4Diamond）：
 *     Welcome 和按钮消失 → 左上一行字；右边浮出双月神像（左缘像树根一样渗进底图）→ 左侧浮现「前往神国」，
 *     这个选项会慢慢融化流到页面底 → 点了去结局 1（#/ending 谢幕页）。
 *   非 ♢：红色天穹压下来 → 网页黑 0.4 秒 → 底图变红 → 底部字幕（中上英下）一句句，点或等都会下一句；
 *     「啊，新的主降临了。」时底图再叠化成更红的一张 → 最后「前往明天？」只能点 → 回首页（flag bliss，首页变样）。
 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;
  var IMG = 'assets/img/church/';

  CC.pages.church = function (root) {
    var H = C.church;
    var reduce = CC.reducedMotion();
    // 不管从月相页第五个月亮，还是从 DAY4 的「前往教堂」进来，都算看过第五个月亮（不然双月一直是「副本未完成」）
    CC.state.once('moon:5');
    var timers = [];
    function later(f, ms) { var t = setTimeout(f, reduce ? Math.min(ms, 300) : ms); timers.push(t); return t; }

    root.innerHTML =
      '<section class="ch">' +
        '<a class="back-arrow" href="#/journal" aria-label="返回">←</a>' +
        '<div class="ch__bg" aria-hidden="true">' +
          '<img class="ch__img is-on" data-k="white" src="' + IMG + 'church-white.webp" alt="">' +
          '<img class="ch__img" data-k="red1" src="' + IMG + 'church-red-1.webp" alt="">' +
          '<img class="ch__img" data-k="red2" src="' + IMG + 'church-red-2.webp" alt="">' +
        '</div>' +
        '<img class="ch__idol" src="' + IMG + 'idol.webp" alt="" aria-hidden="true">' +
        '<div class="ch__hello">' +
          '<p class="ch__welcome">' + CC.esc(H.welcome) + '</p>' +
          '<button class="ch-btn" id="chJoin">' + CC.esc(H.join) + '</button>' +
        '</div>' +
        '<p class="ch__holy" aria-live="polite"></p>' +
        '<div class="ch__sub" aria-live="polite"></div>' +
        '<div class="ch__sky" aria-hidden="true"></div>' +
        '<div class="ch__black" aria-hidden="true"></div>' +
        meltDefs() +
      '</section>';

    var sec = CC.$('.ch', root);
    function bg(k) { CC.$$('.ch__img', sec).forEach(function (i) { i.classList.toggle('is-on', i.getAttribute('data-k') === k); }); }

    CC.$('#chJoin', sec).addEventListener('click', function () {
      sec.classList.add('is-joined');
      if (CC.state.flag('d4Diamond')) holy(); else red();
    });

    /* ---- ♢：神国 ---- */
    function holy() {
      var t = CC.$('.ch__holy', sec);
      later(function () { t.textContent = H.holyText; t.classList.add('is-in'); }, 600);
      later(function () { sec.classList.add('is-idol'); }, 900);
      later(function () {
        var go = document.createElement('a');
        go.className = 'ch__go';
        go.href = '#/ending';
        go.innerHTML = '<span>' + CC.esc(H.holyGo) + '</span>';
        sec.appendChild(go);
        later(function () { go.classList.add('is-melting'); }, 2200);
      }, 3400);
    }

    /* ---- 非 ♢：红色天穹 ---- */
    var idx = -1, autoT = 0;
    function red() {
      sec.classList.add('is-sky');                 // 红色压下来
      later(function () {
        sec.classList.add('is-black');             // 黑 0.4 秒
        later(function () {
          bg('red1');
          sec.classList.add('is-red');
          sec.classList.remove('is-black');
          later(next, 1100);
        }, 400);
      }, 950);
      sec.addEventListener('click', function (e) {
        if (idx < 0 || idx >= H.lines.length || e.target.closest('a, button')) return;
        next();
      });
    }
    function next() {
      clearTimeout(autoT);
      idx++;
      var sub = CC.$('.ch__sub', sec);
      if (idx < H.lines.length) {
        var L = H.lines[idx];
        sub.innerHTML = '<p class="ch__line"><span class="ch__zh">' + CC.esc(L.zh) + '</span><span class="ch__en">' + CC.esc(L.en) + '</span></p>';
        if (L.recolor) bg('red2');
        autoT = later(next, H.auto);
        return;
      }
      // 最后一句：大一点，只能点
      sub.innerHTML = '<button class="ch__line ch__last"><span class="ch__zh">' + CC.esc(H.last.zh) + '</span><span class="ch__en">' + CC.esc(H.last.en) + '</span></button>';
      CC.$('.ch__last', sub).addEventListener('click', function () {
        CC.state.setFlag('bliss', true);
        sec.classList.add('is-black');
        later(function () { CC.go('home'); }, 700);
      });
    }

    CC.cleanup = function () { timers.forEach(clearTimeout); };
  };
  CC.pages.church.bare = true;

  // 「前往神国」往下流的融化滤镜
  function meltDefs() {
    return '<svg class="melt-defs" width="0" height="0" aria-hidden="true"><filter id="chMelt" x="-20%" y="-20%" width="140%" height="400%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.02 0.18" numOctaves="2" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter></svg>';
  }
})();
