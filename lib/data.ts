import seedJson from "@/data/seed-data.json";
import type { ResearchData } from "@/lib/types";
import { getRuntimeEnv } from "@/lib/runtime-env";

const seedData = seedJson as ResearchData;

export async function getPublishedData(): Promise<ResearchData> {
  try {
    const binding = getRuntimeEnv().DB;
    if (!binding) return seedData;

    const row = await binding
      .prepare(
        "SELECT payload FROM published_snapshots ORDER BY published_at DESC LIMIT 1",
      )
      .first<{ payload: string }>();

    if (!row?.payload) return seedData;
    const parsed = JSON.parse(row.payload) as Partial<ResearchData>;
    if (
      !parsed.indexTechnicalAnalysis?.id ||
      !Array.isArray(parsed.marketSignals) ||
      !Array.isArray(parsed.materialSignals) ||
      !Array.isArray(parsed.themes) ||
      parsed.themes.some((theme) => !theme.lifecycle)
    ) {
      return seedData;
    }
    return parsed as ResearchData;
  } catch {
    return seedData;
  }
}

export function getSeedData(): ResearchData {
  return seedData;
}

export function sourceMap(data: ResearchData) {
  return new Map(data.sources.map((source) => [source.id, source]));
}

export function companyMap(data: ResearchData) {
  return new Map(data.companies.map((company) => [company.ticker, company]));
}

export function themeLinks(data: ResearchData, themeId: string) {
  return data.themeCompanyLinks
    .filter((link) => link.themeId === themeId)
    .sort((a, b) => b.relevance - a.relevance);
}

export function groupCompanies(data: ResearchData, groupId: string) {
  const tickers = new Set(
    data.groupMemberships
      .filter((membership) => membership.groupId === groupId)
      .map((membership) => membership.ticker),
  );
  return data.companies.filter((company) => tickers.has(company.ticker));
}

export function groupThemes(data: ResearchData, groupId: string) {
  const tickers = new Set(groupCompanies(data, groupId).map((company) => company.ticker));
  const themeIds = new Set(
    data.themeCompanyLinks
      .filter((link) => tickers.has(link.ticker))
      .map((link) => link.themeId),
  );
  return data.themes.filter((theme) => themeIds.has(theme.id));
}
