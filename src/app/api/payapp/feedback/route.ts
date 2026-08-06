import { applyPayAppFeedback } from "@/features/payments/payapp/payapp.service";

/**
 * PayApp 결제결과 통보(webhook).
 *
 * PayApp이 결제 상태가 바뀔 때마다 이 주소로 form-encoded POST를 보냅니다.
 * 규칙 두 가지를 지켜야 합니다.
 *   1. 본문에 `SUCCESS` 를 담아 200으로 답해야 합니다. 아니면 재시도가 계속됩니다.
 *   2. 통보의 진위는 linkkey/linkval 로만 판별합니다(service에서 확인).
 *
 * 이 라우트는 로그인 없이 열려 있습니다 — PayApp 서버가 부르기 때문입니다.
 * 그래서 키 검증이 유일한 방어선이고, 금액도 서버가 다시 대조합니다.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("FAIL", { status: 400 });
  }

  const value = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v : undefined;
  };

  try {
    const result = await applyPayAppFeedback({
      linkkey: value("linkkey"),
      linkval: value("linkval"),
      mul_no: value("mul_no"),
      pay_state: value("pay_state"),
      price: value("price"),
      var1: value("var1"),
      pay_type: value("pay_type"),
    });

    if (!result.ok) {
      // 키 불일치 등은 재시도해도 달라지지 않으므로 200이 아닌 응답으로 끝냅니다.
      console.error("[payapp] 통보 처리 실패:", result.reason);
      return new Response("FAIL", { status: 400 });
    }

    return new Response("SUCCESS", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    // 여기서 500을 주면 PayApp이 다시 보냅니다(일시적 DB 오류 등에는 그게 맞습니다).
    console.error("[payapp] 통보 처리 중 오류:", error);
    return new Response("FAIL", { status: 500 });
  }
}
