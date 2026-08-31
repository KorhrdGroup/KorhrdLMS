import { createHash } from "crypto";

/**
 * 나이스페이 웹 결제창(v3 webstd) 연동.
 *
 * 흐름: 결제창 호출(goPay) → 인증 응답이 우리 서버(/api/nicepay/return)로 POST →
 * 응답의 NextAppURL로 승인 API 호출 → 성공 시 결제 기록.
 * 서명(SignData)은 반드시 서버에서 만듭니다 — MerchantKey가 노출되면 안 됩니다.
 *
 * 환경변수 NICEPAY_MID / NICEPAY_MERCHANT_KEY 미설정 시 나이스페이가 공개해 둔
 * 테스트 상점(nicepay00m)으로 동작합니다 — 실결제 없이 결제창 흐름만 확인용.
 * 실서비스 전 반드시 실제 상점 키를 Vercel에 등록하세요.
 */

const TEST_MID = "nicepay00m";
const TEST_MERCHANT_KEY =
  "EYzu8jGGMfqaDEp76gSckuvnaHHu+bC4opsSN6lHv3b2lurNYkVXrZ7Z1AoqQnXI3eLuaUFyoRNC6FkrzVjceg==";

export function getNicepayConfig() {
  const mid = process.env.NICEPAY_MID?.trim() || TEST_MID;
  const merchantKey = process.env.NICEPAY_MERCHANT_KEY?.trim() || TEST_MERCHANT_KEY;
  return { mid, merchantKey, isTest: mid === TEST_MID };
}

/** YYYYMMDDHHMISS (KST) — 나이스페이 EdiDate 규격 */
export function nicepayEdiDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour") === "24" ? "00" : get("hour")}${get("minute")}${get("second")}`;
}

const sha256hex = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");

/** 결제창 요청 서명 — hex(sha256(EdiDate + MID + Amt + MerchantKey)) */
export function signPaymentRequest(ediDate: string, mid: string, amt: string, merchantKey: string) {
  return sha256hex(ediDate + mid + amt + merchantKey);
}

/** 승인 요청 서명 — hex(sha256(AuthToken + MID + Amt + EdiDate + MerchantKey)) */
export function signApproval(authToken: string, mid: string, amt: string, ediDate: string, merchantKey: string) {
  return sha256hex(authToken + mid + amt + ediDate + merchantKey);
}

/** 승인 응답 검증 — hex(sha256(TID + MID + Amt + MerchantKey)) */
export function signApprovalResponse(tid: string, mid: string, amt: string, merchantKey: string) {
  return sha256hex(tid + mid + amt + merchantKey);
}
