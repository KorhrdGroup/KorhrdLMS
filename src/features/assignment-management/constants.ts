import type { SubmissionStatus } from "@/features/assignment-management/types/assignment.types";

export function getAssignmentPublishLabel(isPublished: boolean) {
  return isPublished ? "공개" : "비공개";
}

export const ASSIGNMENT_PUBLISH_FILTER_LABELS: Record<"published" | "unpublished", string> = {
  published: "공개",
  unpublished: "비공개",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: "제출완료",
  graded: "채점완료",
};

export const DEFAULT_MAX_UPLOAD_SIZE_MB = 10;
