import {
  ENROLLMENT_SEARCH_FIELD_LABELS,
  type EnrollmentSearchField,
} from "@/features/enrollments/constants";
import type { EnrollmentListQuery } from "@/features/enrollments/services/enrollment-list.service";
import {
  DEFAULT_PAGE_SIZE,
  parseListQuery,
} from "@/lib/shared/list-query";

export function parseEnrollmentListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): EnrollmentListQuery {
  const base = parseListQuery(searchParams);
  const rawField = Array.isArray(searchParams.field)
    ? searchParams.field[0]
    : searchParams.field;

  const field = isEnrollmentSearchField(rawField) ? rawField : "all";

  return {
    ...base,
    field,
  };
}

export function buildEnrollmentListQueryString(
  params: Partial<EnrollmentListQuery>,
  base?: EnrollmentListQuery,
): string {
  const merged: EnrollmentListQuery = {
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

export function buildEnrollmentPageHref(page: number, query: EnrollmentListQuery) {
  return `/admin/enrollments${buildEnrollmentListQueryString({ page }, query)}`;
}

function isEnrollmentSearchField(
  value: string | undefined,
): value is EnrollmentSearchField {
  return (
    !!value &&
    Object.prototype.hasOwnProperty.call(ENROLLMENT_SEARCH_FIELD_LABELS, value)
  );
}
