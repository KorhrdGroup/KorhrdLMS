"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { CourseCategoryActiveToggle } from "@/features/course-categories/components/course-category-active-toggle";
import { moveCourseCategoryAction } from "@/features/course-categories/actions/course-category.actions";
import { formatDate } from "@/lib/shared/format-date";
import type {
  CourseCategoryListItem,
  CourseCategoryMoveDirection,
} from "@/features/course-categories/types/course-category.types";

type CourseCategoryListTableProps = {
  categories: CourseCategoryListItem[];
  onEditClick?: (category: CourseCategoryListItem) => void;
  onDeleteClick?: (category: CourseCategoryListItem) => void;
  onActiveChanged?: (categoryId: string, isActive: boolean) => void;
  onReordered?: () => void;
};

export function CourseCategoryListTable({
  categories,
  onEditClick,
  onDeleteClick,
  onActiveChanged,
  onReordered,
}: CourseCategoryListTableProps) {
  const [isMoving, startMove] = useTransition();

  function handleMove(id: string, direction: CourseCategoryMoveDirection) {
    startMove(async () => {
      const result = await moveCourseCategoryAction(id, direction);
      if (result.success) {
        onReordered?.();
      }
    });
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 카테고리가 없습니다. 카테고리 등록 버튼으로 새 카테고리를 추가하세요.
      </div>
    );
  }

  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow className="hover:bg-transparent">
          <AdminTableHead className="w-24">노출순서</AdminTableHead>
          <AdminTableHead>카테고리명</AdminTableHead>
          <AdminTableHead>슬러그</AdminTableHead>
          <AdminTableHead>설명</AdminTableHead>
          <AdminTableHead className="w-20 text-right">연결 과정</AdminTableHead>
          <AdminTableHead className="w-24">사용여부</AdminTableHead>
          <AdminTableHead>등록일</AdminTableHead>
          <AdminTableHead className="w-40 text-right">관리</AdminTableHead>
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {categories.map((category, index) => (
          <AdminTableRow key={category.id}>
            <AdminTableCell>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="위로 이동"
                  onClick={() => handleMove(category.id, "up")}
                  disabled={isMoving || index === 0}
                  className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="아래로 이동"
                  onClick={() => handleMove(category.id, "down")}
                  disabled={isMoving || index === categories.length - 1}
                  className="rounded p-1 text-[#6B7280] hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </AdminTableCell>
            <AdminTableCell className="font-medium">{category.name}</AdminTableCell>
            <AdminTableCell className="text-[#6B7280]">{category.slug ?? "—"}</AdminTableCell>
            <AdminTableCell className="max-w-xs truncate text-[#6B7280]">
              {category.description ?? "—"}
            </AdminTableCell>
            <AdminTableCell className="text-right text-[#6B7280]">
              {category.courseCount}
            </AdminTableCell>
            <AdminTableCell>
              <CourseCategoryActiveToggle
                categoryId={category.id}
                isActive={category.isActive}
                onChanged={(isActive) => onActiveChanged?.(category.id, isActive)}
              />
            </AdminTableCell>
            <AdminTableCell className="text-[#6B7280]">
              {formatDate(category.createdAt)}
            </AdminTableCell>
            <AdminTableCell>
              <div className="flex justify-end gap-2">
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick?.(category)}
                >
                  <Pencil className="size-4" />
                  수정
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteClick?.(category)}
                >
                  <Trash2 className="size-4" />
                  삭제
                </AdminButton>
              </div>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableBody>
    </AdminTable>
  );
}
