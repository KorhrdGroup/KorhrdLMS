"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import {
  addExamQuestionAction,
  getExamQuestionAction,
  updateExamQuestionAction,
} from "@/features/exam-management/actions/exam-question.actions";
import type { ExamQuestionInput } from "@/features/exam-management/types/exam-question-form.types";

const INITIAL_FORM: ExamQuestionInput = {
  question: "",
  choice1: "",
  choice2: "",
  choice3: "",
  choice4: "",
  answer: "",
  score: "10",
};

type ExamQuestionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  questionId?: string | null;
  onSuccess?: (message: string) => void;
};

export function ExamQuestionFormModal({
  open,
  onOpenChange,
  examId,
  questionId = null,
  onSuccess,
}: ExamQuestionFormModalProps) {
  const isEditMode = !!questionId;
  const [form, setForm] = useState<ExamQuestionInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ExamQuestionInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!questionId) {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);
      return;
    }

    startLoad(async () => {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getExamQuestionAction(examId, questionId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm({
          question: result.question.question,
          choice1: result.question.choice1,
          choice2: result.question.choice2,
          choice3: result.question.choice3,
          choice4: result.question.choice4,
          answer: result.question.answer,
          score: String(result.question.score),
        });
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "문제 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, examId, questionId]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setForm(INITIAL_FORM);
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof ExamQuestionInput>(
    key: K,
    value: ExamQuestionInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  const canSubmit = !isSubmitting && !isLoading;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = isEditMode
          ? await updateExamQuestionAction(examId, questionId!, form)
          : await addExamQuestionAction(examId, form);

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
          error instanceof Error ? error.message : "문제 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "문제 수정" : "문제 추가"}
      description="객관식 4지선다 문제를 등록합니다."
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
          <AdminButton type="submit" form="exam-question-form" disabled={!canSubmit}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          문제 정보를 불러오는 중...
        </div>
      ) : (
        <form id="exam-question-form" className="space-y-4" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <EnrollmentFormField
            label="문제내용"
            htmlFor="exam-question-content"
            required
            error={fieldErrors.question}
          >
            <EnrollmentFormTextarea
              id="exam-question-content"
              value={form.question}
              placeholder="문제 내용을 입력하세요"
              onChange={(event) => updateField("question", event.target.value)}
            />
          </EnrollmentFormField>

          {([1, 2, 3, 4] as const).map((index) => {
            const key = `choice${index}` as "choice1" | "choice2" | "choice3" | "choice4";

            return (
              <EnrollmentFormField
                key={key}
                label={`보기${index}`}
                htmlFor={key}
                required
                error={fieldErrors[key]}
              >
                <AdminInput
                  id={key}
                  variant="outline"
                  value={form[key]}
                  placeholder={`보기 ${index}`}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </EnrollmentFormField>
            );
          })}

          <div className="grid gap-4 sm:grid-cols-2">
            <EnrollmentFormField
              label="정답"
              htmlFor="exam-question-answer"
              required
              error={fieldErrors.answer}
            >
              <EnrollmentFormSelect
                id="exam-question-answer"
                value={form.answer}
                onChange={(event) =>
                  updateField("answer", event.target.value as ExamQuestionInput["answer"])
                }
              >
                <option value="">정답 선택</option>
                {[1, 2, 3, 4].map((value) => (
                  <option key={value} value={String(value)}>
                    {value}번
                  </option>
                ))}
              </EnrollmentFormSelect>
            </EnrollmentFormField>

            <EnrollmentFormField
              label="배점"
              htmlFor="exam-question-score"
              required
              error={fieldErrors.score}
            >
              <AdminInput
                id="exam-question-score"
                type="number"
                min={1}
                variant="outline"
                value={form.score}
                onChange={(event) => updateField("score", event.target.value)}
              />
            </EnrollmentFormField>
          </div>
        </form>
      )}
    </AdminModal>
  );
}
