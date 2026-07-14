"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { ExamResultListTable } from "@/features/exam-results/components/exam-result-list-table";
import { ExamResultListToolbar } from "@/features/exam-results/components/exam-result-list-toolbar";
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
    <div className="space-y-6">
      <AdminPageHeader
        title="성적관리"
        description="학생이 응시한 시험 결과와 응시 상태를 확인하고, 필요 시 재시험을 허용할 수 있습니다."
      />

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
        시험 등록/수정/문제관리는 과정관리 &gt; 시험관리에서 처리합니다. 이 화면은 학생의 시험
        응시 결과 조회와 재시험 허용 전용입니다.
      </div>

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <ExamResultListToolbar query={query} />
          <ExamResultListTable
            result={result}
            retakeAllowedOverrides={retakeAllowedOverrides}
            onRetakeAllowed={handleRetakeAllowed}
          />
        </AdminCardContent>
        <AdminCardFooter>
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
        </AdminCardFooter>
      </AdminCard>
    </div>
  );
}
