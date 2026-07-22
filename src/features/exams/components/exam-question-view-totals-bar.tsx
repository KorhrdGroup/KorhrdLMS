import { M } from "@/features/courses/lib/course-design";
import type { ExamQuestionViewTotals } from "@/features/exams/types/exam-question-view.types";

type ExamQuestionViewTotalsBarProps = {
  totals: ExamQuestionViewTotals;
};

export function ExamQuestionViewTotalsBar({ totals }: ExamQuestionViewTotalsBarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 24,
        borderTop: `1px solid ${M.line}`,
        paddingTop: 16,
        fontSize: 13,
      }}
    >
      <div>
        <span style={{ color: M.mute }}>총 문제수</span>
        <span style={{ marginLeft: 8, fontWeight: 600, color: M.ink }}>
          {totals.totalQuestionCount}문제
        </span>
      </div>
      <div>
        <span style={{ color: M.mute }}>총 배점</span>
        <span style={{ marginLeft: 8, fontWeight: 600, color: M.ink }}>{totals.totalScore}점</span>
      </div>
    </div>
  );
}
