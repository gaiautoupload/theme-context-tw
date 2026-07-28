import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfidenceBadge, SourceTypeBadge } from "@/components/Badges";
import { getPublishedData, groupCompanies, groupThemes, sourceMap } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedData();
  const group = data.groups.find((item) => item.id === slug);
  return group ? { title: group.name, description: group.description } : { title: "找不到集團" };
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublishedData();
  const group = data.groups.find((item) => item.id === slug);
  if (!group) notFound();

  const members = groupCompanies(data, group.id);
  const themes = groupThemes(data, group.id);
  const sources = sourceMap(data);
  const claims = data.claims.filter(
    (claim) => claim.entityType === "group" && claim.entityId === group.id,
  );

  return (
    <div className="container page-shell">
      <Link className="back-link" href="/groups">← 回到企業集團</Link>
      <header className="detail-hero group-detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">CORPORATE GROUP MAP</p>
          <h1>{group.name}</h1>
          <p className="detail-thesis">{group.description}</p>
          <div className="focus-tags">
            {group.focus.map((focus) => <span key={focus}>{focus}</span>)}
          </div>
        </div>
        <div className="group-metric">
          <strong>{members.length}</strong>
          <span>追蹤上市櫃成員</span>
        </div>
      </header>

      <section className="detail-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">GROUP TREE</p><h2>上市櫃成員與分工</h2></div>
        </div>
        <div className="group-tree">
          <div className="group-root">{group.name}</div>
          <div className="group-branches">
            {members.map((company) => {
              const membership = data.groupMemberships.find(
                (item) => item.groupId === group.id && item.ticker === company.ticker,
              );
              return (
                <Link href={`/stocks/${company.ticker}`} key={company.ticker}>
                  <span>{membership?.relation}</span>
                  <strong>{company.name}</strong>
                  <small>{company.ticker} · {company.industry}</small>
                  <p>{company.role}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">THEME EXPOSURE</p><h2>跨主題曝險</h2></div>
        </div>
        <div className="theme-exposure-grid">
          {themes.map((theme) => {
            const exposed = data.themeCompanyLinks
              .filter((link) => link.themeId === theme.id)
              .filter((link) => members.some((member) => member.ticker === link.ticker))
              .sort((a, b) => b.relevance - a.relevance);
            return (
              <Link href={`/themes/${theme.id}`} key={theme.id}>
                <span>{theme.stage}</span>
                <strong>{theme.name}</strong>
                <small>{exposed.map((item) => item.ticker).join(" · ")}</small>
                <b>{Math.max(...exposed.map((item) => item.relevance))}</b>
              </Link>
            );
          })}
        </div>
      </section>

      {claims.map((claim) => (
        <section className="group-evidence" key={claim.id}>
          <div className="badge-row">
            <SourceTypeBadge type={claim.sourceType} />
            <ConfidenceBadge confidence={claim.confidence} />
          </div>
          <p>{claim.statement}</p>
          <div className="claim-sources">
            {claim.sourceIds.map((id) => {
              const source = sources.get(id);
              return source ? <a href={source.url} target="_blank" rel="noreferrer" key={id}>{source.publisher} ↗</a> : null;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
