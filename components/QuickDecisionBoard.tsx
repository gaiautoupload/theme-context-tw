import Link from "next/link";
import type { ResearchData, Theme } from "@/lib/types";
import { LifecycleBadge } from "@/components/Badges";

function topSpark(themes: Theme[]) {
  return [...themes]
    .filter((theme) => theme.lifecycle === "spark")
    .sort((a, b) => b.earlySignalScore - a.earlySignalScore)[0];
}

export function QuickDecisionBoard({ data }: { data: ResearchData }) {
  const spark = topSpark(data.themes);
  const sparkLinks = spark
    ? data.themeCompanyLinks
        .filter((link) => link.themeId === spark.id)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 3)
    : [];
  const companies = new Map(data.companies.map((company) => [company.ticker, company]));

  return (
    <section className="quick-board" id="quick-research" aria-labelledby="quick-title">
      <div className="quick-heading">
        <div>
          <span>5 MIN</span>
          <div>
            <p className="eyebrow">QUICK RESEARCH</p>
            <h2 id="quick-title">五分鐘，只看會影響判斷的事</h2>
          </div>
        </div>
        <p>先看新題材，再看成本傳導，最後只留下關聯最直接的公司。</p>
      </div>

      <div className="quick-grid">
        <article className="quick-panel new-theme-panel">
          <div className="quick-step"><span>1</span><strong>今天的新題材</strong></div>
          {spark ? (
            <>
              <LifecycleBadge lifecycle={spark.lifecycle} momentum={spark.momentum} />
              <h3>{spark.name}</h3>
              <p className="quick-thesis">{spark.sparkSignals[0]}</p>
              <dl>
                <div><dt>為何還早</dt><dd>市場熱度 {spark.marketHeat}，低於先行分數 {spark.earlySignalScore}</dd></div>
                <div><dt>何時擴散</dt><dd>{spark.spreadTriggers[0]}</dd></div>
                <div><dt>何時失效</dt><dd>{spark.invalidationSignals[0]}</dd></div>
              </dl>
              <Link href={`/themes/${spark.id}`}>看完整研究 →</Link>
            </>
          ) : (
            <p className="quick-empty">今天沒有通過來源門檻的小火苗。</p>
          )}
        </article>

        <article className="quick-panel material-panel">
          <div className="quick-step"><span>2</span><strong>原料／成本正在動</strong></div>
          {data.materialSignals.length ? (
            data.materialSignals.slice(0, 2).map((signal) => (
              <div className="material-signal" key={signal.id}>
                <div>
                  <span>{signal.period}</span>
                  <em>{signal.status}</em>
                </div>
                <h3>{signal.material}</h3>
                <strong>{signal.change}</strong>
                <p>{signal.thesis}</p>
                <div className="material-chain">
                  {signal.themeIds.map((themeId) => {
                    const theme = data.themes.find((item) => item.id === themeId);
                    return theme ? <Link href={`/themes/${theme.id}`} key={theme.id}>連動：{theme.name} →</Link> : null;
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="quick-empty">
              <strong>今天沒有達發布門檻的漲價訊號</strong>
              <p>沒有兩個獨立來源就不硬湊題材。</p>
            </div>
          )}
        </article>

        <article className="quick-panel stock-rank-panel">
          <div className="quick-step"><span>3</span><strong>誰的關聯最直接</strong></div>
          <p className="stock-rank-context">依產業位置與證據排序，不是漲停預測。</p>
          <div className="quick-stock-list">
            {sparkLinks.map((link, index) => {
              const company = companies.get(link.ticker);
              return company ? (
                <Link href={`/stocks/${company.ticker}`} key={company.ticker}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{company.name}<small>{company.ticker}</small></strong>
                    <p>{link.role}</p>
                  </div>
                  <b>{link.relevance}<small>關聯度</small></b>
                </Link>
              ) : null;
            })}
          </div>
          <div className="quote-status">
            <span>即時漲停／價量</span>
            <strong>尚未接行情源</strong>
            <p>不以新聞熱度假裝即時訊號。</p>
          </div>
        </article>
      </div>
    </section>
  );
}
