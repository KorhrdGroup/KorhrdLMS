import { cn } from "@/lib/utils";

type GradePassBadgeProps = {
  isPassed: boolean;
  className?: string;
};

export function GradePassBadge({ isPassed, className }: GradePassBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isPassed ? "bg-[#F0FDF4] text-[#059669]" : "bg-[#FEE2E2] text-[#EF4444]",
        className,
      )}
    >
      {isPassed ? "합격" : "불합격"}
    </span>
  );
}
