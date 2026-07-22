"use client";

import type { CSSProperties } from "react";

import { ExamResultPassBadge } from "@/features/exam-results/components/exam-result-pass-badge";
import { ExamResultRetakeButton } from "@/features/exam-results/components/exam-result-retake-button";
import { M } from "@/features/courses/lib/course-design";
import type { ExamResultListResult } from "@/features/exam-results/types/exam-result.types";
import { formatDateTime } from "@/lib/shared/format-date";

type ExamResultListTableProps = {
  result: ExamResultListResult;
  retakeAllowedOverrides: Set<string>;
  onRetakeAllowed: (submissionId: string) => void;
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

export function ExamResultListTable({
  result,
  retakeAllowedOverrides,
  onRetakeAllowed,
}: ExamResultListTableProps) {
  if (result.data.length === 0) {
    return (
      <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        조회된 시험 응시 기록이 없습니다.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1080 }}>
        <thead>
          <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
            <th style={th}>학생명</th>
            <th style={th}>아이디</th>
            <th style={th}>과정명</th>
            <th style={th}>시험명</th>
            <th style={{ ...th, textAlign: "center", width: 160 }}>응시일</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>점수</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>합격여부</th>
            <th style={{ ...th, textAlign: "center", width: 96 }}>응시상태</th>
            <th style={{ ...th, textAlign: "center", width: 112 }}>재시험 가능 여부</th>
            <th style={{ ...th, textAlign: "right", width: 128 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((item) => {
            const retakeAllowed = item.retakeAllowed || retakeAllowedOverrides.has(item.id);

            return (
              <tr key={item.id} style={{ borderBottom: `1px solid ${M.line}` }}>
                <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{item.member.name}</td>
                <td style={{ ...td, color: M.mute }}>{item.member.loginId}</td>
                <td style={td}>{item.course.name}</td>
                <td style={td}>{item.exam.name}</td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>
                  {formatDateTime(item.submittedAt)}
                </td>
                <td style={{ ...td, textAlign: "center", color: M.ink, fontWeight: 600 }}>
                  {item.score} / {item.totalScore}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <ExamResultPassBadge isPassed={item.isPassed} />
                </td>
                <td style={{ ...td, textAlign: "center", color: M.mute }}>
                  {retakeAllowed ? "재시험 대기" : "응시완료"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 12,
                      fontWeight: 500,
                      background: retakeAllowed ? M.weakBg : M.hover,
                      color: retakeAllowed ? M.weakFg : M.mute,
                    }}
                  >
                    {retakeAllowed ? "가능" : "불가"}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <ExamResultRetakeButton
                      submissionId={item.id}
                      retakeAllowed={retakeAllowed}
                      onAllowed={() => onRetakeAllowed(item.id)}
                    />
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
