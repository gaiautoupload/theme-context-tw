import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = JSON.parse(
  await readFile(new URL("../data/seed-data.json", import.meta.url), "utf8"),
);

test("current published research set meets minimum scope", () => {
  assert.ok(data.themes.length >= 3);
  assert.ok(data.groups.length >= 2);
  assert.ok(data.companies.length >= 3);
  assert.ok(data.events.length >= 1);
  assert.ok(data.marketSignals.length >= 4);
});

test("market signals are fresh, sourced, and decision-oriented", () => {
  const sourceIds = new Set(data.sources.map((source) => source.id));
  const allowedFreshness = new Set(["breaking", "today", "recent", "scheduled", "active"]);
  assert.ok(data.marketSignals.some((signal) => signal.kind === "market_shock"));
  assert.ok(data.marketSignals.some((signal) => signal.kind === "leader_statement"));
  assert.ok(data.marketSignals.some((signal) => signal.kind === "rate_decision"));
  assert.ok(data.marketSignals.some((signal) => signal.kind === "company_release"));
  for (const signal of data.marketSignals) {
    assert.ok(allowedFreshness.has(signal.freshness));
    assert.ok(signal.marketMove.length > 0);
    assert.ok(signal.whyItMatters.length > 0);
    assert.ok(signal.nextWatch.length > 0);
    assert.ok(signal.sourceIds.length > 0);
    assert.ok(signal.sourceIds.every((id) => sourceIds.has(id)));
  }
});

test("identifiers, sources, and relationships are internally consistent", () => {
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const themeIds = new Set(data.themes.map((theme) => theme.id));
  const groupIds = new Set(data.groups.map((group) => group.id));
  const tickers = new Set(data.companies.map((company) => company.ticker));
  assert.equal(new Set(data.sources.map((source) => source.url)).size, data.sources.length);

  for (const theme of data.themes) {
    const publishers = new Set(
      theme.sourceIds.map((id) => sourceById.get(id)?.publisher).filter(Boolean),
    );
    assert.ok(publishers.size >= 2, `${theme.id} must have two independent publishers`);
    assert.ok(theme.score >= 0 && theme.score <= 100);
    assert.ok(["spark", "spreading", "hot", "cooling", "fading"].includes(theme.lifecycle));
    assert.ok(["rising", "stable", "falling"].includes(theme.momentum));
    assert.ok(theme.earlySignalScore >= 0 && theme.earlySignalScore <= 100);
    assert.ok(theme.marketHeat >= 0 && theme.marketHeat <= 100);
    assert.ok(theme.sparkSignals.length > 0);
    assert.ok(theme.spreadTriggers.length > 0);
    assert.ok(theme.invalidationSignals.length > 0);
  }
  for (const company of data.companies) {
    assert.match(company.ticker, /^\d{4}$/);
    if (company.groupId) assert.ok(groupIds.has(company.groupId));
  }
  for (const link of data.themeCompanyLinks) {
    assert.ok(themeIds.has(link.themeId));
    assert.ok(tickers.has(link.ticker));
  }
  for (const membership of data.groupMemberships) {
    assert.ok(groupIds.has(membership.groupId));
    assert.ok(tickers.has(membership.ticker));
  }
});

test("early-signal model exposes at least one low-heat spark", () => {
  const sparks = data.themes.filter(
    (theme) =>
      theme.lifecycle === "spark" &&
      theme.earlySignalScore >= 70 &&
      theme.marketHeat <= 40 &&
      theme.momentum === "rising",
  );
  assert.ok(sparks.length >= 1, "expected at least one rising spark before market heat");
});

test("material price signals map to themes and ranked stocks", () => {
  assert.ok(data.materialSignals.length >= 1);
  const themeIds = new Set(data.themes.map((theme) => theme.id));
  const tickers = new Set(data.companies.map((company) => company.ticker));
  for (const signal of data.materialSignals) {
    assert.ok(signal.sourceIds.length >= 2);
    assert.ok(signal.themeIds.every((id) => themeIds.has(id)));
    assert.ok(signal.stockLinks.length >= 1);
    assert.ok(signal.stockLinks.every((link) => tickers.has(link.ticker)));
  }
});

test("every claim has provenance and an inference label", () => {
  const sourceIds = new Set(data.sources.map((source) => source.id));
  for (const claim of data.claims) {
    assert.ok(["high", "medium", "low"].includes(claim.confidence));
    assert.ok(
      ["official", "news_derived", "analyst_estimate", "llm_inference", "manual_review"].includes(
        claim.sourceType,
      ),
    );
    assert.ok(claim.sourceIds.length > 0);
    for (const sourceId of claim.sourceIds) assert.ok(sourceIds.has(sourceId));
  }
});
