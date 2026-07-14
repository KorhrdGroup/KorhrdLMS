"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { moveExamQuestionAction } from "@/features/exam-management/actions/exam-question.actions";
import { ExamQuestionDeleteConfirmModal } from "@/features/exam-management/components/exam-question-delete-confirm-modal";
import { ExamQuestionFormModal } from "@/features/exam-management/components/exam-question-form-modal";
import { ExamQuestionTable } from "@/features/exam-management/components/exam-question-table";
import { ExamStatusBadge } from "@/features/exam-management/components/exam-status-badge";
import type { ExamQuestionSummary } from "@/features/exam-management/types/exam-question-form.types";
import type { ExamQuestion } from "@/features/exam-management/types/exam.types";
import { cn } from "@/lib/utils";

type ExamQuestionManageViewProps = {
  summary: ExamQuestionSummary;
  questions: ExamQuestion[];
};

export function ExamQuestionManageView({
  summary,
  questions,
}: ExamQuestionManageViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExamQuestion | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMoving, startMove] = useTransition();

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    setErrorMessage(null);
    router.refresh();
  }

  function handleAddClick() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditQuestionId(null);
    setFormOpen(true);
  }

  function handleEditClick(question: ExamQuestion) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditQuestionId(question.id);
    setFormOpen(true);
  }

  function handleDeleteClick(question: ExamQuestion) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDeleteTarget(question);
    setDeleteOpen(true);
  }

  function handleMoveClick(question: ExamQuestion, direction: "up" | "down") {
    setSuccessMessage(null);
    setErrorMessage(null);

    startMove(async () => {
      try {
        const result = await moveExamQuestionAction(summary.examId, question.id, direction);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "순서 변경에 실패했습니다.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${summary.examTitle} 문제관리`}
        description="시험 문제를 추가하고 보기·정답·배점·순서를 관리할 수 있습니다."
        actions={
          <Link
            href="/admin/exams"
            className={cn(adminButtonVariants({ variant: "outline" }))}
          >
            목록으로
          </Link>
        }
      />

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

      <AdminCard>
        <AdminCardHeader className="border-0 pb-0">
          <AdminCardTitle className="text-base">시험 정보</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="grid gap-4 pt-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[#9CA3AF]">연결 과정</p>
            <p className="text-sm font-medium text-[#111827]">{summary.courseName}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">상태</p>
            <ExamStatusBadge isPublished={summary.isPublished} className="mt-0.5" />
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">총 문제수 / 총 배점</p>
            <p className="text-sm font-medium text-[#111827]">
              {summary.questionCount}문항 / {summary.totalScore}점
            </p>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <div className="flex justify-end">
            <AdminButton type="button" onClick={handleAddClick}>
              <Plus className="size-4" />
              문제 추가
            </AdminButton>
          </div>

          <ExamQuestionTable
            questions={questions}
            onEditClick={handleEditClick}
            onMoveClick={handleMoveClick}
            onDeleteClick={handleDeleteClick}
            isMoving={isMoving}
          />
        </AdminCardContent>
      </AdminCard>

      <ExamQuestionFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditQuestionId(null);
          }
        }}
        examId={summary.examId}
        questionId={editQuestionId}
        onSuccess={handleActionSuccess}
      />

      <ExamQuestionDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        examId={summary.examId}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
