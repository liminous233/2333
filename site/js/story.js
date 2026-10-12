/* v0.2: additive route records. Existing save keys and content remain intact. */
(function () {
  var CC = window.CC, S = CC.state;
  function route() {
    if (S.flag('v02:reconnect')) return 'RECONNECT';
    var saved = S.record('v02:report');
    if (saved) return saved.route;
    // Migrate historical saves by the performance already seen, never by today's score.
    if (S.flag('d4Diamond')) return 'EARLY_MOON';
    if (S.flag('d4Report') || S.flag('bliss')) return 'REPORT_BLACK';
    return '';
  }
  function classify(n) { return n >= 50 ? 'EARLY_MOON' : n >= 40 ? 'ANOMALY' : 'REPORT_BLACK'; }
  function lockReport() {
    return S.remember('v02:report', function () { return { route: route() || classify(S.assim), assim: S.assim }; }).route;
  }
  function decision(value) {
    if (route() !== 'ANOMALY' || !S.flag('d4Report')) return false;
    var flags = {}, delta = {};
    if (value === 'embrace') flags['v02:night'] = true;
    else if (value === 'church') flags['v02:peaceLock'] = true;
    else if (value === 'reconnect') { flags['v02:reconnect'] = true; delta = window.CONTENT.v02.delta.reconnect; }
    else return false;
    return S.choose('v02:d4', value, delta, flags);
  }
  function hasEvidence() { return S.flag('v02:candleList') && S.flag('v02:oldId'); }
  function archiveReady() { return hasEvidence() && S.seen('v02:present') && S.seen('v02:discuss'); }
  function infinity() { return route() === 'RECONNECT' && hasEvidence() && S.flag('v02:archiveDone') && S.flag('v02:messageSent'); }
  function peace() { return route() === 'EARLY_MOON' || route() === 'ANOMALY' || S.flag('v02:peaceLock'); }
  function guard(page) {
    var ending = S.record('v02:ending');
    if (ending) return ending.kind === 'peace' ? 'ending' : page;
    if (S.flag('v02:peaceLock')) return 'ending';
    if (S.flag('d4Diamond')) return /^(church|ending)$/.test(page) ? page : 'church';
    if (route() === 'EARLY_MOON') return page === 'd4' ? page : 'd4';
    if (route() === 'ANOMALY' && !S.choice('v02:d4')) return page === 'd4' ? page : 'd4';
    if ((route() === 'ANOMALY' || route() === 'RECONNECT') && S.choice('v02:d4') && page === 'd4') return 'journal';
    if (route() === 'RECONNECT') {
      if (!S.flag('v02:reentered')) return page === 'gate' ? page : 'gate';
      if (/^(church|ending)$/.test(page) && !infinity()) return 'map';
    }
    return page;
  }
  function finish(kind) {
    return S.remember('v02:ending', function () {
      var rooms = window.CONTENT.map.rooms.filter(function (r) { return r.action; });
      return { version: window.CONTENT.v02.version, kind: kind, assim: S.assim, clarity: S.clarity,
        report: S.record('v02:report') || { route: route() }, route: route(), choices: S.choices(),
        actions: window.CONTENT.v02.review.actions.filter(function (a) { return S.seen(a[0]); }).map(function (a) { return a[1]; }),
        explored: rooms.filter(function (r) { return S.seen('v02:room:' + r.id); }).length, total: rooms.length,
        identity: infinity(), sent: S.flag('v02:messageSent'), survived: kind !== 'peace' };
    });
  }
  CC.story = { route: route, classify: classify, lockReport: lockReport, decision: decision,
    hasEvidence: hasEvidence, archiveReady: archiveReady, infinity: infinity, peace: peace, guard: guard, finish: finish,
    blackMap: function () { return S.flag('d4Report') && route() === 'REPORT_BLACK'; },
    oldName: function () { return S.remember('v02:oldName', function () {
      var names = window.CONTENT.v02.oldNames; return names[Math.floor(Math.random() * names.length)];
    }); }
  };
})();
