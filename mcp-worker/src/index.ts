import { createMcpHandler } from "@modelcontextprotocol/server";
import { GameStore } from "./db";
import { createServer } from "./mcp-server";
export interface Env {
  ENDING_DB: D1Database;
}
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID, Authorization",
  "Access-Control-Expose-Headers": "MCP-Protocol-Version, MCP-Session-Id",
  "Cache-Control": "no-store",
};
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/health")
      return Response.json({ version: "0.1.0" }, { headers: cors });
    if (path !== "/mcp")
      return new Response("Not found", { status: 404, headers: cors });
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors });
    // This anonymous, credential-free endpoint deliberately accepts public browser origins.
    // No cookies or ambient authority; a high-entropy run_id is the only game capability.
    const handler = createMcpHandler(
      () => createServer(new GameStore(env.ENDING_DB)),
      {
        legacy: "stateless",
        maxRequestBodySize: 32768,
        maxSubscriptions: 0,
        keepAliveMs: 0,
        onerror: () => {},
      },
    );
    try {
      const response = await handler.fetch(request);
      const headers = new Headers(response.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(response.body, { status: response.status, headers });
    } catch {
      return Response.json(
        { error: "SERVICE_UNAVAILABLE" },
        { status: 503, headers: cors },
      );
    }
  },
  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(new GameStore(env.ENDING_DB).maintain());
  },
};
