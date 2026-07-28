import type { Metadata } from "next";
import { SourceTypeBadge } from "@/components/Badges";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = {
  title: "證據來源",
  description: "題材脈絡使用的官方資料、新聞來源與擷取時間。",
};

export default async function SourcesPage() {
  const data = await getPublishedData();
  return (
    <div className="container page-shell">
      <header className="page-hero">
        <p className="eyebrow">SOURCE LEDGER</p>
        <h1>先看來源，再看結論。</h1>
        <p>
          本站不保存新聞全文，只保存標題、發布者、網址、日期與研究結論的關聯。
          重要數字優先使用官方資料；新聞負責提供事件脈絡。
        </p>
      </header>
      <div className="source-ledger">
        {data.sources.map((source, index) => (
          <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
            <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <div className="badge-row">
                <SourceTypeBadge type={source.sourceType} />
                <span className="quality-badge">品質 {source.quality}</span>
              </div>
              <strong>{source.title}</strong>
              <p>{source.publisher}</p>
            </div>
            <div className="source-date">
              <span>發布 {source.publishedAt}</span>
              <small>擷取 {source.retrievedAt.slice(0, 10)}</small>
              <b>開啟來源 ↗</b>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
