import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedData, groupCompanies, groupThemes } from "@/lib/data";

export const metadata: Metadata = {
  title: "企業集團",
  description: "以實際企業集團關係整理台股成員與跨主題曝險。",
};

export default async function GroupsPage() {
  const data = await getPublishedData();
  return (
    <div className="container page-shell">
      <header className="page-hero">
        <p className="eyebrow">CORPORATE GROUPS</p>
        <h1>同一個題材，<br />在集團內由誰吃到價值？</h1>
        <p>
          集團股不是同產業分類，而是實際的企業關係。這裡把母體、上市成員與跨主題角色拆開，
          避免只因名稱或市場印象把公司硬湊在一起。
        </p>
      </header>
      <div className="group-grid">
        {data.groups.map((group, index) => {
          const members = groupCompanies(data, group.id);
          const themes = groupThemes(data, group.id);
          return (
            <article className="group-card" key={group.id}>
              <span className="rank">0{index + 1}</span>
              <p className="eyebrow">GROUP MAP</p>
              <h2><Link href={`/groups/${group.id}`}>{group.name}</Link></h2>
              <p>{group.description}</p>
              <div className="focus-tags">
                {group.focus.map((focus) => <span key={focus}>{focus}</span>)}
              </div>
              <dl>
                <div><dt>上市櫃成員</dt><dd>{members.length}</dd></div>
                <div><dt>相關主題</dt><dd>{themes.length}</dd></div>
              </dl>
              <div className="member-preview">
                {members.slice(0, 5).map((company) => (
                  <Link href={`/stocks/${company.ticker}`} key={company.ticker}>
                    {company.name}<small>{company.ticker}</small>
                  </Link>
                ))}
              </div>
              <Link className="text-link" href={`/groups/${group.id}`}>展開集團脈絡 →</Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
