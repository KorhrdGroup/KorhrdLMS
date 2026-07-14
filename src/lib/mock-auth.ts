import { redirect } from "next/navigation";

/**
 * ⚠️ TEMP DEV/QA FLAG — DO NOT SHIP AS-IS. ⚠️
 *
 * Real Supabase Auth(회원 로그인/비밀번호 해시) 연동이 완료되어 `false`로
 * 전환했습니다. 운영 전 통합 테스트는 실제 로그인(`/login`)을 통해 진행합니다.
 * 다시 mock 상태로 화면만 훑어봐야 할 때만 임시로 `true`로 되돌리세요.
 *
 * Set back to `false` (or delete this flag entirely along with
 * `getMockableStudentMember`/`requireMockLogin`) once real Supabase Auth
 * login is connected for the general member/교육원 회원 area.
 */
export const MOCK_IS_LOGGED_IN = false;

/**
 * Mock signed-in member identity, used to auto-fill forms (e.g. 1:1 상담 작성자)
 * and to drive Supabase-backed 학생 화면(학습강의실/성적조회/결제 등) in dev/QA.
 *
 * ⚠️ Must be a real `members.id` (UUID) that already exists in Supabase —
 * `member_id` columns are UUID, so a non-UUID placeholder (e.g. "mock-user-1")
 * makes every Supabase query using this id fail with
 * `invalid input syntax for type uuid`. Update this value if the referenced
 * member is ever deleted from the `members` table.
 */
export const MOCK_USER_ID = "b4996895-96da-42de-bf96-baf940173593";
export const MOCK_USER_NAME = "양병웅2";

/**
 * Server-side guard for member-only pages. Bounces logged-out visitors to
 * /login with a redirect target so the real auth flow can send them back
 * once Supabase Auth is connected.
 */
export function requireMockLogin(redirectPath: string) {
  if (!MOCK_IS_LOGGED_IN) {
    redirect(`/login?redirect=${redirectPath}`);
  }
}

// NOTE: the mock-aware real-session helper (`getMockableStudentMember`) lives
// in `src/lib/mock-auth-server.ts`, not here — it depends on
// `getStudentSessionMember`, which pulls in `next/headers`. Keeping that out
// of this file lets client components (e.g. `QnaWrite.tsx`) keep importing
// `MOCK_USER_NAME` etc. from here without bundling server-only code.
