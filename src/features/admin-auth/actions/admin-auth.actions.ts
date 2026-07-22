"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_MARKER_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/features/admin-auth/constants";
import { createClient } from "@/lib/supabase/server";

/** 로그아웃 시 접속기록의 logged_out_at을 채우기 위한 현재 접속기록 id 쿠키 */
const ADMIN_ACCESS_LOG_COOKIE = "admin_access_log_id";

async function getClientIp() {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * 로그인 성공 시 admin_users에 계정을 확보(없으면 생성)하고
 * admin_access_logs에 접속 기록을 남깁니다. 기록 실패가 로그인 자체를
 * 막아서는 안 되므로 오류는 조용히 무시합니다.
 */
async function recordAdminAccess(email: string, name: string) {
  try {
    const supabase = await createClient();

    let { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("login_id", email)
      .maybeSingle();

    if (!adminUser) {
      const { data: inserted } = await supabase
        .from("admin_users")
        .insert({ login_id: email, name, admin_type: "admin" })
        .select("id")
        .single();
      adminUser = inserted;
    }

    if (!adminUser) return;

    const { data: log } = await supabase
      .from("admin_access_logs")
      .insert({
        admin_user_id: adminUser.id,
        access_ip: await getClientIp(),
        logged_in_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (log) {
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_ACCESS_LOG_COOKIE, log.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/admin",
        maxAge: 60 * 60 * 24,
      });
    }
  } catch {
    // 접속기록 실패는 무시(로그인 흐름 유지)
  }
}

/** 로그아웃 시 열려 있는 접속기록에 로그아웃 시각을 기록합니다. */
async function closeAdminAccessLog() {
  try {
    const cookieStore = await cookies();
    const logId = cookieStore.get(ADMIN_ACCESS_LOG_COOKIE)?.value;
    if (!logId) return;

    const supabase = await createClient();
    await supabase
      .from("admin_access_logs")
      .update({ logged_out_at: new Date().toISOString() })
      .eq("id", logId)
      .is("logged_out_at", null);

    cookieStore.delete(ADMIN_ACCESS_LOG_COOKIE);
  } catch {
    // 기록 실패는 무시(로그아웃 흐름 유지)
  }
}

/**
 * 관리자 로그인: Supabase Authentication(auth.users) 이메일/비밀번호 인증.
 * 성공 시 @supabase/ssr가 세션 쿠키를 설정하고 /admin으로 이동합니다.
 * 실패 시에만 값을 반환합니다(성공 시 redirect로 함수가 종료됨).
 */
export async function loginAdminAction(input: { email: string; password: string }) {
  const email = input.email.trim();
  // 복사/붙여넣기로 딸려오는 앞뒤 공백·줄바꿈 때문에 인증이 실패하는 사례를 방어합니다.
  const password = input.password.trim();

  if (!email || !password) {
    return {
      success: false as const,
      message: "이메일과 비밀번호를 입력해주세요.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false as const,
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const displayName =
    (data.user?.user_metadata?.name as string | undefined) ?? "관리자";
  await recordAdminAccess(email, displayName);

  // 24시간 세션 만료 마커. 이 쿠키가 만료되면 proxy가 재로그인을 요구합니다.
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_MARKER_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAdminAction() {
  await closeAdminAccessLog();

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_MARKER_COOKIE);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
