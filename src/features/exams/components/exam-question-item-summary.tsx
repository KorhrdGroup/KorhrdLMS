import type { ExamQuestionManageSummary } from "@/features/exams/types/exam-question-item.types";

type ExamQuestionItemSummaryProps = {
  summary: ExamQuestionManageSummary;
};

export function ExamQuestionItemSummary({ summary }: ExamQuestionItemSummaryProps) {
  return (
    <div className="grid gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryField label="시험명" value={summary.examName} />
      <SummaryField label="과정명" value={summary.courseName} />
      <SummaryField label="총 문제수" value={`${summary.totalQuestionCount}문제`} />
      <SummaryField
        label="등록된 문제수"
        value={`${summary.registeredQuestionCount}문제`}
      />
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
