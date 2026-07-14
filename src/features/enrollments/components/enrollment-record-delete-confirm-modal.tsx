"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteEnrollmentRecordAction } from "@/features/enrollments/actions/enrollment-record.actions";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";

type EnrollmentRecordDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: EnrollmentRecordListItem | null;
  onDeleted?: (message: string) => void;
};

export function EnrollmentRecordDeleteConfirmModal({
  open,
  onOpenChange,
  target,
  onDeleted,
}: EnrollmentRecordDeleteConfirmModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setErrorMessage(null);
    }
  }

  function handleDelete() {
    if (!target) {
      return;
    }

    startSubmit(async () => {
      setErrorMessage(null);

      try {
        const result = await deleteEnrollmentRecordAction(target.id);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        handleOpenChange(false);
        onDeleted?.(result.message);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "수강 정보 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="수강 삭제"
      description="삭제한 수강 정보는 복구할 수 없습니다."
      className="sm:max-w-md"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
          <AdminButton
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "삭제 중..." : "삭제"}
          </AdminButton>
        </>
      }
    >
      {errorMessage ? (
        <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
          {errorMessage}
        </p>
      ) : (
        <p className="text-sm text-[#374151]">
          {target ? (
            <>
              <span className="font-semibold">{target.member.name}</span> 회원의{" "}
              <span className="font-semibold">{target.course.name}</span> 수강 정보를
              삭제하시겠습니까?
            </>
          ) : null}
        </p>
      )}
    </AdminModal>
  );
}
