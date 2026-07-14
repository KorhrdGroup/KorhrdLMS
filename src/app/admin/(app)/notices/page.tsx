import type { Metadata } from "next";

import { NoticeListView } from "@/features/notice-management/components/notice-list-view";
import { parseNoticeListQuery } from "@/features/notice-management/lib/notice-list-query";
import { getNoticeList } from "@/features/notice-management/services/notice-list.service";

export const metadata: Metadata = {
  title: "공지사항",
};

type NoticesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const params = await searchParams;
  const query = parseNoticeListQuery(params);
  const result = await getNoticeList(query);

  return <NoticeListView result={result} query={query} />;
}
