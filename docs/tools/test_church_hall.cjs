const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const site=require('node:url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=path.resolve(__dirname,'../../../church-hall-check');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge'}),errors=[];
 async function page(seed={},route='journal',width=1440){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());
  await p.goto(site+'#/gate');await p.evaluate(s=>localStorage.setItem('catharsis-0110-v1',JSON.stringify({authed:true,assim:0,flags:{},seen:{},choices:{},...s})),seed);await p.reload();await p.evaluate(r=>CC.go(r),route);await p.waitForURL('**#/'+route);return p;
 }
 let p=await page();
 // Keyboard activation avoids the one-second pointer hover opening/closing the popover.
 await p.locator('.sky__moon[data-n="5"]').focus();await p.keyboard.press('Enter');
 assert.equal(await p.locator('.sky__nope:not(.is-leaving)').textContent(),'未到开放时间');assert.equal(await p.locator('.sky__pop a[href="#/church"]').count(),0);assert(!(await p.evaluate(()=>CC.state.seen('moon:5'))));
 await p.locator('.sky__nope:not(.is-leaving)').screenshot({path:path.join(out,'church-locked.png')});
 for(const route of ['church','ending']){await p.evaluate(r=>CC.go(r),route);await p.waitForTimeout(300);assert(p.url().endsWith('#/journal'));assert.equal(await p.locator('.sky__nope:not(.is-leaving)').textContent(),'未到开放时间');assert.equal(await p.locator('#chJoin').count(),0);}
 await p.evaluate(()=>{for(let i=1;i<=4;i++)CC.state.once('moon:'+i);});await p.reload();await p.locator('.sky__moon[data-n="5"]').focus();await p.keyboard.press('Enter');await p.locator('.sky__pop a[href="#/church"]').click();await p.locator('#chJoin').waitFor();await p.close();
 // Fresh report classification happens after effects mount. The ordinary blue messages must stay still even on hover.
 p=await page({assim:20},'d4');await p.locator('.d4-core').click();await p.locator('.d4-done').click();
 for(let i=0;i<3;i++)await p.locator('.bub').last().click();await p.locator('.d4-to-church').waitFor();
 for(const bubble of await p.locator('.bub--wei').all()){await bubble.hover();await p.waitForTimeout(100);assert.equal(await p.locator('.v02-text-flow,.v02-melt-letters,.v02-empty-melt,.v02-downflow,.v02-ink-trails').count(),0);}
 assert.equal(await p.evaluate(()=>CC.story.route()),'REPORT_BLACK');await p.locator('.d4-to-church').click();await p.locator('#chJoin').waitFor();assert(await p.evaluate(()=>CC.state.flag('v02:churchFromReport')));await p.close();
 for(const width of [1440,390]){
  p=await page({assim:20,clarity:0,flags:{d4Report:true}},'map',width);await p.locator('.room--hall').click();
  const current=()=>p.locator('.map-panel:not(.is-leaving)');
  assert.equal(await current().locator('.map-panel__day').textContent(),'DAY 6');assert((await current().locator('.map-panel__text').textContent()).includes('座下修士们面面相觑'));
  assert.equal(await p.evaluate(()=>CC.state.assim),17);assert.equal(await p.evaluate(()=>CC.state.clarity),1);
  assert((await current().locator('img').getAttribute('src')).endsWith('c2-hall.png'));
  await current().locator('[data-act=listen]').click();assert.equal(await current().locator('.map-panel__day').textContent(),'DAY 7');assert.equal(await current().locator('.map-panel__text').textContent(),'审判团再次前来，仅主教一人接待。');
  await current().locator('[data-act=tribunalLeave]').click();assert.equal(await p.locator('.hall-message').count(),1);
  await p.locator('.hall-messages').click({position:{x:5,y:5}});assert.equal(await p.locator('.hall-messages').count(),1);
  await p.waitForTimeout(1050);assert.equal(await p.locator('.hall-message').count(),2);await p.waitForTimeout(1000);assert.equal(await p.locator('.hall-message').count(),3);
  assert.deepEqual(await p.locator('.hall-message').allTextContents(),['他们打算封停唱诗院。','我倒是好奇你们说了什么。','让他们明天来看大戏....这是我们原本的计划，不是么？']);
  const positions=await p.locator('.hall-message').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,animation:getComputedStyle(e).animationName,blue:e.classList.contains('hall-message--blue')})));
  assert.deepEqual(positions.map(x=>x.blue),[false,true,false]);assert(positions[1].x<positions[0].x);assert(positions.every(x=>x.animation==='map-chat-in'));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.waitForTimeout(600);await p.locator('.hall-messages').screenshot({path:path.join(out,'hall-chat-'+width+'.png')});
  await p.locator('.hall-message').first().click();assert.equal(await p.locator('.hall-messages').count(),1);await p.locator('.hall-messages').click({position:{x:5,y:5}});assert.equal(await p.locator('.hall-messages').count(),0);
  await p.locator('.room--hall').click();assert.equal(await p.evaluate(()=>CC.state.assim),17);assert.equal(await current().locator('.map-panel__day').textContent(),'DAY 7');await current().locator('[data-act=tribunalLeave]').click();await p.evaluate(()=>CC.go('journal'));await p.waitForTimeout(2200);assert.equal(await p.locator('.hall-messages').count(),0);await p.close();
 }
 await browser.close();assert.deepEqual(errors,[]);console.log('PASS church gates and explicit report entry; REPORT_BLACK static bubbles; DAY6/7 hall awards and timed messages; cleanup and mobile bounds.');
})().catch(e=>{console.error(e);process.exit(1)});
