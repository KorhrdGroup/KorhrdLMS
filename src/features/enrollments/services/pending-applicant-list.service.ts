import {
  COURSE_FILTER_SELECT,
  PENDING_APPLICANT_LIST_SELECT,
} from "../constants";
import type {
  PendingApplicantFilterOptions,
  PendingApplicantListItem,
  PendingApplicantListQuery,
} from "../types/pending-applicant.types";
import { createClient } from "@/lib/supabase/server";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";

export async function getPendingApplicantList(
  query: PendingApplicantListQuery,
): Promise<PaginatedResult<PendingApplicantListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("enrollments")
    .select(PENDING_APPLICANT_LIST_SELECT, { count: "exact" })
    .eq("status", "pending")
    .is("deleted_at", null)
    .is("members.deleted_at", null)
    .order("application_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (query.courseId) {
    builder = builder.eq("course_id", query.courseId);
  }

  if (query.year) {
    const year = Number.parseInt(query.year, 10);
    if (!Number.isNaN(year)) {
      builder = builder.eq("year", year);
    }
  }

  if (query.batch) {
    builder = builder.eq("batch", query.batch);
  }

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
      case "batch":
        builder = builder.ilike("batch", keyword);
        break;
      case "year": {
        const year = Number.parseInt(query.search, 10);
        if (!Number.isNaN(year)) {
          builder = builder.eq("year", year);
        } else {
          builder = builder.ilike("batch", keyword);
        }
        break;
      }
      default:
        builder = builder.or(
          `member.name.ilike.${keyword},member.login_id.ilike.${keyword},course.name.ilike.${keyword},batch.ilike.${keyword}`,
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
    data: (data ?? []) as PendingApplicantListItem[],
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getPendingApplicantFilterOptions(): Promise<PendingApplicantFilterOptions> {
  const supabase = await createClient();

  const [coursesResult, enrollmentsResult] = await Promise.all([
    supabase
      .from("courses")
      .select(COURSE_FILTER_SELECT)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("enrollments")
      .select("year, batch")
      .eq("status", "pending")
      .is("deleted_at", null),
  ]);

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  if (enrollmentsResult.error) {
    throw new Error(enrollmentsResult.error.message);
  }

  const years = new Set<number>();
  const batches = new Set<string>();

  for (const row of enrollmentsResult.data ?? []) {
    if (row.year != null) {
      years.add(row.year);
    }
    if (row.batch?.trim()) {
      batches.add(row.batch.trim());
    }
  }

  return {
    courses: (coursesResult.data ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    })),
    years: Array.from(years).sort((a, b) => b - a),
    batches: Array.from(batches).sort((a, b) => a.localeCompare(b, "ko")),
  };
}
