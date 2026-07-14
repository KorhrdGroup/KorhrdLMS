import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";
import { cn } from "@/lib/utils";

const LEARNING_STATUS_LABELS: Record<EnrollmentLearningStatus, string> = {
  in_progress: "수강중",
  ended: "종료",
  stopped: "중지",
};

const LEARNING_STATUS_STYLES: Record<EnrollmentLearningStatus, string> = {
  in_progress: "bg-[#EFF6FF] text-[#3B82F6]",
  ended: "bg-[#F0F0F0] text-[#6B7280]",
  stopped: "bg-[#FEE2E2] text-[#EF4444]",
};

type EnrollmentLearningStatusBadgeProps = {
  status: EnrollmentLearningStatus;
  className?: string;
};

export function EnrollmentLearningStatusBadge({
  status,
  className,
}: EnrollmentLearningStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        LEARNING_STATUS_STYLES[status],
        className,
      )}
    >
      {LEARNING_STATUS_LABELS[status]}
    </span>
  );
}

export { LEARNING_STATUS_LABELS };
