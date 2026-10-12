// Local static-site integration tests. Usage: node test_v02_browser.cjs OUTPUT_DIR
const {chromium}=require('playwright'), assert=require('node:assert/strict'), path=require('path'), fs=require('fs');
const site=require('url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=process.argv[2] || path.resolve(__dirname,'../../../v02-test'); fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({channel:process.env.TEST_BROWSER || 'msedge',args:['--allow-file-access-from-files','--enable-unsafe-swiftshader']});
const errors=[];
async function start(seed={}, width=1440, route='map', motion='reduce') {
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:motion,hasTouch:width===390});
 p.on('pageerror',e=>errors.push(e.message)); await p.route('https://**/*',r=>r.abort());
 await p.goto(site+'#/gate');
 await p.evaluate(seed=>localStorage.setItem('catharsis-0110-v1',JSON.stringify(Object.assign({assim:0,clarity:0,authed:true,flags:{},seen:{},choices:{}},seed))),seed);
 await p.reload(); await p.goto(site+'#/'+route); await p.locator('#app > section').waitFor(); return p;
}
async function room(p,name){await p.keyboard.press('Escape'); await p.waitForTimeout(450); await p.locator('.room--'+name).click();}
async function act(p,name){await p.locator('.map-panel:not(.is-leaving) [data-act="'+name+'"]').click();}
async function score(p){return p.evaluate(()=>[CC.state.assim,CC.state.clarity]);}
async function overflow(p){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');}
const report={authed:true,assim:20,flags:{d4Report:true}};
for(const seed of [{},report]) {
 const p=await start(seed);
 for(const name of ['gate','studio','field','parlour','hall','dorm','chapel','bell','dining','cathedral']) {await room(p,name); assert(await p.locator('.map-panel:not(.is-leaving),.map-card:not(.is-leaving)').count());}
 await room(p,'dining'); await act(p,'forward'); await p.waitForTimeout(500);
 assert.equal(await p.locator('.map-panel__fig img').last().getAttribute('src'), await p.evaluate(report=>report?CONTENT.map.dining.clothImage:CONTENT.map.dining.girlImage,!!seed.flags));
 await overflow(p); await p.close();
}
let p=await start(report,390);
await room(p,'studio'); await act(p,'down'); assert(!(await p.evaluate(()=>CC.state.flag('v02:studioLocked'))));
await act(p,'hide'); const once=await score(p); await act(p,'hide'); assert.deepEqual(await score(p),once);
await act(p,'search'); await p.locator('.v02-object-overlay').waitFor(); await overflow(p); await p.locator('.v02-object-wrap').screenshot({path:path.join(out,'candle-list-mobile.png')}); await p.locator('.v02-object-close').click();
await act(p,'down'); assert(!(await p.evaluate(()=>CC.state.flag('v02:studioLocked')))); await act(p,'exit'); assert(await p.evaluate(()=>CC.state.flag('v02:studioLocked')));
await room(p,'parlour'); await act(p,'take'); await p.locator('[data-flip]').click(); await p.waitForTimeout(50); await p.locator('[data-language]').click(); await overflow(p); await p.locator('.v02-object-wrap').screenshot({path:path.join(out,'old-id-mobile.png')}); await p.locator('.v02-object-close').click();
const beforeOriginalRewards=await score(p); await room(p,'hall'); await room(p,'bell'); await act(p,'up'); await act(p,'archive'); await act(p,'open'); assert.equal((await score(p))[1],beforeOriginalRewards[1]+2,'new scenes must not consume original hall/archive rewards'); await p.close();
const anomaly={assim:45,flags:{d4Report:true,'v02:night':true},choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY',assim:45}}};
p=await start(anomaly,390);
await room(p,'dorm'); await act(p,'enter'); await act(p,'pray'); assert.equal((await score(p))[0],60); await p.locator('.map-panel:not(.is-leaving)').screenshot({path:path.join(out,'night-prayer-mobile.png')});
await room(p,'dorm'); await act(p,'enter'); await act(p,'pray'); assert.equal((await score(p))[0],60);
await room(p,'chapel'); await act(p,'pray'); await act(p,'eyes'); const v=await score(p); await room(p,'chapel'); await act(p,'pray'); assert.equal(await p.locator('[data-act=continue]').count(),0); assert.deepEqual(await score(p),v);
await room(p,'dining'); await act(p,'forward'); assert.equal(await p.locator('[data-act=forward]').count(),0); await p.locator('.v02-girl-head').click(); assert(await p.locator('.map-panel__text').last().textContent().then(t=>t.includes('你干什么'))); await overflow(p); await p.close();
p=await start({assim:45},1440,'d4'); await p.locator('.d4-core').click(); await p.locator('.d4-done').waitFor(); await p.locator('.d4-done').click();
for(let i=0;i<3;i++)await p.locator('.bub').last().click(); await p.locator('[data-route-choice=reconnect]').waitFor();
await p.locator('.d4-log').screenshot({path:path.join(out,'abnormal-messages.png')});
await p.locator('[data-route-choice=reconnect]').click(); await p.locator('.v02-return').waitFor(); assert.equal((await score(p))[0],25);
// Actual gate authorization uses the existing button, with no resetting the save.
await p.locator('#authBtn').click(); await p.waitForURL('**#/home');
await p.evaluate(()=>CC.go('map')); await p.locator('.tiles').waitFor();
await room(p,'gate'); assert(await p.locator('.map-panel__text').last().textContent().then(t=>t.includes('尚未开放')));
await room(p,'studio'); await act(p,'search'); await p.locator('.v02-object-close').click();
await room(p,'parlour'); await act(p,'take'); await p.locator('.v02-object-close').click();
await room(p,'bell'); await act(p,'up'); await act(p,'archive'); await act(p,'present'); assert.equal(await p.locator('[data-act=solve]').count(),0); await act(p,'discuss'); await act(p,'solve');
await room(p,'gate'); await act(p,'action'); await act(p,'journal'); await p.waitForURL('**#/journal');
await p.evaluate(()=>CC.go('church')); await p.locator('#chJoin').click(); await p.locator('.ch__last').waitFor(); await p.locator('.ch__last').click(); await p.waitForURL('**#/ending'); await p.locator('.v02-end-review a').waitFor();
assert(await p.locator('.cr__infinity').textContent().then(t=>t.includes('not necessarily a blessing'))); await p.locator('.v02-end-review a').click(); await p.waitForURL('**#/home');
await p.locator('[data-tab=review] .tab__head').focus(); await p.locator('[data-tab=review] .tab__head').press('Enter'); assert(await p.locator('.v02-review pre').textContent().then(t=>t.includes('[∞]'))); await p.locator('[data-tab=review] .tab__body').screenshot({path:path.join(out,'infinity-review.png')}); await p.close();
p=await start({assim:50},390,'d4'); await p.locator('.d4-core').click(); await p.locator('.d4-over').waitFor(); assert.equal(await p.locator('.back-arrow').count(),0); await p.locator('.d4-over').click(); await p.waitForTimeout(450); await p.locator('.d4-over').click(); await p.locator('#chJoin').click(); await p.locator('.ch__go').waitFor(); await p.locator('.ch__go').click(); await p.locator('.v02-end-review summary').waitFor(); await p.locator('.v02-end-review summary').click(); await overflow(p); await p.locator('.v02-end-review').screenshot({path:path.join(out,'peace-review-mobile.png')}); await p.close();
await browser.close(); assert.deepEqual(errors,[]); console.log('PASS browser routes, original maps, task gates, awards, endings, mobile overflow; screenshots: '+out);
})().catch(e=>{console.error(e);process.exit(1)});
