import {
  ENROLLMENT_SEARCH_FIELD_LABELS,
  type EnrollmentSearchField,
} from "@/features/enrollments/constants";
import type {
  EnrollmentLearningStatusFilter,
  EnrollmentRecordListQuery,
} from "@/features/enrollments/services/enrollment-record-list.service";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

const LEARNING_STATUS_VALUES: EnrollmentLearningStatusFilter[] = [
  "all",
  "in_progress",
  "ended",
  "stopped",
];

export function parseEnrollmentRecordListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): EnrollmentRecordListQuery {
  const rawPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const rawPageSize = Array.isArray(searchParams.pageSize)
    ? searchParams.pageSize[0]
    : searchParams.pageSize;
  const rawSearch = Array.isArray(searchParams.search)
    ? searchParams.search[0]
    : searchParams.search;
  const rawField = Array.isArray(searchParams.field)
    ? searchParams.field[0]
    : searchParams.field;
  const rawLearningStatus = Array.isArray(searchParams.learningStatus)
    ? searchParams.learningStatus[0]
    : searchParams.learningStatus;

  return {
    page: Math.max(1, Number(rawPage) || 1),
    pageSize: Number(rawPageSize) || DEFAULT_PAGE_SIZE,
    search: (rawSearch ?? "").trim(),
    field: isEnrollmentSearchField(rawField) ? rawField : "all",
    learningStatus: isLearningStatusFilter(rawLearningStatus)
      ? rawLearningStatus
      : "all",
  };
}

export function buildEnrollmentRecordListQueryString(
  params: Partial<EnrollmentRecordListQuery>,
  base?: EnrollmentRecordListQuery,
): string {
  const merged: EnrollmentRecordListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    learningStatus: params.learningStatus ?? base?.learningStatus ?? "all",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.learningStatus !== "all") {
    query.set("learningStatus", merged.learningStatus);
  }

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildEnrollmentRecordPageHref(
  page: number,
  query: EnrollmentRecordListQuery,
) {
  return `/admin/enrollments${buildEnrollmentRecordListQueryString({ page }, query)}`;
}

function isEnrollmentSearchField(
  value: string | undefined,
): value is EnrollmentSearchField {
  return (
    !!value &&
    Object.prototype.hasOwnProperty.call(ENROLLMENT_SEARCH_FIELD_LABELS, value)
  );
}

function isLearningStatusFilter(
  value: string | undefined,
): value is EnrollmentLearningStatusFilter {
  return (
    !!value &&
    (LEARNING_STATUS_VALUES as string[]).includes(value)
  );
}
