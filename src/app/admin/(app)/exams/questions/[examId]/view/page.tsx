import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExamQuestionViewPage } from "@/features/exams/components/exam-question-view-page";
import { getExamQuestionViewPage } from "@/features/exams/services/exam-question-view.service";

export const metadata: Metadata = {
  title: "문제보기",
};

type ExamQuestionViewRoutePageProps = {
  params: Promise<{ examId: string }>;
};

export default async function ExamQuestionViewRoutePage({
  params,
}: ExamQuestionViewRoutePageProps) {
  const { examId } = await params;

  try {
    const result = await getExamQuestionViewPage(examId);

    if (!result.success) {
      notFound();
    }

    return (
      <ExamQuestionViewPage
        summary={result.summary}
        questions={result.questions}
        totals={result.totals}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "문제 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">문제보기</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
