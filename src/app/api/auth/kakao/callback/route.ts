import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loginWithSocial, setStudentSession } from "@/features/auth/services/social-login.service";
import { exchangeKakaoCode, fetchKakaoProfile, getKakaoConfig } from "@/lib/auth/kakao";
import { getRequestOrigin } from "@/lib/auth/request-origin";

import { KAKAO_REDIRECT_COOKIE, KAKAO_STATE_COOKIE } from "../start/route";

/**
 * 카카오 로그인 콜백 — 카카오 개발자센터에 등록하는 Redirect URI 입니다.
 *   https://korhrd-lms.vercel.app/api/auth/kakao/callback
 *   http://localhost:3000/api/auth/kakao/callback
 *
 * 실패 사유는 화면에 노출하지 않고 서버 로그에만 남깁니다(네이버와 동일).
 */
export const dynamic = "force-dynamic";

function fail(reason: string): never {
  redirect(`/login?social=${reason}`);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get(KAKAO_STATE_COOKIE)?.value;
  const target = cookieStore.get(KAKAO_REDIRECT_COOKIE)?.value;
  cookieStore.delete(KAKAO_STATE_COOKIE);
  cookieStore.delete(KAKAO_REDIRECT_COOKIE);

  if (error) fail("cancelled");
  if (!code || !state) fail("failed");
  if (!savedState || savedState !== state) fail("failed");

  const config = getKakaoConfig(getRequestOrigin(request));
  if (!config) fail("unavailable");

  const accessToken = await exchangeKakaoCode(config, code);
  if (!accessToken) fail("failed");

  const profile = await fetchKakaoProfile(accessToken);
  if (!profile) fail("failed");

  const result = await loginWithSocial("kakao", profile);
  if (!result.success) {
    console.error("[kakao] 로그인 처리 실패", result.message);
    fail("failed");
  }

  await setStudentSession(result.memberId);

  const safe = target?.startsWith("/") && !target.startsWith("//") ? target : "/mylecture";
  redirect(result.isNew ? "/mylecture?welcome=social" : safe);
}
