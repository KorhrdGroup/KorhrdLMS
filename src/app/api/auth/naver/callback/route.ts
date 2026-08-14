import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loginWithSocial, setStudentSession } from "@/features/auth/services/social-login.service";
import {
  exchangeNaverCode,
  fetchNaverProfile,
  getNaverConfig,
  toBirthDate,
} from "@/lib/auth/naver";

import { NAVER_REDIRECT_COOKIE, NAVER_STATE_COOKIE } from "../start/route";

/**
 * 네이버 로그인 콜백 — 네이버 개발자센터에 등록하는 주소입니다.
 *   https://korhrd-lms.vercel.app/api/auth/naver/callback
 *   http://localhost:3000/api/auth/naver/callback
 *
 * 실패해도 사유를 그대로 노출하지 않고 로그인 화면으로 돌려보냅니다.
 * (자세한 원인은 서버 로그에만 남깁니다)
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
  const savedState = cookieStore.get(NAVER_STATE_COOKIE)?.value;
  const target = cookieStore.get(NAVER_REDIRECT_COOKIE)?.value;
  cookieStore.delete(NAVER_STATE_COOKIE);
  cookieStore.delete(NAVER_REDIRECT_COOKIE);

  // 사용자가 동의 화면에서 취소한 경우
  if (error) fail("cancelled");
  if (!code || !state) fail("failed");
  // 위조 요청 차단 — 우리가 보낸 state 와 같아야 합니다
  if (!savedState || savedState !== state) fail("failed");

  const config = getNaverConfig(new URL(request.url).origin);
  if (!config) fail("unavailable");

  const accessToken = await exchangeNaverCode(config, code, state);
  if (!accessToken) fail("failed");

  const profile = await fetchNaverProfile(accessToken);
  if (!profile) fail("failed");

  const result = await loginWithSocial("naver", {
    id: profile.id,
    name: profile.name,
    phone: profile.mobile,
    email: profile.email,
    birthDate: toBirthDate(profile),
  });

  if (!result.success) {
    console.error("[naver] 로그인 처리 실패", result.message);
    fail("failed");
  }

  await setStudentSession(result.memberId);

  // 처음 가입한 회원은 아이디·비밀번호가 없습니다. 마이페이지에서 정하도록 안내합니다.
  const safe = target?.startsWith("/") && !target.startsWith("//") ? target : "/mylecture";
  redirect(result.isNew ? "/mylecture?welcome=social" : safe);
}
