import {
  CERTIFICATE_DELIVERY_STATUS_LABELS,
  CERTIFICATE_KIND_LABELS,
} from "@/features/certificates/constants";
import type { CertificateDeliveryStatus, CertificateKind } from "@/types/database.types";

export function getCertificateKindLabel(kind: CertificateKind) {
  return CERTIFICATE_KIND_LABELS[kind];
}

export function getCertificateDeliveryStatusLabel(status: CertificateDeliveryStatus) {
  return CERTIFICATE_DELIVERY_STATUS_LABELS[status];
}

export function formatCertificateAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function formatApplicantWithId(name: string, loginId: string) {
  return `${name} (${loginId})`;
}

export function formatOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function formatFullAddress(
  postalCode: string | null | undefined,
  address: string | null | undefined,
  addressDetail: string | null | undefined,
) {
  const parts = [postalCode?.trim(), address?.trim(), addressDetail?.trim()].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "—";
}

export function formatPaymentInfo(
  paymentMethodLabel: string,
  paymentInfo: string | null | undefined,
) {
  const info = paymentInfo?.trim();

  if (info) {
    return `${paymentMethodLabel} / ${info}`;
  }

  return paymentMethodLabel === "—" ? "—" : paymentMethodLabel;
}
