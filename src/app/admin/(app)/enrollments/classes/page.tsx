import { redirect } from "next/navigation";

/**
 * 민간자격증 LMS는 수강반(classes)을 별도로 운영하지 않는 구조로 전환되어,
 * "수강반 관리" 화면을 더 이상 운영하지 않습니다. 수강 관련 정보는
 * "회원관리 > 회원목록"의 "수강과정" 컬럼에서 확인합니다.
 * 이 라우트/데이터/API는 삭제하지 않았으며, 메뉴에서만 제거하고 직접 접근 시
 * 회원목록으로 돌려보냅니다.
 */
export default function AdminEnrollmentsClassesPage() {
  redirect("/admin/members");
}
