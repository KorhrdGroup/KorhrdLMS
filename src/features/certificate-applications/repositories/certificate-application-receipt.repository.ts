import { createClient } from "@/lib/supabase/server";
import type { CertificateDeliveryStatus, PaymentStatus } from "@/types/database.types";

/**
 * 자격증 발급 신청 "접수 완료" 화면(`/certificate/complete`)에서만 쓰는 조회입니다.
 *
 * 목록 조회(`listCertificateApplicationsByMember`)와 달리 결제하실 금액
 * (actual_payment_amount)까지 필요해 select를 따로 두었습니다. `member_id` 조건을
 * 항상 함께 걸어 남의 신청 건을 id만으로 열어볼 수 없게 합니다.
 */
export type CertificateApplicationReceiptRow = {
  id: string;
  certificate_name: string;
  applicant_name: string;
  applied_at: string;
  issuance_cost: number;
  actual_payment_amount: number;
  payment_status: PaymentStatus;
  delivery_status: CertificateDeliveryStatus;
  postal_code: string | null;
  address: string | null;
  address_detail: string | null;
};

const RECEIPT_SELECT = `
  id,
  certificate_name,
  applicant_name,
  applied_at,
  issuance_cost,
  actual_payment_amount,
  payment_status,
  delivery_status,
  postal_code,
  address,
  address_detail
`;

/** 본인이 신청한 자격증발급신청 1건을 조회합니다. 없으면 null. */
export async function findCertificateApplicationReceipt(
  memberId: string,
  applicationId: string,
): Promise<CertificateApplicationReceiptRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_applications")
    .select(RECEIPT_SELECT)
    .eq("id", applicationId)
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CertificateApplicationReceiptRow | null) ?? null;
}

/** id 없이 들어온 경우(새로고침·직접 접근)를 위해 가장 최근 신청 1건을 조회합니다. */
export async function findLatestCertificateApplicationReceipt(
  memberId: string,
): Promise<CertificateApplicationReceiptRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_applications")
    .select(RECEIPT_SELECT)
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .order("applied_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CertificateApplicationReceiptRow | null) ?? null;
}
