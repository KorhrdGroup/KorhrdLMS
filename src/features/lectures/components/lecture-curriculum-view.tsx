"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { adminButtonVariants, AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/admin-card";
import { moveLectureSessionAction } from "@/features/lectures/actions/lecture-curriculum.actions";
import { LectureCurriculumTable } from "@/features/lectures/components/lecture-curriculum-table";
import { LectureStatusBadge } from "@/features/lectures/components/lecture-status-badge";
import { LectureSessionDeleteConfirmModal } from "@/features/lectures/components/lecture-session-delete-confirm-modal";
import { LectureSessionFormModal } from "@/features/lectures/components/lecture-session-form-modal";
import { LectureVideoUploadModal } from "@/features/lectures/components/lecture-video-upload-modal";
import type { LectureCurriculumSummary } from "@/features/lectures/types/lecture-curriculum.types";
import type { LectureSession } from "@/features/lectures/types/lecture.types";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <AdminPageHeader
        title={`${summary.lectureTitle} 차시 관리`}
        description="강의의 차시를 추가하고 순서를 관리할 수 있습니다."
        actions={
          <Link
            href="/admin/lectures"
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
          <AdminCardTitle className="text-base">강의 정보</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="grid gap-4 pt-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-[#9CA3AF]">연결 과정</p>
            <p className="text-sm font-medium text-[#111827]">{summary.courseName}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">상태</p>
            <LectureStatusBadge isPublished={summary.isPublished} className="mt-0.5" />
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">총 차시수</p>
            <p className="text-sm font-medium text-[#111827]">
              {summary.sessionCount}차시
            </p>
          </div>
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#9CA3AF]">
              MP4 파일을 Supabase Storage에 업로드하거나 외부 CDN 영상 URL을 등록할 수 있습니다.
            </p>
            <AdminButton type="button" onClick={handleAddClick}>
              <Plus className="size-4" />
              차시 추가
            </AdminButton>
          </div>

          <LectureCurriculumTable
            sessions={sessions}
            onEditClick={handleEditClick}
            onVideoClick={handleVideoClick}
            onMoveClick={handleMoveClick}
            onDeleteClick={handleDeleteClick}
            isMoving={isMoving}
          />
        </AdminCardContent>
      </AdminCard>

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
