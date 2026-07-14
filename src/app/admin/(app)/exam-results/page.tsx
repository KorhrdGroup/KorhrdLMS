import type { Metadata } from "next";

import { ExamResultListView } from "@/features/exam-results/components/exam-result-list-view";
import { parseExamResultListQuery } from "@/features/exam-results/lib/exam-result-list-query";
import { getExamResultList } from "@/features/exam-results/services/exam-result-list.service";

export const metadata: Metadata = {
  title: "성적관리 | 평가관리",
};

type ExamResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadExamResultList(
  query: ReturnType<typeof parseExamResultListQuery>,
): Promise<{ success: true; result: Awaited<ReturnType<typeof getExamResultList>> } | { success: false; message: string }> {
  try {
    const result = await getExamResultList(query);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "시험 응시 결과를 불러오지 못했습니다.",
    };
  }
}

export default async function ExamResultsPage({ searchParams }: ExamResultsPageProps) {
  const params = await searchParams;
  const query = parseExamResultListQuery(params);
  const loaded = await loadExamResultList(query);

  if (!loaded.success) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">성적관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{loaded.message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return <ExamResultListView result={loaded.result} query={query} />;
}
