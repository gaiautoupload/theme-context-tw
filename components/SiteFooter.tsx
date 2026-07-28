import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">題材脈絡</p>
          <p>把全球事件，翻譯成台股可以驗證的投資脈絡。</p>
        </div>
        <div className="footer-links">
          <Link href="/sources">證據來源</Link>
          <Link href="/methodology">研究方法</Link>
          <a href="/api/daily/latest">公開 API</a>
        </div>
        <p className="disclaimer">
          本站內容為資訊整理與研究推論，不構成投資建議、招攬或績效保證。投資人應自行判斷並承擔風險。
        </p>
      </div>
    </footer>
  );
}
