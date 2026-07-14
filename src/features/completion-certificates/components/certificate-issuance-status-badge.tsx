import { cn } from "@/lib/utils";
import type { CertificateIssuanceStatus } from "@/features/completion-certificates/types/completion-certificate.types";

type CertificateIssuanceStatusBadgeProps = {
  status: CertificateIssuanceStatus;
  className?: string;
};

export function CertificateIssuanceStatusBadge({
  status,
  className,
}: CertificateIssuanceStatusBadgeProps) {
  const isIssued = status === "issued";

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        isIssued ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F3F4F6] text-[#6B7280]",
        className,
      )}
    >
      {isIssued ? "발급완료" : "미발급"}
    </span>
  );
}
