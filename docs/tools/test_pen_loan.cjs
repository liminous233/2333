// Local browser regression for the candle / DAY4 pen loan.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const site=require('node:url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
(async()=>{
 const browser=await chromium.launch({channel:'msedge'}), errors=[];
 try {
  for(const width of [1440,390]) {
   const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   p.on('pageerror',e=>errors.push(e.message));
   await p.route('https://**/*',r=>r.abort());
   await p.goto(site+'#/gate');
   await p.evaluate(()=>{CC.state.auth();CC.go('home');});
   await p.locator('.cover__start').click();await p.locator('.tiles').waitFor();
   await p.evaluate(()=>CC.go('evidence'));
   const pen=p.locator('[data-kind=pen]');
   async function put(){await p.locator('.lift__put').click();await p.locator('.lift--ev').waitFor({state:'detached'});}
   await pen.click();
   assert(!(await p.locator('.ev-cap').textContent()).includes('一天后'));
   await put();
   await p.locator('[data-kind=candle]').click();
   await p.locator('[data-choice=light]').click();await put();
   const score=await p.evaluate(()=>[CC.state.assim,CC.state.clarity]);
   for(let i=0;i<2;i++) {
    await pen.click();
    const text=await p.locator('.ev-cap').textContent();
    assert(text.includes('创造我道的一切。'));
    assert.equal(text.split('你的朋友将会在一天后借走它。').length-1,1);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await put();
   }
   assert.deepEqual(await p.evaluate(()=>[CC.state.assim,CC.state.clarity]),score);
   await p.evaluate(()=>CC.go('d4'));await p.locator('.d4-core').waitFor();
   assert.equal(await p.evaluate(()=>CC.state.flag('d4Report')),false);
   await p.evaluate(()=>CC.go('evidence'));await p.locator('[data-kind=candle]').waitFor();
   assert.equal(await pen.count(),0);
   await p.reload();await p.locator('[data-kind=candle]').waitFor();
   assert.equal(await pen.count(),0);
   assert.equal(await p.evaluate(()=>CC.items.lift('pen')),null);
   assert.deepEqual(await p.evaluate(()=>[CC.state.assim,CC.state.clarity]),score);
   for(const legacy of ['moon:4','d4Report','d4Diamond','v02:report']) {
    await p.evaluate(legacy=>{
     CC.state.reset();CC.state.auth();
     if(legacy==='moon:4')CC.state.once(legacy,0);
     else if(legacy==='v02:report')CC.state.putRecord(legacy,{route:'REPORT_BLACK'});
     else CC.state.setFlag(legacy);
    },legacy);
    assert.equal(await p.evaluate(()=>CC.items.has('pen')),false);
    if(legacy!=='d4Diamond') {
     await p.reload();await p.locator('[data-kind=candle]').waitFor();assert.equal(await pen.count(),0);
    }
   }
   await p.evaluate(()=>{CC.state.reset();CC.state.auth();});await p.reload();await pen.waitFor();
   await p.evaluate(()=>{CC.state.setFlag('d4Report');CC.go('home');});
   await p.locator('.cover__start').click();await p.locator('.tiles').waitFor();
   await p.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS pen hint after lighting, original prose, no repeat reward, DAY4 entry removal, persistence, legacy saves, reset, desktop/mobile.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
