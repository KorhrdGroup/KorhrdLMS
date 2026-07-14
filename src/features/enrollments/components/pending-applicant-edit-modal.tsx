"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { updatePendingApplicantAction } from "@/features/enrollments/actions/pending-applicant-edit.actions";
import { getPendingApplicantDetailAction } from "@/features/enrollments/actions/pending-applicant.actions";
import { getPendingApplicantRegistrationOptionsAction } from "@/features/enrollments/actions/pending-applicant-registration.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import type { PendingApplicantDetail } from "@/features/enrollments/types/pending-applicant.types";
import type { PendingApplicantEditInput } from "@/features/enrollments/types/pending-applicant-edit.types";
import type { PendingApplicantRegistrationCourseOption } from "@/features/enrollments/types/pending-applicant-registration.types";
import { formatDate } from "@/lib/shared/format-date";
import type { PaymentStatus } from "@/types/database.types";

type PendingApplicantEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string | null;
  onSuccess?: (message: string) => void;
};

type ReadOnlyFieldProps = {
  label: string;
  value: React.ReactNode;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function createFormFromDetail(detail: PendingApplicantDetail): PendingApplicantEditInput {
  return {
    courseId: detail.course.id,
    batch: detail.batch ?? "",
    managerName: detail.managerName ?? "",
    paymentStatus: detail.paymentStatus,
    memo: detail.memo ?? "",
  };
}

function formatPeriod(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

export function PendingApplicantEditModal({
  open,
  onOpenChange,
  enrollmentId,
  onSuccess,
}: PendingApplicantEditModalProps) {
  const [detail, setDetail] = useState<PendingApplicantDetail | null>(null);
  const [courses, setCourses] = useState<PendingApplicantRegistrationCourseOption[]>([]);
  const [form, setForm] = useState<PendingApplicantEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PendingApplicantEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !enrollmentId) {
      return;
    }

    startLoad(async () => {
      setDetail(null);
      setCourses([]);
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const [detailResult, optionsResult] = await Promise.all([
          getPendingApplicantDetailAction(enrollmentId),
          getPendingApplicantRegistrationOptionsAction(),
        ]);

        if (!detailResult.success) {
          setFormError(detailResult.message);
          return;
        }

        setDetail(detailResult.applicant);
        setCourses(optionsResult.courses);
        setForm(createFormFromDetail(detailResult.applicant));
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "신청 수강 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, enrollmentId]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setCourses([]);
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof PendingApplicantEditInput>(
    key: K,
    value: PendingApplicantEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  const hasCourses = courses.length > 0;
  const canSubmit = !!form && !!detail && hasCourses && !isSubmitting && !isLoading;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form || !enrollmentId) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updatePendingApplicantAction(enrollmentId, form);

        if (!result.success) {
          if (result.field) {
            setFieldErrors((current) => ({
              ...current,
              [result.field!]: result.message,
            }));
          }
          setFormError(result.message);
          return;
        }

        handleOpenChange(false);
        onSuccess?.(result.message);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "신청 수강 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="신청 수강 수정"
      description="신청 수강 정보를 수정할 수 있습니다. 신청일은 변경되지 않습니다."
      className="sm:max-w-lg"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            취소
          </AdminButton>
          <AdminButton
            type="submit"
            form="pending-applicant-edit-form"
            disabled={!canSubmit}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : formError && !form ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError}
        </div>
      ) : detail && form ? (
        <form id="pending-applicant-edit-form" className="space-y-6" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              회원 기본정보
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="이름" value={detail.member.name} />
              <ReadOnlyField label="아이디" value={detail.member.loginId} />
              <ReadOnlyField label="신청일" value={formatDate(detail.applicationDate ?? detail.createdAt)} />
              <ReadOnlyField
                label="수강기간"
                value={formatPeriod(detail.startDate, detail.endDate)}
              />
            </dl>
          </section>

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              수정 정보
            </h3>

            <EnrollmentFormField
              label="과정"
              htmlFor="courseId"
              required
              error={fieldErrors.courseId}
            >
              <EnrollmentFormSelect
                id="courseId"
                value={form.courseId}
                disabled={!hasCourses}
                onChange={(event) => updateField("courseId", event.target.value)}
              >
                <option value="">
                  {hasCourses ? "과정 선택" : "등록된 과정 없음"}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </EnrollmentFormSelect>
            </EnrollmentFormField>

            <EnrollmentFormField
              label="반/기수"
              htmlFor="batch"
              error={fieldErrors.batch}
            >
              <AdminInput
                id="batch"
                variant="outline"
                value={form.batch}
                placeholder="예: 1기, A반"
                onChange={(event) => updateField("batch", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="담당자"
              htmlFor="managerName"
              error={fieldErrors.managerName}
            >
              <AdminInput
                id="managerName"
                variant="outline"
                value={form.managerName}
                placeholder="담당자명"
                onChange={(event) => updateField("managerName", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="결제상태"
              htmlFor="paymentStatus"
              required
              error={fieldErrors.paymentStatus}
            >
              <EnrollmentFormSelect
                id="paymentStatus"
                value={form.paymentStatus}
                onChange={(event) =>
                  updateField("paymentStatus", event.target.value as PaymentStatus)
                }
              >
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </EnrollmentFormSelect>
            </EnrollmentFormField>

            <EnrollmentFormField label="메모" htmlFor="memo" error={fieldErrors.memo}>
              <EnrollmentFormTextarea
                id="memo"
                value={form.memo}
                placeholder="메모를 입력하세요"
                onChange={(event) => updateField("memo", event.target.value)}
              />
            </EnrollmentFormField>
          </section>
        </form>
      ) : null}
    </AdminModal>
  );
}
