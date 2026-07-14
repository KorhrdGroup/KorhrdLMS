import { getNoticePublishLabel } from "@/features/notice-management/constants";
import { cn } from "@/lib/utils";

type NoticeStatusBadgeProps = {
  isPublished: boolean;
  className?: string;
};

export function NoticeStatusBadge({ isPublished, className }: NoticeStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isPublished ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F0F0F0] text-[#6B7280]",
        className,
      )}
    >
      {getNoticePublishLabel(isPublished)}
    </span>
  );
}
