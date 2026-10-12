// Pure state/route regression: no browser and no changes to real player saves.
const fs = require('fs'), vm = require('vm'), path = require('path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
function run(seed = {}) {
  let storage = JSON.stringify(seed);
  const body = { getAttribute(){return '0'}, setAttribute(){}, style:{setProperty(){}}, classList:{toggle(){}} };
  const c = { window:{CC:{},localStorage:{getItem(){return storage},setItem(k,v){storage=v},removeItem(){storage=null}}}, document:{body,dispatchEvent(){}}, CustomEvent:class{}, location:{search:''}, Math, console };
  vm.createContext(c);
  for(const f of ['data/content.js','js/state.js','js/story.js','js/story-ui.js']) vm.runInContext(fs.readFileSync(path.join(root,'site',f),'utf8'),c);
  return { S:c.window.CC.state, T:c.window.CC.story, UI:c.window.CC.storyUI, saved:()=>JSON.parse(storage), content:c.window.CONTENT };
}
for (const [n,route] of [[39,'REPORT_BLACK'],[40,'ANOMALY'],[49,'ANOMALY'],[50,'EARLY_MOON'],[51,'EARLY_MOON']]) {
  const {S,T,saved}=run({assim:n}); assert.equal(T.lockReport(),route); S.add(-30); assert.equal(T.lockReport(),route); assert.equal(run(saved()).T.route(),route);
}
for (const [flags,r] of [[{d4Report:true},'REPORT_BLACK'],[{d4Diamond:true},'EARLY_MOON']]) assert.equal(run({assim:45,flags}).T.lockReport(),r);
{
  const {S,T,UI,saved}=run({assim:49,clarity:2,flags:{forever:true},choices:{'ev:candle':'light'}});
  T.lockReport(); S.setFlag('d4Report'); assert(T.decision('reconnect')); assert.equal(S.assim,29); assert.equal(S.clarity,70); assert(!T.decision('reconnect')); assert(!T.decision('church'));
  assert(S.flag('forever')); assert.equal(S.choice('ev:candle'),'light'); assert.equal(T.guard('home'),'gate');
  S.setFlag('v02:reentered'); assert.equal(T.guard('church'),'map'); S.setFlag('v02:candleList'); assert(!T.hasEvidence()); S.setFlag('v02:oldId'); assert(T.hasEvidence());
  S.once('v02:present'); assert(!T.archiveReady()); S.once('v02:discuss'); assert(T.archiveReady()); S.setFlag('v02:archiveDone'); assert(!T.infinity()); S.setFlag('v02:messageSent'); assert(T.infinity());
  assert.equal(T.oldName(),run(saved()).T.oldName()); const result=T.finish('infinity'); S.add(60); assert.equal(T.finish('peace').assim,result.assim); assert.equal(result.total,10);
  assert(UI.recapText(result).includes('拿出证物')); assert(UI.recapText(result).includes('异神极乐 [∞]')); assert(!UI.recapText(result).includes('v02:'));
}
{
 const {S,T}=run({assim:45,clarity:99}); T.lockReport(); S.setFlag('d4Report'); T.decision('embrace'); assert(S.flag('v02:night'));
 S.once('large',{assim:200,clarity:200}); assert.equal(S.assim,100); assert.equal(S.clarity,100); S.once('small',{assim:-200,clarity:-200}); assert.equal(S.assim,100); assert.equal(S.clarity,0);
 S.choose('prayer','eyes',{assim:2}); assert(!S.choose('prayer','continue',{assim:10})); assert.equal(S.assim,100);
 S.reset(); assert.equal(T.route(),''); assert.equal(S.record('v02:report'),undefined);
}
// Every score mutation observes the C2-only 99 floor, including restored saves.
const c2={choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY',assim:45}},flags:{d4Report:true}};
for(const start of [98,99,100]) for(const mutate of [s=>s.add(-10),s=>s.once('loss',-10),s=>s.upTo('loss',2,-10),s=>s.choose('loss','yes',{assim:-10}),s=>s.settle('loss',{assim:-10})]) {
 const {S,saved}=run({...c2,assim:start});mutate(S);assert.equal(S.assim,start>=99?start:start-10);assert.equal(run(saved()).S.assim,S.assim);
}
for(const seed of [{},{records:{'v02:report':{route:'EARLY_MOON'}}},{...c2,choices:{'v02:d4':'church'}},{...c2,flags:{'v02:reconnect':true}}]) {
 const {S,T}=run({...seed,assim:100});S.add(-10);assert.equal(S.assim,90);assert(!T.peaceVariant());
}
{
 const {S,T,UI,saved}=run({...c2,assim:98,clarity:70});S.add(1);S.add(-99);assert.equal(S.assim,99);assert(!T.peaceVariant());S.add(1);assert(T.peaceVariant());
 assert.equal(T.guard('map'),'map');assert.equal(T.guard('ending'),'church');
 S.settle('v02:hallPortrait',{assim:20,claritySet:0});assert.equal(S.assim,100);assert.equal(S.clarity,0);assert(!S.settle('v02:hallPortrait',{assim:20,claritySet:0}));
 S.setFlag('v02:hymnComplete');const result=T.finish('peace');assert.equal(result.variant,'overline-v');assert(UI.recapText(result).includes('永归宁国【V̅】'));assert(run(saved()).T.peaceVariant());
 S.reset();assert.equal(S.assim,0);assert(!T.peaceVariant());
}
console.log('PASS: boundaries, old saves, route persistence, reconnect once, all task gates, score clamps, ending snapshots, 10 locations, reset.');
