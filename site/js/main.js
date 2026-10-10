/* 路由 + 全局界面 */
(function () {
  var CC = window.CC;
  var C = window.CONTENT;
  var app = CC.$('#app');
  var chrome = CC.$('#chrome');
  var current = '';

  /* ---- 全局界面 ---- */
  CC.$$('[data-text]', chrome).forEach(function (el) {
    el.textContent = C.site[el.getAttribute('data-text')];
  });
  CC.$('.meter__label').textContent = C.ui.meterLabel;

  var leave = CC.$('#leave');
  leave.textContent = C.ui.leave;
  leave.addEventListener('click', function () {
    if (window.confirm(C.ui.leaveConfirm)) {
      CC.state.reset();
      CC.go('gate');
    }
  });

  var music = CC.$('#music');
  CC.$('.music__label', music).textContent = C.ui.music;
  music.addEventListener('click', function () {
    var on = CC.audio.toggle();
    music.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  function updateMeter() {
    var v = CC.state.assim;
    // 月亮从下往上被白色填满
    var h = (26 * v) / 100;
    var fill = CC.$('#meterFill');
    fill.setAttribute('y', String(33 - h));
    fill.setAttribute('height', String(h));
    CC.$('#meterWord').textContent = C.ui.stages[CC.state.stage];
    var t = '';
    if (CC.state.flag('candleLit')) t += '<span class="tok tok--flame" title="香烛已点燃"></span>';
    if (CC.state.flag('bellflowerWorn')) t += '<span class="tok tok--bell" title="风铃草胸针">' + CC.icon('bellflower') + '</span>';
    if (CC.state.flag('gunLoaded')) t += '<span class="tok tok--gun" title="已上膛">LOADED</span>';
    CC.$('#tokens').innerHTML = t;
  }
  document.addEventListener('cc:change', updateMeter);

  /* ---- 路由 ---- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/');
    return { name: parts[0] || '', arg: parts[1] };
  }

  function render() {
    var r = parse();
    if (!CC.state.authed && r.name !== 'gate') { CC.go('gate'); return; }
    if (!r.name) { CC.go(CC.state.authed ? 'home' : 'gate'); return; }
    var page = CC.pages[r.name];
    if (!page) { CC.go('home'); return; }

    CC.modal.close();
    if (CC.cleanup) { CC.cleanup(); CC.cleanup = null; }

    var isGate = r.name === 'gate';
    // page.bare：不要顶栏（只留左右下角的两个按钮）；page.white：白底
    chrome.hidden = isGate || !!page.bare;
    leave.hidden = isGate;
    music.hidden = isGate;
    document.body.classList.toggle('is-gate', isGate);
    document.body.classList.toggle('is-bare', !!page.bare);
    document.body.classList.toggle('is-white', !!page.white);
    document.body.setAttribute('data-route', r.name);
    if (r.name !== 'home') document.body.classList.remove('is-bliss');

    document.body.classList.toggle('is-home', r.name === 'home');

    var key = r.name + '/' + (r.arg || '');
    var samePage = current.split('/')[0] === r.name;
    current = key;

    app.className = 'page page--' + r.name;
    app.innerHTML = '';
    page(app, r.arg);
    if (!samePage) window.scrollTo(0, 0);
    app.classList.remove('enter');
    void app.offsetWidth;
    app.classList.add('enter');
  }

  window.addEventListener('hashchange', render);
  CC.state.apply();
  updateMeter();
  render();
})();
