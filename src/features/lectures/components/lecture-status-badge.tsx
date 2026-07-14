import { getLecturePublishLabel } from "@/features/lectures/constants";
import { cn } from "@/lib/utils";

type LectureStatusBadgeProps = {
  isPublished: boolean;
  className?: string;
};

export function LectureStatusBadge({ isPublished, className }: LectureStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isPublished ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F0F0F0] text-[#6B7280]",
        className,
      )}
    >
      {getLecturePublishLabel(isPublished)}
    </span>
  );
}
