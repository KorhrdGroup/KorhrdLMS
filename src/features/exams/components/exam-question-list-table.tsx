"use client";

import { Eye, FilePlus, Pencil } from "lucide-react";
import type { CSSProperties } from "react";
import { useState, useTransition } from "react";

import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { updateExamPrintEnabledAction } from "@/features/exams/actions/exam-question.actions";
import {
  EXAM_KIND_LABELS,
  EXAM_TYPE_LABELS,
} from "@/features/exams/constants";
import { M } from "@/features/courses/lib/course-design";
import type { ExamQuestionListItem } from "@/features/exams/types/exam-question.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ExamQuestionListTableProps = {
  result: PaginatedResult<ExamQuestionListItem>;
  onRegisterClick?: (item: ExamQuestionListItem) => void;
  onViewClick?: (item: ExamQuestionListItem) => void;
  onEditClick?: (item: ExamQuestionListItem) => void;
  onPrintChange?: () => void;
  onPrintError?: (message: string) => void;
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
  whiteSpace: "nowrap",
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
  border: `1px solid ${M.border}`,
  color: M.text,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function ExamQuestionListTable({
  result,
  onRegisterClick,
  onViewClick,
  onEditClick,
  onPrintChange,
  onPrintError,
}: ExamQuestionListTableProps) {
  const [updatingExamId, setUpdatingExamId] = useState<string | null>(null);
  const [isUpdating, startUpdate] = useTransition();

  function handlePrintChange(item: ExamQuestionListItem, printEnabled: boolean) {
    setUpdatingExamId(item.id);

    startUpdate(async () => {
      try {
        const response = await updateExamPrintEnabledAction(item.id, printEnabled);

        if (!response.success) {
          onPrintError?.(response.message);
          return;
        }

        onPrintChange?.();
      } catch (error) {
        onPrintError?.(
          error instanceof Error ? error.message : "출력 설정 저장에 실패했습니다.",
        );
      } finally {
        setUpdatingExamId(null);
      }
    });
  }

  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        조회된 시험이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, width: 72 }}>연도</th>
            <th style={th}>과정명</th>
            <th style={th}>시험명</th>
            <th style={th}>시험종류</th>
            <th style={th}>시험유형</th>
            <th style={th}>등록일</th>
            <th style={{ ...th, textAlign: "center", width: 112 }}>문제등록</th>
            <th style={{ ...th, textAlign: "center", width: 112 }}>문제보기</th>
            <th style={{ ...th, textAlign: "center", width: 72 }}>출력</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>수정</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item) => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.mute }}>{item.year}</td>
              <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{item.courseName}</td>
              <td style={td}>{item.name}</td>
              <td style={{ ...td, color: M.mute }}>{EXAM_KIND_LABELS[item.examKind]}</td>
              <td style={{ ...td, color: M.mute }}>{EXAM_TYPE_LABELS[item.examType]}</td>
              <td style={{ ...td, color: M.mute }}>{formatDate(item.createdAt)}</td>
              <td style={{ ...td, textAlign: "center" }}>
                <button type="button" onClick={() => onRegisterClick?.(item)} style={iconBtn}>
                  <FilePlus style={{ width: 14, height: 14 }} />
                  문제등록
                </button>
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button type="button" onClick={() => onViewClick?.(item)} style={iconBtn}>
                  <Eye style={{ width: 14, height: 14 }} />
                  문제보기
                </button>
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <AdminCheckbox
                  checked={item.printEnabled}
                  disabled={isUpdating && updatingExamId === item.id}
                  aria-label={`${item.name} 출력 설정`}
                  onChange={(event) => handlePrintChange(item, event.target.checked)}
                />
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => onEditClick?.(item)}
                  style={{ ...iconBtn, margin: "0 auto" }}
                >
                  <Pencil style={{ width: 14, height: 14 }} />
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
