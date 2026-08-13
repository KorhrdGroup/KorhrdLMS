import LoginNoticeModal from "@/features/korhrd/components/layout/LoginNoticeModal";
import { getLoginNotices } from "@/features/korhrd/lib/login-notice";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 로그인 알림 팝업의 서버 쪽 절반 — 세션 확인과 알림 데이터 조회까지 여기서
 * 끝내고, 실제로 띄울지(세션당 1회 · 오늘 하루 보지 않기)는 클라이언트
 * (LoginNoticeModal)가 정합니다. 레이아웃에는 <LoginNotice /> 한 줄만 둡니다.
 */
export default async function LoginNotice() {
  const member = await getMockableStudentMember();
  if (!member) return null;

  const items = await getLoginNotices(member.id);
  if (items.length === 0) return null;

  return <LoginNoticeModal items={items} />;
}
