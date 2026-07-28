import type { Metadata } from "next";
import Link from "next/link";
import { SignalMap } from "@/components/SignalMap";
import { ThemeCard } from "@/components/ThemeCard";
import { ConfidenceBadge, SourceTypeBadge } from "@/components/Badges";
import { SparkRadar } from "@/components/SparkRadar";
import { QuickDecisionBoard } from "@/components/QuickDecisionBoard";
import { getPublishedData, themeLinks } from "@/lib/data";

export const metadata: Metadata = {
  title: "今日脈絡",
  description: "今日全球事件、台股主題、企業集團與代表股的可追溯研究摘要。",
};

export default async function Home() {
  const data = await getPublishedData();
  const date = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(data.run.asOf));
  const highlightedClaims = data.claims.slice(0, 3);
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const sparkCount = data.themes.filter((theme) => theme.lifecycle === "spark").length;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">5-MINUTE MARKET RESEARCH · 五分鐘快研究</p>
            <h1>先看新題材，<br />再找最直接的股票。</h1>
            <p className="hero-lede"><strong>{data.dailyReport.title}</strong></p>
            <p className="hero-summary">{data.dailyReport.narrative}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="#quick-research">
                開始五分鐘快看
              </Link>
              <Link className="button button-secondary" href="#spark-radar-title">
                找小火苗
              </Link>
            </div>
          </div>
          <aside className="hero-brief">
            <div className="brief-meta">
              <span>資料時間</span>
              <strong>{date}</strong>
              <em>版本 {data.run.id}</em>
            </div>
            <div className="brief-stat">
              <strong>{data.themes.length}</strong>
              <span>今日主題</span>
            </div>
            <div className="brief-stat">
              <strong>{data.sources.length}</strong>
              <span>引用來源</span>
            </div>
            <div className="brief-stat">
              <strong>{sparkCount}</strong>
              <span>小火苗</span>
            </div>
            <p className="status-line">
              <span aria-hidden="true" />
              已通過來源、代號與關聯檢查
            </p>
          </aside>
        </div>
      </section>

      <div className="container">
        <QuickDecisionBoard data={data} />
        <SparkRadar themes={data.themes} />
      </div>

      <section className="container change-strip" aria-labelledby="changes-title">
        <p className="eyebrow" id="changes-title">WHAT CHANGED</p>
        <div>
          {data.dailyReport.changes.map((change, index) => (
            <article key={change}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{change}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="container">
        <SignalMap
          events={data.events}
          themes={data.themes}
          groups={data.groups}
          companies={data.companies}
          links={data.themeCompanyLinks}
          memberships={data.groupMemberships}
        />
      </div>

      <section className="container section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TOP THEMES</p>
            <h2>從小火苗到火熱，分開判讀</h2>
          </div>
          <p>題材強度衡量研究重要性；先行分數與市場熱度的落差，才用來辨識是否仍在早期。</p>
        </div>
        <div className="theme-grid">
          {data.themes.map((theme, index) => (
            <ThemeCard
              theme={theme}
              links={themeLinks(data, theme.id)}
              companies={data.companies}
              rank={index + 1}
              key={theme.id}
            />
          ))}
        </div>
      </section>

      <section className="container evidence-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EVIDENCE LAYER</p>
            <h2>把事實與推論分開看</h2>
          </div>
          <Link className="text-link" href="/sources">
            查看全部來源 →
          </Link>
        </div>
        <div className="evidence-grid">
          {highlightedClaims.map((claim) => (
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

      <section className="container watch-grid">
        <article className="watch-card signal-card">
          <p className="eyebrow">VALIDATION SIGNALS</p>
          <h2>接下來要驗證什麼</h2>
          <ul>
            {data.dailyReport.signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>
        <article className="watch-card risk-card">
          <p className="eyebrow">RISK RADAR</p>
          <h2>不能忽略的反證</h2>
          <ul>
            {data.dailyReport.risks.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
