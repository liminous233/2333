/* 打乱文字：出现时从乱码逐字落定；鼠标经过附近的字会被重新打乱，再慢慢变回来。
 * 思路参考 React Bits 的 ScrambledText（MIT + Commons Clause, © David Haz），不依赖 GSAP。
 *
 *   var s = CC.scramble(el, '天地间的纯白，我们的安宁。');
 *   s.destroy();
 */
(function () {
  var CC = window.CC;
  var SYMBOLS = '·:/*#+=~░▒';

  CC.scramble = function (el, text, opts) {
    opts = opts || {};
    var reduce = CC.reducedMotion();
    var radius = opts.radius || 70;
    var pool = (text.replace(/[\s，。、！？…]/g, '') + SYMBOLS).split('');
    var chars = Array.from(text);
    el.textContent = '';
    el.setAttribute('aria-label', text);
    var spans = chars.map(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'scr__c';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      if (opts.decorate) opts.decorate(s, i);
      el.appendChild(s);
      return { el: s, ch: ch, until: 0, blank: /\s/.test(ch) };
    });
    var raf = 0, dead = false;

    function rnd() { return pool[(Math.random() * pool.length) | 0]; }
    function frame(now) {
      raf = 0;
      if (dead) return;
      var busy = false;
      spans.forEach(function (c) {
        if (c.blank) return;
        if (now < c.until) {
          busy = true;
          if (Math.random() < 0.5) c.el.textContent = rnd();
          c.el.classList.add('is-scr');
        } else {
          if (c.el.textContent !== c.ch) c.el.textContent = c.ch;
          c.el.classList.remove('is-scr');
        }
      });
      if (busy) raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && !dead) raf = requestAnimationFrame(frame); }

    // 出现：从左到右依次落定
    if (!reduce) {
      var t0 = performance.now() + (opts.delay || 0);
      spans.forEach(function (c, i) { c.until = t0 + 260 + i * (opts.step || 70) + Math.random() * 120; });
      wake();
    }

    function move(e) {
      if (reduce || e.pointerType === 'touch') return;
      var now = performance.now();
      spans.forEach(function (c) {
        if (c.blank) return;
        var r = c.el.getBoundingClientRect();
        var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (d < radius) c.until = Math.max(c.until, now + 300 + (1 - d / radius) * 700);
      });
      wake();
    }
    document.addEventListener('pointermove', move);

    return {
      destroy: function () {
        dead = true;
        cancelAnimationFrame(raf);
        document.removeEventListener('pointermove', move);
      },
    };
  };
})();
