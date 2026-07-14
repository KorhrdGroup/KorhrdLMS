"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { ConfirmedStudentDetailModal } from "@/features/enrollments/components/confirmed-student-detail-modal";
import { ConfirmedStudentListTable } from "@/features/enrollments/components/confirmed-student-list-table";
import { ConfirmedStudentListToolbar } from "@/features/enrollments/components/confirmed-student-list-toolbar";
import { EnrollmentSubNav } from "@/features/enrollments/components/enrollment-sub-nav";
import { buildConfirmedStudentPageHref } from "@/features/enrollments/lib/confirmed-student-list-query";
import type {
  ConfirmedStudentFilterOptions,
  ConfirmedStudentListItem,
  ConfirmedStudentListQuery,
} from "@/features/enrollments/types/confirmed-student.types";
import type { ListQuery, PaginatedResult } from "@/lib/shared/list-query";

type ConfirmedStudentListViewProps = {
  result: PaginatedResult<ConfirmedStudentListItem>;
  query: ConfirmedStudentListQuery;
  filterOptions: ConfirmedStudentFilterOptions;
};

export function ConfirmedStudentListView({
  result,
  query,
  filterOptions,
}: ConfirmedStudentListViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEnrollmentId, setDetailEnrollmentId] = useState<string | null>(null);

  function handleDetailClick(item: ConfirmedStudentListItem) {
    setDetailEnrollmentId(item.id);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="최종 수강생 관리"
        description="최종 확정된 수강생을 조회하고 관리할 수 있습니다."
      />

      <EnrollmentSubNav />

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <ConfirmedStudentListToolbar
            query={query}
            filterOptions={filterOptions}
          />
          <ConfirmedStudentListTable
            result={result}
            onDetailClick={handleDetailClick}
          />
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={query as ListQuery}
            buildPageHref={(page) => buildConfirmedStudentPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <ConfirmedStudentDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        enrollmentId={detailEnrollmentId}
      />
    </div>
  );
}
