import type { Metadata } from "next";
import Link from "next/link";
import { ConfidenceBadge, SourceTypeBadge } from "@/components/Badges";
import { SignalMap } from "@/components/SignalMap";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = {
  title: "投資脈絡地圖",
  description: "從國際事件追到投資主題、價值鏈、企業集團與台股。",
};

export default async function MapPage() {
  const data = await getPublishedData();
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));

  return (
    <div className="research-page">
      <header className="container route-hero">
        <p className="pulse-eyebrow">EVENT → THEME → STOCK</p>
        <h1>不要只看股票名字，<br />把整條因果鏈展開。</h1>
        <p>選一個主題，只顯示和它直接相連的事件、價值鏈、企業集團與代表股。</p>
      </header>
      <div className="container map-page-body">
        <SignalMap
          events={data.events}
          themes={data.themes}
          groups={data.groups}
          companies={data.companies}
          links={data.themeCompanyLinks}
          memberships={data.groupMemberships}
        />
        <section className="evidence-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVIDENCE LAYER</p>
              <h2>把事實與推論分開看</h2>
            </div>
            <Link className="text-link" href="/sources">查看全部來源 →</Link>
          </div>
          <div className="evidence-grid">
            {data.claims.slice(0, 3).map((claim) => (
              <article key={claim.id}>
                <div className="badge-row">
                  <SourceTypeBadge type={claim.sourceType} />
                  <ConfidenceBadge confidence={claim.confidence} />
                </div>
                <p>{claim.statement}</p>
                <div className="claim-sources">
                  {claim.sourceIds.map((id) => {
                    const source = sourceById.get(id);
                    return source ? (
                      <a href={source.url} target="_blank" rel="noreferrer" key={id}>
                        {source.publisher} ↗
                      </a>
                    ) : null;
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
