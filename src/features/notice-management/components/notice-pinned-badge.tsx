import { Pin } from "lucide-react";

import { cn } from "@/lib/utils";

type NoticePinnedBadgeProps = {
  isPinned: boolean;
  className?: string;
};

export function NoticePinnedBadge({ isPinned, className }: NoticePinnedBadgeProps) {
  if (!isPinned) {
    return <span className={cn("text-xs text-[#8b95a1]", className)}>-</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#fdecee] px-2.5 py-1 text-xs font-semibold text-[#e42939]",
        className,
      )}
    >
      <Pin className="size-3 fill-current" />
      상단고정
    </span>
  );
}
