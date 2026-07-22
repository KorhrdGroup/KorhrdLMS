"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
import { CourseDeleteConfirmModal } from "@/features/courses/components/course-delete-confirm-modal";
import { CourseEditModal } from "@/features/courses/components/course-edit-modal";
import { CourseEnrolledStudentsModal } from "@/features/courses/components/course-enrolled-students-modal";
import { CourseListTable } from "@/features/courses/components/course-list-table";
import { CourseListToolbar } from "@/features/courses/components/course-list-toolbar";
import { CourseRegistrationModal } from "@/features/courses/components/course-registration-modal";
import { buildCoursePageHref } from "@/features/courses/lib/course-list-query";
import type { CourseListQuery } from "@/features/courses/services/course-list.service";
import type { CourseListItem } from "@/features/courses/types/course.types";
import type { CourseCategoryOption } from "@/features/course-categories/types/course-category.types";
import type { ListQuery, PaginatedResult } from "@/lib/shared/list-query";

type CourseListViewProps = {
  result: PaginatedResult<CourseListItem>;
  query: CourseListQuery;
  categoryOptions: CourseCategoryOption[];
};

export function CourseListView({ result, query, categoryOptions }: CourseListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CourseListItem | null>(null);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentsTarget, setStudentsTarget] = useState<CourseListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(course: CourseListItem) {
    setSuccessMessage(null);
    setEditCourseId(course.id);
    setEditOpen(true);
  }

  function handleDeleteClick(course: CourseListItem) {
    setSuccessMessage(null);
    setDeleteTarget(course);
    setDeleteOpen(true);
  }

  function handleViewStudentsClick(course: CourseListItem) {
    setStudentsTarget(course);
    setStudentsOpen(true);
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
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            과정관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>과정목록</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>과정 목록</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            운영 중인 과정을 조회하고 새 과정을 등록할 수 있습니다 · 총 {result.total}개
          </div>
        </div>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <CourseListToolbar
        query={query}
        onRegisterClick={() => {
          setSuccessMessage(null);
          setRegisterOpen(true);
        }}
      />

      <CourseListTable
        result={result}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onViewStudentsClick={handleViewStudentsClick}
      />

      <div style={{ marginTop: 20 }}>
        <AdminListPagination
          page={result.page}
          totalPages={result.totalPages}
          totalItems={result.total}
          pageSize={result.pageSize}
          query={query as ListQuery}
          buildPageHref={(page) => buildCoursePageHref(page, query)}
          className="w-full"
        />
      </div>

      <CourseRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        categoryOptions={categoryOptions}
        onSuccess={handleActionSuccess}
      />
      <CourseEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        courseId={editCourseId}
        categoryOptions={categoryOptions}
        onSuccess={handleActionSuccess}
      />
      <CourseDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        courseId={deleteTarget?.id ?? null}
        courseName={deleteTarget?.name ?? ""}
        onDeleted={handleActionSuccess}
      />
      <CourseEnrolledStudentsModal
        open={studentsOpen}
        onOpenChange={setStudentsOpen}
        courseId={studentsTarget?.id ?? null}
        courseName={studentsTarget?.name}
      />
    </div>
  );
}
