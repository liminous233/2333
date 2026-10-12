import { buildRecap, createRun, observe, transition } from "./game/engine";
import type { RunState, Locale, EndingKind } from "./game/types";
export type Database = Pick<D1Database, "prepare" | "batch">;
export class GameStore {
  constructor(
    private db: Database,
    private now = () => Math.floor(Date.now() / 1000),
  ) {}
  async start(locale: Locale) {
    const id = crypto.randomUUID(),
      s = createRun(crypto.randomUUID(), locale, id),
      t = this.now();
    await this.db
      .prepare(
        "INSERT INTO mcp_runs(id, revision, locale, state_json, created_at, updated_at) VALUES (?, 0, ?, ?, ?, ?)",
      )
      .bind(id, locale, JSON.stringify(s), t, t)
      .run();
    return {
      ...observe(s),
      save_hint:
        "请保存 run_id；它也是读取和继续此局的凭据。未完成局保留 7 天，完成局保留 30 天。",
    };
  }
  async load(id: string): Promise<RunState> {
    const row = await this.db
      .prepare(
        "SELECT state_json FROM mcp_runs WHERE id = ? AND ((finished_at IS NULL AND updated_at >= ?) OR (finished_at IS NOT NULL AND finished_at >= ?))",
      )
      .bind(id, this.now() - 7 * 86400, this.now() - 30 * 86400)
      .first<{ state_json: string }>();
    if (!row) throw Error("RUN_NOT_FOUND");
    return JSON.parse(row.state_json);
  }
  async observe(id: string) {
    return observe(await this.load(id));
  }
  async act(id: string, revision: number, action: string) {
    const current = await this.load(id);
    if (current.revision !== revision)
      return {
        error: "STALE_REVISION",
        message: "状态已更新；请依据当前场景重新选择。",
        ...observe(current),
      };
    const { state, event } = transition(current, action);
    // Compare-and-swap in one SQL statement. No read-modify-write transaction gap.
    const saved = await this.db
      .prepare(
        "UPDATE mcp_runs SET state_json = ?, revision = ?, updated_at = ?, finished_at = ? WHERE id = ? AND revision = ? RETURNING id",
      )
      .bind(
        JSON.stringify(state),
        state.revision,
        this.now(),
        state.concluded ? this.now() : null,
        id,
        revision,
      )
      .first();
    if (!saved)
      return {
        error: "STALE_REVISION",
        message: "状态已更新；请依据当前场景重新选择。",
        ...(await this.observe(id)),
      };
    // Saving the ending is separate from aggregation. Failed statistics cannot undo it.
    const stats = state.concluded ? await this.recordStats(state) : undefined;
    return {
      ...observe(state),
      event,
      ...(stats === false
        ? { statistics_notice: "全站次数暂不可用，结局已保存。" }
        : {}),
    };
  }
  async recordStats(s: RunState) {
    if (!s.concluded || !s.endingKind) return false;
    try {
      await this.db.batch([
        this.db
          .prepare(
            "INSERT OR IGNORE INTO ending_events(id, kind) VALUES (?, ?)",
          )
          .bind(s.runId, s.endingKind),
        this.db
          .prepare("UPDATE mcp_runs SET stats_recorded = 1 WHERE id = ?")
          .bind(s.runId),
      ]);
      return true;
    } catch {
      return false;
    }
  }
  async record(id: string) {
    const s = await this.load(id),
      record = buildRecap(s);
    if (!s.concluded) return record;
    try {
      if (!(await this.recordStats(s))) throw Error("STATS_UNAVAILABLE");
      const rows = await this.db
        .prepare("SELECT kind, total FROM ending_totals")
        .all<{ kind: EndingKind; total: number }>();
      const totals: Record<EndingKind, number> = {
        peace: 0,
        "peace-v": 0,
        bliss: 0,
        infinity: 0,
      };
      for (const r of rows.results)
        if (r.kind in totals) totals[r.kind] = r.total;
      return { ...record, global_counts: totals };
    } catch {
      return { ...record, statistics_notice: "全站次数暂不可用，结局已保存。" };
    }
  }
  async maintain() {
    const pending = await this.db
      .prepare(
        "SELECT state_json FROM mcp_runs WHERE finished_at IS NOT NULL AND stats_recorded = 0 LIMIT 100",
      )
      .all<{ state_json: string }>();
    for (const row of pending.results)
      await this.recordStats(JSON.parse(row.state_json));
    // Never delete an unaggregated ending; retry next maintenance run.
    await this.db
      .prepare(
        "DELETE FROM mcp_runs WHERE (finished_at IS NULL AND updated_at < ?) OR (finished_at IS NOT NULL AND finished_at < ? AND stats_recorded = 1)",
      )
      .bind(this.now() - 7 * 86400, this.now() - 30 * 86400)
      .run();
  }
}
