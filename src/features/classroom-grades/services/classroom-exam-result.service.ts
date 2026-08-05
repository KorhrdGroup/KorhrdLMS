import { getClassroomCourseGrade } from "@/features/classroom-grades/services/classroom-grade.service";
import {
  getClassroomCourseLectures,
  resolveClassroomAccess,
} from "@/features/classroom-lectures/services/classroom-lecture.service";
import {
  ATTENDANCE_WEIGHT_PERCENT,
  EXAM_WEIGHT_PERCENT,
  PASS_SCORE_THRESHOLD,
} from "@/features/grades/lib/grade-calculator";
import { createClient } from "@/lib/supabase/server";
import type { ClassroomGradeData } from "@/features/classroom-grades/types/classroom-grade.types";

/**
 * 학생 "시험 성적 확인" 화면(`/exam/[course]/result`)에 필요한 값 묶음입니다.
 * 프로토타입 원본: korhrd-site/exam-result.html
 *
 * 점수·등급·합격여부는 관리자 성적관리와 같은 계산 규칙을 쓰는
 * `getClassroomCourseGrade`를 그대로 재사용하고, 이 서비스는 화면에만 필요한
 * 항목(촬영교수, 강의 수 기준 진도, 권장진도)을 덧붙입니다.
 */
export type ClassroomExamResultProgress = {
  /** 실제 완료한 차시 수 */
  completedLectures: number;
  /** 게시된 전체 차시 수 */
  totalLectures: number;
  /** 진도율(%) — 성적 계산에 쓰인 값과 같습니다 */
  percent: number;
  /** 수강기간 경과분으로 계산한 권장 진도(%) */
  recommendedPercent: number;
  /** 권장 진도에 해당하는 차시 수 */
  recommendedLectures: number;
};

export type ClassroomExamResultData = {
  courseCode: string;
  courseTitle: string;
  professorName: string;
  memberName: string;
  grade: ClassroomGradeData;
  progress: ClassroomExamResultProgress;
  /** 학습평가 표의 가중치(%) — 계산 규칙과 어긋나지 않도록 상수를 그대로 씁니다 */
  weights: { attendance: number; exam: number; passScore: number };
};

/**
 * 수강기간 중 오늘까지 지난 비율을 권장 진도로 봅니다.
 * (시작 전이면 0%, 종료 후면 100%)
 */
function calcRecommendedPercent(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  const ratio = ((today - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
}

/** 과정의 촬영교수명. courses.professor_name이 비어 있으면 빈 문자열입니다. */
async function findCourseProfessorName(courseId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("professor_name")
    .eq("id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return ((data as { professor_name: string | null } | null)?.professor_name ?? "").trim();
}

export async function getClassroomExamResult(
  memberId: string,
  memberName: string,
  courseCode: string,
): Promise<ClassroomExamResultData | null> {
  if (!memberId.trim() || !courseCode.trim()) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const [grade, lectures, professorName] = await Promise.all([
    getClassroomCourseGrade(memberId, courseCode),
    getClassroomCourseLectures(memberId, courseCode),
    findCourseProfessorName(access.course.id),
  ]);

  if (!grade) {
    return null;
  }

  const totalLectures = lectures?.sessions.length ?? 0;
  const completedLectures =
    lectures?.sessions.filter((session) => session.status === "completed").length ?? 0;
  const recommendedPercent = calcRecommendedPercent(
    access.enrollmentStartDate,
    access.enrollmentEndDate,
  );

  return {
    courseCode: access.course.code,
    courseTitle: access.course.name,
    professorName,
    memberName,
    grade,
    progress: {
      completedLectures,
      totalLectures,
      percent: grade.summary.progressRate,
      recommendedPercent,
      recommendedLectures: Math.round((totalLectures * recommendedPercent) / 100),
    },
    weights: {
      attendance: ATTENDANCE_WEIGHT_PERCENT,
      exam: EXAM_WEIGHT_PERCENT,
      passScore: PASS_SCORE_THRESHOLD,
    },
  };
}
