// All writes stay in an in-memory SQLite database; never sends test events to production.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {DatabaseSync}=require('node:sqlite'),{randomUUID}=require('node:crypto'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'../..'),db=new DatabaseSync(':memory:');
 db.exec(fs.readFileSync(path.join(__dirname,'ending-stats-schema.sql'),'utf8'));
 const {onRequest}=await import(pathToFileURL(path.join(root,'functions/api/ending-stats.js')));
 const env={ENDING_DB:{prepare(sql){
  const stmt=db.prepare(sql);
  return {
   bind(...args){return {async run(){return stmt.run(...args);}};},
   async all(){return {results:stmt.all()};}
  };
 }}};
 const origin='https://test.example',id=randomUUID();
 async function api(method='GET',event,source=origin){return onRequest({env,request:new Request(origin+'/api/ending-stats',{method,headers:{Origin:source,'Content-Type':'application/json'},body:method==='POST'?JSON.stringify(event):undefined})});}
 assert.equal((await api('POST',{id,kind:'peace'})).status,200);
 assert.equal((await api('POST',{id,kind:'peace'})).status,200);
 assert.equal((await api('POST',{id,kind:'infinity'})).status,200);
 assert.equal((await api('POST',{id:randomUUID(),kind:'bad'})).status,400);
 assert.equal((await api('POST',{id:randomUUID(),kind:'bliss'},'https://other.example')).status,403);
 for(const kind of ['peace-v','bliss','infinity'])assert.equal((await api('POST',{id:randomUUID(),kind})).status,200);
 assert.deepEqual((await (await api()).json()).counts,{peace:1,'peace-v':1,bliss:1,infinity:1});
 let unavailable=true;
 const server=http.createServer(async(req,res)=>{
  try{
   if(req.url==='/api/ending-stats'){
    if(unavailable){res.writeHead(503);res.end();return;}
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    const response=await onRequest({env,request:new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,body:req.method==='POST'?Buffer.concat(chunks):undefined})});
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
   }
   const rel=decodeURIComponent(req.url.split('?')[0]),file=path.resolve(root,'site','.'+rel);
   if(!file.startsWith(path.join(root,'site')+path.sep)){res.writeHead(403);res.end();return;}
   const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime});fs.createReadStream(file).on('error',()=>res.end()).pipe(res);
  }catch(e){res.writeHead(500);res.end(String(e));}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge'});
 try{
  const p=await browser.newPage({reducedMotion:'reduce'});await p.route('https://**/*',r=>r.abort());
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gate');
  await p.evaluate(async()=>{CC.state.auth();CC.state.setFlag('bliss');CC.story.finish('bliss');await CC.endingStats.sync();});
  assert.equal(await p.evaluate(()=>CC.endingStats.counts().bliss),1);
  assert.equal(db.prepare("SELECT total FROM ending_totals WHERE kind='bliss'").get().total,1);
  unavailable=false;await p.evaluate(()=>CC.endingStats.sync());
  assert.equal(db.prepare("SELECT total FROM ending_totals WHERE kind='bliss'").get().total,2);
  await p.reload();await p.evaluate(()=>CC.endingStats.sync());
  assert.equal(db.prepare("SELECT total FROM ending_totals WHERE kind='bliss'").get().total,2);
  await p.evaluate(()=>CC.go('home'));await p.locator('[data-tab=endings] .tab__head').hover();await p.locator('.ending-stats summary').click();
  await p.waitForFunction(()=>document.querySelector('[data-ending-stat=bliss] [data-global]').textContent==='2');
  assert.equal(await p.locator('[data-ending-stat=bliss] [data-mine]').textContent(),'1');
  console.log('PASS atomic four-kind counters, duplicate event protection, validation/origin checks, offline queue retry and live browser totals.');
 }finally{await browser.close();await new Promise(r=>server.close(r));db.close();}
})().catch(e=>{console.error(e);process.exit(1)});
