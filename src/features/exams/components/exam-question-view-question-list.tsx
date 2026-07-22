import type { CSSProperties } from "react";

import { EXAM_QUESTION_TYPE_LABELS } from "@/features/exams/constants";
import {
  formatQuestionAnswerDisplay,
  getQuestionChoicesDisplay,
} from "@/features/exams/lib/exam-question-view.utils";
import { M } from "@/features/courses/lib/course-design";
import type { ExamQuestionViewItem } from "@/features/exams/types/exam-question-view.types";

type ExamQuestionViewQuestionListProps = {
  questions: ExamQuestionViewItem[];
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "11px 14px",
  fontSize: 12,
  fontWeight: 500,
  color: M.mute,
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "14px",
  fontSize: 13,
  color: M.body,
  verticalAlign: "top",
};

export function ExamQuestionViewQuestionList({ questions }: ExamQuestionViewQuestionListProps) {
  if (questions.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 문제가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, width: 80 }}>문항번호</th>
            <th style={{ ...th, minWidth: 240 }}>문제내용</th>
            <th style={{ ...th, minWidth: 220 }}>보기</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>정답</th>
            <th style={{ ...th, textAlign: "center", width: 72 }}>배점</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>문제유형</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((item) => {
            const choices = getQuestionChoicesDisplay(item.questionType, item);

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, color: M.mute }}>{item.number}</td>
                <td style={{ ...td, whiteSpace: "pre-wrap", color: M.ink }}>{item.question}</td>
                <td style={td}>
                  {choices.length > 0 ? (
                    <ul style={{ display: "flex", flexDirection: "column", gap: 4, margin: 0, padding: 0, listStyle: "none" }}>
                      {choices.map((choice) => (
                        <li key={choice}>{choice}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: M.mute }}>—</span>
                  )}
                </td>
                <td style={{ ...td, textAlign: "center", fontWeight: 600, color: M.ink }}>
                  {formatQuestionAnswerDisplay(item.questionType, item.answer)}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{item.score}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  {EXAM_QUESTION_TYPE_LABELS[item.questionType]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
