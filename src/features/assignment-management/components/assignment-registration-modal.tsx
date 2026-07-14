"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { createAssignmentAction } from "@/features/assignment-management/actions/assignment-registration.actions";
import { DEFAULT_MAX_UPLOAD_SIZE_MB } from "@/features/assignment-management/constants";
import type {
  AssignmentFilterOptions,
  AssignmentRegistrationInput,
} from "@/features/assignment-management/types/assignment.types";

const INITIAL_FORM: AssignmentRegistrationInput = {
  courseId: "",
  title: "",
  description: "",
  submissionStart: "",
  submissionEnd: "",
  allowAttachment: true,
  maxUploadSizeMb: String(DEFAULT_MAX_UPLOAD_SIZE_MB),
  isPublished: false,
};

type AssignmentRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: AssignmentFilterOptions;
  onSuccess?: (message: string) => void;
};

export function AssignmentRegistrationModal({
  open,
  onOpenChange,
  filterOptions,
  onSuccess,
}: AssignmentRegistrationModalProps) {
  const [form, setForm] = useState<AssignmentRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AssignmentRegistrationInput, string>>
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

  function updateField<K extends keyof AssignmentRegistrationInput>(
    key: K,
    value: AssignmentRegistrationInput[K],
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
        const result = await createAssignmentAction(form);

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
          error instanceof Error ? error.message : "과제 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="과제등록"
      description="새 과제 정보를 입력하고 저장하세요."
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
          <AdminButton
            type="submit"
            form="assignment-registration-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="assignment-registration-form"
        className="max-h-[min(65vh,680px)] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <EnrollmentFormField
          label="과제명"
          htmlFor="assignment-title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="assignment-title"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="예: 1차 과제 - 학습 계획서"
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="연결 과정 선택"
          htmlFor="assignment-course"
          required
          error={fieldErrors.courseId}
        >
          <EnrollmentFormSelect
            id="assignment-course"
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

        <EnrollmentFormField
          label="과제 설명"
          htmlFor="assignment-description"
          required
          error={fieldErrors.description}
        >
          <EnrollmentFormTextarea
            id="assignment-description"
            value={form.description}
            placeholder="과제 내용과 제출 방법을 입력하세요 (Rich Text 에디터는 추후 지원 예정)"
            onChange={(event) => updateField("description", event.target.value)}
          />
        </EnrollmentFormField>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-[#374151]">
            제출기간<span className="text-[#EF4444]"> *</span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="제출 시작일"
              htmlFor="assignment-start"
              required
              error={fieldErrors.submissionStart}
            >
              <AdminInput
                id="assignment-start"
                type="date"
                variant="outline"
                value={form.submissionStart}
                onChange={(event) => updateField("submissionStart", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="제출 종료일"
              htmlFor="assignment-end"
              required
              error={fieldErrors.submissionEnd}
            >
              <AdminInput
                id="assignment-end"
                type="date"
                variant="outline"
                value={form.submissionEnd}
                onChange={(event) => updateField("submissionEnd", event.target.value)}
              />
            </EnrollmentFormField>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <EnrollmentFormField label="첨부파일 허용 여부" htmlFor="assignment-allow-attachment">
            <label
              htmlFor="assignment-allow-attachment"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="assignment-allow-attachment"
                checked={form.allowAttachment}
                onChange={(event) => updateField("allowAttachment", event.target.checked)}
              />
              첨부파일 제출 허용
            </label>
          </EnrollmentFormField>

          <EnrollmentFormField
            label="최대 업로드 용량(MB)"
            htmlFor="assignment-max-upload"
            required={form.allowAttachment}
            error={fieldErrors.maxUploadSizeMb}
          >
            <AdminInput
              id="assignment-max-upload"
              type="number"
              min={1}
              variant="outline"
              disabled={!form.allowAttachment}
              value={form.maxUploadSizeMb}
              onChange={(event) => updateField("maxUploadSizeMb", event.target.value)}
            />
          </EnrollmentFormField>
        </div>

        <EnrollmentFormField label="공개 여부" htmlFor="assignment-is-published">
          <label
            htmlFor="assignment-is-published"
            className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
          >
            <AdminCheckbox
              id="assignment-is-published"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            공개 상태로 등록 (학생 제출 가능)
          </label>
        </EnrollmentFormField>
      </form>
    </AdminModal>
  );
}
