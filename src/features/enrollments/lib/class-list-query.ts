import type { ClassListQuery } from "@/features/enrollments/types/class.types";
import {
  DEFAULT_PAGE_SIZE,
  parseListQuery,
} from "@/lib/shared/list-query";

export function createDefaultClassListQuery(): ClassListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    courseId: "",
    year: "",
  };
}

export function parseClassListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ClassListQuery {
  const base = parseListQuery(searchParams);

  return {
    page: base.page,
    pageSize: base.pageSize,
    courseId: parseStringParam(searchParams.courseId),
    year: parseStringParam(searchParams.year),
  };
}

export function buildClassListQueryString(
  params: Partial<ClassListQuery>,
  base?: ClassListQuery,
): string {
  const merged: ClassListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    courseId: params.courseId ?? base?.courseId ?? "",
    year: params.year ?? base?.year ?? "",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.courseId) query.set("courseId", merged.courseId);
  if (merged.year) query.set("year", merged.year);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildClassPageHref(page: number, query: ClassListQuery) {
  return `/admin/enrollments/classes${buildClassListQueryString({ page }, query)}`;
}

function parseStringParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}
