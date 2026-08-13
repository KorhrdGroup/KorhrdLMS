import LoginNoticeModal from "@/features/korhrd/components/layout/LoginNoticeModal";
import { getLoginNotice } from "@/features/korhrd/lib/login-notice";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 메인 알림 팝업의 서버 쪽 절반 — 세션 확인과 알림 데이터 조회까지 여기서
 * 끝내고, 실제로 띄울지(오늘 하루 보지 않기)는 클라이언트(LoginNoticeModal)가
 * 정합니다. 메인 page.tsx 에 <LoginNotice /> 한 줄만 둡니다.
 */
export default async function LoginNotice() {
  const member = await getMockableStudentMember();
  if (!member) return null;

  const notice = await getLoginNotice(member.id);
  if (!notice) return null;

  return <LoginNoticeModal notice={notice} />;
}
