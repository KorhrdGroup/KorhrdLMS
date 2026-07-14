import { getAssignmentPublishLabel } from "@/features/assignment-management/constants";
import { cn } from "@/lib/utils";

type AssignmentStatusBadgeProps = {
  isPublished: boolean;
  className?: string;
};

export function AssignmentStatusBadge({ isPublished, className }: AssignmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isPublished ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F0F0F0] text-[#6B7280]",
        className,
      )}
    >
      {getAssignmentPublishLabel(isPublished)}
    </span>
  );
}
