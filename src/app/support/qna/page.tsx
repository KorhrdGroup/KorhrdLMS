import type { Metadata } from "next";

import { QnaPage } from "@/components/support/qna-page";
import { getMySupportQnaList } from "@/features/support-qna/services/support-qna.service";
import { requireStudentLogin } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "1:1 상담",
  description: "한평생 직업훈련센터 1:1 상담",
};

/**
 * 1:1 상담은 회원 전용입니다. 실제 로그인 세션을 확인하고,
 * 본인이 작성한 상담글(board_posts, board_type='consultation')만 조회합니다.
 */
export default async function Page() {
  const member = await requireStudentLogin("/support/qna");

  let tickets: Awaited<ReturnType<typeof getMySupportQnaList>> = [];
  try {
    tickets = await getMySupportQnaList(member.id);
  } catch {
    tickets = [];
  }

  return <QnaPage tickets={tickets} />;
}
