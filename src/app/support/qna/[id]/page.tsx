import type { Metadata } from "next";

import { QnaDetailPage } from "@/components/support/qna-detail-page";
import { getMySupportQnaDetail } from "@/features/support-qna/services/support-qna.service";
import { requireStudentLogin } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "1:1 상담 상세",
  description: "한평생 직업훈련센터 1:1 상담 상세",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const member = await requireStudentLogin(`/support/qna/${id}`);

  let ticket: Awaited<ReturnType<typeof getMySupportQnaDetail>> = null;
  try {
    ticket = await getMySupportQnaDetail(member.id, id);
  } catch {
    ticket = null;
  }

  return <QnaDetailPage ticket={ticket} />;
}
