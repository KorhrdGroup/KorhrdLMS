"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { moveExamQuestionAction } from "@/features/exam-management/actions/exam-question.actions";
import { ExamQuestionDeleteConfirmModal } from "@/features/exam-management/components/exam-question-delete-confirm-modal";
import { ExamQuestionFormModal } from "@/features/exam-management/components/exam-question-form-modal";
import { ExamQuestionTable } from "@/features/exam-management/components/exam-question-table";
import { ExamStatusBadge } from "@/features/exam-management/components/exam-status-badge";
import type { ExamQuestionSummary } from "@/features/exam-management/types/exam-question-form.types";
import type { ExamQuestion } from "@/features/exam-management/types/exam.types";

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
            시험관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>문제관리</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>{summary.examTitle} 문제관리</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            시험 문제를 추가하고 보기·정답·배점·순서를 관리할 수 있습니다
          </div>
        </div>

        <Link
          href="/admin/exams"
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

      {/* 시험 정보 */}
      <div
        style={{
          marginBottom: 20,
          borderRadius: 10,
          border: `1px solid ${M.border}`,
          background: M.hover,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: M.ink, marginBottom: 14 }}>시험 정보</div>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <div>
            <div style={{ fontSize: 12, color: M.mute }}>연결 과정</div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: M.ink }}>{summary.courseName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: M.mute }}>상태</div>
            <div style={{ marginTop: 6 }}>
              <ExamStatusBadge isPublished={summary.isPublished} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: M.mute }}>총 문제수 / 총 배점</div>
            <div style={{ marginTop: 4, fontSize: 14, fontWeight: 600, color: M.ink }}>
              {summary.questionCount}문항 / {summary.totalScore}점
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 16 }}>
        <button
          type="button"
          onClick={handleAddClick}
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
          문제 추가
        </button>
      </div>

      <ExamQuestionTable
        questions={questions}
        onEditClick={handleEditClick}
        onMoveClick={handleMoveClick}
        onDeleteClick={handleDeleteClick}
        isMoving={isMoving}
      />

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
