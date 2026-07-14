"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteExamQuestionAction } from "@/features/exam-management/actions/exam-question.actions";
import type { ExamQuestion } from "@/features/exam-management/types/exam.types";

type ExamQuestionDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  target: ExamQuestion | null;
  onDeleted?: (message: string) => void;
};

export function ExamQuestionDeleteConfirmModal({
  open,
  onOpenChange,
  examId,
  target,
  onDeleted,
}: ExamQuestionDeleteConfirmModalProps) {
  const [isDeleting, startDelete] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setErrorMessage(null);
    }
  }

  function handleConfirmDelete() {
    if (!target) {
      return;
    }

    startDelete(async () => {
      setErrorMessage(null);

      try {
        const result = await deleteExamQuestionAction(examId, target.id);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted?.(result.message);
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "문제 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="문제 삭제"
      description={
        target ? `${target.order}번 문제를 삭제하시겠습니까?` : "문제를 삭제하시겠습니까?"
      }
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            취소
          </AdminButton>
          <AdminButton
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-3 text-sm text-[#6B7280]">
        <p>삭제한 문제는 복구할 수 없습니다.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
