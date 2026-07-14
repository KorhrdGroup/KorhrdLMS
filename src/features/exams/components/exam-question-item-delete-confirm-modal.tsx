"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { softDeleteExamQuestionItemAction } from "@/features/exams/actions/exam-question-item.actions";
import { truncateQuestionContent } from "@/features/exams/lib/exam-question-item.utils";
import type { ExamQuestionItem } from "@/features/exams/types/exam-question-item.types";

type ExamQuestionItemDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ExamQuestionItem | null;
  onDeleted: (message: string) => void;
};

export function ExamQuestionItemDeleteConfirmModal({
  open,
  onOpenChange,
  target,
  onDeleted,
}: ExamQuestionItemDeleteConfirmModalProps) {
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
        const result = await softDeleteExamQuestionItemAction(target.id);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted(result.message);
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
      description="해당 문제를 삭제하시겠습니까?"
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
            disabled={isDeleting || !target}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-3 text-sm text-[#6B7280]">
        {target ? (
          <p>
            {target.number}번 · {truncateQuestionContent(target.question, 80)}
          </p>
        ) : null}
        <p>삭제된 문제는 목록에서 숨겨지며, 데이터는 보관됩니다.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
