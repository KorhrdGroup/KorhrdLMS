import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";

import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  /* og:image 등 상대 경로 메타를 절대 주소로 만들어 줄 기준 도메인 */
  metadataBase: new URL("https://www.korhrd.co.kr"),
  title: "한평생직업훈련",
  description: "한평생직업훈련 학습관리시스템",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "한평생직업훈련",
    description: "한평생직업훈련 학습관리시스템",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "한평생직업훈련" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "한평생직업훈련",
    description: "한평생직업훈련 학습관리시스템",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
