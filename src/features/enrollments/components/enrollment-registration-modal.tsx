"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createEnrollmentAction,
  getEnrollmentRegistrationOptionsAction,
} from "@/features/enrollments/actions/enrollment-registration.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
} from "@/features/enrollments/components/enrollment-form-field";
import type {
  EnrollmentRegistrationInput,
  EnrollmentRegistrationOptions,
} from "@/features/enrollments/types/enrollment.types";

const INITIAL_FORM: EnrollmentRegistrationInput = {
  memberId: "",
  courseId: "",
  startDate: "",
  endDate: "",
  status: "confirmed",
};

type EnrollmentRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

export function EnrollmentRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: EnrollmentRegistrationModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<EnrollmentRegistrationInput>(INITIAL_FORM);
  const [options, setOptions] = useState<EnrollmentRegistrationOptions | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof EnrollmentRegistrationInput, string>>
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
        const result = await getEnrollmentRegistrationOptionsAction();
        setOptions(result);
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "수강등록 옵션을 불러오지 못했습니다.",
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

  function updateField<K extends keyof EnrollmentRegistrationInput>(
    key: K,
    value: EnrollmentRegistrationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
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
        const result = await createEnrollmentAction(form);

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
        router.refresh();
        onSuccess?.("수강 정보를 등록했습니다.");
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "수강 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="수강등록"
      description="회원과 과정을 선택하고 수강 기간을 입력하면 확정된 수강으로 바로 등록됩니다."
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
            form="enrollment-registration-form"
            disabled={!canSubmit}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          옵션을 불러오는 중...
        </div>
      ) : options ? (
        <form id="enrollment-registration-form" className="space-y-4" onSubmit={handleSubmit}>
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
              onChange={(event) => updateField("memberId", event.target.value)}
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
                과정관리에서 과정을 등록하면 수강등록에서 선택할 수 있습니다.
              </p>
            ) : null}
          </EnrollmentFormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="시작일"
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
              label="종료일"
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
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "수강등록 옵션을 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
