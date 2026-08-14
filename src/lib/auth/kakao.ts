/**
 * 카카오 로그인 (OAuth 2.0).
 *
 * 개발자센터: https://developers.kakao.com/console/app
 *  · 카카오 로그인 > Redirect URI 에 등록
 *      https://korhrd-lms.vercel.app/api/auth/kakao/callback
 *      http://localhost:3000/api/auth/kakao/callback
 *  · 동의항목에서 **이름·전화번호**를 켜야 기존 회원과 이어붙일 수 있습니다.
 *    이 두 항목은 **비즈니스 앱 전환 + 검수**가 필요합니다(네이버의 휴대전화번호와 같습니다).
 *    검수 전에는 닉네임·이메일만 받아지며, 그 경우 신규 가입만 됩니다.
 *  · 앱 키는 **REST API 키**를 씁니다(JavaScript 키 아님).
 *
 * 서버 전용입니다. NEXT_PUBLIC_ 을 붙이면 시크릿이 브라우저로 새어 나갑니다.
 */
const AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
const TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const PROFILE_URL = "https://kapi.kakao.com/v2/user/me";

export type KakaoConfig = {
  restApiKey: string;
  /** 보안 > Client Secret 을 켠 경우에만 씁니다. 안 켰으면 비워 두면 됩니다. */
  clientSecret: string | null;
  callbackUrl: string;
};

export function getKakaoConfig(requestOrigin?: string): KakaoConfig | null {
  const restApiKey = process.env.KAKAO_REST_API_KEY?.trim();
  if (!restApiKey) return null;

  // Redirect URI 는 카카오에 등록한 값과 **문자 하나까지 같아야** 합니다.
  // 접속한 도메인(requestOrigin)을 우선 사용 — korhrd.co.kr / www / vercel.app
  // 어디로 들어와도 그 도메인으로 콜백이 돌아와 세션 쿠키가 어긋나지 않습니다.
  const base = (
    requestOrigin ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return {
    restApiKey,
    clientSecret: process.env.KAKAO_CLIENT_SECRET?.trim() || null,
    callbackUrl: `${base}/api/auth/kakao/callback`,
  };
}

export function buildKakaoAuthUrl(config: KakaoConfig, state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.restApiKey,
    redirect_uri: config.callbackUrl,
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export type KakaoProfile = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
};

export async function exchangeKakaoCode(
  config: KakaoConfig,
  code: string,
): Promise<string | null> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.restApiKey,
    redirect_uri: config.callbackUrl,
    code,
  });
  if (config.clientSecret) body.set("client_secret", config.clientSecret);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[kakao] 토큰 발급 실패", res.status, await res.text());
    return null;
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    console.error("[kakao] 토큰 응답에 access_token 없음");
    return null;
  }
  return json.access_token;
}

type KakaoMeResponse = {
  id?: number | string;
  kakao_account?: {
    name?: string;
    email?: string;
    phone_number?: string;
    birthyear?: string;
    /** "MMDD" 형식입니다(네이버의 "MM-DD" 와 다릅니다) */
    birthday?: string;
    profile?: { nickname?: string };
  };
};

export async function fetchKakaoProfile(accessToken: string): Promise<KakaoProfile | null> {
  const res = await fetch(PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[kakao] 프로필 조회 실패", res.status);
    return null;
  }

  const json = (await res.json()) as KakaoMeResponse;
  if (!json.id) {
    console.error("[kakao] 프로필 응답에 id 없음");
    return null;
  }

  const account = json.kakao_account ?? {};
  // 실명(name)은 검수받은 앱만 옵니다. 없으면 닉네임으로 대신합니다.
  const name = account.name?.trim() || account.profile?.nickname?.trim() || null;

  return {
    id: String(json.id),
    name,
    phone: account.phone_number ?? null,
    email: account.email ?? null,
    birthDate: toBirthDate(account.birthyear, account.birthday),
  };
}

/** 카카오는 생일을 "0320" 처럼 붙여서 줍니다 */
function toBirthDate(year?: string, day?: string): string | null {
  if (!year || !day || day.length !== 4) return null;
  return `${year}-${day.slice(0, 2)}-${day.slice(2)}`;
}
