import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedData, sourceMap } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;
  const data = await getPublishedData();
  const company = data.companies.find((item) => item.ticker === ticker);
  return company
    ? { title: `${company.name} ${company.ticker}`, description: company.summary }
    : { title: "找不到股票" };
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const data = await getPublishedData();
  const company = data.companies.find((item) => item.ticker === ticker);
  if (!company) notFound();

  const group = data.groups.find((item) => item.id === company.groupId);
  const links = data.themeCompanyLinks
    .filter((link) => link.ticker === company.ticker)
    .sort((a, b) => b.relevance - a.relevance);
  const sources = sourceMap(data);
  const claims = data.claims.filter(
    (claim) => claim.entityType === "stock" && claim.entityId === company.ticker,
  );
  const themeSources = new Set(
    links.flatMap((link) => data.themes.find((theme) => theme.id === link.themeId)?.sourceIds ?? []),
  );
  const linkedThemes = links
    .map((link) => data.themes.find((theme) => theme.id === link.themeId))
    .filter((theme) => theme !== undefined);
  const validationSignals = [...new Set(linkedThemes.flatMap((theme) => theme.catalysts))].slice(0, 5);
  const alternativeRisks = [...new Set(linkedThemes.flatMap((theme) => theme.risks))].slice(0, 5);

  return (
    <div className="container page-shell">
      <Link className="back-link" href="/themes">← 回到主題研究</Link>
      <header className="stock-hero">
        <div className="ticker-box">{company.ticker}</div>
        <div>
          <p className="eyebrow">{company.industry}</p>
          <h1>{company.name}</h1>
          <p>{company.summary}</p>
        </div>
        {group && (
          <Link className="group-affiliation" href={`/groups/${group.id}`}>
            <span>所屬企業集團</span>
            <strong>{group.name}</strong>
            <small>展開集團圖 →</small>
          </Link>
        )}
      </header>

      <section className="answer-grid stock-answer">
        <article><span>受惠位置／供應鏈角色</span><p>{company.role}</p></article>
        <article><span>目前研究原則</span><p>只呈現產業關聯與證據，不提供目標價或直接買賣建議。</p></article>
      </section>

      <section className="detail-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">THEME LINKS</p><h2>公司連到哪些投資主題</h2></div>
        </div>
        <div className="stock-theme-list">
          {links.length ? links.map((link) => {
            const theme = data.themes.find((item) => item.id === link.themeId);
            return theme ? (
              <Link href={`/themes/${theme.id}`} key={theme.id}>
                <div>
                  <span>{link.stance} · {theme.stage} · Codex 推論</span>
                  <strong>{theme.name}</strong>
                  <p>{link.reasoning}</p>
                </div>
                <b>{link.relevance}<small>/100</small></b>
              </Link>
            ) : null;
          }) : <p className="empty-state">目前沒有通過證據門檻的主題關聯。</p>}
        </div>
      </section>

      <section className="catalyst-risk-grid">
        <article>
          <p className="eyebrow">REVENUE VALIDATION</p>
          <h2>營收驗證節點</h2>
          <p>後續需在訂單、量產或法說揭露中看到這些訊號，才能把題材連結升級為營運證據。</p>
          <ul>
            {validationSignals.map((signal) => <li key={signal}>— {signal}</li>)}
          </ul>
        </article>
        <article>
          <p className="eyebrow">ALTERNATIVE RISK</p>
          <h2>替代風險與反證</h2>
          <p>若替代方案、客戶策略或產業供需往相反方向發展，相關性評分應下修。</p>
          <ul>
            {alternativeRisks.map((risk) => <li key={risk}>— {risk}</li>)}
          </ul>
        </article>
      </section>

      <section className="source-box">
        <div><p className="eyebrow">EVIDENCE</p><h2>支持這些關聯的來源</h2></div>
        <div>
          {[...themeSources].slice(0, 6).map((id) => {
            const source = sources.get(id);
            return source ? (
              <a href={source.url} target="_blank" rel="noreferrer" key={id}>
                <span>{source.publisher}</span>
                <strong>{source.title}</strong>
                <small>{source.publishedAt} · {source.quality} ↗</small>
              </a>
            ) : null;
          })}
        </div>
      </section>

      {claims.length > 0 && <pre className="sr-only">{JSON.stringify(claims)}</pre>}
    </div>
  );
}
