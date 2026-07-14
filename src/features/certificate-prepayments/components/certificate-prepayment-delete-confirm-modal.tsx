"use client";

import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteCertificatePrepaymentAction } from "@/features/certificate-prepayments/actions/certificate-prepayment.actions";
import type { CertificatePrepaymentListItem } from "@/features/certificate-prepayments/types/certificate-prepayment.types";

type CertificatePrepaymentDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CertificatePrepaymentListItem | null;
  onDeleted?: (message: string) => void;
  onError?: (message: string) => void;
};

export function CertificatePrepaymentDeleteConfirmModal({
  open,
  onOpenChange,
  target,
  onDeleted,
  onError,
}: CertificatePrepaymentDeleteConfirmModalProps) {
  const [isSubmitting, startSubmit] = useTransition();

  function handleConfirm() {
    if (!target) {
      return;
    }

    startSubmit(async () => {
      try {
        const result = await deleteCertificatePrepaymentAction(target.id);

        if (!result.success) {
          onError?.(result.message);
          return;
        }

        onOpenChange(false);
        onDeleted?.(result.message);
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "선납결제 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={onOpenChange}
      title="선납결제 삭제"
      description="선택한 선납결제 내역을 삭제하시겠습니까?"
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
        {target
          ? `"${target.certificateName}" (${target.memberName}) 선납결제 내역이 삭제됩니다.`
          : null}
      </p>
    </AdminModal>
  );
}
