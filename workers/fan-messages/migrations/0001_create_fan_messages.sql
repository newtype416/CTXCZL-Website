CREATE TABLE IF NOT EXISTS fan_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fan_messages_created_at
  ON fan_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS fan_message_rate_limits (
  rate_key TEXT PRIMARY KEY,
  last_posted_at INTEGER NOT NULL
);
