"use client";

import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { cancelCompletionCertificateAction } from "@/features/completion-certificates/actions/completion-certificate.actions";
import type { CompletionCertificateListItem } from "@/features/completion-certificates/types/completion-certificate.types";

type CompletionCertificateCancelConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CompletionCertificateListItem | null;
  onCanceled: (message: string) => void;
};

export function CompletionCertificateCancelConfirmModal({
  open,
  onOpenChange,
  target,
  onCanceled,
}: CompletionCertificateCancelConfirmModalProps) {
  const [isSubmitting, startSubmit] = useTransition();

  function handleConfirm() {
    if (!target) return;

    startSubmit(async () => {
      const result = await cancelCompletionCertificateAction(target.enrollmentId);

      if (!result.success) {
        window.alert(result.message);
        return;
      }

      onOpenChange(false);
      onCanceled(result.message);
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={onOpenChange}
      title="수료증 발급취소"
      description={
        target
          ? `${target.member.name} 회원의 ${target.course.name} 과정 수료증 발급을 취소할까요?`
          : undefined
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2">
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "발급취소"}
          </AdminButton>
        </div>
      }
    >
      <p className="text-sm text-[#6B7280]">
        발급취소 후에는 발급 이력이 초기화되며, 필요 시 다시 발급할 수 있습니다.
      </p>
    </AdminModal>
  );
}
