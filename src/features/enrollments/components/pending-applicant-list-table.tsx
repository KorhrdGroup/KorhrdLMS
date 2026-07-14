"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import type { PendingApplicantListItem } from "@/features/enrollments/types/pending-applicant.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type PendingApplicantListTableProps = {
  result: PaginatedResult<PendingApplicantListItem>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDetailClick?: (item: PendingApplicantListItem) => void;
  onEditClick?: (item: PendingApplicantListItem) => void;
  onDeleteClick?: (item: PendingApplicantListItem) => void;
};

function formatYear(value: number | null) {
  return value != null ? `${value}` : "—";
}

function formatBatch(value: string | null) {
  return value?.trim() ? value : "—";
}

function formatPeriod(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

export function PendingApplicantListTable({
  result,
  selectedIds,
  onSelectionChange,
  onDetailClick,
  onEditClick,
  onDeleteClick,
}: PendingApplicantListTableProps) {
  const pageIds = useMemo(
    () => result.data.map((item) => item.id),
    [result.data],
  );

  const isAllSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  function updateSelection(next: string[]) {
    onSelectionChange(next);
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      updateSelection(Array.from(new Set([...selectedIds, ...pageIds])));
      return;
    }

    updateSelection(selectedIds.filter((id) => !pageIds.includes(id)));
  }

  function toggleOne(id: string, checked: boolean) {
    if (checked) {
      updateSelection(Array.from(new Set([...selectedIds, id])));
      return;
    }

    updateSelection(selectedIds.filter((selectedId) => selectedId !== id));
  }

  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        신청 수강생이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16">No</AdminTableHead>
            <AdminTableHead className="w-12">
              <AdminCheckbox
                checked={isAllSelected}
                onChange={(event) => toggleAll(event.target.checked)}
                aria-label="현재 페이지 전체 선택"
              />
            </AdminTableHead>
            <AdminTableHead>연도</AdminTableHead>
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>반/기수</AdminTableHead>
            <AdminTableHead>수강생명</AdminTableHead>
            <AdminTableHead>아이디</AdminTableHead>
            <AdminTableHead>연락처</AdminTableHead>
            <AdminTableHead>담당자</AdminTableHead>
            <AdminTableHead>신청일</AdminTableHead>
            <AdminTableHead>수강기간</AdminTableHead>
            <AdminTableHead>결제상태</AdminTableHead>
            <AdminTableHead>등록일</AdminTableHead>
            <AdminTableHead className="w-52 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber =
              result.total - (result.page - 1) * result.pageSize - index;

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="text-[#6B7280]">{rowNumber}</AdminTableCell>
                <AdminTableCell>
                  <AdminCheckbox
                    checked={selectedIds.includes(item.id)}
                    onChange={(event) => toggleOne(item.id, event.target.checked)}
                    aria-label={`${item.member.name} 선택`}
                  />
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatYear(item.year)}
                </AdminTableCell>
                <AdminTableCell className="font-medium">{item.course.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatBatch(item.batch)}
                </AdminTableCell>
                <AdminTableCell className="font-medium">{item.member.name}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {item.member.login_id}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {item.member.phone ?? "—"}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {item.manager_name ?? item.member.manager_name ?? "—"}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(item.application_date ?? item.created_at)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatPeriod(item.start_date, item.end_date)}
                </AdminTableCell>
                <AdminTableCell>
                  <PaymentStatusBadge status={item.payment_status} />
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatDate(item.created_at)}
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <AdminButton
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onDetailClick?.(item)}
                    >
                      <Eye className="size-4" />
                      상세보기
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onEditClick?.(item)}
                    >
                      <Pencil className="size-4" />
                      수정
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteClick?.(item)}
                    >
                      <Trash2 className="size-4" />
                      삭제
                    </AdminButton>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            );
          })}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
