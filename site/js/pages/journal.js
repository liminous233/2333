/* 3. 八日日志（方案 3）
 *
 * 整页是森林里仰望的月相图（最左边的满月已改成双月），顶上一条黑边，正中一行扁长小字。
 * 月亮从右往左数 1–6：鼠标停 1 秒弹出对应的小卡，点小卡前往。
 * 第六个（双月）分结局：前五个没全点过，只会晃出一行斜体小字"副本未完成"。
 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;

  CC.pages.journal = function (root) {
    var J = Object.assign({}, C.journal, { moons: C.journal.moons.map(function (m) {
      var position = m.n === 3 ? C.journal.moons[3] : m.n === 4 ? C.journal.moons[2] : m;
      return Object.assign({}, m, { x: position.x, y: position.y });
    }) });
    var reduce = CC.reducedMotion();
    var coarse = window.matchMedia('(pointer: coarse)').matches;

    var spots = J.moons.map(function (m) {
      return '<button class="sky__moon' + (m.twin ? ' sky__moon--twin' : '') + (CC.state.seen('moon:' + m.n) ? ' is-seen' : '') +
        '" data-n="' + m.n + '" style="left:' + m.x + '%;top:' + m.y + '%" aria-label="' + CC.esc(label(m)) + '">' +
        '<svg class="sky__ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" pathLength="100"/></svg></button>';
    }).join('');

    root.innerHTML =
      '<section class="sky">' +
        '<header class="sky__band"><a class="back-arrow" href="#/home" aria-label="返回目录">←</a>' +
          '<p class="sky__title">' + CC.esc(J.title) + '</p></header>' +
        '<div class="sky__frame">' +
          '<div class="sky__stage">' +
            '<img class="sky__img" src="assets/img/journal/moons.webp" alt="" draggable="false">' +
            spots +
          '</div>' +
        '</div>' +
      '</section>';

    var stage = CC.$('.sky__stage', root);
    var pop = null, timer = 0, armed = null;

    function done() {
      if (CC.story.route() === 'EARLY_MOON' || CC.state.flag('v02:peaceLock')) return true;
      if (CC.story.route() === 'RECONNECT' && !CC.story.infinity()) return false;
      for (var i = 1; i <= 5; i++) if (!CC.state.seen('moon:' + i)) return false;
      return true;
    }
    function ending() {
      if (CC.story.peaceVariant()) return Object.assign({}, J.endings.peace, { sub: C.v02.peaceV.name });
      return (CC.story.route() ? CC.story.peace() : CC.state.assim >= J.endingAt) ? J.endings.peace : J.endings.bliss;
    }
    function label(m) {
      if (!m.twin) return m.label;
      var e = ending();
      return e.label + '（' + e.sub + '）';
    }

    function close() {
      clearTimeout(timer);
      if (armed) armed.classList.remove('is-arming');
      armed = null;
      if (pop) {
        var old = pop;
        pop = null;
        old.classList.add('is-leaving');
        setTimeout(function () { old.remove(); }, reduce ? 0 : 260);
      }
      CC.$$('.sky__moon.is-open', stage).forEach(function (b) { b.classList.remove('is-open'); });
    }

    function open(btn) {
      var m = J.moons[+btn.getAttribute('data-n') - 1];
      close();
      btn.classList.add('is-open');
      pop = document.createElement('div');
      pop.style.left = m.x + '%';
      pop.style.top = m.y + '%';
      if (m.route==='church' && !CC.story.churchOpen()) {
        pop.className='sky__nope';pop.setAttribute('role','status');pop.textContent=J.churchClosed;
      } else if (m.twin && !done()) {
        pop.className = 'sky__nope';
        pop.innerHTML = '<em>' + CC.esc(J.unfinished) + '</em>';
      } else {
        var text = m.twin
          ? CC.esc(ending().label) + '<small>' + CC.esc(ending().sub) + '</small>'
          : CC.esc(m.label);
        pop.className = 'sky__pop';
        // 双月：永归宁国 → 结局 1 谢幕；异神极乐 → 教堂（红色天穹那条线）
        var route = m.twin ? (CC.story.peace() ? 'ending' : 'church') : m.route;
        pop.innerHTML = '<a href="#/' + route + '" data-n="' + m.n + '">' + text + '</a>';
      }
      stage.appendChild(pop);
    }

    // 停留 1 秒才弹出；圆圈慢慢画满表示"正在等"
    function arm(btn) {
      if (btn.classList.contains('is-open')) return;
      clearTimeout(timer);
      if (armed) armed.classList.remove('is-arming');
      armed = btn;
      btn.classList.add('is-arming');
      timer = setTimeout(function () { btn.classList.remove('is-arming'); open(btn); }, reduce ? 0 : J.hold);
    }
    function disarm(btn) {
      if (armed !== btn) return;
      clearTimeout(timer);
      btn.classList.remove('is-arming');
      armed = null;
    }

    CC.$$('.sky__moon', stage).forEach(function (b) {
      b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') arm(b); });
      b.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') disarm(b); });
      // 手机没有"停留"：点一下直接弹出；键盘回车也一样
      b.addEventListener('click', function () { if (b.classList.contains('is-open')) close(); else open(b); });
    });

    stage.addEventListener('click', function (e) {
      var a = e.target.closest('.sky__pop a');
      if (a) CC.state.once('moon:' + a.getAttribute('data-n'));
    });
    function onDoc(e) {
      if (!pop) return;
      if (pop.contains(e.target) || e.target.closest('.sky__moon')) return;
      close();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('pointerdown', onDoc);
    document.addEventListener('keydown', onKey);
    if (coarse) stage.classList.add('is-touch');
    if(CC.churchClosed){CC.churchClosed=false;open(CC.$('.sky__moon[data-n="5"]',stage));}

    CC.cleanup = function () {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  };
  CC.pages.journal.bare = true;

  // 还没写的页：先放一页空白（D4 在 js/pages/d4.js，教堂 church.js，结局 1 谢幕 ending.js）
  CC.pages.soon = soon;
  function soon(root) {
    root.innerHTML = '<section class="soon"><a class="back-arrow" href="#/journal" aria-label="返回">←</a>' +
      '<p>' + CC.esc(C.journal.soon) + '</p></section>';
  }
  soon.bare = true;
})();
