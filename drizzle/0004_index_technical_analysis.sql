CREATE TABLE IF NOT EXISTS index_technical_analysis (
  id TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  as_of TEXT NOT NULL,
  payload TEXT NOT NULL
);
