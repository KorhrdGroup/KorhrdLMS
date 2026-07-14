import type { Metadata } from "next";

import { NoticePage } from "@/components/notice/notice-page";

export const metadata: Metadata = {
  title: "공지사항",
  description: "한평생 직업훈련센터 학습지원 공지사항",
};

export default function Page() {
  return <NoticePage />;
}
