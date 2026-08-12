import { createClient } from "@/lib/supabase/server";

/**
 * 시험관리 — 전체 합격/불합격 현황.
 * 과정마다 들어가지 않고 모든 시험의 응시 결과를 한 화면에서 봅니다.
 * 합격 여부는 점수 vs 합격 기준(pass_score, 기본 60점)으로 재계산합니다.
 */

const MAX_ROWS = 1000;

export type ExamOverviewRow = {
  submissionId: string;
  memberName: string;
  memberLoginId: string;
  enrollmentId: string;
  courseName: string;
  examTitle: string;
  percent: number;
  isPassed: boolean;
  submittedAt: string;
};

export type ExamOverviewSummary = {
  total: number;
  passed: number;
  failed: number;
};

type SubmissionRow = {
  id: string;
  score: number;
  total_score: number;
  submitted_at: string;
  exam: {
    name: string;
    pass_score: number | null;
    course: { name: string } | null;
  } | null;
  enrollment: {
    id: string;
    member: { name: string; login_id: string } | null;
  } | null;
};

export async function getExamResultsOverview(): Promise<{
  summary: ExamOverviewSummary;
  rows: ExamOverviewRow[];
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_submissions")
    .select(
      `id, score, total_score, submitted_at,
       exam:exams!inner ( name, pass_score, course:courses ( name ) ),
       enrollment:enrollments!inner ( id, member:members!inner ( name, login_id ) )`,
    )
    .order("submitted_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    throw new Error(error.message);
  }

  const rows: ExamOverviewRow[] = ((data ?? []) as unknown as SubmissionRow[])
    .filter((row) => row.exam && row.enrollment?.member)
    .map((row) => {
      const percent =
        row.total_score > 0 ? Math.round((row.score / row.total_score) * 100) : row.score;
      return {
        submissionId: row.id,
        memberName: row.enrollment!.member!.name,
        memberLoginId: row.enrollment!.member!.login_id,
        enrollmentId: row.enrollment!.id,
        courseName: row.exam!.course?.name ?? "—",
        examTitle: row.exam!.name,
        percent,
        isPassed: percent >= (row.exam!.pass_score ?? 60),
        submittedAt: row.submitted_at,
      };
    });

  const passed = rows.filter((row) => row.isPassed).length;

  return {
    summary: { total: rows.length, passed, failed: rows.length - passed },
    rows,
  };
}
