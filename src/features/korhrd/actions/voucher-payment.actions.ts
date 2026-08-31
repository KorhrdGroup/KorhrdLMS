"use server";

import { getNicepayConfig, nicepayEdiDate, signPaymentRequest } from "@/lib/nicepay/nicepay";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

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
  // 주문번호에 회원 id 앞자리를 넣어 return 라우트에서 회원을 되찾습니다
  const moid = `voucher-${member.id}-${Date.now()}`;

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
