import { getEnrollmentExamPercent } from "@/features/classroom-exams/services/classroom-exam.service";
import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import {
  deriveLearningStatus,
  getMockInstructorName,
} from "@/features/enrollments/lib/enrollment-mock-signals";
import { ENROLLMENT_MEMBER_COURSE_SELECT } from "@/features/grades/constants";
import { calculateGrade, deriveGradeCompletion } from "@/features/grades/lib/grade-calculator";
import type {
  GradeAttendanceUpdateInput,
  GradeAttendanceUpdateResult,
  GradeDetail,
  GradeExamUpdateInput,
  GradeExamUpdateResult,
  GetGradeDetailResult,
} from "@/features/grades/types/grade.types";
import type { EnrollmentStatus } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";

type EnrollmentRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  member: { id: string; name: string; login_id: string };
  course: { id: string; name: string };
};

async function fetchEnrollmentRow(enrollmentId: string): Promise<EnrollmentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLMENT_MEMBER_COURSE_SELECT)
    .eq("id", enrollmentId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as EnrollmentRow) ?? null;
}

async function buildDetail(row: EnrollmentRow): Promise<GradeDetail> {
  const learningStatus = deriveLearningStatus(row.status, row.end_date);
  const attendanceRate = await getClassroomCourseProgressRate(row.id, row.course.id);
  const examPercent = await getEnrollmentExamPercent(row.id);
  // 민간자격증 LMS는 과제 기능을 사용하지 않으므로 과제 점수는 항상 null입니다.
  const assignmentScore: number | null = null;

  const result = calculateGrade({ attendanceRate, examPercent });

  return {
    ...result,
    enrollmentId: row.id,
    member: {
      id: row.member.id,
      name: row.member.name,
      loginId: row.member.login_id,
    },
    course: { id: row.course.id, name: row.course.name },
    instructorName: getMockInstructorName(row.course.id),
    learningStatus,
    attendanceRate,
    examPercent,
    assignmentScore,
    isCompleted: deriveGradeCompletion(learningStatus, result.isPassed),
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export async function getGradeDetail(enrollmentId: string): Promise<GetGradeDetailResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "성적 정보를 찾을 수 없습니다." };
  }

  const row = await fetchEnrollmentRow(enrollmentId);

  if (!row) {
    return { success: false, message: "성적 정보를 찾을 수 없습니다." };
  }

  return { success: true, detail: await buildDetail(row) };
}

export function validateGradeAttendanceUpdateInput(
  input: GradeAttendanceUpdateInput,
): GradeAttendanceUpdateResult | null {
  if (
    Number.isNaN(input.attendanceRate) ||
    input.attendanceRate < 0 ||
    input.attendanceRate > 100
  ) {
    return {
      success: false,
      message: "출석점수는 0~100 사이의 숫자로 입력해주세요.",
      field: "attendanceRate",
    };
  }

  return null;
}

/**
 * 진도율(출석점수)을 실제 진도 기록(lecture_progress)에 반영합니다.
 * 앞 차시부터 입력 비율만큼 "수강 완료"로 만들고 나머지 기록은 지웁니다 —
 * 그래서 학생 나의 강의실·성적 화면에도 같은 진도율이 그대로 보입니다.
 */
export async function updateGradeAttendance(
  enrollmentId: string,
  input: GradeAttendanceUpdateInput,
): Promise<GradeAttendanceUpdateResult> {
  const validationError = validateGradeAttendanceUpdateInput(input);
  if (validationError) {
    return validationError;
  }

  const row = await fetchEnrollmentRow(enrollmentId);
  if (!row) {
    return { success: false, message: "성적 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data: sessionRows, error: sessionError } = await supabase
    .from("lecture_sessions")
    .select("id, session_order, lecture:course_lectures!inner ( course_id )")
    .eq("lecture.course_id", row.course.id)
    .is("deleted_at", null)
    .order("session_order", { ascending: true });

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const sessionIds = ((sessionRows ?? []) as unknown as { id: string }[]).map((s) => s.id);
  if (sessionIds.length === 0) {
    return { success: false, message: "이 과정에는 등록된 차시가 없어 진도율을 조정할 수 없습니다." };
  }

  const targetDone = Math.round((input.attendanceRate / 100) * sessionIds.length);
  const doneIds = sessionIds.slice(0, targetDone);
  const restIds = sessionIds.slice(targetDone);

  if (doneIds.length > 0) {
    const { error } = await supabase.from("lecture_progress").upsert(
      doneIds.map((sessionId) => ({
        enrollment_id: enrollmentId,
        lecture_session_id: sessionId,
        video_progress_percent: 100,
        attendance_status: "completed" as const,
        completed_at: new Date().toISOString(),
      })),
      { onConflict: "enrollment_id,lecture_session_id" },
    );
    if (error) {
      throw new Error(error.message);
    }
  }

  if (restIds.length > 0) {
    const { error } = await supabase
      .from("lecture_progress")
      .delete()
      .eq("enrollment_id", enrollmentId)
      .in("lecture_session_id", restIds);
    if (error) {
      throw new Error(error.message);
    }
  }

  return { success: true, detail: await buildDetail(row) };
}

/**
 * 시험점수를 수료시험 제출 기록(exam_submissions)에 직접 반영합니다.
 * 제출 기록이 없으면 새로 만들고, 있으면 점수를 덮어씁니다.
 * 합격 여부는 시험의 합격 기준 점수(pass_score, 기본 60점)로 자동 판정됩니다.
 */
export async function updateGradeExam(
  enrollmentId: string,
  input: GradeExamUpdateInput,
): Promise<GradeExamUpdateResult> {
  if (Number.isNaN(input.examPercent) || input.examPercent < 0 || input.examPercent > 100) {
    return {
      success: false,
      message: "시험점수는 0~100 사이의 숫자로 입력해주세요.",
      field: "examPercent",
    };
  }

  const row = await fetchEnrollmentRow(enrollmentId);
  if (!row) {
    return { success: false, message: "성적 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("id, pass_score")
    .eq("course_id", row.course.id)
    .eq("exam_kind", "final_exam")
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  if (examError) {
    throw new Error(examError.message);
  }
  if (!exam) {
    return { success: false, message: "이 과정에는 수료시험이 등록돼 있지 않습니다." };
  }

  const score = Math.round(input.examPercent);
  const isPassed = score >= (exam.pass_score ?? 60);

  const { data: existing } = await supabase
    .from("exam_submissions")
    .select("id")
    .eq("enrollment_id", enrollmentId)
    .eq("exam_id", exam.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("exam_submissions")
      .update({ score, total_score: 100, is_passed: isPassed, submitted_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("exam_submissions").insert({
      enrollment_id: enrollmentId,
      exam_id: exam.id,
      score,
      total_score: 100,
      is_passed: isPassed,
      answers: {},
      submitted_at: new Date().toISOString(),
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  return { success: true, detail: await buildDetail(row) };
}
