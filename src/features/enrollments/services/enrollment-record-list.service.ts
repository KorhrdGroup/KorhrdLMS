import {
  ENROLLMENT_LIST_SELECT,
  type EnrollmentSearchField,
} from "@/features/enrollments/constants";
import {
  deriveLearningStatus,
  getMockAssignmentStatus,
  getMockCompletion,
  getMockExamStatus,
  getMockInstructorName,
  getMockProgressRate,
} from "@/features/enrollments/lib/enrollment-mock-signals";
import type {
  EnrollmentListItem,
  EnrollmentLearningStatus,
  EnrollmentRecordListItem,
} from "@/features/enrollments/types/enrollment.types";
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

function enrich(row: EnrollmentListItem): EnrollmentRecordListItem {
  const learningStatus = deriveLearningStatus(row.status, row.end_date);
  const progressRate = getMockProgressRate(row.id, learningStatus);
  const examStatus = getMockExamStatus(row.id, learningStatus);
  const assignmentStatus = getMockAssignmentStatus(row.id, learningStatus);

  return {
    ...row,
    instructorName: getMockInstructorName(row.course.id),
    learningStatus,
    progressRate,
    examStatus,
    assignmentStatus,
    isCompleted: getMockCompletion(learningStatus, progressRate, examStatus),
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

  return ((data ?? []) as EnrollmentListItem[]).map(enrich);
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

  return ((data ?? []) as EnrollmentListItem[]).map(enrich);
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

  const enriched = ((data ?? []) as EnrollmentListItem[]).map(enrich);

  const filtered =
    query.learningStatus === "all"
      ? enriched
      : enriched.filter((item) => item.learningStatus === query.learningStatus);

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
