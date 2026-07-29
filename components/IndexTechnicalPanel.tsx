import type { ResearchData, TechnicalScenario } from "@/lib/types";

const scenarioStatus: Record<TechnicalScenario["status"], string> = {
  observed: "已發生",
  conditional: "等待觸發",
  risk_case: "風險情境",
};

const confidenceLabel = {
  high: "高信心",
  medium: "中信心",
  low: "低信心",
} as const;

function formatIndex(value: number) {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function IndexTechnicalPanel({ data }: { data: ResearchData }) {
  const technical = data.indexTechnicalAnalysis;
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));

  return (
    <section className="technical-console" id="market-technical">
      <div className="container">
        <div className="technical-heading">
          <div>
            <p className="pulse-eyebrow">MARKET STRUCTURE · DAILY</p>
            <h2>大盤技術線型推演</h2>
          </div>
          <div className="technical-data-status">
            <span>正式收盤資料</span>
            <strong>{technical.asOf.slice(0, 10)}</strong>
          </div>
        </div>

        <div className="technical-overview">
          <article className="technical-verdict">
            <div className="technical-regime-row">
              <span>目前位階</span>
              <strong>{technical.regime}</strong>
            </div>
            <p>{technical.summary}</p>
            <div className="technical-snapshot">
              <div>
                <span>收盤</span>
                <strong>{formatIndex(technical.close)}</strong>
              </div>
              <div className={technical.changePercent > 0 ? "price-up" : technical.changePercent < 0 ? "price-down" : "price-flat"}>
                <span>單日</span>
                <strong>{technical.changePercent > 0 ? "+" : ""}{technical.changePercent.toFixed(2)}%</strong>
              </div>
              <div>
                <span>成交金額</span>
                <strong>{formatIndex(technical.turnoverBillionTwd * 10)} 億</strong>
              </div>
              <div>
                <span>20日量比</span>
                <strong>{technical.turnoverRatio20.toFixed(2)}×</strong>
              </div>
            </div>
            <div className="technical-observations">
              {technical.observations.map((observation) => (
                <p key={observation}><span aria-hidden="true">—</span>{observation}</p>
              ))}
            </div>
          </article>

          <article className="average-board" aria-label="大盤移動平均線">
            <div className="average-board-head">
              <div>
                <span>均線位階</span>
                <strong>價格在誰上、誰下</strong>
              </div>
              <small>依正式日線計算</small>
            </div>
            <div className="average-list">
              {technical.movingAverages.map((average) => {
                const gap = ((technical.close / average.value) - 1) * 100;
                return (
                  <div className={`average-row average-${average.position}`} key={average.period}>
                    <span>{average.period} 日線</span>
                    <strong>{formatIndex(average.value)}</strong>
                    <em>{gap > 0 ? "+" : ""}{gap.toFixed(1)}%</em>
                    <b>{average.position === "above" ? "站上" : "跌破"}</b>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <div className="scenario-heading">
          <div>
            <span>ABC</span>
            <div>
              <small>情境推演，不是命定劇本</small>
              <h3>每天依價量、均線與籌碼重新判讀</h3>
            </div>
          </div>
          <p>每個情境都必須有觸發條件與失效條件；條件沒發生，就不能把預測寫成事實。</p>
        </div>

        <div className="technical-scenarios">
          {technical.scenarios.map((scenario, index) => (
            <article className={`scenario-card scenario-${scenario.status}`} key={scenario.id}>
              <div className="scenario-card-head">
                <span>{String.fromCharCode(65 + index)}</span>
                <div>
                  <small>{scenarioStatus[scenario.status]} · {confidenceLabel[scenario.confidence]}</small>
                  <h3>{scenario.label}</h3>
                </div>
              </div>
              <p>{scenario.thesis}</p>
              <dl>
                <div>
                  <dt>觸發</dt>
                  <dd>{scenario.trigger}</dd>
                </div>
                <div>
                  <dt>觀察區</dt>
                  <dd>{scenario.targetZone}</dd>
                </div>
                <div>
                  <dt>失效</dt>
                  <dd>{scenario.invalidation}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="technical-bottom-grid">
          <article className="level-ladder">
            <div className="technical-subheading">
              <span>KEY LEVELS</span>
              <h3>支撐與反壓階梯</h3>
            </div>
            {technical.levels.map((level) => (
              <div className={`level-row level-${level.kind}`} key={`${level.label}-${level.value}`}>
                <strong>{formatIndex(level.value)}</strong>
                <div>
                  <span>{level.label}</span>
                  <p>{level.basis}</p>
                </div>
              </div>
            ))}
          </article>

          <article className="confirmation-board">
            <div className="technical-subheading">
              <span>NEXT CONFIRMATION</span>
              <h3>下一步只看這些</h3>
            </div>
            <ol>
              {technical.nextConfirmation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <div className="technical-sources">
              {technical.sourceIds.map((sourceId) => {
                const source = sourceById.get(sourceId);
                return source ? (
                  <a href={source.url} target="_blank" rel="noreferrer" key={sourceId}>
                    {source.publisher} ↗
                  </a>
                ) : null;
              })}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
