import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "研究方法",
  description: "題材脈絡的來源分級、主題評分、Codex 推論與發布門檻。",
};

const scoreItems = [
  ["來源品質", "官方公告與第一手資料優先，單一轉載不能支撐重大結論。"],
  ["事件新鮮度", "新事件提高追蹤優先級，但不自動等於長期價值。"],
  ["商用階段", "由概念、驗證、小量出貨、量產到財報貢獻逐步加權。"],
  ["價值捕捉", "檢查定價權、認證、轉換成本與是否承擔過多資本風險。"],
  ["反證風險", "把客戶集中、替代、時程與景氣循環放進同一張研究表。"],
];

export default function MethodologyPage() {
  return (
    <div className="container page-shell">
      <header className="page-hero">
        <p className="eyebrow">METHODOLOGY</p>
        <h1>Codex 負責找脈絡，<br />證據負責踩煞車。</h1>
        <p>
          每日研究不是請模型自由發揮，而是以固定來源規則、台股代號表、企業集團關係與發布門檻，
          把「事實」和「推論」分開保存。
        </p>
      </header>

      <section className="method-flow">
        {[
          ["01", "搜尋", "全球事件、官方公告、公司 IR 與可信財經媒體"],
          ["02", "正規化", "去重事件、校驗台股代號與企業集團關係"],
          ["03", "分析", "拆成主題、價值鏈、商用節點、公司角色與反證"],
          ["04", "驗證", "至少兩個獨立來源；精確數字要求第一手資料"],
          ["05", "發布", "交易式同步，失敗時保留上一個成功版本"],
        ].map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span><strong>{title}</strong><p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="method-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">LIFECYCLE MODEL</p><h2>不是只找熱門，而是追蹤火怎麼燒</h2></div>
        </div>
        <div className="method-flow lifecycle-method-flow">
          {[
            ["01", "小火苗", "至少兩個獨立訊號開始聚合，但市場注意力與營收驗證仍低。"],
            ["02", "擴散", "跨媒體、跨供應鏈或跨公司出現確認，題材開始被更多參與者採用。"],
            ["03", "火熱", "成交、新聞與市場敘事高度擁擠，研究重點轉向兌現與估值風險。"],
            ["04", "降溫", "催化沒有延續、驗證延後或價格動能轉弱，必須降低優先級。"],
            ["05", "衰敗", "核心假設被正式數據推翻，主題保留歷史但退出追蹤名單。"],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span><strong>{title}</strong><p>{copy}</p>
            </article>
          ))}
        </div>
        <div className="signal-formula">
          <strong>小火苗判斷</strong>
          <span>來源新鮮度</span><b>＋</b>
          <span>獨立訊號聚合</span><b>＋</b>
          <span>價值鏈可驗證性</span><b>＋</b>
          <span>先行分數－市場熱度落差</span>
        </div>
        <p className="method-note">
          「市場熱度」不是即時成交量模型，而是依新聞密度、題材普及度、公司揭露與市場敘事擁擠程度做的研究標記；
          因此只用來排序查證優先級，不當作報酬預測。
        </p>
      </section>

      <section className="method-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">SCORING</p><h2>題材強度如何計算</h2></div>
        </div>
        <div className="score-method-grid">
          {scoreItems.map(([title, copy], index) => (
            <article key={title}>
              <span>{20 - index * 2}%</span><strong>{title}</strong><p>{copy}</p>
            </article>
          ))}
        </div>
        <p className="method-note">
          顯示的 0–100 分是研究優先級，不是股價上漲機率，也不是預期報酬。
        </p>
      </section>

      <section className="label-guide">
        <article><span className="badge source-official">官方事實</span><p>交易所、監管機關、公司公告與 IR。</p></article>
        <article><span className="badge source-news_derived">新聞推導</span><p>由可信媒體報導整理出的事件脈絡。</p></article>
        <article><span className="badge source-llm_inference">Codex 推論</span><p>跨來源連結出的投資解讀，必須保留來源與信心標籤。</p></article>
      </section>

      <section className="disclaimer-panel">
        <p className="eyebrow">IMPORTANT</p>
        <h2>使用限制與免責聲明</h2>
        <p>
          本站不提供即時報價、目標價、投資組合代操或買賣指令。所有內容僅供研究與資訊用途，
          可能因資料延遲、來源錯誤、模型推論或市場快速變化而不完整。投資人應查閱公司正式公告，
          並依自身財務狀況與風險承受度獨立判斷。
        </p>
      </section>
    </div>
  );
}
