"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { moveLectureSessionAction } from "@/features/lectures/actions/lecture-curriculum.actions";
import { LectureCurriculumTable } from "@/features/lectures/components/lecture-curriculum-table";
import { LectureStatusBadge } from "@/features/lectures/components/lecture-status-badge";
import { LectureSessionDeleteConfirmModal } from "@/features/lectures/components/lecture-session-delete-confirm-modal";
import { LectureSessionFormModal } from "@/features/lectures/components/lecture-session-form-modal";
import { LectureVideoUploadModal } from "@/features/lectures/components/lecture-video-upload-modal";
import { M } from "@/features/courses/lib/course-design";
import type { LectureCurriculumSummary } from "@/features/lectures/types/lecture-curriculum.types";
import type { LectureSession } from "@/features/lectures/types/lecture.types";

type LectureCurriculumViewProps = {
  summary: LectureCurriculumSummary;
  sessions: LectureSession[];
};

export function LectureCurriculumView({
  summary,
  sessions,
}: LectureCurriculumViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoTarget, setVideoTarget] = useState<LectureSession | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LectureSession | null>(null);
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
    setEditSessionId(null);
    setFormOpen(true);
  }

  function handleEditClick(session: LectureSession) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditSessionId(session.id);
    setFormOpen(true);
  }

  function handleDeleteClick(session: LectureSession) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setDeleteTarget(session);
    setDeleteOpen(true);
  }

  function handleVideoClick(session: LectureSession) {
    setSuccessMessage(null);
    setErrorMessage(null);
    setVideoTarget(session);
    setVideoOpen(true);
  }

  function handleMoveClick(session: LectureSession, direction: "up" | "down") {
    setSuccessMessage(null);
    setErrorMessage(null);

    startMove(async () => {
      try {
        const result = await moveLectureSessionAction(
          summary.lectureId,
          session.id,
          direction,
        );

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
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            과정관리 <span style={{ margin: "0 4px" }}>/</span>
            <Link href="/admin/lectures" style={{ color: M.mute }}>차시관리</Link>
            <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>차시 상세</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>{summary.lectureTitle}</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            강의의 차시를 추가하고 순서를 관리할 수 있습니다.
          </div>
        </div>
        <Link
          href="/admin/lectures"
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            border: `1px solid ${M.border}`,
            background: "#fff",
            color: M.text,
            textDecoration: "none",
          }}
        >
          ← 목록으로
        </Link>
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: "#fdeaec", color: M.danger, padding: "10px 14px", fontSize: 13 }}>
          {errorMessage}
        </div>
      ) : null}

      {/* 강의 정보 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0 32px",
          borderTop: `1.5px solid ${M.ink}`,
          borderBottom: `1px solid ${M.line}`,
          padding: "14px 4px",
          marginBottom: 26,
        }}
      >
        <div>
          <p style={{ fontSize: 12, color: M.mute, margin: "0 0 4px" }}>연결 과정</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: M.ink, margin: 0 }}>{summary.courseName}</p>
        </div>
        <div>
          <p style={{ fontSize: 12, color: M.mute, margin: "0 0 4px" }}>상태</p>
          <LectureStatusBadge isPublished={summary.isPublished} />
        </div>
        <div>
          <p style={{ fontSize: 12, color: M.mute, margin: "0 0 4px" }}>총 차시수</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: M.ink, margin: 0 }}>{summary.sessionCount}차시</p>
        </div>
      </div>

      {/* 차시 목록 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: M.mute, margin: 0 }}>
          MP4 파일을 Supabase Storage에 업로드하거나 외부 CDN 영상 URL을 등록할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={handleAddClick}
          style={{
            height: 38,
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
          + 차시 추가
        </button>
      </div>

      <LectureCurriculumTable
        sessions={sessions}
        onEditClick={handleEditClick}
        onVideoClick={handleVideoClick}
        onMoveClick={handleMoveClick}
        onDeleteClick={handleDeleteClick}
        isMoving={isMoving}
      />

      <LectureSessionFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditSessionId(null);
          }
        }}
        lectureId={summary.lectureId}
        sessionId={editSessionId}
        onSuccess={handleActionSuccess}
      />

      <LectureVideoUploadModal
        open={videoOpen}
        onOpenChange={(open) => {
          setVideoOpen(open);
          if (!open) {
            setVideoTarget(null);
          }
        }}
        lectureId={summary.lectureId}
        session={videoTarget}
        onSuccess={handleActionSuccess}
      />

      <LectureSessionDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        lectureId={summary.lectureId}
        target={deleteTarget}
        onDeleted={handleActionSuccess}
      />
    </div>
  );
}
