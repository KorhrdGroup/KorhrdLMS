"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { softDeleteMembersAction } from "@/features/members/actions/member-delete.actions";

type MemberDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedIds: string[];
  onDeleted: () => void;
};

export function MemberDeleteConfirmModal({
  open,
  onOpenChange,
  selectedCount,
  selectedIds,
  onDeleted,
}: MemberDeleteConfirmModalProps) {
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
        const result = await softDeleteMembersAction(selectedIds);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted();
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "회원 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="회원 삭제"
      description={`선택한 ${selectedCount}명의 회원을 삭제하시겠습니까?`}
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
        <p>삭제된 회원은 목록에서 숨겨지며, 데이터는 보관됩니다.</p>
        <p className="text-[#EF4444]">이 작업은 되돌릴 수 없습니다.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
