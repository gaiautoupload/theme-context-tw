import { NextResponse } from "next/server";
import { getPublishedData, groupCompanies, groupThemes } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getPublishedData();
  const group = data.groups.find((item) => item.id === slug);
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  return NextResponse.json({
    run: data.run,
    group,
    companies: groupCompanies(data, group.id),
    memberships: data.groupMemberships.filter((item) => item.groupId === group.id),
    themes: groupThemes(data, group.id),
    claims: data.claims.filter(
      (claim) => claim.entityType === "group" && claim.entityId === group.id,
    ),
    sources: data.sources.filter((source) => group.sourceIds.includes(source.id)),
  });
}
