import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExamQuestionItemManageView } from "@/features/exams/components/exam-question-item-manage-view";
import { getExamQuestionManagePage } from "@/features/exams/services/exam-question-item-list.service";

export const metadata: Metadata = {
  title: "문제등록",
};

type ExamQuestionItemsPageProps = {
  params: Promise<{ examId: string }>;
};

export default async function ExamQuestionItemsPage({
  params,
}: ExamQuestionItemsPageProps) {
  const { examId } = await params;

  try {
    const result = await getExamQuestionManagePage(examId);

    if (!result.success) {
      notFound();
    }

    return (
      <ExamQuestionItemManageView
        summary={result.summary}
        questions={result.questions}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "문제 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">문제등록</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
