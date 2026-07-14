import type { Metadata } from "next";

import { ExamQuestionListView } from "@/features/exams/components/exam-question-list-view";
import { parseExamQuestionListQuery } from "@/features/exams/lib/exam-question-list-query";
import {
  getExamQuestionFilterOptions,
  getExamQuestionList,
} from "@/features/exams/services/exam-question-list.service";

export const metadata: Metadata = {
  title: "시험문제 관리",
};

type ExamQuestionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExamQuestionsPage({
  searchParams,
}: ExamQuestionsPageProps) {
  const params = await searchParams;
  const query = parseExamQuestionListQuery(params);

  try {
    const [result, filterOptions] = await Promise.all([
      getExamQuestionList(query),
      getExamQuestionFilterOptions(),
    ]);

    return (
      <ExamQuestionListView
        result={result}
        query={query}
        filterOptions={filterOptions}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "시험 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">시험문제 관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
