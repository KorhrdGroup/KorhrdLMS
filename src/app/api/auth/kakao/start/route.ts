import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { buildKakaoAuthUrl, getKakaoConfig } from "@/lib/auth/kakao";
import { getRequestOrigin } from "@/lib/auth/request-origin";

/**
 * 카카오 로그인 시작 — 카카오 인증 화면으로 보냅니다.
 * 구조는 네이버(`../../naver/start`)와 같습니다.
 */
export const dynamic = "force-dynamic";

export const KAKAO_STATE_COOKIE = "kakao_oauth_state";
export const KAKAO_REDIRECT_COOKIE = "kakao_oauth_redirect";

export async function GET(request: Request) {
  const config = getKakaoConfig(getRequestOrigin(request));
  if (!config) {
    redirect("/login?social=unavailable");
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(KAKAO_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 300,
  });

  const target = new URL(request.url).searchParams.get("redirect");
  if (target?.startsWith("/") && !target.startsWith("//")) {
    cookieStore.set(KAKAO_REDIRECT_COOKIE, target, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 300,
    });
  }

  redirect(buildKakaoAuthUrl(config, state));
}
