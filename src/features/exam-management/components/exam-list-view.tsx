"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
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
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          과정관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>시험관리</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>시험관리</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          강의에 연결된 온라인 시험을 등록하고 문제를 관리할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ExamSubNav />
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

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

      <div style={{ marginTop: 20 }}>
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
      </div>

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
