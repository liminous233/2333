/* 同化值 / 明晰（隐藏）/ 物件 flag / 浏览记录 / 一次性选择 */
(function () {
  var CC = window.CC;
  var KEY = 'catharsis-0110-v1';
  var THRESHOLDS = [30, 60, 85]; // 清醒 / 微恙 / 安宁 / 至臻

  function blank() {
    return { assim: 0, clarity: 0, authed: false, flags: {}, seen: {}, counters: {}, choices: {} };
  }

  var data = blank();
  try {
    var raw = window.localStorage.getItem(KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      data = Object.assign(blank(), parsed);
    }
  } catch (e) { /* 无痕模式等：只在内存里记 */ }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function stageOf(v) {
    var s = 0;
    for (var i = 0; i < THRESHOLDS.length; i++) if (v >= THRESHOLDS[i]) s = i + 1;
    return s;
  }

  function apply() {
    var b = document.body;
    var stage = stageOf(data.assim);
    var prev = b.getAttribute('data-stage');
    b.setAttribute('data-stage', String(stage));
    b.style.setProperty('--assim', (data.assim / 100).toFixed(3));
    b.classList.toggle('flag-candle', !!data.flags.candleLit);
    b.classList.toggle('flag-gun', !!data.flags.gunLoaded);
    b.classList.toggle('flag-bell', !!data.flags.bellflowerWorn);
    b.classList.toggle('flag-sun', !!data.flags.sunSketchFound);
    document.dispatchEvent(new CustomEvent('cc:change', {
      detail: { assim: data.assim, stage: stage, stageChanged: prev !== String(stage) },
    }));
  }

  // 调试：?assim=75
  try {
    var m = /[?&]assim=(\d+)/.exec(location.search);
    if (m) { data.assim = Math.max(0, Math.min(100, +m[1])); data.authed = true; save(); }
  } catch (e) {}

  CC.state = {
    THRESHOLDS: THRESHOLDS,
    get assim() { return data.assim; },
    get stage() { return stageOf(data.assim); },
    get authed() { return data.authed; },
    // 明晰：只暗中计数，不给浏览者看
    get clarity() { return data.clarity; },
    flag: function (k) { return !!data.flags[k]; },
    seen: function (k) { return !!data.seen[k]; },

    add: function (n) {
      data.assim = Math.max(0, Math.min(100, data.assim + n));
      save(); apply();
    },
    // 只在第一次触发时加值。n 可以是数字（同化值），也可以是 { assim, clarity }
    once: function (key, n) {
      if (data.seen[key]) return false;
      data.seen[key] = true;
      var d = typeof n === 'object' && n ? n : { assim: n };
      if (d.assim) data.assim = Math.max(0, Math.min(100, data.assim + d.assim));
      if (d.clarity) data.clarity = Math.max(0, data.clarity + d.clarity);
      save(); apply();
      return true;
    },
    // 最多触发 max 次
    upTo: function (key, max, n) {
      var c = data.counters[key] || 0;
      if (c >= max) return false;
      data.counters[key] = c + 1;
      data.assim = Math.max(0, Math.min(100, data.assim + n));
      save(); apply();
      return true;
    },
    // 一次性的选择：记下选了什么，同时加减同化值 / 明晰。已经选过就不再算
    choice: function (key) { return data.choices[key] || ''; },
    choose: function (key, value, d) {
      if (data.choices[key]) return false;
      data.choices[key] = value;
      d = d || {};
      if (d.assim) data.assim = Math.max(0, Math.min(100, data.assim + d.assim));
      if (d.clarity) data.clarity = Math.max(0, data.clarity + d.clarity);
      save(); apply();
      return true;
    },
    setFlag: function (k, v) {
      data.flags[k] = v === undefined ? true : v;
      save(); apply();
    },
    auth: function () { data.authed = true; save(); },
    // 已读到的最远一天
    maxDay: function () {
      var d = 0;
      for (var i = 1; i <= 8; i++) if (data.seen['day:' + i]) d = i;
      return d;
    },
    reset: function () {
      data = blank();
      try { window.localStorage.removeItem(KEY); } catch (e) {}
      apply();
    },
    apply: apply,
  };
})();
