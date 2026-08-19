"use server";

import { cookies } from "next/headers";

import { ADMIN_SESSION_MARKER_COOKIE } from "@/features/admin-auth/constants";
import { setStudentSession } from "@/features/auth/services/social-login.service";
import { createAuthClient, createClient } from "@/lib/supabase/server";

export type ImpersonateMemberResult =
  | { success: true; memberName: string }
  | { success: false; message: string };

/**
 * 학생 대리 로그인 — 발급신청 등을 어려워하는 학생을 관리자가 대신 처리할 때,
 * 그 학생의 세션 쿠키를 관리자 브라우저에 심어 학생 화면으로 들어갑니다.
 *
 * 학생 로그인은 가입 경로(일반·네이버·카카오)와 무관하게 같은 세션 쿠키(회원 id)
 * 하나라서, 소셜 가입 회원도 비밀번호 없이 동일하게 들어갈 수 있습니다.
 * 관리자 세션은 별도 쿠키라 그대로 유지됩니다 — 학생 화면에서 로그아웃하면
 * 학생 세션만 지워집니다.
 */
export async function impersonateMemberAction(
  memberId: string,
): Promise<ImpersonateMemberResult> {
  // 1) 관리자 확인 — 마커 쿠키 + 실제 어드민 로그인(Supabase Auth) 둘 다 요구합니다
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_SESSION_MARKER_COOKIE)) {
    return { success: false, message: "관리자만 사용할 수 있습니다." };
  }

  /* auth.* 는 쿠키를 읽는 인증용 클라이언트로만 — 조회용 createClient() 는
     세션 쿠키를 안 읽어 getUser() 가 항상 null 이 됩니다 */
  const authClient = await createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return { success: false, message: "관리자 로그인이 만료되었습니다. 다시 로그인해주세요." };
  }

  // 2) 대상 회원 확인
  const supabase = await createClient();
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name, status, deleted_at")
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!member || member.deleted_at !== null) {
    return { success: false, message: "회원을 찾을 수 없습니다." };
  }

  if (member.status !== "active") {
    return { success: false, message: "이용 중인 회원이 아니라 대리 로그인할 수 없습니다." };
  }

  // 3) 학생 세션 쿠키 심기 (일반 로그인과 같은 쿠키·기간)
  await setStudentSession(member.id);

  return { success: true, memberName: member.name };
}
