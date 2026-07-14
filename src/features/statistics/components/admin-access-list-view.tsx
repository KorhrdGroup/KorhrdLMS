"use client";

import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { AdminAccessDetailModal } from "@/features/statistics/components/admin-access-detail-modal";
import { AdminAccessListTable } from "@/features/statistics/components/admin-access-list-table";
import { AdminAccessListToolbar } from "@/features/statistics/components/admin-access-list-toolbar";
import { StatisticsSubNav } from "@/features/statistics/components/statistics-sub-nav";
import { buildAdminAccessPageHref } from "@/features/statistics/lib/admin-access-list-query";
import type {
  AdminAccessListItem,
  AdminAccessListQuery,
} from "@/features/statistics/types/admin-access.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type AdminAccessListViewProps = {
  result: PaginatedResult<AdminAccessListItem>;
  query: AdminAccessListQuery;
};

export function AdminAccessListView({ result, query }: AdminAccessListViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccessListItem | null>(null);

  function handleDetailClick(item: AdminAccessListItem) {
    setSelectedAdmin(item);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="통계/정보관리"
        description="관리자 접속 목록을 조회하고 접속 기록을 확인할 수 있습니다."
      />

      <StatisticsSubNav />

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <AdminAccessListToolbar query={query} />
          <AdminAccessListTable result={result} onDetailClick={handleDetailClick} />
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
              search: query.adminName,
              field: "all",
            }}
            buildPageHref={(page) => buildAdminAccessPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <AdminAccessDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        adminUser={selectedAdmin}
        query={query}
      />
    </div>
  );
}
