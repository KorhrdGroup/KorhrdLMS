import type {
  CertificateDeleteResult,
  CertificateMutationResult,
  CertificateUpdateInput,
} from "@/features/certificates/types/certificate-form.types";
import { createClient } from "@/lib/supabase/server";
import type { CertificateDeliveryStatus, Database, PaymentStatus } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateCertificateUpdateInput(
  input: CertificateUpdateInput,
): CertificateMutationResult {
  if (
    input.actualPaymentAmount === undefined &&
    input.deliveryStatus === undefined &&
    input.paymentStatus === undefined &&
    input.photoUrl === undefined
  ) {
    return { success: false, message: "변경할 항목이 없습니다." };
  }

  if (
    input.actualPaymentAmount !== undefined &&
    (!Number.isFinite(input.actualPaymentAmount) || input.actualPaymentAmount < 0)
  ) {
    return {
      success: false,
      message: "실결제금액은 0 이상의 숫자여야 합니다.",
      field: "actualPaymentAmount",
    };
  }

  if (input.deliveryStatus !== undefined) {
    const validStatuses: CertificateDeliveryStatus[] = [
      "pending",
      "preparing",
      "shipped",
      "delivered",
      "canceled",
    ];

    if (!validStatuses.includes(input.deliveryStatus)) {
      return {
        success: false,
        message: "유효하지 않은 배송상태입니다.",
        field: "deliveryStatus",
      };
    }
  }

  if (input.paymentStatus !== undefined) {
    const validPaymentStatuses: PaymentStatus[] = [
      "unpaid",
      "paid",
      "partial",
      "refunded",
      "canceled",
      "prepaid",
    ];

    if (!validPaymentStatuses.includes(input.paymentStatus)) {
      return {
        success: false,
        message: "유효하지 않은 결제상태입니다.",
        field: "paymentStatus",
      };
    }
  }

  return { success: true, message: "" };
}

export async function updateCertificateApplication(
  applicationId: string,
  input: CertificateUpdateInput,
): Promise<CertificateMutationResult> {
  const validation = validateCertificateUpdateInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["certificate_applications"]["Update"] = {};

  if (input.actualPaymentAmount !== undefined) {
    payload.actual_payment_amount = input.actualPaymentAmount;
  }

  if (input.deliveryStatus !== undefined) {
    payload.delivery_status = input.deliveryStatus;

    // 배송상태를 "배송완료"(delivered)로 변경할 때 발급일을 함께 기록합니다.
    // 재발급 등으로 다시 delivered 처리하면 발급일도 최신 시점으로 갱신됩니다.
    if (input.deliveryStatus === "delivered") {
      payload.issued_at = new Date().toISOString();
    }
  }

  if (input.paymentStatus !== undefined) {
    payload.payment_status = input.paymentStatus;
  }

  if (input.photoUrl !== undefined) {
    payload.photo_url = emptyToNull(normalize(input.photoUrl));
  }

  const { data, error } = await supabase
    .from("certificate_applications")
    .update(payload)
    .eq("id", applicationId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "신청 내역을 찾을 수 없습니다." };
  }

  return { success: true, message: "신청 내역이 수정되었습니다." };
}

export async function deleteCertificateApplication(
  applicationId: string,
): Promise<CertificateDeleteResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificate_applications")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", applicationId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "신청 내역을 찾을 수 없습니다." };
  }

  return { success: true, message: "신청 내역이 삭제되었습니다." };
}
