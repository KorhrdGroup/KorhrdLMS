"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { PaymentStatusBadge } from "@/features/enrollments/components/payment-status-badge";
import { getPendingApplicantDetailAction } from "@/features/enrollments/actions/pending-applicant.actions";
import type { PendingApplicantDetail } from "@/features/enrollments/types/pending-applicant.types";
import { formatDate } from "@/lib/shared/format-date";

type PendingApplicantDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string | null;
  onEditClick?: (enrollmentId: string) => void;
};

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function formatBatch(value: string | null) {
  return value?.trim() ? value : "—";
}

function formatPeriod(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

export function PendingApplicantDetailModal({
  open,
  onOpenChange,
  enrollmentId,
  onEditClick,
}: PendingApplicantDetailModalProps) {
  const [detail, setDetail] = useState<PendingApplicantDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();

  useEffect(() => {
    if (!open || !enrollmentId) {
      return;
    }

    startLoad(async () => {
      setDetail(null);
      setErrorMessage(null);

      try {
        const result = await getPendingApplicantDetailAction(enrollmentId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.applicant);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "신청 수강 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, enrollmentId]);

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
      title="신청 수강 정보"
      description="신청 수강생의 상세 정보를 확인할 수 있습니다."
      className="sm:max-w-2xl"
      footer={
        <>
          {enrollmentId && onEditClick ? (
            <AdminButton
              type="button"
              onClick={() => {
                onEditClick(enrollmentId);
                handleOpenChange(false);
              }}
            >
              수정
            </AdminButton>
          ) : null}
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            닫기
          </AdminButton>
        </>
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
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              회원 기본정보
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="이름" value={detail.member.name} />
              <DetailField label="아이디" value={detail.member.loginId} />
              <DetailField label="연락처" value={detail.member.phone ?? "—"} />
              <DetailField label="이메일" value={detail.member.email ?? "—"} />
            </dl>
          </section>

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              신청 수강 정보
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="과정명" value={detail.course.name} />
              <DetailField label="반/기수" value={formatBatch(detail.batch)} />
              <DetailField
                label="신청일"
                value={formatDate(detail.applicationDate ?? detail.createdAt)}
              />
              <DetailField
                label="수강기간"
                value={formatPeriod(detail.startDate, detail.endDate)}
              />
              <DetailField
                label="결제상태"
                value={<PaymentStatusBadge status={detail.paymentStatus} />}
              />
              <DetailField
                label="담당자"
                value={detail.managerName ?? detail.member.managerName ?? "—"}
              />
              <div className="sm:col-span-2">
                <DetailField
                  label="메모"
                  value={detail.memo?.trim() ? detail.memo : "—"}
                />
              </div>
            </dl>
          </section>
        </div>
      ) : null}
    </AdminModal>
  );
}
