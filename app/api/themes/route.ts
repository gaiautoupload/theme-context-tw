import { NextResponse } from "next/server";
import { getPublishedData, themeLinks } from "@/lib/data";

export async function GET() {
  const data = await getPublishedData();
  const themes = [...data.themes]
    .sort((a, b) => b.score - a.score)
    .map((theme) => ({
      ...theme,
      companies: themeLinks(data, theme.id),
    }));
  return NextResponse.json({ run: data.run, themes });
}
