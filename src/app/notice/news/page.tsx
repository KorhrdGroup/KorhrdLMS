import type { Metadata } from "next";

import { NoticeNewsPage } from "@/components/notice/notice-news-page";

export const metadata: Metadata = {
  title: "교육원소식",
  description: "한평생 직업훈련센터 교육원소식",
};

export default function Page() {
  return <NoticeNewsPage />;
}
