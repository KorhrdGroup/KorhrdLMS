import type { AdminType } from "@/types/database.types";

export const ADMIN_TYPE_LABELS: Record<AdminType, string> = {
  super_admin: "최고관리자",
  admin: "관리자",
  instructor: "강사",
  counselor: "상담원",
};

export const ADMIN_TYPE_FILTER_OPTIONS = [
  "super_admin",
  "admin",
  "instructor",
  "counselor",
] as const satisfies readonly AdminType[];

export const ADMIN_ACCESS_QUICK_PERIOD_OPTIONS = [
  { value: "1w", label: "1주일" },
  { value: "1m", label: "1개월" },
  { value: "2m", label: "2개월" },
  { value: "3m", label: "3개월" },
] as const;

export const ADMIN_USER_LIST_SELECT = `
  id,
  admin_type,
  login_id,
  name,
  created_at
` as const;

export const ADMIN_ACCESS_LOG_SELECT = `
  id,
  admin_user_id,
  access_ip,
  logged_in_at,
  logged_out_at,
  created_at,
  admin_user:admin_users!inner (
    id,
    admin_type,
    login_id,
    name
  )
` as const;

export const STATISTICS_NAV_ITEMS = [
  {
    label: "회원통계",
    href: "/admin/statistics/members",
  },
  {
    label: "수강통계",
    href: "/admin/statistics/enrollments",
  },
  {
    label: "시험통계",
    href: "/admin/statistics/exams",
  },
  {
    label: "매출통계",
    href: "/admin/statistics/revenue",
  },
  {
    label: "접속로그",
    href: "/admin/statistics/admin-access",
  },
] as const;
