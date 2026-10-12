const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const site=require('node:url').pathToFileURL(path.resolve(__dirname,'../../site/index.html')).href;
const out=path.resolve(__dirname,'../../../map-clue-layout');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({channel:'msedge'}),errors=[];
 async function page(width,height,route='map',report=false){const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.goto(site+'#/gate');await p.evaluate(report=>{CC.state.auth();if(report)CC.state.setFlag('d4Report');},report);await p.evaluate(route=>CC.go(route),route);return p;}
 for(const [width,height] of [[1920,930],[1440,900],[1000,768],[390,844]])for(const report of [false,true]){
  const p=await page(width,height,'map',report);let previousTop;
  for(const name of ['gate','studio','field','parlour','hall','dorm','chapel','bell','dining','cathedral']){
   await p.locator('.room--'+name).click();await p.waitForTimeout(600);await p.evaluate(()=>scrollTo(0,0));
   const panel=p.locator('.map-panel:not(.is-leaving)');
   if(width>860 && await panel.count()){
    const r=await panel.evaluate(e=>{const f=e.querySelector('img').getBoundingClientRect(),a=e.getBoundingClientRect(),t=document.querySelector('.welcome__en').getBoundingClientRect();return {top:f.top,bottom:f.bottom,h:f.height,pBottom:a.bottom,titleBottom:t.bottom};});
    assert(r.top>=r.titleBottom && r.top<=r.titleBottom+25,JSON.stringify({name,width,...r}));
    assert(r.pBottom<=height-25,JSON.stringify({name,width,height,...r}));
    if(previousTop!==undefined)assert(Math.abs(previousTop-r.top)<2);previousTop=r.top;
    if(width===1920&&!report&&['bell','dining','chapel'].includes(name))await p.locator('.grounds__welcome').screenshot({path:path.join(out,name+'.png')});
   }
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.keyboard.press('Escape');await p.waitForTimeout(420);
  }await p.close();
 }
 for(const width of [1440,390])for(const route of ['gate','evidence']){
  const p=await page(width,900,route);if(route==='gate')await p.locator('[data-obj=clue]').click();else await p.evaluate(()=>CC.items.lift('clue'));
  const ink=p.locator('.lift--clue .clue__ink'),original=await ink.innerHTML();await p.locator('[data-clue-language]').click();assert.equal(await ink.getAttribute('lang'),'zh-CN');assert((await ink.textContent()).includes('净化之路'));
  if(route==='evidence')await p.locator('.lift--clue .lift__item').screenshot({path:path.join(out,'clue-'+width+'.png')});
  await p.locator('[data-clue-language]').click();assert.equal(await ink.innerHTML(),original);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.close();
 }
 await b.close();assert.deepEqual(errors,[]);console.log('PASS fixed image top and viewport bounds across landscape/portrait and ten rooms, no mobile overflow, clue language toggle in gate and evidence.');
})().catch(e=>{console.error(e);process.exit(1)});
