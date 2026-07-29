import type { ResearchData, SourceType } from "@/lib/types";

const allowedSourceTypes = new Set<SourceType>([
  "official",
  "news_derived",
  "analyst_estimate",
  "llm_inference",
  "manual_review",
]);

export function validateResearchData(input: unknown): {
  ok: boolean;
  errors: string[];
  data?: ResearchData;
} {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["payload must be an object"] };
  }

  const data = input as Partial<ResearchData>;
  if (!data.run?.id || !data.run.asOf) errors.push("run.id and run.asOf are required");
  if (!data.dailyReport?.id || !data.dailyReport.title) {
    errors.push("dailyReport.id and dailyReport.title are required");
  }

  const requiredArrays = [
    "events",
    "themes",
    "groups",
    "companies",
    "groupMemberships",
    "themeCompanyLinks",
    "sources",
    "claims",
    "materialSignals",
    "marketSignals",
  ] as const;
  for (const key of requiredArrays) {
    if (!Array.isArray(data[key])) errors.push(`${key} must be an array`);
  }
  if (errors.length) return { ok: false, errors };

  const sourceIds = new Set(data.sources!.map((source) => source.id));
  const sourceById = new Map(data.sources!.map((source) => [source.id, source]));
  const sourceUrls = new Set<string>();
  const duplicateSourceIds =
    sourceIds.size !== data.sources!.length ? "sources contain duplicate ids" : null;
  if (duplicateSourceIds) errors.push(duplicateSourceIds);

  for (const source of data.sources!) {
    if (!source.id || !source.title || !source.publisher || !source.url) {
      errors.push(`source ${source.id || "(missing id)"} is incomplete`);
    }
    if (!allowedSourceTypes.has(source.sourceType)) {
      errors.push(`source ${source.id} has invalid sourceType`);
    }
    try {
      const url = new URL(source.url);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("invalid protocol");
      const normalized = url.toString();
      if (sourceUrls.has(normalized)) errors.push(`source ${source.id} duplicates a url`);
      sourceUrls.add(normalized);
    } catch {
      errors.push(`source ${source.id} has invalid url`);
    }
  }

  const themeIds = new Set(data.themes!.map((theme) => theme.id));
  const tickers = new Set(data.companies!.map((company) => company.ticker));
  const groupIds = new Set(data.groups!.map((group) => group.id));

  for (const signal of data.marketSignals!) {
    if (
      !["market_shock", "leader_statement", "policy_action", "rate_decision", "company_release"].includes(
        signal.kind,
      )
    ) {
      errors.push(`market signal ${signal.id} has invalid kind`);
    }
    if (!["breaking", "today", "recent", "scheduled", "active"].includes(signal.freshness)) {
      errors.push(`market signal ${signal.id} has invalid freshness`);
    }
    if (!["critical", "high", "watch"].includes(signal.severity)) {
      errors.push(`market signal ${signal.id} has invalid severity`);
    }
    if (!signal.occurredAt || !signal.marketMove || !signal.whyItMatters || !signal.nextWatch) {
      errors.push(`market signal ${signal.id} is incomplete`);
    }
    for (const sourceId of signal.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`market signal ${signal.id} references missing source`);
    }
    for (const themeId of signal.affectedThemeIds) {
      if (!themeIds.has(themeId)) {
        errors.push(`market signal ${signal.id} references missing theme ${themeId}`);
      }
    }
    for (const ticker of signal.affectedTickers) {
      if (!tickers.has(ticker)) {
        errors.push(`market signal ${signal.id} references missing ticker ${ticker}`);
      }
    }
  }

  for (const theme of data.themes!) {
    if (theme.score < 0 || theme.score > 100) {
      errors.push(`theme ${theme.id} score must be between 0 and 100`);
    }
    if (theme.sourceIds.length < 2) {
      errors.push(`theme ${theme.id} needs at least two sources`);
    }
    const publishers = new Set(
      theme.sourceIds.map((id) => sourceById.get(id)?.publisher).filter(Boolean),
    );
    if (publishers.size < 2) {
      errors.push(`theme ${theme.id} needs two independent publishers`);
    }
    if (!["spark", "spreading", "hot", "cooling", "fading"].includes(theme.lifecycle)) {
      errors.push(`theme ${theme.id} has invalid lifecycle`);
    }
    if (!["rising", "stable", "falling"].includes(theme.momentum)) {
      errors.push(`theme ${theme.id} has invalid momentum`);
    }
    if (
      !Number.isInteger(theme.earlySignalScore) ||
      theme.earlySignalScore < 0 ||
      theme.earlySignalScore > 100
    ) {
      errors.push(`theme ${theme.id} has invalid earlySignalScore`);
    }
    if (!Number.isInteger(theme.marketHeat) || theme.marketHeat < 0 || theme.marketHeat > 100) {
      errors.push(`theme ${theme.id} has invalid marketHeat`);
    }
    if (
      !theme.firstDetectedAt ||
      !Array.isArray(theme.sparkSignals) ||
      !Array.isArray(theme.spreadTriggers) ||
      !Array.isArray(theme.invalidationSignals) ||
      theme.sparkSignals.length === 0 ||
      theme.spreadTriggers.length === 0 ||
      theme.invalidationSignals.length === 0
    ) {
      errors.push(`theme ${theme.id} is missing lifecycle evidence`);
    }
    for (const sourceId of theme.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`theme ${theme.id} references missing source`);
    }
  }

  for (const company of data.companies!) {
    if (!/^\d{4}$/.test(company.ticker)) {
      errors.push(`company ticker ${company.ticker} must be four digits`);
    }
    if (company.groupId && !groupIds.has(company.groupId)) {
      errors.push(`company ${company.ticker} references missing group`);
    }
  }

  for (const link of data.themeCompanyLinks!) {
    if (!themeIds.has(link.themeId)) errors.push(`link references missing theme ${link.themeId}`);
    if (!tickers.has(link.ticker)) errors.push(`link references missing ticker ${link.ticker}`);
    if (link.relevance < 0 || link.relevance > 100) {
      errors.push(`link ${link.themeId}/${link.ticker} has invalid relevance`);
    }
  }

  for (const membership of data.groupMemberships!) {
    if (!groupIds.has(membership.groupId)) errors.push("membership references missing group");
    if (!tickers.has(membership.ticker)) errors.push("membership references missing ticker");
  }

  for (const claim of data.claims!) {
    if (!["high", "medium", "low"].includes(claim.confidence)) {
      errors.push(`claim ${claim.id} has invalid confidence`);
    }
    if (!allowedSourceTypes.has(claim.sourceType)) {
      errors.push(`claim ${claim.id} has invalid sourceType`);
    }
    for (const sourceId of claim.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`claim ${claim.id} references missing source`);
    }
  }

  for (const signal of data.materialSignals!) {
    if (!["up", "down", "tightening", "easing"].includes(signal.direction)) {
      errors.push(`material signal ${signal.id} has invalid direction`);
    }
    if (signal.sourceIds.length < 2) {
      errors.push(`material signal ${signal.id} needs at least two sources`);
    }
    for (const sourceId of signal.sourceIds) {
      if (!sourceIds.has(sourceId)) errors.push(`material signal ${signal.id} references missing source`);
    }
    for (const themeId of signal.themeIds) {
      if (!themeIds.has(themeId)) errors.push(`material signal ${signal.id} references missing theme`);
    }
    for (const stock of signal.stockLinks) {
      if (!tickers.has(stock.ticker)) errors.push(`material signal ${signal.id} references missing ticker`);
    }
  }

  return errors.length
    ? { ok: false, errors }
    : { ok: true, errors: [], data: data as ResearchData };
}
