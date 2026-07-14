import { cn } from "@/lib/utils";

type ExamResultPassBadgeProps = {
  isPassed: boolean | null;
  className?: string;
};

export function ExamResultPassBadge({ isPassed, className }: ExamResultPassBadgeProps) {
  const label = isPassed === null ? "채점기준 없음" : isPassed ? "합격" : "불합격";
  const style =
    isPassed === null
      ? "bg-[#F1F1F1] text-[#919191]"
      : isPassed
        ? "bg-[#F0FDF4] text-[#059669]"
        : "bg-[#FEE2E2] text-[#EF4444]";

  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", style, className)}>
      {label}
    </span>
  );
}
