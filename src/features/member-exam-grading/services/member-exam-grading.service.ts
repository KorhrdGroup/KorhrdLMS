import { isCorrectAnswer } from "@/features/exams/lib/answer-key";
import { computeGradedScore, sanitizeManualIds } from "@/features/member-exam-grading/lib/grading-math";
import type {
  ExamGradingSheet,
  GradingChoice,
  GradingQuestion,
  MemberExamListItem,
  SaveExamGradingResult,
} from "@/features/member-exam-grading/types/member-exam-grading.types";
import { BABY_ADMIN_PARTNER_CODE, isBabyAdmin } from "@/lib/admin/current-admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 회원 상세 > 시험관리 — 학생이 제출한 수료시험지를 열어 문제별로 정답 처리합니다.
 *
 * 학점연계 외부 학생은 진도·시험을 실제로 치르고, 담당자가 시험지를 열어 한 문제씩
 * 정답 처리한 뒤 발급으로 넘어가던 옛 한직훈 운영 방식을 그대로 재현합니다.
 * 학생 원본 답안(answers)은 절대 고치지 않고, 관리자 처리는 manual_grades 에만 남깁니다.
 */

type QuestionRow = Database["public"]["Tables"]["exam_questions"]["Row"];

const DEFAULT_PASS_SCORE = 60;

/** 학생 화면(classroom-exam.service)과 같은 보기 구성 — OX는 O/X, 주관식은 보기 없음 */
function toChoices(row: QuestionRow): GradingChoice[] {
  if (row.question_type === "ox") {
    return [
      { id: "1", text: "O" },
      { id: "2", text: "X" },
    ];
  }
  if (row.question_type === "short_answer") return [];

  const raw: Array<[string, string | null]> = [
    ["1", row.choice1],
    ["2", row.choice2],
    ["3", row.choice3],
    ["4", row.choice4],
    ["5", row.choice5],
  ];
  return raw.filter(([, text]) => Boolean(text)).map(([id, text]) => ({ id, text: text as string }));
}

/** manual_grades JSON → 정답 처리된 문제ID 목록 */
function readManualGrades(json: unknown): string[] {
  if (!json || typeof json !== "object" || Array.isArray(json)) return [];
  return Object.entries(json as Record<string, unknown>)
    .filter(([, value]) => value === true)
    .map(([id]) => id);
}

/**
 * 현재 관리자가 이 회원을 채점할 수 있는지.
 * 아기관리자는 STAR 회원만 — 회원 상세 화면과 저장 액션이 둘 다 이 검사를 거칩니다
 * (ID 직접 접근·액션 우회 호출 모두 차단).
 */
export async function canCurrentAdminGradeMember(memberId: string): Promise<boolean> {
  if (!(await isBabyAdmin())) return true;

  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("partner_code")
    .eq("id", memberId)
    .maybeSingle();
  return data?.partner_code === BABY_ADMIN_PARTNER_CODE;
}

/** 회원의 수강 과정별 수료시험 응시 상태 — 시험관리 탭 목록 */
export async function listMemberExamSubmissions(memberId: string): Promise<MemberExamListItem[]> {
  const supabase = await createClient();

  const { data: enrollmentRows, error } = await supabase
    .from("enrollments")
    .select("id, course_id")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .neq("status", "canceled")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const enrollments = enrollmentRows ?? [];
  if (enrollments.length === 0) return [];

  const courseIds = [...new Set(enrollments.map((row) => row.course_id))];
  const enrollmentIds = enrollments.map((row) => row.id);

  const [{ data: courses }, { data: exams }, { data: submissions }] = await Promise.all([
    supabase.from("courses").select("id, name").in("id", courseIds),
    supabase
      .from("exams")
      .select("id, course_id, name, pass_score")
      .in("course_id", courseIds)
      .eq("exam_kind", "final_exam")
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("exam_submissions")
      .select("id, enrollment_id, exam_id, score, is_passed, submitted_at, manual_grades")
      .in("enrollment_id", enrollmentIds),
  ]);

  const courseNameById = new Map((courses ?? []).map((row) => [row.id, row.name]));
  // 과정당 수료시험은 하나가 원칙 — 여러 개면 먼저 만든 것을 씁니다
  const examByCourse = new Map<string, { id: string; name: string; pass_score: number | null }>();
  for (const exam of exams ?? []) {
    if (!examByCourse.has(exam.course_id)) examByCourse.set(exam.course_id, exam);
  }
  const submissionByKey = new Map(
    (submissions ?? []).map((row) => [`${row.enrollment_id}:${row.exam_id}`, row]),
  );

  return enrollments.map((enrollment) => {
    const courseName = courseNameById.get(enrollment.course_id) ?? "";
    const exam = examByCourse.get(enrollment.course_id) ?? null;

    if (!exam) {
      return {
        enrollmentId: enrollment.id,
        courseName,
        examName: null,
        status: "no_exam",
        submissionId: null,
        submittedAt: null,
        score: null,
        passScore: null,
        isPassed: null,
        manualCount: 0,
      };
    }

    const passScore = exam.pass_score ?? DEFAULT_PASS_SCORE;
    const submission = submissionByKey.get(`${enrollment.id}:${exam.id}`) ?? null;

    if (!submission) {
      return {
        enrollmentId: enrollment.id,
        courseName,
        examName: exam.name,
        status: "not_taken",
        submissionId: null,
        submittedAt: null,
        score: null,
        passScore,
        isPassed: null,
        manualCount: 0,
      };
    }

    return {
      enrollmentId: enrollment.id,
      courseName,
      examName: exam.name,
      status: "submitted",
      submissionId: submission.id,
      submittedAt: submission.submitted_at.slice(0, 10),
      score: submission.score,
      passScore,
      isPassed: submission.is_passed,
      manualCount: readManualGrades(submission.manual_grades).length,
    };
  });
}

/**
 * 채점 화면 데이터. 제출이 이 회원의 것이 아니면 null — URL 조작으로 남의 시험지를
 * 열 수 없게 회원ID까지 함께 검증합니다.
 */
export async function getExamGradingSheet(
  memberId: string,
  submissionId: string,
): Promise<ExamGradingSheet | null> {
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("exam_submissions")
    .select("id, enrollment_id, exam_id, answers, manual_grades, manual_graded_by, manual_graded_at, submitted_at")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) return null;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, member_id, course_id")
    .eq("id", submission.enrollment_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!enrollment || enrollment.member_id !== memberId) return null;

  const [{ data: member }, { data: course }, { data: exam }, { data: questionRows }] = await Promise.all([
    supabase.from("members").select("id, name, login_id").eq("id", memberId).maybeSingle(),
    supabase.from("courses").select("name").eq("id", enrollment.course_id).maybeSingle(),
    supabase.from("exams").select("id, name, pass_score").eq("id", submission.exam_id).maybeSingle(),
    supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", submission.exam_id)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
  ]);
  if (!member || !course || !exam) return null;

  const answers = (submission.answers ?? {}) as Record<string, unknown>;

  const questions: GradingQuestion[] = ((questionRows ?? []) as QuestionRow[]).map((row) => {
    const raw = answers[row.id];
    const studentAnswer = typeof raw === "string" && raw.trim() ? raw : null;
    // 주관식은 자동 채점하지 않으므로(학생 화면과 동일) 항상 관리자 판단 대상입니다
    const autoCorrect =
      (row.question_type === "multiple_choice" || row.question_type === "ox") &&
      isCorrectAnswer(row.answer, studentAnswer ?? undefined);

    return {
      id: row.id,
      order: row.sort_order,
      questionType: row.question_type,
      question: row.question,
      choices: toChoices(row),
      answer: row.answer,
      score: row.score,
      studentAnswer,
      autoCorrect,
    };
  });

  const saved = readManualGrades(submission.manual_grades);
  const questionIds = new Set(questions.map((q) => q.id));

  return {
    memberId: member.id,
    memberName: member.name,
    memberLoginId: member.login_id,
    courseName: course.name,
    examName: exam.name,
    submissionId: submission.id,
    passScore: exam.pass_score ?? DEFAULT_PASS_SCORE,
    submittedAt: submission.submitted_at,
    questions,
    manualGrades: sanitizeManualIds(questions, saved),
    // 채점 후 문제가 삭제·교체되면 저장된 처리가 붕 뜹니다 — 화면에서 재확인을 안내합니다
    staleManualIds: saved.filter((id) => !questionIds.has(id)),
    lastGradedBy: submission.manual_graded_by,
    lastGradedAt: submission.manual_graded_at,
  };
}

/**
 * 정답 처리 저장. 점수·합격을 다시 계산해 제출 기록에 반영합니다.
 * 합격이 되어도 알림톡은 보내지 않습니다 — 학점연계 건은 담당자가 따로 안내합니다.
 */
export async function saveExamGrading(
  memberId: string,
  submissionId: string,
  manualIds: string[],
  gradedBy: string | null,
): Promise<SaveExamGradingResult> {
  const sheet = await getExamGradingSheet(memberId, submissionId);
  if (!sheet) return { success: false, message: "제출된 시험지를 찾을 수 없습니다." };

  const cleanIds = sanitizeManualIds(sheet.questions, manualIds);
  const { score, totalScore } = computeGradedScore(sheet.questions, cleanIds);
  const isPassed = score >= sheet.passScore;

  const manualGrades: Record<string, true> = {};
  for (const id of cleanIds) manualGrades[id] = true;

  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_submissions")
    .update({
      score,
      total_score: totalScore,
      is_passed: isPassed,
      manual_grades: manualGrades,
      manual_graded_by: gradedBy,
      manual_graded_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) return { success: false, message: `채점 저장에 실패했습니다: ${error.message}` };

  return {
    success: true,
    score,
    totalScore,
    isPassed,
    message: `채점을 저장했습니다 — ${score}점 · ${isPassed ? "합격" : "불합격"}`,
  };
}
