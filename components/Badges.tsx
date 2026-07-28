import type { Confidence, SourceType } from "@/lib/types";

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
