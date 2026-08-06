import { requestPayAppPayment } from "@/features/payments/payapp/payapp.client";
import {
  PAY_STATE,
  PAY_STATE_PARTIAL_CANCELED,
  PAY_STATE_PAYMENT_CANCELED,
  PAY_STATE_REQUEST_CANCELED,
  getPayAppConfig,
} from "@/features/payments/payapp/payapp.config";
import { createClient } from "@/lib/supabase/server";
import type { Database, PaymentStatus } from "@/types/database.types";

/**
 * 자격증 발급비 결제(PayApp).
 *
 * 흐름
 *   1. 학생이 완료 화면에서 "결제하기" → startCertificatePayment()
 *      → PayApp에 결제요청 → 받은 payurl로 보냅니다(mul_no는 신청 건에 저장)
 *   2. 결제가 끝나면 PayApp이 /api/payapp/feedback 으로 결과를 통보
 *      → applyPayAppFeedback()이 payment_status를 갱신합니다
 *
 * 금액은 **항상 서버가 다시 계산합니다.** 클라이언트가 보낸 금액을 쓰면
 * 조작된 금액으로 결제가 열립니다.
 */
export type StartPaymentResult =
  | { success: true; payUrl: string }
  | { success: false; message: string };

export async function startCertificatePayment(
  memberId: string,
  applicationId: string,
): Promise<StartPaymentResult> {
  const config = getPayAppConfig();
  if (!config) {
    // 어느 값이 비었는지 알려줘야 배포 환경변수를 고칠 수 있습니다.
    const missing = [
      !(process.env.PAYAPP_USER_ID ?? process.env.PAYAPP_USERID)?.trim() && "PAYAPP_USER_ID",
      !(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_BASE_URL)?.trim() &&
        "NEXT_PUBLIC_SITE_URL",
    ].filter(Boolean);

    return {
      success: false,
      message: `결제 설정이 등록되지 않았습니다. (누락: ${missing.join(", ")}) 무통장입금 안내를 따라주세요.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_applications")
    .select(
      "id, certificate_name, actual_payment_amount, payment_status, phone, applicant_name, member_login_id",
    )
    .eq("id", applicationId)
    .eq("member_id", memberId) // 남의 신청 건으로 결제창을 열 수 없도록
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const application = data as {
    id: string;
    certificate_name: string;
    actual_payment_amount: number;
    payment_status: PaymentStatus;
    phone: string | null;
    applicant_name: string;
    member_login_id: string;
  } | null;

  if (!application) {
    return { success: false, message: "신청 내역을 찾을 수 없습니다." };
  }

  if (application.payment_status === "paid" || application.payment_status === "prepaid") {
    return { success: false, message: "이미 결제가 완료된 신청입니다." };
  }

  if (!application.phone) {
    return { success: false, message: "연락처가 없어 결제를 진행할 수 없습니다. 회원정보를 확인해주세요." };
  }

  // 지정된 테스트 계정만 소액으로 결제창을 엽니다(PayApp에 테스트 서버가 없어서).
  // 일반 회원은 이 분기를 타지 않으므로 청구액이 바뀔 일이 없습니다.
  const isTestAccount =
    config.testLoginId !== null && application.member_login_id === config.testLoginId;
  const price = isTestAccount ? config.testAmount! : application.actual_payment_amount;

  const result = await requestPayAppPayment(config, {
    applicationId: application.id,
    goodName: isTestAccount
      ? `[테스트] ${application.certificate_name}`
      : application.certificate_name,
    price,
    recvPhone: application.phone,
    buyerName: application.applicant_name,
  });

  if (!result.success) {
    return result;
  }

  // 결제요청번호를 먼저 저장해 둬야, 통보가 왔을 때 어느 신청 건인지 대조할 수 있습니다.
  if (result.mulNo) {
    await supabase
      .from("certificate_applications")
      .update({ payapp_mul_no: result.mulNo })
      .eq("id", application.id);
  }

  return { success: true, payUrl: result.payUrl };
}

/** PayApp이 통보로 보내오는 값 중 우리가 쓰는 것들. */
export type PayAppFeedback = {
  linkkey?: string;
  linkval?: string;
  mul_no?: string;
  pay_state?: string;
  price?: string;
  var1?: string;
  pay_type?: string;
};

export type FeedbackResult = { ok: true } | { ok: false; reason: string };

/** PayApp 결제수단 코드 → 우리 payment_method 값. */
function toPaymentMethod(payType: string | undefined) {
  switch (payType) {
    case "1":
      return "card" as const;
    case "6":
      return "bank_transfer" as const;
    case "7":
      return "virtual_account" as const;
    default:
      return null;
  }
}

/**
 * 결제결과 통보를 신청 건에 반영합니다.
 *
 * 통보는 재시도로 여러 번 올 수 있으므로 **몇 번 와도 결과가 같아야 합니다.**
 * 이미 paid인 건에 다시 결제완료가 와도 그대로 두고 성공으로 답합니다.
 */
export async function applyPayAppFeedback(feedback: PayAppFeedback): Promise<FeedbackResult> {
  const config = getPayAppConfig();
  if (!config) {
    return { ok: false, reason: "결제 설정이 없습니다." };
  }

  // 위조 통보를 막는 유일한 장치입니다. 반드시 먼저 확인합니다.
  // KEY/VALUE가 등록돼 있지 않으면 검증할 방법이 없으므로 아예 받지 않습니다
  // (검증 없이 통과시키면 아무나 결제완료를 만들 수 있습니다).
  if (!config.linkKey || !config.linkValue) {
    return {
      ok: false,
      reason: "PAYAPP_LINK_KEY / PAYAPP_LINK_VALUE 가 등록되지 않아 통보를 검증할 수 없습니다.",
    };
  }

  if (feedback.linkkey !== config.linkKey || feedback.linkval !== config.linkValue) {
    return { ok: false, reason: "연동 키가 일치하지 않습니다." };
  }

  const applicationId = feedback.var1?.trim();
  const mulNo = feedback.mul_no?.trim();

  if (!applicationId && !mulNo) {
    return { ok: false, reason: "신청 건을 특정할 수 없습니다." };
  }

  const supabase = await createClient();
  const query = supabase
    .from("certificate_applications")
    .select("id, actual_payment_amount, payment_status, member_login_id")
    .is("deleted_at", null);

  const { data, error } = applicationId
    ? await query.eq("id", applicationId).maybeSingle()
    : await query.eq("payapp_mul_no", mulNo!).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const application = data as {
    id: string;
    actual_payment_amount: number;
    payment_status: PaymentStatus;
    member_login_id: string;
  } | null;

  if (!application) {
    return { ok: false, reason: "신청 내역을 찾을 수 없습니다." };
  }

  const payState = Number(feedback.pay_state);
  const paidAmount = Number(feedback.price);

  const update: Database["public"]["Tables"]["certificate_applications"]["Update"] = {};

  // 테스트 계정은 소액으로 결제창을 열었으므로, 대조할 금액도 테스트 금액입니다.
  const expectedAmount =
    config.testLoginId !== null && application.member_login_id === config.testLoginId
      ? config.testAmount!
      : application.actual_payment_amount;

  if (payState === PAY_STATE.paid) {
    // 결제된 금액이 청구액과 다르면 자동으로 완료 처리하지 않습니다.
    // (부분결제·금액 조작을 그대로 통과시키지 않기 위함입니다)
    if (Number.isFinite(paidAmount) && paidAmount < expectedAmount) {
      update.payment_status = "partial";
    } else {
      update.payment_status = "paid";
      update.paid_at = new Date().toISOString();
    }
    const method = toPaymentMethod(feedback.pay_type);
    if (method) {
      update.payment_method = method;
    }
  } else if (
    PAY_STATE_PAYMENT_CANCELED.includes(payState) ||
    PAY_STATE_REQUEST_CANCELED.includes(payState)
  ) {
    update.payment_status = "canceled";
  } else if (PAY_STATE_PARTIAL_CANCELED.includes(payState)) {
    update.payment_status = "partial";
  } else {
    // 요청(1)·입금대기(10) 등은 아직 확정이 아니라 상태를 바꾸지 않습니다.
    return { ok: true };
  }

  if (mulNo) {
    update.payapp_mul_no = mulNo;
  }

  const { error: updateError } = await supabase
    .from("certificate_applications")
    .update(update)
    .eq("id", application.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { ok: true };
}
