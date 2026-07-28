import type { Metadata } from "next";
import { ThemeCard } from "@/components/ThemeCard";
import { getPublishedData, themeLinks } from "@/lib/data";

export const metadata: Metadata = {
  title: "投資主題",
  description: "由全球事件推導出的台股投資主題，包含商用階段、價值捕捉、催化與風險。",
};

export default async function ThemesPage() {
  const data = await getPublishedData();
  return (
    <div className="container page-shell">
      <header className="page-hero">
        <p className="eyebrow">THEME LIBRARY</p>
        <h1>投資主題不是標籤，<br />而是一條可以被驗證的因果鏈。</h1>
        <p>
          每個主題都從可追溯事件出發，拆解商用階段、價值流向、企業集團與台股角色。
          沒有足夠證據的精確數字，寧可標記待驗證。
        </p>
      </header>
      <div className="library-toolbar">
        <span>{data.themes.length} 個追蹤主題</span>
        <span>更新：{data.run.asOf.slice(0, 10)}</span>
      </div>
      <div className="theme-grid library-grid">
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
    </div>
  );
}
