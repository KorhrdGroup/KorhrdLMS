import { getEnrollmentExamPercent } from "@/features/classroom-exams/services/classroom-exam.service";
import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import { ENROLLMENT_MEMBER_COURSE_SELECT, type GradeSearchField } from "@/features/grades/constants";
import {
  deriveLearningStatus,
  getMockInstructorName,
} from "@/features/enrollments/lib/enrollment-mock-signals";
import { getAttendanceOverride } from "@/features/grades/repositories/grade.repository";
import { calculateGrade, deriveGradeCompletion } from "@/features/grades/lib/grade-calculator";
import type {
  GradeFilterOption,
  GradeListItem,
  PassFilterOption,
} from "@/features/grades/types/grade.types";
import type { EnrollmentStatus } from "@/types/database.types";
import { getTotalPages } from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

export type GradeListQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: GradeSearchField;
  grade: GradeFilterOption;
  pass: PassFilterOption;
};

export type GradeListResult = {
  data: GradeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type EnrollmentRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  member: { id: string; name: string; login_id: string };
  course: { id: string; name: string };
};

async function enrich(row: EnrollmentRow): Promise<GradeListItem> {
  const learningStatus = deriveLearningStatus(row.status, row.end_date);
  // 진도율(lecture_progress 기준 실제 완료 차시 비율)을 출석 점수로 사용합니다.
  // 관리자가 수동 보정값(setAttendanceOverride)을 입력한 경우 그 값을 우선합니다.
  const attendanceRate =
    getAttendanceOverride(row.id) ??
    (await getClassroomCourseProgressRate(row.id, row.course.id));
  // 실제 온라인 시험(exam_submissions) 응시 기록 기준 평균 백분율 점수. 미응시면 null(미응시).
  const examPercent = await getEnrollmentExamPercent(row.id);
  // 민간자격증 LMS는 과제 기능을 사용하지 않으므로 과제 점수는 항상 null이며
  // 합격 판정에도 반영하지 않습니다.
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
  };
}

async function fetchConfirmedEnrollments(search: string, field: GradeSearchField) {
  const supabase = await createClient();

  let builder = supabase
    .from("enrollments")
    .select(ENROLLMENT_MEMBER_COURSE_SELECT)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .is("members.deleted_at", null)
    .order("start_date", { ascending: false });

  if (search) {
    const keyword = `%${search}%`;

    switch (field) {
      case "member_name":
        builder = builder.ilike("member.name", keyword);
        break;
      case "login_id":
        builder = builder.ilike("member.login_id", keyword);
        break;
      case "course_name":
        builder = builder.ilike("course.name", keyword);
        break;
      default:
        builder = builder.or(
          `member.name.ilike.${keyword},member.login_id.ilike.${keyword},course.name.ilike.${keyword}`,
        );
        break;
    }
  }

  const { data, error } = await builder;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as EnrollmentRow[];
}

export async function getGradeList(query: GradeListQuery): Promise<GradeListResult> {
  const rows = await fetchConfirmedEnrollments(query.search, query.field);
  const enriched = await Promise.all(rows.map(enrich));

  const filtered = enriched.filter((item) => {
    if (query.grade !== "all" && item.grade !== query.grade) {
      return false;
    }

    if (query.pass === "passed" && !item.isPassed) {
      return false;
    }

    if (query.pass === "failed" && item.isPassed) {
      return false;
    }

    return true;
  });

  const total = filtered.length;
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize;

  return {
    data: filtered.slice(from, to),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getGradeRecordsForMember(memberId: string): Promise<GradeListItem[]> {
  if (!memberId.trim()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLMENT_MEMBER_COURSE_SELECT)
    .eq("member_id", memberId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all(((data ?? []) as unknown as EnrollmentRow[]).map(enrich));
}
