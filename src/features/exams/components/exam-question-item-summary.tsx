import { M } from "@/features/courses/lib/course-design";
import type { ExamQuestionManageSummary } from "@/features/exams/types/exam-question-item.types";

type ExamQuestionItemSummaryProps = {
  summary: ExamQuestionManageSummary;
};

export function ExamQuestionItemSummary({ summary }: ExamQuestionItemSummaryProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        borderRadius: 10,
        border: `1px solid ${M.border}`,
        background: M.hover,
        padding: 20,
      }}
    >
      <SummaryField label="시험명" value={summary.examName} />
      <SummaryField label="과정명" value={summary.courseName} />
      <SummaryField label="총 문제수" value={`${summary.totalQuestionCount}문제`} />
      <SummaryField label="등록된 문제수" value={`${summary.registeredQuestionCount}문제`} />
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: M.mute }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600, color: M.ink }}>{value}</div>
    </div>
  );
}
