import type { Metadata } from "next";
import Link from "next/link";
import { SignalMap } from "@/components/SignalMap";
import { ConfidenceBadge, SourceTypeBadge } from "@/components/Badges";
import { SparkRadar } from "@/components/SparkRadar";
import { QuickDecisionBoard } from "@/components/QuickDecisionBoard";
import { AlertConsole } from "@/components/AlertConsole";
import { MarketPulseBoard } from "@/components/MarketPulseBoard";
import { getPublishedData } from "@/lib/data";

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
    <div className="alert-home">
      <MarketPulseBoard data={data} formattedDate={date} />
      <AlertConsole data={data} formattedDate={date} showHero={false} />

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

      <div className="deep-research-shell">
        <div className="container">
          <div className="deep-research-intro">
            <p className="eyebrow">DEEP RESEARCH</p>
            <h2>五分鐘後，想深挖再往下。</h2>
            <p>{data.dailyReport.narrative}</p>
          </div>
          <SignalMap
            events={data.events}
            themes={data.themes}
            groups={data.groups}
            companies={data.companies}
            links={data.themeCompanyLinks}
            memberships={data.groupMemberships}
          />
        </div>

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

        <section className="container watch-grid" id="risk-radar">
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
      </div>
    </div>
  );
}
