"use client";

import { Eye, Trash2 } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import type { ClassListItem } from "@/features/enrollments/types/class.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ClassListTableProps = {
  result: PaginatedResult<ClassListItem>;
  onDetailClick?: (item: ClassListItem) => void;
  onDeleteClick?: (item: ClassListItem) => void;
};

function formatYear(value: number | null) {
  return value != null ? `${value}` : "—";
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) {
    return "—";
  }

  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }

  return start ? formatDate(start) : formatDate(end!);
}

export function ClassListTable({
  result,
  onDetailClick,
  onDeleteClick,
}: ClassListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 반이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>연도</AdminTableHead>
            <AdminTableHead>과정명</AdminTableHead>
            <AdminTableHead>반명</AdminTableHead>
            <AdminTableHead>담당자</AdminTableHead>
            <AdminTableHead>신청기간</AdminTableHead>
            <AdminTableHead>수강기간</AdminTableHead>
            <AdminTableHead>등록일</AdminTableHead>
            <AdminTableHead className="w-52 text-right">관리</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item) => (
            <AdminTableRow key={item.id}>
              <AdminTableCell className="text-[#6B7280]">
                {formatYear(item.year)}
              </AdminTableCell>
              <AdminTableCell className="font-medium">{item.courseName}</AdminTableCell>
              <AdminTableCell>{item.batchName}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {item.managerName ?? "—"}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatPeriod(item.applicationPeriodStart, item.applicationPeriodEnd)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatPeriod(item.enrollmentPeriodStart, item.enrollmentPeriodEnd)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatDate(item.createdAt)}
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
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
