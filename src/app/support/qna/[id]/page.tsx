import type { Metadata } from "next";

import { QnaDetailPage } from "@/components/support/qna-detail-page";
import { requireMockLogin } from "@/lib/mock-auth";

export const metadata: Metadata = {
  title: "1:1 상담 상세",
  description: "한평생 직업훈련센터 1:1 상담 상세",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  requireMockLogin(`/support/qna/${id}`);

  return <QnaDetailPage id={id} />;
}
