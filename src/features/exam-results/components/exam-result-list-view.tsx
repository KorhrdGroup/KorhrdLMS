"use client";

import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { ExamResultListTable } from "@/features/exam-results/components/exam-result-list-table";
import { ExamResultListToolbar } from "@/features/exam-results/components/exam-result-list-toolbar";
import { M } from "@/features/courses/lib/course-design";
import { buildExamResultPageHref } from "@/features/exam-results/lib/exam-result-list-query";
import type {
  ExamResultListQuery,
  ExamResultListResult,
} from "@/features/exam-results/types/exam-result.types";

type ExamResultListViewProps = {
  result: ExamResultListResult;
  query: ExamResultListQuery;
};

export function ExamResultListView({ result, query }: ExamResultListViewProps) {
  const [retakeAllowedOverrides, setRetakeAllowedOverrides] = useState<Set<string>>(new Set());

  function handleRetakeAllowed(submissionId: string) {
    setRetakeAllowedOverrides((prev) => new Set(prev).add(submissionId));
  }

  return (
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            평가관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>성적관리</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>성적 관리</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            학생이 응시한 시험 결과와 응시 상태를 확인하고, 필요 시 재시험을 허용할 수 있습니다 · 총 {result.total}개
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div
        style={{
          marginBottom: 22,
          borderRadius: 8,
          border: `1px solid ${M.border}`,
          background: M.weakBg,
          color: M.weakFg,
          padding: "12px 14px",
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        시험 등록/수정/문제관리는 과정관리 &gt; 시험관리에서 처리합니다. 이 화면은 학생의 시험 응시
        결과 조회와 재시험 허용 전용입니다.
      </div>

      <ExamResultListToolbar query={query} />

      <ExamResultListTable
        result={result}
        retakeAllowedOverrides={retakeAllowedOverrides}
        onRetakeAllowed={handleRetakeAllowed}
      />

      <div style={{ marginTop: 20 }}>
        <AdminListPagination
          page={result.page}
          totalPages={result.totalPages}
          totalItems={result.total}
          pageSize={result.pageSize}
          query={{
            page: query.page,
            pageSize: query.pageSize,
            search: query.search,
            field: "all",
          }}
          buildPageHref={(page) => buildExamResultPageHref(page, query)}
          className="w-full"
        />
      </div>
    </div>
  );
}
