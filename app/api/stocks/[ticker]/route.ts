import { NextResponse } from "next/server";
import { getPublishedData } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const data = await getPublishedData();
  const company = data.companies.find((item) => item.ticker === ticker);
  if (!company) return NextResponse.json({ error: "Stock not found" }, { status: 404 });

  const links = data.themeCompanyLinks.filter((link) => link.ticker === company.ticker);
  return NextResponse.json({
    run: data.run,
    company,
    group: data.groups.find((group) => group.id === company.groupId) ?? null,
    themes: links.map((link) => ({
      link,
      theme: data.themes.find((theme) => theme.id === link.themeId),
    })),
    claims: data.claims.filter(
      (claim) => claim.entityType === "stock" && claim.entityId === company.ticker,
    ),
  });
}
