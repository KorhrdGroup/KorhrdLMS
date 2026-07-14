"use client";

import { Eye } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import {
  formatAdminNameWithId,
  getAdminTypeLabel,
} from "@/features/statistics/lib/admin-access.utils";
import type { AdminAccessListItem } from "@/features/statistics/types/admin-access.types";
import { formatDateTime } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type AdminAccessListTableProps = {
  result: PaginatedResult<AdminAccessListItem>;
  onDetailClick?: (item: AdminAccessListItem) => void;
};

export function AdminAccessListTable({
  result,
  onDetailClick,
}: AdminAccessListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        조회된 관리자 접속 목록이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16 text-center">번호</AdminTableHead>
            <AdminTableHead className="w-28">관리자유형</AdminTableHead>
            <AdminTableHead>성명(ID)</AdminTableHead>
            <AdminTableHead className="w-28 text-center">접속횟수</AdminTableHead>
            <AdminTableHead className="w-40">최근 접속시각</AdminTableHead>
            <AdminTableHead className="w-24 text-center">상세보기</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber =
              result.total - ((result.page - 1) * result.pageSize + index);

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {rowNumber}
                </AdminTableCell>
                <AdminTableCell className="text-[#374151]">
                  {getAdminTypeLabel(item.adminType)}
                </AdminTableCell>
                <AdminTableCell className="font-medium">
                  {formatAdminNameWithId(item.name, item.loginId)}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {item.accessCount}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {item.lastAccessAt ? formatDateTime(item.lastAccessAt) : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDetailClick?.(item)}
                  >
                    <Eye className="size-4" />
                    보기
                  </AdminButton>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
