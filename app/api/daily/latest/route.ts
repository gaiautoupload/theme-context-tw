import { NextResponse } from "next/server";
import { getPublishedData } from "@/lib/data";

export async function GET() {
  const data = await getPublishedData();
  return NextResponse.json({
    run: data.run,
    report: data.dailyReport,
    events: data.events,
    topThemes: [...data.themes].sort((a, b) => b.score - a.score).slice(0, 5),
  });
}
