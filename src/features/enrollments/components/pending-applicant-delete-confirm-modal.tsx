"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { softDeletePendingApplicantsAction } from "@/features/enrollments/actions/pending-applicant.actions";

type PendingApplicantDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedIds: string[];
  onDeleted: (message: string) => void;
};

export function PendingApplicantDeleteConfirmModal({
  open,
  onOpenChange,
  selectedCount,
  selectedIds,
  onDeleted,
}: PendingApplicantDeleteConfirmModalProps) {
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
    startDelete(async () => {
      setErrorMessage(null);

      try {
        const result = await softDeletePendingApplicantsAction(selectedIds);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted(result.message);
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "신청 수강생 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="일괄삭제"
      description="선택한 신청 수강생을 삭제하시겠습니까?"
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
        <p>선택한 {selectedCount}명의 신청 수강생이 목록에서 숨겨집니다.</p>
        <p>데이터는 보관되며, 상태가 삭제로 변경됩니다.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
