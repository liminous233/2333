/* 香烟粒子：同化越高越浓 */
(function () {
  var CC = window.CC;
  var cv = document.getElementById('smoke');
  var g = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1, parts = [], target = 0, raf = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(fresh) {
    return {
      x: Math.random() * W,
      y: fresh ? Math.random() * H : H + 40 + Math.random() * 80,
      r: 40 + Math.random() * 90,
      vy: 0.15 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.15,
      ph: Math.random() * Math.PI * 2,
      a: 0.025 + Math.random() * 0.04,
    };
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    while (parts.length < target) parts.push(spawn(parts.length < target / 2));
    if (parts.length > target) parts.length = target;
    g.clearRect(0, 0, W, H);
    var light = CC.state.stage >= 2;
    var col = light ? '120,132,150' : '220,226,234';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.ph += 0.004;
      p.y -= p.vy;
      p.x += p.vx + Math.sin(p.ph) * 0.25;
      p.r += 0.05;
      if (p.y < -p.r) parts[i] = spawn(false);
      var fade = Math.min(1, (H - p.y) / 200) * Math.min(1, p.y / 300 + 0.2);
      var grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grd.addColorStop(0, 'rgba(' + col + ',' + (p.a * fade).toFixed(3) + ')');
      grd.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    }
  }

  function update() {
    var s = CC.state.stage;
    target = [8, 16, 30, 44][s];
    if (CC.state.flag('candleLit')) target += 8;
  }

  if (CC.reducedMotion()) return;
  size();
  update();
  window.addEventListener('resize', size);
  document.addEventListener('cc:change', update);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(tick);
  });
  raf = requestAnimationFrame(tick);
})();
