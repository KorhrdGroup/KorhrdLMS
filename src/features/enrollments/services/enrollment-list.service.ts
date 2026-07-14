import {
  COURSE_OPTION_SELECT,
  ENROLLMENT_LIST_SELECT,
  MEMBER_OPTION_SELECT,
  type EnrollmentSearchField,
} from "@/features/enrollments/constants";
import type {
  EnrollmentCourseOption,
  EnrollmentListItem,
  EnrollmentMemberOption,
  EnrollmentRegistrationOptions,
} from "@/features/enrollments/types/enrollment.types";
import type { ListQuery, PaginatedResult } from "@/lib/shared/list-query";
import {
  getPaginationRange,
  getTotalPages,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

export type EnrollmentListQuery = Omit<ListQuery, "field"> & {
  field: EnrollmentSearchField;
};

export async function getEnrollmentList(
  query: EnrollmentListQuery,
): Promise<PaginatedResult<EnrollmentListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("enrollments")
    .select(ENROLLMENT_LIST_SELECT, { count: "exact" })
    .neq("status", "deleted")
    .is("deleted_at", null)
    .is("members.deleted_at", null)
    .order("created_at", { ascending: false });

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

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as EnrollmentListItem[],
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getEnrollmentRegistrationOptions(): Promise<EnrollmentRegistrationOptions> {
  const supabase = await createClient();

  const [membersResult, coursesResult] = await Promise.all([
    supabase
      .from("members")
      .select(MEMBER_OPTION_SELECT)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("courses")
      .select(COURSE_OPTION_SELECT)
      .order("name", { ascending: true }),
  ]);

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  return {
    members: (membersResult.data ?? []).map((member) => ({
      id: member.id,
      name: member.name,
      loginId: member.login_id,
    })),
    courses: (coursesResult.data ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    })),
  };
}
