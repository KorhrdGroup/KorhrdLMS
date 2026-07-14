import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "관리자 | 한평생직업훈련",
    template: "%s | 한평생직업훈련",
  },
  description: "한평생직업훈련 LMS 관리자",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
