"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { deleteCourseAction } from "@/features/courses/actions/course-edit.actions";

type CourseDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  courseName: string;
  onDeleted?: (message: string) => void;
};

export function CourseDeleteConfirmModal({
  open,
  onOpenChange,
  courseId,
  courseName,
  onDeleted,
}: CourseDeleteConfirmModalProps) {
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
    if (!courseId) {
      return;
    }

    startDelete(async () => {
      setErrorMessage(null);

      try {
        const result = await deleteCourseAction(courseId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        onDeleted?.(result.message);
        handleOpenChange(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "과정 삭제에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="과정 삭제"
      description={`"${courseName}" 과정을 삭제하시겠습니까?`}
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
        <p>삭제 시 DB에서 완전히 제거되며, 복구할 수 없습니다.</p>
        <p>
          수강신청/차시/시험/자격증 등 연결된 데이터가 있는 과정은 안전을 위해 삭제할 수
          없습니다.
        </p>
        {errorMessage ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-[#EF4444]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </AdminModal>
  );
}
