import { createClient } from "@/lib/supabase/server";

/**
 * 시험관리 — 시험별 응시 결과(합격자/불합격자) 목록.
 * exam_submissions 를 수강(enrollment) → 회원으로 이어붙여 내려줍니다.
 * 합격 여부는 저장된 is_passed 대신 점수와 합격 기준(pass_score, 기본 60점)으로
 * 다시 판정합니다 — 성적관리에서 점수를 고쳐도 목록이 어긋나지 않도록.
 */

export type ExamResultRow = {
  submissionId: string;
  memberId: string;
  memberName: string;
  memberLoginId: string;
  enrollmentId: string;
  /** 백분율 점수(0~100) */
  percent: number;
  isPassed: boolean;
  submittedAt: string;
};

export type ExamResultSummary = {
  examId: string;
  examTitle: string;
  courseName: string;
  passScore: number;
  total: number;
  passed: number;
  failed: number;
};

export type GetExamResultsResult =
  | { success: true; summary: ExamResultSummary; rows: ExamResultRow[] }
  | { success: false; message: string };

type SubmissionRow = {
  id: string;
  score: number;
  total_score: number;
  submitted_at: string;
  enrollment: {
    id: string;
    member: { id: string; name: string; login_id: string } | null;
  } | null;
};

export async function getExamResults(examId: string): Promise<GetExamResultsResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("id, name, pass_score, course:courses ( name )")
    .eq("id", examId)
    .is("deleted_at", null)
    .maybeSingle();

  if (examError) {
    throw new Error(examError.message);
  }
  if (!exam) {
    return { success: false, message: "시험을 찾을 수 없습니다." };
  }

  const { data, error } = await supabase
    .from("exam_submissions")
    .select(
      "id, score, total_score, submitted_at, enrollment:enrollments!inner ( id, member:members!inner ( id, name, login_id ) )",
    )
    .eq("exam_id", examId)
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const examRow = exam as unknown as {
    id: string;
    name: string;
    pass_score: number | null;
    course: { name: string } | null;
  };
  const passScore = examRow.pass_score ?? 60;

  const rows: ExamResultRow[] = ((data ?? []) as unknown as SubmissionRow[])
    .filter((row) => row.enrollment?.member)
    .map((row) => {
      const percent =
        row.total_score > 0 ? Math.round((row.score / row.total_score) * 100) : row.score;
      return {
        submissionId: row.id,
        memberId: row.enrollment!.member!.id,
        memberName: row.enrollment!.member!.name,
        memberLoginId: row.enrollment!.member!.login_id,
        enrollmentId: row.enrollment!.id,
        percent,
        isPassed: percent >= passScore,
        submittedAt: row.submitted_at,
      };
    });

  const passed = rows.filter((row) => row.isPassed).length;

  return {
    success: true,
    summary: {
      examId: examRow.id,
      examTitle: examRow.name,
      courseName: examRow.course?.name ?? "—",
      passScore,
      total: rows.length,
      passed,
      failed: rows.length - passed,
    },
    rows,
  };
}
