const kinds = ['peace', 'peace-v', 'bliss', 'infinity'];
function reply(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export async function onRequest({request, env}) {
  if (!env.ENDING_DB) return reply({error:'unavailable'},503);
  if (!['GET','POST'].includes(request.method)) return reply({error:'method'},405);
  if (request.method === 'POST') {
    const origin=request.headers.get('Origin');
    if (!origin || origin !== new URL(request.url).origin) return reply({error:'origin'},403);
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return reply({error:'type'},415);
    if (Number(request.headers.get('Content-Length')) > 512) return reply({error:'size'},413);
    let event;
    try { const raw=await request.text();if(raw.length>512)return reply({error:'size'},413);event=JSON.parse(raw); } catch(e){return reply({error:'json'},400);}
    if (!event || typeof event.id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.id) || !kinds.includes(event.kind)) return reply({error:'event'},400);
    await env.ENDING_DB.prepare('INSERT OR IGNORE INTO ending_events (id, kind) VALUES (?, ?)').bind(event.id.toLowerCase(), event.kind).run();
  }
  const {results}=await env.ENDING_DB.prepare('SELECT kind, total FROM ending_totals').all();
  const counts=Object.fromEntries(kinds.map(k=>[k,0]));results.forEach(row=>{counts[row.kind]=row.total;});
  return reply({counts});
}
