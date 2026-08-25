"use server";

import { cookies } from "next/headers";

import { ADMIN_SESSION_MARKER_COOKIE } from "@/features/admin-auth/constants";
import { createClient } from "@/lib/supabase/server";

export type ManualPaymentResult = { success: boolean; message: string };

/**
 * 계좌이체 수기 추가 — 회원 팝업 결제내역 탭에서, 결제 기록(course_payments)에
 * 계좌이체·결제완료 건을 직접 남깁니다. 발급신청 없이 입금만 들어온 경우 등
 * 자동 기록이 안 남는 케이스용입니다.
 */
export async function addManualBankTransferAction(input: {
  memberId: string;
  courseId: string;
  amount: number;
  paymentDate: string;
}): Promise<ManualPaymentResult> {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_SESSION_MARKER_COOKIE)) {
    return { success: false, message: "관리자만 사용할 수 있습니다." };
  }

  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "금액을 확인해주세요." };
  }

  const paymentDate = /^\d{4}-\d{2}-\d{2}$/.test(input.paymentDate)
    ? input.paymentDate
    : new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!course) {
    return { success: false, message: "과정을 찾을 수 없습니다." };
  }

  const { error } = await supabase.from("course_payments").insert({
    member_id: input.memberId,
    course_id: course.id,
    amount,
    payment_method: "bank_transfer",
    status: "paid",
    payment_date: paymentDate,
    product_name: `${course.name} 발급비`,
    approved_at: new Date().toISOString(),
    memo: "회원관리 팝업에서 수기 추가 (계좌이체)",
  });

  if (error) {
    return { success: false, message: `추가에 실패했습니다: ${error.message}` };
  }

  return { success: true, message: `${course.name} — 계좌이체 ${amount.toLocaleString("ko-KR")}원을 기록했습니다.` };
}

/** 결제 기록 삭제 (soft delete) — 잘못 추가한 건을 지웁니다 */
export async function deletePaymentRecordAction(
  paymentId: string,
): Promise<ManualPaymentResult> {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_SESSION_MARKER_COOKIE)) {
    return { success: false, message: "관리자만 사용할 수 있습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", paymentId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, message: `삭제에 실패했습니다: ${error.message}` };
  }
  if (!data) {
    return { success: false, message: "결제 기록을 찾을 수 없습니다." };
  }

  return { success: true, message: "결제 기록을 삭제했습니다." };
}
