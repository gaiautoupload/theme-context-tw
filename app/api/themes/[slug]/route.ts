import { NextResponse } from "next/server";
import { getPublishedData, themeLinks } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getPublishedData();
  const theme = data.themes.find((item) => item.id === slug);
  if (!theme) return NextResponse.json({ error: "Theme not found" }, { status: 404 });

  const links = themeLinks(data, theme.id);
  return NextResponse.json({
    run: data.run,
    theme,
    companies: links.map((link) => ({
      ...link,
      company: data.companies.find((company) => company.ticker === link.ticker),
    })),
    claims: data.claims.filter(
      (claim) => claim.entityType === "theme" && claim.entityId === theme.id,
    ),
    sources: data.sources.filter((source) => theme.sourceIds.includes(source.id)),
  });
}
