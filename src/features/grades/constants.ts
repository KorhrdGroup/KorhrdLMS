import type { GradeLetter } from "@/features/grades/lib/grade-calculator";

export const GRADE_SEARCH_FIELD_LABELS = {
  all: "전체",
  member_name: "회원명",
  login_id: "아이디",
  course_name: "과정명",
} as const;

export type GradeSearchField = keyof typeof GRADE_SEARCH_FIELD_LABELS;

export const GRADE_FILTER_LABELS: Record<GradeLetter | "all", string> = {
  all: "전체 등급",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  F: "F",
};

export const PASS_FILTER_LABELS = {
  all: "전체",
  passed: "합격",
  failed: "불합격",
} as const;

export const GRADE_LETTER_STYLES: Record<GradeLetter, string> = {
  A: "bg-[#EFF6FF] text-[#3B82F6]",
  B: "bg-[#F0FDF4] text-[#059669]",
  C: "bg-[#FEFCE8] text-[#CA8A04]",
  D: "bg-[#FFF7ED] text-[#EA580C]",
  F: "bg-[#FEE2E2] text-[#EF4444]",
};

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
