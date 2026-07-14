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
import { AssignmentDeleteConfirmModal } from "@/features/assignment-management/components/assignment-delete-confirm-modal";
import { AssignmentEditModal } from "@/features/assignment-management/components/assignment-edit-modal";
import { AssignmentListTable } from "@/features/assignment-management/components/assignment-list-table";
import { AssignmentListToolbar } from "@/features/assignment-management/components/assignment-list-toolbar";
import { AssignmentRegistrationModal } from "@/features/assignment-management/components/assignment-registration-modal";
import { buildAssignmentPageHref } from "@/features/assignment-management/lib/assignment-list-query";
import type {
  AssignmentFilterOptions,
  AssignmentListItem,
  AssignmentListQuery,
} from "@/features/assignment-management/types/assignment.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type AssignmentListViewProps = {
  result: PaginatedResult<AssignmentListItem>;
  query: AssignmentListQuery;
  filterOptions: AssignmentFilterOptions;
};

export function AssignmentListView({
  result,
  query,
  filterOptions,
}: AssignmentListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editAssignmentId, setEditAssignmentId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AssignmentListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(assignment: AssignmentListItem) {
    setSuccessMessage(null);
    setEditAssignmentId(assignment.id);
    setEditOpen(true);
  }

  function handleDeleteClick(assignment: AssignmentListItem) {
    setSuccessMessage(null);
    setDeleteTarget(assignment);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="과제관리"
        description="과정에 연결된 과제를 등록하고 제출물을 채점할 수 있습니다."
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <AssignmentListToolbar
            query={query}
            filterOptions={filterOptions}
            onRegisterClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          />
          <AssignmentListTable
            result={result}
            onEditClick={handleEditClick}
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
            buildPageHref={(page) => buildAssignmentPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <AssignmentRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <AssignmentEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        assignmentId={editAssignmentId}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <AssignmentDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        assignmentId={deleteTarget?.id ?? null}
        assignmentTitle={deleteTarget?.title ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
