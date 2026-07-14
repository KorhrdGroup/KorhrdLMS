/**
 * 자격증 발급비(정액). 관리자가 신청 건별로 `actual_payment_amount`를 별도로
 * 조정할 수 있으므로(할인 등), 신청 시점에는 이 값을 issuance_cost/최초
 * actual_payment_amount로 함께 저장합니다.
 */
export const CERTIFICATE_ISSUANCE_COST = 100_000;

/** 자격증발급신청 증명사진(선택) 업로드용 Supabase Storage 버킷. */
export const CERTIFICATE_PHOTO_BUCKET = "certificate-photos";

/** 증명사진 업로드 허용 확장자/최대 용량(2MB). */
export const CERTIFICATE_PHOTO_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;
export const CERTIFICATE_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * 자격증발급신청 결제방법 선택지. 실제 PG(결제대행사) 연동 전이므로 모든 방법을 선택은
 * 가능하게 하되, 제출 시 결제 요청 데이터만 생성하고 실제 결제창 호출은 TODO로 남겨둡니다
 * (`certificate-application.service.ts`의 `preparePaymentRequest` 참고).
 * 라벨은 `@/features/payments/constants`의 PAYMENT_METHOD_LABELS와 값은 동일하게 맞추되,
 * 신청 화면에 맞는 표현으로만 다시 정리했습니다.
 */
export const CERTIFICATE_PAYMENT_METHOD_OPTIONS = [
  { value: "card", label: "신용카드" },
  { value: "bank_transfer", label: "계좌이체" },
  { value: "virtual_account", label: "가상계좌" },
  { value: "cash", label: "무통장입금" },
] as const;

export const CERTIFICATE_APPLICATION_LIST_SELECT = `
  id,
  course_id,
  certificate_name,
  payment_status,
  delivery_status,
  postal_code,
  address,
  address_detail,
  applied_at,
  issued_at,
  created_at
` as const;

export const CERTIFICATE_APPLICATION_ACTIVE_SELECT = `
  id,
  course_id,
  delivery_status
` as const;
