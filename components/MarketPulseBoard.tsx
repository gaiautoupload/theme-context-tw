import Link from "next/link";
import type {
  MarketSignal,
  MarketSignalFreshness,
  ResearchData,
} from "@/lib/types";

const freshnessLabel: Record<MarketSignalFreshness, string> = {
  breaking: "剛剛發生",
  today: "24 小時內",
  recent: "72 小時內",
  scheduled: "即將公布",
  active: "持續生效",
};

const kindLabel: Record<MarketSignal["kind"], string> = {
  market_shock: "市場大震盪",
  leader_statement: "大人物一句話",
  policy_action: "政策衝擊",
  rate_decision: "央行決策",
  company_release: "公司快訊",
};

function SignalSources({
  signal,
  data,
}: {
  signal: MarketSignal;
  data: ResearchData;
}) {
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  return (
    <div className="pulse-source-row">
      {signal.sourceIds.slice(0, 3).map((sourceId) => {
        const source = sourceById.get(sourceId);
        return source ? (
          <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>
            {source.publisher} ↗
          </a>
        ) : null;
      })}
    </div>
  );
}

function StockLinks({
  tickers,
  data,
}: {
  tickers: string[];
  data: ResearchData;
}) {
  return (
    <div className="pulse-stock-row">
      {tickers.map((ticker) => {
        const company = data.companies.find((item) => item.ticker === ticker);
        return (
          <Link href={`/stocks/${ticker}`} key={ticker}>
            <b>{company?.name ?? ticker}</b>
            <span>{ticker}</span>
          </Link>
        );
      })}
    </div>
  );
}

function SignalCard({
  signal,
  data,
  compact = false,
}: {
  signal: MarketSignal;
  data: ResearchData;
  compact?: boolean;
}) {
  return (
    <article
      className={`pulse-card pulse-${signal.severity}${compact ? " pulse-card-compact" : ""}`}
    >
      <div className="pulse-card-topline">
        <span>{kindLabel[signal.kind]}</span>
        <time dateTime={signal.occurredAt}>{freshnessLabel[signal.freshness]}</time>
      </div>
      <p className="pulse-actor">{signal.actor}</p>
      <h3>{signal.headline}</h3>
      {signal.quote ? <blockquote>「{signal.quote}」</blockquote> : null}
      <div className="pulse-fact-block">
        <span>市場怎麼動</span>
        <strong>{signal.marketMove}</strong>
      </div>
      {!compact ? (
        <>
          <p className="pulse-why">{signal.whyItMatters}</p>
          <StockLinks tickers={signal.affectedTickers} data={data} />
          <div className="pulse-next">
            <span>下一個驗證</span>
            <p>{signal.nextWatch}</p>
          </div>
        </>
      ) : null}
      <SignalSources signal={signal} data={data} />
    </article>
  );
}

export function MarketPulseBoard({
  data,
  formattedDate,
  view = "full",
}: {
  data: ResearchData;
  formattedDate: string;
  view?: "full" | "hero" | "details";
}) {
  const shock = data.marketSignals.find((signal) => signal.kind === "market_shock");
  const leaders = data.marketSignals.filter(
    (signal) => signal.kind === "leader_statement" || signal.kind === "policy_action",
  );
  const rateDecision = data.marketSignals.find((signal) => signal.kind === "rate_decision");
  const companyReleases = data.marketSignals.filter(
    (signal) => signal.kind === "company_release",
  );
  const prioritySignals = [...leaders, ...(rateDecision ? [rateDecision] : [])];
  const showHero = view !== "details";
  const showDetails = view !== "hero";

  return (
    <>
      {showHero ? <section className="pulse-hero" id="alerts">
        <div className="container pulse-statusbar">
          <span className="pulse-live"><i aria-hidden="true" /> 市場震源</span>
          <span>資料截至 {formattedDate}</span>
          <span>下一次固定更新：工作日 18:30</span>
        </div>

        <div className="container pulse-hero-grid">
          <div className="pulse-main-story">
            <p className="pulse-eyebrow">5 分鐘快研究 · 先回答昨天為什麼跌</p>
            <h1>台股一天跌<br /><em>2,030.83</em> 點</h1>
            <p className="pulse-deck">
              先處理正在改變價格的事，再看長線題材。今天的三個關鍵：
              晶片股風險重定價、川普伊朗口風轉硬、FOMC 結果尚未公布。
            </p>
            <div className="pulse-index-strip" aria-label="台股收盤摘要">
              <div><span>TAIEX</span><strong>41,603.36</strong></div>
              <div className="negative"><span>單日</span><strong>-4.65%</strong></div>
              <div className="negative"><span>跌停</span><strong>54 家</strong></div>
            </div>
            <div className="pulse-cause-chain">
              <p><span>已確認</span> 指數、點數、成交值與跌停家數</p>
              <p><span>媒體歸因</span> 亞洲晶片賣壓 ＋ AI 投資疑慮 ＋ 中國半導體競爭</p>
              <p><span>Codex 推論</span> 高估值與擁擠部位放大同方向賣壓，不視為單一原因</p>
            </div>
            <div className="pulse-hero-actions">
              <Link href="/market#market-shocks">看真正的新訊號</Link>
              <Link href="/market#company-wire">看公司剛發布什麼</Link>
            </div>
          </div>

          <aside className="pulse-command-panel" aria-label="今天先盯三件事">
            <div className="pulse-command-heading">
              <span>NOW</span>
              <div>
                <small>今天先盯</small>
                <strong>{prioritySignals.length} 個價格引爆點</strong>
              </div>
            </div>
            {prioritySignals.map((signal, index) => (
              <Link
                className={`pulse-command-item pulse-command-${signal.severity}`}
                href={signal.kind === "rate_decision" ? "/market#rate-watch" : "/market#leader-watch"}
                key={signal.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>{kindLabel[signal.kind]} · {freshnessLabel[signal.freshness]}</small>
                  <strong>{signal.headline}</strong>
                  <p>{signal.status}</p>
                </div>
              </Link>
            ))}
            <p className="pulse-disclaimer">
              關聯股是新聞傳導的研究排序，不是漲停預測或買進指令。
            </p>
          </aside>
        </div>
      </section> : null}

      {showDetails ? <><section className="container market-shocks" id="market-shocks">
        <div className="pulse-section-heading">
          <div>
            <p className="pulse-eyebrow">WHAT MOVES PRICE NOW</p>
            <h2>真正的新訊號</h2>
          </div>
          <p>只放 72 小時內的市場震源；仍在執行的政策會標成「持續生效」。</p>
        </div>

        {shock ? (
          <div className="pulse-shock-feature">
            <SignalCard signal={shock} data={data} />
          </div>
        ) : null}

        <div className="pulse-two-column">
          <div id="leader-watch">
            <div className="pulse-column-title">
              <span>01</span>
              <div><small>大人物與政策</small><h2>一句話，市場就換方向</h2></div>
            </div>
            <div className="pulse-card-stack">
              {leaders.map((signal) => (
                <SignalCard signal={signal} data={data} key={signal.id} />
              ))}
            </div>
          </div>

          <div id="rate-watch">
            <div className="pulse-column-title">
              <span>02</span>
              <div><small>央行行事曆</small><h2>沒公布，就不先猜答案</h2></div>
            </div>
            {rateDecision ? <SignalCard signal={rateDecision} data={data} /> : null}
          </div>
        </div>
      </section>

      <section className="company-wire" id="company-wire">
        <div className="container">
          <div className="pulse-section-heading">
            <div>
              <p className="pulse-eyebrow">COMPANY WIRE · 48H</p>
              <h2>公司剛發布什麼</h2>
            </div>
            <p>財報數字先看，台股映射後看；沒有訂單證據就不寫成直接受惠。</p>
          </div>
          <div className="company-wire-grid">
            {companyReleases.map((signal) => (
              <SignalCard signal={signal} data={data} compact key={signal.id} />
            ))}
          </div>
        </div>
      </section>
      </> : null}
    </>
  );
}
