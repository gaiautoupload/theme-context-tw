import Link from "next/link";

const nav = [
  { href: "/#alerts", label: "題材快訊" },
  { href: "/#spark-radar-title", label: "小火苗" },
  { href: "/themes", label: "投資主題" },
  { href: "/groups", label: "企業集團" },
  { href: "/sources", label: "證據來源" },
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
    </header>
  );
}
