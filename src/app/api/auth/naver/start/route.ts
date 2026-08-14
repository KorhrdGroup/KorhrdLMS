import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { buildNaverAuthUrl, getNaverConfig } from "@/lib/auth/naver";
import { getRequestOrigin } from "@/lib/auth/request-origin";

/**
 * 네이버 로그인 시작 — 네이버 인증 화면으로 보냅니다.
 *
 * `state` 는 위조 요청(CSRF)을 막는 값입니다. 여기서 만들어 쿠키에 넣어두고,
 * 콜백에서 돌아온 값과 같은지 확인합니다.
 */
export const dynamic = "force-dynamic";

export const NAVER_STATE_COOKIE = "naver_oauth_state";
export const NAVER_REDIRECT_COOKIE = "naver_oauth_redirect";

export async function GET(request: Request) {
  const config = getNaverConfig(getRequestOrigin(request));
  if (!config) {
    redirect("/login?social=unavailable");
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(NAVER_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 300,
  });

  // 로그인 후 돌아갈 곳. 열린 리다이렉트를 막으려고 내부 경로만 받습니다.
  const target = new URL(request.url).searchParams.get("redirect");
  if (target?.startsWith("/") && !target.startsWith("//")) {
    cookieStore.set(NAVER_REDIRECT_COOKIE, target, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 300,
    });
  }

  redirect(buildNaverAuthUrl(config, state));
}
