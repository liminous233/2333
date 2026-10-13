import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Client as ModernClient,
  StreamableHTTPClientTransport as ModernTransport,
} from "@modelcontextprotocol/client";
import { Client as LegacyClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport as LegacyTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import worker from "../src/index";
import { database } from "./database";
import { paths } from "./paths";
const url = new URL("https://case0110.test/mcp");
function fixture() {
  const d = database();
  const env = { ENDING_DB: d.db as D1Database };
  const fetcher = async (input: RequestInfo | URL, init?: RequestInit) =>
    worker.fetch(
      input instanceof Request ? input : new Request(input, init),
      env,
    );
  return { ...d, env, fetcher };
}
for (const modern of [false, true])
  test(
    (modern ? "2026 SDK v2" : "2025 SDK v1") +
      " real client connects, lists and finishes a full game",
    async () => {
      const f = fixture();
      const client = modern
        ? new ModernClient({ name: "integration-v2", version: "1" })
        : new LegacyClient({ name: "integration-v1", version: "1" });
      const transport = modern
        ? new ModernTransport(url, { fetch: f.fetcher as any })
        : new LegacyTransport(url, { fetch: f.fetcher as any });
      try {
        await (client as any).connect(transport);
        const list = await client.listTools();
        assert.equal(list.tools.length, 5);
        const call = async (name: string, args: Record<string, unknown>) => {
          const r: any = await (client as any).callTool({
            name,
            arguments: args,
          });
          assert(r.structuredContent);
          assert.deepEqual(JSON.parse(r.content[0].text), r.structuredContent);
          return r;
        };
        const about = await call("about_case", {});
        assert.match(about.structuredContent.content_warning, /无突脸/);
        let r = await call("start_game", {}),
          s = r.structuredContent;
        for (const id of paths.infinity) {
          r = await call("act", {
            run_id: s.run_id,
            expected_revision: s.revision,
            action_id: id,
          });
          assert(!r.isError, JSON.stringify(r));
          s = r.structuredContent;
        }
        assert.equal(s.ending, "异神极乐 [∞]");
        const record = await call("get_run_record", { run_id: s.run_id });
        assert.equal(record.structuredContent.global_counts.infinity, 1);
        assert.match(record.structuredContent.share_text, /异神极乐 \[∞\]/);
        assert(!record.structuredContent.share_text.includes(s.run_id));
        const invalid: any = await (client as any).callTool({
          name: "observe",
          arguments: { run_id: s.run_id, extra: "denied" },
        });
        assert(invalid.isError);
        const bad: any = await (client as any).callTool({
          name: "act",
          arguments: {
            run_id: s.run_id,
            expected_revision: s.revision,
            action_id: "complete_hymn",
          },
        });
        assert(bad.isError);
        assert.equal(bad.structuredContent.error, "RUN_FINISHED");
      } finally {
        await client.close();
        f.close();
      }
    },
  );
test("HTTP boundary: health, CORS, oversize streamed body and invalid requests", async () => {
  const f = fixture();
  try {
    const health = await f.fetcher("https://case0110.test/health");
    assert.deepEqual(await health.json(), { version: "0.1.0" });
    const preflight = await f.fetcher(url, {
      method: "OPTIONS",
      headers: { Origin: "https://some-client.example" },
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), "*");
    const big = await f.fetcher(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: "x".repeat(32769),
    });
    assert.equal(big.status, 413);
    const malformed = await f.fetcher(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: "{",
    });
    assert(malformed.status >= 400);
    const missing = await f.fetcher("https://case0110.test/nope");
    assert.equal(missing.status, 404);
    const get = await f.fetcher(url);
    assert.equal(get.status, 405);
  } finally {
    f.close();
  }
});
