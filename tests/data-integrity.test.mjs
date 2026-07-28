import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = JSON.parse(
  await readFile(new URL("../data/seed-data.json", import.meta.url), "utf8"),
);

test("first published research set meets launch scope", () => {
  assert.ok(data.themes.length >= 3);
  assert.ok(data.groups.length >= 3);
  assert.ok(data.companies.length >= 3);
  assert.ok(data.events.length >= 1);
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
