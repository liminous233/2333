CREATE TABLE IF NOT EXISTS ending_events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('peace','peace-v','bliss','infinity'))
);
CREATE TABLE IF NOT EXISTS ending_totals (
  kind TEXT PRIMARY KEY,
  total INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO ending_totals(kind) VALUES ('peace'),('peace-v'),('bliss'),('infinity');
CREATE TRIGGER IF NOT EXISTS count_ending AFTER INSERT ON ending_events
BEGIN UPDATE ending_totals SET total = total + 1 WHERE kind = NEW.kind; END;
