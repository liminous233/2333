/* New map scenes use the original panel, scramble and flowing-ink renderer. */
(function () {
  var CC = window.CC, S = CC.state;
  CC.storyMap = function (A) {
    var V = window.CONTENT.v02, M = window.CONTENT.map, T = CC.story;
    var chatCleanup=null;
    A.onCleanup(function(){if(chatCleanup)chatCleanup();});
    function hallMessages(){
      if(chatCleanup)chatCleanup();
      var overlay=document.createElement('div');overlay.className='hall-messages';overlay.setAttribute('aria-live','polite');
      document.body.appendChild(overlay);var timers=[],ready=false;
      function show(i){var bubble=document.createElement('p');bubble.className='hall-message'+(i===1?' hall-message--blue':'');bubble.textContent=V.tribunalHall.messages[i];overlay.appendChild(bubble);if(i===2)ready=true;}
      function close(){timers.forEach(clearTimeout);overlay.remove();document.removeEventListener('keydown',key);chatCleanup=null;}
      function key(e){if(ready&&e.key==='Escape')close();}
      overlay.addEventListener('click',function(e){if(ready&&e.target===overlay)close();});document.addEventListener('keydown',key);
      chatCleanup=close;show(0);timers.push(setTimeout(function(){show(1);},1000),setTimeout(function(){show(2);},2000));
    }
    function panel(btn, image, day, text, options) {
      return A.panel(btn, (image ? A.figure(image) : '') + (day ? '<p class="map-panel__day mono">DAY ' + day + '</p>' : '') +
        '<p class="map-panel__text">' + CC.esc(text) + '</p>' + A.choices(options || []));
    }
    function choices(p, list) { CC.$('.map-panel__acts', p).outerHTML = A.choices(list); }
    function scene(btn, name) {
      var route = T.route(), reconnect = route === 'RECONNECT';
      if (reconnect && !/^(bell|studio|parlour|gate)$/.test(name)) { A.card(btn, V.locked, true); return true; }
      var additions = reconnect || T.blackMap();
      if(route==='REPORT_BLACK' && name==='hall'){
        var H6=V.tribunalHall,read=S.seen('v02:hallEavesdrop');
        S.once('day:6',{clarity:1});S.once('v02:hallTribunal',{assim:-3});
        var tribunal=panel(btn,V.anomaly.hall.image,read?7:6,read?H6.day7:H6.day6,read?[['tribunalLeave',V.leave]]:[['listen',H6.listen]]);
        A.acts(tribunal,{
          listen:function(){S.once('v02:hallEavesdrop');CC.$('.map-panel__day',tribunal).textContent='DAY 7';A.say(tribunal,H6.day7);choices(tribunal,[['tribunalLeave',V.leave]]);},
          tribunalLeave:function(){A.closeAll();hallMessages();}
        });return true;
      }
      if (additions && name === 'studio') {
        if (S.flag('v02:studioLocked')) {
          var locked = panel(btn, V.images.nuns, 5, V.studio.locked, [['leave', V.leave]]);
          A.acts(locked, { leave: A.closeAll }); return true;
        }
        S.once('v02:day:5');
        var p = panel(btn, V.images.studio, 5, V.studio.intro, V.studio.options);
        A.acts(p, {
          hide: function () { A.say(p, V.studio.hide); S.once('v02:hide', V.delta.hide); },
          search: function () {
            S.settle('v02:search', V.delta.search, { 'v02:candleList': true });
            A.say(p, V.studio.after); CC.storyItems.open('candleList'); A.status();
          },
          down: function () {
            if (!S.flag('v02:candleList')) { A.say(p, V.studio.wait); return; }
            A.swap(p, V.images.nuns); A.say(p, V.studio.expel); choices(p, [['exit', V.leave]]);
          },
          exit: function () { S.setFlag('v02:studioLocked'); A.closeAll(); }
        }); return true;
      }
      if (additions && name === 'parlour') {
        S.once('v02:day:6');
        var p = panel(btn, V.images.parlour, 6, V.parlour.intro, [['take', V.parlour.take]]);
        A.acts(p, { take: function () {
          T.oldName(); S.settle('v02:oldId', V.delta.oldId, { 'v02:oldId': true });
          A.say(p, V.parlour.after); choices(p, [['inspect', V.parlour.inspect], ['leave', V.leave]]); A.status();
          CC.storyItems.open('oldId');
        }, inspect: function () { CC.storyItems.open('oldId'); }, leave: A.closeAll }); return true;
      }
      if (reconnect && name === 'gate') {
        if (!S.flag('v02:archiveDone')) { var lockedGate = panel(btn, M.gate.image, 0, V.gateLocked, [['leave', V.leave]]); CC.$('.map-panel__text', lockedGate).classList.add('v02-shake'); A.acts(lockedGate, { leave: A.closeAll }); return true; }
        S.once('day:7');
        var p = panel(btn, V.images.sky, 7, V.ourSky, [['action', V.action]]);
        A.acts(p, { action: function () {
          S.setFlag('v02:messageSent'); A.say(p, V.sent); choices(p, [['journal', V.toDome]]); A.status();
        }, journal: function () { CC.go('journal'); } }); return true;
      }
      if (name === 'bell' && (reconnect || route === 'ANOMALY' || !S.flag('d4Report'))) {
        var B = M.bell, p = panel(btn, B.image, S.flag('d4Report') ? 5 : 0, '', [['up', B.up]]);
        A.acts(p, {
          up: function () { A.say(p, S.flag('d4Report') ? B.day5.upText : ''); choices(p, [['archive', B.archive], ['gaze', B.gaze]]); },
          gaze: function () { A.say(p, route === 'ANOMALY' ? V.anomaly.gaze : B.gazeText, true, 'calm'); S.once('map:gaze', 2); },
          archive: function () {
            if (!S.flag('d4Report') || (reconnect && !T.hasEvidence())) {
              A.say(p, reconnect ? V.archiveLocked : B.archiveText); choices(p, [['try', V.tryDoor], ['up', B.up]]); return;
            }
            if (reconnect) { A.say(p, V.archive.intro); archiveOptions(); return; }
            A.say(p, B.day5.archiveText); choices(p, [['open', B.day5.open]]);
          },
          try: function () { A.say(p, V.tryText); },
          open: function () { A.say(p, V.anomaly.archive); S.once('v02:archive', V.delta.archive); S.once('day:5'); choices(p, [['up', B.up]]); },
          present: function () { A.say(p, V.archive.present); S.once('v02:present'); archiveOptions(); },
          discuss: function () { A.say(p, V.archive.discuss); S.once('v02:discuss'); archiveOptions(); },
          solve: function () { if (!T.archiveReady()) return; S.setFlag('v02:archiveDone'); A.say(p, V.archive.done); choices(p, [['leave', V.leave]]); A.status(); },
          leave: A.closeAll
        });
        function archiveOptions() { S.once('day:5'); choices(p, [['present', V.archive.presentLabel], ['discuss', V.archive.discussLabel]].concat(T.archiveReady() ? [['solve', V.archive.solve]] : [])); }
        return true;
      }
      if (route !== 'ANOMALY' || S.choice('v02:d4') !== 'embrace') return false;
      var H = V.anomaly;
      if (name === 'gate' || name === 'cathedral') {
        var p = panel(btn, M[name].image, 7, H[name], name === 'cathedral' ? [['church', H.enterChurch]] : []);
        CC.$('.map-panel__text', p).classList.add('v02-soft');
        S.once('day:7');
        A.acts(p, { church: function () { A.say(p, H.tomorrow); choices(p, [['no', H.no], ['yes', H.yes]]); },
          no: A.closeAll, yes: function () { S.setFlag('v02:peaceLock'); CC.go('church'); } }); return true;
      }
      if (name === 'field') { A.card(btn, H.field, true); return true; }
      if (name === 'hall') {
        var hall = H.hall, step = 0;
        hall.stages.forEach(function (s, i) { if (S.seen(s.key)) step = i; });
        var hp = panel(btn, step === 3 ? hall.portrait : hall.image, 0, '', []);
        function showHall() {
          var stage = hall.stages[step];
          hp.classList.toggle('is-c2-portrait',step===3);
          S.settle(stage.key, stage.delta);
          A.say(hp, stage.text);
          choices(hp, step === 0 ? [['hallEnter', hall.enter]] : step === 1 ? [['hallNext', hall.next]] :
            step === 2 ? [['hallPortrait', hall.view]] : [['hallChurch', hall.church], ['leave', V.leave]]);
        }
        A.acts(hp, {
          hallEnter: function () { if (step !== 0) return; step = 1; showHall(); },
          hallNext: function () { if (step !== 1) return; step = 2; showHall(); },
          hallPortrait: function () { if (step !== 2) return; step = 3; A.swap(hp, hall.portrait); showHall(); },
          hallChurch: function (button,event) {
            if (step !== 3) return;
            if (S.assim===100) {
              event.stopPropagation();
              var cathedral=document.querySelector('.room--cathedral');
              if(!S.record('v02:ending'))S.once('v02:room:'+cathedral.dataset.room);
              scene(cathedral,'cathedral');return;
            }
            S.setFlag('v02:peaceLock');CC.go('church');
          },
          leave: A.closeAll
        });
        showHall(); return true;
      }
      if (name === 'dining') {
        var D = M.dining, p = panel(btn, D.image, 0, H.diningIntro, [['forward', H.forward]]);
        A.acts(p, { forward: function () {
          A.swap(p, D.girlImage); A.melt(p, H.girl); choices(p, [['leave', V.leave]]);
          var head = document.createElement('button'); head.className = 'v02-girl-head'; head.setAttribute('aria-label', H.girlAlt);
          head.addEventListener('click', function () { A.say(p, H.head); }); CC.$('.map-panel__fig', p).appendChild(head);
        }, leave: A.closeAll }); return true;
      }
      if (name === 'chapel') {
        var C = M.chapel, p = panel(btn, C.image, 6, C.text.join('\n'), [['pray', C.pray], ['walk', C.walk], ['leave', C.leave]]);
        S.once('day:6');
        A.acts(p, { pray: function () {
          var selected = S.choice('v02:prayer'); A.say(p, selected ? H[selected] : H.pray);
          choices(p, selected ? [['walk', C.walk], ['leave', C.leave]] : [['eyes', H.eyesLabel], ['continue', H.continueLabel]]);
        }, eyes: function () { prayChoice('eyes'); }, continue: function () { prayChoice('continue'); },
          walk: function () { A.say(p, H.walk); choices(p, [['out', C.out], ['leave', C.leave]]); },
          out: function () { A.swap(p, C.walkImage); A.say(p, H.out); S.once('v02:out', V.delta.out); choices(p, [['leave', C.leave]]); },
          leave: function () { A.say(p, H.leave, true); choices(p, [['exit', V.leave]]); }, exit: A.closeAll });
        function prayChoice(k) { S.choose('v02:prayer', k, V.delta[k]); A.say(p, H[S.choice('v02:prayer')]); choices(p, [['walk', C.walk], ['leave', C.leave]]); }
        return true;
      }
      if (name === 'dorm' && S.flag('v02:night')) {
        var p = panel(btn, M.dorm.image, 0, H.nightIntro, [['enter', M.dorm.enter]]);
        A.acts(p, { enter: function () { A.say(p, H.nightIntro); choices(p, [['pray', H.nightLabel]]); },
          pray: function () { S.settle('v02:nightPrayer', V.delta.night, { 'v02:nightPrayer': true }); A.flowScramble(p, H.night + '\n' + V.prayer.zh); choices(p, [['evidence', H.evidence]]); },
          evidence: function () { CC.go('evidence'); } }); return true;
      }
      return false;
    }
    return scene;
  };
})();
