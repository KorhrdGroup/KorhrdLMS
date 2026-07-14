"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
} from "@/features/enrollments/components/enrollment-form-field";
import {
  getExamForEditAction,
  updateExamAction,
} from "@/features/exam-management/actions/exam-edit.actions";
import { EXAM_ELIGIBILITY_NOTICE } from "@/features/exam-management/constants";
import type {
  ExamEditDetail,
  ExamEditInput,
  ExamFilterOptions,
} from "@/features/exam-management/types/exam.types";

type ExamEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string | null;
  filterOptions: ExamFilterOptions;
  onSuccess?: (message: string) => void;
};

function createFormFromDetail(detail: ExamEditDetail): ExamEditInput {
  return {
    courseId: detail.courseId,
    title: detail.title,
    durationMinutes: detail.durationMinutes,
    passScore: detail.passScore,
    isPublished: detail.isPublished,
  };
}

export function ExamEditModal({
  open,
  onOpenChange,
  examId,
  filterOptions,
  onSuccess,
}: ExamEditModalProps) {
  const [form, setForm] = useState<ExamEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ExamEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !examId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getExamForEditAction(examId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(createFormFromDetail(result.exam));
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "시험 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, examId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof ExamEditInput>(key: K, value: ExamEditInput[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!examId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateExamAction(examId, form);

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
          error instanceof Error ? error.message : "시험 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="시험수정"
      description="시험 정보를 수정하고 저장하세요."
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
            form="exam-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#6B7280]">
          시험 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="exam-edit-form"
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
            htmlFor="edit-exam-title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="edit-exam-title"
              variant="outline"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </EnrollmentFormField>

          <EnrollmentFormField
            label="연결 과정 선택"
            htmlFor="edit-exam-course"
            required
            error={fieldErrors.courseId}
          >
            <EnrollmentFormSelect
              id="edit-exam-course"
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

          <p className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#2563EB]">
            {EXAM_ELIGIBILITY_NOTICE}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="제한시간(분)"
              htmlFor="edit-exam-duration"
              required
              error={fieldErrors.durationMinutes}
            >
              <AdminInput
                id="edit-exam-duration"
                type="number"
                min={1}
                variant="outline"
                value={form.durationMinutes}
                onChange={(event) => updateField("durationMinutes", event.target.value)}
              />
            </EnrollmentFormField>

            <EnrollmentFormField
              label="합격점수"
              htmlFor="edit-exam-pass-score"
              required
              error={fieldErrors.passScore}
            >
              <AdminInput
                id="edit-exam-pass-score"
                type="number"
                min={0}
                max={100}
                variant="outline"
                value={form.passScore}
                onChange={(event) => updateField("passScore", event.target.value)}
              />
            </EnrollmentFormField>
          </div>

          <EnrollmentFormField label="공개 여부" htmlFor="edit-exam-is-published">
            <label
              htmlFor="edit-exam-is-published"
              className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
            >
              <AdminCheckbox
                id="edit-exam-is-published"
                checked={form.isPublished}
                onChange={(event) => updateField("isPublished", event.target.checked)}
              />
              공개 상태로 전환 (학생 응시 가능)
            </label>
          </EnrollmentFormField>
        </form>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "시험 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
