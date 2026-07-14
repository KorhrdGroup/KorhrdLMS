"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCheckbox } from "@/components/admin/ui/admin-checkbox";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { gradeSubmissionAction } from "@/features/assignment-management/actions/assignment-submission.actions";
import type { AssignmentSubmission } from "@/features/assignment-management/types/assignment.types";
import type { SubmissionGradeInput } from "@/features/assignment-management/types/assignment-submission.types";

type AssignmentGradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  submission: AssignmentSubmission | null;
  onSuccess?: (message: string) => void;
};

const INITIAL_FORM: SubmissionGradeInput = {
  score: "",
  feedback: "",
  markGraded: true,
};

export function AssignmentGradeModal({
  open,
  onOpenChange,
  assignmentId,
  submission,
  onSuccess,
}: AssignmentGradeModalProps) {
  const [form, setForm] = useState<SubmissionGradeInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SubmissionGradeInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !submission) {
      return;
    }

    setForm({
      score: submission.score !== null ? String(submission.score) : "",
      feedback: submission.feedback ?? "",
      markGraded: submission.status === "graded",
    });
    setFieldErrors({});
    setFormError(null);
  }, [open, submission]);

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

  function updateField<K extends keyof SubmissionGradeInput>(
    key: K,
    value: SubmissionGradeInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!submission) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await gradeSubmissionAction(assignmentId, submission.id, form);

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
          error instanceof Error ? error.message : "채점 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="제출물 채점"
      description={
        submission
          ? `${submission.studentName} 학습자의 제출물을 채점합니다.`
          : "제출물을 채점합니다."
      }
      className="sm:max-w-md"
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
          <AdminButton type="submit" form="assignment-grade-form" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form id="assignment-grade-form" className="space-y-4" onSubmit={handleSubmit}>
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        {submission?.fileName ? (
          <p className="rounded-lg bg-[#F9FAFB] px-4 py-3 text-sm text-[#6B7280]">
            제출 파일: {submission.fileName}
          </p>
        ) : null}

        <EnrollmentFormField
          label="점수"
          htmlFor="grade-score"
          required
          error={fieldErrors.score}
        >
          <AdminInput
            id="grade-score"
            type="number"
            min={0}
            max={100}
            variant="outline"
            value={form.score}
            onChange={(event) => updateField("score", event.target.value)}
            placeholder="0~100"
          />
        </EnrollmentFormField>

        <EnrollmentFormField
          label="피드백"
          htmlFor="grade-feedback"
          error={fieldErrors.feedback}
        >
          <EnrollmentFormTextarea
            id="grade-feedback"
            value={form.feedback}
            placeholder="학습자에게 전달할 피드백을 입력하세요"
            onChange={(event) => updateField("feedback", event.target.value)}
          />
        </EnrollmentFormField>

        <label
          htmlFor="grade-mark-graded"
          className="flex h-10 w-fit cursor-pointer items-center gap-2 text-sm text-[#374151]"
        >
          <AdminCheckbox
            id="grade-mark-graded"
            checked={form.markGraded}
            onChange={(event) => updateField("markGraded", event.target.checked)}
          />
          채점완료로 처리
        </label>
      </form>
    </AdminModal>
  );
}
