"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createExamQuestionItemAction,
  getExamQuestionItemAction,
  updateExamQuestionItemAction,
} from "@/features/exams/actions/exam-question-item.actions";
import {
  EnrollmentFormField,
  EnrollmentFormSelect,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { EXAM_QUESTION_TYPE_LABELS } from "@/features/exams/constants";
import type { ExamQuestionItemInput } from "@/features/exams/types/exam-question-item-form.types";
import type { ExamQuestionType } from "@/types/database.types";

const INITIAL_FORM: ExamQuestionItemInput = {
  questionType: "multiple_choice",
  question: "",
  choice1: "",
  choice2: "",
  choice3: "",
  choice4: "",
  choice5: "",
  answer: "",
  score: "1",
};

type ExamQuestionItemFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  questionId?: string | null;
  onSuccess?: (message: string) => void;
};

export function ExamQuestionItemFormModal({
  open,
  onOpenChange,
  examId,
  questionId = null,
  onSuccess,
}: ExamQuestionItemFormModalProps) {
  const isEditMode = !!questionId;
  const [form, setForm] = useState<ExamQuestionItemInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ExamQuestionItemInput, string>>
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
        const result = await getExamQuestionItemAction(questionId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setForm(result.question);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "문제 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, questionId]);

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

  function updateField<K extends keyof ExamQuestionItemInput>(
    key: K,
    value: ExamQuestionItemInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleQuestionTypeChange(questionType: ExamQuestionType) {
    setForm((current) => ({
      ...current,
      questionType,
      choice1: questionType === "multiple_choice" ? current.choice1 : "",
      choice2: questionType === "multiple_choice" ? current.choice2 : "",
      choice3: questionType === "multiple_choice" ? current.choice3 : "",
      choice4: questionType === "multiple_choice" ? current.choice4 : "",
      choice5: questionType === "multiple_choice" ? current.choice5 : "",
      answer: "",
    }));
    setFieldErrors({});
    setFormError(null);
  }

  const canSubmit = !isSubmitting && !isLoading && (!isEditMode || !!form.question);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = isEditMode
          ? await updateExamQuestionItemAction(questionId!, form)
          : await createExamQuestionItemAction(examId, form);

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

  const showChoices = form.questionType === "multiple_choice";

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "문제 수정" : "문제 등록"}
      description={
        isEditMode ? "문제 정보를 수정할 수 있습니다." : "새 문제를 등록합니다."
      }
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
            form="exam-question-item-form"
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
      ) : formError && isEditMode && !form.question ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {formError}
        </div>
      ) : (
        <form id="exam-question-item-form" className="space-y-4" onSubmit={handleSubmit}>
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <EnrollmentFormField
            label="문제유형"
            htmlFor="questionType"
            required
            error={fieldErrors.questionType}
          >
            <EnrollmentFormSelect
              id="questionType"
              value={form.questionType}
              onChange={(event) =>
                handleQuestionTypeChange(event.target.value as ExamQuestionType)
              }
            >
              {Object.entries(EXAM_QUESTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </EnrollmentFormSelect>
          </EnrollmentFormField>

          <EnrollmentFormField
            label="문제내용"
            htmlFor="question"
            required
            error={fieldErrors.question}
          >
            <EnrollmentFormTextarea
              id="question"
              value={form.question}
              placeholder="문제 내용을 입력하세요"
              onChange={(event) => updateField("question", event.target.value)}
            />
          </EnrollmentFormField>

          {showChoices ? (
            <>
              {[1, 2, 3, 4, 5].map((index) => {
                const key = `choice${index}` as keyof ExamQuestionItemInput;
                const required = index <= 4;

                return (
                  <EnrollmentFormField
                    key={key}
                    label={`보기${index}${index === 5 ? "(선택)" : ""}`}
                    htmlFor={key}
                    required={required}
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
            </>
          ) : null}

          <EnrollmentFormField
            label="정답"
            htmlFor="answer"
            required
            error={fieldErrors.answer}
          >
            {form.questionType === "multiple_choice" ? (
              <EnrollmentFormSelect
                id="answer"
                value={form.answer}
                onChange={(event) => updateField("answer", event.target.value)}
              >
                <option value="">정답 선택</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={String(value)}>
                    {value}번
                  </option>
                ))}
              </EnrollmentFormSelect>
            ) : form.questionType === "ox" ? (
              <EnrollmentFormSelect
                id="answer"
                value={form.answer}
                onChange={(event) => updateField("answer", event.target.value)}
              >
                <option value="">정답 선택</option>
                <option value="O">O</option>
                <option value="X">X</option>
              </EnrollmentFormSelect>
            ) : (
              <AdminInput
                id="answer"
                variant="outline"
                value={form.answer}
                placeholder="정답을 입력하세요"
                onChange={(event) => updateField("answer", event.target.value)}
              />
            )}
          </EnrollmentFormField>

          <EnrollmentFormField
            label="배점"
            htmlFor="score"
            required
            error={fieldErrors.score}
          >
            <AdminInput
              id="score"
              type="number"
              min={0}
              variant="outline"
              value={form.score}
              onChange={(event) => updateField("score", event.target.value)}
            />
          </EnrollmentFormField>
        </form>
      )}
    </AdminModal>
  );
}
