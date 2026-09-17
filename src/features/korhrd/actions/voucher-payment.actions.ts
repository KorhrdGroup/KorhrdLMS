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

/** "01012345678" → "010-1234-5678". 10~11자리가 아니면 null. */
function formatPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return null;
}

/**
 * 평생교육이용권 결제창 호출 파라미터 준비 — 서명(SignData)을 서버에서 만들어
 * 내려줍니다. 결제 확정은 /api/nicepay/return 이 승인 API까지 마친 뒤입니다.
 *
 * 로그인하지 않아도 결제할 수 있습니다. 회원이면 회원 정보를 그대로 쓰고,
 * 비회원이면 이름·휴대폰을 받아 결제자를 남깁니다(어드민 이용권결제에서 확인).
 */
export async function prepareVoucherPaymentAction(input: {
  amount: number;
  /** 비회원 결제자 이름 — 로그인돼 있으면 무시합니다 */
  buyerName?: string;
  /** 비회원 결제자 휴대폰 — 로그인돼 있으면 무시합니다 */
  buyerTel?: string;
}): Promise<VoucherPaymentPrepareResult> {
  const member = await getMockableStudentMember();

  let buyer: { memberId: string | null; name: string; tel: string | null };
  if (member) {
    buyer = { memberId: member.id, name: member.name, tel: null };
  } else {
    const name = (input.buyerName ?? "").trim();
    const tel = formatPhone(input.buyerTel ?? "");
    if (!name) return { success: false, message: "결제자 이름을 입력해주세요." };
    if (!tel) return { success: false, message: "휴대폰 번호를 정확히 입력해주세요. (예: 010-1234-5678)" };
    buyer = { memberId: null, name, tel };
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
  // 주문번호로 누가 결제했는지 역추적합니다 — 회원은 회원ID, 비회원은 guest 표시
  const moid = buyer.memberId
    ? `voucher-${buyer.memberId}-${Date.now()}`
    : `voucher-guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // 결제 전에 주문을 먼저 기록(ready)합니다 — 모바일 결제창은 인증 콜백에
  // 금액을 돌려주지 않을 수 있어, 승인 단계 금액은 이 기록에서 찾습니다.
  const supabase = await createClient();
  const { error: insertError } = await supabase.from("voucher_payments").insert({
    member_id: buyer.memberId,
    buyer_name: buyer.name,
    buyer_tel: buyer.tel,
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
    buyerName: buyer.name,
    isTest,
  };
}
