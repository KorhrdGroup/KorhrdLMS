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
import { CoursePaymentStatusBadge } from "@/features/payments/components/course-payment-status-badge";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import {
  formatCouponApplied,
  formatMemberNameWithId,
  formatOptionalText,
  formatPaymentAmount,
} from "@/features/payments/lib/subject-payment.utils";
import type { SubjectPaymentListItem } from "@/features/payments/types/subject-payment.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type SubjectPaymentListTableProps = {
  result: PaginatedResult<SubjectPaymentListItem>;
  onDetailClick?: (item: SubjectPaymentListItem) => void;
};

export function SubjectPaymentListTable({
  result,
  onDetailClick,
}: SubjectPaymentListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        조회된 결제 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead>결제일</AdminTableHead>
            <AdminTableHead>성명(ID)</AdminTableHead>
            <AdminTableHead>쿠폰번호</AdminTableHead>
            <AdminTableHead>신청과목</AdminTableHead>
            <AdminTableHead>PG 주문번호</AdminTableHead>
            <AdminTableHead>할당강사</AdminTableHead>
            <AdminTableHead className="text-right">결제금액</AdminTableHead>
            <AdminTableHead>결제방법</AdminTableHead>
            <AdminTableHead className="text-center">쿠폰적용</AdminTableHead>
            <AdminTableHead className="text-center">상태</AdminTableHead>
            <AdminTableHead className="w-24 text-center">상세보기</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item) => (
            <AdminTableRow key={item.id}>
              <AdminTableCell className="text-[#6B7280]">
                {formatDate(item.paymentDate)}
              </AdminTableCell>
              <AdminTableCell className="font-medium">
                {formatMemberNameWithId(item.memberName, item.memberLoginId)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatOptionalText(item.couponNumber)}
              </AdminTableCell>
              <AdminTableCell>{item.courseName}</AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatOptionalText(item.pgOrderId)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {formatOptionalText(item.assignedInstructor)}
              </AdminTableCell>
              <AdminTableCell className="text-right font-medium">
                {formatPaymentAmount(item.amount)}
              </AdminTableCell>
              <AdminTableCell className="text-[#6B7280]">
                {getPaymentMethodLabel(item.paymentMethod)}
              </AdminTableCell>
              <AdminTableCell className="text-center text-[#6B7280]">
                {formatCouponApplied(item.couponApplied)}
              </AdminTableCell>
              <AdminTableCell className="text-center">
                <CoursePaymentStatusBadge status={item.status} />
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
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
