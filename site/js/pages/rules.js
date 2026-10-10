/* 5. 游客守则 / 6. 失踪档案（方案 3）
 * 和证物柜里的同一件物件互通：直接铺在页面上，选过的选项两边都算。
 */
(function () {
  var CC = window.CC;

  function itemPage(kind) {
    var page = function (root) {
      root.innerHTML = '<section class="item-page"><a class="back-arrow" href="#/journal" aria-label="返回">←</a></section>';
      var h = CC.items.lift(kind, { page: CC.$('.item-page', root) });
      CC.cleanup = function () { h.destroy(); };
    };
    page.bare = true;
    page.white = true;
    return page;
  }
  CC.pages.rules = itemPage('rules');
  CC.pages.missing = itemPage('missing');
})();
