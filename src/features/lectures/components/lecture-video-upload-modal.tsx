"use client";

import { AlertTriangle, FileVideo2, Link2, PlayCircle, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  removeLectureSessionVideoAction,
  setLectureSessionVideoAction,
} from "@/features/lectures/actions/lecture-video.actions";
import { formatVideoDuration } from "@/features/lectures/constants";
import { LectureFormField } from "@/features/lectures/components/lecture-form-field";
import {
  detectHasAudioTrack,
  readVideoDurationSeconds,
  uploadLectureVideoFile,
} from "@/features/lectures/lib/lecture-video-upload.client";
import type { LectureSession } from "@/features/lectures/types/lecture.types";
import { cn } from "@/lib/utils";

type VideoInputMode = "file" | "url";

type LectureVideoUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lectureId: string;
  session: LectureSession | null;
  onSuccess?: (message: string) => void;
};

export function LectureVideoUploadModal({
  open,
  onOpenChange,
  lectureId,
  session,
  onSuccess,
}: LectureVideoUploadModalProps) {
  const [mode, setMode] = useState<VideoInputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [detectedDuration, setDetectedDuration] = useState<number | null>(null);
  const [hasAudioTrack, setHasAudioTrack] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, startSubmit] = useTransition();
  const [isRemoving, startRemove] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    const hasExternalVideo = Boolean(session?.videoUrl) && session?.videoSource === "external";

    setError(null);
    setFile(null);
    setFilePreviewUrl(null);
    setDetectedDuration(null);
    setHasAudioTrack(null);
    setMode(hasExternalVideo ? "url" : "file");
    setUrlInput(hasExternalVideo ? session?.videoUrl ?? "" : "");
  }, [open, session]);

  // 선택한 파일의 로컬 미리보기 URL 정리(교체/닫기 시 메모리 해제)
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  if (!session) {
    return null;
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting || isRemoving || isUploading) {
      return;
    }
    onOpenChange(nextOpen);
  }

  async function handleFileSelect(selected: File | null) {
    setError(null);
    setFile(selected);
    setFilePreviewUrl(null);
    setDetectedDuration(null);
    setHasAudioTrack(null);

    if (!selected) {
      return;
    }

    if (!selected.type.startsWith("video/")) {
      setError("영상 파일(MP4 등)만 업로드할 수 있습니다.");
      setFile(null);
      return;
    }

    setFilePreviewUrl(URL.createObjectURL(selected));

    const duration = await readVideoDurationSeconds(selected);
    setDetectedDuration(duration);

    const audioResult = await detectHasAudioTrack(selected);
    setHasAudioTrack(audioResult);
  }

  async function handleUrlBlur() {
    if (!urlInput.trim() || detectedDuration != null) {
      return;
    }
    const duration = await readVideoDurationSeconds(urlInput.trim());
    setDetectedDuration(duration);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setError(null);

    if (mode === "file") {
      if (!file) {
        setError("업로드할 영상 파일을 선택해주세요.");
        return;
      }

      startSubmit(async () => {
        setIsUploading(true);
        try {
          const { url, path } = await uploadLectureVideoFile(lectureId, session.id, file);

          const result = await setLectureSessionVideoAction(lectureId, session.id, {
            videoUrl: url,
            videoSource: "storage",
            videoFileName: file.name,
            videoDurationSeconds: detectedDuration,
            videoStoragePath: path,
          });

          if (!result.success) {
            setError(result.message);
            return;
          }

          onOpenChange(false);
          onSuccess?.(result.message);
        } catch (err) {
          setError(err instanceof Error ? err.message : "영상 업로드에 실패했습니다.");
        } finally {
          setIsUploading(false);
        }
      });
      return;
    }

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setError("영상 URL을 입력해주세요.");
      return;
    }

    startSubmit(async () => {
      try {
        const result = await setLectureSessionVideoAction(lectureId, session.id, {
          videoUrl: trimmedUrl,
          videoSource: "external",
          videoFileName: null,
          videoDurationSeconds: detectedDuration,
          videoStoragePath: null,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        onOpenChange(false);
        onSuccess?.(result.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "영상 등록에 실패했습니다.");
      }
    });
  }

  function handleRemove() {
    if (!session) return;
    setError(null);

    startRemove(async () => {
      try {
        const result = await removeLectureSessionVideoAction(lectureId, session.id);

        if (!result.success) {
          setError(result.message);
          return;
        }

        onOpenChange(false);
        onSuccess?.(result.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : "영상 삭제에 실패했습니다.");
      }
    });
  }

  const busy = isSubmitting || isRemoving || isUploading;

  // 미리보기 대상: 새로 선택한 파일/입력한 URL 우선, 없으면 현재 등록된 영상
  const pendingPreviewSrc =
    mode === "file" ? filePreviewUrl : urlInput.trim() && urlInput.trim() !== session.videoUrl ? urlInput.trim() : null;
  const previewSrc = pendingPreviewSrc ?? session.videoUrl ?? null;
  const isPreviewingPending = pendingPreviewSrc != null;

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="영상 업로드"
      description={`"${session.title}" 차시에 연결할 영상을 등록하세요.`}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          {session.videoUrl ? (
            <AdminButton
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={busy}
            >
              <Trash2 className="size-4" />
              {isRemoving ? "삭제 중..." : "영상 삭제"}
            </AdminButton>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={busy}
            >
              취소
            </AdminButton>
            <AdminButton type="submit" form="lecture-video-upload-form" disabled={busy}>
              {isUploading ? "업로드 중..." : isSubmitting ? "저장 중..." : "저장"}
            </AdminButton>
          </div>
        </div>
      }
    >
      <form id="lecture-video-upload-form" className="space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">{error}</p>
        ) : null}

        {session.videoUrl ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#6B7280]">
            <FileVideo2 className="size-4 shrink-0 text-[#9CA3AF]" />
            <span className="flex-1 truncate">
              현재 등록됨: {session.videoFileName ?? session.videoUrl}
              {session.videoDurationSeconds ? ` · ${formatVideoDuration(session.videoDurationSeconds)}` : ""}
            </span>
          </div>
        ) : null}

        {previewSrc ? (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
              <PlayCircle className="size-3.5" />
              미리보기 {isPreviewingPending ? "(저장 전 새 영상)" : "(현재 등록된 영상)"}
            </p>
            <video
              key={previewSrc}
              src={previewSrc}
              controls
              preload="metadata"
              className="aspect-video w-full rounded-lg border border-[#E5E7EB] bg-black"
              onError={() => {
                if (isPreviewingPending && mode === "url") {
                  setError("입력한 URL의 영상을 재생할 수 없습니다. 직접 재생 가능한 영상 URL(MP4 등)인지 확인해주세요.");
                }
              }}
            />
          </div>
        ) : null}

        <div className="flex gap-2 rounded-lg bg-[#F3F4F6] p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md transition-colors",
              mode === "file" ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]",
            )}
          >
            <UploadCloud className="size-4" />
            파일 업로드
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md transition-colors",
              mode === "url" ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]",
            )}
          >
            <Link2 className="size-4" />
            외부 URL
          </button>
        </div>

        {mode === "file" ? (
          <LectureFormField
            label="MP4 영상 파일"
            hint="Supabase Storage에 업로드되며, 영상 길이는 자동으로 감지됩니다. (최대 업로드 용량은 Supabase 프로젝트 요금제의 Storage 설정을 따릅니다.)"
          >
            <label className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 text-sm text-[#6B7280] transition-colors hover:bg-[#F9FAFB]">
              <UploadCloud className="size-4 shrink-0 text-[#9CA3AF]" />
              <span className="flex-1 truncate">
                {file ? file.name : "영상 파일 선택 (MP4 권장)"}
              </span>
              {detectedDuration != null ? (
                <span className="shrink-0 text-xs text-[#9CA3AF]">
                  {formatVideoDuration(detectedDuration)}
                </span>
              ) : null}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
              />
            </label>
            {hasAudioTrack === false ? (
              <p className="flex items-start gap-1.5 rounded-lg bg-[#FFFBEB] px-3 py-2 text-xs text-[#B45309]">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  이 영상 파일에서 오디오 트랙이 감지되지 않았습니다. 무음 영상이거나, 영상만 따로
                  추출된 파일일 수 있습니다. 소리가 필요한 영상이라면 오디오가 포함된 원본 파일로
                  다시 업로드해주세요.
                </span>
              </p>
            ) : null}
          </LectureFormField>
        ) : (
          <LectureFormField
            label="외부 CDN URL"
            htmlFor="lecture-video-url"
            hint="외부 CDN 등에 이미 호스팅된 영상의 재생 URL을 입력하세요."
          >
            <AdminInput
              id="lecture-video-url"
              variant="outline"
              value={urlInput}
              onChange={(event) => {
                setUrlInput(event.target.value);
                setDetectedDuration(null);
              }}
              onBlur={handleUrlBlur}
              placeholder="https://cdn.example.com/videos/session-1.mp4"
            />
          </LectureFormField>
        )}
      </form>
    </AdminModal>
  );
}
