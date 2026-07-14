"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { createLectureAction } from "@/features/lectures/actions/lecture-registration.actions";
import {
  LectureFormField,
  LectureFormSelect,
  LectureFormTextarea,
  LectureThumbnailPicker,
} from "@/features/lectures/components/lecture-form-field";
import type {
  LectureFilterOptions,
  LectureRegistrationInput,
} from "@/features/lectures/types/lecture.types";

const INITIAL_FORM: LectureRegistrationInput = {
  courseId: "",
  title: "",
  description: "",
  thumbnailFileName: "",
  isPublished: false,
};

type LectureRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: LectureFilterOptions;
  onSuccess?: (message: string) => void;
};

export function LectureRegistrationModal({
  open,
  onOpenChange,
  filterOptions,
  onSuccess,
}: LectureRegistrationModalProps) {
  const [form, setForm] = useState<LectureRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LectureRegistrationInput, string>>
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

  function updateField<K extends keyof LectureRegistrationInput>(
    key: K,
    value: LectureRegistrationInput[K],
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
        const result = await createLectureAction(form);

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
          error instanceof Error ? error.message : "강의 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="강의등록"
      description="새 강의 정보를 입력하고 저장하세요."
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
            form="lecture-registration-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="lecture-registration-form"
        className="max-h-[min(60vh,640px)] space-y-4 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <LectureFormField
          label="강의명"
          htmlFor="lecture-title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="lecture-title"
            variant="outline"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="예: 간병사 정규강의"
          />
        </LectureFormField>

        <LectureFormField
          label="연결 과정 선택"
          htmlFor="lecture-course"
          required
          error={fieldErrors.courseId}
          hint={
            filterOptions.courses.length === 0
              ? "등록된 과정이 없습니다. 과정관리에서 먼저 과정을 등록해주세요."
              : undefined
          }
        >
          <LectureFormSelect
            id="lecture-course"
            value={form.courseId}
            onChange={(event) => updateField("courseId", event.target.value)}
          >
            <option value="">과정을 선택하세요</option>
            {filterOptions.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </LectureFormSelect>
        </LectureFormField>

        <LectureFormField
          label="설명"
          htmlFor="lecture-description"
          error={fieldErrors.description}
        >
          <LectureFormTextarea
            id="lecture-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="강의 소개 및 설명을 입력하세요"
          />
        </LectureFormField>

        <LectureFormField
          label="썸네일"
          htmlFor="lecture-thumbnail"
          hint="실제 업로드는 지원하지 않으며, 선택한 파일명만 임시로 저장됩니다."
        >
          <LectureThumbnailPicker
            value={form.thumbnailFileName}
            onChange={(fileName) => updateField("thumbnailFileName", fileName)}
          />
        </LectureFormField>

        <LectureFormField label="공개 여부" htmlFor="lecture-is-published">
          <label
            htmlFor="lecture-is-published"
            className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
          >
            <AdminCheckbox
              id="lecture-is-published"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            공개(운영중) 상태로 등록
          </label>
        </LectureFormField>
      </form>
    </AdminModal>
  );
}
