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
import { ExamDeleteConfirmModal } from "@/features/exam-management/components/exam-delete-confirm-modal";
import { ExamEditModal } from "@/features/exam-management/components/exam-edit-modal";
import { ExamListTable } from "@/features/exam-management/components/exam-list-table";
import { ExamListToolbar } from "@/features/exam-management/components/exam-list-toolbar";
import { ExamRegistrationModal } from "@/features/exam-management/components/exam-registration-modal";
import { buildExamPageHref } from "@/features/exam-management/lib/exam-list-query";
import type {
  ExamFilterOptions,
  ExamListItem,
  ExamListQuery,
} from "@/features/exam-management/types/exam.types";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ExamListViewProps = {
  result: PaginatedResult<ExamListItem>;
  query: ExamListQuery;
  filterOptions: ExamFilterOptions;
};

export function ExamListView({ result, query, filterOptions }: ExamListViewProps) {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamListItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleEditClick(exam: ExamListItem) {
    setSuccessMessage(null);
    setEditExamId(exam.id);
    setEditOpen(true);
  }

  function handleDeleteClick(exam: ExamListItem) {
    setSuccessMessage(null);
    setDeleteTarget(exam);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="시험관리"
        description="강의에 연결된 온라인 시험을 등록하고 문제를 관리할 수 있습니다."
      />

      <ExamSubNav />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <ExamListToolbar
            query={query}
            filterOptions={filterOptions}
            onRegisterClick={() => {
              setSuccessMessage(null);
              setRegisterOpen(true);
            }}
          />
          <ExamListTable
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
            buildPageHref={(page) => buildExamPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <ExamRegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <ExamEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        examId={editExamId}
        filterOptions={filterOptions}
        onSuccess={handleActionSuccess}
      />
      <ExamDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        examId={deleteTarget?.id ?? null}
        examTitle={deleteTarget?.title ?? ""}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
