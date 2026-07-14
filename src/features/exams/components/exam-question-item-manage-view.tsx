"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/admin-button";
import { AdminCard, AdminCardContent } from "@/components/admin/ui/admin-card";
import { ExamQuestionItemDeleteConfirmModal } from "@/features/exams/components/exam-question-item-delete-confirm-modal";
import { ExamQuestionItemFormModal } from "@/features/exams/components/exam-question-item-form-modal";
import { ExamQuestionItemListTable } from "@/features/exams/components/exam-question-item-list-table";
import { ExamQuestionItemSummary } from "@/features/exams/components/exam-question-item-summary";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import type {
  ExamQuestionItem,
  ExamQuestionManageSummary,
} from "@/features/exams/types/exam-question-item.types";
import { cn } from "@/lib/utils";

type ExamQuestionItemManageViewProps = {
  summary: ExamQuestionManageSummary;
  questions: ExamQuestionItem[];
};

export function ExamQuestionItemManageView({
  summary,
  questions,
}: ExamQuestionItemManageViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamQuestionItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setErrorMessage(null);
    router.refresh();
  }

  function handleRegisterClick() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditQuestionId(null);
    setFormOpen(true);
  }

  function handleEditClick(item: ExamQuestionItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditQuestionId(item.id);
    setFormOpen(true);
  }

  function handleDeleteClick(item: ExamQuestionItem) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDeleteTarget(item);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="문제등록"
        description="시험 문제를 등록하고 관리할 수 있습니다."
        actions={
          <Link
            href="/admin/exams/questions"
            className={cn(adminButtonVariants({ variant: "outline" }))}
          >
            목록으로
          </Link>
        }
      />

      <ExamSubNav />

      {successMessage ? (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#059669]">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : null}

      <ExamQuestionItemSummary summary={summary} />

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <div className="flex justify-end">
            <AdminButton type="button" onClick={handleRegisterClick}>
              <Plus className="size-4" />
              문제등록
            </AdminButton>
          </div>

          <ExamQuestionItemListTable
            questions={questions}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </AdminCardContent>
      </AdminCard>

      <ExamQuestionItemFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        examId={summary.examId}
        questionId={editQuestionId}
        onSuccess={handleActionSuccess}
      />

      <ExamQuestionItemDeleteConfirmModal
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
