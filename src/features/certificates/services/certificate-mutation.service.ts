import type {
  CertificateDeleteResult,
  CertificateMutationResult,
  CertificateUpdateInput,
} from "@/features/certificates/types/certificate-form.types";
import { todayInKst } from "@/lib/shared/kst-date";
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
    input.photoUrl === undefined &&
    input.issueWithoutPhoto === undefined
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
    // 사진이 새로 올라오면 "사진없이 발급" 체크는 자동 해제합니다
    if (payload.photo_url) {
      payload.issue_without_photo = false;
    }
  }

  if (input.issueWithoutPhoto !== undefined) {
    payload.issue_without_photo = input.issueWithoutPhoto;
  }

  const { data, error } = await supabase
    .from("certificate_applications")
    .update(payload)
    .eq("id", applicationId)
    .is("deleted_at", null)
    .select(
      "id, member_id, course_id, certificate_name, actual_payment_amount, payment_status, payment_method, payapp_mul_no",
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "신청 내역을 찾을 수 없습니다." };
  }

  // 결제상태를 바꿨으면 결제관리(course_payments)에도 같은 건을 반영합니다.
  // (PayApp 자동결제는 웹훅이, 무통장 수기 확인은 여기가 기록합니다)
  if (input.paymentStatus !== undefined) {
    try {
      await syncCertificatePaymentRecord(supabase, data);
    } catch (syncError) {
      // 신청 내역 수정 자체는 이미 끝났으므로 기록 실패는 로그만 남깁니다.
      console.error("[certificates] 결제관리 기록 실패:", syncError);
    }
  }

  return { success: true, message: "신청 내역이 수정되었습니다." };
}

type PaymentSyncRow = {
  id: string;
  member_id: string;
  course_id: string | null;
  certificate_name: string;
  actual_payment_amount: number;
  payment_status: PaymentStatus;
  payment_method: Database["public"]["Enums"]["payment_method"] | null;
  payapp_mul_no: string | null;
};

/**
 * 자격증 발급비 결제 건을 결제관리 목록(course_payments)에 반영합니다.
 * 같은 신청 건(pg_order_id = cert-<신청id>, PayApp 건은 mul_no)이 이미 있으면
 * 상태만 갱신합니다.
 */
async function syncCertificatePaymentRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: PaymentSyncRow,
) {
  // course_payments.course_id 가 필수라 과정 정보 없는 옛 신청 건은 건너뜁니다.
  if (!row.course_id) {
    return;
  }

  const status: Database["public"]["Enums"]["course_payment_status"] =
    row.payment_status === "paid" || row.payment_status === "prepaid"
      ? "paid"
      : row.payment_status === "canceled"
        ? "canceled"
        : row.payment_status === "refunded"
          ? "refunded"
          : "pending"; // unpaid·partial 등 미확정

  // PayApp 건은 웹훅이 mul_no 로 만들어 둔 행을, 수기 건은 cert-<id> 행을 찾습니다.
  const orderId = row.payapp_mul_no ?? `cert-${row.id}`;

  const { data: existing } = await supabase
    .from("course_payments")
    .select("id")
    .eq("pg_order_id", orderId)
    .is("deleted_at", null)
    .maybeSingle();

  const timestamps = {
    approved_at: status === "paid" ? new Date().toISOString() : null,
    canceled_at: status === "canceled" || status === "refunded" ? new Date().toISOString() : null,
  };

  if (existing) {
    await supabase
      .from("course_payments")
      .update({ status, amount: row.actual_payment_amount, ...timestamps })
      .eq("id", existing.id);
    return;
  }

  await supabase.from("course_payments").insert({
    member_id: row.member_id,
    course_id: row.course_id,
    amount: row.actual_payment_amount,
    payment_method: row.payment_method ?? "bank_transfer",
    status,
    payment_date: new Date().toISOString().slice(0, 10),
    product_name: `${row.certificate_name} 발급비`,
    pg_provider: row.payapp_mul_no ? "payapp" : null,
    pg_order_id: orderId,
    memo: "자격증 발급비 (어드민 결제상태 변경 시 자동 기록)",
    ...timestamps,
  });
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

/**
 * 결제대기 건 끌어올리기 — 신청일을 처리한 날짜(오늘)로 바꿉니다.
 * 본사(협회)가 신청일 2주 지난 건은 확인하지 않아, 뒤늦게 입금된 건은
 * 신청일을 갱신해 목록 맨 위로 올리고 명단에도 최신 날짜로 실리게 합니다.
 */
export async function bumpCertificateApplication(
  applicationId: string,
): Promise<CertificateMutationResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificate_applications")
    /* created_at 도 지금으로 — 같은 날짜 안 순서는 created_at 이 가르는데,
       이관 건은 등록시각이 이관일로 남아 있어 오늘 신청들 아래에 깔립니다
       (2026-08-19 "맨 최상단이 아님" 문의) */
    .update({ applied_at: todayInKst(), created_at: new Date().toISOString() })
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

  return {
    success: true,
    message: "신청일을 오늘로 바꾸고 목록 맨 위로 끌어올렸습니다.",
  };
}
