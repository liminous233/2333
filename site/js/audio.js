/* 声音：背景颂歌（有文件用文件，没有就合成一段低持续音）+ 圣歌谱片段 */
(function () {
  var CC = window.CC;
  // 想换成真的音乐：把文件放进 assets/audio/，然后在 content.js 的 site.music 填上路径
  var FILE = (window.CONTENT.site && window.CONTENT.site.music) || '';
  var ctx = null, drone = null, fileAudio = null, fileOk = false, playing = false;

  function ac() {
    if (!ctx) {
      var A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // 检测有没有音乐文件
  if (FILE) try {
    fileAudio = new Audio();
    fileAudio.loop = true;
    fileAudio.preload = 'metadata';
    fileAudio.volume = 0.5;
    fileAudio.addEventListener('loadedmetadata', function () { fileOk = true; });
    fileAudio.addEventListener('error', function () { fileOk = false; });
    fileAudio.src = FILE;
  } catch (e) { fileAudio = null; }

  function startDrone() {
    var c = ac();
    if (!c) return;
    var out = c.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(0.09, c.currentTime + 3);
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    lp.connect(out);
    out.connect(c.destination);
    var oscs = [110, 164.81, 220.4, 329.2].map(function (f, i) {
      var o = c.createOscillator();
      o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = f;
      var g = c.createGain();
      g.gain.value = [0.5, 0.3, 0.22, 0.12][i];
      // 缓慢起伏
      var lfo = c.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.03;
      var lg = c.createGain();
      lg.gain.value = 0.12;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(lp);
      o.start(); lfo.start();
      return [o, lfo];
    });
    drone = { out: out, oscs: oscs };
  }

  function stopDrone() {
    if (!drone || !ctx) return;
    var d = drone;
    drone = null;
    d.out.gain.cancelScheduledValues(ctx.currentTime);
    d.out.gain.setValueAtTime(d.out.gain.value, ctx.currentTime);
    d.out.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    setTimeout(function () {
      d.oscs.forEach(function (p) { try { p[0].stop(); p[1].stop(); } catch (e) {} });
    }, 1400);
  }

  CC.audio = {
    get playing() { return playing; },
    toggle: function () {
      playing = !playing;
      if (playing) {
        if (fileOk && fileAudio) fileAudio.play().catch(function () { startDrone(); });
        else startDrone();
      } else {
        if (fileAudio) fileAudio.pause();
        stopDrone();
      }
      return playing;
    },
    // 圣歌谱：一小段合唱般的音型
    chant: function () {
      var c = ac();
      if (!c) return;
      var notes = [57, 60, 64, 62, 60, 59, 57, 0, 57, 64, 69, 67, 64];
      var t = c.currentTime + 0.05;
      notes.forEach(function (n, i) {
        if (!n) { t += 0.5; return; }
        [0, 12, 7].forEach(function (off, j) {
          var o = c.createOscillator();
          var g = c.createGain();
          o.type = j === 0 ? 'triangle' : 'sine';
          o.frequency.value = 440 * Math.pow(2, (n + off - 69) / 12);
          o.detune.value = (j - 1) * 6;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(j === 0 ? 0.07 : 0.03, t + 0.12);
          g.gain.linearRampToValueAtTime(0, t + 0.62);
          o.connect(g); g.connect(c.destination);
          o.start(t); o.stop(t + 0.7);
        });
        t += i === notes.length - 1 ? 1.2 : 0.5;
      });
    },
  };
})();
