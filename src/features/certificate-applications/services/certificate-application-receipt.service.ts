import {
  findCertificateApplicationReceipt,
  findLatestCertificateApplicationReceipt,
} from "@/features/certificate-applications/repositories/certificate-application-receipt.repository";
import { getCertificateDeliveryStatusLabel, formatFullAddress } from "@/features/certificates/lib/certificate.utils";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import type { PaymentStatus } from "@/types/database.types";

/**
 * 자격증 발급 신청 접수 완료 화면에 보여줄 값입니다.
 * (프로토타입 원본: korhrd-site/certificate-complete.html)
 */
export type CertificateApplicationReceipt = {
  id: string;
  certificateName: string;
  applicantName: string;
  appliedAt: string;
  /** 정가(발급비) */
  issuanceCost: number;
  /** 선납 반영 후 실제로 입금해야 하는 금액. 0이면 추가 입금이 필요 없습니다. */
  payableAmount: number;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  deliveryStatusLabel: string;
  fullAddress: string;
  /** 추가 입금이 필요한 상태인지 — 결제 안내를 띄울지 판단합니다. */
  needsDeposit: boolean;
  /** 결제가 남았을 때 무통장 입금 안내를 띄울지, 카드 결제 안내를 띄울지 가릅니다.
      옛 신청 건은 결제 방법이 비어 있을 수 있어 그때는 무통장으로 봅니다. */
  isCardPayment: boolean;
};

/**
 * 방금 접수한(또는 가장 최근에 접수한) 자격증 발급 신청 1건을 조회합니다.
 *
 * 신청 직후 `?id=`로 넘어오지만, 새로고침이나 즐겨찾기로 id 없이 들어오는 경우가
 * 있어 그때는 최근 1건으로 대체합니다. 어느 경로든 본인 신청 건만 조회합니다.
 */
export async function getCertificateApplicationReceipt(
  memberId: string,
  applicationId?: string,
): Promise<CertificateApplicationReceipt | null> {
  if (!memberId.trim()) {
    return null;
  }

  const row = applicationId?.trim()
    ? await findCertificateApplicationReceipt(memberId, applicationId.trim())
    : await findLatestCertificateApplicationReceipt(memberId);

  if (!row) {
    return null;
  }

  // 여러 자격증을 한 번에 신청하면 신청 건이 과목별로 따로 생기므로,
  // 입금 안내는 본인의 **미결제 건 전체**를 합산해 보여줍니다 (2026-08-14).
  const { sumAmount, bundleCount } = await sumUnpaidApplications(memberId, row);
  const payableAmount = row.payment_status === "paid" ? row.actual_payment_amount : sumAmount;
  const certificateName =
    bundleCount > 1 && row.payment_status !== "paid"
      ? `${row.certificate_name} 외 ${bundleCount - 1}건`
      : row.certificate_name;

  return {
    id: row.id,
    certificateName,
    applicantName: row.applicant_name,
    appliedAt: row.applied_at,
    issuanceCost: row.issuance_cost,
    payableAmount,
    paymentStatus: row.payment_status,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[row.payment_status] ?? row.payment_status,
    deliveryStatusLabel: getCertificateDeliveryStatusLabel(row.delivery_status),
    fullAddress: formatFullAddress(row.postal_code, row.address, row.address_detail),
    needsDeposit: payableAmount > 0 && row.payment_status !== "paid",
    isCardPayment: row.payment_method === "card",
  };
}

/** 본인의 미결제(unpaid·partial) 신청 건 합계 — 완료 화면 입금 안내용 */
async function sumUnpaidApplications(
  memberId: string,
  anchor: { id: string; actual_payment_amount: number; payment_status: PaymentStatus },
): Promise<{ sumAmount: number; bundleCount: number }> {
  const { listUnpaidCertificateApplicationAmounts } = await import(
    "@/features/certificate-applications/repositories/certificate-application-receipt.repository"
  );
  const rows = await listUnpaidCertificateApplicationAmounts(memberId);
  const others = rows.filter((row) => row.id !== anchor.id);
  const anchorAmount =
    anchor.payment_status === "unpaid" || anchor.payment_status === "partial"
      ? anchor.actual_payment_amount
      : 0;
  return {
    sumAmount: anchorAmount + others.reduce((sum, row) => sum + row.actual_payment_amount, 0),
    bundleCount: (anchorAmount > 0 ? 1 : 0) + others.length,
  };
}
