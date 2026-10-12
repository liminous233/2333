/* Per-run counts survive starting a new game. No player identity is uploaded. */
(function () {
  var CC = window.CC, prefix = 'choir-ending-event:', memory = {}, totals = null, busy = null;
  var ids = ['peace', 'peace-v', 'bliss', 'infinity'];
  function events() {
    var all = Object.assign({}, memory);
    try { for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i); if (key.indexOf(prefix) !== 0) continue;
      var value = JSON.parse(localStorage.getItem(key));
      if (value && ids.indexOf(value.kind) >= 0) all[key.slice(prefix.length)] = value;
    } } catch (e) {}
    return all;
  }
  function store(id, value) { memory[id] = value; try { localStorage.setItem(prefix + id, JSON.stringify(value)); } catch (e) {} }
  function counts() { var result = {peace:0,'peace-v':0,bliss:0,infinity:0}; var all = events(); Object.keys(all).forEach(function (id) { result[all[id].kind]++; }); return result; }
  function record(result) {
    var id = CC.state.remember('endstats:run', function () { return crypto.randomUUID(); });
    if (!events()[id]) store(id, {kind: result.variant === 'overline-v' ? 'peace-v' : result.kind, synced:false});
    sync();
  }
  function render() {
    var T = window.CONTENT.endingStats, mine = counts();
    return '<details class="ending-stats"><summary>' + CC.esc(T.title) + '</summary><ul>' + ids.map(function (id, i) {
      return '<li data-ending-stat="' + id + '"><span class="ending-stats__name">' + (i+1) + ' · ' + CC.esc(mine[id] ? T.names[id] : T.locked) + '</span><small>' +
        CC.esc(T.mine) + ' <b data-mine>' + mine[id] + '</b> · ' + CC.esc(T.global) + ' <b data-global>' + (totals ? totals[id] : '—') + '</b></small></li>';
    }).join('') + '</ul><p class="ending-stats__notice"></p></details>';
  }
  function update() {
    var T=window.CONTENT.endingStats, mine=counts();
    document.querySelectorAll('[data-ending-stat]').forEach(function (el) {
      var id=el.dataset.endingStat;
      el.querySelector('.ending-stats__name').textContent=(ids.indexOf(id)+1)+' · '+(mine[id]?T.names[id]:T.locked);
      el.querySelector('[data-mine]').textContent=mine[id];el.querySelector('[data-global]').textContent=totals?totals[id]:'—';
    });
    document.querySelectorAll('.ending-stats__notice').forEach(function(el){el.textContent=totals?'':T.offline;});
  }
  async function request(options) {
    var controller=new AbortController(), timer=setTimeout(function(){controller.abort();},8000);
    try { var res=await fetch('/api/ending-stats',Object.assign({signal:controller.signal},options));if(!res.ok)throw Error('stats unavailable');return await res.json(); }
    finally {clearTimeout(timer);}
  }
  function sync() {
    if(busy)return busy;
    if(!/^https?:$/.test(location.protocol)){update();return Promise.resolve();}
    busy=(async function(){
      try {
        var all=events();
        for(var id of Object.keys(all)) if(!all[id].synced) {
          var result=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,kind:all[id].kind})});
          totals=result.counts;store(id,{kind:all[id].kind,synced:true});
        }
        totals=(await request()).counts;
      } catch(e) { /* Local history remains usable and unsent events retry next visit. */ }
      finally {busy=null;update();}
    })();return busy;
  }
  function bind(root) {
    root.querySelectorAll('.ending-stats').forEach(function(el){el.addEventListener('toggle',function(){if(el.open)sync();});});update();
  }
  window.addEventListener('online',sync);
  window.addEventListener('storage',function(e){if(e.key && e.key.indexOf(prefix)===0)update();});
  CC.endingStats={record:record,render:render,bind:bind,counts:counts,sync:sync};
})();
