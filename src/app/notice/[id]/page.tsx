import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NoticeDetailPage } from "@/components/notice/notice-detail-page";
import { getPublishedNoticesForSite } from "@/features/notice-management/services/notice-student-view.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function findNotice(id: string) {
  const items = await getPublishedNoticesForSite();
  return items.find((item) => item.id === id) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = await findNotice(id);
  return {
    title: notice ? notice.title : "공지사항",
    description: notice ? notice.body.slice(0, 80) : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const notice = await findNotice(id);

  if (!notice) {
    notFound();
  }

  return <NoticeDetailPage notice={notice} />;
}
