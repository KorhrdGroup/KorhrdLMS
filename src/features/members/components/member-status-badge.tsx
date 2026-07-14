import type { MemberStatus } from "@/types/database.types";
import { MEMBER_STATUS_LABELS } from "@/features/members/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<MemberStatus, string> = {
  active: "bg-[#EFF6FF] text-[#3B82F6]",
  inactive: "bg-[#F0F0F0] text-[#6B7280]",
  dormant: "bg-[#FEF3C7] text-[#D97706]",
  withdrawn: "bg-[#FEE2E2] text-[#EF4444]",
  pending: "bg-[#F0F0F0] text-[#9CA3AF]",
};

type MemberStatusBadgeProps = {
  status: MemberStatus;
  className?: string;
};

export function MemberStatusBadge({ status, className }: MemberStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {MEMBER_STATUS_LABELS[status]}
    </span>
  );
}
