import type { Metadata } from "next";
import Link from "next/link";
import { SignalMap } from "@/components/SignalMap";
import { ThemeCard } from "@/components/ThemeCard";
import { ConfidenceBadge, SourceTypeBadge } from "@/components/Badges";
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

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">DAILY MARKET CONTEXT · 收盤後研究</p>
            <h1>{data.dailyReport.title}</h1>
            <p className="hero-lede">{data.dailyReport.narrative}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/themes">
                查看今日主題
              </Link>
              <Link className="button button-secondary" href="/methodology">
                研究如何產生
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
              <strong>{data.groups.length}</strong>
              <span>企業集團</span>
            </div>
            <p className="status-line">
              <span aria-hidden="true" />
              已通過來源、代號與關聯檢查
            </p>
          </aside>
        </div>
      </section>

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
            <h2>今天最值得追蹤的五條主線</h2>
          </div>
          <p>強度不是漲幅預測，而是來源品質、催化新鮮度、商用階段與價值捕捉的綜合分數。</p>
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
