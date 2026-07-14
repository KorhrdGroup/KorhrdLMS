import { getExamPublishLabel } from "@/features/exam-management/constants";
import { cn } from "@/lib/utils";

type ExamStatusBadgeProps = {
  isPublished: boolean;
  className?: string;
};

export function ExamStatusBadge({ isPublished, className }: ExamStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isPublished ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F0F0F0] text-[#6B7280]",
        className,
      )}
    >
      {getExamPublishLabel(isPublished)}
    </span>
  );
}
