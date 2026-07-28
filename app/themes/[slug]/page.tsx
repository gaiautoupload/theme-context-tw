import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidenceBadge, SourceTypeBadge, ThemeScore } from "@/components/Badges";
import { LifecycleBadge } from "@/components/Badges";
import { companyMap, getPublishedData, sourceMap, themeLinks } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedData();
  const theme = data.themes.find((item) => item.id === slug);
  return theme
    ? { title: theme.name, description: theme.thesis }
    : { title: "找不到主題" };
}

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublishedData();
  const theme = data.themes.find((item) => item.id === slug);
  if (!theme) notFound();

  const links = themeLinks(data, theme.id);
  const companies = companyMap(data);
  const sources = sourceMap(data);
  const claims = data.claims.filter(
    (claim) => claim.entityType === "theme" && claim.entityId === theme.id,
  );

  return (
    <div className="container page-shell">
      <Link className="back-link" href="/themes">← 回到投資主題</Link>
      <header className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">{theme.kicker}</p>
          <h1>{theme.name}</h1>
          <p className="detail-thesis">{theme.thesis}</p>
          <div className="detail-tags">
            <LifecycleBadge lifecycle={theme.lifecycle} momentum={theme.momentum} />
            <span>{theme.stage}</span>
            <span>{theme.direction}</span>
            <span>{theme.sourceIds.length} 個主要來源</span>
          </div>
        </div>
        <ThemeScore score={theme.score} />
      </header>

      <section className="theme-lifecycle-panel">
        <div>
          <p className="eyebrow">LIFECYCLE POSITION</p>
          <h2>這個題材現在燒到哪裡？</h2>
          <p>首次偵測於 {theme.firstDetectedAt}。先行分數 {theme.earlySignalScore}，市場熱度 {theme.marketHeat}。</p>
        </div>
        <div className="heat-gap detail-heat-gap">
          <div><span>證據聚合</span><b>{theme.earlySignalScore}</b><i><em style={{ width: `${theme.earlySignalScore}%` }} /></i></div>
          <div><span>市場熱度</span><b>{theme.marketHeat}</b><i><em style={{ width: `${theme.marketHeat}%` }} /></i></div>
        </div>
        <div className="lifecycle-detail-grid">
          <article><span>早期證據</span><ul>{theme.sparkSignals.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>擴散條件</span><ul>{theme.spreadTriggers.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>失效條件</span><ul>{theme.invalidationSignals.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className="answer-grid">
        <article>
          <span>為什麼現在重要</span>
          <p>{theme.whyNow}</p>
        </article>
        <article>
          <span>誰有機會拿走價值</span>
          <p>{theme.valueCapture}</p>
        </article>
      </section>

      <section className="detail-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">VALUE CHAIN</p>
            <h2>價值鏈與商用路徑</h2>
          </div>
        </div>
        <div className="value-chain">
          {theme.chain.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              <small>{index < theme.chain.length - 1 ? "價值向下傳遞" : "最終交付"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">STOCK RELEVANCE</p>
            <h2>概念股主篩選表</h2>
          </div>
          <p>關聯度衡量產業位置與證據完整度，不代表預期報酬。</p>
        </div>
        <div className="stock-table" role="table" aria-label={`${theme.name}概念股`}>
          <div className="stock-row stock-head" role="row">
            <span role="columnheader">公司</span>
            <span role="columnheader">供應鏈角色</span>
            <span role="columnheader">判斷</span>
            <span role="columnheader">關聯度</span>
          </div>
          {links.map((link) => {
            const company = companies.get(link.ticker);
            return company ? (
              <Link
                className="stock-row"
                role="row"
                href={`/stocks/${company.ticker}`}
                key={company.ticker}
              >
                <span role="cell"><strong>{company.name}</strong><small>{company.ticker}</small></span>
                <span role="cell">{link.role}</span>
                <span role="cell"><em>{link.stance}</em>{link.reasoning}</span>
                <span role="cell"><b>{link.relevance}</b>/100</span>
              </Link>
            ) : null;
          })}
        </div>
      </section>

      <section className="catalyst-risk-grid">
        <article>
          <p className="eyebrow">CATALYSTS</p>
          <h2>股價催化與驗證事件</h2>
          <ul>{theme.catalysts.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <p className="eyebrow">COUNTER EVIDENCE</p>
          <h2>可能推翻論點的風險</h2>
          <ul>{theme.risks.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>

      {claims.length > 0 && (
        <section className="detail-section">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">CLAIMS & PROVENANCE</p>
              <h2>結論的證據層級</h2>
            </div>
          </div>
          <div className="claim-list">
            {claims.map((claim) => (
              <article key={claim.id}>
                <div className="badge-row">
                  <SourceTypeBadge type={claim.sourceType} />
                  <ConfidenceBadge confidence={claim.confidence} />
                </div>
                <p>{claim.statement}</p>
                <div className="claim-sources">
                  {claim.sourceIds.map((id) => {
                    const source = sources.get(id);
                    return source ? (
                      <a href={source.url} target="_blank" rel="noreferrer" key={id}>
                        {source.publisher} · {source.publishedAt} ↗
                      </a>
                    ) : null;
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="source-box">
        <div>
          <p className="eyebrow">PRIMARY SOURCES</p>
          <h2>本主題主要依據</h2>
        </div>
        <div>
          {theme.sourceIds.map((id) => {
            const source = sources.get(id);
            return source ? (
              <a href={source.url} target="_blank" rel="noreferrer" key={id}>
                <span>{source.publisher}</span>
                <strong>{source.title}</strong>
                <small>{source.publishedAt} · {source.quality} ↗</small>
              </a>
            ) : null;
          })}
        </div>
      </section>
    </div>
  );
}
