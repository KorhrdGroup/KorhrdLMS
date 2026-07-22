"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";

import { M } from "@/features/courses/lib/course-design";
import { ExamQuestionItemDeleteConfirmModal } from "@/features/exams/components/exam-question-item-delete-confirm-modal";
import { ExamQuestionItemFormModal } from "@/features/exams/components/exam-question-item-form-modal";
import { ExamQuestionItemListTable } from "@/features/exams/components/exam-question-item-list-table";
import { ExamQuestionItemSummary } from "@/features/exams/components/exam-question-item-summary";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import type {
  ExamQuestionItem,
  ExamQuestionManageSummary,
} from "@/features/exams/types/exam-question-item.types";

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
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            과정관리 <span style={{ margin: "0 4px" }}>/</span>
            시험문제 관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>문제등록</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>문제등록</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            시험 문제를 등록하고 관리할 수 있습니다
          </div>
        </div>

        <Link
          href="/admin/exams/questions"
          style={{
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            padding: "0 16px",
            borderRadius: 8,
            background: "#fff",
            border: `1px solid ${M.border}`,
            color: M.text,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          목록으로
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ExamSubNav />
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: "#fdecee", color: M.danger, padding: "10px 14px", fontSize: 13 }}>
          {errorMessage}
        </div>
      ) : null}

      <div style={{ marginBottom: 20 }}>
        <ExamQuestionItemSummary summary={summary} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 16 }}>
        <button
          type="button"
          onClick={handleRegisterClick}
          style={{
            height: 38,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 18px",
            borderRadius: 8,
            background: M.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: 16, height: 16 }} />
          문제등록
        </button>
      </div>

      <ExamQuestionItemListTable
        questions={questions}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

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
