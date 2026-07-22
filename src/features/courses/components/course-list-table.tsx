"use client";

import type { CSSProperties } from "react";

import { CourseStatusBadge } from "@/features/courses/components/course-status-badge";
import { M } from "@/features/courses/lib/course-design";
import type { CourseListItem } from "@/features/courses/types/course.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CourseListTableProps = {
  result: PaginatedResult<CourseListItem>;
  onEditClick?: (course: CourseListItem) => void;
  onDeleteClick?: (course: CourseListItem) => void;
  onViewStudentsClick?: (course: CourseListItem) => void;
};

function formatPercent(value: number | null) {
  return value == null ? "—" : `${value}%`;
}
function formatDuration(value: number | null) {
  return value == null ? "—" : `${value}일`;
}
function formatPrice(value: number) {
  return value ? `${value.toLocaleString("ko-KR")}원` : "문의";
}

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

function ActionBtn({
  label,
  onClick,
  tone = "outline",
}: {
  label: string;
  onClick?: () => void;
  tone?: "outline" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 7,
        fontSize: 12,
        cursor: "pointer",
        background: "#fff",
        border: `1px solid ${tone === "danger" ? "#e7c3c3" : M.border}`,
        color: tone === "danger" ? "#c0504d" : M.text,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export function CourseListTable({
  result,
  onEditClick,
  onDeleteClick,
  onViewStudentsClick,
}: CourseListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 과정이 없습니다. 과정등록 버튼으로 새 과정을 추가하세요.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, width: 48 }}>No</th>
            <th style={th}>과정명</th>
            <th style={th}>과정코드</th>
            <th style={th}>과정분류</th>
            <th style={th}>수강기간</th>
            <th style={th}>수강료</th>
            <th style={th}>출석률</th>
            <th style={th}>시험점수</th>
            <th style={th}>상태</th>
            <th style={th}>등록일</th>
            <th style={{ ...th, textAlign: "right" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((course, index) => {
            const rowNumber = result.total - (result.page - 1) * result.pageSize - index;
            return (
              <tr key={course.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, color: M.mute }}>{rowNumber}</td>
                <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{course.name}</td>
                <td style={td}>{course.code}</td>
                <td style={td}>{course.categoryName ?? "—"}</td>
                <td style={td}>{formatDuration(course.default_duration_days)}</td>
                <td style={td}>{formatPrice(course.price)}</td>
                <td style={td}>{formatPercent(course.completion_attendance_rate)}</td>
                <td style={td}>{formatPercent(course.completion_exam_score)}</td>
                <td style={td}>
                  <CourseStatusBadge status={course.status} />
                </td>
                <td style={td}>{formatDate(course.created_at)}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                    <ActionBtn label="수강생" onClick={() => onViewStudentsClick?.(course)} />
                    <ActionBtn label="수정" onClick={() => onEditClick?.(course)} />
                    <ActionBtn label="삭제" tone="danger" onClick={() => onDeleteClick?.(course)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
