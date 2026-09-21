/**
 * 오피스(korhrd-group-db) 민간자격증 매출파일에 카드결제 건을 등록합니다.
 *
 * 분류 "후납" · 결제수단 "카드결제" 로 들어가고, 민간자격증 발급비라
 * 오피스 쪽에서 비고에 면세(TG02)를 함께 남깁니다.
 * 자격증 발급비(PayApp)와 평생교육이용권(나이스페이) 두 결제가 같은 웹훅을 씁니다 —
 * 이용권은 `remark` 로 "평생교육이용권 결제자임" 을 특이사항 맨 앞에 남깁니다.
 *
 * OFFICE_API_URL / CERT_SALES_WEBHOOK_SECRET 이 없으면 조용히 건너뜁니다.
 * 멱등은 오피스가 ref 로 잡습니다(같은 ref 는 다시 만들지 않음) — 호출 쪽은 결제 1건당
 * 고유한 ref(payapp:{mul_no} · nicepay:{TID})만 보장하면 됩니다.
 */
export async function notifyOfficeCertSale(input: {
  studentName: string;
  phone: string | null;
  amount: number;
  certificateNames: string[];
  ref: string;
  /** 특이사항 맨 앞에 붙일 문구 (예: "평생교육이용권 결제자임") */
  remark?: string;
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
        remark: input.remark ?? null,
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
