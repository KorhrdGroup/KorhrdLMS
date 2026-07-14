import { CERTIFICATE_ISSUANCE_COST } from "@/features/certificate-applications/constants";

/** 선납결제 등록 시 기본 선납금액(자격증 발급비와 동일한 정액). */
export const CERTIFICATE_PREPAYMENT_DEFAULT_AMOUNT = CERTIFICATE_ISSUANCE_COST;

export const CERTIFICATE_PREPAYMENT_LIST_SELECT = `
  id,
  member_id,
  course_id,
  certificate_name,
  amount,
  payment_method,
  payment_status,
  paid_at,
  used_at,
  memo,
  created_at,
  member:members!inner (
    name,
    login_id,
    phone
  ),
  course:courses (
    id,
    name
  ),
  certificate_application:certificate_applications (
    id,
    certificate_name,
    applied_at
  )
` as const;

/** 선납결제 자체의 결제상태(선납금이 실제로 입금 확인되었는지)에 사용하는 선택지입니다. */
export const CERTIFICATE_PREPAYMENT_PAYMENT_STATUS_OPTIONS = [
  "paid",
  "unpaid",
  "canceled",
  "refunded",
] as const;

export const CERTIFICATE_PREPAYMENT_USAGE_FILTER_LABELS = {
  all: "전체",
  used: "사용완료",
  available: "미사용",
} as const;

export type CertificatePrepaymentUsageFilter =
  keyof typeof CERTIFICATE_PREPAYMENT_USAGE_FILTER_LABELS;
