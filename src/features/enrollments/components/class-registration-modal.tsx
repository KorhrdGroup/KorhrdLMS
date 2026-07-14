"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createClassRegistrationAction,
  getClassRegistrationOptionsAction,
} from "@/features/enrollments/actions/class-registration.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
} from "@/features/enrollments/components/enrollment-form-field";
import type {
  ClassRegistrationInput,
  ClassRegistrationOptions,
} from "@/features/enrollments/types/class-registration.types";

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_FORM: ClassRegistrationInput = {
  courseId: "",
  year: String(CURRENT_YEAR),
  batchName: "",
  managerName: "",
  applicationStart: "",
  applicationEnd: "",
  enrollmentStart: "",
  enrollmentEnd: "",
};

type ClassRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

export function ClassRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: ClassRegistrationModalProps) {
  const [form, setForm] = useState<ClassRegistrationInput>(INITIAL_FORM);
  const [options, setOptions] = useState<ClassRegistrationOptions | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ClassRegistrationInput, string>>
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
      setForm({ ...INITIAL_FORM, year: String(CURRENT_YEAR) });
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getClassRegistrationOptionsAction();
        setOptions(result);
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "반 등록 옵션을 불러오지 못했습니다.",
        );
      }
    });
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm({ ...INITIAL_FORM, year: String(CURRENT_YEAR) });
      setOptions(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof ClassRegistrationInput>(
    key: K,
    value: ClassRegistrationInput[K],
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
        const result = await createClassRegistrationAction(form);

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
          error instanceof Error ? error.message : "반 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="반 등록"
      description="수강반 정보를 입력하고 저장하세요."
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
            form="class-registration-form"
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
          id="class-registration-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

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
                과정관리에서 과정을 등록하면 반 등록에서 선택할 수 있습니다.
              </p>
            ) : null}
          </EnrollmentFormField>

          <EnrollmentFormField
            label="연도"
            htmlFor="year"
            required
            error={fieldErrors.year}
          >
            <AdminInput
              id="year"
              type="number"
              variant="outline"
              min={1900}
              max={9999}
              value={form.year}
              placeholder="예: 2026"
              onChange={(event) => updateField("year", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="반명"
            htmlFor="batchName"
            error={fieldErrors.batchName}
          >
            <AdminInput
              id="batchName"
              variant="outline"
              value={form.batchName}
              placeholder="예: 1반"
              onChange={(event) => updateField("batchName", event.target.value)}
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

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-[#374151]">신청기간</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <EnrollmentFormField
                label="시작"
                htmlFor="applicationStart"
                error={fieldErrors.applicationStart}
              >
                <AdminInput
                  id="applicationStart"
                  type="date"
                  variant="outline"
                  value={form.applicationStart}
                  onChange={(event) =>
                    updateField("applicationStart", event.target.value)
                  }
                />
              </EnrollmentFormField>

              <EnrollmentFormField
                label="종료"
                htmlFor="applicationEnd"
                error={fieldErrors.applicationEnd}
              >
                <AdminInput
                  id="applicationEnd"
                  type="date"
                  variant="outline"
                  value={form.applicationEnd}
                  onChange={(event) =>
                    updateField("applicationEnd", event.target.value)
                  }
                />
              </EnrollmentFormField>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-[#374151]">
              수강기간<span className="text-[#EF4444]"> *</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <EnrollmentFormField
                label="시작"
                htmlFor="enrollmentStart"
                required
                error={fieldErrors.enrollmentStart}
              >
                <AdminInput
                  id="enrollmentStart"
                  type="date"
                  variant="outline"
                  value={form.enrollmentStart}
                  onChange={(event) =>
                    updateField("enrollmentStart", event.target.value)
                  }
                />
              </EnrollmentFormField>

              <EnrollmentFormField
                label="종료"
                htmlFor="enrollmentEnd"
                required
                error={fieldErrors.enrollmentEnd}
              >
                <AdminInput
                  id="enrollmentEnd"
                  type="date"
                  variant="outline"
                  value={form.enrollmentEnd}
                  onChange={(event) =>
                    updateField("enrollmentEnd", event.target.value)
                  }
                />
              </EnrollmentFormField>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "반 등록 옵션을 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
