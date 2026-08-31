"use server";

import { getNicepayConfig, nicepayEdiDate, signPaymentRequest } from "@/lib/nicepay/nicepay";
import { getMockableStudentMember } from "@/lib/mock-auth-server";
import { createClient } from "@/lib/supabase/server";

export type VoucherPaymentPrepared = {
  success: true;
  mid: string;
  moid: string;
  ediDate: string;
  signData: string;
  goodsName: string;
  amt: string;
  buyerName: string;
  isTest: boolean;
};

export type VoucherPaymentPrepareResult =
  | VoucherPaymentPrepared
  | { success: false; message: string };

const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 5_000_000;

/**
 * 평생교육이용권 결제창 호출 파라미터 준비 — 서명(SignData)을 서버에서 만들어
 * 내려줍니다. 결제 확정은 /api/nicepay/return 이 승인 API까지 마친 뒤입니다.
 */
export async function prepareVoucherPaymentAction(input: {
  amount: number;
}): Promise<VoucherPaymentPrepareResult> {
  const member = await getMockableStudentMember();
  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return {
      success: false,
      message: `결제 금액은 ${MIN_AMOUNT.toLocaleString()}원 이상 ${MAX_AMOUNT.toLocaleString()}원 이하로 입력해주세요.`,
    };
  }

  const { mid, merchantKey, isTest } = getNicepayConfig();
  const ediDate = nicepayEdiDate();
  const amt = String(amount);
  const moid = `voucher-${member.id}-${Date.now()}`;

  // 결제 전에 주문을 먼저 기록(ready)합니다 — 모바일 결제창은 인증 콜백에
  // 금액을 돌려주지 않을 수 있어, 승인 단계 금액은 이 기록에서 찾습니다.
  const supabase = await createClient();
  const { error: insertError } = await supabase.from("voucher_payments").insert({
    member_id: member.id,
    buyer_name: member.name,
    amount,
    status: "ready",
    moid,
  });
  if (insertError) {
    console.error("[나이스페이] 주문 기록 실패:", insertError.message);
    return { success: false, message: "결제 준비에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  return {
    success: true,
    mid,
    moid,
    ediDate,
    signData: signPaymentRequest(ediDate, mid, amt, merchantKey),
    goodsName: "평생교육이용권",
    amt,
    buyerName: member.name,
    isTest,
  };
}
