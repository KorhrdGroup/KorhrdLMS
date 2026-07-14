import { redirect } from "next/navigation";

/**
 * 민간자격증 LMS는 별도의 전자 수료증을 발급하지 않으므로 "수료관리"(수료증관리) 화면을
 * 더 이상 운영하지 않습니다. 학생이 신청한 실물 자격증 발급신청은 "자격증관리 > 발급신청"
 * (/admin/certificates/applications)에서 확인·관리합니다.
 *
 * 관련 DB 데이터(completion_certificates 등)와 서비스/컴포넌트 코드
 * (`src/features/completion-certificates`)는 삭제하지 않고 그대로 유지합니다.
 */
export default function CertificatesPage() {
  redirect("/admin/certificates/applications");
}
