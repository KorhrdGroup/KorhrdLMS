import { createClient } from "@/lib/supabase/server";

/**
 * 평가관리 > 성적관리 화면 전용 조회 Repository입니다.
 * Supabase `exam_submissions`를 `enrollments`(→ `members`, `courses`)와
 * `exams`에 embed 조인하여 학생 시험 응시 결과를 그대로 읽어옵니다.
 * 이 파일은 조회 전용이며, 재시험 허용 처리는 기존
 * `features/classroom-exams` Repository/Service(`allowSubmissionRetake`)를 그대로 사용합니다.
 */

const EXAM_RESULT_SELECT = `
  id,
  score,
  total_score,
  is_passed,
  submitted_at,
  retake_allowed,
  retake_allowed_at,
  exam:exams!inner (
    id,
    name
  ),
  enrollment:enrollments!inner (
    id,
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
  )
` as const;

export type ExamResultRow = {
  id: string;
  score: number;
  total_score: number;
  is_passed: boolean | null;
  submitted_at: string;
  retake_allowed: boolean;
  retake_allowed_at: string | null;
  exam: { id: string; name: string };
  enrollment: {
    id: string;
    member: { id: string; name: string; login_id: string; deleted_at: string | null };
    course: { id: string; name: string };
  };
};

export async function listExamResults(): Promise<ExamResultRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_submissions")
    .select(EXAM_RESULT_SELECT)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ExamResultRow[];
}
