"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

import { LectureStatusBadge } from "@/features/lectures/components/lecture-status-badge";
import { M } from "@/features/courses/lib/course-design";
import type { LectureListItem } from "@/features/lectures/types/lecture.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type LectureListTableProps = {
  result: PaginatedResult<LectureListItem>;
  onEditClick?: (lecture: LectureListItem) => void;
  onDeleteClick?: (lecture: LectureListItem) => void;
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

export function LectureListTable({ result, onEditClick, onDeleteClick }: LectureListTableProps) {
  const router = useRouter();

  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 강의가 없습니다. 강의등록 버튼으로 새 강의를 추가하세요.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={th}>강의명</th>
            <th style={th}>연결 과정</th>
            <th style={{ ...th, textAlign: "center", width: 100 }}>총 차시 수</th>
            <th style={{ ...th, textAlign: "center", width: 90 }}>상태</th>
            <th style={{ ...th, textAlign: "center", width: 120 }}>차시관리</th>
            <th style={{ ...th, textAlign: "right", width: 130 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((lecture) => (
            <tr key={lecture.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{lecture.title}</td>
              <td style={td}>{lecture.courseName}</td>
              <td style={{ ...td, textAlign: "center" }}>{lecture.sessionCount}</td>
              <td style={{ ...td, textAlign: "center" }}>
                <LectureStatusBadge isPublished={lecture.isPublished} />
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/lectures/${lecture.id}/curriculum`)}
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
                  차시관리
                </button>
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => onEditClick?.(lecture)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 7,
                      fontSize: 12,
                      background: "#fff",
                      border: `1px solid ${M.border}`,
                      color: M.text,
                      cursor: "pointer",
                    }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(lecture)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 7,
                      fontSize: 12,
                      background: "#fff",
                      border: "1px solid #e7c3c3",
                      color: "#c0504d",
                      cursor: "pointer",
                    }}
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
