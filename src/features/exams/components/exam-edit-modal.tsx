"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getExamForEditAction,
  updateExamAction,
} from "@/features/exams/actions/exam-question.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import {
  EXAM_KIND_LABELS,
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
} from "@/features/exams/constants";
import type {
  ExamEditDetail,
  ExamEditInput,
} from "@/features/exams/types/exam-edit.types";
import type { ExamStatus } from "@/types/database.types";

type ExamEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string | null;
  onSuccess?: (message: string) => void;
};

type ReadOnlyFieldProps = {
  label: string;
  value: React.ReactNode;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function createFormFromDetail(detail: ExamEditDetail): ExamEditInput {
  return {
    name: detail.name,
    examStart: detail.examStart,
    examEnd: detail.examEnd,
    questionCount: String(detail.questionCount),
    examDurationMinutes: String(detail.examDurationMinutes),
    status: detail.status,
    memo: detail.memo ?? "",
  };
}

export function ExamEditModal({
  open,
  onOpenChange,
  examId,
  onSuccess,
}: ExamEditModalProps) {
  const [detail, setDetail] = useState<ExamEditDetail | null>(null);
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
      setDetail(null);
      setForm(null);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getExamForEditAction(examId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setDetail(result.exam);
        setForm(createFormFromDetail(result.exam));
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "시험 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, examId]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setForm(null);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof ExamEditInput>(
    key: K,
    value: ExamEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  const canSubmit = !!form && !!detail && !isSubmitting && !isLoading;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form || !examId) {
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
      title="시험 수정"
      description="시험 정보를 수정할 수 있습니다."
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
            form="exam-edit-form"
            disabled={!canSubmit}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : formError && !form ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError}
        </div>
      ) : detail && form ? (
        <form id="exam-edit-form" className="space-y-6" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              기본 정보
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="연도" value={detail.year} />
              <ReadOnlyField label="과정명" value={detail.courseName} />
              <ReadOnlyField
                label="시험종류"
                value={EXAM_KIND_LABELS[detail.examKind]}
              />
              <ReadOnlyField
                label="시험유형"
                value={EXAM_TYPE_LABELS[detail.examType]}
              />
            </dl>
          </section>

          <section className="space-y-4">
            <h3 className="border-b border-[#E5E7EB] pb-2 text-sm font-semibold text-[#111827]">
              수정 정보
            </h3>

            <EnrollmentFormField
              label="시험명"
              htmlFor="name"
              required
              error={fieldErrors.name}
            >
              <AdminInput
                id="name"
                variant="outline"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </EnrollmentFormField>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-[#374151]">
                응시기간<span className="text-[#EF4444]"> *</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <EnrollmentFormField
                  label="시작"
                  htmlFor="examStart"
                  required
                  error={fieldErrors.examStart}
                >
                  <AdminInput
                    id="examStart"
                    type="date"
                    variant="outline"
                    value={form.examStart}
                    onChange={(event) => updateField("examStart", event.target.value)}
                  />
                </EnrollmentFormField>

                <EnrollmentFormField
                  label="종료"
                  htmlFor="examEnd"
                  required
                  error={fieldErrors.examEnd}
                >
                  <AdminInput
                    id="examEnd"
                    type="date"
                    variant="outline"
                    value={form.examEnd}
                    onChange={(event) => updateField("examEnd", event.target.value)}
                  />
                </EnrollmentFormField>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <EnrollmentFormField
                label="문제수"
                htmlFor="questionCount"
                required
                error={fieldErrors.questionCount}
              >
                <AdminInput
                  id="questionCount"
                  type="number"
                  min={0}
                  variant="outline"
                  value={form.questionCount}
                  onChange={(event) =>
                    updateField("questionCount", event.target.value)
                  }
                />
              </EnrollmentFormField>

              <EnrollmentFormField
                label="시험시간(분)"
                htmlFor="examDurationMinutes"
                required
                error={fieldErrors.examDurationMinutes}
              >
                <AdminInput
                  id="examDurationMinutes"
                  type="number"
                  min={0}
                  variant="outline"
                  value={form.examDurationMinutes}
                  onChange={(event) =>
                    updateField("examDurationMinutes", event.target.value)
                  }
                />
              </EnrollmentFormField>
            </div>

            <EnrollmentFormField
              label="상태"
              htmlFor="status"
              required
              error={fieldErrors.status}
            >
              <EnrollmentFormSelect
                id="status"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as ExamStatus)
                }
              >
                {Object.entries(EXAM_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </EnrollmentFormSelect>
            </EnrollmentFormField>

            <EnrollmentFormField label="메모" htmlFor="memo" error={fieldErrors.memo}>
              <EnrollmentFormTextarea
                id="memo"
                value={form.memo}
                placeholder="메모를 입력하세요"
                onChange={(event) => updateField("memo", event.target.value)}
              />
            </EnrollmentFormField>
          </section>
        </form>
      ) : null}
    </AdminModal>
  );
}
