/* 可变邻近：鼠标附近的字母变粗，离得越近越粗（思路参考 React Bits 的 VariableProximity，MIT + Commons Clause, © David Haz）。
 * 原版用可变字体的字重轴；谱子用的 Pinyon Script 不是可变字体，这里用描边宽度模拟字重，任何字体都能用。
 *
 *   var p = CC.proximity(el, { radius: 90 });
 *   p.destroy();
 */
(function () {
  var CC = window.CC;

  CC.proximity = function (el, opts) {
    opts = opts || {};
    var radius = opts.radius || 90;
    var reduce = CC.reducedMotion();
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    var letters = [];
    // 按词包一层（不让单词在中间折行），词里每个字母一层
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      var w = document.createElement('span');
      w.className = 'px__w';
      w.setAttribute('aria-hidden', 'true');
      Array.from(part).forEach(function (ch) {
        var c = document.createElement('span');
        c.className = 'px__c';
        c.textContent = ch;
        w.appendChild(c);
        letters.push({ el: c, p: 0 });
      });
      el.appendChild(w);
    });

    var mx = -1e4, my = -1e4, raf = 0, dead = false;
    function frame() {
      raf = 0;
      if (dead) return;
      var box = el.getBoundingClientRect();
      var far = mx < box.left - radius || mx > box.right + radius || my < box.top - radius || my > box.bottom + radius;
      letters.forEach(function (l) {
        var p = 0;
        if (!far) {
          var r = l.el.getBoundingClientRect();
          var d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
          p = Math.max(0, 1 - d / radius);            // 线性衰减
        }
        if (Math.abs(p - l.p) > 0.01) { l.p = p; l.el.style.setProperty('--p', p.toFixed(2)); }
      });
    }
    function move(e) {
      if (reduce || e.pointerType === 'touch') return;
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
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
