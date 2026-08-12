"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import { M } from "@/features/courses/lib/course-design";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import type {
  ExamOverviewRow,
  ExamOverviewSummary,
} from "@/features/exam-management/services/exam-results-overview.service";
import { formatDate } from "@/lib/shared/format-date";

type ExamResultsOverviewViewProps = {
  summary: ExamOverviewSummary;
  rows: ExamOverviewRow[];
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

/** 시험관리 > 합격/불합격 현황 — 모든 시험의 응시 결과를 한곳에서 봅니다. */
export function ExamResultsOverviewView({ summary, rows }: ExamResultsOverviewViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [keyword, setKeyword] = useState("");

  const shown = useMemo(() => {
    const key = keyword.trim();
    return rows.filter((row) => {
      if (filter === "passed" && !row.isPassed) return false;
      if (filter === "failed" && row.isPassed) return false;
      if (!key) return true;
      return (
        row.memberName.includes(key) ||
        row.memberLoginId.includes(key) ||
        row.courseName.includes(key) ||
        row.examTitle.includes(key)
      );
    });
  }, [rows, filter, keyword]);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: summary.total },
    { key: "passed", label: "합격자", count: summary.passed },
    { key: "failed", label: "불합격자", count: summary.failed },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${M.line}`, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: M.ink }}>합격/불합격 현황</h2>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          모든 시험의 응시 결과를 한곳에서 확인합니다 · 총 {summary.total}건
          (합격 {summary.passed} · 불합격 {summary.failed})
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ExamSubNav />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14 }}>
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
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="이름·아이디·과정·시험명 검색"
          style={{
            marginLeft: "auto", height: 36, minWidth: 220,
            border: `1px solid ${M.border}`, borderRadius: 8,
            padding: "0 12px", fontSize: 13, color: M.text, outline: "none",
          }}
        />
      </div>

      {shown.length === 0 ? (
        <div style={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
          조건에 맞는 응시 기록이 없습니다.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ borderTop: `1.5px solid ${M.ink}`, borderBottom: `1px solid ${M.line}` }}>
                <th style={th}>회원명</th>
                <th style={th}>아이디</th>
                <th style={th}>과정</th>
                <th style={th}>시험명</th>
                <th style={{ ...th, textAlign: "center", width: 80 }}>점수</th>
                <th style={{ ...th, textAlign: "center", width: 90 }}>합격여부</th>
                <th style={{ ...th, textAlign: "center", width: 110 }}>응시일</th>
                <th style={{ ...th, textAlign: "right", width: 100 }}>성적관리</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.submissionId} style={{ borderBottom: `1px solid ${M.line}` }}>
                  <td style={{ ...td, color: M.ink, fontWeight: 600 }}>{row.memberName}</td>
                  <td style={td}>{row.memberLoginId}</td>
                  <td style={td}>{row.courseName}</td>
                  <td style={td}>{row.examTitle}</td>
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
