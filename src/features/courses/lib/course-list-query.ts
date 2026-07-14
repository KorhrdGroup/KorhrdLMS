import {
  COURSE_SEARCH_FIELD_LABELS,
  type CourseSearchField,
} from "@/features/courses/constants";
import type { CourseListQuery } from "@/features/courses/services/course-list.service";
import {
  DEFAULT_PAGE_SIZE,
  parseListQuery,
} from "@/lib/shared/list-query";

export function parseCourseListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): CourseListQuery {
  const base = parseListQuery(searchParams);
  const rawField = Array.isArray(searchParams.field)
    ? searchParams.field[0]
    : searchParams.field;

  const field = isCourseSearchField(rawField) ? rawField : "all";

  return {
    ...base,
    field,
  };
}

export function buildCourseListQueryString(
  params: Partial<CourseListQuery>,
  base?: CourseListQuery,
): string {
  const merged: CourseListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    showDeleted: params.showDeleted ?? base?.showDeleted ?? false,
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.showDeleted) query.set("showDeleted", "1");

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildCoursePageHref(page: number, query: CourseListQuery) {
  return `/admin/courses${buildCourseListQueryString({ page }, query)}`;
}

function isCourseSearchField(value: string | undefined): value is CourseSearchField {
  return (
    !!value &&
    Object.prototype.hasOwnProperty.call(COURSE_SEARCH_FIELD_LABELS, value)
  );
}
