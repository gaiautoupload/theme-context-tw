import type { Metadata } from "next";
import { IndexTechnicalPanel } from "@/components/IndexTechnicalPanel";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = {
  title: "大盤技術",
  description: "加權指數均線、量能、支撐反壓與 ABC 條件式情境推演。",
};

export default async function TechnicalPage() {
  const data = await getPublishedData();

  return (
    <div className="research-page">
      <header className="container route-hero route-hero-compact">
        <p className="pulse-eyebrow">TAIEX MARKET STRUCTURE</p>
        <h1>線型不是預言，<br />是每天重算的條件劇本。</h1>
        <p>正式收盤數據與分析師推論分開；每個情境都有觸發、觀察區與失效點。</p>
      </header>
      <IndexTechnicalPanel data={data} />
    </div>
  );
}
