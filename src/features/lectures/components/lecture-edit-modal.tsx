"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getLectureForEditAction,
  updateLectureAction,
} from "@/features/lectures/actions/lecture-edit.actions";
import {
  LectureFormField,
  LectureFormSelect,
  LectureFormTextarea,
  LectureThumbnailPicker,
} from "@/features/lectures/components/lecture-form-field";
import type {
  LectureEditDetail,
  LectureEditInput,
  LectureFilterOptions,
} from "@/features/lectures/types/lecture.types";

type LectureEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string | null;
  filterOptions: LectureFilterOptions;
  onSuccess?: (message: string) => void;
};

function createFormFromLecture(lecture: LectureEditDetail): LectureEditInput {
  return {
    courseId: lecture.courseId,
    title: lecture.title,
    description: lecture.description,
    thumbnailFileName: lecture.thumbnailFileName,
    isPublished: lecture.isPublished,
  };
}

export function LectureEditModal({
  open,
  onOpenChange,
  lectureId,
  filterOptions,
  onSuccess,
}: LectureEditModalProps) {
  const [form, setForm] = useState<LectureEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LectureEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !lectureId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getLectureForEditAction(lectureId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(createFormFromLecture(result.lecture));
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "강의 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, lectureId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof LectureEditInput>(
    key: K,
    value: LectureEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lectureId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateLectureAction(lectureId, form);

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
          error instanceof Error ? error.message : "강의 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="강의수정"
      description="강의 정보를 수정하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-xl"
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
            form="lecture-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          강의 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="lecture-edit-form"
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
            htmlFor="edit-lecture-title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="edit-lecture-title"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </LectureFormField>

          <LectureFormField
            label="연결 과정 선택"
            htmlFor="edit-lecture-course"
            required
            error={fieldErrors.courseId}
          >
            <LectureFormSelect
              id="edit-lecture-course"
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
            htmlFor="edit-lecture-description"
            error={fieldErrors.description}
          >
            <LectureFormTextarea
              id="edit-lecture-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </LectureFormField>

          <LectureFormField
            label="썸네일"
            htmlFor="edit-lecture-thumbnail"
            hint="실제 업로드는 지원하지 않으며, 선택한 파일명만 임시로 저장됩니다."
          >
            <LectureThumbnailPicker
              value={form.thumbnailFileName}
              onChange={(fileName) => updateField("thumbnailFileName", fileName)}
            />
          </LectureFormField>

          <LectureFormField label="공개 여부" htmlFor="edit-lecture-is-published">
            <label
              htmlFor="edit-lecture-is-published"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="edit-lecture-is-published"
                checked={form.isPublished}
                onChange={(event) => updateField("isPublished", event.target.checked)}
              />
              공개(운영중) 상태로 전환
            </label>
          </LectureFormField>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "강의 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
