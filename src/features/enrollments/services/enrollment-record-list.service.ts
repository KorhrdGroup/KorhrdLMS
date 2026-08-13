import { getEnrollmentExamPercent } from "@/features/classroom-exams/services/classroom-exam.service";
import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import {
  ENROLLMENT_LIST_SELECT,
  type EnrollmentSearchField,
} from "@/features/enrollments/constants";
import {
  deriveLearningStatus,
  getMockInstructorName,
} from "@/features/enrollments/lib/enrollment-mock-signals";
import type {
  EnrollmentListItem,
  EnrollmentLearningStatus,
  EnrollmentRecordListItem,
} from "@/features/enrollments/types/enrollment.types";
import {
  calculateGrade,
  deriveGradeCompletion,
} from "@/features/grades/lib/grade-calculator";
import { getAttendanceOverride } from "@/features/grades/repositories/grade.repository";
import { getTotalPages } from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

export type EnrollmentLearningStatusFilter = EnrollmentLearningStatus | "all";

export type EnrollmentRecordListQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: EnrollmentSearchField;
  learningStatus: EnrollmentLearningStatusFilter;
};

export type EnrollmentRecordListResult = {
  data: EnrollmentRecordListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * 진도율·시험점수·수료여부를 성적관리(grade-list.service)와 같은 실제 데이터로
 * 계산합니다: 진도율은 lecture_progress 기준(관리자 보정값 우선), 시험점수는
 * exam_submissions 응시 기록, 수료는 출석 40% + 시험 60% 가중 합산 60점 이상.
 * 과제 기능은 사용하지 않으므로 과제 상태는 항상 "-"입니다.
 */
async function enrich(row: EnrollmentListItem): Promise<EnrollmentRecordListItem> {
  const learningStatus = deriveLearningStatus(row.status, row.end_date);
  const progressRate =
    getAttendanceOverride(row.id) ??
    (await getClassroomCourseProgressRate(row.id, row.course.id));
  const examPercent = await getEnrollmentExamPercent(row.id);
  const { isPassed } = calculateGrade({ attendanceRate: progressRate, examPercent });

  return {
    ...row,
    instructorName: getMockInstructorName(row.course.id),
    learningStatus,
    progressRate,
    examPercent,
    examStatus: examPercent === null ? "미응시" : `${examPercent}점`,
    assignmentStatus: "-",
    isCompleted: deriveGradeCompletion(learningStatus, isPassed),
  };
}

export async function getEnrollmentRecordsForMember(
  memberId: string,
): Promise<EnrollmentRecordListItem[]> {
  if (!memberId.trim()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLMENT_LIST_SELECT)
    .eq("member_id", memberId)
    .in("status", ["confirmed", "canceled"])
    .is("deleted_at", null)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all(((data ?? []) as EnrollmentListItem[]).map(enrich));
}

export async function getEnrollmentRecordsForCourse(
  courseId: string,
): Promise<EnrollmentRecordListItem[]> {
  if (!courseId.trim()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLMENT_LIST_SELECT)
    .eq("course_id", courseId)
    .in("status", ["confirmed", "canceled"])
    .is("deleted_at", null)
    .is("members.deleted_at", null)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Promise.all(((data ?? []) as EnrollmentListItem[]).map(enrich));
}

export async function getEnrollmentRecordList(
  query: EnrollmentRecordListQuery,
): Promise<EnrollmentRecordListResult> {
  const supabase = await createClient();

  let builder = supabase
    .from("enrollments")
    .select(ENROLLMENT_LIST_SELECT)
    .in("status", ["confirmed", "canceled"])
    .is("deleted_at", null)
    .is("members.deleted_at", null)
    .order("start_date", { ascending: false });

  if (query.search) {
    const keyword = `%${query.search}%`;

    switch (query.field) {
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

  const rows = (data ?? []) as EnrollmentListItem[];

  // 학습상태는 status/end_date만으로 파생되므로 페이지네이션 전에 걸러내고,
  // 진도·시험 실데이터 조회(행당 2쿼리)는 현재 페이지 분량만 수행합니다.
  const filtered =
    query.learningStatus === "all"
      ? rows
      : rows.filter(
          (row) => deriveLearningStatus(row.status, row.end_date) === query.learningStatus,
        );

  const total = filtered.length;
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize;
  const pageRows = filtered.slice(from, to);

  return {
    data: await Promise.all(pageRows.map(enrich)),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
