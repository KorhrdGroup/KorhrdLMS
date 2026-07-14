"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteLectureAction } from "@/features/lectures/actions/lecture-edit.actions";

type LectureDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string | null;
  lectureTitle: string;
  onDeleted?: (message: string) => void;
};

export function LectureDeleteConfirmModal({
  open,
  onOpenChange,
  lectureId,
  lectureTitle,
  onDeleted,
}: LectureDeleteConfirmModalProps) {
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
    if (!lectureId) {
      return;
    }

    startDelete(async () => {
      setErrorMessage(null);

      try {
        const result = await deleteLectureAction(lectureId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted?.(result.message);
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "강의 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="강의 삭제"
      description={`"${lectureTitle}" 강의를 삭제하시겠습니까?`}
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
        <p>강의를 삭제하면 등록된 모든 차시 정보도 함께 삭제되며, 복구할 수 없습니다.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
