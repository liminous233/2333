(function () {
  var CC = window.CC, S = CC.state, V = window.CONTENT.v02;
  function toggleCard(el) { el.classList.toggle('v02-zh'); }
  function clue(layer) {
    var ink=layer.querySelector('.clue__ink'), original=ink.innerHTML;
    var controls=document.createElement('div');controls.className='v02-card-controls clue-controls';
    controls.innerHTML='<button type="button" class="ev-btn" data-clue-language aria-pressed="false">'+CC.esc(V.items.lang)+'</button>';
    layer.querySelector('.lift__item').insertAdjacentElement('afterend',controls);
    controls.querySelector('button').onclick=function(){
      var zh=ink.classList.toggle('clue__ink--zh');this.setAttribute('aria-pressed',String(zh));ink.lang=zh?'zh-CN':'en';
      ink.innerHTML=zh?window.CONTENT.gate.clueZh.map(function(line,i){return '<p style="--i:'+i+'">'+CC.esc(line)+'</p>';}).join(''):original;
    };
  }
  function dwell(el, delay, on, off) {
    var timer;
    function enter(e) { if (e && (e.pointerType === 'touch' || (e.type === 'focusin' && window.matchMedia('(pointer: coarse)').matches))) return; clearTimeout(timer); timer = setTimeout(on, delay); }
    function leave(e) { if (e && (e.pointerType === 'touch' || (e.type === 'focusout' && window.matchMedia('(pointer: coarse)').matches))) return; clearTimeout(timer); off(); }
    el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', enter); el.addEventListener('focusout', leave);
    return function () { clearTimeout(timer); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); el.removeEventListener('focusin', enter); el.removeEventListener('focusout', leave); };
  }
  function card(el, fc, old) {
    var base = window.CONTENT.gate.card, en = Object.assign({}, base), zh = Object.assign({}, base, V.cardZh);
    if (old) {
      en.fields = [[V.items.oldLabel[0], CC.story.oldName()]].concat(base.fields.slice(1));
      zh.fields = [[V.items.oldLabel[1], CC.story.oldName()]].concat(V.cardZh.fields.slice(1));
      en.back = V.prayer.en; zh.back = V.prayer.zh; el.classList.add('v02-worn');
    } else if (CC.story.route() === 'ANOMALY' && S.flag('v02:nightPrayer')) { en.back = V.prayer.en; zh.back = V.prayer.zh; }
    el.classList.toggle('v02-prayer-card', old || en.back === V.prayer.en);
    var front = CC.$('.fc__front', el), back = CC.$('.fc__back', el);
    front.innerHTML = '<div class="v02-card-en">' + CC.gateLook.cardFront(en) + '</div><div class="v02-card-zh" aria-hidden="true">' + CC.gateLook.cardFront(zh) + '</div><span class="fc__glare"></span>';
    back.innerHTML = '<div class="v02-card-en">' + CC.gateLook.cardBack(en) + '</div><div class="v02-card-zh" aria-hidden="true">' + CC.gateLook.cardBack(zh) + '</div><span class="fc__glare"></span>';
    if (old) {
      var prayer = CC.$('.v02-card-zh .idc__backtext', back);
      prayer.setAttribute('aria-label', V.prayer.zh);
      prayer.innerHTML = Array.from(V.prayer.zh).map(function (c, i) {
        if (c === '\n') return '<br>';
        return '<span aria-hidden="true" style="--delay:' + (1 + i * .045) + 's;--dur:14s;--fall:28cqw;--stretch:2;--drift:2px">' + CC.esc(c) + '</span>';
      }).join('');
    }
    var controls = document.createElement('div'); controls.className = 'v02-card-controls';
    controls.innerHTML = '<button type="button" class="ev-btn" data-language>' + CC.esc(V.items.lang) + '</button><button type="button" class="ev-btn" data-flip>' + CC.esc(V.items.flip) + '</button>';
    el.insertAdjacentElement('afterend', controls);
    CC.$('[data-language]', controls).onclick = function () { toggleCard(el); };
    CC.$('[data-flip]', controls).onclick = function () { fc.flip(); };
    var stop = dwell(el, 1500, function () { el.classList.add('v02-zh'); }, function () { el.classList.remove('v02-zh'); });
    function outside(e) { if (!el.contains(e.target) && !controls.contains(e.target)) el.classList.remove('v02-zh'); }
    document.addEventListener('pointerdown', outside);
    var alive = true;
    function destroy() { if (!alive) return; alive = false; stop(); observer.disconnect(); controls.remove(); document.removeEventListener('pointerdown', outside); }
    // Gate objects can be put back independently of page cleanup.
    var observer = new MutationObserver(function () { if (!el.isConnected) destroy(); });
    observer.observe(document.body, { childList: true, subtree: true });
    return destroy;
  }
  function listHtml(lang) {
    var zh = lang === 1;
    return '<h3>' + V.items.listTitle[lang] + '</h3><table><thead><tr>' + V.items.headers[lang].map(function (h) { return '<th>' + CC.esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      V.items.rows.map(function (r) { return '<tr><td>' + CC.esc(r[0]) + '</td><td>' + (zh ? (r[1] === 'F' ? '女' : '男') : r[1]) + '</td><td>' + r[2] + (zh ? ' 天' : ' DAYS') + '</td><td>' + r[3] + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  var itemCleanup = null;
  function closeItem() { if (itemCleanup) { var f = itemCleanup; itemCleanup = null; f(); } }
  function openItem(kind) {
    closeItem();
    var layer = document.createElement('div'); layer.className = 'v02-object-overlay'; layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.setAttribute('aria-label', V.items[kind]);
    var old = kind === 'oldId';
    layer.innerHTML = '<button class="v02-object-backdrop" aria-label="' + V.items.close + '"></button><div class="v02-object-wrap">' +
      (old ? '<div class="lift__card"><span class="fc__shadow"></span><div class="fc__rotor"><div class="fc__face fc__front"></div><div class="fc__face fc__back"></div></div></div><p class="v02-wear-label">' + V.items.worn + '</p>' :
        '<div class="v02-register" tabindex="0" role="button" aria-label="' + V.items.lang + '"><div class="v02-register-en">' + listHtml(0) + '</div><div class="v02-register-zh">' + listHtml(1) + '</div></div>') +
      '<button class="ev-btn v02-object-close">' + V.items.close + '</button></div>';
    document.body.appendChild(layer);
    var active = document.activeElement, cleanup = [], fc;
    if (old) {
      var el = CC.$('.lift__card', layer);
      fc = CC.flipCard(el, { onTouchTap: function () { toggleCard(el); } }); cleanup.push(card(el, fc, true));
    } else {
      var el = CC.$('.v02-register', layer);
      cleanup.push(dwell(el, 1000, function () { el.classList.add('v02-zh'); }, function () { el.classList.remove('v02-zh'); }));
      el.onclick = function () { toggleCard(el); }; el.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(el); } };
    }
    function key(e) {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); closeItem(); }
      if (e.key === 'Tab') {
        var targets = Array.from(layer.querySelectorAll('button,[tabindex="0"]')).filter(function (n) { return !n.classList.contains('v02-object-backdrop'); });
        if (e.shiftKey && document.activeElement === targets[0]) { e.preventDefault(); targets[targets.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === targets[targets.length - 1]) { e.preventDefault(); targets[0].focus(); }
      }
    }
    layer.addEventListener('click', function (e) { e.stopPropagation(); if (e.target.closest('.v02-object-close,.v02-object-backdrop')) closeItem(); });
    document.addEventListener('keydown', key, true);
    itemCleanup = function () { cleanup.forEach(function (f) { f(); }); if (fc) fc.destroy(); document.removeEventListener('keydown', key, true); layer.remove(); if (active && active.isConnected) active.focus({ preventScroll: true }); };
    CC.$(old ? '.lift__card' : '.v02-register', layer).focus({ preventScroll: true });
  }
  function recapText(r) {
    var R = V.review, labels = Object.assign({}, R.decisions);
    Object.keys(window.CONTENT.evidence.items).forEach(function (k) { (window.CONTENT.evidence.items[k].choices || []).forEach(function (c) { labels[c.id] = c.label; }); });
    (window.CONTENT.missing.choices || []).forEach(function (c) { labels[c.id] = c.label; });
    var choices = Object.keys(r.choices).map(function (k) { return labels[r.choices[k]] || r.choices[k]; });
    choices = choices.concat(r.actions || []);
    var F = R.fields;
    return [R.title + ' · ' + r.version, F.ending + '：' + (r.variant === 'overline-v' ? V.peaceV.name : R.names[r.kind]), F.assim + '：' + r.assim + ' / ' + F.clarity + '：' + r.clarity,
      F.report + '：' + (R.routes[r.report.route] || r.report.route), F.route + '：' + (R.routes[r.route] || r.route),
      F.choices + '：' + (choices.join('；') || '—'), F.exploration + '：' + r.explored + '/' + r.total,
      F.identity + '：' + (r.identity ? R.yes : R.no), F.sent + '：' + (r.sent ? R.yes : R.no), F.survived + '：' + (r.survived ? F.yes : F.no)].join('\n');
  }
  function review() {
    var r = S.record('v02:ending'); if (!r) return '';
    return '<div class="v02-review"><pre>' + CC.esc(recapText(r)) + '</pre><button type="button" class="ev-btn" data-copy-review>' + CC.esc(V.review.copy) + '</button><p class="v02-copy-status" role="status"></p></div>';
  }
  function bindReview(root) {
    CC.$$('[data-copy-review]', root).forEach(function (b) { b.onclick = async function (e) {
      e.stopPropagation(); var text = recapText(S.record('v02:ending')), box = b.closest('.v02-review');
      try { await navigator.clipboard.writeText(text); CC.$('.v02-copy-status', box).textContent = V.review.copied; }
      catch (err) { CC.$('.v02-copy-status', box).textContent = V.review.fallback; var field = CC.$('textarea', box); if (!field) { field = document.createElement('textarea'); field.readOnly = true; field.setAttribute('aria-label', V.review.title); box.appendChild(field); } field.value = text; field.focus(); field.select(); }
    }; });
  }
  function bilingual(text) {
    var zh = text === V.infinityText ? V.infinityTextZh : text === V.infinitySub[0] ? V.infinitySub[1] : V.creditsZh[text];
    if (text === V.peaceV.sub[0]) zh = V.peaceV.sub[1];
    if (text === V.peaceV.welcome[0]) zh = V.peaceV.welcome[1];
    if (!zh) return CC.esc(text);
    return '<span class="v02-bilingual"><span class="v02-en" lang="en">' + CC.esc(text) + '</span><span class="v02-cn" lang="zh">' + CC.esc(zh) + '</span></span>';
  }
  function mount(page, root) {
    var cleanups = [], prior = CC.cleanup;
    if (CC.endingStats) { CC.endingStats.bind(root); if (S.record('v02:ending')) CC.endingStats.record(S.record('v02:ending')); }
    if (page === 'd4' || page === 'map') cleanups.push(CC.storyEffects.downflow(root));
    if (page === 'map') cleanups.push(CC.fullAssimilation(root));
    if (page === 'map') cleanups.push(CC.storyEffects.mapPanelLayout(root));
    if (page === 'home' && S.flag('bliss')) cleanups.push(CC.storyEffects.sunArc(root));
    if (S.flag('v02:peaceLock') || S.flag('d4Diamond') || (S.record('v02:ending') || {}).kind === 'peace') CC.$$('.back-arrow', root).forEach(function (a) { a.remove(); });
    if (page === 'home') {
      var party = CC.$('.party', root);
      if (party) {
        var tip = party.querySelector('[role="tooltip"]') || party.querySelector('.party__hint') || party.querySelector('span');
        if (tip) tip.textContent += '\n' + V.party;
        function reveal() { if (S.once('v02:party')) { party.classList.add('v02-flash'); } }
        party.setAttribute('role', 'button'); party.setAttribute('aria-expanded', 'false');
        party.addEventListener('pointerenter', reveal); party.addEventListener('focus', reveal);
        party.addEventListener('click', function () { reveal(); var on = party.classList.toggle('v02-open'); party.setAttribute('aria-expanded', String(on)); if (!on) party.blur(); });
        party.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); party.click(); } });
        function outside(e) { if (!party.contains(e.target)) { party.classList.remove('v02-open'); party.setAttribute('aria-expanded', 'false'); party.blur(); } }
        document.addEventListener('pointerdown', outside); cleanups.push(function () { document.removeEventListener('pointerdown', outside); });
      }
      bindReview(root);
    }
    if (page === 'evidence') {
      var stage = CC.$('.case__stage', root);
      ['candleList', 'oldId'].forEach(function (kind, i) {
        if (!S.flag('v02:' + kind)) return;
        var b = document.createElement('button'); b.className = 'v02-case-item v02-case-item--' + kind; b.setAttribute('aria-label', V.items[kind]);
        b.innerHTML = kind === 'candleList' ? '<img src="' + V.images.paper + '" alt=""><span>' + CC.esc(V.items.listTitle[0]).replace(' ', '<br>') + '</span>' : CC.gateLook.cardFront(Object.assign({}, window.CONTENT.gate.card, { fields: [[V.items.oldLabel[0], CC.story.oldName()]] }));
        b.onclick = function () { openItem(kind); }; stage.appendChild(b);
      });
    }
    CC.cleanup = function () { closeItem(); cleanups.forEach(function (f) { f(); }); if (prior) prior(); };
  }
  CC.storyItems = { open: openItem, close: closeItem };
  CC.storyUI = { card: card, clue: clue, toggleCard: toggleCard, review: review, bindReview: bindReview, bilingual: bilingual, mount: mount, recapText: recapText };
})();
