import {
  ENROLLMENT_SEARCH_FIELD_LABELS,
  type PendingApplicantSearchField,
} from "@/features/enrollments/constants";
import type { ConfirmedStudentListQuery } from "@/features/enrollments/types/confirmed-student.types";
import {
  DEFAULT_PAGE_SIZE,
  parseListQuery,
} from "@/lib/shared/list-query";

export function createDefaultConfirmedStudentListQuery(): ConfirmedStudentListQuery {
  return {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    search: "",
    field: "all",
    courseId: "",
    year: "",
    batch: "",
    status: "confirmed",
  };
}

export function parseConfirmedStudentListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ConfirmedStudentListQuery {
  const base = parseListQuery(searchParams);
  const defaults = createDefaultConfirmedStudentListQuery();

  return {
    page: base.page,
    pageSize: base.pageSize,
    search: base.search,
    field: parseSearchField(searchParams.field),
    courseId: parseStringParam(searchParams.courseId),
    year: parseStringParam(searchParams.year),
    batch: parseStringParam(searchParams.batch),
    status: parseStringParam(searchParams.status) || defaults.status,
  };
}

export function buildConfirmedStudentListQueryString(
  params: Partial<ConfirmedStudentListQuery>,
  base?: ConfirmedStudentListQuery,
): string {
  const merged: ConfirmedStudentListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    courseId: params.courseId ?? base?.courseId ?? "",
    year: params.year ?? base?.year ?? "",
    batch: params.batch ?? base?.batch ?? "",
    status: params.status ?? base?.status ?? "confirmed",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.courseId) query.set("courseId", merged.courseId);
  if (merged.year) query.set("year", merged.year);
  if (merged.batch) query.set("batch", merged.batch);
  if (merged.status && merged.status !== "confirmed") {
    query.set("status", merged.status);
  }

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildConfirmedStudentPageHref(
  page: number,
  query: ConfirmedStudentListQuery,
) {
  return `/admin/enrollments/confirmed${buildConfirmedStudentListQueryString({ page }, query)}`;
}

function parseStringParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function parseSearchField(
  value: string | string[] | undefined,
): PendingApplicantSearchField {
  const raw = Array.isArray(value) ? value[0] : value;

  if (
    raw &&
    Object.prototype.hasOwnProperty.call(ENROLLMENT_SEARCH_FIELD_LABELS, raw)
  ) {
    return raw as PendingApplicantSearchField;
  }

  return "all";
}
