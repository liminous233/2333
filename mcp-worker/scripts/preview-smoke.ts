// Explicit isolated preview only. Never send synthetic endings to production.
import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { paths } from "../test/paths";
const endpoint = "https://case0110-mcp-preview.2965999739.workers.dev/mcp";
const client = new Client({ name: "case0110-preview-acceptance", version: "0.1.0" });
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const r: any = await client.callTool({ name, arguments: args });
  assert(!r.isError, `${name} failed`);
  assert.deepEqual(JSON.parse(r.content[0].text), r.structuredContent);
  return r.structuredContent;
};
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  assert.equal((await client.listTools()).tools.length, 5);
  await call("about_case");
  for (const [kind, path] of Object.entries(paths)) {
    let s = await call("start_game");
    const mid = await call("get_run_record", { run_id: s.run_id });
    assert.equal(mid.share_text, undefined);
    assert.equal(mid.ending, undefined);
    assert(!/assim|clarity|ANOMALY|REPORT_BLACK/.test(JSON.stringify(mid)));
    for (const id of path) s = await call("act", {
      run_id: s.run_id, expected_revision: s.revision, action_id: id,
    });
    assert(s.concluded);
    const record = await call("get_run_record", { run_id: s.run_id });
    assert.equal(typeof record.share_text, "string");
    assert(record.share_text.startsWith("CASE 0110 · 圣献唱诗院"));
    assert(record.share_text.includes("本局回望"));
    assert(!record.share_text.includes(s.run_id));
    assert(!/run_id|global_counts/.test(record.share_text));
    assert(record.global_counts[kind] >= 1);
    assert.deepEqual(await call("get_run_record", { run_id: s.run_id }), record);
    const refused: any = await client.callTool({ name: "act", arguments: {
      run_id: s.run_id, expected_revision: s.revision, action_id: "go_map",
    } });
    assert(refused.isError);
    assert(JSON.stringify(refused).includes("RUN_FINISHED"));
    assert.deepEqual(await call("get_run_record", { run_id: s.run_id }), record);
    console.log(`PASS preview ${kind}: ${path.length} actions, share_text, privacy, idempotency, completed freeze`);
  }
  let s = await call("start_game");
  for (const id of ["authenticate", "go_evidence", "inspect_candle", "light", "put_back", "inspect_pen"]) {
    s = await call("act", { run_id: s.run_id, expected_revision: s.revision, action_id: id });
  }
  assert(s.narrative.includes("你的朋友将会在一天后借走它。"));
  for (const id of ["put_back", "go_journal", "moon_3", "go_evidence"]) {
    s = await call("act", { run_id: s.run_id, expected_revision: s.revision, action_id: id });
  }
  assert(!s.actions.some((a: any) => a.id === "inspect_pen"));
  assert(!s.inventory.includes("蘸水笔"));
  console.log("PASS preview pen hint and disappearance on DAY4 entry");
} catch (e) {
  console.error(String(e).replace(/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/gi, "<redacted-run-id>"));
  process.exitCode = 1;
} finally { await client.close(); }
