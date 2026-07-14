import type { PaymentStatus } from "@/types/database.types";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-[#F0F0F0] text-[#6B7280]",
  paid: "bg-[#ECFDF5] text-[#059669]",
  partial: "bg-[#FEF3C7] text-[#D97706]",
  refunded: "bg-[#FEE2E2] text-[#EF4444]",
  canceled: "bg-[#F0F0F0] text-[#9CA3AF]",
  prepaid: "bg-[#EFF6FF] text-[#2563EB]",
};

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  className?: string;
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
