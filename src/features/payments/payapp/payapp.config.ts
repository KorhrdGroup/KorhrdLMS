/**
 * PayApp 연동 설정.
 *
 * 값은 전부 환경변수입니다(.env.local / 배포 환경변수). 저장소는 공개라
 * 어떤 값도 코드에 적지 마세요.
 *
 *   PAYAPP_USER_ID     PayApp 가맹점 아이디
 *   PAYAPP_LINK_KEY    연동 KEY   — 결제결과 통보가 진짜인지 확인할 때 씁니다
 *   PAYAPP_LINK_VALUE  연동 VALUE — 위와 같음
 *   PAYAPP_SHOP_NAME   결제창에 보일 상호(선택)
 *   NEXT_PUBLIC_SITE_URL  https://... 배포 주소. 통보 URL을 만들 때 씁니다
 *
 * KEY/VALUE는 PayApp 관리자 > 환경설정 > 연동정보에서 확인합니다.
 */
export const PAYAPP_API_URL = "https://api.payapp.kr/oapi/apiLoad.html";

export type PayAppConfig = {
  userId: string;
  linkKey: string;
  linkValue: string;
  shopName: string;
  siteUrl: string;
  /** 아래 두 값이 모두 있을 때만 테스트 결제금액이 적용됩니다 */
  testLoginId: string | null;
  testAmount: number | null;
};

/**
 * 설정이 다 갖춰졌을 때만 객체를 돌려줍니다. 하나라도 비어 있으면 null이고,
 * 호출부는 결제를 건너뛰고 기존 무통장입금 안내로 돌아갑니다
 * (키를 넣기 전에도 신청 자체는 계속 되도록 하기 위함입니다).
 */
export function getPayAppConfig(): PayAppConfig | null {
  const userId = process.env.PAYAPP_USER_ID?.trim();
  const linkKey = process.env.PAYAPP_LINK_KEY?.trim();
  const linkValue = process.env.PAYAPP_LINK_VALUE?.trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!userId || !linkKey || !linkValue || !siteUrl) {
    return null;
  }

  // 테스트 결제: PayApp에는 테스트 서버가 없어 실제 결제로만 확인할 수 있습니다.
  // 그래서 **지정한 테스트 계정 한 개만** 소액(기본 1,000원)으로 결제되게 합니다.
  // 계정 아이디를 함께 요구하는 이유: 값이 실수로 운영에 남아도 일반 회원의
  // 결제금액은 절대 바뀌지 않게 하기 위함입니다.
  const testLoginId = process.env.PAYAPP_TEST_LOGIN_ID?.trim() || null;
  const parsedTestAmount = Number(process.env.PAYAPP_TEST_AMOUNT);
  const testAmount =
    testLoginId && Number.isFinite(parsedTestAmount) && parsedTestAmount >= 1000
      ? Math.floor(parsedTestAmount)
      : null;

  return {
    userId,
    linkKey,
    linkValue,
    shopName: process.env.PAYAPP_SHOP_NAME?.trim() || "한평생 직업훈련",
    siteUrl: siteUrl.replace(/\/$/, ""),
    testLoginId: testAmount ? testLoginId : null,
    testAmount,
  };
}

/** PayApp이 결제 결과를 보내올 주소. 공개 주소여야 하며 localhost로는 통보가 오지 않습니다. */
export function getFeedbackUrl(config: PayAppConfig) {
  return `${config.siteUrl}/api/payapp/feedback`;
}

/** 결제 후 사용자가 돌아올 주소. */
export function getReturnUrl(config: PayAppConfig, applicationId: string) {
  return `${config.siteUrl}/certificate/complete?id=${applicationId}`;
}

/**
 * PayApp 결제상태(pay_state) — 문서 기준입니다.
 * 1 요청 · 4 결제완료 · 8·32 요청취소 · 9·64 결제취소 · 10 가상계좌 입금대기 · 70·71 부분취소
 */
export const PAY_STATE = {
  requested: 1,
  paid: 4,
  awaitingDeposit: 10,
} as const;

export const PAY_STATE_REQUEST_CANCELED = [8, 32];
export const PAY_STATE_PAYMENT_CANCELED = [9, 64];
export const PAY_STATE_PARTIAL_CANCELED = [70, 71];
