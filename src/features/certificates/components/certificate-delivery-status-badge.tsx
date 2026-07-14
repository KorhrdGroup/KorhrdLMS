import { cn } from "@/lib/utils";
import type { CertificateDeliveryStatus } from "@/types/database.types";

import { getCertificateDeliveryStatusLabel } from "@/features/certificates/lib/certificate.utils";

const STATUS_STYLES: Record<CertificateDeliveryStatus, string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  preparing: "bg-[#DBEAFE] text-[#1D4ED8]",
  shipped: "bg-[#E0E7FF] text-[#4338CA]",
  delivered: "bg-[#D1FAE5] text-[#047857]",
  canceled: "bg-[#FEE2E2] text-[#991B1B]",
};

type CertificateDeliveryStatusBadgeProps = {
  status: CertificateDeliveryStatus;
  className?: string;
};

export function CertificateDeliveryStatusBadge({
  status,
  className,
}: CertificateDeliveryStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {getCertificateDeliveryStatusLabel(status)}
    </span>
  );
}
