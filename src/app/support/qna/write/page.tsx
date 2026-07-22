import type { Metadata } from "next";

import { QnaWritePage } from "@/components/support/qna-write-page";
import { requireStudentLogin } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "1:1 상담 글쓰기",
  description: "한평생 직업훈련센터 1:1 상담 글쓰기",
};

export default async function Page() {
  const member = await requireStudentLogin("/support/qna/write");

  return <QnaWritePage authorName={member.name} />;
}
