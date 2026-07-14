"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteCourseCategoryAction } from "@/features/course-categories/actions/course-category.actions";

type CourseCategoryDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
  categoryName: string;
  onDeleted?: (message: string) => void;
};

export function CourseCategoryDeleteConfirmModal({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  onDeleted,
}: CourseCategoryDeleteConfirmModalProps) {
  const [isDeleting, startDelete] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (isDeleting) return;
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setErrorMessage(null);
    }
  }

  function handleConfirmDelete() {
    if (!categoryId) return;

    startDelete(async () => {
      setErrorMessage(null);

      try {
        const result = await deleteCourseCategoryAction(categoryId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted?.(result.message);
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "카테고리 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="카테고리 삭제"
      description={`"${categoryName}" 카테고리를 삭제하시겠습니까?`}
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
        <p>이 카테고리를 사용 중인 과정이 있으면 삭제할 수 없습니다. 이 경우 &quot;미사용&quot;으로 전환해주세요.</p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">{errorMessage}</p>
        ) : null}
      </div>
    </AdminModal>
  );
}
