"use client";

import type { CSSProperties } from "react";
import { useTransition } from "react";

import { CourseCategoryActiveToggle } from "@/features/course-categories/components/course-category-active-toggle";
import { moveCourseCategoryAction } from "@/features/course-categories/actions/course-category.actions";
import { M } from "@/features/courses/lib/course-design";
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

const GRID = "96px 1.3fr 1.4fr 1fr 90px 80px 110px 150px";

const headStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: GRID,
  alignItems: "center",
  gap: 12,
  borderTop: `1.5px solid ${M.ink}`,
  borderBottom: `1px solid ${M.line}`,
  padding: "11px 8px",
  fontSize: 12,
  color: M.mute,
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
      <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
        등록된 카테고리가 없습니다. 카테고리 등록 버튼으로 새 카테고리를 추가하세요.
      </div>
    );
  }

  return (
    <div>
      <div style={headStyle}>
        <span>노출순서</span>
        <span>카테고리명</span>
        <span>슬러그</span>
        <span>설명</span>
        <span style={{ textAlign: "center" }}>연결 과정</span>
        <span style={{ textAlign: "center" }}>사용여부</span>
        <span>등록일</span>
        <span style={{ textAlign: "right" }}>관리</span>
      </div>

      {categories.map((category, index) => (
        <div
          key={category.id}
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${M.line}`,
            padding: "13px 8px",
            fontSize: 13.5,
          }}
        >
          {/* 노출순서 */}
          <span style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              aria-label="위로 이동"
              onClick={() => handleMove(category.id, "up")}
              disabled={isMoving || index === 0}
              style={{
                border: "none",
                background: "none",
                fontSize: 15,
                color: index === 0 ? "#d1d1d1" : M.body,
                cursor: index === 0 ? "default" : "pointer",
                padding: 0,
              }}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="아래로 이동"
              onClick={() => handleMove(category.id, "down")}
              disabled={isMoving || index === categories.length - 1}
              style={{
                border: "none",
                background: "none",
                fontSize: 15,
                color: index === categories.length - 1 ? "#d1d1d1" : M.body,
                cursor: index === categories.length - 1 ? "default" : "pointer",
                padding: 0,
              }}
            >
              ↓
            </button>
          </span>

          <span style={{ color: M.ink, fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {category.name}
          </span>
          <span style={{ color: M.body, fontSize: 12.5, fontFamily: "ui-monospace, Menlo, monospace", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
            {category.slug ?? "—"}
          </span>
          <span style={{ color: category.description ? M.body : "#bbbbbb", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {category.description ?? "—"}
          </span>
          <span style={{ textAlign: "center", color: M.text, fontWeight: 600 }}>{category.courseCount}</span>

          <span style={{ display: "flex", justifyContent: "center" }}>
            <CourseCategoryActiveToggle
              categoryId={category.id}
              isActive={category.isActive}
              onChanged={(isActive) => onActiveChanged?.(category.id, isActive)}
            />
          </span>

          <span style={{ color: M.body, fontSize: 12.5 }}>{formatDate(category.createdAt)}</span>

          <span style={{ display: "flex", gap: 14, justifyContent: "flex-end", fontSize: 12.5, whiteSpace: "nowrap" }}>
            <button
              type="button"
              onClick={() => onEditClick?.(category)}
              style={{ border: "none", background: "none", color: M.text, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => onDeleteClick?.(category)}
              style={{ border: "none", background: "none", color: "#c0392b", cursor: "pointer", padding: 0 }}
            >
              삭제
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
