export function getNoticePublishLabel(isPublished: boolean) {
  return isPublished ? "공개" : "비공개";
}

export const NOTICE_PUBLISH_FILTER_LABELS: Record<"published" | "unpublished", string> = {
  published: "공개",
  unpublished: "비공개",
};

export const NOTICE_PINNED_FILTER_LABELS: Record<"pinned" | "unpinned", string> = {
  pinned: "상단고정",
  unpinned: "일반",
};

export function formatFileSizeLabel(bytes: number): string {
  if (bytes <= 0) return "0KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}
