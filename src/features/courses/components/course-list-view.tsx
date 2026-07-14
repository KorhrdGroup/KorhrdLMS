"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
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
    <div className="space-y-6">
      <AdminPageHeader
        title="과정 목록"
        description="운영 중인 과정을 조회하고 새 과정을 등록할 수 있습니다."
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
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
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={query as ListQuery}
            buildPageHref={(page) => buildCoursePageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

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
