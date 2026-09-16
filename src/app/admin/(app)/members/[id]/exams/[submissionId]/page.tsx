import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExamGradingView } from "@/features/member-exam-grading/components/exam-grading-view";
import {
  canCurrentAdminGradeMember,
  getExamGradingSheet,
} from "@/features/member-exam-grading/services/member-exam-grading.service";

export const metadata: Metadata = {
  title: "수료시험 채점 | 회원관리",
};

type MemberExamGradingPageProps = {
  params: Promise<{ id: string; submissionId: string }>;
};

/** 회원관리 > 회원 상세 > 시험관리 > 채점하기 — 제출된 수료시험지를 문제별로 정답 처리합니다. */
export default async function MemberExamGradingPage({ params }: MemberExamGradingPageProps) {
  const { id, submissionId } = await params;

  // 아기관리자는 STAR 회원만 — 다른 회원 URL을 직접 쳐도 회원 상세와 똑같이 404
  if (!(await canCurrentAdminGradeMember(id))) {
    notFound();
  }

  const sheet = await getExamGradingSheet(id, submissionId);
  if (!sheet) {
    notFound();
  }

  return <ExamGradingView sheet={sheet} />;
}
