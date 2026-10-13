import { forwardMcp } from './mcp.js';

export function onRequest({ request, env }) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  return forwardMcp(request, env, '/health');
}
