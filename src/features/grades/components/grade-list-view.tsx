"use client";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { GradeListTable } from "@/features/grades/components/grade-list-table";
import { GradeListToolbar } from "@/features/grades/components/grade-list-toolbar";
import { buildGradePageHref } from "@/features/grades/lib/grade-list-query";
import type { GradeListQuery, GradeListResult } from "@/features/grades/services/grade-list.service";

type GradeListViewProps = {
  result: GradeListResult;
  query: GradeListQuery;
};

export function GradeListView({ result, query }: GradeListViewProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="성적관리"
        description="회원·과정별 출석/시험/과제 점수를 확인하고 총점·등급·합격여부를 관리합니다."
      />

      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
        총점 = 출석점수(40%) + 시험점수(60%)로 자동 계산되며, 과제점수는 참고용으로
        총점에는 반영되지 않지만 과제 제출 여부는 합격 조건에 포함됩니다. 등급은
        A(90점 이상)·B(80점 이상)·C(70점 이상)·D(60점 이상)·F(60점 미만)이며, 합격은
        총점 60점 이상 + 출석률 60% 이상 + 시험 60점 이상 + 과제 제출 완료 시
        인정됩니다.
      </div>

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <GradeListToolbar query={query} />
          <GradeListTable result={result} />
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
            buildPageHref={(page) => buildGradePageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>
    </div>
  );
}
