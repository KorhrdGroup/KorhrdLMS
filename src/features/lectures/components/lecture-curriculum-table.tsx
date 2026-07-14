"use client";

import { ArrowDown, ArrowUp, CheckCircle2, Pencil, Trash2, UploadCloud } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import { formatVideoDuration } from "@/features/lectures/constants";
import type { LectureSession } from "@/features/lectures/types/lecture.types";

type LectureCurriculumTableProps = {
  sessions: LectureSession[];
  onEditClick?: (session: LectureSession) => void;
  onVideoClick?: (session: LectureSession) => void;
  onMoveClick?: (session: LectureSession, direction: "up" | "down") => void;
  onDeleteClick?: (session: LectureSession) => void;
  isMoving?: boolean;
};

export function LectureCurriculumTable({
  sessions,
  onEditClick,
  onVideoClick,
  onMoveClick,
  onDeleteClick,
  isMoving,
}: LectureCurriculumTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 차시가 없습니다. 차시 추가 버튼으로 첫 차시를 등록하세요.
      </div>
    );
  }

  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow className="hover:bg-transparent">
          <AdminTableHead className="w-16">순서</AdminTableHead>
          <AdminTableHead>차시명</AdminTableHead>
          <AdminTableHead className="w-28 text-center">학습시간</AdminTableHead>
          <AdminTableHead className="w-36 text-center">영상</AdminTableHead>
          <AdminTableHead className="w-32 text-center">순서 변경</AdminTableHead>
          <AdminTableHead className="w-24 text-center">수정</AdminTableHead>
          <AdminTableHead className="w-24 text-center">삭제</AdminTableHead>
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {sessions.map((session, index) => (
          <AdminTableRow key={session.id}>
            <AdminTableCell className="text-[#6B7280]">
              {session.order}차시
            </AdminTableCell>
            <AdminTableCell className="font-medium">{session.title}</AdminTableCell>
            <AdminTableCell className="text-center text-[#6B7280]">
              {session.durationMinutes != null ? `${session.durationMinutes}분` : "-"}
            </AdminTableCell>
            <AdminTableCell className="text-center">
              {session.videoUrl ? (
                <button
                  type="button"
                  onClick={() => onVideoClick?.(session)}
                  className="inline-flex flex-col items-center gap-0.5 rounded-md bg-[#ECFDF5] px-2 py-1 text-left transition-colors hover:bg-[#D1FAE5]"
                  title={session.videoFileName ?? session.videoUrl}
                >
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#047857]">
                    <CheckCircle2 className="size-3.5" />
                    업로드완료
                  </span>
                  <span className="max-w-[110px] truncate text-[10px] text-[#059669]">
                    {session.videoFileName ?? "외부 URL"}
                    {session.videoDurationSeconds
                      ? ` · ${formatVideoDuration(session.videoDurationSeconds)}`
                      : ""}
                  </span>
                </button>
              ) : (
                <AdminButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onVideoClick?.(session)}
                >
                  <UploadCloud className="size-3.5" />
                  영상 업로드
                </AdminButton>
              )}
            </AdminTableCell>
            <AdminTableCell>
              <div className="flex items-center justify-center gap-1">
                <AdminButton
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isMoving || index === 0}
                  aria-label="위로 이동"
                  onClick={() => onMoveClick?.(session, "up")}
                >
                  <ArrowUp className="size-4" />
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isMoving || index === sessions.length - 1}
                  aria-label="아래로 이동"
                  onClick={() => onMoveClick?.(session, "down")}
                >
                  <ArrowDown className="size-4" />
                </AdminButton>
              </div>
            </AdminTableCell>
            <AdminTableCell className="text-center">
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEditClick?.(session)}
              >
                <Pencil className="size-4" />
                수정
              </AdminButton>
            </AdminTableCell>
            <AdminTableCell className="text-center">
              <AdminButton
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDeleteClick?.(session)}
              >
                <Trash2 className="size-4" />
                삭제
              </AdminButton>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableBody>
    </AdminTable>
  );
}
