const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('path'),fs=require('fs');
const site=require('url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=process.argv[2]||path.resolve(__dirname,'../../../full-assim-check');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({channel:'msedge'}),errs=[];
 async function page(seed={},width=1440,route='map',motion='reduce'){
  const p=await b.newPage({viewport:{width,height:1000},reducedMotion:motion});p.on('pageerror',e=>errs.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto(site+'#/gate');
  await p.evaluate(s=>localStorage.setItem('catharsis-0110-v1',JSON.stringify(Object.assign({authed:true,assim:0,clarity:0,flags:{},choices:{},seen:{}},s))),seed);await p.reload();await p.evaluate(r=>CC.go(r),route);return p;
 }
 let p=await page({assim:99},1440,'map','no-preference');await p.waitForTimeout(800);assert.equal(await p.locator('.assim-flower-eye').count(),0);
 await p.evaluate(()=>CC.state.add(1));assert.equal(await p.locator('.assim-flower-eye').count(),0);await p.waitForTimeout(3500);const first=await p.locator('.assim-flower-eye').count();assert(first>0);
 await p.waitForTimeout(25000);const count=await p.locator('.assim-flower-eye').count(),flowers=await p.locator('.tile--flower').count();assert.equal(count,Math.floor(flowers/2));
 assert.equal(await p.locator('.room--chapel').evaluate(e=>e.inert),true);assert.equal(await p.locator('.room--field').evaluate(e=>e.inert),false);assert.equal(await p.locator('.room--cathedral').evaluate(e=>e.inert),false);
 await p.locator('.tiles').screenshot({path:path.join(out,'eyes-map.png')});
 await p.evaluate(()=>CC.go('home'));assert.equal(await p.locator('body.full-assim-map').count(),0);assert.equal(await p.locator('.assim-melting').count(),0);await p.close();
 for(const width of [1440,390]){
  p=await page({flags:{bliss:true}},width,'home');assert.equal(await p.locator('.tab').count(),5);
  const boxes=await p.locator('.tab__head').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
  for(let i=1;i<5;i++)assert(boxes[i].y>=boxes[i-1].y+boxes[i-1].h,'arc buttons overlap');
  await p.locator('[data-tab=endings] .tab__head').hover();await p.locator('.ending-stats summary').click();await p.waitForTimeout(450);
  assert.equal(await p.locator('.ending-stats li').count(),4);assert.equal(await p.locator('.ending-stats__name').filter({hasText:'未解锁'}).count(),3);
  const panel=p.locator('[data-tab=endings] .tab__body');const rect=await panel.boundingBox();assert(rect.x>=0 && rect.x+rect.width<=width);assert.equal(await panel.evaluate(e=>getComputedStyle(e).opacity),'1');
  await panel.screenshot({path:path.join(out,'stats-'+width+'.png')});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await p.evaluate(()=>CC.endingStats.counts().bliss),1);await p.reload();assert.equal(await p.evaluate(()=>CC.endingStats.counts().bliss),1);
  await p.evaluate(()=>{CC.state.reset();CC.state.auth();CC.state.setFlag('bliss');CC.story.finish('bliss');});assert.equal(await p.evaluate(()=>CC.endingStats.counts().bliss),2);await p.close();
 }
 const c2={assim:100,flags:{'v02:peaceLock':true,'v02:hymnComplete':true,d4Report:true},choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY'}}};
 p=await page({assim:80,flags:{d4Report:true},choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY'}},seen:{'v02:hallWelcome':true,'v02:hallDevotion':true,'v02:hallKin':true}},1440,'map','no-preference');
 await p.locator('.room--hall').click();await p.locator('[data-act=hallPortrait]').click();assert.equal(await p.evaluate(()=>CC.state.assim),100);assert.equal(await p.locator('.is-assim-surrender').count(),0);
 await p.waitForTimeout(14000);assert.equal(await p.locator('.is-assim-surrender').count(),1);assert.equal(await p.locator('.is-assim-surrender .map-panel__fig img').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 assert.equal(await p.locator('.is-assim-surrender button:visible').count(),1);await p.locator('.is-assim-surrender').screenshot({path:path.join(out,'black-portrait.png')});
 await p.locator('[data-act=hallChurch]').click();await p.locator('.map-panel:not(.is-leaving) [data-act=church]').waitFor();assert(p.url().endsWith('#/map'));assert.equal(await p.locator('.map-panel:not(.is-leaving) img').getAttribute('src'),await p.evaluate(()=>CONTENT.map.cathedral.image));await p.close();
 for(const seed of [{flags:{d4Diamond:true}},c2,{flags:{bliss:true,'v02:reconnect':true,'v02:reentered':true,'v02:candleList':true,'v02:oldId':true,'v02:archiveDone':true,'v02:messageSent':true}}]){
  p=await page(seed,390,'ending');await p.locator('.ending-stats').waitFor();assert.equal(await p.locator('.cr__line').filter({hasText:'欢迎来到神国，双月的眷属。'}).count(),seed===c2?1:0);await p.locator('.ending-stats>summary').click();assert.equal(await p.locator('.ending-stats li').count(),4);assert.equal(await p.locator('.ending-stats__name').filter({hasText:'未解锁'}).count(),3);await p.close();
 }
 await b.close();assert.deepEqual(errs,[]);console.log('PASS 100-only map melt/growth/cleanup, five-entry arc, all four endings, unlocks, per-run dedup and reset persistence.');
})().catch(e=>{console.error(e);process.exit(1)});
