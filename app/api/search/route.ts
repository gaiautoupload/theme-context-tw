import { NextResponse } from "next/server";
import { getPublishedData } from "@/lib/data";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLocaleLowerCase("zh-TW") ?? "";
  if (!query) return NextResponse.json({ query, results: [] });

  const data = await getPublishedData();
  const includes = (...values: Array<string | number>) =>
    values.some((value) => String(value).toLocaleLowerCase("zh-TW").includes(query));

  const results = [
    ...data.themes
      .filter((theme) => includes(theme.name, theme.kicker, theme.thesis, ...theme.chain))
      .map((theme) => ({
        type: "theme",
        id: theme.id,
        title: theme.name,
        summary: theme.thesis,
        lifecycle: theme.lifecycle,
        earlySignalScore: theme.earlySignalScore,
        marketHeat: theme.marketHeat,
        href: `/themes/${theme.id}`,
      })),
    ...data.groups
      .filter((group) => includes(group.name, group.description, ...group.focus))
      .map((group) => ({
        type: "group",
        id: group.id,
        title: group.name,
        summary: group.description,
        href: `/groups/${group.id}`,
      })),
    ...data.companies
      .filter((company) =>
        includes(company.ticker, company.name, company.industry, company.role, company.summary),
      )
      .map((company) => ({
        type: "stock",
        id: company.ticker,
        title: `${company.ticker} ${company.name}`,
        summary: company.summary,
        href: `/stocks/${company.ticker}`,
      })),
  ].slice(0, 30);

  return NextResponse.json({ query, results });
}
