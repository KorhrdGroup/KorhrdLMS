import { getPayAppConfig } from "@/features/payments/payapp/payapp.config";

/**
 * PayApp 설정 점검용.
 *
 * 배포 환경변수가 실제로 들어갔는지 확인할 방법이 없어 매번 결제 버튼을 눌러
 * 확인해야 했습니다. 여기서는 **값이 아니라 있고 없음(true/false)만** 알려줍니다.
 * 키·아이디 같은 실제 값은 절대 내보내지 않습니다.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const config = getPayAppConfig();

  const has = (name: string) => Boolean(process.env[name]?.trim());

  return Response.json({
    // 결제창을 열 수 있는 상태인지
    결제창_열림: config !== null,
    // 결제 결과 통보를 받아들일 수 있는 상태인지
    결제완료_처리가능: Boolean(config?.linkKey && config?.linkValue),
    환경변수: {
      PAYAPP_USER_ID: has("PAYAPP_USER_ID"),
      PAYAPP_USERID: has("PAYAPP_USERID"),
      PAYAPP_LINK_KEY: has("PAYAPP_LINK_KEY"),
      PAYAPP_LINK_VALUE: has("PAYAPP_LINK_VALUE"),
      PAYAPP_SHOP_NAME: has("PAYAPP_SHOP_NAME"),
      NEXT_PUBLIC_SITE_URL: has("NEXT_PUBLIC_SITE_URL"),
      NEXT_PUBLIC_BASE_URL: has("NEXT_PUBLIC_BASE_URL"),
    },
    // 통보 URL이 PayApp에 올바르게 전달되는지 눈으로 확인하는 용도
    통보주소: config ? `${config.siteUrl}/api/payapp/feedback` : null,
    // 테스트 소액 결제가 켜져 있는지 (켜져 있으면 그 계정만 소액으로 결제됩니다)
    테스트결제: config?.testLoginId
      ? { 대상계정: config.testLoginId, 금액: config.testAmount }
      : "꺼짐 (정상 금액으로 결제)",
  });
}
