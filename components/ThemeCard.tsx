import Link from "next/link";
import type { Company, Theme, ThemeCompanyLink } from "@/lib/types";
import { ThemeScore } from "./Badges";

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
          <span className="stage-pill">{theme.stage}</span>
        </div>
        <ThemeScore score={theme.score} />
      </div>
      <h3>
        <Link href={`/themes/${theme.id}`}>{theme.name}</Link>
      </h3>
      <p>{theme.thesis}</p>
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
