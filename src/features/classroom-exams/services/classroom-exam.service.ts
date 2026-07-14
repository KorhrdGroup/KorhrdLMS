import { DEFAULT_EXAM_ELIGIBILITY_PROGRESS_RATE } from "@/features/classroom-exams/constants";
import {
  allowSubmissionRetake,
  findCourseExamEligibilityRate,
  findPublishedExamById,
  findPublishedExamsByCourse,
  findQuestionsForExam,
  findSubmission,
  findSubmissionsByEnrollment,
  findSubmissionsForEnrollmentAcrossExams,
  upsertSubmission,
  type ExamQuestionRow,
  type ExamRow,
  type ExamSubmissionRow,
} from "@/features/classroom-exams/repositories/classroom-exam.repository";
import type {
  ClassroomExamChoice,
  ClassroomExamList,
  ClassroomExamListItem,
  ClassroomExamQuestion,
  ClassroomExamStatus,
  ClassroomExamSubmittedResult,
  GetClassroomExamTakingResult,
  SubmitClassroomExamResult,
} from "@/features/classroom-exams/types/classroom-exam.types";
import {
  getClassroomCourseProgressRate,
  resolveClassroomAccess,
} from "@/features/classroom-lectures/services/classroom-lecture.service";
import { createClient } from "@/lib/supabase/server";

/**
 * 과정별 "시험 응시 가능 진도율" 기준(%)을 반환합니다.
 * `courses.exam_eligibility_progress_rate`가 설정돼 있으면 그 값을,
 * 없으면 애플리케이션 기본값(`DEFAULT_EXAM_ELIGIBILITY_PROGRESS_RATE`)을 사용합니다.
 */
async function getCourseExamEligibilityThreshold(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
): Promise<number> {
  const rate = await findCourseExamEligibilityRate(supabase, courseId);
  return rate ?? DEFAULT_EXAM_ELIGIBILITY_PROGRESS_RATE;
}

type EnrollmentPeriod = { startDate: string; endDate: string };

/**
 * 민간자격증 LMS는 시험별 응시기간을 따로 두지 않고, 학생의 수강기간
 * (enrollments.start_date ~ end_date) 안에서만 응시할 수 있습니다.
 */
function resolveExamStatus(
  enrollmentPeriod: EnrollmentPeriod,
  eligible: boolean,
  submission: ExamSubmissionRow | undefined,
): ClassroomExamStatus {
  // 관리자가 재시험을 허용한 경우, 이미 제출한 시험이라도 다시 응시할 수 있도록
  // "제출완료" 상태로 잠그지 않습니다.
  if (submission && !submission.retake_allowed) {
    return "submitted";
  }

  if (!eligible) {
    return "locked";
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today < enrollmentPeriod.startDate) {
    return "upcoming";
  }
  if (today > enrollmentPeriod.endDate) {
    return "closed";
  }

  return "available";
}

function toListItem(
  exam: ExamRow,
  enrollmentPeriod: EnrollmentPeriod,
  eligible: boolean,
  submission: ExamSubmissionRow | undefined,
): ClassroomExamListItem {
  return {
    id: exam.id,
    title: exam.name,
    examKind: exam.exam_kind,
    durationMinutes: exam.exam_duration_minutes,
    questionCount: exam.question_count,
    passScore: exam.pass_score,
    status: resolveExamStatus(enrollmentPeriod, eligible, submission),
    score: submission?.score ?? null,
    totalScore: submission?.total_score ?? null,
    isPassed: submission?.is_passed ?? null,
  };
}

/**
 * 학습강의실 시험 목록 화면에서 사용합니다. 관리자 시험관리에서 공개(is_published)한
 * 시험만 반환하며, 진도율이 응시 기준 미만이면 각 시험의 status가 "locked"로 내려갑니다.
 */
export async function getClassroomCourseExams(
  memberId: string,
  courseCode: string,
): Promise<ClassroomExamList | null> {
  if (!memberId.trim() || !courseCode.trim()) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const [exams, progressRate, threshold] = await Promise.all([
    findPublishedExamsByCourse(supabase, access.course.id),
    getClassroomCourseProgressRate(access.enrollmentId, access.course.id),
    getCourseExamEligibilityThreshold(supabase, access.course.id),
  ]);

  const submissions = await findSubmissionsByEnrollment(
    supabase,
    access.enrollmentId,
    exams.map((exam) => exam.id),
  );

  const eligible = progressRate >= threshold;
  const enrollmentPeriod: EnrollmentPeriod = {
    startDate: access.enrollmentStartDate,
    endDate: access.enrollmentEndDate,
  };

  return {
    courseId: access.course.id,
    courseCode: access.course.code,
    courseTitle: access.course.name,
    progressRate,
    eligibilityThreshold: threshold,
    eligible,
    enrollmentStartDate: access.enrollmentStartDate,
    enrollmentEndDate: access.enrollmentEndDate,
    exams: exams.map((exam) =>
      toListItem(exam, enrollmentPeriod, eligible, submissions.get(exam.id)),
    ),
  };
}

function toChoices(row: ExamQuestionRow): ClassroomExamChoice[] {
  if (row.question_type === "ox") {
    return [
      { id: "1", text: "O" },
      { id: "2", text: "X" },
    ];
  }

  if (row.question_type === "short_answer") {
    return [];
  }

  const choices: ClassroomExamChoice[] = [];
  const raw: Array<[ClassroomExamChoice["id"], string | null]> = [
    ["1", row.choice1],
    ["2", row.choice2],
    ["3", row.choice3],
    ["4", row.choice4],
    ["5", row.choice5],
  ];

  for (const [id, text] of raw) {
    if (text) {
      choices.push({ id, text });
    }
  }

  return choices;
}

function toQuestion(row: ExamQuestionRow): ClassroomExamQuestion {
  return {
    id: row.id,
    order: row.sort_order,
    questionType: row.question_type,
    question: row.question,
    choices: toChoices(row),
    score: row.score,
  };
}

function toSubmittedResult(submission: ExamSubmissionRow): ClassroomExamSubmittedResult {
  return {
    score: submission.score,
    totalScore: submission.total_score,
    isPassed: submission.is_passed,
    submittedAt: submission.submitted_at,
  };
}

/**
 * 시험 응시(문제 조회) 화면에서 사용합니다. 정답(answer)은 절대 클라이언트로
 * 내려가지 않으며, 이미 제출한 시험이면 문제 대신 채점 결과를 반환합니다.
 */
export async function getClassroomExamTaking(
  memberId: string,
  courseCode: string,
  examId: string,
): Promise<GetClassroomExamTakingResult> {
  if (!memberId.trim() || !courseCode.trim() || !examId.trim()) {
    return { success: false, message: "잘못된 요청입니다." };
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return { success: false, message: "수강 중인 과정을 찾을 수 없습니다." };
  }

  const exam = await findPublishedExamById(supabase, access.course.id, examId);
  if (!exam) {
    return { success: false, message: "존재하지 않는 시험입니다." };
  }

  const [progressRate, threshold, submission] = await Promise.all([
    getClassroomCourseProgressRate(access.enrollmentId, access.course.id),
    getCourseExamEligibilityThreshold(supabase, access.course.id),
    findSubmission(supabase, access.enrollmentId, examId),
  ]);

  // 재시험이 허용된 응시 기록은 기존 채점 결과 대신 문제 응시 화면을 다시 보여줍니다.
  const activeSubmission = submission && !submission.retake_allowed ? submission : null;

  if (!activeSubmission && progressRate < threshold) {
    return {
      success: false,
      message: `진도율 ${threshold}% 이상부터 시험 응시가 가능합니다. (현재 진도율 ${progressRate}%)`,
    };
  }

  const questions = await findQuestionsForExam(supabase, examId);
  const totalScore = questions.reduce((sum, question) => sum + question.score, 0);

  return {
    success: true,
    exam: {
      examId: exam.id,
      courseCode: access.course.code,
      title: exam.name,
      examKind: exam.exam_kind,
      durationMinutes: exam.exam_duration_minutes,
      passScore: exam.pass_score,
      totalScore,
      questions: questions.map(toQuestion),
      submittedResult: activeSubmission ? toSubmittedResult(activeSubmission) : null,
    },
  };
}

/**
 * 객관식(multiple_choice) / OX 문항은 정답과 정확히 일치하면 즉시 채점합니다.
 * 주관식(short_answer)은 자동 채점 대상이 아니므로 0점 처리하고, 제출한 답안은
 * 그대로 저장해 추후 수동 채점 기능을 붙일 수 있도록 남겨둡니다.
 */
function gradeQuestion(question: ExamQuestionRow, submittedAnswer: string | undefined): number {
  if (!submittedAnswer) {
    return 0;
  }

  if (question.question_type === "multiple_choice") {
    return submittedAnswer === question.answer ? question.score : 0;
  }

  if (question.question_type === "ox") {
    return submittedAnswer.trim().toUpperCase() === question.answer.trim().toUpperCase()
      ? question.score
      : 0;
  }

  return 0;
}

/**
 * 시험 제출 처리입니다. 서버에서 다시 접근 권한/응시 자격/응시 기간을 검증한 뒤
 * 정답을 조회해 자동 채점하고, 결과를 `exam_submissions`에 upsert합니다.
 * 이미 제출한 시험을 다시 제출하면 최신 결과로 덮어씁니다(재응시 이력은 남기지 않음).
 */
export async function submitClassroomExam(
  memberId: string,
  courseCode: string,
  examId: string,
  answers: Record<string, string>,
): Promise<SubmitClassroomExamResult> {
  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return { success: false, message: "수강 중인 과정을 찾을 수 없습니다." };
  }

  const exam = await findPublishedExamById(supabase, access.course.id, examId);
  if (!exam) {
    return { success: false, message: "존재하지 않는 시험입니다." };
  }

  const [progressRate, threshold] = await Promise.all([
    getClassroomCourseProgressRate(access.enrollmentId, access.course.id),
    getCourseExamEligibilityThreshold(supabase, access.course.id),
  ]);

  if (progressRate < threshold) {
    return {
      success: false,
      message: `진도율 ${threshold}% 이상부터 시험 응시가 가능합니다. (현재 진도율 ${progressRate}%)`,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (today < access.enrollmentStartDate || today > access.enrollmentEndDate) {
    return { success: false, message: "현재는 수강기간이 아니어서 시험에 응시할 수 없습니다." };
  }

  const questions = await findQuestionsForExam(supabase, examId);
  if (questions.length === 0) {
    return { success: false, message: "등록된 문제가 없습니다." };
  }

  let score = 0;
  let correctCount = 0;
  const totalScore = questions.reduce((sum, question) => sum + question.score, 0);

  for (const question of questions) {
    const earned = gradeQuestion(question, answers[question.id]);
    score += earned;
    if (earned > 0) {
      correctCount += 1;
    }
  }

  const isPassed = exam.pass_score === null ? null : score >= exam.pass_score;

  const submission = await upsertSubmission(supabase, {
    enrollmentId: access.enrollmentId,
    examId: exam.id,
    score,
    totalScore,
    isPassed,
    answers,
  });

  return {
    success: true,
    result: toSubmittedResult(submission),
    correctCount,
    totalQuestions: questions.length,
  };
}

/**
 * 성적관리(/admin/grades)에서 사용합니다. 해당 enrollment가 응시한 모든 실제
 * 시험(exam_submissions)의 평균 백분율 점수를 반환합니다. 응시 이력이 없으면
 * null(미응시)을 반환합니다 — 호출부에서 필요 시 Mock 값으로 대체할 수 있습니다.
 */
export async function getEnrollmentExamPercent(enrollmentId: string): Promise<number | null> {
  if (!enrollmentId.trim()) {
    return null;
  }

  const supabase = await createClient();
  const submissions = await findSubmissionsForEnrollmentAcrossExams(supabase, enrollmentId);
  const graded = submissions.filter((submission) => submission.total_score > 0);

  if (graded.length === 0) {
    return null;
  }

  const average =
    graded.reduce((sum, submission) => sum + (submission.score / submission.total_score) * 100, 0) /
    graded.length;

  return Math.round(average);
}

export type AllowExamRetakeResult =
  | { success: true }
  | { success: false; message: string };

/**
 * 평가관리(/admin/exams/results)에서 사용합니다. 관리자가 학생의 특정 시험
 * 응시 기록을 재시험 가능 상태로 변경합니다.
 */
export async function allowExamRetake(submissionId: string): Promise<AllowExamRetakeResult> {
  if (!submissionId.trim()) {
    return { success: false, message: "잘못된 요청입니다." };
  }

  try {
    const supabase = await createClient();
    await allowSubmissionRetake(supabase, submissionId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "재시험 허용 처리에 실패했습니다.",
    };
  }
}
