import { CLASS_LIST_SELECT, COURSE_FILTER_SELECT } from "@/features/enrollments/constants";
import type {
  ClassFilterOptions,
  ClassListQuery,
} from "@/features/enrollments/types/class.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

import type { ClassListItem } from "../types/class.types";

type ClassListRow = {
  id: string;
  year: number;
  name: string;
  manager_name: string | null;
  application_start: string | null;
  application_end: string | null;
  enrollment_start: string;
  enrollment_end: string;
  created_at: string;
  course: {
    id: string;
    name: string;
    code: string;
    deleted_at: string | null;
  };
};

function mapClassListItem(row: ClassListRow): ClassListItem {
  return {
    id: row.id,
    year: row.year,
    courseName: row.course.name,
    batchName: row.name,
    managerName: row.manager_name,
    applicationPeriodStart: row.application_start,
    applicationPeriodEnd: row.application_end,
    enrollmentPeriodStart: row.enrollment_start,
    enrollmentPeriodEnd: row.enrollment_end,
    createdAt: row.created_at,
  };
}

export async function getClassList(
  query: ClassListQuery,
): Promise<PaginatedResult<ClassListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("classes")
    .select(CLASS_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .is("course.deleted_at", null)
    .order("year", { ascending: false })
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

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    data: ((data ?? []) as ClassListRow[]).map(mapClassListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getClassFilterOptions(): Promise<ClassFilterOptions> {
  const supabase = await createClient();

  const [coursesResult, classesResult] = await Promise.all([
    supabase
      .from("courses")
      .select(COURSE_FILTER_SELECT)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("classes")
      .select("year")
      .is("deleted_at", null),
  ]);

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  if (classesResult.error) {
    throw new Error(classesResult.error.message);
  }

  const years = new Set<number>();

  for (const row of classesResult.data ?? []) {
    if (row.year != null) {
      years.add(row.year);
    }
  }

  return {
    courses: (coursesResult.data ?? []).map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
    })),
    years: Array.from(years).sort((a, b) => b - a),
  };
}

export type { ClassListQuery };
