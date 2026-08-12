import { ExamResultsOverviewView } from "@/features/exam-management/components/exam-results-overview-view";
import { getExamResultsOverview } from "@/features/exam-management/services/exam-results-overview.service";

/** 시험관리 > 합격/불합격 현황 — 전체 시험 응시 결과 모아보기 */
export default async function ExamResultsOverviewPage() {
  const { summary, rows } = await getExamResultsOverview();

  return <ExamResultsOverviewView summary={summary} rows={rows} />;
}
