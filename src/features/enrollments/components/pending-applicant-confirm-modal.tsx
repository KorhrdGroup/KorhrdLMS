"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { confirmPendingApplicantsAction } from "@/features/enrollments/actions/pending-applicant.actions";

type PendingApplicantConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedIds: string[];
  onConfirmed: (message: string) => void;
};

export function PendingApplicantConfirmModal({
  open,
  onOpenChange,
  selectedCount,
  selectedIds,
  onConfirmed,
}: PendingApplicantConfirmModalProps) {
  const [isConfirming, startConfirm] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (isConfirming) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      setErrorMessage(null);
    }
  }

  function handleConfirm() {
    startConfirm(async () => {
      setErrorMessage(null);

      try {
        const result = await confirmPendingApplicantsAction(selectedIds);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onConfirmed(result.message);
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "신청 수강생 확정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="일괄확정"
      description="선택한 신청 수강생을 최종 수강생으로 확정하시겠습니까?"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isConfirming}
          >
            취소
          </AdminButton>
          <AdminButton
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "확정 중..." : "확정"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-3 text-sm text-[#6B7280]">
        <p>선택한 {selectedCount}명의 신청 수강생이 최종 수강생으로 확정됩니다.</p>
        <p>확정된 수강생은 신청 수강생 목록에서 제외됩니다.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
