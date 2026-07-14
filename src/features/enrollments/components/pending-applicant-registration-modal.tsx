"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createPendingApplicantRegistrationAction,
  getPendingApplicantRegistrationOptionsAction,
} from "@/features/enrollments/actions/pending-applicant-registration.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import type {
  PendingApplicantRegistrationInput,
  PendingApplicantRegistrationOptions,
} from "@/features/enrollments/types/pending-applicant-registration.types";
import type { PaymentStatus } from "@/types/database.types";

const INITIAL_FORM: PendingApplicantRegistrationInput = {
  memberId: "",
  courseId: "",
  batch: "",
  startDate: "",
  endDate: "",
  paymentStatus: "unpaid",
  managerName: "",
  memo: "",
};

type PendingApplicantRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

export function PendingApplicantRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: PendingApplicantRegistrationModalProps) {
  const [form, setForm] = useState<PendingApplicantRegistrationInput>(INITIAL_FORM);
  const [options, setOptions] =
    useState<PendingApplicantRegistrationOptions | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PendingApplicantRegistrationInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    startLoad(async () => {
      setOptions(null);
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getPendingApplicantRegistrationOptionsAction();
        setOptions(result);
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "신청등록 옵션을 불러오지 못했습니다.",
        );
      }
    });
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(INITIAL_FORM);
      setOptions(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof PendingApplicantRegistrationInput>(
    key: K,
    value: PendingApplicantRegistrationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleMemberChange(memberId: string) {
    const member = options?.members.find((item) => item.id === memberId);
    setForm((current) => ({
      ...current,
      memberId,
      managerName: member?.managerName ?? "",
    }));
    setFieldErrors((current) => ({ ...current, memberId: undefined }));
    setFormError(null);
  }

  const hasCourses = (options?.courses.length ?? 0) > 0;
  const canSubmit = !!options && hasCourses && !isSubmitting && !isLoading;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await createPendingApplicantRegistrationAction(form);

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
          error instanceof Error ? error.message : "신청 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="신청등록"
      description="신청 수강생 정보를 입력하고 저장하세요. 저장 시 신청/대기 상태로 등록됩니다."
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
            form="pending-applicant-registration-form"
            disabled={!canSubmit}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          옵션을 불러오는 중...
        </div>
      ) : options ? (
        <form
          id="pending-applicant-registration-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <EnrollmentFormField
            label="회원"
            htmlFor="memberId"
            required
            error={fieldErrors.memberId}
          >
            <EnrollmentFormSelect
              id="memberId"
              value={form.memberId}
              onChange={(event) => handleMemberChange(event.target.value)}
            >
              <option value="">회원 선택</option>
              {options.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.loginId})
                </option>
              ))}
            </EnrollmentFormSelect>
          </EnrollmentFormField>

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
              {options.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </EnrollmentFormSelect>
            {!hasCourses ? (
              <p className="text-xs text-[#6B7280]">
                과정관리에서 과정을 등록하면 신청등록에서 선택할 수 있습니다.
              </p>
            ) : null}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="수강 시작일"
              htmlFor="startDate"
              required
              error={fieldErrors.startDate}
            >
              <AdminInput
                id="startDate"
                type="date"
                variant="outline"
                value={form.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="수강 종료일"
              htmlFor="endDate"
              required
              error={fieldErrors.endDate}
            >
              <AdminInput
                id="endDate"
                type="date"
                variant="outline"
                value={form.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
              />
            </EnrollmentFormField>
          </div>

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

          <EnrollmentFormField label="메모" htmlFor="memo" error={fieldErrors.memo}>
            <EnrollmentFormTextarea
              id="memo"
              value={form.memo}
              placeholder="메모를 입력하세요"
              onChange={(event) => updateField("memo", event.target.value)}
            />
          </EnrollmentFormField>
        </form>
      ) : (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "신청등록 옵션을 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
