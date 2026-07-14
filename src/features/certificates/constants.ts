import type {
  CertificateDeliveryStatus,
  CertificateKind,
} from "@/types/database.types";

export const CERTIFICATE_KIND_LABELS: Record<CertificateKind, string> = {
  social_worker: "사회복지사",
  child_care: "보육교사",
  lifelong_educator: "평생교육사",
  youth_instructor: "청소년지도사",
  health_educator: "건강가정사",
  // 학생 자격증발급신청(/certificate/apply)에서 과정 수료 후 신청하는 자격증입니다.
  course_completion: "과정수료 자격증",
};

export const CERTIFICATE_KIND_FILTER_OPTIONS = [
  "social_worker",
  "child_care",
  "lifelong_educator",
  "youth_instructor",
  "health_educator",
  "course_completion",
] as const satisfies readonly CertificateKind[];

export const CERTIFICATE_DELIVERY_STATUS_LABELS: Record<
  CertificateDeliveryStatus,
  string
> = {
  pending: "접수",
  preparing: "준비중",
  shipped: "발송완료",
  delivered: "배송완료",
  canceled: "취소",
};

export const CERTIFICATE_DELIVERY_STATUS_FILTER_OPTIONS = [
  "pending",
  "preparing",
  "shipped",
  "delivered",
  "canceled",
] as const satisfies readonly CertificateDeliveryStatus[];

export const CERTIFICATE_QUICK_PERIOD_OPTIONS = [
  { value: "1w", label: "1주일" },
  { value: "1m", label: "1개월" },
  { value: "2m", label: "2개월" },
  { value: "3m", label: "3개월" },
] as const;

export const CERTIFICATE_LIST_SELECT = `
  id,
  member_id,
  certificate_kind,
  certificate_name,
  member_login_id,
  applicant_name,
  phone,
  postal_code,
  address,
  address_detail,
  photo_url,
  issuance_cost,
  actual_payment_amount,
  payment_status,
  delivery_status,
  applied_at,
  created_at
` as const;

export const CERTIFICATE_DETAIL_SELECT = `
  id,
  member_id,
  certificate_kind,
  certificate_name,
  member_login_id,
  applicant_name,
  phone,
  birth_date,
  postal_code,
  address,
  address_detail,
  photo_url,
  issuance_cost,
  actual_payment_amount,
  payment_method,
  payment_info,
  payment_status,
  delivery_status,
  memo,
  applied_at,
  issued_at,
  created_at,
  updated_at
` as const;

export const CERTIFICATE_EXPORT_SELECT = `
  id,
  certificate_kind,
  certificate_name,
  member_login_id,
  applicant_name,
  phone,
  postal_code,
  address,
  address_detail,
  issuance_cost,
  actual_payment_amount,
  payment_method,
  payment_info,
  delivery_status,
  memo,
  applied_at
` as const;
