import { redirect } from "next/navigation";

/**
 * 민간자격증 LMS는 회원을 프론트 회원가입으로만 생성합니다.
 * 백오피스에서 직접 회원을 등록하는 경로는 더 이상 제공하지 않으므로,
 * 혹시 남아있는 링크/북마크로 이 경로에 접근하더라도 회원목록으로 돌려보냅니다.
 */
export default function AdminMemberNewPage() {
  redirect("/admin/members");
}
