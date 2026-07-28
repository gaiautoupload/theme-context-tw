import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const candidate = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(root, "data", "seed-data.json");
const data = JSON.parse(fs.readFileSync(candidate, "utf8"));
const errors = [];

for (const key of [
  "events",
  "themes",
  "groups",
  "companies",
  "groupMemberships",
  "themeCompanyLinks",
  "sources",
  "claims",
  "materialSignals",
]) {
  if (!Array.isArray(data[key])) errors.push(`${key} must be an array`);
}

const sourceIds = new Set((data.sources ?? []).map((source) => source.id));
const sourceById = new Map((data.sources ?? []).map((source) => [source.id, source]));
const themeIds = new Set((data.themes ?? []).map((theme) => theme.id));
const groupIds = new Set((data.groups ?? []).map((group) => group.id));
const tickers = new Set((data.companies ?? []).map((company) => company.ticker));
const seenUrls = new Set();

for (const source of data.sources ?? []) {
  try {
    const normalized = new URL(source.url).toString();
    if (seenUrls.has(normalized)) errors.push(`duplicate source URL: ${normalized}`);
    seenUrls.add(normalized);
  } catch {
    errors.push(`invalid source URL: ${source.id}`);
  }
}

for (const company of data.companies ?? []) {
  if (!/^\d{4}$/.test(company.ticker)) errors.push(`invalid TW ticker: ${company.ticker}`);
  if (company.groupId && !groupIds.has(company.groupId)) {
    errors.push(`unknown group ${company.groupId} on ${company.ticker}`);
  }
}

for (const theme of data.themes ?? []) {
  if (!Number.isInteger(theme.score) || theme.score < 0 || theme.score > 100) {
    errors.push(`invalid score on theme ${theme.id}`);
  }
  if (!["spark", "spreading", "hot", "cooling", "fading"].includes(theme.lifecycle)) {
    errors.push(`invalid lifecycle on theme ${theme.id}`);
  }
  if (!["rising", "stable", "falling"].includes(theme.momentum)) {
    errors.push(`invalid momentum on theme ${theme.id}`);
  }
  if (!Number.isInteger(theme.earlySignalScore) || theme.earlySignalScore < 0 || theme.earlySignalScore > 100) {
    errors.push(`invalid early signal score on theme ${theme.id}`);
  }
  if (!Number.isInteger(theme.marketHeat) || theme.marketHeat < 0 || theme.marketHeat > 100) {
    errors.push(`invalid market heat on theme ${theme.id}`);
  }
  if (
    !theme.firstDetectedAt ||
    !Array.isArray(theme.sparkSignals) ||
    !Array.isArray(theme.spreadTriggers) ||
    !Array.isArray(theme.invalidationSignals) ||
    !theme.sparkSignals.length ||
    !theme.spreadTriggers.length ||
    !theme.invalidationSignals.length
  ) {
    errors.push(`missing lifecycle evidence on theme ${theme.id}`);
  }
  const referencedSources = theme.sourceIds.map((id) => sourceById.get(id)).filter(Boolean);
  const publishers = new Set(referencedSources.map((source) => source.publisher));
  if (referencedSources.length < 2 || publishers.size < 2) {
    errors.push(`theme ${theme.id} needs two independent publishers`);
  }
  for (const sourceId of theme.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`unknown source ${sourceId} on theme ${theme.id}`);
  }
}

for (const event of data.events ?? []) {
  for (const sourceId of event.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`unknown source ${sourceId} on event ${event.id}`);
  }
}

for (const membership of data.groupMemberships ?? []) {
  if (!groupIds.has(membership.groupId)) errors.push(`unknown group ${membership.groupId}`);
  if (!tickers.has(membership.ticker)) errors.push(`unknown ticker ${membership.ticker}`);
}

for (const link of data.themeCompanyLinks ?? []) {
  if (!themeIds.has(link.themeId)) errors.push(`unknown theme ${link.themeId}`);
  if (!tickers.has(link.ticker)) errors.push(`unknown ticker ${link.ticker}`);
  if (!Number.isInteger(link.relevance) || link.relevance < 0 || link.relevance > 100) {
    errors.push(`invalid relevance ${link.themeId}/${link.ticker}`);
  }
}

for (const claim of data.claims ?? []) {
  if (!["high", "medium", "low"].includes(claim.confidence)) {
    errors.push(`invalid confidence on claim ${claim.id}`);
  }
  if (!["official", "news_derived", "analyst_estimate", "llm_inference", "manual_review"].includes(claim.sourceType)) {
    errors.push(`invalid source type on claim ${claim.id}`);
  }
  for (const sourceId of claim.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`unknown source ${sourceId} on claim ${claim.id}`);
  }
}

for (const signal of data.materialSignals ?? []) {
  if (!["up", "down", "tightening", "easing"].includes(signal.direction)) {
    errors.push(`invalid material signal direction: ${signal.id}`);
  }
  if (signal.sourceIds.length < 2) errors.push(`material signal ${signal.id} needs two sources`);
  for (const sourceId of signal.sourceIds) {
    if (!sourceIds.has(sourceId)) errors.push(`unknown source ${sourceId} on material signal ${signal.id}`);
  }
  for (const themeId of signal.themeIds) {
    if (!themeIds.has(themeId)) errors.push(`unknown theme ${themeId} on material signal ${signal.id}`);
  }
  for (const stock of signal.stockLinks) {
    if (!tickers.has(stock.ticker)) errors.push(`unknown ticker ${stock.ticker} on material signal ${signal.id}`);
  }
}

if (!data.run?.id || !data.run?.asOf || !data.dailyReport?.id) {
  errors.push("run and dailyReport identifiers are required");
}

if (errors.length) {
  console.error(`Validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${path.relative(root, candidate)}: ${data.themes.length} themes, ${data.groups.length} groups, ${data.companies.length} companies, ${data.sources.length} sources.`,
);
