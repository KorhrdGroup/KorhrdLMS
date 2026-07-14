export const CERTIFICATE_SEARCH_FIELD_LABELS = {
  all: "전체",
  member_name: "회원명",
  login_id: "아이디",
  course_name: "과정명",
} as const;

export const CERTIFICATE_STATUS_FILTER_LABELS = {
  all: "전체 상태",
  issued: "발급완료",
  not_issued: "미발급",
} as const;

export const ENROLLMENT_MEMBER_COURSE_SELECT = `
  id,
  start_date,
  end_date,
  status,
  member:members!inner (
    id,
    name,
    login_id,
    deleted_at
  ),
  course:courses!inner (
    id,
    name
  )
` as const;
