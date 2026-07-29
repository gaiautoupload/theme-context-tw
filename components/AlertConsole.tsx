import Link from "next/link";
import type { ResearchData, Theme } from "@/lib/types";
import { AlertRuleBuilder } from "@/components/AlertRuleBuilder";

function relatedStocks(data: ResearchData, theme: Theme, limit = 3) {
  const companies = new Map(data.companies.map((company) => [company.ticker, company]));
  return data.themeCompanyLinks
    .filter((link) => link.themeId === theme.id)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)
    .map((link) => ({
      ...link,
      name: companies.get(link.ticker)?.name ?? link.ticker,
    }));
}

export function AlertConsole({
  data,
  formattedDate,
}: {
  data: ResearchData;
  formattedDate: string;
}) {
  const spark = [...data.themes]
    .filter((theme) => theme.lifecycle === "spark")
    .sort((a, b) => b.earlySignalScore - a.earlySignalScore)[0];
  const spreading = [...data.themes]
    .filter((theme) => theme.lifecycle === "spreading")
    .sort((a, b) => b.earlySignalScore - a.earlySignalScore)[0];
  const material = data.materialSignals[0];
  const sparkStocks = spark ? relatedStocks(data, spark) : [];
  const spreadingStocks = spreading ? relatedStocks(data, spreading) : [];
  const materialStocks = material
    ? material.stockLinks.slice(0, 3).map((link) => ({
        ...link,
        name: data.companies.find((company) => company.ticker === link.ticker)?.name ?? link.ticker,
      }))
    : [];
  const triggeredCount = [spark, material, spreading].filter(Boolean).length;

  return (
    <>
      <section className="alert-hero" id="alerts">
        <div className="container alert-category-row" aria-label="訊號分類">
          <a className="active" href="#triggered-alerts">全部快訊</a>
          <a href="#spark-radar-title">小火苗</a>
          <a href="#quick-research">原料漲價</a>
          <a href="#triggered-alerts">題材擴散</a>
          <a href="#risk-radar">風險反證</a>
        </div>

        <div className="container alert-hero-grid">
          <div className="alert-hero-copy">
            <p className="alert-kicker">THEME ALERTS · 台股題材警報</p>
            <h1>小火苗剛冒煙，<br />網站就叫你。</h1>
            <p>
              不必讀完所有新聞。把全球事件、原料價格與產業訊號，轉成「何時值得看、最相關是誰、何時失效」。
            </p>
            <div className="alert-daily-brief">
              <span>今日總結</span>
              <strong>{data.dailyReport.title}</strong>
            </div>
            <div className="alert-hero-actions">
              <a className="alert-primary-button" href="#triggered-alerts">{`查看 ${triggeredCount} 個觸發訊號`}</a>
              <a className="alert-ghost-button" href="#build-alert">設定我的條件</a>
            </div>
            <div className="alert-data-line">
              <span><i aria-hidden="true" />研究已更新</span>
              <span>{formattedDate}</span>
              <span>下一次：工作日 18:30</span>
            </div>
          </div>

          <div className="alert-visual" aria-label="小火苗警報示意">
            <div className="visual-toolbar">
              <span>小火苗雷達</span>
              <span>先行證據 vs. 市場熱度</span>
              <b>● LIVE</b>
            </div>
            <div className="visual-chart">
              <div className="visual-grid" aria-hidden="true" />
              <svg viewBox="0 0 720 280" role="img" aria-label="先行訊號向上突破警報線">
                <defs>
                  <linearGradient id="alertFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#35f0b2" stopOpacity=".38" />
                    <stop offset="100%" stopColor="#35f0b2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="chart-fill"
                  d="M0,230 L75,220 L130,205 L190,218 L255,182 L310,198 L370,168 L432,175 L485,130 L550,146 L610,120 L660,42 L720,28 L720,280 L0,280 Z"
                  fill="url(#alertFill)"
                />
                <path
                  className="chart-line"
                  d="M0,230 L75,220 L130,205 L190,218 L255,182 L310,198 L370,168 L432,175 L485,130 L550,146 L610,120 L660,42 L720,28"
                  fill="none"
                />
              </svg>
              <div className="alert-threshold"><span>警報線 · 先行 80</span></div>
              {spark ? (
                <div className="chart-alert-card">
                  <span>⚡ 小火苗已觸發</span>
                  <strong>{spark.name}</strong>
                  <p>先行 {spark.earlySignalScore} · 熱度 {spark.marketHeat}</p>
                </div>
              ) : null}
              <div className="chart-bell" aria-hidden="true">!</div>
            </div>
            <div className="visual-footer">
              <span>新聞證據</span><b>→</b><span>產業傳導</span><b>→</b><span>台股關聯</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container triggered-alerts" id="triggered-alerts" aria-labelledby="triggered-title">
        <div className="alert-section-heading">
          <div>
            <p className="alert-kicker">TRIGGERED NOW</p>
            <h2 id="triggered-title">{`現在只處理這 ${triggeredCount} 件事`}</h2>
          </div>
          <p>先看觸發原因，再看最直接的股票；關聯度不是漲停機率，也不是買進指令。</p>
        </div>

        <div className="trigger-card-grid">
          {spark ? (
            <article className="trigger-card trigger-card-primary">
              <div className="trigger-card-head">
                <span><i aria-hidden="true" />小火苗</span>
                <small>剛觸發</small>
              </div>
              <p className="trigger-condition">先行分數 ≥ 80 · 市場熱度 ≤ 40</p>
              <h3>{spark.name}</h3>
              <p>{spark.sparkSignals[0]}</p>
              <div className="trigger-score-row">
                <div><span>先行</span><strong>{spark.earlySignalScore}</strong></div>
                <div><span>熱度</span><strong>{spark.marketHeat}</strong></div>
                <div><span>差距</span><strong>+{spark.earlySignalScore - spark.marketHeat}</strong></div>
              </div>
              <div className="alert-stock-chips">
                {sparkStocks.map((stock) => (
                  <Link href={`/stocks/${stock.ticker}`} key={stock.ticker}>
                    <strong>{stock.name}</strong><span>{stock.ticker} · 關聯 {stock.relevance}</span>
                  </Link>
                ))}
              </div>
              <Link className="trigger-detail-link" href={`/themes/${spark.id}`}>查看觸發證據 →</Link>
            </article>
          ) : null}

          {material ? (
            <article className="trigger-card">
              <div className="trigger-card-head material">
                <span><i aria-hidden="true" />原料漲價</span>
                <small>{material.period}</small>
              </div>
              <p className="trigger-condition">{material.status}</p>
              <h3>{material.material}</h3>
              <strong className="material-change">{material.change}</strong>
              <p>{material.thesis}</p>
              <div className="alert-stock-chips">
                {materialStocks.map((stock) => (
                  <Link href={`/stocks/${stock.ticker}`} key={stock.ticker}>
                    <strong>{stock.name}</strong><span>{stock.ticker} · {stock.relationship === "cost_pressure" ? "成本承壓" : "直接受惠"}</span>
                  </Link>
                ))}
              </div>
              <a className="trigger-detail-link" href="#quick-research">看完整傳導鏈 →</a>
            </article>
          ) : null}

          {spreading ? (
            <article className="trigger-card">
              <div className="trigger-card-head spreading">
                <span><i aria-hidden="true" />開始擴散</span>
                <small>持續追蹤</small>
              </div>
              <p className="trigger-condition">跨公司驗證 · 動能 {spreading.momentum === "rising" ? "上升" : "穩定"}</p>
              <h3>{spreading.name}</h3>
              <p>{spreading.spreadTriggers[0]}</p>
              <div className="trigger-score-row">
                <div><span>先行</span><strong>{spreading.earlySignalScore}</strong></div>
                <div><span>熱度</span><strong>{spreading.marketHeat}</strong></div>
                <div><span>關注</span><strong>{spreading.score}</strong></div>
              </div>
              <div className="alert-stock-chips">
                {spreadingStocks.map((stock) => (
                  <Link href={`/stocks/${stock.ticker}`} key={stock.ticker}>
                    <strong>{stock.name}</strong><span>{stock.ticker} · 關聯 {stock.relevance}</span>
                  </Link>
                ))}
              </div>
              <Link className="trigger-detail-link" href={`/themes/${spreading.id}`}>查看擴散條件 →</Link>
            </article>
          ) : null}
        </div>
      </section>

      <div className="container" id="build-alert">
        <AlertRuleBuilder />
      </div>
    </>
  );
}
