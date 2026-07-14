"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  addLectureSessionAction,
  getLectureSessionAction,
  renameLectureSessionAction,
} from "@/features/lectures/actions/lecture-curriculum.actions";
import { LectureFormField } from "@/features/lectures/components/lecture-form-field";

type LectureSessionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string;
  sessionId?: string | null;
  onSuccess?: (message: string) => void;
};

export function LectureSessionFormModal({
  open,
  onOpenChange,
  lectureId,
  sessionId = null,
  onSuccess,
}: LectureSessionFormModalProps) {
  const isEditMode = !!sessionId;
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!sessionId) {
      setTitle("");
      setDurationMinutes("");
      setError(null);
      return;
    }

    startLoad(async () => {
      setError(null);

      try {
        const result = await getLectureSessionAction(lectureId, sessionId);

        if (!result.success) {
          setError(result.message);
          return;
        }

        setTitle(result.session.title);
        setDurationMinutes(
          result.session.durationMinutes != null ? String(result.session.durationMinutes) : "",
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "차시 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, lectureId, sessionId]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTitle("");
      setDurationMinutes("");
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setError(null);

      const trimmedDuration = durationMinutes.trim();
      const parsedDuration = trimmedDuration ? Number(trimmedDuration) : null;

      if (trimmedDuration && (!Number.isFinite(parsedDuration) || (parsedDuration ?? 0) <= 0)) {
        setError("학습시간은 1 이상의 숫자(분)로 입력해주세요.");
        return;
      }

      try {
        const result = isEditMode
          ? await renameLectureSessionAction(lectureId, sessionId!, title, parsedDuration)
          : await addLectureSessionAction(lectureId, title, parsedDuration);

        if (!result.success) {
          setError(result.message);
          return;
        }

        handleOpenChange(false);
        onSuccess?.(result.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "차시 저장에 실패했습니다.");
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "차시 수정" : "차시 추가"}
      description={
        isEditMode
          ? "차시명을 수정하세요."
          : "새 차시명을 입력하세요. 새 차시는 마지막 순서로 추가됩니다."
      }
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
          <AdminButton
            type="submit"
            form="lecture-session-form"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[120px] items-center justify-center text-sm text-[#6B7280]">
          차시 정보를 불러오는 중...
        </div>
      ) : (
        <form id="lecture-session-form" className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </p>
          ) : null}

          <LectureFormField label="차시명" htmlFor="lecture-session-title" required>
            <AdminInput
              id="lecture-session-title"
              variant="outline"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 1강. 과정 소개와 오리엔테이션"
              autoFocus
            />
          </LectureFormField>

          <LectureFormField label="학습시간(분)" htmlFor="lecture-session-duration">
            <AdminInput
              id="lecture-session-duration"
              variant="outline"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              placeholder="예: 30"
            />
          </LectureFormField>

          <p className="text-xs text-[#9CA3AF]">
            영상은 저장 후 차시 목록의 &quot;영상 업로드&quot; 버튼에서 등록할 수 있습니다.
          </p>
        </form>
      )}
    </AdminModal>
  );
}
