import { redirect } from "next/navigation";

import { getNicepayConfig, nicepayEdiDate, signApproval } from "@/lib/nicepay/nicepay";
import { createClient } from "@/lib/supabase/server";

/**
 * 나이스페이 인증 결과 수신 → 승인 API 호출 → 결제 기록.
 *
 * PC는 결제창 인증 후 우리 폼이 이 주소로 제출되고, 모바일은 나이스페이가
 * ReturnURL(이 주소)로 직접 POST 합니다. 여기서 승인 API(NextAppURL)까지
 * 성공해야 결제 완료입니다.
 */

export const dynamic = "force-dynamic";

const DONE = "/voucher/done";

function fail(message: string): never {
  redirect(`${DONE}?result=fail&message=${encodeURIComponent(message)}`);
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    fail("결제 응답을 읽지 못했습니다.");
  }
  const get = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const authResultCode = get("AuthResultCode");
  const moid = get("Moid");
  const amt = get("Amt");

  if (authResultCode !== "0000") {
    await recordPayment({
      moid,
      amt,
      status: "failed",
      resultCode: authResultCode || "auth_fail",
      resultMsg: get("AuthResultMsg") || "인증 실패",
      tid: get("TxTid"),
    });
    fail("결제 인증에 실패했습니다. 다시 시도해주세요.");
  }

  const nextAppUrl = get("NextAppURL");
  const authToken = get("AuthToken");
  const txTid = get("TxTid");
  const { mid, merchantKey } = getNicepayConfig();

  // 위조 방지 — NextAppURL은 반드시 나이스페이 도메인이어야 합니다
  if (!/^https:\/\/[a-z0-9.-]+\.nicepay\.co\.kr\//.test(nextAppUrl)) {
    fail("승인 주소가 올바르지 않습니다.");
  }

  const ediDate = nicepayEdiDate();
  const body = new URLSearchParams({
    TID: txTid,
    AuthToken: authToken,
    MID: mid,
    Amt: amt,
    EdiDate: ediDate,
    SignData: signApproval(authToken, mid, amt, ediDate, merchantKey),
    CharSet: "utf-8",
  });

  let result: Record<string, string> = {};
  try {
    const response = await fetch(nextAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    try {
      result = JSON.parse(text) as Record<string, string>;
    } catch {
      // JSON이 아니면 querystring 형태로 해석
      result = Object.fromEntries(new URLSearchParams(text));
    }
  } catch (error) {
    console.error("[나이스페이] 승인 요청 실패:", error);
    fail("결제 승인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  const resultCode = result.ResultCode ?? "";
  // 카드 3001 · 계좌이체 4000 · 가상계좌 4100 · 휴대폰 A000
  const isPaid = ["3001", "4000", "4100", "A000"].includes(resultCode);

  await recordPayment({
    moid,
    amt,
    status: isPaid ? "paid" : "failed",
    resultCode,
    resultMsg: result.ResultMsg ?? "",
    tid: result.TID ?? txTid,
  });

  if (!isPaid) {
    console.error("[나이스페이] 승인 실패", resultCode, result.ResultMsg);
    fail("결제 승인에 실패했습니다. 카드사 승인 결과를 확인해주세요.");
  }

  redirect(`${DONE}?result=ok&amt=${encodeURIComponent(amt)}`);
}

/** 결제 이력 기록 — 실패해도 결제 흐름(redirect)은 막지 않습니다 */
async function recordPayment(input: {
  moid: string;
  amt: string;
  status: "paid" | "failed";
  resultCode: string;
  resultMsg: string;
  tid: string;
}): Promise<void> {
  try {
    // Moid 형식: voucher-<memberId>-<timestamp> — 회원을 되찾습니다
    const memberId = /^voucher-([0-9a-f-]{36})-\d+$/.exec(input.moid)?.[1] ?? null;

    const supabase = await createClient();
    let buyerName = "회원";
    let buyerTel: string | null = null;
    if (memberId) {
      const { data: member } = await supabase
        .from("members")
        .select("name, phone")
        .eq("id", memberId)
        .maybeSingle();
      if (member) {
        buyerName = member.name;
        buyerTel = member.phone;
      }
    }

    await supabase.from("voucher_payments").insert({
      member_id: memberId,
      buyer_name: buyerName,
      buyer_tel: buyerTel,
      amount: Number(input.amt) || 0,
      status: input.status,
      moid: input.moid || `unknown-${Date.now()}`,
      tid: input.tid || null,
      result_code: input.resultCode || null,
      result_msg: input.resultMsg || null,
      paid_at: input.status === "paid" ? new Date().toISOString() : null,
    });
  } catch (error) {
    console.error("[나이스페이] 결제 기록 실패:", error);
  }
}
