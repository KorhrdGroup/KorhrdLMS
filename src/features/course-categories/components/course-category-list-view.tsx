"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminCard, AdminCardContent } from "@/components/admin/ui/admin-card";
import { CourseCategoryDeleteConfirmModal } from "@/features/course-categories/components/course-category-delete-confirm-modal";
import { CourseCategoryFormModal } from "@/features/course-categories/components/course-category-form-modal";
import { CourseCategoryListTable } from "@/features/course-categories/components/course-category-list-table";
import type { CourseCategoryListItem } from "@/features/course-categories/types/course-category.types";

type CourseCategoryListViewProps = {
  categories: CourseCategoryListItem[];
};

export function CourseCategoryListView({ categories }: CourseCategoryListViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CourseCategoryListItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CourseCategoryListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleRegisterClick() {
    setSuccessMessage(null);
    setEditTarget(null);
    setFormOpen(true);
  }

  function handleEditClick(category: CourseCategoryListItem) {
    setSuccessMessage(null);
    setEditTarget(category);
    setFormOpen(true);
  }

  function handleDeleteClick(category: CourseCategoryListItem) {
    setSuccessMessage(null);
    setDeleteTarget(category);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="카테고리관리"
        description="과정 분류(카테고리)를 등록하고 관리합니다. 여기서 만든 카테고리는 과정등록/수정과 수강신청 화면에 바로 반영됩니다."
        actions={
          <AdminButton type="button" onClick={handleRegisterClick}>
            <Plus className="size-4" />
            카테고리 등록
          </AdminButton>
        }
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <CourseCategoryListTable
            categories={categories}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onActiveChanged={() => router.refresh()}
            onReordered={() => router.refresh()}
          />
        </AdminCardContent>
      </AdminCard>

      <CourseCategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editTarget}
        onSuccess={handleActionSuccess}
      />
      <CourseCategoryDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        categoryId={deleteTarget?.id ?? null}
        categoryName={deleteTarget?.name ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
