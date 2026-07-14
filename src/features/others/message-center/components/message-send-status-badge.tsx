import { cn } from "@/lib/utils";
import type { MessageSendStatus } from "@/types/database.types";

import { getMessageSendStatusLabel } from "@/features/others/message-center/lib/message-dispatch.utils";

const STATUS_STYLES: Record<MessageSendStatus, string> = {
  draft: "bg-[#F3F4F6] text-[#374151]",
  scheduled: "bg-[#DBEAFE] text-[#1D4ED8]",
  pending: "bg-[#FEF3C7] text-[#92400E]",
  sent: "bg-[#D1FAE5] text-[#047857]",
  failed: "bg-[#FEE2E2] text-[#991B1B]",
  canceled: "bg-[#E5E7EB] text-[#6B7280]",
};

type MessageSendStatusBadgeProps = {
  status: MessageSendStatus;
  className?: string;
};

export function MessageSendStatusBadge({ status, className }: MessageSendStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {getMessageSendStatusLabel(status)}
    </span>
  );
}
