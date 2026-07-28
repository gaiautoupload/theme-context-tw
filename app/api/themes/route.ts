import { NextResponse } from "next/server";
import { getPublishedData, themeLinks } from "@/lib/data";

export async function GET(request: Request) {
  const data = await getPublishedData();
  const lifecycle = new URL(request.url).searchParams.get("lifecycle");
  const themes = [...data.themes]
    .filter((theme) => !lifecycle || theme.lifecycle === lifecycle)
    .sort((a, b) => b.score - a.score)
    .map((theme) => ({
      ...theme,
      companies: themeLinks(data, theme.id),
    }));
  return NextResponse.json({ run: data.run, themes });
}
