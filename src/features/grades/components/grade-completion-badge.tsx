import { cn } from "@/lib/utils";

type GradeCompletionBadgeProps = {
  isCompleted: boolean;
  className?: string;
};

export function GradeCompletionBadge({ isCompleted, className }: GradeCompletionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isCompleted ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F3F4F6] text-[#6B7280]",
        className,
      )}
    >
      {isCompleted ? "수료" : "미수료"}
    </span>
  );
}
