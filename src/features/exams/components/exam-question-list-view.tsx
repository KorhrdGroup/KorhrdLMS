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
import { ExamEditModal } from "@/features/exams/components/exam-edit-modal";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import { ExamQuestionListTable } from "@/features/exams/components/exam-question-list-table";
import { ExamQuestionListToolbar } from "@/features/exams/components/exam-question-list-toolbar";
import { buildExamQuestionPageHref } from "@/features/exams/lib/exam-question-list-query";
import type {
  ExamQuestionFilterOptions,
  ExamQuestionListItem,
  ExamQuestionListQuery,
} from "@/features/exams/types/exam-question.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type ExamQuestionListViewProps = {
  result: PaginatedResult<ExamQuestionListItem>;
  query: ExamQuestionListQuery;
  filterOptions: ExamQuestionFilterOptions;
};

export function ExamQuestionListView({
  result,
  query,
  filterOptions,
}: ExamQuestionListViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setInfoMessage(null);
    setErrorMessage(null);
    router.refresh();
  }

  function handleEditClick(item: ExamQuestionListItem) {
    setSuccessMessage(null);
    setInfoMessage(null);
    setErrorMessage(null);
    setEditExamId(item.id);
    setEditOpen(true);
  }

  function handleRegisterClick(item: ExamQuestionListItem) {
    setSuccessMessage(null);
    setInfoMessage(null);
    setErrorMessage(null);
    router.push(`/admin/exams/questions/${item.id}/items`);
  }

  function handleViewClick(item: ExamQuestionListItem) {
    setSuccessMessage(null);
    setInfoMessage(null);
    setErrorMessage(null);
    router.push(`/admin/exams/questions/${item.id}/view`);
  }

  function handlePrintChange() {
    setErrorMessage(null);
    router.refresh();
  }

  function handlePrintError(message: string) {
    setErrorMessage(message);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="시험문제 관리"
        description="과정별 시험 문제를 조회하고 관리할 수 있습니다."
      />

      <ExamSubNav />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      {infoMessage ? (
        <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#2563EB]">
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <ExamQuestionListToolbar query={query} filterOptions={filterOptions} />
          <ExamQuestionListTable
            result={result}
            onRegisterClick={handleRegisterClick}
            onViewClick={handleViewClick}
            onEditClick={handleEditClick}
            onPrintChange={handlePrintChange}
            onPrintError={handlePrintError}
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
            buildPageHref={(page) => buildExamQuestionPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <ExamEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        examId={editExamId}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
