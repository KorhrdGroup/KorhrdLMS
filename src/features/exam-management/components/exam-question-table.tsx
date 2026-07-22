"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import { M } from "@/features/courses/lib/course-design";
import type { ExamQuestion } from "@/features/exam-management/types/exam.types";

function truncate(value: string, maxLength = 60) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

type ExamQuestionTableProps = {
  questions: ExamQuestion[];
  onEditClick?: (question: ExamQuestion) => void;
  onMoveClick?: (question: ExamQuestion, direction: "up" | "down") => void;
  onDeleteClick?: (question: ExamQuestion) => void;
  isMoving?: boolean;
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

const moveBtnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 7,
  background: "#fff",
  border: `1px solid ${M.border}`,
  color: M.text,
};

export function ExamQuestionTable({
  questions,
  onEditClick,
  onMoveClick,
  onDeleteClick,
  isMoving,
}: ExamQuestionTableProps) {
  if (questions.length === 0) {
    return (
      <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 문제가 없습니다. 문제 추가 버튼으로 첫 문제를 등록하세요.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, width: 64 }}>번호</th>
            <th style={th}>문제내용</th>
            <th style={{ ...th, textAlign: "center", width: 80 }}>정답</th>
            <th style={{ ...th, textAlign: "center", width: 80 }}>배점</th>
            <th style={{ ...th, textAlign: "center", width: 128 }}>순서 변경</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>수정</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>삭제</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => {
            const upDisabled = Boolean(isMoving) || index === 0;
            const downDisabled = Boolean(isMoving) || index === questions.length - 1;

            return (
              <tr key={question.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, color: M.mute }}>{question.order}</td>
                <td style={{ ...td, maxWidth: 420, color: M.ink, fontWeight: 600 }}>
                  {truncate(question.question)}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.ink, fontWeight: 600 }}>
                  {question.answer}번
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>{question.score}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <button
                      type="button"
                      disabled={upDisabled}
                      aria-label="위로 이동"
                      onClick={() => onMoveClick?.(question, "up")}
                      style={{ ...moveBtnBase, cursor: upDisabled ? "not-allowed" : "pointer", opacity: upDisabled ? 0.4 : 1 }}
                    >
                      <ArrowUp style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      type="button"
                      disabled={downDisabled}
                      aria-label="아래로 이동"
                      onClick={() => onMoveClick?.(question, "down")}
                      style={{ ...moveBtnBase, cursor: downDisabled ? "not-allowed" : "pointer", opacity: downDisabled ? 0.4 : 1 }}
                    >
                      <ArrowDown style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onEditClick?.(question)}
                    style={{ ...iconBtn, margin: "0 auto", border: `1px solid ${M.border}`, color: M.text }}
                  >
                    <Pencil style={{ width: 14, height: 14 }} />
                    수정
                  </button>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(question)}
                    style={{ ...iconBtn, margin: "0 auto", border: "1px solid #f4c9cd", color: M.danger }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    삭제
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
