import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { GameStore } from "../src/db";
import { database } from "./database";
import { paths } from "./paths";
async function complete(store: GameStore, kind: keyof typeof paths) {
  let s: any = await store.start("zh-CN");
  for (const id of paths[kind]) s = await store.act(s.run_id, s.revision, id);
  return s;
}
test("concurrent actions, stale replay and no-op observation use actual SQLite CAS", async () => {
  const d = database(),
    store = new GameStore(d.db);
  try {
    const s = await store.start("zh-CN");
    const results = await Promise.all([
      store.act(s.run_id, 0, "authenticate"),
      store.act(s.run_id, 0, "authenticate"),
    ]);
    assert.equal(
      results.filter((r) => "error" in r && r.error === "STALE_REVISION")
        .length,
      1,
    );
    assert.equal((await store.load(s.run_id)).revision, 1);
    const stale = await store.act(s.run_id, 0, "authenticate");
    assert("error" in stale);
    assert.equal(stale.error, "STALE_REVISION");
    const before = await store.load(s.run_id);
    await store.observe(s.run_id);
    await store.record(s.run_id);
    assert.deepEqual(await store.load(s.run_id), before);
    await assert.rejects(() => store.act(s.run_id, 1, "solve"), /UNAVAILABLE/);
    assert.deepEqual(await store.load(s.run_id), before);
  } finally {
    d.close();
  }
});
test("four endings share native SQL trigger and remain idempotent", async () => {
  const d = database(),
    store = new GameStore(d.db);
  try {
    for (const kind of Object.keys(paths) as (keyof typeof paths)[]) {
      const end = await complete(store, kind);
      await store.record(end.run_id);
      await store.record(end.run_id);
      await store.act(end.run_id, end.revision - 1, "complete_hymn");
    }
    assert.equal(
      d.sqlite.prepare("SELECT count(*) AS n FROM ending_events").get()!.n,
      4,
    );
    for (const row of d.sqlite.prepare("SELECT total FROM ending_totals").all())
      assert.equal(row.total, 1);
  } finally {
    d.close();
  }
});
test("statistics failure preserves ending and outbox recovers when tables return", async () => {
  const d = database(false),
    store = new GameStore(d.db);
  try {
    const end = await complete(store, "infinity");
    assert(end.concluded);
    assert.match(end.statistics_notice, /暂不可用/);
    assert((await store.load(end.run_id)).concluded);
    assert("statistics_notice" in (await store.record(end.run_id)));
    d.sqlite.exec(
      fs.readFileSync(
        new URL("../../docs/tools/ending-stats-schema.sql", import.meta.url),
        "utf8",
      ),
    );
    await store.maintain();
    await store.maintain();
    assert.equal(
      d.sqlite
        .prepare("SELECT total FROM ending_totals WHERE kind='infinity'")
        .get()!.total,
      1,
    );
  } finally {
    d.close();
  }
});
test("retention refuses expired handles; cleanup keeps pending ending statistics", async () => {
  const d = database();
  let time = 1000000;
  const store = new GameStore(d.db, () => time);
  try {
    const unfinished = await store.start("zh-CN"),
      end = await complete(store, "peace");
    time += 8 * 86400;
    await assert.rejects(() => store.load(unfinished.run_id), /NOT_FOUND/);
    assert((await store.load(end.run_id)).concluded);
    await store.maintain();
    assert.equal(
      d.sqlite.prepare("SELECT count(*) AS n FROM mcp_runs").get()!.n,
      1,
    );
    time += 23 * 86400;
    await assert.rejects(() => store.load(end.run_id), /NOT_FOUND/);
    await store.maintain();
    assert.equal(
      d.sqlite.prepare("SELECT count(*) AS n FROM mcp_runs").get()!.n,
      0,
    );
  } finally {
    d.close();
  }
});
