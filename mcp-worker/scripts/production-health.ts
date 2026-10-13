// Read-only production check: no start_game, act, records or statistics writes.
import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
const base = "https://case0110-mcp.2965999739.workers.dev";
const client = new Client({ name: "case0110-production-health", version: "0.1.0" });
try {
  const health = await fetch(base + "/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json() as {version: string}).version, "0.1.0");
  await client.connect(new StreamableHTTPClientTransport(new URL(base + "/mcp")));
  assert.deepEqual((await client.listTools()).tools.map(t => t.name).sort(),
    ["about_case", "act", "get_run_record", "observe", "start_game"]);
  const r = await client.callTool({ name: "about_case", arguments: {} });
  assert(!r.isError);
  assert(JSON.stringify(r).includes("圣献唱诗院"));
  console.log("PASS production health, official SDK connection, five tools and about_case; no game created or ending counted.");
} catch (e) {
  console.error(String(e).replace(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/gi, "<redacted-run-id>"));
  process.exitCode = 1;
} finally { await client.close(); }
