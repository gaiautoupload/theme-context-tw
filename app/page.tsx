import type { Metadata } from "next";
import Link from "next/link";
import { QuickDecisionBoard } from "@/components/QuickDecisionBoard";
import { MarketPulseBoard } from "@/components/MarketPulseBoard";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = {
  title: "今日脈絡",
  description: "今日市場主線與五分鐘台股決策總覽。",
};

export default async function Home() {
  const data = await getPublishedData();
  const date = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(data.run.asOf));
  const sparkCount = data.themes.filter((theme) => theme.lifecycle === "spark").length;

  return (
    <div className="alert-home">
      <MarketPulseBoard data={data} formattedDate={date} view="hero" />

      <div className="container">
        <section className="research-portals" aria-labelledby="portal-title">
          <div className="portal-heading">
            <div>
              <p className="pulse-eyebrow">CHOOSE YOUR VIEW</p>
              <h2 id="portal-title">不用一直往下滑，直接進入要看的研究。</h2>
            </div>
            <p>首頁只做決策總覽；新聞、技術線型、小火苗與因果地圖各自獨立。</p>
          </div>
          <div className="portal-grid">
            <Link href="/market">
              <span>01 · NOW</span>
              <strong>即時震源</strong>
              <p>大人物言論、央行決策、公司公告與市場異動。</p>
              <b>{data.marketSignals.length} 則訊號 →</b>
            </Link>
            <Link href="/technical">
              <span>02 · CHART</span>
              <strong>大盤技術</strong>
              <p>均線、量能、支撐反壓與每日 ABC 條件推演。</p>
              <b>{data.indexTechnicalAnalysis.regime} →</b>
            </Link>
            <Link href="/opportunities">
              <span>03 · EARLY</span>
              <strong>小火苗</strong>
              <p>新題材、原料漲價、擴散訊號與最直接關聯股。</p>
              <b>{sparkCount} 個早期主題 →</b>
            </Link>
            <Link href="/map">
              <span>04 · CONTEXT</span>
              <strong>脈絡地圖</strong>
              <p>從國際事件一路追到價值鏈、集團與台股。</p>
              <b>展開因果鏈 →</b>
            </Link>
          </div>
        </section>

        <QuickDecisionBoard data={data} />
      </div>
    </div>
  );
}
