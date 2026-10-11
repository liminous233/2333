/* 2. 唱诗院地图 · 方块地图
 *
 * 19 × 19 的格子。外圈不规则，从黑过渡到白；正中用方块拼出一个圆，
 * 圆里每一格是银莲花图的一小块，合起来是一整张；圆心 3 × 3 是圣堂（新月星盘，故意拼得不太连贯）。
 * 深色格子里藏着眼睛，偶尔眨一下。
 * 点房间：工作室 / 银莲花田 / 会客室 / 会议厅弹半透明小卡；大门 / 居室 / 钟楼 / 餐厅 / 祈祷室 / 圣堂在右下角翻出图片（边缘和黑底互相渗透）。
 * 数值全部暗中计分（CC.state.once，每个选项只算第一次）。
 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;

  var N = 19, MID = 9;
  var CIRCLE = 5.3;                 // 圆的半径（格）
  var EDGE = 8.9;                   // 外圈边界
  var IMG = 'assets/img/map/';

  function inRoom(M, c, r) {
    for (var i = 0; i < M.rooms.length; i++) {
      var R = M.rooms[i];
      if (!R.label && c >= R.col && c < R.col + R.w && r >= R.row && r < R.row + R.h) return R;
    }
    return null;
  }

  function tiles(M) {
    var rand = CC.rng(110);
    var out = [], darks = [];
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var dx = c - MID, dy = r - MID;
        var eu = Math.hypot(dx, dy);
        var sq = Math.max(Math.abs(dx), Math.abs(dy));
        var m = sq * 0.62 + eu * 0.38;           // 介于方和圆之间，外轮廓像参考图那样方方的
        var noise = rand();
        var room = inRoom(M, c, r);
        var style = 'grid-column:' + (c + 1) + ';grid-row:' + (r + 1) + ';';
        var cls = 'tile';

        if (c >= MID - 1 && c <= MID + 1 && r >= MID - 1 && r <= MID + 1) {
          // 圣堂：新月星盘切成 3 × 3，每块稍微错位
          var ox = (c - MID + 1) * 50 + (rand() - 0.5) * 7, oy = (r - MID + 1) * 50 + (rand() - 0.5) * 7;
          out.push('<i class="tile tile--moon" style="' + style + 'background-position:' + ox.toFixed(1) + '% ' + oy.toFixed(1) +
            '%;--b:' + (0.82 + rand() * 0.3).toFixed(2) + '"></i>');
          continue;
        }
        if (eu <= CIRCLE) {
          // 银莲花田：整张图铺在圆的外接方框上，每格露出对应的一块
          var x0 = MID - Math.floor(CIRCLE), span = Math.floor(CIRCLE) * 2;
          var px = (c - x0) / span * 100, py = (r - x0) / span * 100;
          out.push('<i class="tile tile--flower" style="' + style + 'background-position:' + px.toFixed(2) + '% ' + py.toFixed(2) +
            '%;background-size:' + ((span + 1) * 100) + '% ' + ((span + 1) * 100) + '%;--b:' + (0.9 + rand() * 0.16).toFixed(2) + '"></i>');
          continue;
        }
        if (!room && m + (noise - 0.5) * 1.6 > EDGE) continue;          // 外圈参差
        var t = Math.min(1, Math.max(0, (m - CIRCLE) / (EDGE - CIRCLE)));
        var L = Math.round(236 - t * 224 + (rand() - 0.5) * 22);
        L = Math.max(8, Math.min(244, L));
        var a = t > 0.86 && !room ? (0.35 + rand() * 0.55) : 1;
        style += 'background-color:rgb(' + L + ',' + (L + 1) + ',' + Math.min(255, L + 4) + ');opacity:' + a.toFixed(2) + ';';
        if (L < 70 && !room && a > 0.6) darks.push(out.length);
        out.push('<i class="' + cls + '" style="' + style + '"></i>');
      }
    }
    // 深色格子里放眼睛
    var picks = {};
    for (var k = 0; k < 15 && darks.length; k++) {
      var idx = darks.splice(Math.floor(rand() * darks.length), 1)[0];
      picks[idx] = 1 + Math.floor(rand() * 4);
    }
    return out.map(function (html, i) {
      if (!picks[i]) return html;
      return html.replace('class="tile"', 'class="tile tile--eye"').replace('"></i>',
        'background-image:url(' + IMG + 'eye-' + picks[i] + '.webp);animation-delay:' + (rand() * 9).toFixed(1) + 's;' +
        'animation-duration:' + (7 + rand() * 6).toFixed(1) + 's"></i>');
    }).join('');
  }

  CC.pages.map = function (root) {
    var M = C.map;
    var reduce = CC.reducedMotion();
    var rooms = M.rooms.map(function (R) {
      var pos = 'grid-column:' + (R.col + 1) + ' / span ' + R.w + ';grid-row:' + (R.row + 1) + ' / span ' + R.h + ';';
      var label = '<span class="room__zh">' + CC.esc(R.zh) + (R.sub ? '<small> · ' + CC.esc(R.sub) + '</small>' : '') + '</span>' +
        '<span class="room__en mono">' + CC.esc(R.en) + '</span>';
      if (R.label) return '<span class="room room--label" style="' + pos + '">' + label + '</span>';
      return '<button class="room' + (R.action ? ' is-active' : '') + ' room--' + R.id + '" data-room="' + R.id + '" style="' + pos + '"' +
        (R.action ? '' : ' tabindex="-1" aria-disabled="true"') + '>' + label + '</button>';
    }).join('');

    var W = M.welcome;
    root.innerHTML =
      '<section class="grounds">' +
        '<div class="grounds__map">' +
          '<div class="tiles" role="img" aria-label="唱诗院地图">' + tiles(M) + rooms + '</div>' +
          '<button class="candle-btn" id="candleBtn"><span class="candle-btn__en">' + CC.esc(M.candle.en) + '</span>' +
            '<span class="candle-btn__zh">' + CC.esc(M.candle.zh) + '</span></button>' +
        '</div>' +
        '<aside class="grounds__welcome">' +
          '<p class="welcome__zh">' + W.zh.map(function (l, i) { return '<span' + (i === 0 ? ' class="welcome__big"' : '') + '>' + CC.esc(l) + '</span>'; }).join('') + '</p>' +
          '<p class="welcome__en">' + W.en.map(function (l, i) { return '<span' + (i === 0 ? ' class="welcome__big"' : '') + '>' + CC.esc(l) + '</span>'; }).join('') + '</p>' +
        '</aside>' +
      '</section>';

    var map = CC.$('.tiles', root);
    var layer = null, scr = [], timers = [];

    function closeAll() {
      scr.forEach(function (s) { s.destroy(); });
      scr = [];
      if (layer) {
        var old = layer;
        layer = null;
        old.classList.add('is-leaving');
        setTimeout(function () { old.remove(); }, reduce ? 0 : 380);
      }
      CC.$$('.room.is-open', root).forEach(function (b) { b.classList.remove('is-open'); });
    }

    // 半透明黑色小卡（贴着房间弹出）
    function card(btn, text, zh) {
      closeAll();
      layer = document.createElement('div');
      layer.className = 'map-card' + (zh ? ' map-card--zh' : '');
      layer.innerHTML = '<p>' + CC.esc(text) + '</p>';
      map.appendChild(layer);
      layer.style.gridColumn = btn.style.gridColumn;
      layer.style.gridRow = btn.style.gridRow;
      btn.classList.add('is-open');
    }

    // DAY 5–7 的小卡：上面一行小字 DAY N，文字可以换行；贴边时往里挪，不出屏
    function dayCard(btn, D) {
      card(btn, D.text, true);
      layer.classList.add('map-card--day');
      layer.innerHTML = '<span class="map-card__day mono">' + CC.esc(D.label) + '</span><p>' + CC.esc(D.text) + '</p>';
      var r = layer.getBoundingClientRect(), pad = 8, dx = 0;
      if (r.left < pad) dx = pad - r.left;
      else if (r.right > window.innerWidth - pad) dx = window.innerWidth - pad - r.right;
      if (dx) layer.style.marginLeft = dx + 'px';
    }
    function day(n) { return CC.state.seen('day:' + n); }

    // 右下角翻出来的图片面板
    function panel(btn, html) {
      closeAll();
      layer = document.createElement('div');
      layer.className = 'map-panel';
      layer.innerHTML = '<button class="map-panel__x" data-close aria-label="' + CC.esc(M.close) + '">✕</button>' + html;
      document.body.appendChild(layer);
      btn.classList.add('is-open');
      return layer;
    }
    function figure(src) {
      return '<figure class="map-panel__fig"><img src="' + src + '" alt=""><figcaption class="map-panel__credit"></figcaption></figure>';
    }
    // 换图：先糊掉，再换
    function swap(p, src, then) {
      var img = CC.$('.map-panel__fig img', p);
      img.classList.add('is-swap');
      setTimeout(function () {
        img.src = src;
        img.classList.remove('is-swap');
        if (then) then();
      }, reduce ? 0 : 420);
    }
    function acts(p, handlers) {
      p.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (a && handlers[a.getAttribute('data-act')]) handlers[a.getAttribute('data-act')](a);
      });
    }
    function choices(list) {
      return '<div class="map-panel__acts">' + list.map(function (b) {
        return '<button class="pop-btn" data-act="' + b[0] + '">' + CC.esc(b[1]) + '</button>';
      }).join('') + '</div>';
    }
    function say(p, text, scramble, tone) {
      var el = CC.$('.map-panel__text', p);
      scr.forEach(function (s) { s.destroy(); });
      scr = [];
      el.removeAttribute('aria-label');
      el.classList.toggle('is-gaze', !!tone);
      el.classList.toggle('is-gaze-unrest', tone === 'unrest');
      el.classList.remove('is-in');
      void el.offsetWidth;
      el.classList.add('is-in');
      if (scramble) scr.push(CC.scramble(el, text));
      else el.textContent = text;
    }

    var actions = {
      gate: function (btn) {
        var G = M.gate;
        panel(btn, figure(G.image) + '<p class="map-panel__text">' + CC.esc(G.text) + '</p>');
        CC.state.once('map:gate', G.assim);
      },

      studio: function (btn) { card(btn, M.studio, true); },
      field: function (btn) {
        if (!day(6)) { card(btn, M.field, true); return; }
        dayCard(btn, M.day7);
        CC.state.once('day:7');
      },
      parlour: function (btn) { card(btn, M.parlour, true); },
      hall: function (btn) {
        if (!day(5)) { card(btn, M.hall, true); return; }
        dayCard(btn, M.day6);
        CC.state.once('day:6', { clarity: 1 });
      },

      // 居室：点那句话，下面才弹出选项
      dorm: function (btn) {
        var D = M.dorm;
        var p = panel(btn, figure(D.image) +
          '<p class="map-panel__text map-panel__text--tap" data-act="open" tabindex="0" role="button">' + CC.esc(D.text) + '</p>' +
          '<p class="map-panel__got" hidden></p>' + '<div class="map-panel__acts"></div>');
        var opened = false;
        acts(p, {
          open: function (el) {
            if (opened) return;
            opened = true;
            el.classList.remove('map-panel__text--tap');
            el.removeAttribute('role'); el.removeAttribute('tabindex');
            CC.$('.map-panel__acts', p).outerHTML = choices([['wander', D.wander], ['enter', D.enter]]);
          },
          wander: function () {
            say(p, D.wanderText);
            var got = CC.$('.map-panel__got', p);
            got.textContent = D.got; got.hidden = false;
            CC.state.once('map:dorm:wander', { clarity: D.wanderClarity });
            CC.state.setFlag('forever', true);
          },
          enter: function () {
            say(p, D.enterText);
            CC.$('.map-panel__got', p).hidden = true;
            CC.state.once('map:dorm:enter', D.enterAssim);
          },
        });
        p.addEventListener('keydown', function (e) {
          if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('data-act') === 'open') { e.preventDefault(); e.target.click(); }
        });
      },

      chapel: function (btn) {
        var H = M.chapel;
        var p = panel(btn, figure(H.image) + '<p class="map-panel__text">' + CC.esc(H.text.join('\n')) + '</p>' +
          choices([['pray', H.pray], ['walk', H.walk], ['leave', H.leave]]));
        var walked = false;
        acts(p, {
          pray: function () { say(p, H.prayText); CC.state.once('map:chapel:pray', H.prayAssim); },
          // 逛逛：先看见神父，「逛逛」原地换成「向外走去」
          walk: function (b) {
            say(p, H.walkText);
            b.setAttribute('data-act', 'out');
            b.textContent = H.out;
          },
          // 向外走去：围墙图 + 原来的那句话
          out: function () {
            say(p, H.outText);
            CC.state.once('map:chapel:walk', { clarity: H.walkClarity });
            if (walked) return;
            walked = true;
            swap(p, H.walkImage, function () { CC.$('.map-panel__credit', p).textContent = H.walkCredit; });
          },
          leave: function () {
            say(p, H.leaveText);
            CC.state.once('map:chapel:leave', H.leaveAssim);
            CC.$('.map-panel__acts', p).classList.add('is-gone');
            var t = setTimeout(function () { if (layer === p) closeAll(); }, reduce ? 600 : 2200);
            timers.push(t);
          },
        });
      },

      bell: function (btn) {
        var B = M.bell, D5 = B.day5;
        var key = CC.state.flag('d4Report');          // DAY4 述职分支走完：有钥匙
        var p = panel(btn, figure(B.image) + '<p class="map-panel__day mono" hidden>' + CC.esc(D5.label) + '</p>' +
          '<p class="map-panel__text"></p>' + choices([['up', B.up]]));
        p.addEventListener('click', function (e) {
          var a = e.target.closest('[data-act]');
          if (!a) return;
          var act = a.getAttribute('data-act');
          if (act === 'up') {
            CC.$('.map-panel__acts', p).outerHTML = choices([['archive', B.archive], ['gaze', B.gaze]]);
            if (key) { CC.$('.map-panel__day', p).hidden = false; say(p, D5.upText); }
          }
          if (act === 'archive') {
            if (!key) { say(p, B.archiveText); return; }
            say(p, D5.archiveText);
            a.setAttribute('data-act', 'open');      // 「档案室」原地变成「Open it」
            a.textContent = D5.open;
          }
          if (act === 'open') {
            say(p, D5.openText);
            a.remove();
            CC.state.once('day:5', { clarity: 1 });
          }
          if (act === 'gaze') {
            var unrest = day(5);
            say(p, unrest ? D5.gazeText : B.gazeText, true, unrest ? 'unrest' : 'calm');
            CC.state.once('map:gaze', 2);
          }
        });
      },

      dining: function (btn) {
        var D = M.dining;
        var p = panel(btn, figure(D.image) + '<p class="map-panel__day mono" hidden>' + CC.esc(D.label) + '</p>' +
          '<p class="map-panel__text">' + CC.esc(D.text) + '</p>' + choices([['forward', D.forward]]));
        p.addEventListener('click', function (e) {
          var a = e.target.closest('[data-act]');
          if (!a) return;
          var act = a.getAttribute('data-act');
          if (act === 'forward') {
            var img = CC.$('.map-panel__fig img', p);
            img.classList.add('is-swap');
            var reveal = setTimeout(function () {
              if (layer !== p) return;
              img.src = D.girlImage;
              img.classList.remove('is-swap');
              p.classList.add('is-dining-day7');
              CC.$('.map-panel__day', p).hidden = false;
              say(p, D.girlText);
              var text = CC.$('.map-panel__text', p);
              text.classList.add('dining-melt');
              text.setAttribute('aria-label', D.girlText);
              var rand = CC.rng(707);
              text.innerHTML = Array.from(D.girlText).map(function (ch) {
                return '<span aria-hidden="true" style="--delay:' + (4.5 + rand() * 5).toFixed(2) + 's;--fall:' +
                  (170 + rand() * 190).toFixed(0) + 'px;--stretch:' + (2 + rand() * 4).toFixed(2) + ';--drift:' +
                  (-7 + rand() * 14).toFixed(1) + 'px">' + CC.esc(ch) + '</span>';
              }).join('');
            }, reduce ? 0 : 420);
            timers.push(reveal);
            CC.$('.map-panel__acts', p).outerHTML = choices([['leave', D.leave]]);
            CC.state.once('map:girl', 3); // 沿用旧记录键，已有存档不重复加分。
          }
          if (act === 'leave') closeAll();
        });
      },

      cathedral: function (btn) {
        var p = panel(btn, figure(M.cathedral.image) + '<p class="map-panel__text"></p>');
        say(p, M.cathedral.text, true);
        CC.state.once('map:cathedral', 2);
      },
    };

    map.addEventListener('click', function (e) {
      var b = e.target.closest('.room.is-active');
      if (!b) return;
      if (b.classList.contains('is-open')) { closeAll(); return; }
      actions[M.rooms.filter(function (r) { return r.id === b.getAttribute('data-room'); })[0].action](b);
    });
    function onDoc(e) {
      if (!layer || !e.target.isConnected) return;     // 点的按钮已经被换掉了（比如"上楼"），不算点外面
      if (e.target.closest('[data-close]')) { closeAll(); return; }
      if (layer.contains(e.target) || e.target.closest('.room')) return;
      closeAll();
    }
    function onKey(e) { if (e.key === 'Escape') closeAll(); }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);

    CC.$('#candleBtn', root).addEventListener('click', function () {
      CC.state.setFlag('candleLit', true);
      CC.go('journal');
    });

    CC.cleanup = function () {
      timers.forEach(clearTimeout);
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
      scr.forEach(function (s) { s.destroy(); });
      if (layer && layer.parentNode === document.body) layer.remove();
      layer = null;
    };
  };
})();
