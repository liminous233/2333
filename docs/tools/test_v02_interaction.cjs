const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const site=require('url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=process.argv[2]||path.resolve(__dirname,'../../../v02-test'); fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({channel:process.env.TEST_BROWSER||'msedge',args:['--allow-file-access-from-files','--enable-unsafe-swiftshader']}); const errors=[];
 async function page(seed={},route='map',touch=true,reduce=true){
  const p=await b.newPage({viewport:{width:touch?390:1440,height:844},hasTouch:touch,reducedMotion:reduce?'reduce':'no-preference'});
  p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
  if(process.env.THREE_TEST_FILE) await p.route('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js',r=>r.fulfill({path:process.env.THREE_TEST_FILE,contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
  await p.goto(site+'#/gate');
  await p.evaluate(s=>localStorage.setItem('catharsis-0110-v1',JSON.stringify(Object.assign({assim:0,clarity:0,authed:true,flags:{},seen:{},choices:{}},s))),seed);await p.reload();await p.goto(site+'#/'+route);return p;
 }
 async function go(p,r){await p.evaluate(r=>CC.go(r),r);await p.waitForURL('**#/'+r);await p.locator('#app>section').waitFor();}
 async function touch(p,sel){const r=await p.locator(sel).boundingBox();await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}
 async function act(p,a){await p.locator('.map-panel:not(.is-leaving) [data-act='+a+']').click();}
 async function close(p){await p.keyboard.press('Escape');await p.waitForTimeout(450);}
 for(const report of [false,true]){
  const p=await page({flags:report?{d4Report:true}:{}});
  for(const name of ['gate','studio','field','parlour','hall','dorm','chapel','bell','dining','cathedral']){
   await p.locator('.room--'+name).click(); assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const panel=p.locator('.map-panel:not(.is-leaving)'); if(await panel.count()){const r=await panel.boundingBox();assert(r.y>=-1,name+' panel top out of view');}
   if(name==='chapel') assert.equal(await panel.locator('img').getAttribute('src'),await p.evaluate(report=>report?CONTENT.map.chapel.day6.image:CONTENT.map.chapel.image,report));
   if(name==='bell'){await act(p,'up');await act(p,'gaze');assert.equal(await p.locator('.map-panel__text').getAttribute('aria-label'),await p.evaluate(report=>report?CONTENT.map.bell.day5.gazeText:CONTENT.map.bell.gazeText,report));}
   await close(p);
  } await p.close();
 }
 console.log('PASS 390px original and red maps, including remote chapel/gaze updates');
 let p=await page({},'home');await touch(p,'.party');assert.equal(await p.locator('.party').getAttribute('aria-expanded'),'true');await touch(p,'.party');assert.equal(await p.locator('.party').getAttribute('aria-expanded'),'false');await touch(p,'.party');await p.touchscreen.tap(8,8);assert.equal(await p.locator('.party').getAttribute('aria-expanded'),'false');await p.close();
 p=await page({},'gate');await touch(p,'.letter');assert(await p.locator('.letter').evaluate(e=>e.classList.contains('is-flash')));await touch(p,'.letter');assert(!(await p.locator('.letter').evaluate(e=>e.classList.contains('is-flash'))));assert(await p.evaluate(()=>!document.querySelector('[data-crumple]') || document.querySelector('[data-crumple]').getAttribute('data-crumple')==='restored'));
 await p.locator('[data-obj=card]').click();await p.locator('.lift__card').waitFor();await touch(p,'.lift__card');assert(await p.locator('.lift__card').evaluate(e=>e.classList.contains('v02-zh')));assert.equal(await p.locator('.lift__card').getAttribute('aria-pressed'),'false');await touch(p,'[data-flip]');assert.equal(await p.locator('.lift__card').getAttribute('aria-pressed'),'true');await touch(p,'.lift__card');assert(!(await p.locator('.lift__card').evaluate(e=>e.classList.contains('v02-zh'))));await p.close();
 console.log('PASS touch tooltip, paper tap and independent card language/flip');
 if(process.env.THREE_TEST_FILE){
  p=await page({},'gate',true,false);await p.waitForTimeout(3500);const r=await p.locator('.letter').boundingBox();const cdp=await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});await p.waitForTimeout(1500);
  assert.equal(await p.locator('[data-crumple]').getAttribute('data-crumple'),'holding');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(1200);assert.notEqual(await p.locator('[data-crumple]').getAttribute('data-crumple'),'holding');await p.close();console.log('PASS touch long press reaches the original 3D paper effect');
 }
 p=await page({},'evidence',false,false);await p.locator('[data-kind=card]').click();await p.waitForTimeout(900);await p.locator('.lift__card').hover({force:true});await p.waitForTimeout(1600);assert(await p.locator('.lift__card').evaluate(e=>e.classList.contains('v02-zh')));await p.mouse.move(3,3);assert(!(await p.locator('.lift__card').evaluate(e=>e.classList.contains('v02-zh'))));await p.close();
 const anomaly={assim:45,flags:{d4Report:true,'v02:night':true},choices:{'v02:d4':'embrace'},records:{'v02:report':{route:'ANOMALY',assim:45}}};
 p=await page(anomaly,'map',true,false);await p.locator('.room--dorm').click();await act(p,'enter');await act(p,'pray');assert(await p.locator('.dining-melt .scr__c').count()>30);await p.waitForTimeout(2500);assert.notEqual(await p.locator('.dining-melt .scr__c').first().evaluate(e=>getComputedStyle(e).transform),'none');await p.locator('.map-panel').screenshot({path:path.join(out,'night-motion-mobile.png')});await act(p,'evidence');await p.locator('[data-kind=card]').click();assert(await p.locator('.v02-card-en .idc__backtext').textContent().then(t=>t.includes('Lord, I am here')));await p.close();
 p=await page({assim:45},'d4',true,false);await p.locator('.d4-core').click();await p.locator('.d4-sheet').waitFor();await touch(p,'.d4-sheet');await p.locator('.d4-done').waitFor();await p.locator('.d4-done').click();for(let i=0;i<3;i++)await p.locator('.bub').last().click();await p.locator('[data-route-choice=church]').waitFor();await p.waitForTimeout(3000);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('.d4-log').screenshot({path:path.join(out,'anomaly-motion-mobile.png')});await p.locator('[data-route-choice=church]').click();await p.waitForURL('**#/ending');await p.evaluate(()=>CC.go('map'));await p.waitForTimeout(400);assert(p.url().endsWith('#/ending'));assert.equal(await p.locator('.back-arrow').count(),0);await p.close();
 console.log('PASS real flowing/scrambled animation, night ID variant, direct peace lock');
 p=await page({flags:{bliss:true,d4Report:true}},'home');await p.locator('[data-tab=review] .tab__head').focus();await p.locator('[data-tab=review] .tab__head').press('Enter');const review=p.locator('[data-tab=review] .tab__body');assert(await review.isVisible());await p.locator('[data-copy-review]').click();await p.waitForFunction(()=>document.querySelector('.v02-copy-status').textContent.length>0);assert(await p.locator('.v02-copy-status').textContent().then(t=>t.length>0));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await review.screenshot({path:path.join(out,'review-mobile.png')});await p.close();
 p=await page({flags:{d4Diamond:true}},'ending',false,false);const title=p.locator('.cr__title');const h1=await title.evaluate(e=>e.offsetHeight);const initial=await p.locator('#app').evaluate(e=>e.classList.contains('v02-credits-zh'));await p.waitForTimeout(1050);assert.notEqual(await p.locator('#app').evaluate(e=>e.classList.contains('v02-credits-zh')),initial);assert.equal(await title.evaluate(e=>e.offsetHeight),h1);await p.close();
 await b.close();assert.deepEqual(errors,[]);console.log('PASS copy fallback, mobile review and stable one-second bilingual credits');
})().catch(e=>{console.error(e);process.exit(1)});
