"use client";

import { useEffect, useMemo, useState } from "react";

type AlertRule = {
  id: string;
  signal: string;
  earlyScore: number;
  heatCeiling: number;
  relevance: number;
};

const storageKey = "theme-context-alert-rules-v1";

const signalLabels: Record<string, string> = {
  spark: "小火苗",
  material: "原料漲價",
  spreading: "題材擴散",
  cooling: "題材降溫",
};

export function AlertRuleBuilder() {
  const [signal, setSignal] = useState("spark");
  const [earlyScore, setEarlyScore] = useState(80);
  const [heatCeiling, setHeatCeiling] = useState(40);
  const [relevance, setRelevance] = useState(75);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) setRules(JSON.parse(saved) as AlertRule[]);
      } catch {
        setRules([]);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const condition = useMemo(() => {
    if (signal === "material") return `原料方向轉強，個股關聯度 ≥ ${relevance}`;
    if (signal === "cooling") return `市場熱度轉弱，個股關聯度 ≥ ${relevance}`;
    return `先行分數 ≥ ${earlyScore}，市場熱度 ≤ ${heatCeiling}`;
  }, [earlyScore, heatCeiling, relevance, signal]);

  function saveRule() {
    const next: AlertRule[] = [
      ...rules,
      {
        id: `${Date.now()}`,
        signal,
        earlyScore,
        heatCeiling,
        relevance,
      },
    ].slice(-5);
    setRules(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setMessage("已儲存在這台裝置");
  }

  function removeRule(id: string) {
    const next = rules.filter((rule) => rule.id !== id);
    setRules(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setMessage("已移除警報條件");
  }

  return (
    <section className="alert-builder" aria-labelledby="alert-builder-title">
      <div className="alert-builder-copy">
        <p className="alert-kicker">YOUR RULES</p>
        <h2 id="alert-builder-title">設定你要等的訊號</h2>
        <p>
          不用整天盯新聞。先定義什麼情況值得看，工作日 18:30 研究更新後，再用五分鐘處理觸發項目。
        </p>
        <div className="alert-privacy-note">
          <span aria-hidden="true">●</span>
          條件只存在目前裝置；現階段不會背景推播或自動下單。
        </div>
      </div>

      <div className="alert-rule-panel">
        <div className="rule-panel-head">
          <div>
            <span className="status-dot" aria-hidden="true" />
            <strong>建立題材警報</strong>
          </div>
          <small>收盤研究版</small>
        </div>

        <div className="rule-fields">
          <label>
            <span>我要監看</span>
            <select value={signal} onChange={(event) => setSignal(event.target.value)}>
              <option value="spark">小火苗出現</option>
              <option value="material">原料價格轉強</option>
              <option value="spreading">題材開始擴散</option>
              <option value="cooling">題材熱度降溫</option>
            </select>
          </label>

          {signal === "spark" || signal === "spreading" ? (
            <>
              <label>
                <span>先行分數至少</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={earlyScore}
                  onChange={(event) => setEarlyScore(Number(event.target.value))}
                />
              </label>
              <label>
                <span>市場熱度不高於</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={heatCeiling}
                  onChange={(event) => setHeatCeiling(Number(event.target.value))}
                />
              </label>
            </>
          ) : (
            <label className="rule-field-wide">
              <span>個股關聯度至少</span>
              <input
                type="number"
                min="0"
                max="100"
                value={relevance}
                onChange={(event) => setRelevance(Number(event.target.value))}
              />
            </label>
          )}
        </div>

        <div className="rule-preview">
          <span>觸發條件</span>
          <strong>{condition}</strong>
        </div>

        <button className="save-alert-button" type="button" onClick={saveRule}>
          ＋ 儲存監看條件
        </button>
        <p className="rule-status" aria-live="polite">{message}</p>

        {rules.length > 0 ? (
          <div className="saved-rules">
            <span>已儲存 {rules.length} 組</span>
            {rules.map((rule) => (
              <div key={rule.id}>
                <strong>{signalLabels[rule.signal]}</strong>
                <small>
                  {rule.signal === "material" || rule.signal === "cooling"
                    ? `關聯度 ≥ ${rule.relevance}`
                    : `先行 ≥ ${rule.earlyScore} · 熱度 ≤ ${rule.heatCeiling}`}
                </small>
                <button type="button" onClick={() => removeRule(rule.id)} aria-label={`移除${signalLabels[rule.signal]}警報`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
