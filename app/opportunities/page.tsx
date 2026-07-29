import type { Metadata } from "next";
import { AlertConsole } from "@/components/AlertConsole";
import { QuickDecisionBoard } from "@/components/QuickDecisionBoard";
import { SparkRadar } from "@/components/SparkRadar";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = {
  title: "小火苗與機會",
  description: "追蹤新題材、原物料傳導、擴散條件與關聯最直接的台股。",
};

export default async function OpportunitiesPage() {
  const data = await getPublishedData();
  const date = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(data.run.asOf));

  return (
    <div className="alert-home research-page">
      <header className="container route-hero">
        <p className="pulse-eyebrow">EARLY SIGNAL RADAR</p>
        <h1>先找冒煙的地方，<br />再等市場開始追。</h1>
        <p>從小火苗、擴散到火熱與衰敗；先看證據與失效線，再看股票關聯。</p>
      </header>
      <AlertConsole data={data} formattedDate={date} showHero={false} />
      <div className="container opportunity-depth">
        <QuickDecisionBoard data={data} />
        <SparkRadar themes={data.themes} />
      </div>
    </div>
  );
}
