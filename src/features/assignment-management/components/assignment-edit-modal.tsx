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
  getAssignmentForEditAction,
  updateAssignmentAction,
} from "@/features/assignment-management/actions/assignment-edit.actions";
import type {
  AssignmentEditDetail,
  AssignmentEditInput,
  AssignmentFilterOptions,
} from "@/features/assignment-management/types/assignment.types";

type AssignmentEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string | null;
  filterOptions: AssignmentFilterOptions;
  onSuccess?: (message: string) => void;
};

function createFormFromDetail(detail: AssignmentEditDetail): AssignmentEditInput {
  return {
    courseId: detail.courseId,
    title: detail.title,
    description: detail.description,
    submissionStart: detail.submissionStart,
    submissionEnd: detail.submissionEnd,
    allowAttachment: detail.allowAttachment,
    maxUploadSizeMb: detail.maxUploadSizeMb,
    isPublished: detail.isPublished,
  };
}

export function AssignmentEditModal({
  open,
  onOpenChange,
  assignmentId,
  filterOptions,
  onSuccess,
}: AssignmentEditModalProps) {
  const [form, setForm] = useState<AssignmentEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AssignmentEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !assignmentId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getAssignmentForEditAction(assignmentId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(createFormFromDetail(result.assignment));
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "과제 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, assignmentId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof AssignmentEditInput>(
    key: K,
    value: AssignmentEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!assignmentId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateAssignmentAction(assignmentId, form);

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
          error instanceof Error ? error.message : "과제 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="과제수정"
      description="과제 정보를 수정하고 저장하세요."
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
            form="assignment-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          과제 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="assignment-edit-form"
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
            htmlFor="edit-assignment-title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="edit-assignment-title"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="연결 과정 선택"
            htmlFor="edit-assignment-course"
            required
            error={fieldErrors.courseId}
          >
            <EnrollmentFormSelect
              id="edit-assignment-course"
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
          </EnrollmentFormField>

          <EnrollmentFormField
            label="과제 설명"
            htmlFor="edit-assignment-description"
            required
            error={fieldErrors.description}
          >
            <EnrollmentFormTextarea
              id="edit-assignment-description"
              value={form.description}
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
                htmlFor="edit-assignment-start"
                required
                error={fieldErrors.submissionStart}
              >
                <AdminInput
                  id="edit-assignment-start"
                  type="date"
                  variant="outline"
                  value={form.submissionStart}
                  onChange={(event) => updateField("submissionStart", event.target.value)}
                />
              </EnrollmentFormField>

              <EnrollmentFormField
                label="제출 종료일"
                htmlFor="edit-assignment-end"
                required
                error={fieldErrors.submissionEnd}
              >
                <AdminInput
                  id="edit-assignment-end"
                  type="date"
                  variant="outline"
                  value={form.submissionEnd}
                  onChange={(event) => updateField("submissionEnd", event.target.value)}
                />
              </EnrollmentFormField>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="첨부파일 허용 여부"
              htmlFor="edit-assignment-allow-attachment"
            >
              <label
                htmlFor="edit-assignment-allow-attachment"
                className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
              >
                <AdminCheckbox
                  id="edit-assignment-allow-attachment"
                  checked={form.allowAttachment}
                  onChange={(event) =>
                    updateField("allowAttachment", event.target.checked)
                  }
                />
                첨부파일 제출 허용
              </label>
            </EnrollmentFormField>

            <EnrollmentFormField
              label="최대 업로드 용량(MB)"
              htmlFor="edit-assignment-max-upload"
              required={form.allowAttachment}
              error={fieldErrors.maxUploadSizeMb}
            >
              <AdminInput
                id="edit-assignment-max-upload"
                type="number"
                min={1}
                variant="outline"
                disabled={!form.allowAttachment}
                value={form.maxUploadSizeMb}
                onChange={(event) => updateField("maxUploadSizeMb", event.target.value)}
              />
            </EnrollmentFormField>
          </div>

          <EnrollmentFormField label="공개 여부" htmlFor="edit-assignment-is-published">
            <label
              htmlFor="edit-assignment-is-published"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="edit-assignment-is-published"
                checked={form.isPublished}
                onChange={(event) => updateField("isPublished", event.target.checked)}
              />
              공개 상태로 전환 (학생 제출 가능)
            </label>
          </EnrollmentFormField>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "과제 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
