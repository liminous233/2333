/* 翻转卡：点击、拖动或轻甩翻面，弹簧回位，跟随指针的倾斜和反光。
 * 改写自 React Bits 的 FlipCard（MIT + Commons Clause, © David Haz），去掉了 React / motion 依赖。
 *
 *   var card = CC.flipCard(el, { width: 520, height: 328 });   // el 里要有 .fc__front 和 .fc__back
 *   card.flip(); card.destroy();
 */
(function () {
  var CC = window.CC;

  var TILT = { k: 240, c: 24, m: 0.6 };
  var LIFT = { k: 320, c: 26, m: 1 };
  var FLING = 0.16;
  var HISTORY_MS = 90;

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function snap(d) { return Math.round(d / 180) * 180; }
  function isBack(d) { return Math.abs(Math.round(d / 180)) % 2 === 1; }

  function Spring(v, cfg) { this.v = v; this.t = v; this.vel = 0; this.cfg = cfg; }
  Spring.prototype.step = function (dt) {
    var c = this.cfg, f = -c.k * (this.v - this.t) - c.c * this.vel;
    this.vel += (f / (c.m || 1)) * dt;
    this.v += this.vel * dt;
    if (Math.abs(this.v - this.t) < 0.02 && Math.abs(this.vel) < 0.05) { this.v = this.t; this.vel = 0; return false; }
    return true;
  };

  CC.flipCard = function (root, opts) {
    opts = opts || {};
    var reduce = CC.reducedMotion();
    var tiltMax = opts.tiltMax == null ? 12 : opts.tiltMax;
    var hoverScale = opts.hoverScale || 1.03;
    var persp = opts.perspective || 1100;
    var turnCfg = { k: opts.stiffness || 170, c: opts.damping || 20, m: 1 };

    root.classList.add('fc');
    root.setAttribute('role', 'button');
    root.setAttribute('tabindex', '0');
    root.setAttribute('aria-pressed', 'false');
    var rotor = root.querySelector('.fc__rotor');
    var shadow = root.querySelector('.fc__shadow');
    var front = root.querySelector('.fc__front');
    var back = root.querySelector('.fc__back');

    var turn = new Spring(0, turnCfg);
    var tx = new Spring(0, TILT), ty = new Spring(0, TILT);
    var lift = new Spring(1, LIFT), sheen = new Spring(0, LIFT);
    var gx = 50, gy = 50;
    var grip = null, raf = 0, last = 0, shown = false, dead = false;

    function paint() {
      var t = turn.v;
      rotor.style.transform = 'perspective(' + persp + 'px) scale(' + lift.v.toFixed(4) + ') rotateX(' +
        tx.v.toFixed(3) + 'deg) rotateY(' + (t + ty.v).toFixed(3) + 'deg)';
      rotor.style.setProperty('--fc-gx', gx + '%');
      rotor.style.setProperty('--fc-gy', gy + '%');
      rotor.style.setProperty('--fc-sheen', sheen.v.toFixed(3));
      var facing = Math.abs(Math.cos(t * Math.PI / 180));
      if (shadow) {
        shadow.style.transform = 'scaleX(' + (0.08 + 0.92 * facing).toFixed(3) + ')';
        shadow.style.opacity = (0.1 + 0.9 * facing * facing).toFixed(3);
      }
      var nowBack = isBack(t);
      front.style.visibility = nowBack ? 'hidden' : 'visible';
      back.style.visibility = nowBack ? 'visible' : 'hidden';
    }
    function frame(now) {
      raf = 0;
      if (dead) return;
      var dt = last ? Math.min(0.032, (now - last) / 1000) : 1 / 60;
      last = now;
      var moving = false;
      if (!grip || !grip.moved) moving = turn.step(dt) || moving;
      moving = tx.step(dt) || moving;
      moving = ty.step(dt) || moving;
      moving = lift.step(dt) || moving;
      moving = sheen.step(dt) || moving;
      paint();
      if (moving) wake(); else last = 0;
    }
    function wake() { if (!raf && !dead) raf = requestAnimationFrame(frame); }

    function settle(to, vel, instant) {
      turn.t = to;
      if (instant || reduce) { turn.v = to; turn.vel = 0; } else turn.vel = vel || 0;
      var next = isBack(to);
      if (next !== shown) {
        shown = next;
        root.setAttribute('aria-pressed', String(shown));
        if (opts.onFlip) opts.onFlip(shown);
      }
      wake();
    }
    function flip(instant) {
      var base = snap(turn.v);
      settle(isBack(base) ? base - 180 : base + 180, 0, instant);
    }
    function rest() { tx.t = 0; ty.t = 0; sheen.t = 0; lift.t = 1; wake(); }

    function down(e) {
      if (e.button !== 0 || grip) return;
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
      grip = { id: e.pointerId, x: e.clientX, base: turn.v, moved: false,
               slop: e.pointerType === 'touch' ? 8 : 4, hist: [] };
      turn.t = turn.v; turn.vel = 0;
      if (!reduce) lift.t = hoverScale;
      wake();
    }
    function move(e) {
      var g = grip;
      if (g && g.id === e.pointerId) {
        var d = e.clientX - g.x;
        if (!g.moved) {
          if (Math.abs(d) < g.slop || reduce) return;
          g.moved = true;
          root.setAttribute('data-dragging', '');
          tx.t = 0; ty.t = 0; sheen.t = 0;
        }
        var deg = g.base + (d / root.offsetWidth) * 180;
        turn.v = deg; turn.t = deg;
        var now = performance.now();
        g.hist.push({ t: now, v: deg });
        while (g.hist.length > 2 && now - g.hist[0].t > HISTORY_MS) g.hist.shift();
        wake();
        return;
      }
      if (reduce || e.pointerType === 'touch') return;
      var r = root.getBoundingClientRect();
      var px = clamp((e.clientX - r.left) / r.width, 0, 1);
      var py = clamp((e.clientY - r.top) / r.height, 0, 1);
      tx.t = (0.5 - py) * 2 * tiltMax;
      ty.t = (px - 0.5) * 2 * tiltMax;
      gx = (px * 100).toFixed(1); gy = (py * 100).toFixed(1);
      sheen.t = 1;
      lift.t = hoverScale;
      wake();
    }
    function up(e, cancelled) {
      var g = grip;
      if (!g || g.id !== e.pointerId) return;
      grip = null;
      root.removeAttribute('data-dragging');
      if (e.pointerType === 'touch' || !root.matches(':hover')) rest();
      if (!g.moved) {
        if (!cancelled) flip(false); else settle(turn.t, 0, false);
        return;
      }
      var here = turn.v, vel = 0;
      var a = g.hist[0], b = g.hist[g.hist.length - 1];
      if (!cancelled && a && b && b.t > a.t && performance.now() - b.t < 60) vel = (b.v - a.v) / (b.t - a.t) * 1000;
      var to = cancelled ? snap(g.base) : clamp(snap(here + vel * FLING), snap(here) - 180, snap(here) + 180);
      settle(to, vel, false);
    }
    function key(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (!e.repeat) flip(true);
    }
    function leave() { if (!grip) rest(); }
    function onUp(e) { up(e, false); }
    function onCancel(e) { up(e, true); }
    function noDrag(e) { e.preventDefault(); }

    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onCancel);
    root.addEventListener('lostpointercapture', onCancel);
    root.addEventListener('pointerleave', leave);
    root.addEventListener('keydown', key);
    root.addEventListener('dragstart', noDrag);
    paint();

    return {
      flip: function () { flip(false); },
      isBack: function () { return shown; },
      destroy: function () {
        dead = true;
        cancelAnimationFrame(raf);
        root.removeEventListener('pointerdown', down);
        root.removeEventListener('pointermove', move);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onCancel);
        root.removeEventListener('lostpointercapture', onCancel);
        root.removeEventListener('pointerleave', leave);
        root.removeEventListener('keydown', key);
        root.removeEventListener('dragstart', noDrag);
      },
    };
  };
})();
