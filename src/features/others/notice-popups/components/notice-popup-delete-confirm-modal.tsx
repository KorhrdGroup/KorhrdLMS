"use client";

import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteNoticePopupAction } from "@/features/others/notice-popups/actions/notice-popup.actions";
import type { NoticePopupListItem } from "@/features/others/notice-popups/types/notice-popup.types";

type NoticePopupDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: NoticePopupListItem | null;
  onDeleted?: (message: string) => void;
};

export function NoticePopupDeleteConfirmModal({
  open,
  onOpenChange,
  target,
  onDeleted,
}: NoticePopupDeleteConfirmModalProps) {
  const [isSubmitting, startSubmit] = useTransition();

  function handleConfirm() {
    if (!target) {
      return;
    }

    startSubmit(async () => {
      try {
        const result = await deleteNoticePopupAction(target.id);

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
      title="공지팝업 삭제"
      description="선택한 공지팝업을 삭제하시겠습니까?"
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
        {target ? `"${target.title}" 공지팝업이 삭제됩니다.` : null}
      </p>
    </AdminModal>
  );
}
