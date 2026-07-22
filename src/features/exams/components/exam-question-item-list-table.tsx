"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import { EXAM_QUESTION_TYPE_LABELS } from "@/features/exams/constants";
import { truncateQuestionContent } from "@/features/exams/lib/exam-question-item.utils";
import { M } from "@/features/courses/lib/course-design";
import type { ExamQuestionItem } from "@/features/exams/types/exam-question-item.types";

type ExamQuestionItemListTableProps = {
  questions: ExamQuestionItem[];
  onEditClick?: (item: ExamQuestionItem) => void;
  onDeleteClick?: (item: ExamQuestionItem) => void;
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "11px 10px",
  fontSize: 12,
  fontWeight: 500,
  color: M.mute,
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "13px 10px",
  fontSize: 13,
  color: M.body,
  verticalAlign: "middle",
};

const iconBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  background: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function ExamQuestionItemListTable({
  questions,
  onEditClick,
  onDeleteClick,
}: ExamQuestionItemListTableProps) {
  if (questions.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 문제가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, width: 64 }}>번호</th>
            <th style={th}>문제유형</th>
            <th style={th}>문제내용</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>보기개수</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>정답</th>
            <th style={{ ...th, textAlign: "center", width: 72 }}>배점</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>수정</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((item) => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.mute }}>{item.number}</td>
              <td style={td}>{EXAM_QUESTION_TYPE_LABELS[item.questionType]}</td>
              <td style={{ ...td, maxWidth: 360, color: M.ink }}>
                {truncateQuestionContent(item.question)}
              </td>
              <td style={{ ...td, textAlign: "center", color: M.mute }}>{item.choiceCount}</td>
              <td style={{ ...td, textAlign: "center", color: M.ink, fontWeight: 600 }}>{item.answer}</td>
              <td style={{ ...td, textAlign: "center", color: M.mute }}>{item.score}</td>
              <td style={{ ...td, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => onEditClick?.(item)}
                  style={{ ...iconBtn, margin: "0 auto", border: `1px solid ${M.border}`, color: M.text }}
                >
                  <Pencil style={{ width: 14, height: 14 }} />
                  수정
                </button>
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => onDeleteClick?.(item)}
                  style={{ ...iconBtn, margin: "0 auto", border: "1px solid #f4c9cd", color: M.danger }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
