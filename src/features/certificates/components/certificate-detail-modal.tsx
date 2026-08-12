"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getCertificateDetailAction,
  updateCertificateApplicationAction,
} from "@/features/certificates/actions/certificate.actions";
import { uploadCertificatePhotoFile } from "@/features/certificate-applications/lib/certificate-photo-upload.client";
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
  const [isLoading, startLoad] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  // 증명사진 크게 보기 팝업(라이트박스) — 새 탭 대신 화면 위에 띄웁니다.
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /** 어드민이 직접 증명사진을 올리거나 교체합니다 — 업로드 후 바로 저장됩니다. */
  async function handlePhotoUpload(file: File | null) {
    if (!file || !applicationId) return;
    setFormError(null);
    setIsUploading(true);
    try {
      const photoUrl = await uploadCertificatePhotoFile(file);
      const result = await updateCertificateApplicationAction(applicationId, { photoUrl });
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      loadDetail(applicationId);
      onUpdated?.("증명사진을 저장했습니다.");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "증명사진 업로드에 실패했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }
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
      setIsPhotoOpen(false);
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
            {/* PayApp으로 결제된 건만 값이 있습니다. 무통장입금 등 수기 확인 건은 "—". */}
            <DetailField
              label="결제일시"
              value={detail.paidAt ? formatDate(detail.paidAt) : "—"}
            />
            <DetailField
              label="PayApp 결제번호"
              value={detail.payappMulNo ?? "—"}
            />
            <DetailField
              label="발급일"
              value={detail.issuedAt ? formatDate(detail.issuedAt) : "미발급"}
            />
            <DetailField label="메모" value={formatOptionalText(detail.memo)} className="sm:col-span-2" />
          </dl>

          <section className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            {/* 미리보기 — 클릭하면 팝업(라이트박스)으로 크게 봅니다 */}
            {detail.photoUrl ? (
              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                className="flex h-16 w-12 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-white p-0"
                title="크게 보기"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detail.photoUrl}
                  alt={`${detail.applicantName} 증명사진`}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
                <span className="px-1 text-center text-[10px] text-[#9CA3AF]">사진 없음</span>
              </div>
            )}
            <div className="flex flex-1 items-center justify-between gap-2">
              <p className="text-xs text-[#6B7280]">
                {detail.photoUrl
                  ? "학생이 올린 증명사진입니다. 사진을 클릭하면 크게 보입니다."
                  : "증명사진이 없습니다 — 어드민이 직접 올릴 수 있습니다."}
              </p>
              <div className="flex shrink-0 items-center gap-2">
              {/* 어드민 직접 업로드/교체 (JPG·PNG) */}
              <label
                className={`inline-flex h-10 cursor-pointer items-center rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] ${isUploading ? "cursor-wait opacity-60" : ""}`}
              >
                {isUploading ? "업로드 중..." : detail.photoUrl ? "사진 교체" : "사진 올리기"}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(event) => {
                    void handlePhotoUpload(event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
              </label>
              {detail.photoUrl ? (
                <AdminButton
                  type="button"
                  variant="outline"
                  disabled={isDownloading}
                  onClick={async () => {
                    if (!detail.photoUrl) return;
                    setIsDownloading(true);
                    try {
                      // 저장소가 다른 출처라 <a download> 가 무시됩니다 — 받아서 blob 으로 저장합니다.
                      const res = await fetch(detail.photoUrl);
                      if (!res.ok) throw new Error();
                      const blob = await res.blob();
                      const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${detail.applicantName}_증명사진.${ext}`;
                      link.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      window.open(detail.photoUrl, "_blank");
                    } finally {
                      setIsDownloading(false);
                    }
                  }}
                >
                  {isDownloading ? "다운로드 중..." : "다운로드"}
                </AdminButton>
              ) : null}
              </div>
            </div>
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
            </div>
          </div>
        </div>
      ) : null}

      {/* 증명사진 라이트박스 — 배경이나 ✕를 누르면 닫힙니다 */}
      {isPhotoOpen && detail?.photoUrl ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-label="증명사진 크게 보기"
          onClick={() => setIsPhotoOpen(false)}
        >
          <button
            type="button"
            aria-label="닫기"
            className="absolute right-4 top-4 text-2xl leading-none text-white/90 hover:text-white"
            onClick={() => setIsPhotoOpen(false)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={detail.photoUrl}
            alt={`${detail.applicantName} 증명사진`}
            className="max-h-[85vh] max-w-[90vw] rounded-lg bg-white object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </AdminModal>
  );
}
