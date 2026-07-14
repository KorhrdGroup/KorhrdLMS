export function getLecturePublishLabel(isPublished: boolean) {
  return isPublished ? "운영중" : "비공개";
}

export const LECTURE_PUBLISH_FILTER_LABELS: Record<"published" | "unpublished", string> = {
  published: "운영중",
  unpublished: "비공개",
};

/** 차시 영상(MP4) 업로드용 Supabase Storage 버킷명. */
export const LECTURE_VIDEO_BUCKET = "lecture-videos";

export function formatVideoDuration(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return "-";
  }

  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}
