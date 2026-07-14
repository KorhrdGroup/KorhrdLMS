import { CERTIFICATE_DETAIL_SELECT } from "@/features/certificates/constants";
import type {
  CertificateDetail,
  GetCertificateDetailResult,
} from "@/features/certificates/types/certificate.types";
import { createClient } from "@/lib/supabase/server";
import type {
  CertificateDeliveryStatus,
  CertificateKind,
  PaymentMethod,
  PaymentStatus,
} from "@/types/database.types";

type CertificateDetailRow = {
  id: string;
  certificate_kind: CertificateKind;
  certificate_name: string;
  member_login_id: string;
  applicant_name: string;
  phone: string | null;
  birth_date: string | null;
  postal_code: string | null;
  address: string | null;
  address_detail: string | null;
  photo_url: string | null;
  issuance_cost: number;
  actual_payment_amount: number;
  payment_method: PaymentMethod | null;
  payment_info: string | null;
  payment_status: PaymentStatus;
  delivery_status: CertificateDeliveryStatus;
  memo: string | null;
  applied_at: string;
  issued_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapCertificateDetail(row: CertificateDetailRow): CertificateDetail {
  return {
    id: row.id,
    certificateKind: row.certificate_kind,
    certificateName: row.certificate_name,
    memberLoginId: row.member_login_id,
    applicantName: row.applicant_name,
    phone: row.phone,
    birthDate: row.birth_date,
    postalCode: row.postal_code,
    address: row.address,
    addressDetail: row.address_detail,
    photoUrl: row.photo_url,
    issuanceCost: row.issuance_cost,
    actualPaymentAmount: row.actual_payment_amount,
    paymentMethod: row.payment_method,
    paymentInfo: row.payment_info,
    paymentStatus: row.payment_status,
    deliveryStatus: row.delivery_status,
    memo: row.memo,
    appliedAt: row.applied_at,
    issuedAt: row.issued_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCertificateDetail(
  applicationId: string,
): Promise<GetCertificateDetailResult> {
  if (!applicationId.trim()) {
    return { success: false, message: "신청 내역을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificate_applications")
    .select(CERTIFICATE_DETAIL_SELECT)
    .eq("id", applicationId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "신청 내역을 찾을 수 없습니다." };
  }

  return {
    success: true,
    application: mapCertificateDetail(data as CertificateDetailRow),
  };
}
