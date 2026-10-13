import assert from 'node:assert/strict';
import { onRequest } from '../../functions/mcp.js';
import { onRequest as health } from '../../functions/mcp-health.js';

// A streaming response must reach the client before its upstream stream closes.
let controller;
const upstream = new Response(new ReadableStream({ start(c) { controller = c; } }), {
  headers: { 'Content-Type': 'text/event-stream', 'MCP-Protocol-Version': '2025-03-26', 'Cache-Control': 'no-store' },
});
const request = new Request('https://choir-0110.pages.dev/mcp/', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-03-26' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } }),
});
const response = await onRequest({ request, env: { CASE0110_MCP: { async fetch(forwarded) {
  assert.equal(new URL(forwarded.url).pathname, '/mcp');
  assert.equal(forwarded.method, 'POST');
  assert.equal(forwarded.headers.get('MCP-Protocol-Version'), '2025-03-26');
  assert.equal(forwarded.headers.get('Accept'), 'application/json, text/event-stream');
  assert.equal((await forwarded.json()).method, 'initialize');
  return upstream;
} } } });
assert.equal(response, upstream);
const reader = response.body.getReader();
controller.enqueue(new TextEncoder().encode('data: {"jsonrpc":"2.0","id":1,"result":{}}\n\n'));
assert((new TextDecoder().decode((await reader.read()).value)).startsWith('data: '));
controller.close(); await reader.cancel();
for (const method of ['GET', 'OPTIONS', 'DELETE']) {
  const expected = new Response(null, { status: method === 'OPTIONS' ? 204 : 405, headers: { Allow: 'POST, OPTIONS', 'Access-Control-Allow-Origin': '*' } });
  const r = await onRequest({ request: new Request('https://choir-0110.pages.dev/mcp', { method }), env: { CASE0110_MCP: { fetch: async q => { assert.equal(q.method, method); return expected; } } } });
  assert.equal(r, expected);
}
for (const env of [{}, { CASE0110_MCP: { fetch: async () => { throw Error('private diagnostics'); } } }]) {
  const r = await onRequest({ request: new Request('https://choir-0110.pages.dev/mcp'), env });
  assert.equal(r.status, 503);
  assert.deepEqual(await r.json(), { error: 'MCP_UNAVAILABLE' });
}
assert.equal((await health({ request: new Request('https://choir-0110.pages.dev/mcp-health', { method: 'POST' }), env: {} })).status, 405);
await health({ request: new Request('https://choir-0110.pages.dev/mcp-health'), env: { CASE0110_MCP: { fetch: async q => { assert.equal(new URL(q.url).pathname, '/health'); return Response.json({version:'0.1.0'}); } } } });
console.log('PASS MCP gateway: streaming, method/body/header preservation, trailing slash, health route, safe failure.');
