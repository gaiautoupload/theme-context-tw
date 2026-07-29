export type SourceType =
  | "official"
  | "news_derived"
  | "analyst_estimate"
  | "llm_inference"
  | "manual_review";

export type Confidence = "high" | "medium" | "low";
export type ThemeLifecycle = "spark" | "spreading" | "hot" | "cooling" | "fading";
export type ThemeMomentum = "rising" | "stable" | "falling";

export interface ResearchRun {
  id: string;
  asOf: string;
  status: "draft" | "published" | "failed";
  contentHash: string;
}

export interface DailyReport {
  id: string;
  title: string;
  eyebrow: string;
  narrative: string;
  changes: string[];
  signals: string[];
  risks: string[];
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  retrievedAt: string;
  sourceType: SourceType;
  quality: string;
}

export interface EventItem {
  id: string;
  title: string;
  summary: string;
  region: string;
  happenedAt: string;
  impact: string;
  sourceIds: string[];
}

export type MarketSignalKind =
  | "market_shock"
  | "leader_statement"
  | "policy_action"
  | "rate_decision"
  | "company_release";

export type MarketSignalFreshness = "breaking" | "today" | "recent" | "scheduled" | "active";

export interface MarketSignal {
  id: string;
  kind: MarketSignalKind;
  headline: string;
  actor: string;
  quote: string | null;
  occurredAt: string;
  freshness: MarketSignalFreshness;
  severity: "critical" | "high" | "watch";
  direction: "risk_on" | "risk_off" | "mixed";
  status: string;
  marketMove: string;
  whyItMatters: string;
  affectedThemeIds: string[];
  affectedTickers: string[];
  nextWatch: string;
  sourceIds: string[];
}

export interface Theme {
  id: string;
  name: string;
  kicker: string;
  score: number;
  stage: string;
  direction: string;
  lifecycle: ThemeLifecycle;
  firstDetectedAt: string;
  earlySignalScore: number;
  marketHeat: number;
  momentum: ThemeMomentum;
  sparkSignals: string[];
  spreadTriggers: string[];
  invalidationSignals: string[];
  thesis: string;
  whyNow: string;
  valueCapture: string;
  chain: string[];
  catalysts: string[];
  risks: string[];
  sourceIds: string[];
}

export interface CorporateGroup {
  id: string;
  name: string;
  description: string;
  focus: string[];
  sourceIds: string[];
}

export interface Company {
  ticker: string;
  name: string;
  industry: string;
  role: string;
  groupId: string | null;
  summary: string;
}

export interface GroupMembership {
  groupId: string;
  ticker: string;
  relation: string;
}

export interface ThemeCompanyLink {
  themeId: string;
  ticker: string;
  relevance: number;
  role: string;
  stance: string;
  reasoning: string;
}

export interface Claim {
  id: string;
  entityType: "event" | "theme" | "group" | "stock";
  entityId: string;
  statement: string;
  confidence: Confidence;
  sourceType: SourceType;
  sourceIds: string[];
}

export interface MaterialStockLink {
  ticker: string;
  relationship: "direct_supplier" | "inventory_leverage" | "cost_pressure";
  reasoning: string;
}

export interface MaterialSignal {
  id: string;
  material: string;
  direction: "up" | "down" | "tightening" | "easing";
  change: string;
  period: string;
  status: string;
  thesis: string;
  sourceIds: string[];
  themeIds: string[];
  stockLinks: MaterialStockLink[];
}

export interface ResearchData {
  run: ResearchRun;
  dailyReport: DailyReport;
  events: EventItem[];
  themes: Theme[];
  groups: CorporateGroup[];
  companies: Company[];
  groupMemberships: GroupMembership[];
  themeCompanyLinks: ThemeCompanyLink[];
  sources: Source[];
  claims: Claim[];
  materialSignals: MaterialSignal[];
  marketSignals: MarketSignal[];
}
