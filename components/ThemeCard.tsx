import Link from "next/link";
import type { Company, Theme, ThemeCompanyLink } from "@/lib/types";
import { LifecycleBadge, ThemeScore } from "./Badges";

export function ThemeCard({
  theme,
  links,
  companies,
  rank,
}: {
  theme: Theme;
  links: ThemeCompanyLink[];
  companies: Company[];
  rank: number;
}) {
  const map = new Map(companies.map((company) => [company.ticker, company]));
  return (
    <article className="theme-card">
      <div className="theme-card-top">
        <span className="rank">0{rank}</span>
        <div className="theme-card-badges">
          <span className="eyebrow">{theme.kicker}</span>
          <LifecycleBadge lifecycle={theme.lifecycle} momentum={theme.momentum} />
        </div>
        <ThemeScore score={theme.score} />
      </div>
      <h3>
        <Link href={`/themes/${theme.id}`}>{theme.name}</Link>
      </h3>
      <p>{theme.thesis}</p>
      <div className="theme-heat-summary">
        <span>先行 {theme.earlySignalScore}</span>
        <span>熱度 {theme.marketHeat}</span>
      </div>
      <div className="theme-card-focus">
        <span>代表股</span>
        <div>
          {links.slice(0, 3).map((link) => {
            const company = map.get(link.ticker);
            return company ? (
              <Link href={`/stocks/${company.ticker}`} key={company.ticker}>
                {company.name} <small>{company.ticker}</small>
              </Link>
            ) : null;
          })}
        </div>
      </div>
      <Link className="text-link" href={`/themes/${theme.id}`}>
        展開完整脈絡 <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
