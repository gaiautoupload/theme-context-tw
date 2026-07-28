import Link from "next/link";
import type { Theme } from "@/lib/types";
import { LifecycleBadge } from "@/components/Badges";

export function SparkRadar({ themes }: { themes: Theme[] }) {
  const candidates = themes
    .filter((theme) => ["spark", "spreading"].includes(theme.lifecycle))
    .sort((a, b) => b.earlySignalScore - a.earlySignalScore);

  return (
    <section className="spark-radar" aria-labelledby="spark-radar-title">
      <div className="spark-radar-heading">
        <div>
          <p className="eyebrow">EARLY SIGNAL RADAR</p>
          <h2 id="spark-radar-title">市場還沒燒起來，證據先冒煙</h2>
        </div>
        <p>
          先行分數高、但市場熱度仍低，才是我們要找的小火苗。不是推薦買進，而是把值得提早驗證的主題拉到前面。
        </p>
      </div>

      <div className="spark-grid">
        {candidates.map((theme, index) => (
          <article className={index === 0 ? "spark-card spark-card-primary" : "spark-card"} key={theme.id}>
            <div className="spark-card-top">
              <LifecycleBadge lifecycle={theme.lifecycle} momentum={theme.momentum} />
              <span>首次發現 {theme.firstDetectedAt}</span>
            </div>
            <div className="spark-title-row">
              <div>
                <span>{theme.kicker}</span>
                <h3>{theme.name}</h3>
              </div>
              <strong>
                {theme.earlySignalScore}
                <small>先行分數</small>
              </strong>
            </div>

            <div className="heat-gap" aria-label={`先行分數 ${theme.earlySignalScore}，市場熱度 ${theme.marketHeat}`}>
              <div>
                <span>證據正在聚合</span>
                <b>{theme.earlySignalScore}</b>
                <i><em style={{ width: `${theme.earlySignalScore}%` }} /></i>
              </div>
              <div>
                <span>市場熱度</span>
                <b>{theme.marketHeat}</b>
                <i><em style={{ width: `${theme.marketHeat}%` }} /></i>
              </div>
            </div>

            <div className="spark-evidence">
              <div>
                <span>為什麼是小火苗</span>
                <ul>{theme.sparkSignals.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <span>什麼會開始擴散</span>
                <ul>{theme.spreadTriggers.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>

            <div className="spark-card-footer">
              <p><span>失效線</span>{theme.invalidationSignals[0]}</p>
              <Link href={`/themes/${theme.id}`}>追蹤這條火苗 →</Link>
            </div>
          </article>
        ))}
      </div>

      <div className="lifecycle-rail" aria-label="題材生命週期">
        {[
          ["01", "小火苗", "證據聚合、注意力低"],
          ["02", "擴散", "跨公司、跨媒體確認"],
          ["03", "火熱", "市場全面追逐"],
          ["04", "降溫", "動能與驗證轉弱"],
          ["05", "衰敗", "核心論點被推翻"],
        ].map(([number, title, copy], index) => (
          <div key={number} className={index === 0 ? "active" : ""}>
            <span>{number}</span><strong>{title}</strong><small>{copy}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
