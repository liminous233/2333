-- Isolated game saves. Existing ending_events / ending_totals are not modified.
CREATE TABLE IF NOT EXISTS mcp_runs (
 id TEXT PRIMARY KEY,
 revision INTEGER NOT NULL DEFAULT 0,
 locale TEXT NOT NULL DEFAULT 'zh-CN',
 state_json TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 finished_at INTEGER,
 stats_recorded INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_mcp_runs_updated_at ON mcp_runs(updated_at);
CREATE INDEX IF NOT EXISTS idx_mcp_runs_pending_stats ON mcp_runs(stats_recorded, finished_at);
