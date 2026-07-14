import { getMaterialPublishLabel } from "@/features/learning-materials/constants";
import { cn } from "@/lib/utils";

type MaterialStatusBadgeProps = {
  isPublished: boolean;
  className?: string;
};

export function MaterialStatusBadge({ isPublished, className }: MaterialStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isPublished ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F0F0F0] text-[#6B7280]",
        className,
      )}
    >
      {getMaterialPublishLabel(isPublished)}
    </span>
  );
}
