import type { Metadata } from "next";
import { MarketPulseBoard } from "@/components/MarketPulseBoard";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = {
  title: "即時市場震源",
  description: "近 72 小時的大人物言論、央行決策、公司公告與市場異動。",
};

export default async function MarketPage() {
  const data = await getPublishedData();
  const date = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(data.run.asOf));

  return (
    <div className="research-page">
      <header className="container route-hero">
        <p className="pulse-eyebrow">LIVE MARKET WIRES</p>
        <h1>誰剛說了什麼，<br />價格為什麼改變？</h1>
        <p>只收近 72 小時的市場震源。已確認事實、媒體歸因與 Codex 傳導推論分開呈現。</p>
      </header>
      <MarketPulseBoard data={data} formattedDate={date} view="details" />
    </div>
  );
}
