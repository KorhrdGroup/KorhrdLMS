"use client";

import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteBoardPostAction } from "@/features/boards/actions/board.actions";
import type { BoardListItem } from "@/features/boards/types/board.types";

type BoardDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: BoardListItem | null;
  onDeleted?: (message: string) => void;
};

export function BoardDeleteConfirmModal({
  open,
  onOpenChange,
  target,
  onDeleted,
}: BoardDeleteConfirmModalProps) {
  const [isSubmitting, startSubmit] = useTransition();

  function handleConfirm() {
    if (!target) {
      return;
    }

    startSubmit(async () => {
      try {
        const result = await deleteBoardPostAction(target.id);

        if (!result.success) {
          return;
        }

        onOpenChange(false);
        onDeleted?.(result.message);
      } catch {
        // handled by parent refresh on success only
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={onOpenChange}
      title="게시글 삭제"
      description="선택한 게시글을 삭제하시겠습니까?"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
          <AdminButton
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !target}
          >
            {isSubmitting ? "삭제 중..." : "삭제"}
          </AdminButton>
        </>
      }
    >
      <p className="text-sm text-[#374151]">
        {target ? `"${target.title}" 게시글과 연결된 답글·댓글이 함께 삭제됩니다.` : null}
      </p>
    </AdminModal>
  );
}
