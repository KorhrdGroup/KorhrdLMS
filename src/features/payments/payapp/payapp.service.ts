import { requestPayAppPayment } from "@/features/payments/payapp/payapp.client";
import {
  PAY_STATE,
  PAY_STATE_PARTIAL_CANCELED,
  PAY_STATE_PAYMENT_CANCELED,
  PAY_STATE_REQUEST_CANCELED,
  getPayAppConfig,
} from "@/features/payments/payapp/payapp.config";
import { todayInKst } from "@/lib/shared/kst-date";
import { headers } from "next/headers";

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
  /** 이번에 결제할 신청 건들 — 첫 건이 대표(결제창 상품명·복귀 주소 기준)입니다 */
  applicationIds: string[],
): Promise<StartPaymentResult> {
  const applicationId = applicationIds[0];
  if (!applicationId) {
    return { success: false, message: "결제할 신청 건이 없습니다." };
  }
  let config = getPayAppConfig();
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

  /* 결제 후 돌아올 주소는 지금 사용자가 접속한 도메인을 따라갑니다.
     환경변수(siteUrl)에 옛 주소(korhrd-lms.vercel.app)가 남아 있으면 결제 후
     다른 도메인으로 떨어져 세션이 없고 부모 창 이동도 어긋납니다
     (2026-08-19 실사고 — www.korhrd.co.kr 에서 결제했는데 vercel.app 으로 복귀). */
  const requestOrigin = await getRequestOrigin();
  if (requestOrigin) {
    config = { ...config, siteUrl: requestOrigin };
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

  // 여러 자격증을 한 번에 신청하면 신청 건이 과목별로 따로 생기므로, "이번에
  // 넘어온 건들"만 합산해 한 번에 결제합니다. 회원의 다른 미결제 건까지 다
  // 끌어오면 안 됩니다 — 예전 미결제 신청이 있던 회원이 1건을 새로 신청했는데
  // 결제창에 40만원이 뜬 실사고 (2026-08-19).
  const { data: unpaidRows, error: unpaidError } = await supabase
    .from("certificate_applications")
    .select("id, certificate_name, actual_payment_amount")
    .eq("member_id", memberId)
    .in("id", applicationIds)
    .in("payment_status", ["unpaid", "partial"])
    .is("deleted_at", null);

  if (unpaidError) {
    throw new Error(unpaidError.message);
  }

  const bundle = (unpaidRows ?? []) as { id: string; certificate_name: string; actual_payment_amount: number }[];
  const others = bundle.filter((row) => row.id !== application.id);
  const totalAmount =
    application.actual_payment_amount +
    others.reduce((sum, row) => sum + row.actual_payment_amount, 0);
  const bundleIds = [application.id, ...others.map((row) => row.id)];
  const bundleName =
    others.length > 0
      ? `${application.certificate_name} 외 ${others.length}건`
      : application.certificate_name;

  // 지정된 테스트 계정만 소액으로 결제창을 엽니다(PayApp에 테스트 서버가 없어서).
  // 일반 회원은 이 분기를 타지 않으므로 청구액이 바뀔 일이 없습니다.
  const isTestAccount =
    config.testLoginId !== null && application.member_login_id === config.testLoginId;
  const price = isTestAccount ? config.testAmount! : totalAmount;

  const result = await requestPayAppPayment(config, {
    applicationId: application.id,
    goodName: isTestAccount ? `[테스트] ${bundleName}` : bundleName,
    price,
    recvPhone: application.phone,
    buyerName: application.applicant_name,
  });

  if (!result.success) {
    return result;
  }

  // 결제요청번호를 묶음의 **모든 신청 건**에 저장해 둬야, 통보가 왔을 때
  // 이 결제로 함께 처리할 건들을 찾을 수 있습니다.
  if (result.mulNo) {
    await supabase
      .from("certificate_applications")
      .update({ payapp_mul_no: result.mulNo })
      .in("id", bundleIds);
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
    .select(
      "id, actual_payment_amount, payment_status, member_login_id, member_id, course_id, certificate_name, applicant_name, phone",
    )
    .is("deleted_at", null);

  // 합산 결제는 같은 mul_no 가 여러 신청 건에 저장되므로 **목록으로** 조회합니다.
  const { data, error } = mulNo
    ? await query.eq("payapp_mul_no", mulNo)
    : await query.eq("id", applicationId!);

  if (error) {
    throw new Error(error.message);
  }

  type ApplicationRow = {
    id: string;
    actual_payment_amount: number;
    payment_status: PaymentStatus;
    member_login_id: string;
    member_id: string;
    course_id: string | null;
    certificate_name: string;
    applicant_name: string;
    phone: string | null;
  };
  const applications = (data ?? []) as ApplicationRow[];
  const application = applications[0];

  if (!application) {
    return { ok: false, reason: "신청 내역을 찾을 수 없습니다." };
  }

  const payState = Number(feedback.pay_state);
  const paidAmount = Number(feedback.price);

  const update: Database["public"]["Tables"]["certificate_applications"]["Update"] = {};

  // 테스트 계정은 소액으로 결제창을 열었으므로, 대조할 금액도 테스트 금액입니다.
  const bundleTotal = applications.reduce((sum, row) => sum + row.actual_payment_amount, 0);
  const expectedAmount =
    config.testLoginId !== null && application.member_login_id === config.testLoginId
      ? config.testAmount!
      : bundleTotal;

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
    .in("id", applications.map((row) => row.id));

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 결제관리(/admin/payments, course_payments)에도 같은 건을 기록합니다.
  // 실패해도 결제 상태 반영(위)은 이미 끝났으므로 통보 처리는 성공으로 답합니다
  // (여기서 던지면 PayApp이 재통보를 반복합니다).
  try {
    await syncCoursePaymentRecord(supabase, {
      memberId: application.member_id,
      courseId: application.course_id ?? applications.find((row) => row.course_id)?.course_id ?? null,
      certificateName:
        applications.length > 1
          ? `${application.certificate_name} 외 ${applications.length - 1}건`
          : application.certificate_name,
      amount: Number.isFinite(paidAmount) ? paidAmount : expectedAmount,
      paymentStatus: update.payment_status ?? null,
      paymentMethod: update.payment_method ?? null,
      mulNo: mulNo ?? null,
    });
  } catch (error) {
    console.error("[payapp] 결제관리 기록 실패:", error);
  }

  /* 오피스 매출파일 자동 등록 — 카드로 결제 "완료"된 건만 보냅니다.
     무통장·계좌이체는 입금 안 하는 경우가 많아 매출파일에 올리지 않습니다
     (LMS 에만 남음). 실패해도 결제 처리에는 영향을 주지 않습니다. */
  if (update.payment_status === "paid" && (update.payment_method ?? "card") === "card") {
    try {
      await notifyOfficeCertSale({
        studentName: application.applicant_name,
        phone: application.phone,
        amount: Number.isFinite(paidAmount) ? paidAmount : expectedAmount,
        certificateNames: applications.map((row) => row.certificate_name),
        ref: mulNo ? `payapp:${mulNo}` : `certapp:${application.id}`,
      });
    } catch (error) {
      console.error("[payapp] 오피스 매출파일 등록 실패:", error);
    }
  }

  return { ok: true };
}

/**
 * 오피스(korhrd-group-db) 매출파일에 카드결제 건을 등록합니다.
 * 분류 "후납" · 결제수단 "카드결제" 로 들어가고, 민간자격증 발급비라
 * 오피스 쪽에서 비고에 면세(TG02)를 함께 남깁니다.
 * OFFICE_API_URL / CERT_SALES_WEBHOOK_SECRET 이 없으면 조용히 건너뜁니다.
 */
async function notifyOfficeCertSale(input: {
  studentName: string;
  phone: string | null;
  amount: number;
  certificateNames: string[];
  ref: string;
}): Promise<void> {
  const baseUrl = process.env.OFFICE_API_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.CERT_SALES_WEBHOOK_SECRET?.trim();
  if (!baseUrl || !secret) return;

  const paidDate = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10); // KST

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${baseUrl}/api/cert-sales/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify({
        studentName: input.studentName,
        phone: input.phone,
        amount: input.amount,
        paidDate,
        certificateNames: input.certificateNames,
        count: input.certificateNames.length,
        ref: input.ref,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`오피스 응답 ${response.status}: ${await response.text()}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 자격증 발급비 결제를 결제관리 목록(course_payments)에 반영합니다.
 * 같은 PayApp 결제번호(pg_order_id)가 이미 있으면 상태만 갱신합니다.
 */
async function syncCoursePaymentRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    memberId: string;
    courseId: string | null;
    certificateName: string;
    amount: number;
    paymentStatus: PaymentStatus | null;
    paymentMethod: Database["public"]["Enums"]["payment_method"] | null;
    mulNo: string | null;
  },
) {
  // course_payments.course_id 가 필수라, 과정 정보가 없는 옛 신청 건은 건너뜁니다.
  if (!input.courseId || !input.paymentStatus) {
    return;
  }

  const status: Database["public"]["Enums"]["course_payment_status"] =
    input.paymentStatus === "paid"
      ? "paid"
      : input.paymentStatus === "canceled"
        ? "canceled"
        : "pending"; // partial 등 미확정 상태

  const base = {
    member_id: input.memberId,
    course_id: input.courseId,
    amount: input.amount,
    payment_method: input.paymentMethod ?? ("card" as const),
    status,
    payment_date: todayInKst(),
    product_name: `${input.certificateName} 발급비`,
    pg_provider: "payapp",
    pg_order_id: input.mulNo,
    approved_at: status === "paid" ? new Date().toISOString() : null,
    canceled_at: status === "canceled" ? new Date().toISOString() : null,
    memo: "자격증 발급비 (PayApp 자동 기록)",
  };

  if (input.mulNo) {
    const { data: existing } = await supabase
      .from("course_payments")
      .select("id")
      .eq("pg_provider", "payapp")
      .eq("pg_order_id", input.mulNo)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("course_payments")
        .update({ status, amount: base.amount, approved_at: base.approved_at, canceled_at: base.canceled_at })
        .eq("id", existing.id);
      return;
    }
  }

  await supabase.from("course_payments").insert(base);
}

/** 지금 요청이 들어온 도메인(프록시 뒤에서도 안전하게). 못 읽으면 null. */
async function getRequestOrigin(): Promise<string | null> {
  try {
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    if (!host) return null;
    const proto = headerStore.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}
