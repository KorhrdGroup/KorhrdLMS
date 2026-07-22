import type { Metadata } from "next";

import { NoticePage } from "@/components/notice/notice-page";
import { getPublishedNoticesForSite } from "@/features/notice-management/services/notice-student-view.service";

export const metadata: Metadata = {
  title: "공지사항",
  description: "한평생 직업훈련센터 학습지원 공지사항",
};

/** 관리자 공지사항(/admin/notices)에서 게시한 공지를 그대로 노출합니다. */
export default async function Page() {
  let items: Awaited<ReturnType<typeof getPublishedNoticesForSite>> = [];
  try {
    items = await getPublishedNoticesForSite();
  } catch {
    items = [];
  }

  return <NoticePage items={items} />;
}
