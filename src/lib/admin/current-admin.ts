import type { AdminRole } from "@/lib/admin/navigation";
import { createAuthClient, createClient } from "@/lib/supabase/server";

/**
 * 현재 로그인한 관리자의 역할.
 *
 * 어드민 레이아웃과 같은 방식으로 auth 세션의 이메일 → admin_users.admin_type 을
 * 조회합니다. 아기관리자(baby_admin)처럼 **데이터 범위까지 제한되는 역할**은
 * 메뉴 숨김만으로는 부족해, 목록 서비스가 이 함수로 역할을 확인하고 쿼리를
 * 좁힙니다. 조회 실패 시 기본 admin(전체 권한)으로 둡니다 — 기존 화면이
 * 역할 조회 오류로 멈추지 않게 하기 위함입니다.
 */
export async function getCurrentAdminRole(): Promise<AdminRole> {
  try {
    const auth = await createAuthClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user?.email) return "admin";

    const db = await createClient();
    const { data } = await db
      .from("admin_users")
      .select("admin_type")
      .eq("login_id", user.email)
      .maybeSingle();
    return (data?.admin_type as AdminRole | undefined) ?? "admin";
  } catch {
    return "admin";
  }
}

/** 아기관리자가 관리하는 파트너스 코드 — 현재는 STAR 하나입니다. */
export const BABY_ADMIN_PARTNER_CODE = "STAR";

/** 아기관리자 여부 — true면 파트너스 코드(STAR) 회원만 보여야 합니다. */
export async function isBabyAdmin(): Promise<boolean> {
  return (await getCurrentAdminRole()) === "baby_admin";
}
