import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import type { Database } from "../src/db";
export function database(stats = true) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    fs.readFileSync(
      new URL("../migrations/0001_mcp_runs.sql", import.meta.url),
      "utf8",
    ),
  );
  if (stats)
    sqlite.exec(
      fs.readFileSync(
        new URL("../../docs/tools/ending-stats-schema.sql", import.meta.url),
        "utf8",
      ),
    );
  const prepare = (sql: string) => {
    let args: any[] = [];
    const stmt = {
      bind(...values: any[]) {
        args = values;
        return stmt;
      },
      async first() {
        return sqlite.prepare(sql).get(...args) || null;
      },
      async all() {
        return {
          success: true,
          results: sqlite.prepare(sql).all(...args),
          meta: {},
        };
      },
      async run() {
        const result = sqlite.prepare(sql).run(...args);
        return {
          success: true,
          results: [],
          meta: { changes: result.changes },
        };
      },
    };
    return stmt;
  };
  const db = {
    prepare,
    async batch(stmts: ReturnType<typeof prepare>[]) {
      sqlite.exec("BEGIN");
      try {
        const out = [];
        for (const s of stmts) out.push(await s.run());
        sqlite.exec("COMMIT");
        return out;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
  return { sqlite, db: db as unknown as Database, close: () => sqlite.close() };
}
