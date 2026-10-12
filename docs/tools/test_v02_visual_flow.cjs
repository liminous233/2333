const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const site=require('url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=process.argv[2]||path.resolve(__dirname,'../../../v02-visual-flow');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge'}),errors=[];
 async function page(seed={},route='map',width=1440,reduce=true){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:reduce?'reduce':'no-preference'});p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
  await p.goto(site+'#/gate');await p.evaluate(s=>localStorage.setItem('catharsis-0110-v1',JSON.stringify(Object.assign({assim:0,clarity:0,authed:true,flags:{},choices:{},seen:{}},s))),seed);await p.reload();await p.evaluate(r=>CC.go(r),route);await p.waitForTimeout(650);return p;
 }
 for(const width of [1440,1000]){
  const p=await page({flags:{d4Report:true}},'map',width);await p.locator('.room--parlour').click();await p.waitForTimeout(700);
  async function bounded(){const r=await p.evaluate(()=>{const a=document.querySelector('.grounds__welcome').getBoundingClientRect(),b=document.querySelector('.map-panel').getBoundingClientRect(),t=document.querySelector('.welcome__en').getBoundingClientRect();return {a:{top:a.top,bottom:a.bottom,right:a.right},b:{top:b.top,bottom:b.bottom,right:b.right},titleBottom:t.bottom};});assert(r.b.top>=r.titleBottom);assert(r.b.bottom<=r.a.bottom+1);assert(Math.abs(r.b.right-r.a.right)<2);return r;}
  const first=await bounded();await p.evaluate(()=>scrollTo(0,150));const second=await bounded();assert(Math.abs((second.b.top-first.b.top)-(second.a.top-first.a.top))<2);await p.evaluate(()=>scrollTo(0,0));await p.locator('.grounds__welcome').screenshot({path:path.join(out,'welcome-'+width+'.png')});await p.close();
 }
 for(const width of [390,1440]){
  const p=await page({flags:{bliss:true}},'home',width);const heads=p.locator('.tab__head');assert.equal(await heads.count(),5);
  const boxes=await heads.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));assert(boxes[0].x<boxes[1].x&&boxes[4].x<boxes[3].x);for(let i=1;i<5;i++)assert(boxes[i].y>boxes[i-1].y+boxes[i-1].h);
  for(let i=0;i<5;i++){await heads.nth(i).focus();await heads.nth(i).press('Enter');assert.equal(await p.locator('.tab.is-open').count(),1);await heads.nth(i).press('Enter');}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('.cover__right').screenshot({path:path.join(out,'sun-arc-'+width+'.png')});await p.close();
 }
 const anomaly={assim:45,flags:{d4Report:true,'v02:night':true},choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY',assim:45}}};
 let p=await page(anomaly,'map');await p.locator('.room--cathedral').click();await p.locator('[data-act=church]').click();await p.locator('[data-act=yes]').click();await p.waitForURL('**#/church');assert.equal(await p.locator('.credits').count(),0);assert.equal(await p.locator('.v02-hymn-noise').count(),0);
 await p.evaluate(()=>CC.go('ending'));await p.waitForTimeout(250);assert(p.url().endsWith('#/church'));
 await p.locator('#chJoin').click();await p.locator('.is-idol .v02-hymn-noise').waitFor();assert(await p.locator('.v02-hymn-noise').evaluate(c=>c.getContext('2d').getImageData(0,0,20,20).data.some(x=>x>0)));await p.waitForTimeout(3300);await p.locator('.ch').screenshot({path:path.join(out,'hymn-noise.png')});
 await p.locator('.ch__go').click();await p.waitForURL('**#/ending');assert.equal(await p.locator('.v02-hymn-noise').count(),0);await p.close();
 const infinity={flags:{d4Report:true,'v02:reconnect':true,'v02:reentered':true,'v02:candleList':true,'v02:oldId':true,'v02:archiveDone':true,'v02:messageSent':true}};
 p=await page(infinity,'ending',1440,false);assert.equal(await p.locator('.cr__infinity .v02-cn').textContent(),await p.evaluate(()=>CONTENT.v02.infinityTextZh));
 const h=await p.locator('.cr__infinity').evaluate(e=>e.offsetHeight);for(let i=0;i<12;i++){await p.waitForTimeout(110);assert.equal(await p.locator('.cr__infinity').evaluate(e=>e.offsetHeight),h);assert(await p.locator('.cr__title .v02-bilingual').evaluate(e=>Array.from(e.children).filter(c=>getComputedStyle(c).visibility==='visible').length===1));}await p.close();
 p=await page({flags:{'v02:reconnect':true}},'gate');assert.equal(await p.locator('.v02-return').count(),0);await p.close();
 p=await page({assim:45},'d4',1440,false);await p.locator('.d4-core').click();await p.locator('.d4-sheet').waitFor();await p.locator('.d4-sheet').click();await p.locator('.d4-done').waitFor();await p.locator('.d4-done').click();await p.locator('.bub').last().click();
 const blue=p.locator('.bub--wei').first();await blue.hover();await p.waitForTimeout(600);assert.equal(await p.locator('.v02-downflow,.v02-ink-trails,.v02-ink-cross').count(),0);assert(await blue.evaluate(e=>e.classList.contains('v02-empty-melt')));
 await blue.click();assert.equal(await p.locator('.bub').count(),3);await p.locator('.bub').last().click();const letters=p.locator('.bub--wei').last().locator('.v02-melt-letters>span');await letters.first().waitFor();await p.waitForTimeout(2400);assert(await letters.first().evaluate(e=>getComputedStyle(e).animationName==='dining-melt'));
 await p.locator('.d4-chat').screenshot({path:path.join(out,'flowing-letters.png')});await p.locator('[data-route-choice=reconnect]').click();await p.locator('#authBtn').waitFor();assert.equal(await p.locator('.v02-chat-melt-defs').count(),0);await p.close();

 await browser.close();assert.deepEqual(errors,[]);console.log('PASS dock bounds and scrolling, black-sun arc, flowing letters without straight trails and clickable messages, hymn before credits, scoped noise, synchronized bilingual paragraph, one welcome.');
})().catch(e=>{console.error(e);process.exit(1)});
