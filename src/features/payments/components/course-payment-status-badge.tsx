import { COURSE_PAYMENT_STATUS_LABELS } from "@/features/payments/constants";
import type { CoursePaymentStatus } from "@/types/database.types";
import { cn } from "@/lib/utils";

type CoursePaymentStatusBadgeProps = {
  status: CoursePaymentStatus;
  className?: string;
};

const STATUS_STYLES: Record<CoursePaymentStatus, string> = {
  ready: "bg-[#E0E7FF] text-[#3730A3]",
  pending: "bg-[#FEF3C7] text-[#92400E]",
  paid: "bg-[#DCFCE7] text-[#166534]",
  failed: "bg-[#FEE2E2] text-[#991B1B]",
  canceled: "bg-[#F3F4F6] text-[#6B7280]",
  refunded: "bg-[#FCE7F3] text-[#9D174D]",
};

export function CoursePaymentStatusBadge({
  status,
  className,
}: CoursePaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {COURSE_PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
