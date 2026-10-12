// C2 hall progression, saved awards, saturation, and the additive E1 variant.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const site=require('url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=process.argv[2]||path.resolve(__dirname,'../../../c2-hall-check');fs.mkdirSync(out,{recursive:true});
const c2={assim:45,clarity:60,flags:{d4Report:true,'v02:night':true},choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY',assim:45}}};
(async()=>{
 const browser=await chromium.launch({channel:'msedge'}),errors=[];
 async function page(seed,width=1440,route='map',motion='reduce'){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:motion});p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
  await p.goto(site+'#/gate');await p.evaluate(s=>localStorage.setItem('catharsis-0110-v1',JSON.stringify(Object.assign({authed:true,assim:0,flags:{},choices:{},seen:{}},s))),seed);await p.reload();await p.evaluate(r=>CC.go(r),route);return p;
 }
 async function act(p,name){await p.locator('.map-panel:not(.is-leaving) [data-act='+name+']').click();}
 async function score(p,n){assert.equal(await p.evaluate(()=>CC.state.assim),n);assert(p.url().endsWith('#/map'));}
 for(const width of [1440,390]){
  const p=await page(c2,width);await p.locator('.room--dorm').click();await act(p,'enter');await act(p,'pray');await score(p,60);
  await p.keyboard.press('Escape');await p.waitForTimeout(450);await p.locator('.room--hall').click();await score(p,65);
  assert.equal(await p.locator('.map-panel__text').textContent(),'你作为游客却早早地融入了这里');
  assert((await p.locator('.map-panel__fig img').getAttribute('src')).endsWith('c2-hall.png'));
  await act(p,'hallEnter');await score(p,75);await act(p,'hallNext');await score(p,90);
  // Reloading resumes this exact stage without replaying the first two rewards.
  await p.reload();await p.locator('.room--hall').click();await score(p,90);assert(await p.locator('[data-act=hallPortrait]').count());
  await act(p,'hallPortrait');await score(p,100);assert.equal(await p.evaluate(()=>CC.state.clarity),0);
  await p.waitForTimeout(120);assert((await p.locator('.map-panel__fig img').getAttribute('src')).endsWith('c2-portrait.png'));
  assert.equal(await p.locator('.map-panel__text').textContent(),'欢迎回家  ——致你。');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.locator('.map-panel:not(.is-leaving)').screenshot({path:path.join(out,'portrait-'+width+'.png')});
  await p.evaluate(()=>CC.state.choose('v02:prayer','eyes',CONTENT.v02.delta.eyes));await score(p,100);
  await act(p,'hallChurch');await p.waitForURL('**#/church');await p.locator('#chJoin').click();await p.locator('.ch__holy.is-in').waitFor();
  assert.equal(await p.locator('.ch__holy').textContent(),'祂的面容愈发清晰，你的灵魂销于地狱。');await p.locator('.is-idol .v02-hymn-noise').waitFor();
  await p.locator('.ch__holy').screenshot({path:path.join(out,'variant-text-'+width+'.png')});
  await p.locator('.ch__go').click();await p.waitForURL('**#/ending');await p.locator('.v02-end-review').waitFor();
  assert.equal(await p.locator('.v02-hymn-noise').count(),0);assert.equal(await p.evaluate(()=>CC.state.record('v02:ending').variant),'overline-v');
  assert((await p.locator('.cr__sub').textContent()).includes('永归宁国【V̅】'));
  await p.locator('.v02-end-review > details:not(.ending-stats) > summary').click();assert((await p.locator('.v02-review pre').textContent()).includes('永归宁国【V̅】'));
  await p.reload();assert((await p.locator('.cr__sub').textContent()).includes('永归宁国【V̅】'));await p.close();
 }
 // No night prayer: 45 + 50 = 95 still uses ordinary E1, even with the portrait.
 let p=await page(c2);await p.locator('.room--hall').click();for(const a of ['hallEnter','hallNext','hallPortrait'])await act(p,a);await score(p,95);
 await act(p,'hallChurch');await p.locator('#chJoin').click();await p.locator('.ch__holy.is-in').waitFor();assert.equal(await p.locator('.ch__holy').textContent(),await p.evaluate(()=>CONTENT.church.holyText));await p.close();
 // C2 at 100 via other activities also selects the variant, without forcing map exit.
 p=await page({...c2,assim:100});assert(p.url().endsWith('#/map'));await p.evaluate(()=>CC.go('ending'));await p.waitForURL('**#/church');await p.locator('#chJoin').click();await p.locator('.ch__holy.is-in').waitFor();assert((await p.locator('.ch__holy').textContent()).includes('地狱'));await p.close();
 for(const seed of [{},{flags:{d4Report:true}},{...c2,choices:{'v02:d4':'reconnect'},flags:{'v02:reconnect':true,'v02:reentered':true}}]){
  p=await page(seed);await p.locator('.room--hall').click();assert.equal(await p.locator('[data-act=hallEnter]').count(),0);await p.close();
 }
 p=await page({assim:100,flags:{d4Diamond:true}},1440,'church');await p.locator('#chJoin').click();await p.locator('.ch__holy.is-in').waitFor();assert.equal(await p.locator('.ch__holy').textContent(),await p.evaluate(()=>CONTENT.church.holyText));await p.close();
 await browser.close();assert.deepEqual(errors,[]);console.log('PASS C2 hall stages, scores and resume; 99 lock; explicit church entry; E1 variant and original endings; mobile bounds.');
})().catch(e=>{console.error(e);process.exit(1)});
