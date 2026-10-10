/* 污染效果：词语替换、匿名字迹 */
(function () {
  var CC = window.CC;
  var sessionSeed = (Math.random() * 1e9) | 0;

  // 各阶段的替换概率
  var RATE = [0, 0.06, 0.22, 0.5];

  var pairs = (window.CONTENT.replacements || []).map(function (p) {
    return { re: new RegExp('^' + p[0] + '$'), src: p[0], to: p[1] };
  });
  var all = pairs.length
    ? new RegExp(pairs.map(function (p) { return '(?:' + p.src + ')'; }).join('|'), 'g')
    : null;

  function words(html) {
    var stage = CC.state.stage;
    var rate = RATE[stage] || 0;
    if (!rate || !all) return html;
    var rand = CC.rng(CC.hash(html) ^ sessionSeed ^ stage);
    // 只替换标签外的文字
    return html.replace(/(<[^>]*>)|([^<]+)/g, function (m, tag, text) {
      if (tag) return tag;
      return text.replace(all, function (w) {
        if (rand() > rate) return w;
        for (var i = 0; i < pairs.length; i++) {
          if (pairs[i].re.test(w)) {
            return '<span class="hymn" title="' + w + '">' + pairs[i].to + '</span>';
          }
        }
        return w;
      });
    });
  }

  // 匿名字迹：wax 蜡油流动 / strike 被笔划掉 / white 被白色覆盖
  // 悬停时会短暂露出一两个字
  function anon(name, style) {
    var chars = Array.from(name);
    var rand = CC.rng(CC.hash(name));
    var peek = {};
    var n = Math.min(2, Math.max(1, chars.length - 2));
    for (var k = 0; k < n; k++) peek[Math.floor(rand() * chars.length)] = true;
    var inner = chars.map(function (c, i) {
      return '<span style="--i:' + i + '"' + (peek[i] ? ' class="peek"' : '') + '>' + CC.esc(c) + '</span>';
    }).join('');
    return '<span class="anon anon--' + style + '" aria-label="姓名已污损">' + inner + '</span>';
  }

  CC.corrupt = { words: words, anon: anon };
})();
