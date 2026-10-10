/* 揉纸团：按住纸张揉成一团，拖着走；松手留在原地；再点一下展开（展开后是另一面的内容）。
 * 物理和渲染改写自 React Bits 的 PaperCrumple（MIT + Commons Clause, © David Haz），
 * 去掉 React；three.js 只在第一次需要时从 jsDelivr 动态加载。
 *
 *   var c = CC.crumple({ host, sheet, draw(ctx, w, h, side), onState(state, side) });
 *   c.prepare();          // 预加载
 *   c.grab(pointerEvent); // 在纸上按下时调用
 *   c.destroy();
 */
(function () {
  var CC = window.CC;
  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';
  var threeP = null;
  function loadThree() {
    if (!threeP) threeP = import(THREE_URL);
    return threeP;
  }

  function spring(v) { v = v || 0; return { value: v, target: v, velocity: 0 }; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function advance(s, dt, duration, instant) {
    if (instant || duration <= 0) { s.value = s.target; s.velocity = 0; return false; }
    var omega = 8 / Math.max(0.06, duration);
    var offset = s.value - s.target;
    var term = s.velocity + omega * offset;
    var decay = Math.exp(-omega * dt);
    s.value = s.target + (offset + term * dt) * decay;
    s.velocity = (s.velocity - omega * term * dt) * decay;
    if (Math.abs(s.value - s.target) < 0.0001 && Math.abs(s.velocity) < 0.001) { s.value = s.target; s.velocity = 0; return false; }
    return true;
  }
  function randomSource(seed) {
    var value = seed | 0;
    return function () {
      value |= 0; value = (value + 0x6d2b79f5) | 0;
      var n = Math.imul(value ^ (value >>> 15), 1 | value);
      n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
      return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 预先模拟一整段揉皱过程，播放时按进度插值
  function createPaperPath(rest, triangles, shortSide, density, sharpness, depth, seed) {
    var count = rest.length / 3;
    var points = Float64Array.from(rest), previous = Float64Array.from(rest), before = Float64Array.from(rest);
    var edges = [], hinges = [], adjacency = new Map(), random = randomSource(seed);
    var guides = [];
    for (var gi = 0; gi < density; gi++) {
      var ang = random() * Math.PI * 2;
      guides.push({ x: Math.cos(ang), y: Math.sin(ang), phase: random() * Math.PI * 2, weight: random() * 0.6 + 0.4 });
    }
    for (var t = 0; t < triangles.length; t += 3) {
      for (var k = 0; k < 3; k++) {
        var a = triangles[t + k], b = triangles[t + ((k + 1) % 3)], opposite = triangles[t + ((k + 2) % 3)];
        var key = Math.min(a, b) * count + Math.max(a, b);
        var other = adjacency.get(key);
        if (!other) {
          adjacency.set(key, { a: a, b: b, opposite: opposite });
          edges.push(a * 3, b * 3, Math.hypot(rest[a * 3] - rest[b * 3], rest[a * 3 + 1] - rest[b * 3 + 1]));
        } else {
          var c = other.opposite * 3, d = opposite * 3;
          var length = Math.hypot(rest[c] - rest[d], rest[c + 1] - rest[d + 1]);
          var mx = (rest[c] + rest[d]) * 0.5, my = (rest[c + 1] + rest[d + 1]) * 0.5, weakness = 0;
          for (var q = 0; q < guides.length; q++) {
            var gd = guides[q];
            var dist = Math.abs(Math.sin(((mx * gd.x + my * gd.y) / shortSide) * 4 + gd.phase));
            weakness = Math.max(weakness, Math.exp(-dist * dist * 80) * gd.weight);
          }
          hinges.push(c, d, length, 0.12 + (1 - weakness) * 0.75);
        }
      }
    }
    var spacing = Math.sqrt((shortSide * shortSide) / count);
    var thickness = shortSide * 0.008;
    var samples = [rest.slice()];
    var frameCount = 64, stepsPerFrame = 3, totalSteps = frameCount * stepsPerFrame;
    var initialRadius = 0;
    for (var i = 0; i < rest.length; i += 3) initialRadius = Math.max(initialRadius, Math.hypot(rest[i] / 0.94, rest[i + 1] / 1.02));
    initialRadius *= 1.02;

    function constrain(list, stride, stiffness, reverse) {
      for (var n = 0; n < list.length; n += stride) {
        var edge = reverse ? list.length - stride - n : n;
        var a = list[edge], b = list[edge + 1];
        var dx = points[b] - points[a], dy = points[b + 1] - points[a + 1], dz = points[b + 2] - points[a + 2];
        var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len < 0.000001) continue;
        var weight = stride === 4 ? list[edge + 3] : 1;
        var amount = (1 - list[edge + 2] / len) * 0.5 * stiffness * weight;
        points[a] += dx * amount; points[b] -= dx * amount;
        points[a + 1] += dy * amount; points[b + 1] -= dy * amount;
        points[a + 2] += dz * amount; points[b + 2] -= dz * amount;
      }
    }
    function separateLayers() {
      var margin = thickness * 2;
      for (var t = 0; t < triangles.length; t += 3) {
        var a = triangles[t] * 3, b = triangles[t + 1] * 3, c = triangles[t + 2] * 3;
        var ax = points[a], ay = points[a + 1], az = points[a + 2];
        var bx = points[b] - ax, by = points[b + 1] - ay, bz = points[b + 2] - az;
        var cx = points[c] - ax, cy = points[c + 1] - ay, cz = points[c + 2] - az;
        var nx = by * cz - bz * cy, ny = bz * cx - bx * cz, nz = bx * cy - by * cx;
        var len = Math.hypot(nx, ny, nz);
        if (len < 0.0000001) continue;
        nx /= len; ny /= len; nz /= len;
        var minX = Math.min(ax, points[b], points[c]) - margin, maxX = Math.max(ax, points[b], points[c]) + margin;
        var minY = Math.min(ay, points[b + 1], points[c + 1]) - margin, maxY = Math.max(ay, points[b + 1], points[c + 1]) + margin;
        var minZ = Math.min(az, points[b + 2], points[c + 2]) - margin, maxZ = Math.max(az, points[b + 2], points[c + 2]) + margin;
        var bb = bx * bx + by * by + bz * bz, cc = cx * cx + cy * cy + cz * cz, bc = bx * cx + by * cy + bz * cz;
        var det = bb * cc - bc * bc;
        if (det < 0.0000000001) continue;
        for (var p = 0; p < points.length; p += 3) {
          if (p === a || p === b || p === c) continue;
          if (points[p] < minX || points[p] > maxX || points[p + 1] < minY || points[p + 1] > maxY ||
              points[p + 2] < minZ || points[p + 2] > maxZ) continue;
          var rx = rest[p] - (rest[a] + rest[b] + rest[c]) / 3;
          var ry = rest[p + 1] - (rest[a + 1] + rest[b + 1] + rest[c + 1]) / 3;
          if (rx * rx + ry * ry < spacing * spacing * 6) continue;
          var dx = points[p] - ax, dy = points[p + 1] - ay, dz = points[p + 2] - az;
          var distance = dx * nx + dy * ny + dz * nz;
          var prevD = (before[p] - before[a]) * nx + (before[p + 1] - before[a + 1]) * ny + (before[p + 2] - before[a + 2]) * nz;
          var side = prevD >= 0 ? 1 : -1;
          if (distance * side >= thickness || Math.abs(distance) > margin) continue;
          var pb = dx * bx + dy * by + dz * bz, pc = dx * cx + dy * cy + dz * cz;
          var u = (cc * pb - bc * pc) / det, v = (bb * pc - bc * pb) / det;
          if (u < 0 || v < 0 || u + v > 1) continue;
          var w = 1 - u - v;
          var corr = (thickness * side - distance) / (1 + w * w + u * u + v * v);
          var ns = [nx, ny, nz];
          for (var axis = 0; axis < 3; axis++) {
            var mv = ns[axis] * corr;
            points[p + axis] += mv; points[a + axis] -= mv * w; points[b + axis] -= mv * u; points[c + axis] -= mv * v;
          }
        }
      }
    }
    for (var step = 1; step <= totalSteps; step++) {
      var progress = step / totalSteps;
      var compression = progress * progress * (3 - 2 * progress);
      var radius = initialRadius * (1 - compression) + shortSide * (0.19 - depth * 0.025) * compression;
      before.set(points);
      for (i = 0; i < points.length; i += 3) {
        var x = rest[i] / shortSide, y = rest[i + 1] / shortSide, buckle = 0;
        for (q = 0; q < guides.length; q++) buckle += Math.sin((x * guides[q].x + y * guides[q].y) * 5 + guides[q].phase) * guides[q].weight;
        for (var ax2 = 0; ax2 < 3; ax2++) {
          var vel = (points[i + ax2] - previous[i + ax2]) * 0.55;
          previous[i + ax2] = points[i + ax2];
          points[i + ax2] += clamp(vel, -spacing * 0.15, spacing * 0.15);
        }
        points[i + 2] += (buckle / density) * shortSide * 0.0007 * Math.sin(progress * Math.PI);
      }
      for (var pass = 0; pass < 18; pass++) {
        constrain(hinges, 4, 0.45 * (1 - sharpness * 0.4), pass % 2 === 0);
        for (i = 0; i < points.length; i += 3) {
          var px = points[i] / 0.94, py = points[i + 1] / 1.02, pz = points[i + 2] / 0.86;
          var dd = Math.hypot(px, py, pz);
          if (dd > radius) {
            var push = (1 - radius / dd) * 0.55;
            points[i] -= points[i] * push; points[i + 1] -= points[i + 1] * push; points[i + 2] -= points[i + 2] * push;
          }
        }
        constrain(edges, 3, 1, pass % 2 !== 0);
        if (pass === 8 || pass === 17) separateLayers();
      }
      for (var h = 0; h < hinges.length; h += 4) {
        var ha = hinges[h], hb = hinges[h + 1];
        var hl = Math.hypot(points[ha] - points[hb], points[ha + 1] - points[hb + 1], points[ha + 2] - points[hb + 2]);
        if (hl < hinges[h + 2] * 0.86) hinges[h + 2] += (hl - hinges[h + 2]) * 0.12;
      }
      if (step % stepsPerFrame === 0) samples.push(Float32Array.from(points));
    }
    var folded = Float64Array.from(points);
    for (step = 1; step <= 80; step++) {
      var tt = step / 80, unfold = tt * tt * (3 - 2 * tt);
      for (pass = 0; pass < 12; pass++) {
        for (i = 0; i < points.length; i++) {
          var target = folded[i] + (rest[i] - folded[i]) * unfold;
          points[i] += (target - points[i]) * (i % 3 === 2 ? 0.04 : 0.22);
        }
        constrain(hinges, 4, 0.7, pass % 2 === 0);
        constrain(edges, 3, 1, pass % 2 !== 0);
      }
    }
    return { samples: samples, creased: Float32Array.from(points) };
  }

  CC.crumple = function (o) {
    var host = o.host, sheetEl = o.sheet;
    var api = { state: 'idle', side: 0 };
    var ready = null, dead = false;
    var env = null;

    api.prepare = function () {
      if (ready) return ready;
      ready = loadThree().then(function (THREE) {
        if (dead) return null;
        env = build(THREE);
        return env;
      }).catch(function (err) {
        if (window.console) console.warn('crumple unavailable', err);
        return null;
      });
      return ready;
    };

    function build(THREE) {
      var canvas = document.createElement('canvas');
      canvas.className = 'crumple__canvas';
      canvas.setAttribute('aria-hidden', 'true');
      var hit = document.createElement('button');
      hit.type = 'button';
      hit.className = 'crumple__hit';
      hit.setAttribute('aria-label', o.label || 'paper');
      host.appendChild(canvas);
      host.appendChild(hit);

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      var pw = sheetEl.offsetWidth || 320, ph = sheetEl.offsetHeight || 400;
      var aspect = ph / pw, shortSide = Math.min(1, aspect);
      var detail = 64, sharpness = 0.6, foldTotal = 7, depth = 0.65, seed = 7;
      var resolution = Math.round(clamp(detail / 4, 8, 24));
      var columns = Math.max(8, Math.round(resolution / Math.max(1, aspect)));
      var rows = Math.max(8, Math.round(resolution * Math.min(1, aspect)));
      var rng = randomSource(seed);
      var count = (columns + 1) * (rows + 1);
      var original = new Float32Array(count * 3), positions = new Float32Array(count * 3), uvs = new Float32Array(count * 2);
      var indices = [];
      for (var row = 0; row <= rows; row++) {
        for (var col = 0; col <= columns; col++) {
          var index = row * (columns + 1) + col;
          var u = (col + (col > 0 && col < columns ? (rng() - 0.5) * 0.5 : 0)) / columns;
          var v = (row + (row > 0 && row < rows ? (rng() - 0.5) * 0.5 : 0)) / rows;
          original[index * 3] = u - 0.5;
          original[index * 3 + 1] = (v - 0.5) * aspect;
          uvs[index * 2] = u; uvs[index * 2 + 1] = v;
          if (col < columns && row < rows) {
            var a = index, b = index + 1, c = index + columns + 1, d = c + 1;
            if (rng() > 0.5) indices.push(a, b, d, a, d, c); else indices.push(a, b, c, b, d, c);
          }
        }
      }
      var path = createPaperPath(original, indices, shortSide, foldTotal, sharpness, depth, seed);
      var rPos = new Float32Array(indices.length * 3), rNor = new Float32Array(indices.length * 3), rUv = new Float32Array(indices.length * 2);
      var faceN = new Float32Array(indices.length);
      var incident = [];
      for (var z = 0; z < count; z++) incident.push([]);
      for (var i = 0; i < indices.length; i++) {
        rUv[i * 2] = uvs[indices[i] * 2]; rUv[i * 2 + 1] = uvs[indices[i] * 2 + 1];
        incident[indices[i]].push(Math.floor(i / 3) * 3);
      }
      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(rPos, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute('normal', new THREE.BufferAttribute(rNor, 3).setUsage(THREE.DynamicDrawUsage));
      geometry.setAttribute('uv', new THREE.BufferAttribute(rUv, 2));

      var grainData = new Uint8Array(128 * 128 * 4);
      for (i = 0; i < grainData.length; i += 4) {
        var gv = 100 + Math.floor(rng() * 155);
        grainData[i] = grainData[i + 1] = grainData[i + 2] = gv; grainData[i + 3] = 255;
      }
      var grain = new THREE.DataTexture(grainData, 128, 128);
      grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
      grain.repeat.set(5, 5 * aspect);
      grain.magFilter = grain.minFilter = THREE.LinearFilter;
      grain.needsUpdate = true;

      // 正反两面的贴图都用 canvas 画
      var texCanvas = [document.createElement('canvas'), document.createElement('canvas')];
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var textures = texCanvas.map(function (cv, side) {
        cv.width = Math.round(pw * dpr); cv.height = Math.round(ph * dpr);
        var ctx = cv.getContext('2d');
        ctx.scale(dpr, dpr);
        o.draw(ctx, pw, ph, side);
        var tx = new THREE.CanvasTexture(cv);
        tx.colorSpace = THREE.SRGBColorSpace;
        tx.flipY = true;
        tx.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return tx;
      });

      var matOpts = { roughness: 0.92, metalness: 0, bumpMap: grain, bumpScale: 0.08 * 0.32,
                      alphaTest: 0.04, flatShading: false };
      var frontMat = new THREE.MeshStandardMaterial(Object.assign({}, matOpts, { side: THREE.FrontSide, map: textures[0] }));
      var backMat = new THREE.MeshStandardMaterial(Object.assign({}, matOpts, { side: THREE.BackSide, color: o.paperColor || '#e9ebef' }));
      var lighting = { value: 0 };
      [frontMat, backMat].forEach(function (m) {
        m.onBeforeCompile = function (shader) {
          shader.uniforms.paperLighting = lighting;
          shader.fragmentShader = 'uniform float paperLighting;\n' + shader.fragmentShader.replace(
            '#include <opaque_fragment>',
            'outgoingLight = mix(diffuseColor.rgb, outgoingLight, paperLighting);\n#include <opaque_fragment>');
        };
        m.customProgramCacheKey = function () { return 'paper-' + (m === backMat ? 'back' : 'front'); };
      });
      var sheet = new THREE.Group();
      var front = new THREE.Mesh(geometry, frontMat), back = new THREE.Mesh(geometry, backMat);
      front.castShadow = true; front.receiveShadow = true; back.receiveShadow = true;
      sheet.add(front, back);
      var scene = new THREE.Scene();
      scene.add(sheet);
      var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xa4a0b0, 1.35));
      var light = new THREE.DirectionalLight(0xf4f6ff, 1.8);
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.0002; light.shadow.normalBias = 0.6; light.shadow.radius = 3;
      scene.add(light, light.target);
      var floorMat = new THREE.ShadowMaterial({ opacity: 0.35, depthWrite: false });
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), floorMat);
      floor.receiveShadow = true;
      scene.add(floor);

      var amount = spring(), memory = spring(), posX = spring(), posY = spring(), tiltX = spring(), tiltY = spring();
      var springs = [amount, memory, posX, posY, tiltX, tiltY];
      var raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
      var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      var anchor = new THREE.Vector3(), world = new THREE.Vector3(), corner = new THREE.Vector3();
      var va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
      var weights = new THREE.Vector3(1, 0, 0);
      var gripIdx = [Math.floor(count / 2), 0, 0];
      var W = 1, H = 1, baseX = 0, baseY = 0;
      var px = 0, py = 0, lastX = 0, lastY = 0, lastMove = 0, speedX = 0, speedY = 0;
      var held = false, pid = null, peak = 0, frame = 0, lastTime = 0, prevA = -1, prevM = -1;
      var press = null;       // 按在揉好的纸团上：区分"拖"和"点"
      var reduce = CC.reducedMotion();

      function deform() {
        if (amount.value === prevA && memory.value === prevM) return;
        prevA = amount.value; prevM = memory.value;
        var fold = clamp(amount.value, 0, 1);
        var f = fold * (path.samples.length - 1), lo = Math.floor(f), hi = Math.min(lo + 1, path.samples.length - 1), mix = f - lo;
        var from = path.samples[lo], to = path.samples[hi];
        for (var i = 0; i < positions.length; i++) {
          positions[i] = from[i] + (to[i] - from[i]) * mix + (path.creased[i] - original[i]) * memory.value * (1 - fold);
        }
        for (var face = 0; face < indices.length; face += 3) {
          var a = indices[face] * 3, b = indices[face + 1] * 3, c = indices[face + 2] * 3;
          var bx = positions[b] - positions[a], by = positions[b + 1] - positions[a + 1], bz = positions[b + 2] - positions[a + 2];
          var cx = positions[c] - positions[a], cy = positions[c + 1] - positions[a + 1], cz = positions[c + 2] - positions[a + 2];
          var nx = by * cz - bz * cy, ny = bz * cx - bx * cz, nz = bx * cy - by * cx;
          var l = Math.hypot(nx, ny, nz) || 1;
          faceN[face] = nx / l; faceN[face + 1] = ny / l; faceN[face + 2] = nz / l;
        }
        for (i = 0; i < indices.length; i++) {
          var s = indices[i] * 3, fc = Math.floor(i / 3) * 3, sx = 0, sy = 0, sz = 0;
          var list = incident[indices[i]];
          for (var j = 0; j < list.length; j++) {
            var nb = list[j];
            var dot = faceN[fc] * faceN[nb] + faceN[fc + 1] * faceN[nb + 1] + faceN[fc + 2] * faceN[nb + 2];
            var wgt = THREE.MathUtils.smoothstep(dot, 0.88 - (1 - sharpness) * 0.18, 0.98);
            sx += faceN[nb] * wgt; sy += faceN[nb + 1] * wgt; sz += faceN[nb + 2] * wgt;
          }
          var ln = Math.hypot(sx, sy, sz) || 1;
          rPos[i * 3] = positions[s]; rPos[i * 3 + 1] = positions[s + 1]; rPos[i * 3 + 2] = positions[s + 2];
          rNor[i * 3] = sx / ln; rNor[i * 3 + 1] = sy / ln; rNor[i * 3 + 2] = sz / ln;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
        geometry.computeBoundingSphere();
        geometry.computeBoundingBox();
        lighting.value = THREE.MathUtils.smoothstep(fold + memory.value, 0, 0.4);
      }
      function placeHit() {
        var bd = geometry.boundingBox;
        if (!bd) return;
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (var i = 0; i < 8; i++) {
          corner.set(i & 1 ? bd.max.x : bd.min.x, i & 2 ? bd.max.y : bd.min.y, i & 4 ? bd.max.z : bd.min.z);
          corner.applyMatrix4(sheet.matrixWorld).project(camera);
          var x = ((corner.x + 1) * W) / 2, y = ((1 - corner.y) * H) / 2;
          minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
        hit.style.transform = 'translate3d(' + minX + 'px,' + minY + 'px,0)';
        hit.style.width = Math.max(24, maxX - minX) + 'px';
        hit.style.height = Math.max(24, maxY - minY) + 'px';
      }
      function setPointer(x, y) {
        pointer.set((x / W) * 2 - 1, 1 - (y / H) * 2);
        raycaster.setFromCamera(pointer, camera);
      }
      function render(time) {
        frame = 0;
        if (dead) return;
        var dt = lastTime ? Math.min(0.04, (time - lastTime) / 1000) : 1 / 60;
        lastTime = time;
        var moving = false;
        var dur = held ? 0.55 : 0.5;
        for (var i = 0; i < springs.length; i++) {
          var s = springs[i];
          moving = advance(s, dt, s === amount || s === memory ? dur : 0.42, reduce) || moving;
        }
        peak = Math.max(peak, amount.value);
        deform();
        sheet.rotation.set(tiltX.value, tiltY.value, 0);
        if (held) {
          var attr = geometry.attributes.position;
          anchor.set(0, 0, 0);
          for (var k = 0; k < 3; k++) { va.fromBufferAttribute(attr, gripIdx[k]); anchor.addScaledVector(va, weights.getComponent(k)); }
          anchor.multiplyScalar(pw).applyEuler(sheet.rotation);
          plane.constant = -anchor.z;
          setPointer(px, py);
          if (raycaster.ray.intersectPlane(plane, world)) {
            posX.value = posX.target = world.x - anchor.x - baseX;
            posY.value = posY.target = world.y - anchor.y - baseY;
            posX.velocity = posY.velocity = 0;
          }
        }
        sheet.position.set(baseX + posX.value, baseY + posY.value, 0);
        sheet.updateMatrixWorld(true);
        var bd = geometry.boundingBox;
        if (bd) {
          var backZ = Infinity;
          for (var c2 = 0; c2 < 8; c2++) {
            corner.set(c2 & 1 ? bd.max.x : bd.min.x, c2 & 2 ? bd.max.y : bd.min.y, c2 & 4 ? bd.max.z : bd.min.z);
            corner.applyMatrix4(sheet.matrixWorld);
            backZ = Math.min(backZ, corner.z);
          }
          floor.position.z = backZ - pw * shortSide * 0.08;
        }
        renderer.render(scene, camera);
        placeHit();
        if (moving) wake(); else { lastTime = 0; settled(); }
      }
      function wake() { if (!frame && !dead) frame = requestAnimationFrame(render); }

      function resize() {
        W = Math.max(1, host.clientWidth); H = Math.max(1, host.clientHeight);
        // 纸张大小、位置跟着 DOM 里的白纸走
        var nw = sheetEl.offsetWidth, nh = sheetEl.offsetHeight;
        if (nw > 0) { pw = nw; ph = nh; }
        sheet.scale.setScalar(pw);
        baseX = sheetEl.offsetLeft + pw / 2 - W / 2;
        baseY = -(sheetEl.offsetTop + ph / 2 - H / 2);
        camera.aspect = W / H;
        camera.position.z = H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H, false);
        var reach = Math.max(W, H), ang = THREE.MathUtils.degToRad(-35);
        light.position.set(Math.sin(ang) * reach, Math.cos(ang) * reach, reach * 4);
        var sc = light.shadow.camera;
        sc.left = sc.bottom = -reach; sc.right = sc.top = reach; sc.near = 1; sc.far = reach * 6;
        sc.updateProjectionMatrix();
        floor.scale.set(W * 4, H * 4, 1);
        wake();
      }

      function publish(s) {
        if (api.state === s) return;
        api.state = s;
        host.setAttribute('data-crumple', s);
        if (o.onState) o.onState(s, api.side);
      }
      // 动画停下来时：展开回原稿就交还给 DOM
      function settled() {
        if (api.state === 'unfolding' && amount.value < 0.001) {
          publish(api.side === 0 ? 'restored' : 'open');
          if (api.side === 0) {
            for (var i = 0; i < springs.length; i++) springs[i].value = springs[i].target = springs[i].velocity = 0;
            peak = 0;
            prevA = -1;
            deform();
            renderer.render(scene, camera);
          }
        }
      }

      function grabAt(e) {
        var r = host.getBoundingClientRect();
        px = lastX = e.clientX - r.left; py = lastY = e.clientY - r.top;
        setPointer(px, py);
        sheet.updateMatrixWorld(true);
        var hitInfo = raycaster.intersectObjects([front, back], false)[0];
        if (hitInfo && hitInfo.face) {
          var f = hitInfo.face;
          gripIdx = [f.a, f.b, f.c];
          var attr = geometry.attributes.position;
          va.fromBufferAttribute(attr, f.a); vb.fromBufferAttribute(attr, f.b); vc.fromBufferAttribute(attr, f.c);
          THREE.Triangle.getBarycoord(sheet.worldToLocal(hitInfo.point.clone()), va, vb, vc, weights);
        } else {
          gripIdx = [Math.floor(count / 2), Math.floor(count / 2), Math.floor(count / 2)];
          weights.set(1, 0, 0);
        }
        pid = e.pointerId;
        speedX = speedY = 0;
        lastMove = performance.now();
        try { hit.setPointerCapture(e.pointerId); } catch (err) {}
      }
      function crumpleNow(e) {
        resize();
        grabAt(e);
        held = true;
        peak = amount.value;
        amount.target = 0.88;
        posX.target = posX.value; posY.target = posY.value;
        publish('holding');
        wake();
      }
      function finish() {
        if (!held) return;
        held = false;
        if (pid !== null) { try { hit.releasePointerCapture(pid); } catch (err) {} }
        pid = null;
        amount.target = amount.value;            // 松手：保持纸团的样子，停在原地
        amount.velocity = 0;
        tiltX.target = tiltY.target = 0;
        var limX = Math.max(0, W / 2 - 40), limY = Math.max(0, H / 2 - 40);
        var coast = !reduce && performance.now() - lastMove < 90 ? 0.06 : 0;
        posX.target = clamp(baseX + posX.value + speedX * coast, -limX, limX) - baseX;
        posY.target = clamp(baseY + posY.value - speedY * coast, -limY, limY) - baseY;
        publish(amount.target > 0.2 ? 'crumpled' : 'open');
        wake();
      }
      function unfold() {
        api.side = 1 - api.side;
        frontMat.map = textures[api.side];
        frontMat.needsUpdate = true;
        amount.target = 0;
        memory.target = Math.max(memory.value, peak * 0.35);
        tiltX.target = tiltY.target = 0;
        posX.target = 0; posY.target = 0;          // 展开时回到原来的位置
        if (api.side === 0) memory.target = 0;
        publish('unfolding');
        wake();
      }

      function down(e) {
        if (e.button !== 0 || !e.isPrimary || held) return;
        e.preventDefault();
        if (api.state === 'crumpled') {
          press = { x: e.clientX, y: e.clientY, t: performance.now(), e: e };
          try { hit.setPointerCapture(e.pointerId); } catch (err) {}
          return;
        }
        crumpleNow(e);
      }
      function move(e) {
        if (press && !held) {
          if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) { var pe = press.e; press = null; crumpleNow(pe); }
          else return;
        }
        if (!held || e.pointerId !== pid) return;
        var r = host.getBoundingClientRect(), now = performance.now();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var dt = Math.max(0.008, (now - lastMove) / 1000);
        speedX = (x - lastX) / dt; speedY = (y - lastY) / dt;
        lastX = x; lastY = y; lastMove = now;
        px = clamp(x, 12, W - 12); py = clamp(y, 12, H - 12);
        var maxTilt = reduce ? 0 : THREE.MathUtils.degToRad(12);
        tiltX.target = clamp(speedY / 1800, -1, 1) * maxTilt;
        tiltY.target = clamp(speedX / 1800, -1, 1) * maxTilt;
        wake();
      }
      function up(e) {
        if (press) { press = null; try { hit.releasePointerCapture(e.pointerId); } catch (err) {} unfold(); return; }
        if (e.pointerId === pid) finish();
      }
      hit.addEventListener('pointerdown', down);
      hit.addEventListener('pointermove', move);
      hit.addEventListener('pointerup', up);
      hit.addEventListener('pointercancel', up);
      hit.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (api.state === 'crumpled') unfold();
      });

      var ro = new ResizeObserver(function () { if (!held) resize(); });
      ro.observe(host);
      resize();
      deform();

      return {
        THREE: THREE,
        start: function (e) { crumpleNow(e); },
        down: down, move: move, up: up,
        redraw: function () {
          texCanvas.forEach(function (cv, side) {
            var ctx = cv.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, pw, ph);
            o.draw(ctx, pw, ph, side);
            textures[side].needsUpdate = true;
          });
        },
        dispose: function () {
          ro.disconnect();
          cancelAnimationFrame(frame);
          geometry.dispose(); frontMat.dispose(); backMat.dispose(); floorMat.dispose(); grain.dispose();
          textures.forEach(function (t) { t.dispose(); });
          renderer.dispose();
          canvas.remove(); hit.remove();
        },
      };
    }

    // 在 DOM 白纸上按下：贴图按当前样子重画，然后开始揉
    api.grab = function (e) {
      if (!env) return false;
      env.redraw();
      env.start(e);
      return true;
    };
    api.ready = function () { return !!env; };
    api.destroy = function () {
      dead = true;
      if (env) env.dispose();
    };
    return api;
  };
})();
