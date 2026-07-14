import type { EnrollmentStatus } from "@/types/database.types";
import { ENROLLMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<EnrollmentStatus, string> = {
  pending: "bg-[#FEF3C7] text-[#D97706]",
  confirmed: "bg-[#EFF6FF] text-[#3B82F6]",
  canceled: "bg-[#FEE2E2] text-[#EF4444]",
  deleted: "bg-[#F0F0F0] text-[#9CA3AF]",
};

type EnrollmentStatusBadgeProps = {
  status: EnrollmentStatus;
  className?: string;
};

export function EnrollmentStatusBadge({
  status,
  className,
}: EnrollmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {ENROLLMENT_STATUS_LABELS[status]}
    </span>
  );
}
