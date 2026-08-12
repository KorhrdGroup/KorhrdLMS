"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { M } from "@/features/courses/lib/course-design";
import type {
  ExamResultRow,
  ExamResultSummary,
} from "@/features/exam-management/services/exam-result-list.service";
import { formatDate } from "@/lib/shared/format-date";

type ExamResultListViewProps = {
  summary: ExamResultSummary;
  rows: ExamResultRow[];
};

type Filter = "all" | "passed" | "failed";

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

/** 시험별 응시 결과 — 합격자/불합격자 목록 (시험관리 > 응시결과) */
export function ExamResultListView({ summary, rows }: ExamResultListViewProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(() => {
    if (filter === "passed") return rows.filter((row) => row.isPassed);
    if (filter === "failed") return rows.filter((row) => !row.isPassed);
    return rows;
  }, [filter, rows]);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: summary.total },
    { key: "passed", label: "합격자", count: summary.passed },
    { key: "failed", label: "불합격자", count: summary.failed },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${M.line}`, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 12, color: M.mute, marginBottom: 4 }}>
            <Link href="/admin/exams" style={{ color: M.mute }}>시험관리</Link> / 응시결과
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: M.ink }}>{summary.examTitle}</h2>
          <p style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            {summary.courseName} · 합격 기준 {summary.passScore}점 · 총 {summary.total}명 응시
            (합격 {summary.passed} · 불합격 {summary.failed})
          </p>
        </div>
        <Link
          href="/admin/exams"
          style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 13,
            border: `1px solid ${M.border}`, color: M.text, background: "#fff",
          }}
        >
          목록으로
        </Link>
      </div>

      <div style={{ display: "flex", gap: 6, margin: "18px 0 12px" }}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={filter === item.key}
            onClick={() => setFilter(item.key)}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              fontWeight: filter === item.key ? 700 : 500,
              background: filter === item.key ? M.accent : "#fff",
              color: filter === item.key ? "#fff" : M.text,
              border: `1px solid ${filter === item.key ? M.accent : M.border}`,
            }}
          >
            {item.label} {item.count}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div style={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
          {filter === "passed" ? "합격자가 없습니다." : filter === "failed" ? "불합격자가 없습니다." : "아직 응시 기록이 없습니다."}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
                <th style={th}>회원명</th>
                <th style={th}>아이디</th>
                <th style={{ ...th, textAlign: "center", width: 90 }}>점수</th>
                <th style={{ ...th, textAlign: "center", width: 90 }}>합격여부</th>
                <th style={{ ...th, textAlign: "center", width: 120 }}>응시일</th>
                <th style={{ ...th, textAlign: "right", width: 110 }}>성적관리</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.submissionId} style={{ borderBottom: `1px solid ${M.line}` }}>
                  <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{row.memberName}</td>
                  <td style={td}>{row.memberLoginId}</td>
                  <td style={{ ...td, textAlign: "center", fontWeight: 700 }}>{row.percent}점</td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 999,
                        fontSize: 12, fontWeight: 700,
                        background: row.isPassed ? "#E8F5EE" : "#FDECEC",
                        color: row.isPassed ? "#0A7350" : M.danger,
                      }}
                    >
                      {row.isPassed ? "합격" : "불합격"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>{formatDate(row.submittedAt)}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {/* 성적 상세에서 진도율·시험점수를 바로 고칠 수 있습니다 */}
                    <Link
                      href={`/admin/grades/${row.enrollmentId}`}
                      style={{
                        padding: "6px 10px", borderRadius: 7, fontSize: 12,
                        border: `1px solid ${M.border}`, color: M.text, background: "#fff",
                      }}
                    >
                      성적 상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
