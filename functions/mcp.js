// Use Cloudflare's internal service binding, not a browser redirect to workers.dev.
// Preserve the MCP stream, request headers, response status and protocol headers.
export async function forwardMcp(request, env, pathname) {
  const unavailable = () => Response.json({ error: 'MCP_UNAVAILABLE' }, {
    status: 503,
    headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
  });
  if (!env.CASE0110_MCP) return unavailable();
  const url = new URL(request.url);
  url.pathname = pathname;
  try {
    return await env.CASE0110_MCP.fetch(new Request(url, request));
  } catch {
    // Never log request bodies or bearer run handles.
    return unavailable();
  }
}

export function onRequest({ request, env }) {
  return forwardMcp(request, env, '/mcp');
}
