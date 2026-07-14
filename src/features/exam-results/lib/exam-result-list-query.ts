import {
  EXAM_RESULT_PASS_FILTER_LABELS,
  EXAM_RESULT_SEARCH_FIELD_LABELS,
} from "@/features/exam-results/constants";
import type {
  ExamResultListQuery,
  ExamResultPassFilter,
  ExamResultSearchField,
} from "@/features/exam-results/types/exam-result.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/shared/list-query";

export function parseExamResultListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): ExamResultListQuery {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const rawPageSize = Array.isArray(searchParams.pageSize)
    ? searchParams.pageSize[0]
    : searchParams.pageSize;
  const rawSearch = Array.isArray(searchParams.search)
    ? searchParams.search[0]
    : searchParams.search;
  const rawField = Array.isArray(searchParams.field) ? searchParams.field[0] : searchParams.field;
  const rawPass = Array.isArray(searchParams.pass) ? searchParams.pass[0] : searchParams.pass;

  return {
    page: Math.max(1, Number(rawPage) || 1),
    pageSize: Number(rawPageSize) || DEFAULT_PAGE_SIZE,
    search: (rawSearch ?? "").trim(),
    field: isSearchField(rawField) ? rawField : "all",
    pass: isPassFilter(rawPass) ? rawPass : "all",
  };
}

export function buildExamResultListQueryString(
  params: Partial<ExamResultListQuery>,
  base?: ExamResultListQuery,
): string {
  const merged: ExamResultListQuery = {
    page: params.page ?? base?.page ?? 1,
    pageSize: params.pageSize ?? base?.pageSize ?? DEFAULT_PAGE_SIZE,
    search: params.search ?? base?.search ?? "",
    field: params.field ?? base?.field ?? "all",
    pass: params.pass ?? base?.pass ?? "all",
  };

  const query = new URLSearchParams();

  if (merged.page > 1) query.set("page", String(merged.page));
  if (merged.pageSize !== DEFAULT_PAGE_SIZE) query.set("pageSize", String(merged.pageSize));
  if (merged.search) query.set("search", merged.search);
  if (merged.field !== "all") query.set("field", merged.field);
  if (merged.pass !== "all") query.set("pass", merged.pass);

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function buildExamResultPageHref(page: number, query: ExamResultListQuery) {
  return `/admin/exam-results${buildExamResultListQueryString({ page }, query)}`;
}

function isSearchField(value: string | undefined): value is ExamResultSearchField {
  return !!value && Object.prototype.hasOwnProperty.call(EXAM_RESULT_SEARCH_FIELD_LABELS, value);
}

function isPassFilter(value: string | undefined): value is ExamResultPassFilter {
  return !!value && Object.prototype.hasOwnProperty.call(EXAM_RESULT_PASS_FILTER_LABELS, value);
}
