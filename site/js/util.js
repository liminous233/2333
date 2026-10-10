/* 公共工具 */
(function () {
  var CC = (window.CC = window.CC || {});
  CC.pages = {};

  CC.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // 文案 → HTML：转义、可选污染、**加粗**、段落
  // opts.corrupt: 是否按当前同化阶段替换词语
  // opts.inline: 不包 <p>
  CC.fmt = function (text, opts) {
    opts = opts || {};
    var s = CC.esc(text);
    if (opts.corrupt && CC.corrupt) s = CC.corrupt.words(s);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (opts.inline) return s.replace(/\n/g, '<br>');
    return s
      .split(/\n{2,}/)
      .map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; })
      .join('');
  };

  CC.note = function (text, extra) {
    if (!text) return '';
    return '<aside class="note ' + (extra || '') + '"><span class="note__mark">✎</span>' + CC.fmt(text, { inline: true }) + '</aside>';
  };

  // 有素材图就用图，没有就用代码画的线稿
  CC.art = function (src, fallback, cls) {
    if (!src) return fallback;
    return '<img src="' + CC.esc(src) + '" alt="" class="art ' + (cls || '') + '" loading="lazy">';
  };

  CC.go = function (route) {
    location.hash = '#/' + route;
  };

  CC.$ = function (sel, root) { return (root || document).querySelector(sel); };
  CC.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // 可复现的伪随机
  CC.hash = function (str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  CC.rng = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  CC.reducedMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  // 模态框
  CC.modal = {
    open: function (html, cls) {
      var m = CC.$('#modal');
      CC.$('.modal__body', m).innerHTML = html;
      m.className = 'modal ' + (cls || '');
      m.hidden = false;
      document.body.classList.add('has-modal');
      var panel = CC.$('.modal__panel', m);
      panel.scrollTop = 0;
      CC.$('.modal__close', m).focus();
      return CC.$('.modal__body', m);
    },
    close: function () {
      var m = CC.$('#modal');
      if (m.hidden) return;
      m.hidden = true;
      document.body.classList.remove('has-modal');
      if (CC.modal.onclose) { var f = CC.modal.onclose; CC.modal.onclose = null; f(); }
    },
  };
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) CC.modal.close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') CC.modal.close();
  });
})();
