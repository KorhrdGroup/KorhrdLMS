"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

import { EXAM_KIND_LABELS } from "@/features/exam-management/constants";
import { ExamStatusBadge } from "@/features/exam-management/components/exam-status-badge";
import { M } from "@/features/courses/lib/course-design";
import type { ExamListItem } from "@/features/exam-management/types/exam.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ExamListTableProps = {
  result: PaginatedResult<ExamListItem>;
  onEditClick?: (exam: ExamListItem) => void;
  onDeleteClick?: (exam: ExamListItem) => void;
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

export function ExamListTable({ result, onEditClick, onDeleteClick }: ExamListTableProps) {
  const router = useRouter();

  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 시험이 없습니다. 시험등록 버튼으로 새 시험을 추가하세요.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={th}>시험명</th>
            <th style={th}>연결 과정</th>
            <th style={{ ...th, textAlign: "center", width: 100 }}>시험종류</th>
            <th style={{ ...th, textAlign: "center", width: 90 }}>상태</th>
            <th style={{ ...th, textAlign: "center", width: 140 }}>문제관리</th>
            <th style={{ ...th, textAlign: "right", width: 130 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((exam) => (
            <tr key={exam.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{exam.title}</td>
              <td style={td}>{exam.courseName}</td>
              <td style={{ ...td, textAlign: "center" }}>{EXAM_KIND_LABELS[exam.examKind]}</td>
              <td style={{ ...td, textAlign: "center" }}>
                <ExamStatusBadge isPublished={exam.isPublished} />
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/exams/${exam.id}/questions`)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    background: M.accent,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  문제관리 ({exam.questionCount})
                </button>
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => onEditClick?.(exam)}
                    style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12, background: "#fff", border: `1px solid ${M.border}`, color: M.text, cursor: "pointer" }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(exam)}
                    style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12, background: "#fff", border: "1px solid #f4c9cd", color: M.danger, cursor: "pointer" }}
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
