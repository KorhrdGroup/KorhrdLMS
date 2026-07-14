import { SUBMISSION_STATUS_LABELS } from "@/features/assignment-management/constants";
import type { SubmissionStatus } from "@/features/assignment-management/types/assignment.types";
import { cn } from "@/lib/utils";

type SubmissionStatusBadgeProps = {
  status: SubmissionStatus;
  className?: string;
};

export function SubmissionStatusBadge({ status, className }: SubmissionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        status === "graded" ? "bg-[#F0FDF4] text-[#059669]" : "bg-[#FFF7ED] text-[#EA580C]",
        className,
      )}
    >
      {SUBMISSION_STATUS_LABELS[status]}
    </span>
  );
}
