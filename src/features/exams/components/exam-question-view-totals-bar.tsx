import type { ExamQuestionViewTotals } from "@/features/exams/types/exam-question-view.types";

type ExamQuestionViewTotalsBarProps = {
  totals: ExamQuestionViewTotals;
};

export function ExamQuestionViewTotalsBar({ totals }: ExamQuestionViewTotalsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-6 border-t border-[#E5E7EB] pt-4 text-sm">
      <div>
        <span className="text-[#6B7280]">총 문제수</span>
        <span className="ml-2 font-semibold text-[#111827]">
          {totals.totalQuestionCount}문제
        </span>
      </div>
      <div>
        <span className="text-[#6B7280]">총 배점</span>
        <span className="ml-2 font-semibold text-[#111827]">{totals.totalScore}점</span>
      </div>
    </div>
  );
}
