import Link from "next/link";

const nav = [
  { href: "/", label: "今日總覽" },
  { href: "/market", label: "即時震源" },
  { href: "/technical", label: "大盤技術" },
  { href: "/opportunities", label: "小火苗" },
  { href: "/themes", label: "題材庫" },
  { href: "/map", label: "脈絡地圖" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="題材脈絡首頁">
          <span className="brand-mark" aria-hidden="true">
            脈
          </span>
          <span>
            <strong>題材脈絡</strong>
            <small>THEME ALERTS · TAIWAN</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="主要導覽">
          {nav.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <form className="header-search" action="/search" role="search">
          <label className="sr-only" htmlFor="site-search">
            搜尋主題、集團或股票
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="搜尋 2330、台塑、液冷…"
          />
          <button type="submit" aria-label="搜尋">
            搜尋
          </button>
        </form>
      </div>
      <nav className="mobile-route-nav" aria-label="手機分頁導覽">
        <div className="container">
          {nav.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
