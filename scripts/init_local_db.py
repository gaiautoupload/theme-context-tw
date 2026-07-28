from __future__ import annotations

import hashlib
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "data" / "seed-data.json"
DATABASE = ROOT / "data" / "research.sqlite"

SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS research_runs (
  id TEXT PRIMARY KEY, as_of TEXT NOT NULL, status TEXT NOT NULL,
  content_hash TEXT NOT NULL, created_at TEXT NOT NULL, published_at TEXT
);
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, title TEXT NOT NULL, publisher TEXT NOT NULL,
  url TEXT NOT NULL, published_at TEXT NOT NULL, retrieved_at TEXT NOT NULL,
  source_type TEXT NOT NULL, quality TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  statement TEXT NOT NULL, confidence TEXT NOT NULL, source_type TEXT NOT NULL, source_ids TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL,
  region TEXT NOT NULL, happened_at TEXT NOT NULL, impact TEXT NOT NULL, source_ids TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, name TEXT NOT NULL, kicker TEXT NOT NULL,
  score INTEGER NOT NULL, stage TEXT NOT NULL, direction TEXT NOT NULL, thesis TEXT NOT NULL,
  lifecycle TEXT NOT NULL DEFAULT 'spark', first_detected_at TEXT NOT NULL DEFAULT '',
  early_signal_score INTEGER NOT NULL DEFAULT 0, market_heat INTEGER NOT NULL DEFAULT 0,
  momentum TEXT NOT NULL DEFAULT 'stable', spark_signals TEXT NOT NULL DEFAULT '[]',
  spread_triggers TEXT NOT NULL DEFAULT '[]', invalidation_signals TEXT NOT NULL DEFAULT '[]',
  why_now TEXT NOT NULL, value_capture TEXT NOT NULL, chain TEXT NOT NULL,
  catalysts TEXT NOT NULL, risks TEXT NOT NULL, source_ids TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS companies (
  ticker TEXT PRIMARY KEY, run_id TEXT NOT NULL, name TEXT NOT NULL, industry TEXT NOT NULL,
  role TEXT NOT NULL, group_id TEXT, summary TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS corporate_groups (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL,
  focus TEXT NOT NULL, source_ids TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS group_memberships (
  run_id TEXT NOT NULL, group_id TEXT NOT NULL, ticker TEXT NOT NULL, relation TEXT NOT NULL,
  UNIQUE(run_id, group_id, ticker)
);
CREATE TABLE IF NOT EXISTS theme_company_links (
  run_id TEXT NOT NULL, theme_id TEXT NOT NULL, ticker TEXT NOT NULL,
  relevance INTEGER NOT NULL, role TEXT NOT NULL, stance TEXT NOT NULL, reasoning TEXT NOT NULL,
  UNIQUE(run_id, theme_id, ticker)
);
CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, title TEXT NOT NULL, eyebrow TEXT NOT NULL,
  narrative TEXT NOT NULL, changes TEXT NOT NULL, signals TEXT NOT NULL, risks TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS material_signals (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, material TEXT NOT NULL, direction TEXT NOT NULL,
  change_label TEXT NOT NULL, period TEXT NOT NULL, status TEXT NOT NULL, thesis TEXT NOT NULL,
  source_ids TEXT NOT NULL, theme_ids TEXT NOT NULL, stock_links TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sync_jobs (
  run_id TEXT PRIMARY KEY, content_hash TEXT NOT NULL, status TEXT NOT NULL,
  started_at TEXT NOT NULL, finished_at TEXT, error_message TEXT
);
CREATE TABLE IF NOT EXISTS published_snapshots (
  run_id TEXT PRIMARY KEY, content_hash TEXT NOT NULL, payload TEXT NOT NULL, published_at TEXT NOT NULL
);
"""


def packed(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


raw = SOURCE.read_text(encoding="utf-8")
data = json.loads(raw)
run_id = data["run"]["id"]
content_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
now = datetime.now(timezone.utc).isoformat()

DATABASE.parent.mkdir(parents=True, exist_ok=True)
connection = sqlite3.connect(DATABASE)
try:
    connection.executescript(SCHEMA)
    theme_columns = {row[1] for row in connection.execute("PRAGMA table_info(themes)")}
    for column, definition in (
        ("lifecycle", "TEXT NOT NULL DEFAULT 'spark'"),
        ("first_detected_at", "TEXT NOT NULL DEFAULT ''"),
        ("early_signal_score", "INTEGER NOT NULL DEFAULT 0"),
        ("market_heat", "INTEGER NOT NULL DEFAULT 0"),
        ("momentum", "TEXT NOT NULL DEFAULT 'stable'"),
        ("spark_signals", "TEXT NOT NULL DEFAULT '[]'"),
        ("spread_triggers", "TEXT NOT NULL DEFAULT '[]'"),
        ("invalidation_signals", "TEXT NOT NULL DEFAULT '[]'"),
    ):
        if column not in theme_columns:
            connection.execute(f"ALTER TABLE themes ADD COLUMN {column} {definition}")
    connection.execute("BEGIN IMMEDIATE")
    for table in (
        "sources", "claims", "events", "themes", "companies", "corporate_groups",
        "group_memberships", "theme_company_links", "daily_reports", "material_signals"
    ):
        connection.execute(f"DELETE FROM {table}")

    connection.execute(
        "INSERT OR REPLACE INTO research_runs VALUES (?, ?, 'published', ?, ?, ?)",
        (run_id, data["run"]["asOf"], content_hash, now, now),
    )
    connection.executemany(
        "INSERT INTO sources VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                item["id"], run_id, item["title"], item["publisher"], item["url"],
                item["publishedAt"], item["retrievedAt"], item["sourceType"], item["quality"],
            )
            for item in data["sources"]
        ],
    )
    connection.executemany(
        "INSERT INTO claims VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                item["id"], run_id, item["entityType"], item["entityId"], item["statement"],
                item["confidence"], item["sourceType"], packed(item["sourceIds"]),
            )
            for item in data["claims"]
        ],
    )
    connection.executemany(
        "INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                item["id"], run_id, item["title"], item["summary"], item["region"],
                item["happenedAt"], item["impact"], packed(item["sourceIds"]),
            )
            for item in data["events"]
        ],
    )
    connection.executemany(
        """INSERT INTO themes (
            id, run_id, name, kicker, score, stage, direction, lifecycle,
            first_detected_at, early_signal_score, market_heat, momentum,
            spark_signals, spread_triggers, invalidation_signals,
            thesis, why_now, value_capture, chain, catalysts, risks, source_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            (
                item["id"], run_id, item["name"], item["kicker"], item["score"], item["stage"],
                item["direction"], item["lifecycle"], item["firstDetectedAt"],
                item["earlySignalScore"], item["marketHeat"], item["momentum"],
                packed(item["sparkSignals"]), packed(item["spreadTriggers"]),
                packed(item["invalidationSignals"]), item["thesis"], item["whyNow"], item["valueCapture"],
                packed(item["chain"]), packed(item["catalysts"]), packed(item["risks"]),
                packed(item["sourceIds"]),
            )
            for item in data["themes"]
        ],
    )
    connection.executemany(
        "INSERT INTO companies VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            (
                item["ticker"], run_id, item["name"], item["industry"], item["role"],
                item["groupId"], item["summary"],
            )
            for item in data["companies"]
        ],
    )
    connection.executemany(
        "INSERT INTO corporate_groups VALUES (?, ?, ?, ?, ?, ?)",
        [
            (
                item["id"], run_id, item["name"], item["description"],
                packed(item["focus"]), packed(item["sourceIds"]),
            )
            for item in data["groups"]
        ],
    )
    connection.executemany(
        "INSERT INTO group_memberships VALUES (?, ?, ?, ?)",
        [(run_id, item["groupId"], item["ticker"], item["relation"]) for item in data["groupMemberships"]],
    )
    connection.executemany(
        "INSERT INTO theme_company_links VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            (
                run_id, item["themeId"], item["ticker"], item["relevance"],
                item["role"], item["stance"], item["reasoning"],
            )
            for item in data["themeCompanyLinks"]
        ],
    )
    report = data["dailyReport"]
    connection.execute(
        "INSERT INTO daily_reports VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            report["id"], run_id, report["title"], report["eyebrow"], report["narrative"],
            packed(report["changes"]), packed(report["signals"]), packed(report["risks"]),
        ),
    )
    connection.executemany(
        "INSERT INTO material_signals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                item["id"], run_id, item["material"], item["direction"], item["change"],
                item["period"], item["status"], item["thesis"], packed(item["sourceIds"]),
                packed(item["themeIds"]), packed(item["stockLinks"]),
            )
            for item in data["materialSignals"]
        ],
    )
    connection.execute(
        "INSERT OR REPLACE INTO published_snapshots VALUES (?, ?, ?, ?)",
        (run_id, content_hash, raw, now),
    )
    connection.commit()
except Exception:
    connection.rollback()
    raise
finally:
    connection.close()

print(f"Initialized {DATABASE} from {SOURCE.name} (run {run_id}, sha256 {content_hash[:12]}…).")
