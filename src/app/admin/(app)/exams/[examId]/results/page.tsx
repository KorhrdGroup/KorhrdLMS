import { notFound } from "next/navigation";

import { ExamResultListView } from "@/features/exam-management/components/exam-result-list-view";
import { getExamResults } from "@/features/exam-management/services/exam-result-list.service";

type ExamResultsPageProps = {
  params: Promise<{ examId: string }>;
};

/** 시험관리 > 응시결과 — 시험별 합격자/불합격자 목록 */
export default async function ExamResultsPage({ params }: ExamResultsPageProps) {
  const { examId } = await params;
  const result = await getExamResults(examId);

  if (!result.success) {
    notFound();
  }

  return <ExamResultListView summary={result.summary} rows={result.rows} />;
}
