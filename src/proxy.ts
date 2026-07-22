import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_MARKER_COOKIE } from "@/features/admin-auth/constants";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * 관리자 영역 접근 제어 (Next.js 16 proxy = 구 middleware).
 * - /admin/* 요청 시 Supabase Authentication 세션을 확인/갱신하고,
 *   미인증이면 /admin/login으로 보냅니다.
 * - 이미 로그인된 상태로 /admin/login에 오면 /admin으로 보냅니다.
 * 학생 영역(멤버 세션 쿠키 방식)은 이 proxy의 대상이 아닙니다.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser()는 토큰을 검증하고 필요 시 세션을 갱신합니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";

  // 24시간 세션 마커. Supabase 세션은 자동 갱신되므로, 이 마커가 만료되면(24시간 경과)
  // 유효한 세션이라도 재로그인을 요구합니다.
  const hasSessionMarker = Boolean(request.cookies.get(ADMIN_SESSION_MARKER_COOKIE)?.value);
  const isAuthed = Boolean(user) && hasSessionMarker;

  if (!isAuthed && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthed && isLoginPage) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
