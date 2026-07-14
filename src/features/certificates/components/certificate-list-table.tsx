"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
import { updateCertificateApplicationAction } from "@/features/certificates/actions/certificate.actions";
import {
  formatApplicantWithId,
  formatCertificateAmount,
  formatFullAddress,
  formatOptionalText,
} from "@/features/certificates/lib/certificate.utils";
import type { CertificateListItem } from "@/features/certificates/types/certificate.types";
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import { formatDate } from "@/lib/shared/format-date";
import type { PaginatedResult } from "@/lib/shared/list-query";

type CertificateListTableProps = {
  result: PaginatedResult<CertificateListItem>;
  onDetailClick?: (item: CertificateListItem) => void;
  onDeleteClick?: (item: CertificateListItem) => void;
  onDeliveryError?: (message: string) => void;
};

type DeliveryCheckboxProps = {
  item: CertificateListItem;
  onError?: (message: string) => void;
};

/**
 * 배송여부 체크박스. 기존 LMS처럼 5단계 배송상태(pending/preparing/shipped/delivered/
 * canceled) 중 관리자가 직접 다루는 것은 "배송완료" 여부뿐이므로, 체크 시 delivered로,
 * 체크 해제 시 pending(배송예정)으로 단순화해 저장합니다. 변경은 즉시 Supabase에
 * 반영되고 새로고침 후에도 유지됩니다.
 */
function DeliveryCheckbox({ item, onError }: DeliveryCheckboxProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isDelivered = item.deliveryStatus === "delivered";

  function handleChange(checked: boolean) {
    startTransition(async () => {
      try {
        const result = await updateCertificateApplicationAction(item.id, {
          deliveryStatus: checked ? "delivered" : "pending",
        });

        if (!result.success) {
          onError?.(result.message);
          return;
        }

        router.refresh();
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "배송여부 변경에 실패했습니다.",
        );
      }
    });
  }

  return (
    <label className="inline-flex cursor-pointer items-center justify-center gap-1.5">
      <input
        type="checkbox"
        checked={isDelivered}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.checked)}
        className="size-4 rounded border-[#D1D5DB] accent-[#3B82F6] disabled:opacity-50"
        aria-label={`${item.applicantName} 배송완료 여부`}
      />
      <span className="text-xs text-[#6B7280]">
        {isPending ? "저장 중..." : isDelivered ? "배송완료" : "배송예정"}
      </span>
    </label>
  );
}

function CertificatePhotoCell({ item }: { item: CertificateListItem }) {
  if (!item.photoUrl) {
    return <span className="text-xs text-[#9CA3AF]">사진 없음</span>;
  }

  return (
    <a
      href={item.photoUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-12 w-10 items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F9FAFB]"
      title="사진 크게 보기"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.photoUrl}
        alt={`${item.applicantName} 증명사진`}
        className="h-full w-full object-cover"
      />
    </a>
  );
}

export function CertificateListTable({
  result,
  onDetailClick,
  onDeleteClick,
  onDeliveryError,
}: CertificateListTableProps) {
  if (result.data.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        조회된 자격증 신청 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <AdminTable>
        <AdminTableHeader>
          <AdminTableRow className="hover:bg-transparent">
            <AdminTableHead className="w-16 text-center">번호</AdminTableHead>
            <AdminTableHead>자격증명</AdminTableHead>
            <AdminTableHead>신청자</AdminTableHead>
            <AdminTableHead className="w-32">연락처</AdminTableHead>
            <AdminTableHead className="min-w-[220px]">배송정보</AdminTableHead>
            <AdminTableHead className="w-16 text-center">사진</AdminTableHead>
            <AdminTableHead className="w-28 text-right">발급비용</AdminTableHead>
            <AdminTableHead className="w-28 text-right">실결제금액</AdminTableHead>
            <AdminTableHead className="w-24 text-center">결제상태</AdminTableHead>
            <AdminTableHead className="w-24 text-center">배송여부</AdminTableHead>
            <AdminTableHead className="w-28 text-center">신청일</AdminTableHead>
            <AdminTableHead className="w-24 text-center">신청내역</AdminTableHead>
            <AdminTableHead className="w-24 text-center">삭제</AdminTableHead>
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
                <AdminTableCell className="font-medium">{item.certificateName}</AdminTableCell>
                <AdminTableCell>
                  {formatApplicantWithId(item.applicantName, item.memberLoginId)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatOptionalText(item.phone)}
                </AdminTableCell>
                <AdminTableCell className="text-[#6B7280]">
                  {formatFullAddress(item.postalCode, item.address, item.addressDetail)}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <CertificatePhotoCell item={item} />
                </AdminTableCell>
                <AdminTableCell className="text-right font-medium">
                  {formatCertificateAmount(item.issuanceCost)}
                </AdminTableCell>
                <AdminTableCell className="text-right font-medium">
                  {formatCertificateAmount(item.actualPaymentAmount)}
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <PaymentStatusBadge status={item.paymentStatus} />
                </AdminTableCell>
                <AdminTableCell className="text-center">
                  <DeliveryCheckbox item={item} onError={onDeliveryError} />
                </AdminTableCell>
                <AdminTableCell className="text-center text-[#6B7280]">
                  {formatDate(item.appliedAt)}
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
                <AdminTableCell className="text-center">
                  <AdminButton
                    type="button"
                    variant="destructive"
                    size="sm"
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
