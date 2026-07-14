"use client";

import { Pencil, Trash2 } from "lucide-react";

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
import { formatCertificateAmount, formatOptionalText } from "@/features/certificates/lib/certificate.utils";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import type { CertificatePrepaymentListItem } from "@/features/certificate-prepayments/types/certificate-prepayment.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificatePrepaymentListTableProps = {
  result: PaginatedResult<CertificatePrepaymentListItem>;
  onEditClick?: (item: CertificatePrepaymentListItem) => void;
  onDeleteClick?: (item: CertificatePrepaymentListItem) => void;
};

function UsageCell({ item }: { item: CertificatePrepaymentListItem }) {
  if (!item.usedAt) {
    return <span className="text-xs text-[#6B7280]">미사용</span>;
  }

  return (
    <span className="inline-flex rounded-md bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#2563EB]">
      사용완료
    </span>
  );
}

function LinkedApplicationCell({ item }: { item: CertificatePrepaymentListItem }) {
  if (!item.linkedApplication) {
    return <span className="text-xs text-[#9CA3AF]">—</span>;
  }

  return (
    <span className="text-xs text-[#374151]">
      {item.linkedApplication.certificateName}
      <br />
      <span className="text-[#9CA3AF]">{formatDate(item.linkedApplication.appliedAt)} 신청</span>
    </span>
  );
}

export function CertificatePrepaymentListTable({
  result,
  onEditClick,
  onDeleteClick,
}: CertificatePrepaymentListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 선납결제 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16 text-center">번호</AdminTableHead>
            <AdminTableHead>학생명</AdminTableHead>
            <AdminTableHead className="w-28">아이디</AdminTableHead>
            <AdminTableHead className="w-32">연락처</AdminTableHead>
            <AdminTableHead>선납 과정/자격증명</AdminTableHead>
            <AdminTableHead className="w-28 text-right">선납금액</AdminTableHead>
            <AdminTableHead className="w-24 text-center">결제방법</AdminTableHead>
            <AdminTableHead className="w-24 text-center">결제상태</AdminTableHead>
            <AdminTableHead className="w-28 text-center">선납일</AdminTableHead>
            <AdminTableHead className="w-20 text-center">사용여부</AdminTableHead>
            <AdminTableHead className="min-w-[180px]">연결된 발급신청</AdminTableHead>
            <AdminTableHead className="min-w-[140px]">메모</AdminTableHead>
            <AdminTableHead className="w-24 text-center">수정</AdminTableHead>
            <AdminTableHead className="w-24 text-center">삭제</AdminTableHead>
          </AdminTableRow>
        </AdminTableHeader>
        <AdminTableBody>
          {result.data.map((item, index) => {
            const rowNumber = result.total - ((result.page - 1) * result.pageSize + index);

            return (
              <AdminTableRow key={item.id}>
                <AdminTableCell className="text-center text-[#6B7280]">{rowNumber}</AdminTableCell>
                <AdminTableCell className="font-medium">{item.memberName}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">{item.memberLoginId}</AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatOptionalText(item.memberPhone)}
                </AdminTableCell>
                <AdminTableCell>
                  {item.certificateName}
                  {item.courseName ? (
                    <span className="ml-1 text-xs text-[#9CA3AF]">({item.courseName})</span>
                  ) : null}
                </AdminTableCell>
                <AdminTableCell className="text-right font-medium">
                  {formatCertificateAmount(item.amount)}
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {item.paymentMethod ? getPaymentMethodLabel(item.paymentMethod) : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <PaymentStatusBadge status={item.paymentStatus} />
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {item.paidAt ? formatDate(item.paidAt) : "—"}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <UsageCell item={item} />
                </AdminTableCell>
                <AdminTableCell>
                  <LinkedApplicationCell item={item} />
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatOptionalText(item.memo)}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={Boolean(item.usedAt)}
                    onClick={() => onEditClick?.(item)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </AdminButton>
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={Boolean(item.usedAt)}
                    onClick={() => onDeleteClick?.(item)}
                  >
                    <Trash2 className="size-4" />
                    삭제
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
