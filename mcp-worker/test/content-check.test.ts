import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("content check accepts LF and CRLF but still rejects substantive drift without writing", () => {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "case0110-content-check-"));
  const generated = ["src/game/content.ts", "src/game/story.ts", "src/game/source-manifest.json"];
  const sources = Object.keys(JSON.parse(fs.readFileSync(path.join(root, "mcp-worker/src/game/source-manifest.json"), "utf8")));
  const files = [...sources, ...generated.map(p => "mcp-worker/" + p), "mcp-worker/scripts/sync-content.mjs"];
  // Only a newly created, private OS-temp fixture is removed in finally.
  try {
    for (const newline of ["\n", "\r\n"]) {
      for (const p of files) {
        fs.mkdirSync(path.dirname(path.join(temp, p)), { recursive: true });
        fs.writeFileSync(path.join(temp, p), fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n").replace(/\n/g, newline));
      }
      const before = files.map(p => fs.readFileSync(path.join(temp, p), "utf8"));
      const result = spawnSync(process.execPath, [path.join(temp, "mcp-worker/scripts/sync-content.mjs"), "--check"], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(files.map(p => fs.readFileSync(path.join(temp, p), "utf8")), before);
    }
    fs.appendFileSync(path.join(temp, "site/js/state.js"), "\n// substantive drift\n");
    const result = spawnSync(process.execPath, [path.join(temp, "mcp-worker/scripts/sync-content.mjs"), "--check"], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert(result.stderr.includes("Upstream changed"));
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
