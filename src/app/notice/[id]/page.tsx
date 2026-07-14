import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOTICE_LIST_ITEMS, getNoticeItem } from "@/components/notice/data/notice-data";
import { NoticeDetailPage } from "@/components/notice/notice-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return NOTICE_LIST_ITEMS.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = getNoticeItem(id);
  return {
    title: notice ? notice.title : "공지사항",
    description: notice ? notice.body.slice(0, 80) : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const notice = getNoticeItem(id);
  if (!notice) {
    notFound();
  }
  return <NoticeDetailPage notice={notice} />;
}
