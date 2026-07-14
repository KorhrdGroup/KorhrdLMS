"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
} from "@/features/enrollments/components/enrollment-form-field";
import { createExamAction } from "@/features/exam-management/actions/exam-registration.actions";
import { EXAM_ELIGIBILITY_NOTICE } from "@/features/exam-management/constants";
import type {
  ExamFilterOptions,
  ExamRegistrationInput,
} from "@/features/exam-management/types/exam.types";

const INITIAL_FORM: ExamRegistrationInput = {
  courseId: "",
  title: "",
  durationMinutes: "30",
  passScore: "60",
  isPublished: false,
};

type ExamRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: ExamFilterOptions;
  onSuccess?: (message: string) => void;
};

export function ExamRegistrationModal({
  open,
  onOpenChange,
  filterOptions,
  onSuccess,
}: ExamRegistrationModalProps) {
  const [form, setForm] = useState<ExamRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ExamRegistrationInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  function resetForm() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setFormError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function updateField<K extends keyof ExamRegistrationInput>(
    key: K,
    value: ExamRegistrationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await createExamAction(form);

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
          error instanceof Error ? error.message : "시험 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="시험등록"
      description="새 시험 정보를 입력하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-xl"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
          <AdminButton type="submit" form="exam-registration-form" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="exam-registration-form"
        className="max-h-[min(65vh,680px)] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <EnrollmentFormField
          label="시험명"
          htmlFor="exam-title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="exam-title"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="예: 간병사 중간고사"
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="연결 과정 선택"
          htmlFor="exam-course"
          required
          error={fieldErrors.courseId}
        >
          <EnrollmentFormSelect
            id="exam-course"
            value={form.courseId}
            onChange={(event) => updateField("courseId", event.target.value)}
          >
            <option value="">과정을 선택하세요</option>
            {filterOptions.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </EnrollmentFormSelect>
          {filterOptions.courses.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">
              등록된 과정이 없습니다. 과정관리에서 먼저 과정을 등록해주세요.
            </p>
          ) : null}
        </EnrollmentFormField>

        <p className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#2563EB]">
          {EXAM_ELIGIBILITY_NOTICE}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <EnrollmentFormField
            label="제한시간(분)"
            htmlFor="exam-duration"
            required
            error={fieldErrors.durationMinutes}
          >
            <AdminInput
              id="exam-duration"
              type="number"
              min={1}
              variant="outline"
              value={form.durationMinutes}
              onChange={(event) => updateField("durationMinutes", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="합격점수"
            htmlFor="exam-pass-score"
            required
            error={fieldErrors.passScore}
          >
            <AdminInput
              id="exam-pass-score"
              type="number"
              min={0}
              max={100}
              variant="outline"
              value={form.passScore}
              onChange={(event) => updateField("passScore", event.target.value)}
            />
          </EnrollmentFormField>
        </div>

        <EnrollmentFormField label="공개 여부" htmlFor="exam-is-published">
          <label
            htmlFor="exam-is-published"
            className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
          >
            <AdminCheckbox
              id="exam-is-published"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            공개 상태로 등록 (학생 응시 가능)
          </label>
        </EnrollmentFormField>
      </form>
    </AdminModal>
  );
}
