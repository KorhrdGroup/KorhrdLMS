import {
  PAYAPP_API_URL,
  getFeedbackUrl,
  getReturnUrl,
  type PayAppConfig,
} from "@/features/payments/payapp/payapp.config";

/**
 * PayApp 결제요청 API 호출부.
 *
 * 요청/응답 모두 form-encoded 이고, 응답은 `state=1&payurl=...` 같은 쿼리스트링
 * 형태로 옵니다(JSON이 아닙니다). state=1이 성공, 0이면 errorMessage가 들어옵니다.
 */
export type PayAppPaymentRequest = {
  /** 신청 건 id — var1로 넘겨 결제결과 통보에서 다시 찾습니다 */
  applicationId: string;
  goodName: string;
  price: number;
  /** 결제 안내를 받을 휴대폰 번호 */
  recvPhone: string;
  buyerName: string;
};

export type PayAppPaymentResult =
  | { success: true; payUrl: string; mulNo: string }
  | { success: false; message: string };

/** "state=1&payurl=https%3A%2F%2F..." 형태의 응답을 풀어냅니다. */
function parseFormResponse(body: string): Record<string, string> {
  const params = new URLSearchParams(body.trim());
  const out: Record<string, string> = {};
  for (const [key, value] of params) {
    out[key] = value;
  }
  return out;
}

export async function requestPayAppPayment(
  config: PayAppConfig,
  request: PayAppPaymentRequest,
): Promise<PayAppPaymentResult> {
  // PayApp 최소 결제금액은 1,000원입니다. 선납 등으로 그보다 적으면 결제창을 열 수 없습니다.
  if (request.price < 1000) {
    return { success: false, message: "결제 금액이 최소 결제금액(1,000원)보다 적습니다." };
  }

  const body = new URLSearchParams({
    cmd: "payrequest",
    userid: config.userId,
    shopname: config.shopName,
    goodname: request.goodName,
    price: String(request.price),
    /* 민간자격증 발급비는 **면세**입니다 — 전액을 면세금액으로 보내야
       PayApp 이 부가세를 계산하지 않고, 현금영수증도 면세(TG02)로 발행됩니다.
       (미입력 시 과세 처리되어 매출·세무가 어긋납니다, 2026-08-20 지시) */
    amount_taxable: "0",
    amount_taxfree: String(request.price),
    amount_vat: "0",
    recvphone: request.recvPhone.replace(/\D/g, ""),
    feedbackurl: getFeedbackUrl(config),
    returnurl: getReturnUrl(config, request.applicationId),
    // 결제결과 통보가 실패하면 최대 10회까지 다시 보내달라는 뜻입니다.
    // 그래서 통보 처리는 여러 번 와도 안전해야 합니다(mul_no 유일키로 막습니다).
    checkretry: "y",
    // 결제 안내 문자는 보내지 않습니다 — 화면에서 바로 결제창으로 넘깁니다.
    smsuse: "n",
    var1: request.applicationId,
    var2: request.buyerName,
  });

  let response: Response;
  try {
    response = await fetch(PAYAPP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
  } catch {
    return { success: false, message: "결제 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요." };
  }

  if (!response.ok) {
    return { success: false, message: `결제 요청이 실패했습니다. (HTTP ${response.status})` };
  }

  const parsed = parseFormResponse(await response.text());

  if (parsed.state !== "1" || !parsed.payurl) {
    return {
      success: false,
      message: parsed.errorMessage?.trim() || "결제 요청이 거절되었습니다.",
    };
  }

  return { success: true, payUrl: parsed.payurl, mulNo: parsed.mul_no ?? "" };
}
