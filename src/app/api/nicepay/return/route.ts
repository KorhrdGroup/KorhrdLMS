import { redirect } from "next/navigation";

import { getNicepayConfig, nicepayEdiDate, signApproval } from "@/lib/nicepay/nicepay";
import { createClient } from "@/lib/supabase/server";

/**
 * 나이스페이 인증 결과 수신 → 승인 API 호출 → 결제 기록.
 *
 * PC는 결제창 인증 후 우리 폼이 이 주소로 제출되고, 모바일은 나이스페이가
 * ReturnURL(이 주소)로 직접 POST 합니다. 여기서 승인 API(NextAppURL)까지
 * 성공해야 결제 완료입니다.
 *
 * 금액(Amt)은 나이스페이 콜백에 실려오지 않는 경우가 있어(모바일),
 * 결제 준비 때 기록해 둔 voucher_payments(ready) 행에서 찾습니다.
 */

export const dynamic = "force-dynamic";

const DONE = "/voucher/done";

function fail(message: string): never {
  redirect(`${DONE}?result=fail&message=${encodeURIComponent(message)}`);
}

export async function POST(request: Request) {
  /* 나이스페이는 본문을 EUC-KR(x-www-form-urlencoded)로 보낼 수 있어
     request.formData()가 필드를 못 읽는 경우가 있다 — 원시 바이트를 받아
     직접 디코드해 파싱한다. */
  let params: URLSearchParams;
  try {
    const raw = Buffer.from(await request.arrayBuffer());
    const contentType = request.headers.get("content-type") ?? "";
    const text = /euc-?kr|ksc/i.test(contentType)
      ? (await import("iconv-lite")).default.decode(raw, "euc-kr")
      : raw.toString("utf8");
    params = new URLSearchParams(text);
  } catch (error) {
    console.error("[나이스페이] 콜백 본문 파싱 실패:", error);
    fail("결제 응답을 읽지 못했습니다.");
  }
  // 어떤 필드가 오는지 진단용 (값은 남기지 않음)
  console.log("[나이스페이] 콜백 필드:", [...params.keys()].join(","), "/", request.headers.get("content-type"));

  const get = (key: string) => (params.get(key) ?? "").trim();

  const authResultCode = get("AuthResultCode");
  const moid = get("Moid");

  // 결제 준비 때 기록해 둔 주문 — 금액의 기준이자 위조 검증 수단입니다
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("voucher_payments")
    .select("id, amount, status")
    .eq("moid", moid)
    .maybeSingle();

  const amt = order ? String(order.amount) : get("Amt");

  const markResult = async (
    status: "paid" | "failed",
    resultCode: string,
    resultMsg: string,
    tid: string,
  ) => {
    try {
      if (order) {
        await supabase
          .from("voucher_payments")
          .update({
            status,
            result_code: resultCode || null,
            result_msg: resultMsg || null,
            tid: tid || null,
            paid_at: status === "paid" ? new Date().toISOString() : null,
          })
          .eq("id", order.id);
      }
    } catch (error) {
      console.error("[나이스페이] 결제 기록 실패:", error);
    }
  };

  if (authResultCode !== "0000") {
    await markResult("failed", authResultCode || "auth_fail", get("AuthResultMsg") || "인증 실패", get("TxTid"));
    fail("결제 인증에 실패했습니다. 다시 시도해주세요.");
  }

  if (!order) {
    console.error("[나이스페이] 주문을 찾을 수 없음:", moid);
    fail("주문 정보를 찾을 수 없습니다. 다시 시도해주세요.");
  }
  if (order.status === "paid") {
    // 새로고침 등으로 콜백이 중복 도착 — 이미 완료된 결제는 그대로 성공 안내
    redirect(`${DONE}?result=ok&amt=${encodeURIComponent(amt)}`);
  }

  const nextAppUrl = get("NextAppURL");
  const authToken = get("AuthToken");
  const txTid = get("TxTid");
  const { mid, merchantKey } = getNicepayConfig();

  // 위조 방지 — NextAppURL은 반드시 나이스페이 도메인이어야 합니다
  if (!/^https:\/\/[a-z0-9.-]+\.nicepay\.co\.kr\//.test(nextAppUrl)) {
    await markResult("failed", "bad_next_url", "승인 주소 비정상", txTid);
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
    await markResult("failed", "approve_error", "승인 요청 실패", txTid);
    fail("결제 승인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  const resultCode = result.ResultCode ?? "";
  // 카드 3001 · 계좌이체 4000 · 가상계좌 4100 · 휴대폰 A000
  const isPaid = ["3001", "4000", "4100", "A000"].includes(resultCode);

  await markResult(isPaid ? "paid" : "failed", resultCode, result.ResultMsg ?? "", result.TID ?? txTid);

  if (!isPaid) {
    console.error("[나이스페이] 승인 실패", resultCode, result.ResultMsg);
    fail("결제 승인에 실패했습니다. 카드사 승인 결과를 확인해주세요.");
  }

  redirect(`${DONE}?result=ok&amt=${encodeURIComponent(amt)}`);
}
