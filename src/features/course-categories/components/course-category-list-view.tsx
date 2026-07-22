"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { M } from "@/features/courses/lib/course-design";
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
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            과정관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>카테고리관리</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>카테고리관리</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4, maxWidth: 640 }}>
            과정 분류(카테고리)를 등록·관리합니다. 여기서 만든 카테고리는 과정등록/수정과 수강신청 화면에 바로 반영됩니다.
          </div>
        </div>
        <button
          type="button"
          onClick={handleRegisterClick}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            background: M.ink,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          + 카테고리 등록
        </button>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <CourseCategoryListTable
        categories={categories}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onActiveChanged={() => router.refresh()}
        onReordered={() => router.refresh()}
      />

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
