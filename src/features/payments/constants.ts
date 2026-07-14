export const PAYMENT_METHOD_LABELS = {
  card: "카드",
  bank_transfer: "계좌이체",
  virtual_account: "가상계좌",
  mobile: "휴대폰",
  cash: "무통장",
} as const;

export const COURSE_PAYMENT_STATUS_LABELS = {
  ready: "결제준비",
  pending: "결제대기",
  paid: "결제완료",
  failed: "결제실패",
  canceled: "결제취소",
  refunded: "환불완료",
} as const;

export const COURSE_PAYMENT_STATUS_FILTER_OPTIONS = [
  "ready",
  "pending",
  "paid",
  "failed",
  "canceled",
  "refunded",
] as const;

export const SUBJECT_PAYMENT_QUICK_PERIOD_OPTIONS = [
  { value: "1w", label: "1주일" },
  { value: "1m", label: "1개월" },
  { value: "2m", label: "2개월" },
  { value: "3m", label: "3개월" },
] as const;

export const SUBJECT_PAYMENT_LIST_SELECT = `
  id,
  member_id,
  course_id,
  class_id,
  enrollment_id,
  payment_date,
  coupon_number,
  assigned_instructor,
  amount,
  payment_method,
  coupon_applied,
  status,
  pg_provider,
  pg_order_id,
  created_at,
  member:members!inner (
    id,
    name,
    login_id,
    deleted_at
  ),
  course:courses!inner (
    id,
    name,
    deleted_at
  )
` as const;

export const SUBJECT_PAYMENT_DETAIL_SELECT = `
  id,
  member_id,
  course_id,
  class_id,
  enrollment_id,
  payment_number,
  product_name,
  payment_date,
  payment_method,
  amount,
  deposit_bank,
  depositor_name,
  virtual_account_number,
  class_start_date,
  class_end_date,
  shipping_address,
  approved_at,
  canceled_at,
  pg_provider,
  pg_order_id,
  pg_transaction_id,
  failed_reason,
  coupon_number,
  assigned_instructor,
  coupon_applied,
  status,
  memo,
  created_at,
  updated_at,
  member:members!inner (
    id,
    name,
    login_id,
    phone,
    email,
    deleted_at
  ),
  course:courses!inner (
    id,
    name,
    code,
    deleted_at
  )
` as const;
