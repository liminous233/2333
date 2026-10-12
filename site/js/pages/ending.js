/* 结局 1 · 谢幕（方案 5：大颂礼结局页）
 * 像电影片尾：黑底，全英文，没有图片，字幕从下往上滚；画面带胶片的轻微抖动、闪烁、颗粒和偶尔的划痕。
 * 明晰值 ≥ ending.clarityAt 时，THE END 下面多一行感谢。图片署名也写在片尾里。
 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;

  CC.pages.ending = function (root) {
    var E = C.ending;
    var reduce = CC.reducedMotion();
    var lines = E.lines.slice();
    var infinity = CC.story.infinity();
    CC.story.finish(infinity ? 'infinity' : 'peace');
    if (infinity) { lines[1] = ['sub', C.v02.infinitySub[0]]; lines.splice(1, 0, ['infinity', C.v02.infinityText]); }
    else if (CC.story.peaceVariant()) lines[1] = ['sub', C.v02.peaceV.sub[0]];
    if (CC.state.clarity >= E.clarityAt) lines.push(['thanks', E.thanks]);
    CC.state.setFlag('ended1', true);

    function bilingual(text) { return CC.storyUI.bilingual(text); }
    var html = lines.map(function (l) {
      switch (l[0]) {
        case 'gap': return '<div class="cr__gap"></div>';
        case 'role': return '<p class="cr__role"><span>' + bilingual(l[1]) + '</span><b>' + bilingual(l[2]) + '</b></p>';
        case 'infinity': return '<p class="cr__infinity">' + bilingual(l[1]) + '</p>';
        default: return '<p class="cr__' + l[0] + '">' + bilingual(l[1]) + '</p>';
      }
    }).join('');

    root.innerHTML =
      '<section class="credits">' +
        '<a class="back-arrow" href="#/journal" aria-label="返回">←</a>' +
        '<div class="credits__gate"><div class="credits__roll">' + html + '</div></div>' +
        '<div class="credits__film" aria-hidden="true"><i></i><i></i></div>' +
      '</section>';

    var roll = CC.$('.credits__roll', root);
    var vh = window.innerHeight;
    var endEl = CC.$('.cr__end', roll);
    // 从屏幕下方滚到 THE END 停在正中（感谢那一行在它下面）
    var stop = endEl.offsetTop + endEl.offsetHeight / 2 - vh / 2;
    var dist = vh + stop;
    var anim = roll.animate([{ transform: 'translateY(' + vh + 'px)' }, { transform: 'translateY(' + (-stop) + 'px)' }],
      { duration: reduce ? 1 : dist / 42 * 1000, easing: 'linear', fill: 'forwards' });
    var langTimer = setInterval(function () { root.classList.toggle('v02-credits-zh'); }, 1000);
    anim.onfinish = function () {
      root.querySelector('.credits').classList.add('is-end');
      var result = document.createElement('div'); result.className = 'v02-end-review';
      result.innerHTML = infinity ? '<a class="ev-btn" href="#/home">' + CC.esc(C.v02.review.home) + '</a>' : '<details><summary>' + CC.esc(C.v02.review.title) + '<small>' + CC.esc(C.v02.review.en) + '</small></summary>' + CC.storyUI.review() + '</details>';
      root.querySelector('.credits').appendChild(result); CC.storyUI.bindReview(result);
      result.insertAdjacentHTML('beforeend', CC.endingStats.render()); CC.endingStats.bind(result);
    };
    // 点一下加速
    function fast() { anim.playbackRate = anim.playbackRate > 1 ? 1 : 4; }
    root.addEventListener('click', function (e) { if (!e.target.closest('a,button,summary,textarea,details')) fast(); });

    CC.cleanup = function () { anim.cancel(); clearInterval(langTimer); };
  };
  CC.pages.ending.bare = true;
})();
