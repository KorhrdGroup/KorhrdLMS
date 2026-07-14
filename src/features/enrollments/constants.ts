import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

export type { EnrollmentStatus, PaymentStatus };

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: "신청/대기",
  confirmed: "확정",
  canceled: "신청 취소",
  deleted: "삭제",
};

/**
 * "실제로 유효한 수강 중" 상태로 간주하는 enrollment 상태 목록입니다.
 * 프론트 수강신청 중복 체크(`enrollment-application.service.ts`)와 회원목록 "수강과정"
 * 요약(`member-course-summary.service.ts`)이 동일한 기준을 쓰도록 공유합니다.
 * canceled/deleted 등 무효 처리된 신청 건은 재신청을 막지 않아야 하므로 포함하지 않습니다.
 * 추후 "진행중"/"수강완료" 같은 세부 상태가 enum에 추가되면 이 목록도 함께 확장해야 합니다.
 */
export const ACTIVE_ENROLLMENT_STATUSES: EnrollmentStatus[] = ["confirmed"];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "미결제",
  paid: "결제완료",
  partial: "부분결제",
  refunded: "환불",
  canceled: "결제취소",
  // 자격증 발급비를 선납결제(certificate_prepayments)로 전액 충당한 경우입니다.
  prepaid: "선납완료",
};

export const ENROLLMENT_LIST_SELECT = `
  id,
  year,
  batch,
  start_date,
  end_date,
  status,
  payment_status,
  application_date,
  created_at,
  member:members!inner (
    id,
    name,
    login_id,
    phone,
    manager_name,
    deleted_at
  ),
  course:courses!inner (
    id,
    name,
    code
  )
` as const;

export const PENDING_APPLICANT_LIST_SELECT = `
  id,
  year,
  batch,
  start_date,
  end_date,
  status,
  payment_status,
  application_date,
  created_at,
  manager_name,
  member:members!inner (
    id,
    name,
    login_id,
    phone,
    manager_name,
    deleted_at
  ),
  course:courses!inner (
    id,
    name,
    code
  )
` as const;

export const CONFIRMED_STUDENT_LIST_SELECT = PENDING_APPLICANT_LIST_SELECT;

export const PENDING_APPLICANT_DETAIL_SELECT = `
  id,
  year,
  batch,
  start_date,
  end_date,
  status,
  payment_status,
  application_date,
  created_at,
  memo,
  manager_name,
  member:members!inner (
    id,
    name,
    login_id,
    phone,
    email,
    manager_name,
    deleted_at
  ),
  course:courses!inner (
    id,
    name,
    code
  )
` as const;

export const CONFIRMED_STUDENT_DETAIL_SELECT = PENDING_APPLICANT_DETAIL_SELECT;

export const CONFIRMED_STUDENT_HISTORY_SELECT = `
  id,
  start_date,
  end_date,
  payment_status,
  confirmed_at,
  course:courses!inner (
    id,
    name,
    code
  )
` as const;

export const ENROLLMENT_SEARCH_FIELD_LABELS = {
  all: "전체",
  member_name: "성명",
  login_id: "아이디",
  course_name: "과정",
  batch: "반",
  year: "연도",
} as const;

export type EnrollmentSearchField = keyof typeof ENROLLMENT_SEARCH_FIELD_LABELS;

export const PENDING_APPLICANT_SEARCH_FIELD_LABELS = ENROLLMENT_SEARCH_FIELD_LABELS;

export type PendingApplicantSearchField = EnrollmentSearchField;

export const MEMBER_OPTION_SELECT = "id, name, login_id" as const;
export const MEMBER_REGISTRATION_OPTION_SELECT =
  "id, name, login_id, manager_name" as const;
export const COURSE_OPTION_SELECT = "id, name, code" as const;

export const COURSE_FILTER_SELECT = "id, name, code" as const;

export const CLASS_LIST_SELECT = `
  id,
  year,
  name,
  manager_name,
  application_start,
  application_end,
  enrollment_start,
  enrollment_end,
  created_at,
  course:courses!inner (
    id,
    name,
    code,
    deleted_at
  )
` as const;

export const CLASS_DETAIL_SELECT = `
  id,
  course_id,
  year,
  name,
  manager_name,
  application_start,
  application_end,
  enrollment_start,
  enrollment_end,
  created_at,
  course:courses!inner (
    id,
    name,
    code,
    deleted_at
  )
` as const;

export const CLASS_ASSIGNED_STUDENTS_SELECT = `
  id,
  status,
  payment_status,
  member:members!inner (
    id,
    name,
    login_id,
    deleted_at
  )
` as const;
