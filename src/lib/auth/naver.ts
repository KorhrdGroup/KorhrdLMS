/**
 * 네이버 로그인 (OAuth 2.0).
 *
 * 개발자센터: https://developers.naver.com/apps
 *  · Callback URL 에 아래 두 개를 등록해야 합니다.
 *      https://korhrd-lms.vercel.app/api/auth/naver/callback
 *      http://localhost:3000/api/auth/naver/callback
 *  · 제공 정보에 **이름·휴대전화번호**를 넣어야 기존 회원과 이어붙일 수 있습니다.
 *    (휴대전화번호는 네이버 검수 승인이 필요한 항목입니다)
 *
 * 서버 전용입니다. NEXT_PUBLIC_ 을 붙이면 시크릿이 브라우저로 새어 나갑니다.
 */
const AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
const TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const PROFILE_URL = "https://openapi.naver.com/v1/nid/me";

export type NaverConfig = { clientId: string; clientSecret: string; callbackUrl: string };

export function getNaverConfig(): NaverConfig | null {
  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  // 콜백 주소는 네이버에 등록한 값과 **문자 하나까지 같아야** 합니다.
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return { clientId, clientSecret, callbackUrl: `${base}/api/auth/naver/callback` };
}

export function buildNaverAuthUrl(config: NaverConfig, state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    state,
  });
  return `${AUTH_URL}?${params}`;
}

export type NaverProfile = {
  id: string;
  name?: string;
  mobile?: string;
  email?: string;
  birthyear?: string;
  birthday?: string;
};

/** 인가 코드를 액세스 토큰으로 바꿉니다 */
export async function exchangeNaverCode(
  config: NaverConfig,
  code: string,
  state: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    state,
  });

  const res = await fetch(`${TOKEN_URL}?${params}`, { cache: "no-store" });
  if (!res.ok) {
    console.error("[naver] 토큰 발급 실패", res.status, await res.text());
    return null;
  }

  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) {
    console.error("[naver] 토큰 응답에 access_token 없음", json.error);
    return null;
  }
  return json.access_token;
}

export async function fetchNaverProfile(accessToken: string): Promise<NaverProfile | null> {
  const res = await fetch(PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[naver] 프로필 조회 실패", res.status);
    return null;
  }

  const json = (await res.json()) as { resultcode?: string; response?: NaverProfile };
  if (json.resultcode !== "00" || !json.response?.id) {
    console.error("[naver] 프로필 응답 이상", json.resultcode);
    return null;
  }
  return json.response;
}

/** 네이버는 생년을 birthyear, 생일을 birthday("03-20")로 따로 줍니다 */
export function toBirthDate(profile: NaverProfile): string | null {
  if (!profile.birthyear || !profile.birthday) return null;
  return `${profile.birthyear}-${profile.birthday}`;
}
