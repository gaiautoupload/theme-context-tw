import type { Confidence, SourceType, ThemeLifecycle, ThemeMomentum } from "@/lib/types";

const sourceLabels: Record<SourceType, string> = {
  official: "官方事實",
  news_derived: "新聞推導",
  analyst_estimate: "分析估計",
  llm_inference: "Codex 推論",
  manual_review: "人工覆核",
};

export function SourceTypeBadge({ type }: { type: SourceType }) {
  return <span className={`badge source-${type}`}>{sourceLabels[type]}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const label = confidence === "high" ? "高信心" : confidence === "medium" ? "中信心" : "低信心";
  return <span className={`badge confidence-${confidence}`}>{label}</span>;
}

export function ThemeScore({ score }: { score: number }) {
  return (
    <div className="theme-score" aria-label={`題材強度 ${score} 分`}>
      <span>{score}</span>
      <small>/ 100</small>
    </div>
  );
}

const lifecycleLabels: Record<ThemeLifecycle, string> = {
  spark: "小火苗",
  spreading: "擴散中",
  hot: "市場火熱",
  cooling: "開始降溫",
  fading: "題材衰敗",
};

const momentumLabels: Record<ThemeMomentum, string> = {
  rising: "升溫 ↑",
  stable: "持平 →",
  falling: "轉弱 ↓",
};

export function LifecycleBadge({
  lifecycle,
  momentum,
}: {
  lifecycle: ThemeLifecycle;
  momentum?: ThemeMomentum;
}) {
  return (
    <span className={`lifecycle-badge lifecycle-${lifecycle}`}>
      <i aria-hidden="true" />
      {lifecycleLabels[lifecycle]}
      {momentum ? <small>{momentumLabels[momentum]}</small> : null}
    </span>
  );
}
