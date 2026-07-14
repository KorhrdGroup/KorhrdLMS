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
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import type { ConfirmedStudentListItem } from "@/features/enrollments/types/confirmed-student.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ConfirmedStudentListTableProps = {
  result: PaginatedResult<ConfirmedStudentListItem>;
  onDetailClick?: (item: ConfirmedStudentListItem) => void;
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

export function ConfirmedStudentListTable({
  result,
  onDetailClick,
}: ConfirmedStudentListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        최종 수강생이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16">No</AdminTableHead>
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
            <AdminTableHead className="w-28 text-right">상세보기</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber =
              result.total - (result.page - 1) * result.pageSize - index;

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="text-[#6B7280]">{rowNumber}</AdminTableCell>
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
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDetailClick?.(item)}
                  >
                    <Eye className="size-4" />
                    상세보기
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
