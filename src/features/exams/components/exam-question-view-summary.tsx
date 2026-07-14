import type { ExamQuestionViewSummary } from "@/features/exams/types/exam-question-view.types";

type ExamQuestionViewSummaryProps = {
  summary: ExamQuestionViewSummary;
};

export function ExamQuestionViewSummary({ summary }: ExamQuestionViewSummaryProps) {
  return (
    <div className="grid gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryField label="시험명" value={summary.examName} />
      <SummaryField label="과정명" value={summary.courseName} />
      <SummaryField label="시험기간" value={summary.examPeriod} />
      <SummaryField label="시험시간" value={summary.examDuration} />
      <SummaryField label="총 문제수" value={`${summary.totalQuestionCount}문제`} />
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-[#111827]">{value}</dd>
    </div>
  );
}
