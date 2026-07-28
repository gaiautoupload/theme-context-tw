"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  Company,
  CorporateGroup,
  EventItem,
  GroupMembership,
  Theme,
  ThemeCompanyLink,
} from "@/lib/types";

export function SignalMap({
  events,
  themes,
  groups,
  companies,
  links,
  memberships,
}: {
  events: EventItem[];
  themes: Theme[];
  groups: CorporateGroup[];
  companies: Company[];
  links: ThemeCompanyLink[];
  memberships: GroupMembership[];
}) {
  const [activeThemeId, setActiveThemeId] = useState(themes[0]?.id ?? "");
  const activeTheme = themes.find((theme) => theme.id === activeThemeId) ?? themes[0];

  const context = useMemo(() => {
    if (!activeTheme) return null;
    const activeLinks = links
      .filter((link) => link.themeId === activeTheme.id)
      .sort((a, b) => b.relevance - a.relevance);
    const tickers = new Set(activeLinks.map((link) => link.ticker));
    const activeCompanies = companies.filter((company) => tickers.has(company.ticker));
    const groupIds = new Set(activeCompanies.map((company) => company.groupId).filter(Boolean));
    const activeGroups = groups.filter((group) => groupIds.has(group.id));
    const sourceEvent =
      events.find((event) => event.sourceIds.some((id) => activeTheme.sourceIds.includes(id))) ??
      events[0];
    return { activeLinks, activeCompanies, activeGroups, sourceEvent };
  }, [activeTheme, companies, events, groups, links]);

  if (!activeTheme || !context) return null;

  return (
    <section className="signal-map" aria-labelledby="signal-map-title">
      <div className="section-heading map-heading">
        <div>
          <p className="eyebrow">CONTEXT MAP</p>
          <h2 id="signal-map-title">從事件一路追到台股</h2>
        </div>
        <p>選擇主題，只展開與它直接相連的投資支線。</p>
      </div>

      <div className="map-tabs" role="tablist" aria-label="選擇投資主題">
        {themes.map((theme) => (
          <button
            type="button"
            role="tab"
            aria-selected={theme.id === activeTheme.id}
            className={theme.id === activeTheme.id ? "active" : ""}
            onClick={() => setActiveThemeId(theme.id)}
            key={theme.id}
          >
            <span>{theme.score}</span>
            {theme.name}
          </button>
        ))}
      </div>

      <div className="context-flow">
        <article className="context-node node-event">
          <span className="node-label">01 國際事件</span>
          <strong>{context.sourceEvent?.title}</strong>
          <p>{context.sourceEvent?.summary}</p>
        </article>
        <span className="flow-arrow" aria-hidden="true">→</span>
        <article className="context-node node-theme">
          <span className="node-label">02 投資主題</span>
          <strong>{activeTheme.name}</strong>
          <p>{activeTheme.whyNow}</p>
          <Link href={`/themes/${activeTheme.id}`}>主題研究 →</Link>
        </article>
        <span className="flow-arrow" aria-hidden="true">→</span>
        <article className="context-node node-chain">
          <span className="node-label">03 價值鏈</span>
          <div className="chain-list">
            {activeTheme.chain.map((step, index) => (
              <span key={step}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {step}
              </span>
            ))}
          </div>
        </article>
        <span className="flow-arrow" aria-hidden="true">→</span>
        <article className="context-node node-output">
          <span className="node-label">04 集團與股票</span>
          {context.activeGroups.length > 0 && (
            <div className="map-groups">
              {context.activeGroups.map((group) => (
                <Link href={`/groups/${group.id}`} key={group.id}>
                  {group.name}
                </Link>
              ))}
            </div>
          )}
          <div className="map-stocks">
            {context.activeLinks.slice(0, 4).map((link) => {
              const company = context.activeCompanies.find(
                (item) => item.ticker === link.ticker,
              );
              const membership = memberships.find(
                (item) => item.ticker === link.ticker,
              );
              return company ? (
                <Link href={`/stocks/${company.ticker}`} key={company.ticker}>
                  <span>
                    {company.name} <small>{company.ticker}</small>
                  </span>
                  <em>{membership?.relation ?? link.stance}</em>
                </Link>
              ) : null;
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
