"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import {
  getMaterialForEditAction,
  updateMaterialAction,
} from "@/features/learning-materials/actions/material-edit.actions";
import { MaterialFilePicker } from "@/features/learning-materials/components/material-file-picker";
import { COMMON_MATERIAL_OPTION_VALUE } from "@/features/learning-materials/constants";
import type {
  MaterialEditDetail,
  MaterialEditInput,
  MaterialFilterOptions,
} from "@/features/learning-materials/types/material.types";

type MaterialEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string | null;
  filterOptions: MaterialFilterOptions;
  onSuccess?: (message: string) => void;
};

function createFormFromDetail(detail: MaterialEditDetail): MaterialEditInput {
  return {
    courseId: detail.courseId ?? COMMON_MATERIAL_OPTION_VALUE,
    title: detail.title,
    description: detail.description,
    file: null,
    fileUrl: detail.fileUrl ?? "",
    isPublished: detail.isPublished,
  };
}

export function MaterialEditModal({
  open,
  onOpenChange,
  materialId,
  filterOptions,
  onSuccess,
}: MaterialEditModalProps) {
  const [form, setForm] = useState<MaterialEditInput | null>(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MaterialEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !materialId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getMaterialForEditAction(materialId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(createFormFromDetail(result.material));
        setExistingFileName(result.material.fileName);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "자료 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, materialId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setExistingFileName("");
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof MaterialEditInput>(
    key: K,
    value: MaterialEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!materialId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateMaterialAction(materialId, form);

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
          error instanceof Error ? error.message : "자료 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="자료수정"
      description="학습자료 정보를 수정하고 저장하세요."
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
            form="material-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          자료 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="material-edit-form"
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
            htmlFor="edit-material-title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="edit-material-title"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="연결 과정 선택"
            htmlFor="edit-material-course"
            required
            error={fieldErrors.courseId}
          >
            <EnrollmentFormSelect
              id="edit-material-course"
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
          </EnrollmentFormField>

          <EnrollmentFormField
            label="설명"
            htmlFor="edit-material-description"
            required
            error={fieldErrors.description}
          >
            <EnrollmentFormTextarea
              id="edit-material-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="파일 교체"
            htmlFor="edit-material-file"
            error={fieldErrors.file}
          >
            <MaterialFilePicker
              value={form.file}
              existingFileName={existingFileName}
              onChange={(file) => updateField("file", file)}
            />
            <p className="text-xs text-[#9CA3AF]">
              새 파일을 선택하지 않으면 기존 파일이 그대로 유지됩니다.
            </p>
          </EnrollmentFormField>

          <EnrollmentFormField
            label="다운로드 링크 (선택)"
            htmlFor="edit-material-file-url"
            error={fieldErrors.fileUrl}
          >
            <AdminInput
              id="edit-material-file-url"
              variant="outline"
              value={form.fileUrl}
              onChange={(event) => updateField("fileUrl", event.target.value)}
              placeholder="https://... (입력 시 학생 자료실에서 실제 다운로드 링크로 노출됩니다)"
            />
          </EnrollmentFormField>

          <EnrollmentFormField label="공개 여부" htmlFor="edit-material-is-published">
            <label
              htmlFor="edit-material-is-published"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="edit-material-is-published"
                checked={form.isPublished}
                onChange={(event) => updateField("isPublished", event.target.checked)}
              />
              공개 상태로 전환 (학생 자료실에 노출)
            </label>
          </EnrollmentFormField>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "자료 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
