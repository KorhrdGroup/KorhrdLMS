"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { ClassDeleteConfirmModal } from "@/features/enrollments/components/class-delete-confirm-modal";
import { ClassDetailModal } from "@/features/enrollments/components/class-detail-modal";
import { ClassEditModal } from "@/features/enrollments/components/class-edit-modal";
import { ClassListTable } from "@/features/enrollments/components/class-list-table";
import { ClassListToolbar } from "@/features/enrollments/components/class-list-toolbar";
import { ClassRegistrationModal } from "@/features/enrollments/components/class-registration-modal";
import { EnrollmentSubNav } from "@/features/enrollments/components/enrollment-sub-nav";
import { buildClassPageHref } from "@/features/enrollments/lib/class-list-query";
import type {
  ClassFilterOptions,
  ClassListItem,
  ClassListQuery,
} from "@/features/enrollments/types/class.types";
import type { ClassDeleteTarget } from "@/features/enrollments/types/class-delete.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ClassListViewProps = {
  result: PaginatedResult<ClassListItem>;
  query: ClassListQuery;
  filterOptions: ClassFilterOptions;
};

export function ClassListView({
  result,
  query,
  filterOptions,
}: ClassListViewProps) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClassId, setDetailClassId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassDeleteTarget | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(classId: string) {
    setSuccessMessage(null);
    setEditClassId(classId);
    setEditOpen(true);
  }

  function handleDeleteClick(item: ClassListItem) {
    setSuccessMessage(null);
    setDeleteTarget({
      id: item.id,
      courseName: item.courseName,
      batchName: item.batchName,
      year: item.year,
    });
    setDeleteOpen(true);
  }

  function handleDeleteFromDetail(target: ClassDeleteTarget) {
    setSuccessMessage(null);
    setDeleteTarget(target);
    setDeleteOpen(true);
  }

  function handleDetailClick(item: ClassListItem) {
    setSuccessMessage(null);
    setDetailClassId(item.id);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="수강반 관리"
        description="과정별 수강반을 조회하고 관리할 수 있습니다."
        actions={
          <AdminButton
            type="button"
            onClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          >
            <Plus className="size-4" />
            반 등록
          </AdminButton>
        }
      />

      <EnrollmentSubNav />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <ClassListToolbar query={query} filterOptions={filterOptions} />
          <ClassListTable
            result={result}
            onDetailClick={handleDetailClick}
            onDeleteClick={handleDeleteClick}
          />
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={{
              page: query.page,
              pageSize: query.pageSize,
              search: "",
              field: "all",
            }}
            buildPageHref={(page) => buildClassPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <ClassRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={handleActionSuccess}
      />

      <ClassDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        classId={detailClassId}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteFromDetail}
      />
      <ClassEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        classId={editClassId}
        onSuccess={handleActionSuccess}
      />
      <ClassDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
