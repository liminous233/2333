/* 4. 证物柜（方案 3）
 *
 * 白底，只有一只打开的手提箱。除了左右下角的两个按钮，没点物件时页面上没有任何字。
 * 盖子上的三个皮口袋：左边插线索便签，中间插蘸水笔，右边插颂歌谱子（只露出上半截）。
 * 箱底：香烛、银莲花、游客守则、失踪档案、枪、证件、半张牛皮纸（地图居室捡到另一半 Forever 后也放进来，可以拼合）。
 * 点一下拿出来（见 js/items.js）。
 */
(function () {
  var CC = window.CC;

  // 位置都按手提箱图片的百分比：left / top 是物件左上角，w 是宽度，rot 角度，
  // tuck：插在口袋里，从下往上藏掉多少（占物件自身高度的百分比）
  var ITEMS = [
    { kind: 'clue',    left: 30.4, top: 20.6, w: 11.4, rot: -5,  tuck: 44 },
    { kind: 'pen',     left: 48.2, top: 18.6, w: 1.75, rot: 3,   tuck: 26 },
    { kind: 'hymn',    left: 57.4, top: 16.2, w: 12,   rot: 4,   tuck: 46 },
    { kind: 'missing', left: 34.6, top: 47.5, w: 11.5, rot: -5 },
    { kind: 'rules',   left: 47.5, top: 54.5, w: 19,   rot: 3 },
    { kind: 'candle',  left: 29,   top: 57,   w: 5.2,  rot: 0 },
    { kind: 'kraft',   left: 66.5, top: 56,   w: 11,   rot: 9 },
    { kind: 'card',    left: 62.5, top: 62,   w: 12.5, rot: -7 },
    { kind: 'anemone', left: 25, top: 63,   w: 9.5,  rot: -72 },
    { kind: 'forever', left: 69,   top: 67.5, w: 10.5, rot: 5 },
    { kind: 'gun',     left: 45, top: 59.5, w: 21,   rot: -4 },
  ];

  CC.pages.evidence = function (root) {
    var objs = ITEMS.filter(function (o) { return CC.items.has(o.kind); }).map(function (o, i) {
      return '<button class="bc-item bc-item--' + o.kind + (o.tuck ? ' is-tucked' : '') + '" data-kind="' + o.kind + '" style="left:' + o.left +
        '%;top:' + o.top + '%;width:' + o.w + '%;--rot:' + o.rot + 'deg;--tuck:' + (o.tuck || 0) + '%;z-index:' + (3 + i) + '"' +
        ' aria-label="' + CC.esc(window.CONTENT.evidence.items[o.kind].name) + '"><span class="bc-item__in obj--' + o.kind + '">' + CC.items.look(o.kind) + '</span></button>';
    }).join('');

    root.innerHTML =
      '<section class="case">' +
        '<a class="back-arrow" href="#/journal" aria-label="返回">←</a>' +
        '<div class="case__stage">' +
          '<img class="case__img" src="assets/img/journal/briefcase.webp" alt="" draggable="false">' +
          objs +
        '</div>' +
      '</section>';

    var stage = CC.$('.case__stage', root);
    stage.addEventListener('click', function (e) {
      var b = e.target.closest('.bc-item');
      if (b) CC.items.lift(b.getAttribute('data-kind'), { src: b });
    });

    CC.cleanup = function () { CC.items.reset(); };
  };
  CC.pages.evidence.bare = true;
  CC.pages.evidence.white = true;
})();
