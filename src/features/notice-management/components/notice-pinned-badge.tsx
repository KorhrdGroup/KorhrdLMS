import { Pin } from "lucide-react";

import { cn } from "@/lib/utils";

type NoticePinnedBadgeProps = {
  isPinned: boolean;
  className?: string;
};

export function NoticePinnedBadge({ isPinned, className }: NoticePinnedBadgeProps) {
  if (!isPinned) {
    return <span className={cn("text-xs text-[#9CA3AF]", className)}>-</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-[#FEF2F2] px-2 py-0.5 text-xs font-medium text-[#DC2626]",
        className,
      )}
    >
      <Pin className="size-3" />
      상단고정
    </span>
  );
}
