"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getCertificateDetailAction,
  updateCertificateApplicationAction,
} from "@/features/certificates/actions/certificate.actions";
import { CertificateDeliveryStatusBadge } from "@/features/certificates/components/certificate-delivery-status-badge";
import {
  CERTIFICATE_DELIVERY_STATUS_FILTER_OPTIONS,
  CERTIFICATE_DELIVERY_STATUS_LABELS,
} from "@/features/certificates/constants";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import {
  formatApplicantWithId,
  formatCertificateAmount,
  formatFullAddress,
  formatOptionalText,
  formatPaymentInfo,
  getCertificateKindLabel,
} from "@/features/certificates/lib/certificate.utils";
import type { CertificateDetail } from "@/features/certificates/types/certificate.types";
import {
  EnrollmentFormField,
} from "@/features/enrollments/components/enrollment-form-field";
import { getPaymentMethodLabel } from "@/features/payments/lib/payment-method.utils";
import { formatDate } from "@/lib/shared/format-date";
import type { CertificateDeliveryStatus, PaymentStatus } from "@/types/database.types";

type CertificateDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string | null;
  onUpdated?: (message: string) => void;
};

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs text-[#6B7280]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export function CertificateDetailModal({
  open,
  onOpenChange,
  applicationId,
  onUpdated,
}: CertificateDetailModalProps) {
  const [detail, setDetail] = useState<CertificateDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actualPaymentAmount, setActualPaymentAmount] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<CertificateDeliveryStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  function loadDetail(targetId: string) {
    startLoad(async () => {
      setDetail(null);
      setErrorMessage(null);
      setFormError(null);

      try {
        const result = await getCertificateDetailAction(targetId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.application);
        setActualPaymentAmount(String(result.application.actualPaymentAmount));
        setDeliveryStatus(result.application.deliveryStatus);
        setPaymentStatus(result.application.paymentStatus);
        setPhotoUrl(result.application.photoUrl ?? "");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "신청 내역을 불러오지 못했습니다.",
        );
      }
    });
  }

  useEffect(() => {
    if (!open || !applicationId) {
      return;
    }

    loadDetail(applicationId);
  }, [open, applicationId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setErrorMessage(null);
      setFormError(null);
    }
  }

  function handleSave() {
    if (!applicationId) {
      return;
    }

    const parsedAmount = Number(actualPaymentAmount);

    startSubmit(async () => {
      setFormError(null);

      try {
        const result = await updateCertificateApplicationAction(applicationId, {
          actualPaymentAmount: parsedAmount,
          deliveryStatus,
          paymentStatus,
          photoUrl,
        });

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        loadDetail(applicationId);
        onUpdated?.(result.message);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "신청 내역 수정에 실패했습니다.",
        );
      }
    });
  }

  const paymentMethodLabel = detail?.paymentMethod
    ? getPaymentMethodLabel(detail.paymentMethod)
    : "—";

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="신청내역"
      description="자격증 신청 상세 정보를 조회하고 수정할 수 있습니다."
      className="sm:max-w-2xl"
      footer={
        <div className="flex w-full flex-col gap-2">
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-xs text-[#EF4444]">
              {formError}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <CertificateDeliveryStatusBadge status={deliveryStatus} />
            <div className="flex items-center gap-2">
              <AdminButton
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                닫기
              </AdminButton>
              <AdminButton
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || !detail}
              >
                {isSubmitting ? "저장 중..." : "저장"}
              </AdminButton>
            </div>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : detail ? (
        <div className="space-y-4">
          <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
            <DetailField label="자격증명" value={detail.certificateName} />
            <DetailField
              label="자격증 종류"
              value={getCertificateKindLabel(detail.certificateKind)}
            />
            <DetailField
              label="신청자"
              value={formatApplicantWithId(detail.applicantName, detail.memberLoginId)}
            />
            <DetailField label="생년월일" value={formatDate(detail.birthDate)} />
            <DetailField label="연락처" value={formatOptionalText(detail.phone)} />
            <DetailField label="신청일" value={formatDate(detail.appliedAt)} />
            <DetailField
              label="주소"
              value={formatFullAddress(detail.postalCode, detail.address, detail.addressDetail)}
              className="sm:col-span-2"
            />
            <DetailField
              label="발급비용"
              value={formatCertificateAmount(detail.issuanceCost)}
            />
            <DetailField
              label="결제상태"
              value={<PaymentStatusBadge status={detail.paymentStatus} />}
            />
            <DetailField
              label="결제정보"
              value={formatPaymentInfo(paymentMethodLabel, detail.paymentInfo)}
              className="sm:col-span-2"
            />
            <DetailField
              label="발급일"
              value={detail.issuedAt ? formatDate(detail.issuedAt) : "미발급"}
            />
            <DetailField label="메모" value={formatOptionalText(detail.memo)} className="sm:col-span-2" />
          </dl>

          <section className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
              {photoUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={`${detail.applicantName} 증명사진`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-1 text-center text-[10px] text-[#9CA3AF]">사진 없음</span>
              )}
            </div>
            <p className="text-xs text-[#6B7280]">
              증명사진 URL을 변경한 뒤 하단 저장 버튼을 눌러주세요.
            </p>
          </section>

          <div className="space-y-3 border-t border-[#E5E7EB] pt-3">
            <h4 className="text-xs font-semibold text-[#111827]">관리 정보 수정</h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <EnrollmentFormField label="실결제금액" htmlFor="actualPaymentAmount" required>
                <AdminInput
                  id="actualPaymentAmount"
                  type="number"
                  min={0}
                  variant="outline"
                  value={actualPaymentAmount}
                  onChange={(event) => setActualPaymentAmount(event.target.value)}
                />
              </EnrollmentFormField>

              <EnrollmentFormField label="배송상태" htmlFor="deliveryStatus" required>
                <select
                  id="deliveryStatus"
                  value={deliveryStatus}
                  onChange={(event) =>
                    setDeliveryStatus(event.target.value as CertificateDeliveryStatus)
                  }
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
                >
                  {CERTIFICATE_DELIVERY_STATUS_FILTER_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {CERTIFICATE_DELIVERY_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </EnrollmentFormField>

              <EnrollmentFormField label="결제상태" htmlFor="paymentStatus" required>
                <select
                  id="paymentStatus"
                  value={paymentStatus}
                  onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
                >
                  {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </EnrollmentFormField>

              <EnrollmentFormField label="증명사진 URL" htmlFor="photoUrl">
                <AdminInput
                  id="photoUrl"
                  variant="outline"
                  value={photoUrl}
                  placeholder="/photos/example.jpg"
                  onChange={(event) => setPhotoUrl(event.target.value)}
                />
              </EnrollmentFormField>
            </div>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
