import type { ExamKind, ExamStatus, ExamType } from "@/types/database.types";

export const EXAM_KIND_LABELS: Record<ExamKind, string> = {
  final_exam: "최종시험",
  midterm: "중간고사",
  final: "기말고사",
  mock: "모의고사",
  certificate: "자격증시험",
  quiz: "퀴즈",
};

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  regular: "정기",
  makeup: "추가",
  retake: "재시험",
  practice: "연습",
};

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  planned: "계획",
  confirmed: "확정",
};

export const EXAM_QUESTION_TYPE_LABELS = {
  multiple_choice: "객관식",
  ox: "OX",
  short_answer: "주관식",
} as const;

export const EXAM_QUESTION_SUMMARY_SELECT = `
  id,
  name,
  question_count,
  course:courses!inner (
    id,
    name,
    deleted_at
  )
` as const;

export const EXAM_QUESTION_VIEW_SUMMARY_SELECT = `
  id,
  name,
  question_count,
  exam_start,
  exam_end,
  exam_duration_minutes,
  course:courses!inner (
    id,
    name,
    deleted_at
  )
` as const;

export const EXAM_QUESTION_ITEM_SELECT = `
  id,
  exam_id,
  question_type,
  question,
  choice1,
  choice2,
  choice3,
  choice4,
  choice5,
  answer,
  score,
  sort_order,
  created_at
` as const;

export const EXAM_LIST_SELECT = `
  id,
  year,
  name,
  exam_kind,
  exam_type,
  print_enabled,
  created_at,
  course:courses!inner (
    id,
    name,
    code,
    deleted_at
  )
` as const;

export const EXAM_EDIT_SELECT = `
  id,
  year,
  name,
  exam_kind,
  exam_type,
  exam_start,
  exam_end,
  question_count,
  exam_duration_minutes,
  status,
  memo,
  course:courses!inner (
    id,
    name,
    code,
    deleted_at
  )
` as const;

