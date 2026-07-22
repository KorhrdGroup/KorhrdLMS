import { redirect } from "next/navigation";

import { getStudentSessionMember } from "@/features/auth/services/student-login.service";
import { MOCK_IS_LOGGED_IN, MOCK_USER_ID, MOCK_USER_NAME } from "@/lib/mock-auth";

/**
 * ⚠️ TEMP DEV/QA HELPER — remove together with `MOCK_IS_LOGGED_IN`. ⚠️
 *
 * Used by pages (e.g. /classroom) that are backed by the real Supabase
 * member session (`getStudentSessionMember`). When `MOCK_IS_LOGGED_IN` is
 * `true`, returns a mock member (`MOCK_USER_ID` / `MOCK_USER_NAME`) instead
 * of checking the real session, so those pages can be reviewed before real
 * login is connected. When `false`, falls through to the real session
 * check unchanged.
 *
 * Split out from `src/lib/mock-auth.ts` because this depends on
 * `getStudentSessionMember` (→ `next/headers`), which must never end up in a
 * client bundle — `mock-auth.ts` itself is also imported by client
 * components for its plain constants (e.g. `MOCK_USER_NAME`).
 */
export async function getMockableStudentMember() {
  if (MOCK_IS_LOGGED_IN) {
    return { id: MOCK_USER_ID, loginId: "mock-login", name: MOCK_USER_NAME };
  }

  return getStudentSessionMember();
}

/**
 * 회원 전용 페이지의 서버 가드. 실제 Supabase 회원 세션을 확인하고,
 * 로그인돼 있지 않으면 /login으로 보냅니다. (mock 모드에서는 통과)
 * 로그인된 경우 회원 정보를 반환합니다.
 */
export async function requireStudentLogin(redirectPath: string) {
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=${redirectPath}`);
  }

  return member;
}
