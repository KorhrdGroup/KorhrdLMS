"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { getSubjectPaymentDetailAction } from "@/features/payments/actions/subject-payment.actions";
import { CoursePaymentStatusBadge } from "@/features/payments/components/course-payment-status-badge";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import {
  formatClassPeriod,
  formatOptionalText,
  formatPaymentAmount,
} from "@/features/payments/lib/subject-payment.utils";
import type { SubjectPaymentDetail } from "@/features/payments/types/subject-payment.types";
import { formatDate, formatDateTime } from "@/lib/shared/format-date";

type SubjectPaymentDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string | null;
};

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export function SubjectPaymentDetailModal({
  open,
  onOpenChange,
  paymentId,
}: SubjectPaymentDetailModalProps) {
  const [detail, setDetail] = useState<SubjectPaymentDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    if (!open || !paymentId) {
      return;
    }

    startLoad(async () => {
      setDetail(null);
      setErrorMessage(null);

      try {
        const result = await getSubjectPaymentDetailAction(paymentId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.payment);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "결제 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, paymentId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setErrorMessage(null);
    }
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="결제 상세조회"
      description="결제 정보를 조회할 수 있습니다."
      className="sm:max-w-3xl"
      footer={
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
        >
          닫기
        </AdminButton>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : detail ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailField
            label="결제상태"
            value={<CoursePaymentStatusBadge status={detail.status} />}
          />
          <DetailField label="아이디" value={detail.memberLoginId} />
          <DetailField label="성명" value={detail.memberName} />
          <DetailField label="결제번호" value={detail.paymentNumber} />
          <DetailField label="상품명" value={detail.productName} />
          <DetailField label="결제일" value={formatDate(detail.paymentDate)} />
          <DetailField
            label="결제방법"
            value={getPaymentMethodLabel(detail.paymentMethod)}
          />
          <DetailField label="결제금액" value={formatPaymentAmount(detail.amount)} />
          <DetailField label="입금은행" value={formatOptionalText(detail.depositBank)} />
          <DetailField label="입금자명" value={formatOptionalText(detail.depositorName)} />
          <DetailField
            label="가상계좌번호"
            value={formatOptionalText(detail.virtualAccountNumber)}
          />
          <DetailField
            label="수업기간"
            value={formatClassPeriod(detail.classPeriodStart, detail.classPeriodEnd)}
          />
          <DetailField
            label="배송주소"
            value={formatOptionalText(detail.shippingAddress)}
            className="sm:col-span-2"
          />
          <DetailField label="연락처" value={formatOptionalText(detail.memberPhone)} />
          <DetailField
            label="승인일"
            value={detail.approvedAt ? formatDateTime(detail.approvedAt) : "—"}
          />
          <DetailField
            label="취소일"
            value={detail.canceledAt ? formatDateTime(detail.canceledAt) : "—"}
          />
          <DetailField
            label="PG사"
            value={formatOptionalText(detail.pgProvider)}
          />
          <DetailField
            label="PG 주문번호"
            value={formatOptionalText(detail.pgOrderId)}
          />
          <DetailField
            label="PG 승인 트랜잭션ID"
            value={formatOptionalText(detail.pgTransactionId)}
          />
          <DetailField
            label="실패사유"
            value={formatOptionalText(detail.failedReason)}
          />
          <DetailField
            label="메모"
            value={formatOptionalText(detail.memo)}
            className="sm:col-span-2"
          />
        </dl>
      ) : null}
    </AdminModal>
  );
}
