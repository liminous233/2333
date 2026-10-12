// Explicit local end-to-end verification against workerd + local D1.
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { paths } from "../test/paths";
const endpoint = process.argv[2] || "http://127.0.0.1:8787/mcp";
if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(endpoint).hostname))
  throw Error(
    "Local test only; never send synthetic ending events to production.",
  );
const client = new Client({
  name: "case0110-local-acceptance",
  version: "0.1.0",
});
const trace: any[] = [];
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  assert.equal((await client.listTools()).tools.length, 5);
  for (const [kind, path] of Object.entries(paths)) {
    const call = async (name: string, args: Record<string, unknown>) => {
      const r: any = await client.callTool({ name, arguments: args });
      assert(!r.isError, JSON.stringify(r));
      assert.deepEqual(JSON.parse(r.content[0].text), r.structuredContent);
      if (kind === "infinity")
        trace.push({
          tool: name,
          arguments: args,
          result: r.structuredContent,
        });
      return r.structuredContent;
    };
    let s = await call("start_game", {});
    for (const id of path)
      s = await call("act", {
        run_id: s.run_id,
        expected_revision: s.revision,
        action_id: id,
      });
    assert(s.concluded);
    const record = await call("get_run_record", { run_id: s.run_id });
    assert(record.global_counts[kind] >= 1);
    console.log("PASS local Worker + D1:", kind, `(${path.length} actions)`);
  }
  if (process.argv[3]) {
    const text = JSON.stringify(
      {
        endpoint: "http://127.0.0.1:8787/mcp",
        note: "Actual local test. Ephemeral run IDs redacted; no production requests.",
        calls: trace,
      },
      null,
      2,
    ).replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "<local-run-id>",
    );
    fs.writeFileSync(process.argv[3], text + "\n");
  }
} finally {
  await client.close();
}
