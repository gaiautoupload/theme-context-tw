import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const incomingHeaders = await headers();
  const host = incomingHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: {
      default: "題材脈絡｜從全球事件追到台股價值鏈",
      template: "%s｜題材脈絡",
    },
    description:
      "把全球財經事件轉換成可驗證的台股投資主題、產業價值鏈、企業集團與代表股。",
    icons: {
      icon: "/og.png",
      shortcut: "/og.png",
    },
    openGraph: {
      title: "題材脈絡｜從全球事件追到台股價值鏈",
      description: "事件 → 主題 → 價值鏈 → 企業集團 → 台股，一眼看懂今日投資脈絡。",
      images: ["/og.png"],
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "題材脈絡",
      description: "把全球事件，翻譯成台股可以驗證的投資脈絡。",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
