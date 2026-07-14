import { getEnrollmentExamPercent } from "@/features/classroom-exams/services/classroom-exam.service";
import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import {
  deriveLearningStatus,
  getMockInstructorName,
} from "@/features/enrollments/lib/enrollment-mock-signals";
import { ENROLLMENT_MEMBER_COURSE_SELECT } from "@/features/grades/constants";
import { calculateGrade, deriveGradeCompletion } from "@/features/grades/lib/grade-calculator";
import {
  getAttendanceOverride,
  setAttendanceOverride,
} from "@/features/grades/repositories/grade.repository";
import type {
  GradeAttendanceUpdateInput,
  GradeAttendanceUpdateResult,
  GradeDetail,
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
  const attendanceRate =
    getAttendanceOverride(row.id) ??
    (await getClassroomCourseProgressRate(row.id, row.course.id));
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

  setAttendanceOverride(enrollmentId, Math.round(input.attendanceRate));

  return { success: true, detail: await buildDetail(row) };
}
