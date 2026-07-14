import { COURSE_STATUS_LABELS } from "@/features/courses/constants";
import type { CourseStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<CourseStatus, string> = {
  active: "bg-[#EFF6FF] text-[#3B82F6]",
  hidden: "bg-[#F0F0F0] text-[#6B7280]",
  closed: "bg-[#FEE2E2] text-[#EF4444]",
};

type CourseStatusBadgeProps = {
  status: CourseStatus;
  className?: string;
};

export function CourseStatusBadge({ status, className }: CourseStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {COURSE_STATUS_LABELS[status]}
    </span>
  );
}
