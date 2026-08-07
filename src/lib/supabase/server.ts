import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database.types";

/**
 * 데이터 조회용 클라이언트 — **쿠키를 읽지 않습니다.**
 *
 * 학생 화면은 Supabase Auth를 쓰지 않습니다(멤버 세션은 members 테이블 + httpOnly
 * 쿠키). 그런데 예전에는 이 클라이언트도 브라우저 쿠키를 읽어서, 같은 브라우저로
 * 어드민에 로그인한 적이 있으면 남아 있던 `sb-*-auth-token` 이 학생 요청에 딸려
 * 갔습니다. supabase-js 는 쿼리마다 세션을 확인하고 토큰이 만료됐으면 갱신을
 * 요청하는데(GoTrueClient `__loadSession` → `_callRefreshToken`), 한 화면에서
 * 쿼리가 여러 번 나가니 갱신 요청이 무더기로 쌓여
 * `429 over_request_rate_limit` 이 났습니다.
 *
 * 쿠키를 끊으면 갱신 요청 자체가 사라집니다. RLS 정책이 anon 을 허용하고 있어
 * 조회에는 영향이 없습니다.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createSupabaseClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * 관리자 인증용 클라이언트 — Supabase Auth 세션(쿠키)을 다룹니다.
 *
 * `auth.*` 를 호출하는 곳에서만 쓰세요. 단순 조회에는 위의 `createClient()` 를
 * 쓰면 됩니다. (쿠키를 읽는 클라이언트를 조회에까지 쓰면 위에 적은 갱신 폭주가
 * 다시 생깁니다)
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서 호출 시 쿠키 설정이 무시될 수 있습니다.
        }
      },
    },
  });
}
