"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
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
          <span style={{ color: M.ink, fontWeight: 600 }}>시험문제 관리</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>시험문제 관리</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          과정별 시험 문제를 조회하고 관리할 수 있습니다 · 총 {result.total}개
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

      {infoMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: "#fdecee", color: M.danger, padding: "10px 14px", fontSize: 13 }}>
          {errorMessage}
        </div>
      ) : null}

      <ExamQuestionListToolbar query={query} filterOptions={filterOptions} />

      <ExamQuestionListTable
        result={result}
        onRegisterClick={handleRegisterClick}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        onPrintChange={handlePrintChange}
        onPrintError={handlePrintError}
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
          buildPageHref={(page) => buildExamQuestionPageHref(page, query)}
          className="w-full"
        />
      </div>

      <ExamEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        examId={editExamId}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
