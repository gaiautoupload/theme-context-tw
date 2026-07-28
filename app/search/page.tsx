import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedData } from "@/lib/data";

export const metadata: Metadata = { title: "搜尋" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const data = await getPublishedData();
  const themes = query
    ? data.themes.filter((theme) =>
        [theme.name, theme.thesis, theme.whyNow, ...theme.chain]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : [];
  const groups = query
    ? data.groups.filter((group) =>
        [group.name, group.description, ...group.focus].join(" ").toLowerCase().includes(query),
      )
    : [];
  const companies = query
    ? data.companies.filter((company) =>
        [company.ticker, company.name, company.industry, company.role]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : [];
  const count = themes.length + groups.length + companies.length;

  return (
    <div className="container page-shell search-page">
      <form action="/search" className="search-hero" role="search">
        <label htmlFor="search-page-input">搜尋題材、企業集團或股票</label>
        <div>
          <input id="search-page-input" name="q" defaultValue={q} autoFocus />
          <button type="submit">搜尋</button>
        </div>
        {query && <p>找到 {count} 筆與「{q}」相關的研究脈絡</p>}
      </form>
      {!query ? (
        <div className="empty-state">輸入股票代號、公司、企業集團或產業關鍵字。</div>
      ) : count === 0 ? (
        <div className="empty-state">目前沒有通過資料門檻的結果。試試「AI」、「台塑」或「2330」。</div>
      ) : (
        <div className="search-results">
          {themes.map((theme) => (
            <Link href={`/themes/${theme.id}`} key={theme.id}>
              <span>投資主題 · {theme.score}</span><strong>{theme.name}</strong><p>{theme.thesis}</p>
            </Link>
          ))}
          {groups.map((group) => (
            <Link href={`/groups/${group.id}`} key={group.id}>
              <span>企業集團</span><strong>{group.name}</strong><p>{group.description}</p>
            </Link>
          ))}
          {companies.map((company) => (
            <Link href={`/stocks/${company.ticker}`} key={company.ticker}>
              <span>股票 · {company.ticker}</span><strong>{company.name}</strong><p>{company.role}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
