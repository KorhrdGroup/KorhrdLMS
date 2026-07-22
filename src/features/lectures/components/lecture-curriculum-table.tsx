"use client";

import type { CSSProperties } from "react";

import { formatVideoDuration } from "@/features/lectures/constants";
import { M } from "@/features/courses/lib/course-design";
import type { LectureSession } from "@/features/lectures/types/lecture.types";

type LectureCurriculumTableProps = {
  sessions: LectureSession[];
  onEditClick?: (session: LectureSession) => void;
  onVideoClick?: (session: LectureSession) => void;
  onMoveClick?: (session: LectureSession, direction: "up" | "down") => void;
  onDeleteClick?: (session: LectureSession) => void;
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

const smallBtn: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 7,
  fontSize: 12,
  background: "#fff",
  border: `1px solid ${M.border}`,
  color: M.text,
  cursor: "pointer",
};

export function LectureCurriculumTable({
  sessions,
  onEditClick,
  onVideoClick,
  onMoveClick,
  onDeleteClick,
  isMoving,
}: LectureCurriculumTableProps) {
  if (sessions.length === 0) {
    return (
      <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 차시가 없습니다. 차시 추가 버튼으로 첫 차시를 등록하세요.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={{ ...th, width: 64 }}>순서</th>
            <th style={th}>차시명</th>
            <th style={{ ...th, textAlign: "center", width: 90 }}>학습시간</th>
            <th style={{ ...th, textAlign: "center", width: 150 }}>영상</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>순서 변경</th>
            <th style={{ ...th, textAlign: "right", width: 130 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, index) => (
            <tr key={session.id} style={{ borderBottom: `1px solid ${M.line}` }}>
              <td style={{ ...td, color: M.mute }}>{session.order}차시</td>
              <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{session.title}</td>
              <td style={{ ...td, textAlign: "center" }}>
                {session.durationMinutes != null ? `${session.durationMinutes}분` : "-"}
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                {session.videoUrl ? (
                  <button
                    type="button"
                    onClick={() => onVideoClick?.(session)}
                    title={session.videoFileName ?? session.videoUrl}
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      background: M.weakBg,
                      border: "none",
                      borderRadius: 7,
                      padding: "5px 10px",
                      cursor: "pointer",
                      maxWidth: 140,
                    }}
                  >
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: M.weakFg }}>✓ 업로드완료</span>
                    <span style={{ fontSize: 10, color: M.weakFg, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.videoFileName ?? "외부 URL"}
                      {session.videoDurationSeconds ? ` · ${formatVideoDuration(session.videoDurationSeconds)}` : ""}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onVideoClick?.(session)}
                    style={{ ...smallBtn, fontWeight: 600, color: M.accent, borderColor: "#c3dafe" }}
                  >
                    영상 업로드
                  </button>
                )}
              </td>
              <td style={{ ...td, textAlign: "center" }}>
                <div style={{ display: "inline-flex", gap: 6 }}>
                  <button
                    type="button"
                    aria-label="위로 이동"
                    disabled={isMoving || index === 0}
                    onClick={() => onMoveClick?.(session, "up")}
                    style={{ ...smallBtn, padding: "5px 9px", opacity: index === 0 ? 0.4 : 1, cursor: index === 0 ? "default" : "pointer" }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="아래로 이동"
                    disabled={isMoving || index === sessions.length - 1}
                    onClick={() => onMoveClick?.(session, "down")}
                    style={{ ...smallBtn, padding: "5px 9px", opacity: index === sessions.length - 1 ? 0.4 : 1, cursor: index === sessions.length - 1 ? "default" : "pointer" }}
                  >
                    ↓
                  </button>
                </div>
              </td>
              <td style={{ ...td, textAlign: "right" }}>
                <div style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => onEditClick?.(session)} style={smallBtn}>
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(session)}
                    style={{ ...smallBtn, border: "1px solid #f4c9cd", color: M.danger }}
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
