import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const researchRuns = sqliteTable("research_runs", {
  id: text("id").primaryKey(),
  asOf: text("as_of").notNull(),
  status: text("status").notNull(),
  contentHash: text("content_hash").notNull(),
  createdAt: text("created_at").notNull(),
  publishedAt: text("published_at"),
});

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  title: text("title").notNull(),
  publisher: text("publisher").notNull(),
  url: text("url").notNull(),
  publishedAt: text("published_at").notNull(),
  retrievedAt: text("retrieved_at").notNull(),
  sourceType: text("source_type").notNull(),
  quality: text("quality").notNull(),
});

export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  statement: text("statement").notNull(),
  confidence: text("confidence").notNull(),
  sourceType: text("source_type").notNull(),
  sourceIds: text("source_ids").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  region: text("region").notNull(),
  happenedAt: text("happened_at").notNull(),
  impact: text("impact").notNull(),
  sourceIds: text("source_ids").notNull(),
});

export const marketSignals = sqliteTable("market_signals", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  kind: text("kind").notNull(),
  headline: text("headline").notNull(),
  actor: text("actor").notNull(),
  quote: text("quote"),
  occurredAt: text("occurred_at").notNull(),
  freshness: text("freshness").notNull(),
  severity: text("severity").notNull(),
  direction: text("direction").notNull(),
  status: text("status").notNull(),
  marketMove: text("market_move").notNull(),
  whyItMatters: text("why_it_matters").notNull(),
  affectedThemeIds: text("affected_theme_ids").notNull(),
  affectedTickers: text("affected_tickers").notNull(),
  nextWatch: text("next_watch").notNull(),
  sourceIds: text("source_ids").notNull(),
});

export const indexTechnicalAnalysis = sqliteTable("index_technical_analysis", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  symbol: text("symbol").notNull(),
  asOf: text("as_of").notNull(),
  payload: text("payload").notNull(),
});

export const themes = sqliteTable("themes", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  name: text("name").notNull(),
  kicker: text("kicker").notNull(),
  score: integer("score").notNull(),
  stage: text("stage").notNull(),
  direction: text("direction").notNull(),
  lifecycle: text("lifecycle").notNull().default("spark"),
  firstDetectedAt: text("first_detected_at").notNull().default(""),
  earlySignalScore: integer("early_signal_score").notNull().default(0),
  marketHeat: integer("market_heat").notNull().default(0),
  momentum: text("momentum").notNull().default("stable"),
  sparkSignals: text("spark_signals").notNull().default("[]"),
  spreadTriggers: text("spread_triggers").notNull().default("[]"),
  invalidationSignals: text("invalidation_signals").notNull().default("[]"),
  thesis: text("thesis").notNull(),
  whyNow: text("why_now").notNull(),
  valueCapture: text("value_capture").notNull(),
  chain: text("chain").notNull(),
  catalysts: text("catalysts").notNull(),
  risks: text("risks").notNull(),
  sourceIds: text("source_ids").notNull(),
});

export const companies = sqliteTable("companies", {
  ticker: text("ticker").primaryKey(),
  runId: text("run_id").notNull(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  role: text("role").notNull(),
  groupId: text("group_id"),
  summary: text("summary").notNull(),
});

export const corporateGroups = sqliteTable("corporate_groups", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  focus: text("focus").notNull(),
  sourceIds: text("source_ids").notNull(),
});

export const groupMemberships = sqliteTable(
  "group_memberships",
  {
    runId: text("run_id").notNull(),
    groupId: text("group_id").notNull(),
    ticker: text("ticker").notNull(),
    relation: text("relation").notNull(),
  },
  (table) => [
    uniqueIndex("group_membership_run_group_ticker").on(
      table.runId,
      table.groupId,
      table.ticker,
    ),
  ],
);

export const themeCompanyLinks = sqliteTable(
  "theme_company_links",
  {
    runId: text("run_id").notNull(),
    themeId: text("theme_id").notNull(),
    ticker: text("ticker").notNull(),
    relevance: integer("relevance").notNull(),
    role: text("role").notNull(),
    stance: text("stance").notNull(),
    reasoning: text("reasoning").notNull(),
  },
  (table) => [
    uniqueIndex("theme_company_run_theme_ticker").on(
      table.runId,
      table.themeId,
      table.ticker,
    ),
  ],
);

export const dailyReports = sqliteTable("daily_reports", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  title: text("title").notNull(),
  eyebrow: text("eyebrow").notNull(),
  narrative: text("narrative").notNull(),
  changes: text("changes").notNull(),
  signals: text("signals").notNull(),
  risks: text("risks").notNull(),
});

export const materialSignals = sqliteTable("material_signals", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  material: text("material").notNull(),
  direction: text("direction").notNull(),
  changeLabel: text("change_label").notNull(),
  period: text("period").notNull(),
  status: text("status").notNull(),
  thesis: text("thesis").notNull(),
  sourceIds: text("source_ids").notNull(),
  themeIds: text("theme_ids").notNull(),
  stockLinks: text("stock_links").notNull(),
});

export const syncJobs = sqliteTable("sync_jobs", {
  runId: text("run_id").primaryKey(),
  contentHash: text("content_hash").notNull(),
  status: text("status").notNull(),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  errorMessage: text("error_message"),
});

export const publishedSnapshots = sqliteTable("published_snapshots", {
  runId: text("run_id").primaryKey(),
  contentHash: text("content_hash").notNull(),
  payload: text("payload").notNull(),
  publishedAt: text("published_at").notNull(),
});
