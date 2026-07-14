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
import { createMaterialAction } from "@/features/learning-materials/actions/material-registration.actions";
import { MaterialFilePicker } from "@/features/learning-materials/components/material-file-picker";
import { COMMON_MATERIAL_OPTION_VALUE } from "@/features/learning-materials/constants";
import type {
  MaterialFilterOptions,
  MaterialRegistrationInput,
} from "@/features/learning-materials/types/material.types";

const INITIAL_FORM: MaterialRegistrationInput = {
  courseId: "",
  title: "",
  description: "",
  file: null,
  fileUrl: "",
  isPublished: false,
};

type MaterialRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: MaterialFilterOptions;
  onSuccess?: (message: string) => void;
};

export function MaterialRegistrationModal({
  open,
  onOpenChange,
  filterOptions,
  onSuccess,
}: MaterialRegistrationModalProps) {
  const [form, setForm] = useState<MaterialRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MaterialRegistrationInput, string>>
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

  function updateField<K extends keyof MaterialRegistrationInput>(
    key: K,
    value: MaterialRegistrationInput[K],
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
        const result = await createMaterialAction(form);

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
          error instanceof Error ? error.message : "자료 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="자료등록"
      description="새 학습자료 정보를 입력하고 저장하세요."
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
            form="material-registration-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="material-registration-form"
        className="max-h-[min(65vh,680px)] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <EnrollmentFormField
          label="제목"
          htmlFor="material-title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="material-title"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="예: 통합 교안 자료"
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="연결 과정 선택"
          htmlFor="material-course"
          required
          error={fieldErrors.courseId}
        >
          <EnrollmentFormSelect
            id="material-course"
            value={form.courseId}
            onChange={(event) => updateField("courseId", event.target.value)}
          >
            <option value="">과정을 선택하세요</option>
            <option value={COMMON_MATERIAL_OPTION_VALUE}>전체 공통 (모든 학생 대상)</option>
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
          label="설명"
          htmlFor="material-description"
          required
          error={fieldErrors.description}
        >
          <EnrollmentFormTextarea
            id="material-description"
            value={form.description}
            placeholder="자료에 대한 설명을 입력하세요"
            onChange={(event) => updateField("description", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="파일 업로드"
          htmlFor="material-file"
          required
          error={fieldErrors.file}
        >
          <MaterialFilePicker
            value={form.file}
            onChange={(file) => updateField("file", file)}
          />
          <p className="text-xs text-[#9CA3AF]">
            실제 업로드/저장은 아직 연결되지 않았습니다 (Mock). 파일명·용량·종류만 저장됩니다.
          </p>
        </EnrollmentFormField>

        <EnrollmentFormField
          label="다운로드 링크 (선택)"
          htmlFor="material-file-url"
          error={fieldErrors.fileUrl}
        >
          <AdminInput
            id="material-file-url"
            variant="outline"
            value={form.fileUrl}
            onChange={(event) => updateField("fileUrl", event.target.value)}
            placeholder="https://... (입력 시 학생 자료실에서 실제 다운로드 링크로 노출됩니다)"
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="공개 여부" htmlFor="material-is-published">
          <label
            htmlFor="material-is-published"
            className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
          >
            <AdminCheckbox
              id="material-is-published"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            공개 상태로 등록 (학생 자료실에 노출)
          </label>
        </EnrollmentFormField>
      </form>
    </AdminModal>
  );
}
