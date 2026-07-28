import { NextResponse } from "next/server";
import type { ResearchData } from "@/lib/types";
import { validateResearchData } from "@/lib/validation";
import { getRuntimeEnv } from "@/lib/runtime-env";

function json(value: unknown) {
  return JSON.stringify(value);
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function authorized(request: Request) {
  const expected =
    getRuntimeEnv().SYNC_TOKEN ?? process.env.SYNC_TOKEN;
  const received = request.headers.get("authorization");
  return Boolean(expected && received === `Bearer ${expected}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: ResearchData;
  let raw: string;
  try {
    raw = await request.text();
    data = JSON.parse(raw) as ResearchData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateResearchData(data);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Schema validation failed", details: validation.errors },
      { status: 422 },
    );
  }

  const binding = getRuntimeEnv().DB;
  if (!binding) {
    return NextResponse.json({ error: "D1 binding unavailable" }, { status: 503 });
  }

  const contentHash = await sha256(raw);
  const existing = await binding
    .prepare("SELECT content_hash, status FROM sync_jobs WHERE run_id = ?")
    .bind(data.run.id)
    .first<{ content_hash: string; status: string }>();

  if (existing) {
    if (existing.content_hash !== contentHash) {
      return NextResponse.json(
        { error: "run_id already exists with different content" },
        { status: 409 },
      );
    }
    return NextResponse.json({
      ok: true,
      idempotent: true,
      runId: data.run.id,
      contentHash,
    });
  }

  const now = new Date().toISOString();
  const statements = [
    binding
      .prepare(
        "INSERT INTO sync_jobs (run_id, content_hash, status, started_at, finished_at, error_message) VALUES (?, ?, 'published', ?, ?, NULL)",
      )
      .bind(data.run.id, contentHash, now, now),
    binding
      .prepare(
        "INSERT INTO research_runs (id, as_of, status, content_hash, created_at, published_at) VALUES (?, ?, 'published', ?, ?, ?)",
      )
      .bind(data.run.id, data.run.asOf, contentHash, now, now),
    ...[
      "sources",
      "claims",
      "events",
      "themes",
      "companies",
      "corporate_groups",
      "group_memberships",
      "theme_company_links",
      "daily_reports",
      "material_signals",
    ].map((table) => binding.prepare(`DELETE FROM ${table}`)),
    ...data.sources.map((source) =>
      binding
        .prepare(
          "INSERT INTO sources (id, run_id, title, publisher, url, published_at, retrieved_at, source_type, quality) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          source.id,
          data.run.id,
          source.title,
          source.publisher,
          source.url,
          source.publishedAt,
          source.retrievedAt,
          source.sourceType,
          source.quality,
        ),
    ),
    ...data.claims.map((claim) =>
      binding
        .prepare(
          "INSERT INTO claims (id, run_id, entity_type, entity_id, statement, confidence, source_type, source_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          claim.id,
          data.run.id,
          claim.entityType,
          claim.entityId,
          claim.statement,
          claim.confidence,
          claim.sourceType,
          json(claim.sourceIds),
        ),
    ),
    ...data.events.map((event) =>
      binding
        .prepare(
          "INSERT INTO events (id, run_id, title, summary, region, happened_at, impact, source_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          event.id,
          data.run.id,
          event.title,
          event.summary,
          event.region,
          event.happenedAt,
          event.impact,
          json(event.sourceIds),
        ),
    ),
    ...data.themes.map((theme) =>
      binding
        .prepare(
          "INSERT INTO themes (id, run_id, name, kicker, score, stage, direction, lifecycle, first_detected_at, early_signal_score, market_heat, momentum, spark_signals, spread_triggers, invalidation_signals, thesis, why_now, value_capture, chain, catalysts, risks, source_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          theme.id,
          data.run.id,
          theme.name,
          theme.kicker,
          theme.score,
          theme.stage,
          theme.direction,
          theme.lifecycle,
          theme.firstDetectedAt,
          theme.earlySignalScore,
          theme.marketHeat,
          theme.momentum,
          json(theme.sparkSignals),
          json(theme.spreadTriggers),
          json(theme.invalidationSignals),
          theme.thesis,
          theme.whyNow,
          theme.valueCapture,
          json(theme.chain),
          json(theme.catalysts),
          json(theme.risks),
          json(theme.sourceIds),
        ),
    ),
    ...data.companies.map((company) =>
      binding
        .prepare(
          "INSERT INTO companies (ticker, run_id, name, industry, role, group_id, summary) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          company.ticker,
          data.run.id,
          company.name,
          company.industry,
          company.role,
          company.groupId,
          company.summary,
        ),
    ),
    ...data.groups.map((group) =>
      binding
        .prepare(
          "INSERT INTO corporate_groups (id, run_id, name, description, focus, source_ids) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .bind(
          group.id,
          data.run.id,
          group.name,
          group.description,
          json(group.focus),
          json(group.sourceIds),
        ),
    ),
    ...data.groupMemberships.map((membership) =>
      binding
        .prepare(
          "INSERT INTO group_memberships (run_id, group_id, ticker, relation) VALUES (?, ?, ?, ?)",
        )
        .bind(data.run.id, membership.groupId, membership.ticker, membership.relation),
    ),
    ...data.themeCompanyLinks.map((link) =>
      binding
        .prepare(
          "INSERT INTO theme_company_links (run_id, theme_id, ticker, relevance, role, stance, reasoning) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          data.run.id,
          link.themeId,
          link.ticker,
          link.relevance,
          link.role,
          link.stance,
          link.reasoning,
        ),
    ),
    binding
      .prepare(
        "INSERT INTO daily_reports (id, run_id, title, eyebrow, narrative, changes, signals, risks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        data.dailyReport.id,
        data.run.id,
        data.dailyReport.title,
        data.dailyReport.eyebrow,
        data.dailyReport.narrative,
        json(data.dailyReport.changes),
        json(data.dailyReport.signals),
        json(data.dailyReport.risks),
      ),
    ...data.materialSignals.map((signal) =>
      binding
        .prepare(
          "INSERT INTO material_signals (id, run_id, material, direction, change_label, period, status, thesis, source_ids, theme_ids, stock_links) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          signal.id,
          data.run.id,
          signal.material,
          signal.direction,
          signal.change,
          signal.period,
          signal.status,
          signal.thesis,
          json(signal.sourceIds),
          json(signal.themeIds),
          json(signal.stockLinks),
        ),
    ),
    binding
      .prepare(
        "INSERT INTO published_snapshots (run_id, content_hash, payload, published_at) VALUES (?, ?, ?, ?) ON CONFLICT(run_id) DO UPDATE SET content_hash = excluded.content_hash, payload = excluded.payload, published_at = excluded.published_at",
      )
      .bind(data.run.id, contentHash, raw, now),
  ];

  try {
    await binding.batch(statements);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Sync transaction failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    idempotent: false,
    runId: data.run.id,
    contentHash,
    publishedAt: now,
  });
}
