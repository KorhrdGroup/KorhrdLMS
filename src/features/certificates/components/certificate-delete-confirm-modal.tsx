"use client";

import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteCertificateApplicationAction } from "@/features/certificates/actions/certificate.actions";
import type { CertificateListItem } from "@/features/certificates/types/certificate.types";

type CertificateDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CertificateListItem | null;
  onDeleted?: (message: string) => void;
};

export function CertificateDeleteConfirmModal({
  open,
  onOpenChange,
  target,
  onDeleted,
}: CertificateDeleteConfirmModalProps) {
  const [isSubmitting, startSubmit] = useTransition();

  function handleConfirm() {
    if (!target) {
      return;
    }

    startSubmit(async () => {
      try {
        const result = await deleteCertificateApplicationAction(target.id);

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
      title="신청 내역 삭제"
      description="선택한 자격증 신청 내역을 삭제하시겠습니까?"
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
          ? `"${target.certificateName}" (${target.applicantName}) 신청 내역이 삭제됩니다.`
          : null}
      </p>
    </AdminModal>
  );
}
