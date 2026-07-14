import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 학생 학습강의실 시험 Repository 계층입니다.
 *
 * 관리자 시험관리와 동일한 Supabase `exams` / `exam_questions` 테이블,
 * 그리고 학생 응시 이력을 담는 `exam_submissions` 테이블을 직접 조회/변경합니다.
 */

export type ExamRow = Database["public"]["Tables"]["exams"]["Row"];
export type ExamQuestionRow = Database["public"]["Tables"]["exam_questions"]["Row"];
export type ExamSubmissionRow = Database["public"]["Tables"]["exam_submissions"]["Row"];

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const EXAM_SELECT =
  "id, course_id, year, name, exam_kind, exam_type, question_count, exam_duration_minutes, status, pass_score, is_published, created_at" as const;

export async function findPublishedExamsByCourse(
  supabase: SupabaseServerClient,
  courseId: string,
): Promise<ExamRow[]> {
  const { data, error } = await supabase
    .from("exams")
    .select(EXAM_SELECT)
    .eq("course_id", courseId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ExamRow[];
}

export async function findPublishedExamById(
  supabase: SupabaseServerClient,
  courseId: string,
  examId: string,
): Promise<ExamRow | null> {
  const { data, error } = await supabase
    .from("exams")
    .select(EXAM_SELECT)
    .eq("id", examId)
    .eq("course_id", courseId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ExamRow | null) ?? null;
}

export async function findQuestionsForExam(
  supabase: SupabaseServerClient,
  examId: string,
): Promise<ExamQuestionRow[]> {
  const { data, error } = await supabase
    .from("exam_questions")
    .select(
      "id, exam_id, question_type, question, choice1, choice2, choice3, choice4, choice5, answer, score, sort_order, deleted_at, created_at, updated_at",
    )
    .eq("exam_id", examId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ExamQuestionRow[];
}

export async function findSubmissionsByEnrollment(
  supabase: SupabaseServerClient,
  enrollmentId: string,
  examIds: string[],
): Promise<Map<string, ExamSubmissionRow>> {
  if (examIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("exam_submissions")
    .select(
      "id, enrollment_id, exam_id, score, total_score, is_passed, answers, submitted_at, retake_allowed, retake_allowed_at, created_at, updated_at",
    )
    .eq("enrollment_id", enrollmentId)
    .in("exam_id", examIds);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, ExamSubmissionRow>();
  for (const row of (data ?? []) as ExamSubmissionRow[]) {
    map.set(row.exam_id, row);
  }
  return map;
}

export async function findSubmissionsForEnrollmentAcrossExams(
  supabase: SupabaseServerClient,
  enrollmentId: string,
): Promise<ExamSubmissionRow[]> {
  const { data, error } = await supabase
    .from("exam_submissions")
    .select(
      "id, enrollment_id, exam_id, score, total_score, is_passed, answers, submitted_at, retake_allowed, retake_allowed_at, created_at, updated_at",
    )
    .eq("enrollment_id", enrollmentId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ExamSubmissionRow[];
}

export async function findSubmission(
  supabase: SupabaseServerClient,
  enrollmentId: string,
  examId: string,
): Promise<ExamSubmissionRow | null> {
  const { data, error } = await supabase
    .from("exam_submissions")
    .select(
      "id, enrollment_id, exam_id, score, total_score, is_passed, answers, submitted_at, retake_allowed, retake_allowed_at, created_at, updated_at",
    )
    .eq("enrollment_id", enrollmentId)
    .eq("exam_id", examId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ExamSubmissionRow | null) ?? null;
}

export async function upsertSubmission(
  supabase: SupabaseServerClient,
  input: {
    enrollmentId: string;
    examId: string;
    score: number;
    totalScore: number;
    isPassed: boolean | null;
    answers: Record<string, string>;
  },
): Promise<ExamSubmissionRow> {
  const insertData: Database["public"]["Tables"]["exam_submissions"]["Insert"] = {
    enrollment_id: input.enrollmentId,
    exam_id: input.examId,
    score: input.score,
    total_score: input.totalScore,
    is_passed: input.isPassed,
    answers: input.answers,
    submitted_at: new Date().toISOString(),
    // 재응시가 반영되면 관리자가 부여한 재시험 허용 상태는 초기화합니다(1회성 허용).
    retake_allowed: false,
    retake_allowed_at: null,
  };

  const { data, error } = await supabase
    .from("exam_submissions")
    .upsert(insertData, { onConflict: "enrollment_id,exam_id" })
    .select(
      "id, enrollment_id, exam_id, score, total_score, is_passed, answers, submitted_at, retake_allowed, retake_allowed_at, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ExamSubmissionRow;
}

/**
 * 평가관리(/admin/exams/results)에서 사용합니다. 관리자가 특정 시험 응시 기록에
 * 재시험을 허용 처리합니다.
 */
export async function allowSubmissionRetake(
  supabase: SupabaseServerClient,
  submissionId: string,
): Promise<ExamSubmissionRow> {
  const { data, error } = await supabase
    .from("exam_submissions")
    .update({
      retake_allowed: true,
      retake_allowed_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select(
      "id, enrollment_id, exam_id, score, total_score, is_passed, answers, submitted_at, retake_allowed, retake_allowed_at, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ExamSubmissionRow;
}

export async function findCourseExamEligibilityRate(
  supabase: SupabaseServerClient,
  courseId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("exam_eligibility_progress_rate")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.exam_eligibility_progress_rate ?? null;
}
