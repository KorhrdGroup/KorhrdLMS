"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, ListVideo, PlayCircle } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import {
  completeLectureSessionAction,
  saveLectureVideoProgressAction,
} from "@/features/classroom-lectures/actions/lecture-progress.actions";
import {
  CLASSROOM_LECTURE_STATUS_BADGE_CLASS,
  CLASSROOM_LECTURE_STATUS_LABEL,
  VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS,
} from "@/features/classroom-lectures/constants";
import type { ClassroomLectureSession } from "@/features/classroom-lectures/types/classroom-lecture.types";
import { cn } from "@/lib/utils";

export function LecturePlayerBoard({
  slug,
  courseTitle,
  session,
  prevOrder,
  nextOrder,
}: {
  slug: string;
  courseTitle: string;
  session: ClassroomLectureSession;
  prevOrder: number | null;
  nextOrder: number | null;
}) {
  const [status, setStatus] = useState(session.status);
  const [progressPercent, setProgressPercent] = useState(session.videoProgressPercent ?? 0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSavedAtRef = useRef(0);
  const hasSeekedRef = useRef(false);

  const completed = status === "completed";
  const hasVideo = Boolean(session.videoUrl);

  function handleComplete() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await completeLectureSessionAction(slug, session.order);

        if (!result.success) {
          setError(result.message);
          return;
        }

        setStatus("completed");
        setProgressPercent(100);
        setCourseCompleted(result.courseCompleted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "학습 완료 처리에 실패했습니다.");
      }
    });
  }

  function saveVideoProgress(currentTime: number, duration: number) {
    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    saveLectureVideoProgressAction(slug, session.order, currentTime, duration)
      .then((result) => {
        if (!result.success) {
          return;
        }

        setProgressPercent(result.progressPercent);
        if (result.status === "completed") {
          setStatus("completed");
          if (result.courseCompleted) {
            setCourseCompleted(true);
          }
        }
      })
      .catch(() => {
        // 진도율 저장 실패는 재생 자체를 막지 않고 다음 주기에 다시 시도합니다.
      });
  }

  function handleLoadedMetadata(event: React.SyntheticEvent<HTMLVideoElement>) {
    if (hasSeekedRef.current) {
      return;
    }
    hasSeekedRef.current = true;

    const resumeAt = session.resumePositionSeconds ?? 0;
    const video = event.currentTarget;
    if (resumeAt > 0 && resumeAt < video.duration) {
      video.currentTime = resumeAt;
    }
  }

  function handleTimeUpdate(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    const now = video.currentTime;

    if (now - lastSavedAtRef.current < VIDEO_PROGRESS_SAVE_INTERVAL_SECONDS) {
      return;
    }

    lastSavedAtRef.current = now;
    saveVideoProgress(now, video.duration);
  }

  function handlePause(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    saveVideoProgress(video.currentTime, video.duration);
  }

  function handleEnded(event: React.SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    saveVideoProgress(video.duration, video.duration);
  }

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1.5 text-[13px] font-semibold" style={{ color: figma.colors.primary }}>
        {courseTitle}
      </p>
      <h2 className={cn("mb-4 text-[19px] font-bold sm:text-[21px]", figmaClass.textPrimary)}>
        {session.order}차시. {session.title}
      </h2>

      <div className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {hasVideo ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={session.id}
            src={session.videoUrl ?? undefined}
            controls
            controlsList="nodownload"
            className="aspect-video w-full bg-black"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPause={handlePause}
            onEnded={handleEnded}
          />
        ) : (
          <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 bg-[#3d4148] px-6 text-center">
            <PlayCircle className="size-10 text-white/60" />
            <p className="text-[13px] font-medium leading-relaxed text-white/85">
              아직 등록된 영상이 없습니다. 관리자가 영상을 등록하면 이 화면에서 바로 재생됩니다.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("shrink-0 text-[13px] font-semibold", figmaClass.textSub)}>학습시간</span>
            <span className={cn("text-[13px]", figmaClass.textBody)}>
              {session.durationMinutes != null ? `${session.durationMinutes}분` : "안내 예정"}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                CLASSROOM_LECTURE_STATUS_BADGE_CLASS[status],
              )}
            >
              {CLASSROOM_LECTURE_STATUS_LABEL[status]}
            </span>
            {hasVideo ? (
              <span className={cn("text-[12px]", figmaClass.textPlaceholder)}>
                시청 진도율 {progressPercent}%
              </span>
            ) : null}
          </div>

          {error ? <p className="text-[12.5px] text-[#EF4444]">{error}</p> : null}

          {courseCompleted ? (
            <p className="rounded-lg bg-[#e6f6ec] px-4 py-3 text-[12.5px] font-semibold text-[#1a7d3c]">
              축하합니다! 이 과정의 모든 차시를 완료했습니다.
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5 border-t pt-4" style={{ borderColor: figma.colors.border }}>
            <p className={cn("text-[12.5px]", figmaClass.textPlaceholder)}>
              {hasVideo
                ? "영상을 끝까지 시청하면 자동으로 학습 완료 처리됩니다. 직접 완료 처리하려면 아래 버튼을 눌러주세요."
                : "영상이 등록되기 전까지는 아래 버튼으로 이 차시의 학습 완료를 기록할 수 있습니다."}
            </p>
            <button
              type="button"
              onClick={handleComplete}
              disabled={completed || isPending}
              className="flex h-10 w-fit items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: figma.colors.primary }}
            >
              <CheckCircle2 className="size-4" />
              {completed ? "학습 완료됨" : isPending ? "처리 중..." : "학습 완료"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {prevOrder ? (
            <Link
              href={`/classroom/${slug}/lecture/${prevOrder}`}
              className={cn(
                "flex h-10 items-center justify-center gap-1 rounded-lg border px-4 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
                figmaClass.textSub,
                figmaClass.borderDefault,
              )}
            >
              <ChevronLeft className="size-4" />
              이전 차시
            </Link>
          ) : (
            <span
              className={cn(
                "flex h-10 cursor-not-allowed items-center justify-center gap-1 rounded-lg border px-4 text-[13px] font-semibold opacity-40",
                figmaClass.textSub,
                figmaClass.borderDefault,
              )}
            >
              <ChevronLeft className="size-4" />
              이전 차시
            </span>
          )}

          {nextOrder ? (
            <Link
              href={`/classroom/${slug}/lecture/${nextOrder}`}
              className={cn(
                "flex h-10 items-center justify-center gap-1 rounded-lg border px-4 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
                figmaClass.textSub,
                figmaClass.borderDefault,
              )}
            >
              다음 차시
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span
              className={cn(
                "flex h-10 cursor-not-allowed items-center justify-center gap-1 rounded-lg border px-4 text-[13px] font-semibold opacity-40",
                figmaClass.textSub,
                figmaClass.borderDefault,
              )}
            >
              다음 차시
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>

        <Link
          href={`/classroom/${slug}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: figma.colors.primary }}
        >
          <ListVideo className="size-4" />
          강의목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
