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
import { LectureDeleteConfirmModal } from "@/features/lectures/components/lecture-delete-confirm-modal";
import { LectureEditModal } from "@/features/lectures/components/lecture-edit-modal";
import { LectureListTable } from "@/features/lectures/components/lecture-list-table";
import { LectureListToolbar } from "@/features/lectures/components/lecture-list-toolbar";
import { LectureRegistrationModal } from "@/features/lectures/components/lecture-registration-modal";
import { buildLecturePageHref } from "@/features/lectures/lib/lecture-list-query";
import type {
  LectureFilterOptions,
  LectureListItem,
  LectureListQuery,
} from "@/features/lectures/types/lecture.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type LectureListViewProps = {
  result: PaginatedResult<LectureListItem>;
  query: LectureListQuery;
  filterOptions: LectureFilterOptions;
};

export function LectureListView({
  result,
  query,
  filterOptions,
}: LectureListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLectureId, setEditLectureId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LectureListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(lecture: LectureListItem) {
    setSuccessMessage(null);
    setEditLectureId(lecture.id);
    setEditOpen(true);
  }

  function handleDeleteClick(lecture: LectureListItem) {
    setSuccessMessage(null);
    setDeleteTarget(lecture);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="차시관리"
        description="과정에 연결된 강의를 등록하고 차시를 관리할 수 있습니다."
      />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <LectureListToolbar
            query={query}
            filterOptions={filterOptions}
            onRegisterClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          />
          <LectureListTable
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
            buildPageHref={(page) => buildLecturePageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <LectureRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <LectureEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        lectureId={editLectureId}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <LectureDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        lectureId={deleteTarget?.id ?? null}
        lectureTitle={deleteTarget?.title ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
