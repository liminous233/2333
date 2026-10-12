/* Scoped visual additions: downward ink, hymn grain, and the black-sun arc. */
(function () {
  var CC = window.CC;
  function downflow(root) {
    if (CC.reducedMotion()) return function () {};
    var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    canvas.className = 'v02-downflow'; canvas.setAttribute('aria-hidden', 'true');
    var drops = [], active = null, x = 0, y = 0, raf = 0, last = 0, emit = 0, w, h;
    function resize() { w = innerWidth; h = innerHeight; canvas.width = w; canvas.height = h; drops = []; }
    function move(e) {
      var bubble = e.target.closest('.bub--wei, .map-chat--blue');
      if (!bubble || !root.contains(bubble)) { active = null; return; }
      active = bubble; x = e.clientX; y = Math.max(e.clientY, bubble.getBoundingClientRect().bottom - 5);
      if (!canvas.isConnected) document.body.appendChild(canvas);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    function leave() { active = null; }
    function frame(t) {
      var dt = Math.min((t - last) / 1000, .04); last = t;
      ctx.clearRect(0, 0, w, h);
      if (active && (!active.isConnected || document.hidden)) active = null;
      if (active && t - emit > 85) {
        emit = t;
        drops.push({ x: x + (Math.random() - .5) * 12, y: y, age: 0, speed: 105 + Math.random() * 60, width: 5 + Math.random() * 12, phase: Math.random() * 6.28 });
      }
      drops = drops.filter(function (d) { return d.age < 4.2 && d.y < h + 180; });
      drops.forEach(function (d) {
        d.age += dt;
        // Positive gravity only. Local curls stay within 18px of the source x.
        var head = d.y + d.speed * d.age + 19 * d.age * d.age;
        var length = Math.min(head - d.y, 85 + d.age * 38);
        var top = Math.max(d.y, head - length), points = [], n = 14;
        for (var i = 0; i <= n; i++) {
          var k = i / n, yy = top + length * k;
          points.push({ x: d.x + Math.sin(yy * .025 + d.phase + d.age) * (7 + 8 * k), y: yy, r: d.width * Math.sin(Math.PI * k) * (.4 + .6 * k) });
        }
        var edge = points.map(function (p) { return { x:p.x - p.r, y:p.y }; }).concat(points.slice().reverse().map(function (p) { return { x:p.x + p.r, y:p.y }; }));
        ctx.beginPath(); ctx.moveTo(edge[0].x, edge[0].y);
        edge.forEach(function (p, i) { var next = edge[(i + 1) % edge.length]; ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2); });
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,47,167,' + (.19 * Math.min(1, d.age * 5) * Math.max(0, 1 - d.age / 4.2)) + ')';
        ctx.filter = 'blur(2px)'; ctx.shadowColor = 'rgba(0,47,167,.28)'; ctx.shadowBlur = 9; ctx.fill();
      });
      if (active || drops.length) raf = requestAnimationFrame(frame);
      else { raf = 0; canvas.remove(); }
    }
    resize(); root.addEventListener('pointermove', move); root.addEventListener('pointerover', move);
    root.addEventListener('pointerleave', leave); root.addEventListener('pointerup', function up(e) { if (e.pointerType === 'touch') leave(); });
    window.addEventListener('scroll', leave, true); window.addEventListener('resize', resize);
    return function () { cancelAnimationFrame(raf); canvas.remove(); root.removeEventListener('pointermove', move); root.removeEventListener('pointerover', move); root.removeEventListener('pointerleave', leave); window.removeEventListener('scroll', leave, true); window.removeEventListener('resize', resize); drops = []; };
  }
  function noise(root) {
    var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    canvas.className = 'v02-hymn-noise'; canvas.setAttribute('aria-hidden', 'true'); root.appendChild(canvas);
    var tile = document.createElement('canvas'); tile.width = tile.height = 192;
    var tc = tile.getContext('2d'), pixels = tc.createImageData(192, 192), raf = 0, last = -100;
    function size() { canvas.width = root.clientWidth; canvas.height = root.clientHeight; }
    function draw(t) {
      if (t - last > 50 && !document.hidden) {
        last = t;
        for (var i = 0; i < pixels.data.length; i += 4) { var c = Math.random() * 255; pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = c; pixels.data[i + 3] = 255; }
        tc.putImageData(pixels, 0, 0); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (!CC.reducedMotion()) raf = requestAnimationFrame(draw);
    }
    size(); draw(0); window.addEventListener('resize', size);
    return function () { cancelAnimationFrame(raf); window.removeEventListener('resize', size); canvas.remove(); };
  }
  function sunArc(root) {
    var area = root.querySelector('.cover__right'), img = root.querySelector('.bsun img'), tabs = Array.from(root.querySelectorAll('.tab'));
    function place() {
      if (!img.naturalWidth) return;
      var w = area.clientWidth, h = area.clientHeight, scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      var iw = img.naturalWidth * scale, ih = img.naturalHeight * scale;
      var cx = w / 2, cy = ih / 2 + (h - ih) * .52, radius = iw * .17;
      tabs.forEach(function (tab, i) {
        var head = tab.querySelector('.tab__head'), tw = head.offsetWidth, th = head.offsetHeight;
        var a = [-68, -23, 23, 68][i] * Math.PI / 180;
        var r = radius + tw / 2 + 16;
        tab.style.left = Math.max(12, Math.min(w - tw - 12, cx + Math.cos(a) * r - tw / 2)) + 'px';
        tab.style.top = Math.max(20, Math.min(h - th - 90, cy + Math.sin(a) * r - th / 2)) + 'px';
      });
    }
    var observer = new ResizeObserver(place); observer.observe(area); img.addEventListener('load', place); place();
    return function () { observer.disconnect(); img.removeEventListener('load', place); };
  }
  CC.storyEffects = { downflow: downflow, noise: noise, sunArc: sunArc };
})();
