import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";

/**
 * 수료증관리(/admin/certificates) Mock 데이터 타입 정의입니다.
 *
 * 참고: 이 모듈은 기존 `/admin/certificates/applications`(사회복지사 등 실물 자격증
 * 발급 신청 관리, 실제 Supabase `certificate_applications` 연동)와는 별도의
 * "과정 수료증" 발급 관리 기능입니다. 학생 학습강의실 수료증 화면
 * (`/classroom/[slug]/certificate`, `src/lib/classroom/certificate-store.ts`)과
 * 동일한 필드(수료번호/수료일)를 사용하도록 구조를 맞췄습니다.
 */
export type CertificateIssuanceStatus = "issued" | "not_issued";

export type CompletionCertificateListItem = {
  enrollmentId: string;
  member: {
    id: string;
    name: string;
    loginId: string;
  };
  course: {
    id: string;
    name: string;
  };
  learningStatus: EnrollmentLearningStatus;
  /**
   * 수료일 — 수강기간 종료 예정일(`enrollments.end_date`)을 그대로 사용합니다.
   * 합격 기준을 충족하면 수강기간 중이라도 "수료"로 판정되므로, 실제 합격
   * 시점보다 이후 날짜로 표시될 수 있습니다.
   */
  completionDate: string;
  issuanceStatus: CertificateIssuanceStatus;
  certificateNumber: string | null;
  issuedAt: string | null;
  reissueCount: number;
};

export type CertificateSearchField = "all" | "member_name" | "login_id" | "course_name";
export type CertificateStatusFilter = "all" | "issued" | "not_issued";

export type CompletionCertificateListQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: CertificateSearchField;
  status: CertificateStatusFilter;
};

export type CompletionCertificateActionResult =
  | { success: true; item: CompletionCertificateListItem; message: string }
  | { success: false; message: string };
